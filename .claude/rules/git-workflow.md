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

- すべてのユニットテストがパスすることを確認してからコミット
- 1つの論理的変更につき1コミット

## git worktreeを使った並行開発

複数のIssueを並行して開発する場合、git worktreeを使って別ブランチの作業を同時に進められる。

```bash
# 1. 現在のブランチでコミット済みであることを確認
git status  # clean であること

# 2. 並行作業用のworktreeを作成
BRANCH=$(git branch --show-current)
git worktree add ../exvs2-worktree "$BRANCH"

# 3. メイン側で別ブランチに切り替えて次の開発を開始
git checkout main && git pull origin main
git checkout -b feature/issue-次の番号-説明
# 開発を続行...

# 4. worktreeでの作業が不要になったら削除
git worktree remove ../exvs2-worktree
```

**注意**:

- worktreeは作成元ブランチのコミット済みの状態をチェックアウトする。未コミットの変更は含まれない
- 不要になったら必ず `git worktree remove` で後片付けする。放置するとブランチロックが残る
- **同一ブランチの重複チェックアウト不可**: worktreeが使用中のブランチは、メイン側でチェックアウトできない。メイン側では必ず別ブランチ（mainまたは次のIssueブランチ）に切り替えること
- 残留worktreeの確認: `git worktree list` で一覧表示、不要なものは `git worktree remove` で削除

### Claude Codeでの運用

- worktreeでの長時間タスク（ビルド、テスト等）は **Bashの `run_in_background` オプション**で実行し、メイン側で次の作業を進める
- エージェントチーム（`/team`）使用時は **leadがworktreeの管理を担当**する
- worktree作成前に `git worktree list` で既存のworktreeがないか確認する

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

1. **必ずmainから派生**: 新しいIssueのブランチは必ず最新のmainから作成する
2. **Issue専用ブランチを作成**: 各Issueに対して専用のブランチを作成する
3. **ブランチの混在禁止**: 別のIssueの変更を同じブランチに含めない
4. **1 Issue = 1 PR**: 1つのIssueに対して1つのPRを作成する

```bash
# 新しいIssueに取り組む際の必須手順
git checkout main
git pull origin main
git checkout -b fix/issue-番号-説明
```

**禁止事項**:

- 他のIssueブランチから派生してブランチを作成すること
- 既存のIssueブランチで別のIssueの作業を行うこと

## PR作成ルール

1. **テンプレート使用**: `.github/PULL_REQUEST_TEMPLATE.md` に従う
2. **Issue紐づけ必須**: 本文に `Closes #番号` を含める（マージ時にIssue自動クローズ）
3. **タイトル形式**: `Type: 概要`（コミットメッセージ形式）
4. **プッシュとPR作成**: ユーザー承認後にClaude Codeが実行
