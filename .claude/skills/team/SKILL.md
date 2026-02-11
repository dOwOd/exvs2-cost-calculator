---
name: team
description: エージェントチームを起動してIssueに取り組む
---

# チーム起動スキル

エージェントチーム（lead / logic / ui / refactor / qa）を起動し、Issueベースのタスクに取り組む。

## 引数

- `引数なし`: チーム起動のみ（タスクは後から指示）
- `Issue番号`: 指定Issueを分析してタスク分割まで実行（例: `/team #42`）
- `Issue URL`: 同上（例: `/team https://github.com/.../issues/42`）

## 実行手順

### Step 1: チーム起動

```
TeamCreate(team_name: "exvs2", description: "EXVS2コスト計算機プロジェクトチーム")
```

### Step 2: エージェント起動

以下の4エージェントを **並行で** Task ツールで起動する:

```
Task(
  subagent_type: "logic",
  team_name: "exvs2",
  name: "logic",
  prompt: "チームに参加しました。TaskList を確認してタスクの割り当てを待ちます。"
)

Task(
  subagent_type: "ui",
  team_name: "exvs2",
  name: "ui",
  prompt: "チームに参加しました。TaskList を確認してタスクの割り当てを待ちます。"
)

Task(
  subagent_type: "refactor",
  team_name: "exvs2",
  name: "refactor",
  prompt: "チームに参加しました。TaskList を確認してタスクの割り当てを待ちます。"
)

Task(
  subagent_type: "qa",
  team_name: "exvs2",
  name: "qa",
  prompt: "チームに参加しました。TaskList を確認してタスクの割り当てを待ちます。"
)
```

### Step 3: Issue分析（引数にIssue指定がある場合）

1. `gh issue view {番号}` でIssue内容を取得
2. Issue内容を分析し、影響範囲を判定:
   - **ロジックのみ**: `src/lib/`, `src/data/` → `logic` にタスク割当
   - **UIのみ**: `src/components/` → `ui` にタスク割当
   - **両方**: `logic` → `ui` の順でタスク割当（型定義の依存関係を考慮）
   - **リファクタリング**: 重複検出・共通化 → `refactor` にタスク割当
   - **品質検証**: テスト網羅性・仕様整合性 → `qa` にタスク割当
3. TaskCreate でタスクを作成し、TaskUpdate で担当エージェントに割り当てる
4. 必要に応じて TaskUpdate で依存関係（blockedBy）を設定する

### Step 4: ブランチ作成（Issue指定がある場合）

```bash
git checkout main
git pull origin main
git checkout -b feature/issue-{番号}-{説明}
```

### Step 5: ユーザーに報告

起動結果を報告する:

```
チーム `exvs2` を起動しました。

メンバー:
- lead（自分）: タスク管理・統合・Git/PR管理
- logic: ゲームロジック＆テスト
- ui: UIコンポーネント
- refactor: DRYリファクタリング（重複検出・共通化）
- qa: 品質保証（テスト網羅性・仕様整合性検証）

[Issue指定がある場合]
Issue #{番号} を分析し、以下のタスクを作成しました:
- タスク#1: {内容} → {担当エージェント}
- タスク#2: {内容} → {担当エージェント}
```

## タスク管理の原則

- 1つのIssueは複数のタスクに分割してよい
- タスクの粒度: 1エージェントが1ターンで完了できる程度
- 依存関係がある場合は blockedBy で明示する
- 全タスク完了後に `pnpm test` で統合テスト → `/commit` → `/pr`

## 完了時

全Issueの作業が終わったら:

1. `pnpm test` で全テスト通過を確認
2. `/commit` でコミット
3. ユーザーに完了報告（PR作成は `/pr` で別途指示を待つ）
4. `shutdown_request` で logic, ui, refactor, qa を終了
5. `TeamDelete` でチームを削除
