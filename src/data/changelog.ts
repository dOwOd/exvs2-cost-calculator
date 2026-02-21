/** 変更タイプ（コミット規約と統一） */
export type ChangeType = 'Add' | 'Fix' | 'Update' | 'Remove' | 'Refactor' | 'Chore';

/** 変更エントリ */
export type ChangeEntry = {
  type: ChangeType;
  description: string;
};

/** リリースエントリ */
export type ReleaseEntry = {
  version: string;
  date: string; // YYYY-MM-DD
  summary: string; // 1行の概要
  changes: ChangeEntry[];
};

export const releases: ReleaseEntry[] = [
  {
    version: '0.2.0',
    date: '2026-02-21',
    summary: 'Google AdSense導入',
    changes: [{ type: 'Add', description: 'Google AdSense導入（広告配信基盤・Cookie同意連携）' }],
  },
  {
    version: '0.1.0',
    date: '2026-02-21',
    summary: '初回リリース',
    changes: [
      { type: 'Add', description: 'コスト計算機能（全撃墜順パターン生成・評価）' },
      { type: 'Add', description: '機体名検索・お気に入り機体管理' },
      { type: 'Add', description: '編成保存・読込機能（最大10件）' },
      { type: 'Add', description: 'パターン画像エクスポート・SNSシェア' },
      { type: 'Add', description: 'コスト管理ガイドページ' },
      { type: 'Add', description: 'FAQページ' },
      { type: 'Add', description: 'ダークモード対応' },
    ],
  },
];

/** 最新バージョンを取得 */
export const getLatestVersion = (): string => releases[0].version;
