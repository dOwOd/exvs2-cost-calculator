# CF Web Analytics 自動挿入が機能しなかった原因調査レポート

**Issue**: #146
**調査日**: 2026-02-21
**対応PR**: #151

## 概要

Cloudflare Web Analytics の自動挿入（Auto Install）が `dowo.dev/works/exvs2-cost-calculator/` で機能していなかった原因を調査した。ゾーンレベルのRUM設定は**「有効」（自動挿入）**であったにもかかわらず beacon が挿入されていなかった。調査の結果、**Worker経由のルーティング構成が自動挿入をバイパスしている**ことが原因と判明した。

## インフラ構成

```
ユーザー
  │
  ├── dowo.dev/
  │     │
  │     └── dowod-blog-app (Pages)
  │           カスタムドメイン: dowo.dev, www.dowo.dev
  │           → ゾーンプロキシ経由で直接配信
  │
  └── dowo.dev/works/exvs2-cost-calculator/*
        │
        ├── dowo-dev-router (Worker)
        │     route: dowo.dev/works/exvs2-cost-calculator*
        │     処理: fetch("https://exvs2-cost-calculator.pages.dev/...")
        │
        └── exvs2-cost-calculator (Pages)
              ドメイン: exvs2-cost-calculator.pages.dev のみ
              カスタムドメインなし
```

## 調査プロセス

### 1. 仮説の構築

beacon の不在を確認後、以下の仮説を立てた:

> EXVS2は別のCloudflare Pagesプロジェクトとしてデプロイされ、`dowo-dev-router` Workerを経由して配信されている。CF Web Analyticsの自動挿入はゾーンレベルで動作するため、Workerがゾーン外（`exvs2-cost-calculator.pages.dev`）からフェッチしたレスポンスにはbeaconが注入されない。

### 2. 裏取り

以下の方法で仮説を検証した。

#### curl による beacon 有無の確認

| 確認対象                                | beacon有無 | 配信経路                       |
| --------------------------------------- | ---------- | ------------------------------ |
| `dowo.dev/`                             | なし       | Pages直接（Worker非経由）※後述 |
| `dowo.dev/works/exvs2-cost-calculator/` | なし       | Worker経由                     |
| `exvs2-cost-calculator.pages.dev/`      | なし       | Pages直接                      |

#### レスポンスヘッダーの確認

- `Cache-Control: public, max-age=0, must-revalidate`（`no-transform` なし → 注入ブロック要因ではない）
- `server: cloudflare`（CFプロキシ経由であることは確認済み）

#### CF API による検証

- Pages API: `exvs2-cost-calculator` プロジェクトに Web Analytics 設定なし
- RUM / zone settings API: OAuthトークンにRUM権限がなく、ゾーンレベルの設定状態はAPI経由で確認できなかった

#### CFダッシュボードによる確認（ユーザー実施）

- ドメイン > 分析とログ > Web分析 > RUM設定の管理 でRUM設定が**「有効」（自動挿入）**であることを確認
- 有効であるにもかかわらず beacon が挿入されていない → **Worker proxy バイパス仮説を裏付け**

#### Worker コードの確認

```js
// dowo-dev-router/src/index.js
const EXVS2_ORIGIN = 'https://exvs2-cost-calculator.pages.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const newPath = url.pathname.slice(PREFIX.length) || '/';
    const pagesUrl = new URL(newPath + url.search, EXVS2_ORIGIN);
    return fetch(pagesUrl, request); // ← Pages から取得した生レスポンスをそのまま返却
  },
};
```

- サブリクエスト先は `exvs2-cost-calculator.pages.dev`（`dowo.dev` ゾーン外）
- ゾーンレベルの Auto Install はゾーン内のレスポンスに対して動作するため、ゾーン外からのフェッチレスポンスには適用されない

#### コミュニティ調査

- 「Worker + custom domain で Analytics が動かない」報告が複数存在
- 公式ドキュメントに Workers 経由での自動挿入の挙動について明確な記載がない

### 3. 結論

「RUM設定は有効 → にもかかわらず beacon がない → Worker がゾーン外からフェッチしている」という証拠の連鎖により、**Worker proxy が自動挿入をバイパスしている**という仮説が裏付けられた。

### 未解明の点

`dowo.dev/`（Worker 非経由、Pages カスタムドメイン直接配信）でも beacon が確認できなかった。Worker バイパスだけでは説明できないため、別の要因がある可能性がある。本調査では EXVS2 パスの問題解決を優先したため深追いしていない。

#### 考えられる要因

- Pages カスタムドメイン配信では Auto Install が適用されない仕様の可能性
- CDN キャッシュにより、RUM有効化後もキャッシュ済みレスポンスが返されていた可能性
- ゾーンレベル設定の反映遅延

#### 解明に必要な調査

1. `dowo.dev/` のRUM設定を「有効」（自動挿入）に戻した上で、`curl` で beacon の有無を確認する
2. beacon がない場合、`curl -H "Cache-Control: no-cache"` やクエリパラメータ付きでキャッシュバイパスして再確認
3. それでも beacon がなければ、Pages カスタムドメインでの Auto Install の挙動を CF サポートまたはコミュニティフォーラムで確認する
4. 別のシンプルな Pages プロジェクト（Worker 非経由）で Auto Install が機能するか対照実験を行う

関連 Issue: #152

## 補足: CF Web Analytics 自動挿入の仕組み

- エッジネットワークでHTMLレスポンスの `</body>` 直前に `beacon.min.js` の `<script>` タグをストリーミング注入
- 前提条件: Cloudflareプロキシ経由（オレンジクラウド）+ 有効なHTML構造
- `Cache-Control: public, no-transform` が設定されていると自動挿入は完全にブロックされる（公式FAQ明記）

### ゾーンレベル vs Pages プロジェクトレベルの違い

| 項目           | ゾーンレベル             | Pages プロジェクトレベル |
| -------------- | ------------------------ | ------------------------ |
| 注入タイミング | エッジでリアルタイム変換 | デプロイ時にHTML埋め込み |
| 対象           | 全サブドメイン           | 特定プロジェクトのみ     |
| 再デプロイ     | 不要                     | 必要                     |
| Worker経由     | バイパスされる           | 不明（要検証）           |

## 対応内容

### CFダッシュボード側

- RUM設定を「有効」（自動挿入）から「JSスニペットのインストールで有効にする」に変更
- 手動スニペット用トークンを取得: `9acec5d20aa942ae8cc18fd714a75bcb`

### コード側（PR #151）

- `src/lib/cookieConsent.ts` の `CF_ANALYTICS_TOKEN` にトークンを設定
- `BaseLayout.astro` の既存実装（89-98行目）で beacon スクリプトが全ページに挿入される

```html
<!-- BaseLayout.astro で出力されるスニペット -->
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token":"9acec5d20aa942ae8cc18fd714a75bcb"}'
/>
```

手動スニペット方式を採用した理由:

1. Worker 経由の配信でも確実に動作する（HTMLに直接埋め込むため）
2. コードベースに既に実装済みだった（トークン設定のみで有効化）
3. CF Web Analytics は Cookie 不要なので同意バナーの対象外

## 今後の推奨事項

1. **デプロイ後の動作確認**: `curl -s "URL" | grep beacon` で beacon 挿入を確認
2. **CFダッシュボードでのデータ確認**: Web Analytics でアクセスデータが記録されることを確認
3. **ゾーンレベル自動挿入は使わない**: Worker proxy 構成では手動スニペットが確実
4. **代替案の検討不要**: HTMLRewriter による Worker 側での注入も可能だが、現在の手動スニペット方式で十分
