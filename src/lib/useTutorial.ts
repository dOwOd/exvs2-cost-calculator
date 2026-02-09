/**
 * チュートリアル状態管理フック
 * 初回アクセス時にステップバイステップのガイドを表示する
 */

import { useState, useCallback, useEffect } from 'preact/hooks';

/** チュートリアルの1ステップ */
export type TutorialStep = {
  /** 対象要素のCSSセレクタ（data-testidベース） */
  targetSelector: string;
  /** ステップのタイトル */
  title: string;
  /** ステップの説明文 */
  description: string;
  /** DOM要素が存在しない場合にスキップ可能か */
  optional?: boolean;
};

/** LocalStorageキー */
export const TUTORIAL_STORAGE_KEY = 'exvs2-tutorial-completed';

/** チュートリアルステップ定義 */
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetSelector: '[data-testid="search-toggle-a"]',
    title: '機体Aを検索',
    description: '機体名で検索して、A機を選択できます。ボタンをタップして検索を開きましょう。',
  },
  {
    targetSelector: '[data-testid="cost-button-a-3000"], [data-testid="cost-button-a-2500"], [data-testid="cost-button-a-2000"], [data-testid="cost-button-a-1500"]',
    title: '機体Aのコスト選択',
    description: 'A機のコスト（1500/2000/2500/3000）を選択します。機体検索で選んだ場合は自動設定されます。',
  },
  {
    targetSelector: '[data-testid="health-selector-button-a"]',
    title: '機体Aの耐久値選択',
    description: 'A機の耐久値を選択します。コスト選択後に表示されます。',
    optional: true,
  },
  {
    targetSelector: '[data-testid="search-toggle-b"]',
    title: '機体Bを検索',
    description: '同様にB機を検索・選択します。',
  },
  {
    targetSelector: '[data-testid="cost-button-b-3000"], [data-testid="cost-button-b-2500"], [data-testid="cost-button-b-2000"], [data-testid="cost-button-b-1500"]',
    title: '機体Bのコスト選択',
    description: 'B機のコストを選択します。',
  },
  {
    targetSelector: '[data-testid="health-selector-button-b"]',
    title: '機体Bの耐久値選択',
    description: 'B機の耐久値を選択します。コスト選択後に表示されます。',
    optional: true,
  },
  {
    targetSelector: '[data-testid="formation-guidance"]',
    title: '結果を確認',
    description: '両機の編成が完了すると、撃墜順パターンごとの総耐久やコスト推移が表示されます。',
  },
];

/** localStorage からチュートリアル完了済みかどうかを取得 */
export const isTutorialCompleted = (): boolean => {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

/** localStorage にチュートリアル完了フラグを保存 */
export const setTutorialCompleted = (): void => {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
  } catch {
    // LocalStorage容量不足等のエラーは無視
  }
};

/** localStorage からチュートリアル完了フラグを削除 */
export const resetTutorialCompleted = (): void => {
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch {
    // エラーは無視
  }
};

/** useTutorial の戻り値型 */
export type UseTutorialReturn = {
  /** 現在のステップインデックス（0始まり） */
  currentStep: number;
  /** チュートリアルがアクティブかどうか */
  isActive: boolean;
  /** 現在のステップ定義 */
  currentStepData: TutorialStep | null;
  /** チュートリアルを開始 */
  start: () => void;
  /** 次のステップへ進む */
  next: () => void;
  /** チュートリアルをスキップ（完了扱い） */
  skip: () => void;
  /** チュートリアルをリセット（初回表示状態に戻す） */
  reset: () => void;
};

/**
 * チュートリアル状態管理フック
 * 初回アクセス時に自動でチュートリアルを開始する
 */
export const useTutorial = (): UseTutorialReturn => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // 初回アクセス時にチュートリアルを自動開始
  useEffect(() => {
    if (!isTutorialCompleted()) {
      setIsActive(true);
    }
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep >= TUTORIAL_STEPS.length) {
      setIsActive(false);
      setTutorialCompleted();
    } else {
      setCurrentStep(nextStep);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    setIsActive(false);
    setTutorialCompleted();
  }, []);

  const reset = useCallback(() => {
    resetTutorialCompleted();
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const currentStepData = isActive ? TUTORIAL_STEPS[currentStep] ?? null : null;

  return {
    currentStep,
    isActive,
    currentStepData,
    start,
    next,
    skip,
    reset,
  };
};
