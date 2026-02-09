/**
 * チュートリアルオーバーレイコンポーネント
 * ステップバイステップのガイドをオーバーレイ表示する
 */

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { TutorialStep } from '../lib/useTutorial';
import { TUTORIAL_STEPS } from '../lib/useTutorial';
import {
  calculateTooltipPosition,
  calculateHighlightStyle,
  getStepLabel,
} from './tutorialOverlayUtils';
import type { ElementRect } from './tutorialOverlayUtils';

type TutorialOverlayProps = {
  /** 現在のステップインデックス（0始まり） */
  currentStep: number;
  /** 現在のステップ定義 */
  stepInfo: TutorialStep | null;
  /** 次のステップへ進むコールバック */
  onNext: () => void;
  /** スキップコールバック */
  onSkip: () => void;
  /** チュートリアルがアクティブかどうか */
  isActive: boolean;
};

/** 対象要素を検索して矩形情報を取得 */
const findTargetElement = (selector: string): { element: Element; rect: ElementRect } | null => {
  // カンマ区切りのセレクタ対応（複数候補）
  const selectors = selector.split(',').map((s) => s.trim());
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const domRect = el.getBoundingClientRect();
      return {
        element: el,
        rect: {
          top: domRect.top,
          left: domRect.left,
          width: domRect.width,
          height: domRect.height,
          bottom: domRect.bottom,
        },
      };
    }
  }
  return null;
};

export const TutorialOverlay = ({
  currentStep,
  stepInfo,
  onNext,
  onSkip,
  isActive,
}: TutorialOverlayProps) => {
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(150);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const totalSteps = TUTORIAL_STEPS.length;

  /** 対象要素の位置を更新 */
  const updateTargetPosition = useCallback(() => {
    if (!stepInfo) {
      setTargetRect(null);
      return;
    }

    const result = findTargetElement(stepInfo.targetSelector);
    if (result) {
      setTargetRect(result.rect);
      // 対象要素が画面内に見えるようスクロール
      result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [stepInfo]);

  // ステップ変更時に対象要素の位置を更新
  useEffect(() => {
    if (!isActive || !stepInfo) return;

    // 少し遅延させてDOM更新を待つ
    const timer = setTimeout(() => {
      updateTargetPosition();
    }, 100);

    return () => clearTimeout(timer);
  }, [isActive, stepInfo, updateTargetPosition]);

  // ツールチップの高さを測定
  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipHeight(tooltipRef.current.offsetHeight);
    }
  }, [currentStep, isActive]);

  // リサイズ・スクロール時に位置を再計算
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => updateTargetPosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isActive, updateTargetPosition]);

  if (!isActive || !stepInfo) return null;

  const highlightStyle = calculateHighlightStyle(targetRect);
  const tooltipPos = calculateTooltipPosition(
    targetRect,
    tooltipHeight,
    window.innerHeight,
    window.innerWidth,
  );

  const isLastStep = currentStep >= totalSteps - 1;

  return (
    <div
      data-testid="tutorial-overlay"
      class="fixed inset-0 z-[9999]"
      style={{ pointerEvents: 'auto' }}
    >
      {/* 暗いオーバーレイ（SVGで切り抜き） */}
      <svg class="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* ハイライト枠 */}
      {targetRect && (
        <div
          data-testid="tutorial-highlight"
          class="absolute rounded-lg border-2 border-blue-400 dark:border-blue-300 transition-all duration-300"
          style={{
            ...highlightStyle,
            pointerEvents: 'none',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
          }}
        />
      )}

      {/* ツールチップ */}
      <div
        ref={tooltipRef}
        data-testid="tutorial-tooltip"
        class={`absolute z-[10000] w-[calc(100%-2rem)] sm:w-80 mx-4 sm:mx-0 transition-all duration-300 ${
          tooltipPos.placement === 'center' ? 'left-1/2 -translate-x-1/2' : ''
        }`}
        style={{
          top: `${tooltipPos.top}px`,
          ...(tooltipPos.placement !== 'center' && targetRect
            ? {
                left: `${Math.max(16, Math.min(targetRect.left, window.innerWidth - 336))}px`,
              }
            : {}),
        }}
      >
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-600 p-4">
          {/* ステップ番号とタイトル */}
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              {getStepLabel(currentStep, totalSteps)}
            </span>
            <button
              type="button"
              data-testid="tutorial-skip-button"
              onClick={onSkip}
              class="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              スキップ
            </button>
          </div>

          {/* タイトル */}
          <h4 class="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            {stepInfo.title}
          </h4>

          {/* 説明文 */}
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            {stepInfo.description}
          </p>

          {/* ナビゲーションボタン */}
          <div class="flex justify-end gap-2">
            <button
              type="button"
              data-testid="tutorial-next-button"
              onClick={onNext}
              class="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
            >
              {isLastStep ? '完了' : '次へ'}
            </button>
          </div>
        </div>
      </div>

      {/* クリックでオーバーレイを閉じない（ツールチップ外のクリックを無効化） */}
      <div
        class="absolute inset-0"
        style={{ pointerEvents: 'auto', zIndex: -1 }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
