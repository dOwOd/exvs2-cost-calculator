# EXVS2 Cost Calculator

機動戦士ガンダム EXVS2 XB のコスト計算ツールです。

---

## 必読ドキュメント

新しいセッションで作業を開始する前に、以下のドキュメントを**必ず順番に読んでください**:

1. **README.md** - プロジェクト概要、機能、セットアップ手順
2. **CONTRIBUTING.md** - 開発ルール、コミット規約、テスト駆動開発
3. **docs/SPECIFICATION.md** - 詳細技術仕様、ゲームルール、アルゴリズム

---

## ルールファイル

詳細な開発ルールは `.claude/rules/` ディレクトリに分割されています：

- **specifications.md** - ゲーム仕様・計算ロジック（EX発動条件、コスト管理など）
- **development.md** - 開発ルール（コミット規約、テストファーストなど）
- **ui-patterns.md** - UI実装パターン（色分け、フォントサイズなど）
- **common-mistakes.md** - よくある間違い（過去に修正済みの問題）

これらのルールは、対象ファイルの編集時に自動的に読み込まれます。

---

## スキル

- **commit** - コミット規約に従ったコミットを作成（`/commit` で呼び出し）

---

## 開発環境

### ローカル環境
```bash
pnpm install
pnpm dev
pnpm test
```

### Docker環境
```bash
docker compose up dev
docker compose exec dev pnpm install
docker compose exec dev pnpm test
```

---

## チェックリスト

変更を加えた後：

- [ ] テストを追加/更新した
- [ ] すべてのテストがパスすることを確認した（`pnpm test`）
- [ ] コミットメッセージが規約に従っている
- [ ] プッシュは行っていない（ユーザーが手動で行う）

---

## このファイルの目的

このCLAUDE.mdは、セッション開始時の概要を提供します。詳細なルールは `.claude/rules/` に分割されており、必要に応じて自動的に読み込まれます。
