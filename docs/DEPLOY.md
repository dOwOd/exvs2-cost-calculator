# デプロイ手順

Cloudflare Pages へのデプロイは GitHub Actions で自動化されている。

## 前提条件

### GitHub Secrets の設定

リポジトリの Settings → Secrets and variables → Actions に以下を登録する:

| Secret名                | 用途                     | 確認場所                                                                |
| ----------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Wrangler 認証トークン    | [API Tokens](https://dash.cloudflare.com/profile/api-tokens) で新規作成 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID | ダッシュボードの URL `https://dash.cloudflare.com/<ACCOUNT_ID>`         |

#### API Token に必要な権限

- Cloudflare Pages: Edit
- Account: Read

## デプロイの種類

### 1. 本番デプロイ（タグプッシュ）

`v*` タグのプッシュで自動実行される。

#### リリース手順（`/release` スキル使用）

```bash
# Claude Code で実行
/release v0.2.0
```

スキルが以下を自動処理する:

1. `package.json` の version を更新
2. `src/data/changelog.ts` にリリースノートを追加（コミット履歴から生成）
3. コミット → タグ作成 → プッシュ

#### 手動でリリースする場合

```bash
# 1. main ブランチで最新状態にする
git checkout main && git pull origin main

# 2. バージョンを更新（以下の2箇所を一致させること）
#    - package.json の "version"
#    - src/data/changelog.ts の先頭 ReleaseEntry

# 3. コミット
git add package.json src/data/changelog.ts
git commit -m "Chore: v0.2.0 リリース準備"

# 4. タグを作成してプッシュ
git tag v0.2.0
git push origin main
git push origin v0.2.0
# → deploy-production ジョブが自動実行される
```

#### バージョン一致チェック

デプロイ前に以下の3箇所のバージョンが一致するか自動検証される:

- Git タグ（`v0.2.0` → `0.2.0`）
- `package.json` の `version`
- `src/data/changelog.ts` の最新 `ReleaseEntry` の `version`

不一致の場合、デプロイは失敗する。

### 2. PRプレビューデプロイ

main ブランチ向けの PR 作成・更新時に自動実行される。

- PR のブランチ名でプレビュー環境にデプロイ
- デプロイ完了後、PR コメントにプレビュー URL が投稿される
- 同じ PR への連続プッシュでは、コメントが更新される（重複しない）
- `docs/`, `.claude/`, `*.md`, `scripts/` のみの変更ではスキップ

## ワークフロー構成

ファイル: `.github/workflows/deploy.yml`

```
deploy.yml
├── deploy-production（タグプッシュ時）
│   ├── Checkout
│   ├── Validate release versions ← バージョン一致チェック
│   ├── Setup pnpm / Node.js
│   ├── Install / Build
│   └── Wrangler pages deploy (--branch=main)
│
└── deploy-preview（PR時）
    ├── Checkout
    ├── Setup pnpm / Node.js
    ├── Install / Build
    ├── Wrangler pages deploy (--branch=PR branch)
    └── Comment preview URL on PR
```

## トラブルシューティング

### デプロイが失敗する

- **"Release version mismatch detected"**: タグ・package.json・changelog.ts のバージョンが不一致。3箇所を揃えてからタグを打ち直す
- **Wrangler 認証エラー**: GitHub Secrets の `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を確認
- **ビルドエラー**: ローカルで `pnpm build` を実行して再現確認

### タグを打ち直す場合

```bash
# ローカルとリモートのタグを削除
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0

# 修正後に再度タグを作成・プッシュ
git tag v0.2.0
git push origin v0.2.0
```
