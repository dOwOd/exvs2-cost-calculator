# 開発ルール

このルールは `src/**/*` の編集時に適用されます。

## テストファースト開発

### 開発フロー

1. テストを先に書く
2. テストが失敗することを確認
3. 実装する
4. テストが通ることを確認
5. **コミットする**（`/commit` を使用）

### コミット前

```bash
pnpm test
```

- すべてのユニットテストがパスすることを必ず確認

### プッシュ前

```bash
pnpm build && pnpm test:e2e
```

- ローカルでE2Eテストを実行し、パスすることを確認してからプッシュする
- GitHub Actionsの無料枠を節約するため、CIでの失敗を未然に防ぐ

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
