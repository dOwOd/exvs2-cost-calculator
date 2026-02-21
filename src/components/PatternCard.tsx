/**
 * パターンカード（個別パターン表示）
 */

import { useState, useRef } from 'preact/hooks';
import type { EvaluatedPattern, Formation } from '../lib/types';
import {
  generatePatternCardImage,
  shareImage,
  canShareFiles,
  generateFilename,
} from '../lib/imageExport';
import { InfoIcon } from './Tooltip';
import { trackEvent } from '../lib/analytics';

type PatternCardType = {
  pattern: EvaluatedPattern;
  rank: number;
  maxTotalHealth: number;
  formation: Formation;
  showScrollHint?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
};

export const PatternCard = ({
  pattern,
  rank,
  maxTotalHealth,
  formation,
  showScrollHint = false,
  isExpanded,
  onToggle,
}: PatternCardType) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!hasScrolled) {
      setHasScrolled(true);
    }
  };
  // 実際に発生した撃墜のみを表示（敗北までの部分）
  const actualPattern = pattern.pattern.slice(0, pattern.transitions.length);

  // EX発動可能判定用のminCost計算
  const minCost =
    formation.unitA && formation.unitB ? Math.min(formation.unitA.cost, formation.unitB.cost) : 0;

  const healthDiff =
    maxTotalHealth > 0 && pattern.totalHealth < maxTotalHealth
      ? maxTotalHealth - pattern.totalHealth
      : 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const handleShare = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!cardRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const blob = await generatePatternCardImage(cardRef.current);
      trackEvent('image_export', { rank });
      const filename = generateFilename(rank, formation);
      const costA = formation.unitA?.cost ?? 0;
      const costB = formation.unitB?.cost ?? 0;
      await shareImage(blob, filename, `EXVS2 パターン #${rank} (${costA}+${costB})`);
      trackEvent('share_image', { rank });
    } catch (error) {
      // ユーザーが共有をキャンセルした場合はエラーを無視
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('共有に失敗しました:', error);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      ref={cardRef}
      data-testid={`pattern-card-${rank}`}
      class={`bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg border-l-4 shadow-sm dark:shadow-none ${
        pattern.isEXActivationFailure ? 'border-red-500' : 'border-blue-500'
      }`}
    >
      {/* 画像エクスポート用: 編成情報ヘッダー（通常時非表示） */}
      <div
        data-export-only
        class="mb-2 px-1 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300"
      >
        編成: A コスト{formation.unitA?.cost ?? '-'}/耐久{formation.unitA?.health ?? '-'} | B コスト
        {formation.unitB?.cost ?? '-'}/耐久{formation.unitB?.health ?? '-'}
      </div>

      {/* ランクとパターン（クリック可能ヘッダー） */}
      <div
        data-testid={`pattern-header-${rank}`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 rounded"
      >
        <div class="flex items-center gap-2 sm:gap-3">
          {/* シェブロンアイコン（画像から除外） */}
          <svg
            data-export-exclude
            class={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span
            data-testid={`pattern-rank-${rank}`}
            class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400"
          >
            #{rank}
          </span>
          <div
            data-testid={`pattern-string-${rank}`}
            class="text-lg sm:text-2xl font-mono flex items-center gap-1 sm:gap-2"
          >
            {actualPattern.map((unit, index) => (
              <>
                <span
                  class={
                    unit === 'A'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-green-600 dark:text-green-400'
                  }
                  key={`${index}-unit`}
                >
                  {unit}
                </span>
                {index < actualPattern.length - 1 && (
                  <span class="text-slate-400 dark:text-slate-500" key={`${index}-arrow`}>
                    →
                  </span>
                )}
              </>
            ))}
          </div>
          {/* 折りたたみ時の総耐久サマリー */}
          {!isExpanded && (
            <span
              data-testid={`pattern-summary-health-${rank}`}
              class="text-sm sm:text-base text-slate-500 dark:text-slate-400 ml-2"
            >
              総耐久 {pattern.totalHealth}
              {healthDiff > 0 && (
                <span class="text-red-500 dark:text-red-400 ml-1">(最大比 -{healthDiff})</span>
              )}
            </span>
          )}
        </div>
        <div class="flex items-center gap-2">
          {pattern.canActivateEXOverLimit && !pattern.isEXActivationFailure && (
            <span class="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs sm:text-sm font-semibold">
              EXオーバーリミット発動可
            </span>
          )}
          {pattern.isEXActivationFailure && (
            <span class="px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs sm:text-sm font-semibold">
              EXオーバーリミット不発
            </span>
          )}
          {/* SNSシェアボタン（展開時のみ表示、画像から除外） */}
          {isExpanded && (
            <div data-export-exclude class="flex items-center gap-0.5 ml-1">
              {/* Twitter/X シェア */}
              <button
                type="button"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  const costA = formation.unitA?.cost ?? 0;
                  const costB = formation.unitB?.cost ?? 0;
                  const shareText = `EXVS2 パターン#${rank} (${costA}+${costB}編成)の撃墜順パターンを確認！`;
                  const params = new URLSearchParams({
                    text: shareText,
                    url: window.location.href,
                    hashtags: 'EXVS2IB,イニブ',
                  });
                  window.open(
                    `https://twitter.com/intent/tweet?${params.toString()}`,
                    '_blank',
                    'noopener,noreferrer,width=600,height=400',
                  );
                  trackEvent('share_twitter', { rank });
                }}
                title="Xでシェア"
                class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              {/* LINE シェア */}
              <button
                type="button"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  const costA = formation.unitA?.cost ?? 0;
                  const costB = formation.unitB?.cost ?? 0;
                  const shareText = `EXVS2 パターン#${rank} (${costA}+${costB}編成)の撃墜順パターンを確認！ ${window.location.href}`;
                  window.open(
                    `https://line.me/R/share?text=${encodeURIComponent(shareText)}`,
                    '_blank',
                    'noopener,noreferrer,width=600,height=400',
                  );
                  trackEvent('share_line', { rank });
                }}
                title="LINEでシェア"
                class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
              </button>
              {/* 画像共有（Web Share対応時のみ） */}
              {canShareFiles() && (
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isExporting}
                  title="画像を共有"
                  class="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                >
                  {isExporting ? (
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      class="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 評価指標 */}
          <div class="mt-3 mb-3">
            <div class="bg-slate-100 dark:bg-slate-700 p-2 sm:p-3 rounded">
              <div
                data-testid={`pattern-total-health-${rank}`}
                class="flex flex-wrap items-baseline justify-center gap-1 sm:gap-2"
              >
                <span class="text-sm sm:text-base text-slate-600 dark:text-slate-400 flex items-center">
                  総耐久
                  <InfoIcon tooltip="リスポーン時の耐久変動を考慮した真の総耐久値。高いほど長く戦える。" />
                </span>
                <span class="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {pattern.totalHealth}
                </span>
                {healthDiff > 0 && (
                  <span class="text-sm sm:text-base text-red-500 dark:text-red-400">
                    (最大比 -{healthDiff})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* コスト推移テーブル */}
          <div class="relative">
            {/* スクロールヒント（最初のカードのみ、スクロール前のみ表示、画像から除外） */}
            {showScrollHint && !hasScrolled && (
              <div
                data-export-exclude
                class="lg:hidden flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1"
              >
                <span>スワイプで全体表示</span>
              </div>
            )}
            <div
              data-testid={`pattern-table-container-${rank}`}
              class="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0"
              onScroll={handleScroll}
            >
              <table class="w-full text-sm sm:text-lg min-w-[500px]">
                <caption class="sr-only">パターン #{rank} のコスト推移</caption>
                <thead>
                  <tr class="border-b border-slate-300 dark:border-slate-600">
                    <th
                      scope="col"
                      class="text-left py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400 whitespace-nowrap"
                    >
                      撃墜順
                    </th>
                    <th
                      scope="col"
                      class="text-left py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400"
                    >
                      対象
                    </th>
                    <th
                      scope="col"
                      class="text-right py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400"
                    >
                      <span class="flex items-center justify-end whitespace-nowrap">
                        <span class="lg:hidden">残コスト</span>
                        <span class="hidden lg:inline">チーム残コスト</span>
                        <InfoIcon tooltip="チーム全体の残りコスト（6000から開始、A/B共有）。0以下で敗北。" />
                      </span>
                    </th>
                    <th
                      scope="col"
                      class="text-right py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400"
                    >
                      <span class="flex items-center justify-end whitespace-nowrap">
                        <span class="lg:hidden">耐久</span>
                        <span class="hidden lg:inline">リスポーン耐久</span>
                        <InfoIcon
                          tooltip="撃墜後のリスポーン時の耐久値。コストオーバー時はフル耐久からの減少量と減少割合を併記。"
                          align="right"
                        />
                      </span>
                    </th>
                    <th
                      scope="col"
                      class="text-center py-2 px-1 sm:px-2 text-slate-600 dark:text-slate-400"
                    >
                      <span class="flex items-center justify-center">
                        状態
                        <InfoIcon
                          tooltip="✓=通常 ⚠️=コストオーバー 🔄=復活あり 💥=敗北"
                          align="right"
                        />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pattern.transitions.map((trans) => (
                    <tr
                      key={trans.killCount}
                      aria-label={`ステップ${trans.killCount}: ${trans.killedUnit}機撃墜${trans.isDefeat ? ' - 敗北' : trans.isPartialRevival ? ' - 復活あり' : trans.isOverCost ? ' - コストオーバー' : ''}`}
                      class={`border-b border-slate-200 dark:border-slate-700 ${
                        trans.isDefeat
                          ? 'bg-red-100 dark:bg-red-900/40'
                          : trans.isPartialRevival
                            ? 'bg-purple-50 dark:bg-purple-900/20'
                            : trans.isOverCost
                              ? 'bg-yellow-50 dark:bg-yellow-900/20'
                              : ''
                      }`}
                    >
                      <td class="py-2 px-1 sm:px-2 text-slate-700 dark:text-slate-300">
                        {trans.killCount}
                      </td>
                      <td class="py-2 px-1 sm:px-2">
                        <span
                          class={`font-semibold ${
                            trans.killedUnit === 'A'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {trans.killedUnit}
                        </span>
                      </td>
                      <td class="py-2 px-1 sm:px-2">
                        <div class="flex flex-col gap-1">
                          <div class="text-right font-mono text-slate-700 dark:text-slate-300">
                            {trans.remainingCost}
                          </div>
                          <div
                            class="bg-slate-200 dark:bg-slate-700 rounded-full h-2 sm:h-3 overflow-hidden"
                            role="img"
                            aria-label={`残コスト ${trans.remainingCost}: ${
                              trans.remainingCost <= minCost && trans.remainingCost > 0
                                ? 'EXオーバーリミット発動可能'
                                : trans.remainingCost <= 3000 && trans.remainingCost > 0
                                  ? '注意'
                                  : trans.isOverCost
                                    ? 'コストオーバー'
                                    : '通常'
                            }`}
                          >
                            <div
                              class={`h-full transition-all ${
                                trans.remainingCost <= minCost && trans.remainingCost > 0
                                  ? 'bg-red-500'
                                  : trans.remainingCost <= 3000 && trans.remainingCost > 0
                                    ? 'bg-orange-500'
                                    : trans.isOverCost
                                      ? 'bg-yellow-500'
                                      : 'bg-blue-500'
                              }`}
                              style={`width: ${Math.max(0, (trans.remainingCost / 6000) * 100)}%`}
                            />
                          </div>
                        </div>
                      </td>
                      <td class="py-2 px-1 sm:px-2 text-right text-slate-700 dark:text-slate-300">
                        {trans.isDefeat ? (
                          <span class="text-red-600 dark:text-red-400 font-mono">-</span>
                        ) : (
                          <div class="flex flex-col items-end">
                            <span class="font-mono">{trans.respawnHealth}</span>
                            {trans.isOverCost &&
                              (() => {
                                const fullHealth =
                                  trans.killedUnit === 'A'
                                    ? (formation.unitA?.health ?? 0)
                                    : (formation.unitB?.health ?? 0);
                                const reduction = fullHealth - trans.respawnHealth;
                                const reductionPercent = Math.floor((reduction / fullHealth) * 100);
                                return (
                                  <span class="text-xs sm:text-sm text-red-500 dark:text-red-400">
                                    (-{reduction} / -{reductionPercent}%)
                                  </span>
                                );
                              })()}
                          </div>
                        )}
                      </td>
                      <td class="py-2 px-1 sm:px-2 text-center whitespace-nowrap">
                        {trans.isDefeat ? (
                          <span class="text-red-600 dark:text-red-400 font-semibold">
                            💥 <span class="hidden sm:inline">敗北</span>
                          </span>
                        ) : trans.isPartialRevival ? (
                          <span class="text-purple-600 dark:text-purple-400 font-semibold">
                            🔄 <span class="hidden sm:inline">復活あり</span>
                          </span>
                        ) : trans.isOverCost ? (
                          <span class="text-yellow-600 dark:text-yellow-400 font-semibold">
                            ⚠️ <span class="hidden sm:inline">コストオーバー</span>
                          </span>
                        ) : (
                          <span class="text-green-600 dark:text-green-400">✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
