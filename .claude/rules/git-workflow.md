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

## プッシュ前の確認

```bash
pnpm build && pnpm test:e2e
```

- プッシュ前にローカルでE2Eテストを実行し、パスすることを確認する
- GitHub Actionsの無料枠を節約するため、CIでの失敗を未然に防ぐ

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
5. **ドラフトPRで作成**: `gh pr create --draft` でドラフトとして作成（CI節約のため）

## ドラフトPR運用フロー

CI/CD利用時間を節約するため、PRはドラフトで作成し、準備完了後にReady for Reviewに変更する。

### 手順

1. ブランチ作成・開発
2. **ドラフトPRを作成**: `gh pr create --draft`
3. 開発・修正を繰り返しプッシュ（ドラフト中はCI実行なし）
4. ローカルで `pnpm test` / `pnpm build && pnpm test:e2e` を確認
5. **Ready for Reviewに変更**: `gh pr ready` → CI実行開始
6. CI通過後にレビュー・マージ

### 注意

- ドラフトPRではCI/E2E/Storybookが一切実行されない
- Ready for Review後の追加プッシュではCIが実行される（concurrencyにより前のrunは自動キャンセル）
- PRでのE2Eテストはnon-webkit（chromium/firefox/mobile-chrome）のみ実行。WebKit系はmainマージ時にフルスイート実行
