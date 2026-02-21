# GA4の gtag.js が動かない？ -- `Arguments` vs `Array` の落とし穴

## 概要

Google Analytics 4（GA4）を Cookie 同意（consent-gated）方式で動的ロードしたところ、`gtag.js` のスクリプト自体は正常にロードされるのに、計測リクエスト（`/g/collect`）が一切送信されない問題に遭遇した。

原因は `window.gtag` 関数の定義方法にあった。TypeScript / モダン JavaScript で一般的なアロー関数と rest parameters を使った実装では、`dataLayer.push()` に **Array** が渡される。しかし gtag.js の内部処理は **Arguments オブジェクト** のみをコマンドとして認識する仕様になっており、Array を push しても無視される。

この記事では、問題の発見からデバッグ、修正、そして gtag.js の内部メカニズムまでを詳しく解説する。

---

## 背景: consent-gated な動的ロード方式

### なぜ公式スニペットをそのまま使えなかったか

GA4 の公式セットアップでは、HTML に直接 `<script>` タグを埋め込む形式が推奨されている:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

しかし、プライバシー配慮のため Cookie 同意バナーを実装しているサイトでは、ユーザーが同意するまで GA4 のスクリプト自体をロードしないという設計が求められる場合がある。今回のプロジェクトでも、以下の要件があった:

- **同意なしでは `gtag.js` を一切ロードしない**
- 同意後に JavaScript から動的にスクリプトを挿入する
- 後から同意が変更された場合（`cookie-consent-change` イベント）にも対応する

この要件を満たすため、公式スニペットの処理を TypeScript モジュールとして書き直す必要があった。

> **関連PR**: [#145 Add: Cloudflare Web Analytics・GA4アクセス解析の導入](https://github.com/dOwOd/exvs2-cost-calculator/pull/145) -- consent-gated な動的ロード方式の初期実装

### 実際の設計

```typescript
// analytics.ts（簡略化）

/** gtag.js スクリプトを動的にロードする */
const loadGtagScript = (): void => {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

/** gtag を初期化する */
const setupGtag = (): void => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = /* ここが問題の箇所 */;
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
};

/** consent 状態を確認して初期化 + 変更監視 */
export const initAnalytics = (): void => {
  if (isAnalyticsCookieAllowed()) {
    loadGtagScript();
    setupGtag();
  }
  // consent 変更イベントも監視
  window.addEventListener('cookie-consent-change', () => {
    if (!initialized && isAnalyticsCookieAllowed()) {
      loadGtagScript();
      setupGtag();
      initialized = true;
    }
  });
};
```

この設計自体には問題がない。問題は `setupGtag()` 内の `window.gtag` の定義にあった。

---

## 症状

### 確認できたこと

1. Cookie 同意バナーで「許可」を選択
2. Network タブで `gtag.js` のスクリプトが正常にロードされている（200 OK）
3. `window.dataLayer` にデータが push されている

### 確認できなかったこと

4. `google-analytics.com/g/collect` へのリクエストが **存在しない**
5. GA4 管理画面で「データ収集がウェブサイトで有効になっていません」と表示される

gtag.js はロードされているのに、計測データが送信されない。中間のどこかでデータが消失している状態だった。

### 寄り道: Service Worker の Cache API エラー

デバッグ中、コンソールに Service Worker（`sw.js`）関連の Cache API エラーが表示されていた。POST リクエストは Cache API で処理できないというエラーだったが、これは直接の原因ではなかった。GA4 の collect リクエストは GET/POST 両方を使うため一見関係がありそうに見えたが、そもそもリクエスト自体が発生していないことから、別の箇所に問題があると判断した。

---

## 原因分析: `Arguments` vs `Array`

### 修正前のコード（動かない）

```typescript
window.gtag = (...args: unknown[]) => {
  window.dataLayer.push(args);
};
```

これは TypeScript / モダン JavaScript として自然な書き方だ。rest parameters でまとめて `dataLayer` に push している。

しかし、この `args` は **通常の Array** である。

```javascript
// 呼び出し例
window.gtag('config', 'G-XXXXXXXXXX');

// (...args) で受け取ると
// args = ['config', 'G-XXXXXXXXXX']
// typeof args === 'object'   ✅
// Array.isArray(args) === true   ← ここが問題
// args instanceof Array === true ← ここが問題
```

### 修正後のコード（動く）

```typescript
window.gtag = function (..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
};
```

`function` キーワードで定義し、rest parameters ではなく `arguments` オブジェクトを使用する。

```javascript
// 呼び出し例
window.gtag('config', 'G-XXXXXXXXXX');

// function 内の arguments で受け取ると
// arguments = Arguments(2) ['config', 'G-XXXXXXXXXX']
// typeof arguments === 'object'   ✅
// Array.isArray(arguments) === false   ✅
// arguments instanceof Array === false ✅
```

### ミニファイ後の出力比較

TypeScript/バンドラがビルドした結果も確認しておく:

```javascript
// 修正前（ミニファイ後）
window.gtag = (...t) => {
  window.dataLayer.push(t);
};
// → t は Array

// 修正後（ミニファイ後）
window.gtag = function (...t) {
  window.dataLayer.push(arguments);
};
// → arguments は Arguments オブジェクト
```

ミニファイ後も `arguments` はそのまま保持される。`arguments` は JavaScript エンジンレベルの特殊オブジェクトであり、変数名の置換では消えない。

---

## 技術的解説: なぜ Array だとダメなのか

### gtag.js の内部メカニズム

gtag.js は `dataLayer` 配列の `push` メソッドをオーバーライドし、push されたエントリを FIFO（先入れ先出し）で処理する。このとき、エントリの種類を以下のように区別している:

| 種類                       | 判定条件                                               | 処理                           |
| -------------------------- | ------------------------------------------------------ | ------------------------------ |
| **Arguments オブジェクト** | `typeof === 'object'` かつ `Array.isArray() === false` | gtag コマンドとして実行        |
| **通常のオブジェクト**     | `typeof === 'object'` かつ `Array.isArray() === false` | データレイヤー変数として処理   |
| **Array**                  | `Array.isArray() === true`                             | **コマンドとして認識されない** |

Arguments オブジェクトと通常のオブジェクトはどちらも `Array.isArray() === false` だが、gtag.js は Arguments オブジェクトかどうかをさらに内部で判定し（`callee` プロパティの存在や配列風の構造など）、コマンドディスパッチを行っている。

### Google 公式スニペットを改めて見る

```javascript
function gtag() {
  dataLayer.push(arguments);
}
```

この1行は非常にシンプルだが、**`arguments` を使っていることに意味がある**。これは単なるレガシーな書き方ではなく、gtag.js の内部処理が Arguments オブジェクトを前提としているためだ。

### なぜアロー関数ではダメなのか

アロー関数には `arguments` オブジェクトが存在しない。これは ECMAScript 仕様で明確に定義されている:

> Arrow functions do not have their own `arguments` object. If `arguments` is referenced within an arrow function, it resolves to the `arguments` binding in the enclosing non-arrow function.

```javascript
// アロー関数
const gtag = (...args) => {
  console.log(typeof arguments); // undefined（または外側のスコープの arguments）
  console.log(Array.isArray(args)); // true
  dataLayer.push(args); // Array が push される → gtag.js に無視される
};

// function 式
const gtag = function () {
  console.log(typeof arguments); // 'object'
  console.log(Array.isArray(arguments)); // false
  dataLayer.push(arguments); // Arguments が push される → gtag.js が処理する
};
```

### Arguments オブジェクトの特殊性

MDN によると、`arguments` は「Array 風（array-like）」だが Array ではない:

```javascript
const args = arguments;
typeof args; // 'object'
Array.isArray(args); // false
args instanceof Array; // false
args.length; // 引数の数（配列風にアクセス可能）
args[0]; // 最初の引数
```

この微妙な違いが、gtag.js の型判定ロジックで決定的な差を生む。

---

## 修正内容: 実際のコード差分

> **修正PR**: [#149 Fix: gtag関数でArgumentsオブジェクトをdataLayerにpushするよう修正](https://github.com/dOwOd/exvs2-cost-calculator/pull/149)
> **修正コミット**: [`04bed45`](https://github.com/dOwOd/exvs2-cost-calculator/commit/04bed45) -- `src/lib/analytics.ts` の `setupGtag` 関数（1ファイル、3行変更）

### Before

```typescript
/** gtag を初期化する */
const setupGtag = (): void => {
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
};
```

### After

```typescript
/** gtag を初期化する（Google 公式スニペットと同じ形式） */
const setupGtag = (): void => {
  window.dataLayer = window.dataLayer || [];
  // gtag.js は dataLayer 内の Arguments オブジェクトをコマンドとして処理する
  // アロー関数では arguments が使えないため、function 式を使用
  window.gtag = function (..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
};
```

変更点は2つ:

1. **アロー関数 → `function` 式**: `arguments` オブジェクトを使用するため
2. **`args` → `arguments`**: rest parameters の Array ではなく、Arguments オブジェクトを push

ESLint の `prefer-rest-params` ルールが `arguments` の使用を警告するため、`eslint-disable-next-line` コメントを追加している。このルールは通常は有用だが、今回のケースでは `arguments` を使うことに明確な理由があるため、例外として無効化している。

---

## 教訓

### 1. Google 公式スニペットから乖離するリスク

公式スニペットの `function gtag(){dataLayer.push(arguments);}` は短くて素朴に見えるが、gtag.js の内部仕様と密結合している。TypeScript 化やモダン化の際に「同じ意味だろう」と書き換えると、暗黙の前提（Arguments オブジェクトであること）が崩れる。

**公式スニペットのリファクタリングは、見た目以上に危険**だ。

### 2. TypeScript 環境での `arguments` の扱い

TypeScript / ESLint の推奨設定では:

- `prefer-arrow-callback`: アロー関数を推奨
- `prefer-rest-params`: `arguments` の代わりに rest parameters を推奨

これらのルールに従うと、自然に「アロー関数 + rest parameters」の組み合わせになる。しかし gtag.js のように `arguments` オブジェクトそのものが必要なケースでは、例外的に `function` 式と `arguments` を使わなければならない。

**Linter ルールを盲目的に適用すると、ランタイムの挙動が変わるケースがある。**

### 3. 型定義の罠

`@types/gtag.js`（DefinitelyTyped）の型定義では `gtag` は以下のように定義されている:

```typescript
declare function gtag(command: 'config', targetId: string, config?: /* ... */): void;
declare function gtag(command: 'event', eventName: string, eventParams?: /* ... */): void;
// ...
```

型定義上は rest parameters でシグネチャが表現されているが、**実装レベルでは `arguments` オブジェクトの使用が前提**になっている。型定義は呼び出し側の型安全性を保証するものであり、実装側の制約（Arguments vs Array）は表現されない。

### 4. デバッグの着眼点

GA4 が「動かない」ときのチェックリスト:

1. `gtag.js` スクリプトがロードされているか（Network タブ）
2. `window.dataLayer` にデータが入っているか（Console）
3. **`dataLayer` に push されているのが Arguments か Array か**（`Array.isArray()` で確認）
4. `/g/collect` リクエストが送信されているか（Network タブ）
5. consent mode が正しく設定されているか

特に **3番** は見落としやすい。`console.log(window.dataLayer)` でダンプしても、Arguments と Array は見た目がほぼ同じだ。`Array.isArray()` で明示的にチェックする必要がある。

```javascript
// デバッグ用: dataLayer の各エントリの型を確認
window.dataLayer.forEach((entry, i) => {
  console.log(i, Array.isArray(entry) ? 'Array' : typeof entry, entry);
});
```

### 5. consent-gated 方式自体は正しいアプローチ

今回の問題は consent-gated な動的ロード方式そのものに起因するものではない。`window.gtag` の定義方法という、実装の細部の問題だった。プライバシー配慮のために動的ロードを採用すること自体は、GDPR / ePrivacy Directive 対応として正しいアプローチだ。

---

## 関連するコミット・PR

### GA4 導入の経緯

| 日付       | コミット                                                                   | PR                                                              | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 2026-02-20 | [`09752f0`](https://github.com/dOwOd/exvs2-cost-calculator/commit/09752f0) | [#145](https://github.com/dOwOd/exvs2-cost-calculator/pull/145) | Cloudflare Web Analytics・GA4アクセス解析の導入（`analytics.ts` 新規作成、consent-gated 動的ロード方式） |
| 2026-02-21 | [`e035f6f`](https://github.com/dOwOd/exvs2-cost-calculator/commit/e035f6f) | [#147](https://github.com/dOwOd/exvs2-cost-calculator/pull/147) | GA4 Measurement ID を設定（`G-8WSG8F8W3F`）                                                              |
| 2026-02-21 | [`ab10a7f`](https://github.com/dOwOd/exvs2-cost-calculator/commit/ab10a7f) | #147                                                            | GA4_MEASUREMENT_ID / CF_ANALYTICS_TOKEN の型注釈を追加（TS2367 回避）                                    |
| 2026-02-21 | [`c205a69`](https://github.com/dOwOd/exvs2-cost-calculator/commit/c205a69) | [#148](https://github.com/dOwOd/exvs2-cost-calculator/pull/148) | Google Search Console 認証用 meta タグを追加                                                             |

### 本不具合の修正

| 日付       | コミット                                                                   | PR                                                              | 内容                                                                                                                              |
| ---------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 2026-02-21 | [`04bed45`](https://github.com/dOwOd/exvs2-cost-calculator/commit/04bed45) | [#149](https://github.com/dOwOd/exvs2-cost-calculator/pull/149) | **Arguments vs Array 修正** -- `setupGtag` の gtag 関数定義をアロー関数から function 式に変更、`dataLayer.push(arguments)` に修正 |

### 関連する過去のPR

- [#133 Fix: Cookie同意バナーをフィーチャーフラグで無効化](https://github.com/dOwOd/exvs2-cost-calculator/pull/133) -- Cookie 同意バナーのフィーチャーフラグ制御を導入

---

## 参考文献

- [MDN - The arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments) -- `arguments` オブジェクトの仕様。Array-like だが Array ではない特性を解説
- [Google - The data layer](https://developers.google.com/tag-platform/devguides/datalayer) -- dataLayer の公式ドキュメント。push によるデータ送信の仕組みを説明
- [David Vallejo - Technical Guide to Global Site Tag (gtag.js)](https://www.thyngster.com/technical-guide-to-global-site-tag-gtag-js) -- gtag は「プロキシ」であり、Arguments オブジェクトを dataLayer に push する仕組みを解説。"it's just a proxy, any parameters you send to gtag are pushed back to the dataLayer as an Arguments variable" と明記
- [Simo Ahava - #GTMTips: Use gtag.js Parameters In Google Tag Manager](https://www.simoahava.com/gtm-tips/use-gtag-js-parameters-google-tag-manager/) -- gtag.js のパラメータは `eventModel` キー配下に格納され、GTM の Data Layer 変数からアクセスする方法を解説
- [AngularFix - gtag function Typescript definition](https://www.angularfix.com/2022/04/gtag-function-typescript-definition.html) -- `dataLayer.push(args)` (Array) だと GA4 が動作しなくなることを明記。`@types/gtag.js` の使用を推奨
- [Drupal Issue #3504991 - Why use gtag() function instead of using just dataLayer.push()?](https://www.drupal.org/project/google_tag/issues/3504991) -- `gtag()` 経由の Arguments と直接 `dataLayer.push()` の Object で GTM でのデータ取得方法が異なることを報告
- [TeamSimmer - How Do I Safely Override Google Tag Manager's dataLayer.push() Method?](https://www.teamsimmer.com/2023/03/14/how-do-i-safely-override-google-tag-managers-datalayer-push-method/) -- dataLayer.push のオーバーライドメカニズムを解説。独自リスナーの安全な追加方法
- [DefinitelyTyped - @types/gtag.js](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/gtag.js) -- gtag の TypeScript 型定義

---

## まとめ

| 項目                     | 修正前                    | 修正後                                |
| ------------------------ | ------------------------- | ------------------------------------- |
| 関数定義                 | アロー関数 `(...args) =>` | function 式 `function(..._args)`      |
| dataLayer に push する値 | `args`（Array）           | `arguments`（Arguments オブジェクト） |
| `Array.isArray()`        | `true`                    | `false`                               |
| gtag.js の認識           | 無視される                | コマンドとして処理される              |
| `/g/collect` リクエスト  | 送信されない              | 正常に送信される                      |

**一行で言えば**: `dataLayer.push(arguments)` の `arguments` は `Array` ではなく `Arguments` オブジェクトでなければならない。Google 公式スニペットの `function gtag(){dataLayer.push(arguments);}` は、その1語1語に意味がある。
