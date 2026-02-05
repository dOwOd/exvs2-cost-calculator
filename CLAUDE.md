# EXVS2 Cost Calculator

機動戦士ガンダム EXVS2 XB のコスト計算ツール

## 開発コマンド

```bash
pnpm install && pnpm dev   # 開発開始
pnpm test                  # テスト実行
```

## ルール

詳細は `.claude/rules/` を参照（対象ファイル編集時に自動読み込み）

- **開発**: development.md（src/**/* 編集時）
- **ゲーム仕様**: specifications.md（src/lib/**/*.ts 編集時）
- **UI実装**: ui-patterns.md（src/components/**/*.tsx 編集時）
- **よくある間違い**: common-mistakes.md
- **Git操作**: git-workflow.md（Git コマンド実行時）
- **ゲーム戦術**: game-tactics.md（パターン評価・コメント生成時）

詳細仕様: `docs/SPECIFICATION.md`
戦術知識: `docs/GAME_KNOWLEDGE.md`

## スキル

- `/commit` - コミット規約に従ったコミット作成

## チェックリスト

- [ ] テスト追加/更新 (`pnpm test`)
- [ ] コミット規約に従う
- [ ] PR作成（`Closes #番号`でIssue紐づけ）
