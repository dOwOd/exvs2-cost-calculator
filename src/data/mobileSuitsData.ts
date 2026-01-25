/**
 * 機体名データ
 * コスト×耐久値ごとの代表的な機体名
 */

import { isHealthType, type CostType, type HealthType } from '../lib/types';

/**
 * 機体名マッピング（as const で定義してリテラル型を抽出可能にする）
 */
const mobileSuitsDataConst = {
  3000: {
    800: ['ゴッドガンダム', 'マスターガンダム'],
    760: ['ガンダム・バエル', 'スタービルドストライクガンダム'],
    750: ['ペーネロペー'],
    720: ['キュベレイ', 'フルアーマー・ユニコーンガンダム', 'νガンダムHWS', 'ガンダムDX', 'ガンダムヴァサーゴ・チェストブレイク', 'ターンX', 'デスティニーガンダム', 'ダブルオーガンダム セブンソード/G', 'ダブルオークアンタ フルセイバー', 'ガンダム・キマリスヴィダール', 'ホットスクランブルガンダム', 'N-EXTREMEガンダム エクスプロージョン'],
    700: ['ナイチンゲール', 'ガンダムエピオン', 'ダブルオーガンダム', 'ガンダムハルート', 'ガンダムAGE-FX'],
    680: ['フルアーマーZZガンダム', 'νガンダム', 'サザビー', 'V2ガンダム', 'ユニコーンガンダム', 'バンシィ・ノルン', 'Ex-Sガンダム', 'Hi-νガンダム', 'RX-93ff νガンダム', 'Ξガンダム', 'ウイングガンダムゼロ', 'ウイングガンダムゼロ(EW版)', 'トールギスⅢ', '∀ガンダム', 'インフィニットジャスティスガンダム', 'インフィニットジャスティスガンダム弐式', 'ダブルオークアンタ', 'ヤークトアルケーガンダム', 'ガンダムAGE-2 ダークハウンド', 'G-セルフ(パーフェクトパック)', 'カバカーリー', 'ガンダムダブルオースカイ', 'エクストリームガンダム type-レオスⅡ Vs.'],
    660: ['シナンジュ', 'クロスボーン・ガンダムX1フルクロス', 'ストライクフリーダムガンダム', 'マイティーストライクフリーダムガンダム', 'ガンダムサバーニャ', 'ガンダムレギルス'],
    640: ['リボーンズガンダム', 'ガンダム・バルバトスルプスレクス'],
  },
  2500: {
    700: ['ガンダム試作2号機', 'ビギナ・ギナⅡ(木星決戦仕様)', 'ガンダムシュピーゲル', 'デスティニーガンダム(ハイネ機)', 'アストレイレッドフレーム改', 'アストレイレッドフレーム(レッドドラゴン)', 'アヴァランチエクシア', 'トライバーニングガンダム', 'エクストリームガンダム ゼノン-F'],
    680: ['ジ・O', 'ゴトラタン', 'リグ・コンティオ', 'クロスボーン・ガンダムX3', 'ファントムガンダム', 'トールギスⅡ', 'ガンダムデスサイズヘル(EW版)', 'ガンダムヘビーアームズ改(EW版)', 'インパルスガンダム', 'ドレッドノートイータ', 'アリオスガンダム', 'アルケーガンダム', 'スサノオ', 'ガンダム・バルバトスルプス', 'ダリルバルデ', '騎士ガンダム'],
    660: ['Zガンダム', 'バウンド・ドック', 'ZZガンダム', 'ガンダム試作3号機', 'オーヴェロン', 'アルトロンガンダム', 'ガンダムXディバイダー', 'ゴールドスモー', 'パーフェクトストライクガンダム', 'アカツキ', 'アストレイブルーフレームD', 'ラファエルガンダム', 'ガンダムAGE-2', 'ダハック', 'アトラスガンダム', 'フルアーマー・ガンダム', 'ガンダム・エアリアル(改修型)', 'GQuuuuuuX', 'ウイングガンダムフェニーチェ', '戦国アストレイ頑駄無', 'エクストリームガンダム エクリプス-F', 'エクストリームガンダム アイオス-F', 'エクストリームガンダム エクセリア'],
    650: ['バンシィ', 'ゼイドラ', 'フォーンファルシア', 'サイコ・ザク'],
    640: ['ハンブラビ', 'ガンダムF91', 'ユニコーンガンダム3号機フェネクス', 'トーリスリッター', 'クロスボーン・ガンダムX2改', 'フリーダムガンダム', 'ジャスティスガンダム', 'レジェンドガンダム', 'ストライクノワール', 'ライジングフリーダムガンダム', 'ケルディムガンダム', 'ガンダムAGE-1 フルグランサ', 'G-セルフ', 'キュベレイパピヨン', 'ライトニングガンダムフルバーニアン', 'スターウイニングガンダム', 'RX-零丸', 'アースリィガンダム', 'N-EXTREMEガンダム ヴィシャス'],
    620: ['ジオング', '百式', 'クロスボーン・ガンダムX1改', 'トールギス', 'プロヴィデンスガンダム', 'ブレイヴ指揮官用試験機', 'ガンダムAGE-3', 'ガンダム・グシオンリベイクフルシティ', 'ガンダム・エアリアル(改修型)パーメットスコア・エイト', 'トランジェントガンダム'],
    600: ['アストレイゴールドフレーム天ミナ']
  },
  2000: {
    680: ['シャイニングガンダム', 'ドラゴンガンダム', 'ガンダムマックスター', 'アストレイレッドフレーム'],
    660: ['ガンダム', 'マラサイ', 'ギャプラン', 'ヤクト・ドーガ', 'シナンジュ・スタイン', '高機動型ザクⅡ後期型(ジョニー・ライデン機)', '高機動型ザクⅡ改(シン・マツナガ機)', '高機動型ゲルググ(ヴィンセント機)', 'ガンダムサンドロック改', 'ガンダムX', 'コレンカプル', 'ストライクガンダム', 'インパルスガンダム(ルナマリア搭乗)', 'ガナーザクウォーリア', 'グフイグナイテッド', 'ガンダムキュリオス', 'ガンダムヴァーチェ', 'ガンダムスローネツヴァイ', 'ガラッゾ(ヒリング・ケア機)', 'ガンダムAGE-1', 'ガンダム・バルバトス', 'ガンダム・キマリストルーパー', 'ガンダム・エアリアル', '赤いガンダム'],
    650: ['キュベレイMk-Ⅱ(プル)', 'ザクⅢ改', 'ノーベルガンダム'],
    640: ['ガンダム(Gメカ)', 'シャア専用ゲルググ', 'ガンダムMk-Ⅱ', 'メッサーラ', 'ガブスレイ', 'Zガンダム(ルー搭乗)', 'ドーベン・ウルフ', 'ヴィクトリーガンダム', 'ゲドラフ', 'デルタプラス', 'ローゼン・ズール', 'ブルーディスティニー1号機', 'ペイルライダー(陸戦重装仕様)', 'ガンダム試作1号機フルバーニアン', 'ガーベラ・テトラ', 'ウイングガンダム', 'ガンダムデスサイズヘル', 'イージスガンダム', 'カラミティガンダム', 'レイダーガンダム', 'ガイアガンダム', 'スターゲイザー', 'アストレイブルーフレームセカンドL', 'ドレッドノートガンダム(Xアストレイ)', 'ガンダムスローネドライ', 'ファルシア', 'マックナイフ(マスク機)', 'ヘカテー', 'アッガイ(ダリル搭乗)', 'ガンダムX魔王', 'N-EXTREMEガンダム ザナドゥ'],
    620: ['ディジェ', 'アッガイ(ハマーン搭乗)', 'ナラティブガンダム', 'イフリート(シュナイド機)', 'ガンダムヘビーアームズ改', 'ベルティゴ', 'フォビドゥンガンダム', 'ストライクルージュ(オオトリ装備)', 'インフィニットジャスティスガンダム(ラクス搭乗)', 'グラハム専用ユニオンフラッグカスタム', 'G-アルケイン(フルドレス)', 'モンテーロ', 'ガンダム・フラウロス', 'ガンダム・ファラクト', 'ガンダムダブルオーダイバーエース'],
    600: ['ギャン', 'クシャトリヤ', 'ブリッツガンダム', 'ハイペリオンガンダム', 'ガンダムエクシア', 'ガンダムデュナメス', 'ビルドストライクガンダム(フルパッケージ)', 'ザクアメイジング'],
    580: ['アストレイゴールドフレーム天']
  },
  1500: {
    540: ['ザクⅡ(ドアン機)', 'イフリート改'],
    520: ['アッガイ', 'ヒルドルブ'],
    500: ['ガンダムEz8', 'グフ・カスタム', 'ヅダ', 'ガンイージ', 'ライジングガンダム', 'デュエルガンダムアサルトシュラウド', 'バスターガンダム', 'ティエレンタオツー', 'アヘッド脳量子波対応型(スマルトロン)', 'G-ルシファー'],
    480: ['ガンキャノン', 'シャア専用ザクⅡ', 'キュベレイMk-Ⅱ(プルツー)', 'ベルガ・ギロス', 'ザクⅡ改', 'ケンプファー', 'カプル', 'ラゴゥ', 'N-EXTREMEガンダム スプレマシー'],
    440: ['リ・ガズィ', 'アレックス'],
  },
} as const;

/**
 * 機体名リテラル型を抽出
 */
type MobileSuitsDataType = typeof mobileSuitsDataConst;
type CostKeys = keyof MobileSuitsDataType;
type HealthRecord<C extends CostKeys> = MobileSuitsDataType[C];
type HealthKeys<C extends CostKeys> = keyof HealthRecord<C>;
type ExtractNames<C extends CostKeys, H extends HealthKeys<C>> = HealthRecord<C>[H] extends readonly (infer U)[] ? U : never;

/**
 * すべての機体名のリテラル型
 */
export type MobileSuitName = {
  [C in CostKeys]: {
    [H in HealthKeys<C>]: ExtractNames<C, H>;
  }[HealthKeys<C>];
}[CostKeys];

/**
 * 機体名マッピング
 *
 * 使い方:
 * mobileSuitsData[3000][800] // => ['νガンダム', 'Hi-νガンダム']
 */
export const mobileSuitsData: Record<CostType, Partial<Record<HealthType, readonly MobileSuitName[]>>> = mobileSuitsDataConst;

/**
 * 機体名を取得
 * @param cost - コスト
 * @param health - 耐久値
 * @returns 機体名の配列（最大2つまで）+ 残り機体数
 */
export const getMobileSuitNames = (cost: CostType, health: HealthType) => {
  const suits = mobileSuitsData[cost]?.[health] || [];

  // 最初の2つまで取得
  const names = suits.slice(0, 2);
  const remaining = Math.max(0, suits.length - 2);

  return { names, remaining };
}

/**
 * 機体名を表示用文字列に整形
 * @param cost - コスト
 * @param health - 耐久値
 * @returns 「νガンダム、Hi-νガンダム 他1機」のような文字列
 */
export const formatMobileSuitNames = (cost: CostType, health: HealthType) => {
  const { names, remaining } = getMobileSuitNames(cost, health);

  if (names.length === 0) {
    return '';
  }

  const namesPart = names.join('、');
  const remainingPart = remaining > 0 ? ` 他${remaining}機` : '';

  return `${namesPart}${remainingPart}`;
}

/**
 * すべての機体名を取得（制限なし）
 * @param cost - コスト
 * @param health - 耐久値
 * @returns すべての機体名の配列
 */
export const getAllMobileSuitNames = (cost: CostType, health: HealthType): readonly MobileSuitName[] => {
  return mobileSuitsData[cost]?.[health] || [];
};

/**
 * 指定コストで利用可能な耐久値リストを取得
 * mobileSuitsDataConstに機体が存在する耐久値のみを返す
 * @param cost - コスト
 * @returns 耐久値の配列（降順ソート）
 */
export const getAvailableHealthOptions = (cost: CostType): HealthType[] => {
  const healthRecord = mobileSuitsDataConst[cost];
  if (!healthRecord) return [];

  const healthValues = Object.keys(healthRecord)
    .map(Number)
    .filter(isHealthType) // 型ガードでフィルタリング
    .sort((a, b) => b - a); // 降順ソート

  return healthValues;
}

/**
 * コストと耐久値の組み合わせに機体が存在するかチェック
 * @param cost - コスト
 * @param health - 耐久値
 * @returns 機体が存在する場合true
 */
export const hasMobileSuitsForHealth = (cost: CostType, health: HealthType): boolean => {
  const healthRecord = mobileSuitsDataConst[cost];
  if (!healthRecord) return false;

  // 文字列キーの存在確認（asアサーション不要）
  return Object.keys(healthRecord).includes(String(health));
}

/**
 * 機体情報(名前、コスト、耐久値)
 */
export type MobileSuitInfo = {
  name: MobileSuitName;
  cost: CostType;
  health: HealthType;
};

/**
 * 全機体のフラットリスト(検索用)
 */
export const mobileSuitsList: MobileSuitInfo[] = (() => {
  const list: MobileSuitInfo[] = [];

  Object.keys(mobileSuitsDataConst).forEach((costStr) => {
    const cost = Number(costStr) as CostType;
    const healthRecord = mobileSuitsDataConst[cost];
    Object.keys(healthRecord).forEach((healthStr) => {
      const health = Number(healthStr) as HealthType;
      const suits = healthRecord[health];
      if (suits) {
        suits.forEach((name) => {
          list.push({ name, cost, health });
        });
      }
    });
  });

  return list;
})();

/**
 * 文字列を正規化(ひらがな→カタカナ、全角→半角、小文字化)
 * @param str - 正規化する文字列
 * @returns 正規化された文字列
 */
export const normalizeString = (str: string): string => {
  return str
    // ひらがなをカタカナに変換
    .replace(/[\u3041-\u3096]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    })
    // 全角英数字を半角に変換
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    })
    // 小文字化
    .toLowerCase();
};

/**
 * 機体名を検索
 * @param query - 検索クエリ
 * @returns 検索結果(最大10件)
 */
export const searchMobileSuits = (query: string): MobileSuitInfo[] => {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = normalizeString(query);

  const results = mobileSuitsList.filter((suit) => {
    const normalizedName = normalizeString(suit.name);
    return normalizedName.includes(normalizedQuery);
  });

  // 最大10件まで返す
  return results.slice(0, 10);
};
