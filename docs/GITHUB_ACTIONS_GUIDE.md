# GitHub Actions 入門ガイド

GitHub Actions は「GitHub リポジトリで何かが起きたら、自動でコマンドを実行する」仕組み。設定は `.github/workflows/` に YAML ファイルを置くだけで有効になる。

本プロジェクトの `deploy.yml` を題材に、GitHub Actions の書き方を解説する。

## ワークフローの全体構造

```
ワークフロー (.yml ファイル)
├── name:          表示名
├── on:            いつ実行するか
├── concurrency:   重複実行の制御
└── jobs:          何を実行するか
    ├── ジョブ1:
    │   ├── if:           実行条件
    │   ├── runs-on:      実行環境
    │   ├── permissions:  権限
    │   └── steps:        手順（上から順に実行）
    │       ├── uses: ... (既存アクション)
    │       └── run: ...  (シェルコマンド)
    └── ジョブ2:
        └── ...
```

## 各要素の解説

### `name:` — ワークフローの名前

```yaml
name: Deploy
```

GitHub の Actions タブに表示される名前。人間が識別するためだけのラベル。

### `on:` — いつ実行するか

```yaml
on:
  push:
    tags:
      - 'v*'
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '.claude/**'
      - '*.md'
      - 'scripts/**'
```

「どんなイベントが起きたらこのワークフローを動かすか」を定義する。

#### `push.tags: ['v*']`

- リポジトリに **タグ** がプッシュされた時に発火
- `'v*'` はワイルドカード。`v0.1.0`, `v1.0.0`, `v2-beta` など `v` で始まるタグ全てにマッチ
- 通常のコミットプッシュでは発火しない（タグ限定）

#### `pull_request`

- **`types`**: PR のどの操作で発火するか
  - `opened` — PR 新規作成時
  - `synchronize` — PR のブランチに新しいコミットがプッシュされた時
  - `reopened` — 閉じた PR を再オープンした時
- **`branches: [main]`**: main ブランチ向けの PR のみ対象
- **`paths-ignore`**: 指定パスだけの変更では発火しない。ドキュメントだけの修正でデプロイが走るのは無駄なのでスキップ
  - `**` はディレクトリを再帰的にマッチ（`docs/` 以下全て）
  - `*.md` はルート直下の `.md` ファイル

### `concurrency:` — 同時実行の制御

```yaml
concurrency:
  group: deploy-${{ github.event_name == 'push' && 'production' || format('preview-{0}', github.event.pull_request.number) }}
  cancel-in-progress: true
```

**同じグループ名のワークフローが既に実行中なら、古い方をキャンセルする**仕組み。

#### `${{ }}` — 式(Expression)構文

GitHub Actions で**動的な値**を使うための構文。中に変数や条件式を書ける。

```
${{ github.event_name == 'push' && 'production' || format('preview-{0}', github.event.pull_request.number) }}
```

これは JavaScript の三項演算子に似た書き方:

```
もし push イベントなら → グループ名は "deploy-production"
それ以外（PR）なら   → グループ名は "deploy-preview-42"（PR番号）
```

- `format('preview-{0}', 値)` は `{0}` に値を埋め込む関数
- 効果: PR #42 に 3 回連続プッシュしたら、1 回目と 2 回目はキャンセルされ、3 回目だけ実行される

#### `cancel-in-progress: true`

同グループの実行中ジョブをキャンセルする。`false` だと古いジョブの完了を待ってから新しいジョブが始まる。

### `jobs:` — 何を実行するか

```yaml
jobs:
  deploy-production: # ジョブ1
    ...
  deploy-preview: # ジョブ2
    ...
```

ワークフローの中に**複数のジョブ**を定義できる。`deploy-production` と `deploy-preview` はジョブの ID（自由に命名可能）。デフォルトでは全ジョブが**並列実行**される（依存関係がなければ）。

### ジョブの設定

```yaml
deploy-production:
  if: github.event_name == 'push'
  runs-on: ubuntu-latest
  timeout-minutes: 10
  permissions:
    contents: read
```

#### `if:` — ジョブの実行条件

- `github.event_name == 'push'` → タグプッシュ時のみ実行
- PR 時はこの条件が `false` になるのでジョブ全体がスキップされる
- これにより 1 つのワークフローファイルで**2 つの異なる動作**を実現している

`on:` に 2 つのトリガーがあるため、**どちらのイベントでも両ジョブが評価される**。`if` がないとタグプッシュ時に本番もプレビューも両方実行されてしまう。`if` で「このジョブはどちらのイベント用か」を明示して、不要な方をスキップしている。

#### `runs-on:`

- ジョブを実行する**仮想マシンの OS** を指定
- `ubuntu-latest` — GitHub が提供する最新の Ubuntu マシン（無料枠あり）
- 他にも `windows-latest`, `macos-latest` などが使える

#### `timeout-minutes:`

- ジョブの制限時間。超えたら強制終了（無限ループ防止・課金防止）

#### `permissions:`

- このジョブが持つ **GitHub トークンの権限**を最小限に制限する
- `contents: read` — リポジトリの中身を読めるだけ（書き込み不可）
- プレビュージョブでは `pull-requests: write` も追加 → PR にコメントを書くため

### `steps:` — ジョブ内の手順

ステップは**上から順に 1 つずつ**実行される（ジョブは並列だが、ステップは直列）。

#### ステップの 2 つの書き方

```yaml
# 方法1: 既存のアクション（他人が作ったツール）を使う
- name: Checkout
  uses: actions/checkout@v4

# 方法2: シェルコマンドを直接実行する
- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

- **`uses:`** — GitHub Marketplace で公開されているアクションを使う。`@v4` はバージョン指定
- **`run:`** — 普通のシェルコマンドを実行
- **`name:`** — ログに表示される説明文（省略可能だが書くべき）

#### `with:` — アクションへのパラメータ

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version-file: '.node-version'
    cache: 'pnpm'
```

`with:` で**アクションに引数を渡す**。どんなパラメータが使えるかはアクションごとに異なる（各アクションの README に記載）。

### `secrets` — 秘密情報の参照

```yaml
apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

- `secrets.XXX` で、GitHub リポジトリの Settings → Secrets に登録した値を参照
- YAML ファイルにパスワードやトークンを直書きしなくて済む
- ログにもマスクされて表示される（`***`）

### ステップ間のデータ受け渡し

```yaml
- name: Deploy preview to Cloudflare Pages
  id: deploy # ← このステップに名前をつける
  uses: cloudflare/wrangler-action@v3
  ...

- name: Comment preview URL on PR
  ...
  env:
    DEPLOYMENT_URL: ${{ steps.deploy.outputs.deployment-url }}
    #                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    #                    前のステップの出力を参照
```

- **`id:`** でステップに名前をつけると、後のステップから参照できる
- **`steps.<id>.outputs.<name>`** で前のステップが出力した値を取得
- **`env:`** で環境変数として渡し、スクリプト内で `process.env.DEPLOYMENT_URL` として使用

### `actions/github-script` — JavaScript で GitHub API を呼ぶ

```yaml
- uses: actions/github-script@v7
  with:
    script: |
      const { data: comments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
      });
```

このアクションを使うと、ステップ内で **JavaScript を書いて GitHub API を直接叩ける**。

- **`github`** — GitHub API クライアント（認証済み）。`github.rest.issues.createComment()` のように使う
- **`context`** — 現在のイベント情報。`context.repo.owner`（リポジトリオーナー）、`context.issue.number`（PR 番号）など
- **`script: |`** — `|` は YAML の「複数行文字列」記法。インデントされた後続行がすべて文字列になる

## 実運用の例

### 例 1: 機能開発 → リリースまでの流れ

```bash
# 1. 機能開発ブランチで作業
git checkout -b feature/issue-42-dark-mode
# ... コードを書く、コミットする ...
git push origin feature/issue-42-dark-mode

# 2. PRを作成
gh pr create --title "Add: ダークモード"
# → deploy-preview が自動実行
# → PRにプレビューURLのコメントが付く

# 3. レビュー指摘を受けて修正、再push
git push origin feature/issue-42-dark-mode
# → deploy-preview が再度実行
# → 同じPRコメントが最新URLに更新される

# 4. レビューOK → PRマージ
# （GitHub上でマージボタンを押す）
# ※ この時点ではまだ本番にはデプロイされない

# 5. リリースする決断をしたらタグを打つ
git checkout main && git pull origin main
git tag v0.2.0
git push origin v0.2.0
# → deploy-production が自動実行 → 本番デプロイ完了
```

### 例 2: 複数 PR を溜めてからまとめてリリース

```
PR #150 ダークモード      → マージ（まだデプロイしない）
PR #151 バグ修正          → マージ（まだデプロイしない）
PR #152 パフォーマンス改善 → マージ（まだデプロイしない）

# 3つ全部mainに入った状態でタグを打つ
git tag v0.3.0
git push origin v0.3.0
# → 3つの変更がまとめて本番デプロイされる
```

タグを打つまでデプロイされないので、**リリースタイミングを自分でコントロールできる**。

### 例 3: 緊急バグ修正（ホットフィックス）

```bash
# 1. mainから直接修正ブランチを切る
git checkout main && git pull
git checkout -b fix/issue-55-critical-bug

# 2. 修正してPR作成
git push origin fix/issue-55-critical-bug
gh pr create --title "Fix: 計算結果が0になるバグ"
# → プレビューデプロイで修正を確認

# 3. 即マージ → 即タグ
# （GitHub上でマージ）
git checkout main && git pull
git tag v0.2.1          # パッチバージョンを上げる
git push origin v0.2.1
# → 本番デプロイ
```

### 各アクションと何が起きるかの対応表

| 操作                  | 起きること                                                    |
| --------------------- | ------------------------------------------------------------- |
| PR を作成/更新        | プレビュー環境にデプロイ、PR に URL コメント                  |
| PR をマージ           | **何も起きない**（main への push はトリガーに含まれていない） |
| `v*` タグをプッシュ   | 本番デプロイ                                                  |
| docs/ だけの変更で PR | **何も起きない**（paths-ignore）                              |

ポイントは**マージと本番デプロイが分離されている**こと。マージはいつでも気軽にできて、本番に出すタイミングはタグで明示的に決められる。
