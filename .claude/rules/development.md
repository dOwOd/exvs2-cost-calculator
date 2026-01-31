# 開発ルール

このルールは `src/**/*` の編集時に適用されます。

## コミット規約

### 基本ルール

- **1つの論理的変更につき1コミット**
- コミットメッセージ形式: `Type: Subject`
- Type: Add, Fix, Update, Remove, Refactor, Test, Docs, Chore

### 例

```
Add: EXオーバーリミット発動判定機能を追加
Fix: 総耐久値計算で初期耐久が含まれない不具合を修正
Update: コストバーの色分けルールを変更
```

### Pull Request ワークフロー

**重要**: すべての変更はPull Requestを通じて行います。

#### ブランチ命名規則

```bash
# 機能開発
feature/issue-8-recent-suits-history

# バグ修正
fix/issue-12-cost-calculation-bug

# ドキュメント
docs/update-readme
```

#### ワークフロー

1. **ブランチ作成**
   ```bash
   git checkout -b feature/issue-番号-簡潔な説明
   ```

2. **実装とテスト**
   - テストファースト開発に従う
   - コミットは複数回行ってOK

3. **Pull Request作成**
   - 実装完了後、Claude Codeが自動的にPRを作成
   - ユーザーの承認後にプッシュとPR作成を実行

#### PR作成時のルール

**重要**: PRテンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）を必ず使用する

**タイトル**: コミットメッセージ形式
```
Add: 最近使用した機体の履歴表示機能
```

**本文**: PRテンプレートに従って記入
```markdown
## 関連Issue

Closes #8

## 概要
Issue #8の実装

## 変更内容
- LocalStorage履歴管理を実装
- MobileSuitSearchコンポーネントに履歴表示を追加
- A機/B機間の履歴同期機能

## テスト
- [x] `pnpm test` がすべてパス
- [x] ブラウザで動作確認済み
```

**Issue自動クローズ**:
- **必須**: 関連Issueを `Closes #番号` で紐づける
- PRがマージされると自動的にIssueがクローズされる
- 使用可能なキーワード: `Closes`, `Fixes`, `Resolves`

## テストファースト開発

### 開発フロー

1. テストを先に書く
2. テストが失敗することを確認
3. 実装する
4. テストが通ることを確認
5. **コミットする**

### コミット前

```bash
pnpm test
```

- すべてのテストがパスすることを必ず確認

### 実装完了後

- **実装が完了したら必ずコミットする**
- `/commit` コマンドまたは手動でコミットを作成
- コミットメッセージは規約に従う
- **Pull Requestを作成する**
  - Claude CodeがプッシュとPR作成を行う
  - ユーザーがレビュー・マージを行う

## コーディングスタイル

### 関数定義

- **`const` で関数を定義する**（アロー関数または関数式）
- `function` キーワードは、やむを得ない場合のみ使用
  - 例: ジェネレーター関数、メソッドオーバーライドなど

**推奨**:
```typescript
const calculateCost = (a: number, b: number): number => {
  return a + b;
};
```

**非推奨**:
```typescript
function calculateCost(a: number, b: number): number {
  return a + b;
}
```

## 実装の注意点

- 仕様（docs/SPECIFICATION.md）に厳密に従う
- 不明点があれば仕様を再確認
- 境界値に注意（`<=` vs `<` など）
- **不明点がある場合は必ずユーザーに確認を取る**
  - 勝手に判断・推測で実装しない
