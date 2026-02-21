# ブログ記事素材: Astro + Cloudflare Pages デプロイ自動化

> このファイルは技術ブログ記事の素材です。事実と技術的内容を整理しています。

## 記事の概要

Astroで構築した静的サイトをCloudflare Pagesにデプロイする仕組みをGitHub Actionsで構築した記録。サブパスデプロイ（`dowo.dev/works/exvs2-cost-calculator/`）という制約の中で、本番デプロイとPRプレビュー環境を実現するまでの過程をまとめる。

---

## 前提・背景

### プロジェクト構成

- **フレームワーク**: Astro（静的サイト生成）
- **ホスティング**: Cloudflare Pages
- **パッケージマネージャー**: pnpm
- **CI**: GitHub Actions（ユニットテスト・型チェック・ビルド検証・E2E は既に稼働中）

### デプロイ先の構造

- **本番URL**: `https://dowo.dev/works/exvs2-cost-calculator/`
- **ドメインルーティング**: 別リポジトリ（dowo-dev-router）のCloudflare Workerが `dowo.dev` へのリクエストをパスに応じて各CF Pagesプロジェクトに振り分ける
- **CF Pagesプロジェクト名**: `exvs2-cost-calculator`（カスタムドメインは紐づけていない）

### やりたかったこと

1. タグプッシュ（`v*`）で本番デプロイが走る
2. PR作成・更新でプレビュー環境が自動デプロイされ、PRコメントでURLが通知される
3. バージョンの整合性（タグ・package.json・changelog）を自動チェックする

---

## Git連携 vs GitHub Actions + Wrangler の選択

### CF PagesのGit連携とは

Cloudflare Pagesには、GitHubリポジトリを直接接続してプッシュ時に自動ビルド・デプロイする機能がある。設定画面でリポジトリを選び、ビルドコマンドと出力ディレクトリを指定するだけで使える。

### Git連携を使わなかった理由

1. **サブパスデプロイとの相性**: CF Pagesプロジェクトにカスタムドメインを紐づけていない。ルーティングは別リポジトリのWorkerが担当しており、CF Pages側でドメイン設定をする構造ではない
2. **既存CIパターンの再利用**: pnpm、`.node-version` による一元管理、`paths-ignore` などの設定を既存ワークフローと統一したかった
3. **デプロイタイミングの制御**: Git連携はpush=即デプロイ。タグプッシュをトリガーにしたかったため、GitHub Actionsの `on.push.tags` を使う方が自然だった

### 採用したアプローチ

GitHub Actionsで `pnpm build` → `wrangler pages deploy` の流れを実行する。Wrangler CLIのGitHub Actions向け公式アクション（`cloudflare/wrangler-action@v3`）を利用。

---

## 実装内容

### ワークフローの全体構成

`.github/workflows/deploy.yml` に以下の2ジョブを定義:

| ジョブ              | トリガー          | 用途                                |
| ------------------- | ----------------- | ----------------------------------- |
| `deploy-production` | `v*` タグプッシュ | 本番デプロイ                        |
| `deploy-preview`    | PR作成・更新      | プレビューデプロイ + PRコメント通知 |

### concurrencyによる重複デプロイ防止

```yaml
concurrency:
  group: deploy-${{ github.event_name == 'push' && 'production' || format('preview-{0}', github.event.pull_request.number) }}
  cancel-in-progress: true
```

- 本番デプロイは `deploy-production` グループで重複防止
- プレビューデプロイはPR番号ごとにグループ化。同じPRへの連続プッシュでは前のデプロイをキャンセル

### 本番デプロイ: バージョン一致チェック

タグプッシュ時、デプロイ前にバージョンの整合性を検証するステップを設けた。3箇所の値が一致しないとデプロイが失敗する:

1. **Gitタグ**: `v0.1.0` → `0.1.0`
2. **package.json**: `"version": "0.1.0"`
3. **changelog.ts**: `releases` 配列の先頭エントリの `version`

```yaml
- name: Validate release versions
  run: |
    TAG_VERSION="${GITHUB_REF_NAME#v}"
    PKG_VERSION=$(node -p "require('./package.json').version")
    CHANGELOG_VERSION=$(grep -m1 "version:" src/data/changelog.ts | sed "s/.*'\(.*\)'.*/\1/")

    # 3箇所を比較、不一致があればエラー終了
```

この検証により、タグだけ打ってchangelogを更新し忘れる、といったミスを防げる。

### 本番デプロイ: Wrangler実行

```yaml
- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy dist --project-name=exvs2-cost-calculator --branch=main
```

`--branch=main` を指定すると、CF Pagesで「Production」デプロイとして扱われる。

### プレビューデプロイ: PRコメント通知

プレビューデプロイ後、`actions/github-script@v7` でPRにコメントを自動投稿する。既存のコメントがあれば更新する（同じPRに何度プッシュしても1つのコメントが更新される）。

```yaml
- name: Deploy preview to Cloudflare Pages
  id: deploy
  uses: cloudflare/wrangler-action@v3
  with:
    command: pages deploy dist --project-name=exvs2-cost-calculator --branch=${{ github.head_ref }}

- name: Comment preview URL on PR
  uses: actions/github-script@v7
  with:
    script: |
      const body = [
        '## Preview Deployment',
        '',
        `Preview URL: ${process.env.DEPLOYMENT_URL}`,
        '',
        `Commit: \`${context.sha.substring(0, 7)}\``,
      ].join('\n');

      // 既存コメントを探して更新、なければ新規作成
      const { data: comments } = await github.rest.issues.listComments({...});
      const botComment = comments.find(
        (c) => c.user.type === 'Bot' && c.body.includes('## Preview Deployment')
      );
      // botComment があれば updateComment、なければ createComment
  env:
    DEPLOYMENT_URL: ${{ steps.deploy.outputs.deployment-url }}
```

`wrangler-action` の `outputs.deployment-url` でデプロイ先URLを取得し、PRコメントに含める。

### `/release` スキル

リリース作業を手動で行うとバージョン更新の漏れが起きやすいため、Claude Codeのスキル（カスタムコマンド）として `/release` を作成した。

```
/release v0.2.0
```

実行すると以下を順番に処理する:

1. mainブランチ・クリーンな状態であることを確認
2. `package.json` と `changelog.ts` のバージョンを更新
3. `git log` から前回タグ以降のコミットを取得し、changelogエントリを生成
4. ユーザーに changelog の内容を提示し、編集の機会を与える
5. コミット → タグ作成
6. ユーザー承認後にプッシュ（タグプッシュでデプロイが自動実行）

---

## つまずき1: API Token権限不足

### 症状

デプロイワークフローを実行すると、Wranglerステップで以下のエラーが発生:

```
Authentication error [code: 10000]
```

### 原因

Cloudflare API Tokenの作成時、「Cloudflare Pages」のパーミッションを **Read** に設定していた。デプロイには **Edit** 権限が必要。

### 解決

Cloudflareダッシュボードの「API Tokens」からトークンを編集し、Cloudflare Pagesの権限を **Edit** に変更。GitHub Actions側で再実行したところ、デプロイが成功した。

### 教訓

- CF API Tokenの権限設定は「Account > Cloudflare Pages > Edit」が必要
- エラーメッセージが `Authentication error` と汎用的なため、権限不足だと気づきにくい。まずトークンのパーミッション設定を確認するのが定石

---

## つまずき2: プレビュー環境でアセットが404になる

### 症状

プレビューデプロイは成功し、URLが発行された。しかしブラウザでアクセスすると、CSSもJavaScriptも読み込まれず、スタイルのないHTMLだけが表示された。DevToolsで確認すると、アセットへのリクエストが全て404だった。

### 原因の構造

この問題を理解するには、本番環境とプレビュー環境のURLの違いを把握する必要がある。

**本番環境**:

- URL: `https://dowo.dev/works/exvs2-cost-calculator/`
- Workers ルーターが `/works/exvs2-cost-calculator/*` へのリクエストをCF Pagesに転送
- Astro設定: `base: '/works/exvs2-cost-calculator/'`
- ビルド成果物のアセットパス: `/works/exvs2-cost-calculator/_astro/index.abc123.js`
- ルーターが転送するため、CF Pages側では `/works/exvs2-cost-calculator/_astro/...` へのリクエストが正しく解決される

**プレビュー環境**:

- URL: `https://xxx.exvs2-cost-calculator.pages.dev/`
- CF Pagesが直接配信（Workersルーターを経由しない）
- 同じビルド成果物を使うと、HTMLが `/works/exvs2-cost-calculator/_astro/index.abc123.js` を参照
- プレビュー環境には `/works/exvs2-cost-calculator/` というパスは存在しない → 404

つまり、**本番用のbase pathでビルドした成果物は、ルート配信のプレビュー環境では使えない**。

### 試行錯誤

**試行1**: PRコメントのURLにサブパスを付ける

プレビューURLを `https://xxx.pages.dev/works/exvs2-cost-calculator/` にすれば解決するのでは、と考えた。しかしこれも404。理由は、Astroの `base` オプションはビルド成果物の出力ディレクトリ構造にも影響するが、CF Pagesのルート配信ではそのディレクトリ構造をそのまま解決できないため。

### 最終解決策

プレビュービルド時のみ、Astro CLIのオプションで `base` を `/` に上書きする:

```yaml
- name: Build (preview)
  run: pnpm astro build --site https://preview.pages.dev --base /
```

本番ビルドはastro.config.mjsの設定がそのまま使われる:

```yaml
- name: Build
  run: pnpm build
```

この使い分けにより:

- **本番**: `base: '/works/exvs2-cost-calculator/'` → サブパスデプロイに対応
- **プレビュー**: `base: '/'` → ルート配信に対応

プレビュー環境ではbase pathが `/` なので、サイト内のリンクやナビゲーションは本番と挙動が異なる（サブパスなしでアクセスできる）。ただし、見た目や機能の動作確認には十分。

### 教訓

- Astroの `base` オプションは、HTML内のアセットパス、リンクパス、出力ディレクトリ構造の全てに影響する
- サブパスデプロイのプロジェクトでは、プレビュー環境と本番環境でビルド設定を分ける必要がある場合がある
- `astro build` のCLIオプション（`--site`, `--base`）で設定ファイルを上書きできるのが便利

---

## 学んだこと・まとめ

### GitHub Actionsの基本パターン

- `on.push.tags` と `on.pull_request` で異なるジョブを起動する構成
- `concurrency` による重複実行の防止とグループ化
- `actions/github-script` によるPRコメントの自動投稿・更新
- ステップ間のデータ受け渡し（`id` + `outputs`）
- `permissions` の最小権限設定（`contents: read`, `pull-requests: write`）
- `paths-ignore` でドキュメント変更時のデプロイスキップ

### Cloudflare Pagesの仕組み

- **Git連携 vs Wrangler CLI**: Git連携はシンプルだが柔軟性に欠ける。複雑なルーティングやデプロイタイミング制御にはWrangler CLIが適する
- **`--branch=main` = Production**: CF Pagesでは `main` ブランチへのデプロイが「Production」扱いになる。それ以外のブランチ名はプレビューデプロイになる
- **API Token権限**: Pages へのデプロイには「Cloudflare Pages: Edit」が必要。「Read」では `Authentication error` になる

### Astroのbase pathとデプロイ

- `base` はビルド成果物全体に影響する（アセットパス、リンク、ディレクトリ構造）
- `astro build --base /` でCLIから上書き可能
- サブパスデプロイのプロジェクトでは、プレビュー環境用に別のbase設定が必要になることがある

### リリースフローの自動化

- バージョンの整合性チェック（タグ・package.json・changelog）をCIに組み込むことで、リリースミスを防げる
- `/release` スキルでバージョン更新からタグ作成までを一括処理し、手動操作のミスを減らす

---

## 技術スタック・ツール

| 項目                   | 技術                                            |
| ---------------------- | ----------------------------------------------- |
| フレームワーク         | Astro（静的サイト生成）                         |
| ホスティング           | Cloudflare Pages                                |
| CI/CD                  | GitHub Actions                                  |
| デプロイツール         | Wrangler CLI（`cloudflare/wrangler-action@v3`） |
| パッケージマネージャー | pnpm（`pnpm/action-setup@v4`）                  |
| Node.jsバージョン管理  | `.node-version` ファイル                        |
| ルーティング           | Cloudflare Workers（別リポジトリ）              |

---

## 想定される記事構成案

1. **導入**: 何を作ったか、なぜデプロイ自動化が必要だったか
2. **アーキテクチャ**: サブパスデプロイの構造（Workers ルーター + CF Pages）
3. **Git連携を使わなかった理由**: 選択の背景
4. **ワークフロー実装**: 本番デプロイ、プレビューデプロイ、バージョンチェック
5. **つまずき: API Token権限**: 症状・原因・解決
6. **つまずき: プレビュー環境の404**: 症状・原因の構造・試行錯誤・解決策
7. **リリーススキル**: 手動ミスの防止
8. **まとめ**: 学んだこと
