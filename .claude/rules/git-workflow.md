# Git操作ルール

このルールは Git コマンド実行時に適用されます。

## コミットメッセージ形式

```
<Type>: <概要>

- 詳細（箇条書き）

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Type**: Add, Fix, Update, Remove, Refactor, Test, Docs, Chore

## コミット前の確認

```bash
pnpm test
```

- すべてのテストがパスすることを確認してからコミット
- 1つの論理的変更につき1コミット

## 安全プロトコル

- **破壊的コマンド禁止**: `push --force`, `reset --hard`, `checkout .` は明示的指示がない限り使用しない
- **フックをスキップしない**: `--no-verify` 禁止
- **ファイル名指定でステージング**: `git add .` ではなく具体的なファイル名を指定
- **プッシュは手動**: ユーザー承認後にのみプッシュ

## ブランチ命名

```bash
feature/issue-番号-説明   # 機能開発
fix/issue-番号-説明       # バグ修正
docs/説明                 # ドキュメント
```

## Issue対応の原則

**重要**: Issueに取り組む際は、以下を必ず守ること。

1. **Issue専用ブランチを作成**: 各Issueに対して専用のブランチを作成する
2. **ブランチの混在禁止**: 別のIssueの変更を同じブランチに含めない
3. **1 Issue = 1 PR**: 1つのIssueに対して1つのPRを作成する

```bash
# 例: Issue #37 に取り組む場合
git checkout main
git pull origin main
git checkout -b fix/issue-37-説明
```

## PR作成ルール

1. **テンプレート使用**: `.github/PULL_REQUEST_TEMPLATE.md` に従う
2. **Issue紐づけ必須**: 本文に `Closes #番号` を含める（マージ時にIssue自動クローズ）
3. **タイトル形式**: `Type: 概要`（コミットメッセージ形式）
4. **プッシュとPR作成**: ユーザー承認後にClaude Codeが実行
