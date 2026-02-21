---
name: release
description: リリース準備（バージョン更新・changelog追記・タグ作成・プッシュ）
user_invocable: true
---

# リリーススキル

新しいバージョンをリリースするためのスキルです。バージョン更新が必要な全箇所を一括で処理し、漏れを防ぎます。

## 使い方

```
/release v0.2.0
```

引数でバージョンを指定します（`v` プレフィックスあり/なしどちらでも可）。

## 実行手順

### 1. 事前チェック

- 現在のブランチが `main` であることを確認
- `git status` でワーキングツリーがクリーンであることを確認
- `git pull origin main` で最新状態に更新
- 指定されたバージョンのタグが既に存在しないことを確認
- 現在の `package.json` のバージョンと比較し、新しいバージョンが大きいことを確認

### 2. バージョン更新（2箇所）

以下のファイルのバージョンを更新する:

1. **`package.json`**: `"version"` フィールドを新しいバージョンに更新
2. **`src/data/changelog.ts`**: `releases` 配列の先頭に新しい `ReleaseEntry` を追加

### 3. changelog の内容生成

- `git log` で前回のタグ（最新タグ）から `HEAD` までのコミットを取得
- コミットメッセージの Type（Add, Fix, Update 等）を `ChangeType` にマッピング
- マージコミット（`Merge pull request`）はスキップ
- Co-Authored-By 行はスキップ
- 生成した changelog をユーザーに提示し、**編集の機会を与える**（自動で確定しない）

### 4. コミット

- `/commit` スキルは使わず、以下のメッセージ形式で直接コミット:

  ```
  Chore: v{バージョン} リリース準備

  - package.json version を {バージョン} に更新
  - changelog.ts に v{バージョン} のリリースノートを追加

  Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
  ```

- ステージング対象: `package.json` と `src/data/changelog.ts` のみ

### 5. タグ作成・プッシュ

- `git tag v{バージョン}` でタグを作成
- ユーザーに最終確認を取ってから以下を実行:
  - `git push origin main`
  - `git push origin v{バージョン}`
- **ユーザーの承認なしにプッシュしない**

### 6. 完了報告

以下を報告する:

- 更新したファイル一覧
- 作成したタグ
- デプロイワークフローが自動実行されることの案内
