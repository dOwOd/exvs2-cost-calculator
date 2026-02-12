/**
 * SNSシェアボタン共通コンポーネント
 */

import { useState, useEffect } from 'preact/hooks';

type ShareButtonsProps = {
  url: string;
  text: string;
  hashtags?: string[];
};

/** Web Share API（URLシェア）のサポート判定 */
const canShareUrl = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return !!navigator.share;
};

/** 新しいウィンドウでURLを開く */
const openShareWindow = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
};

export const ShareButtons = ({ url, text, hashtags = [] }: ShareButtonsProps) => {
  const [supportsWebShare, setSupportsWebShare] = useState(false);

  useEffect(() => {
    setSupportsWebShare(canShareUrl());
  }, []);

  const handleTwitterShare = () => {
    const params = new URLSearchParams({
      text,
      url,
    });
    if (hashtags.length > 0) {
      params.set('hashtags', hashtags.join(','));
    }
    openShareWindow(`https://twitter.com/intent/tweet?${params.toString()}`);
  };

  const handleLineShare = () => {
    const shareText = `${text} ${url}`;
    openShareWindow(`https://line.me/R/share?text=${encodeURIComponent(shareText)}`);
  };

  const handleWebShare = async () => {
    try {
      await navigator.share({ title: text, url });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('共有に失敗しました:', error);
      }
    }
  };

  return (
    <div class="flex items-center gap-2">
      {/* Twitter/X */}
      <button
        type="button"
        onClick={handleTwitterShare}
        aria-label="Xでシェア"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors text-sm"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span class="hidden sm:inline">X</span>
      </button>

      {/* LINE */}
      <button
        type="button"
        onClick={handleLineShare}
        aria-label="LINEでシェア"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors text-sm"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
        <span class="hidden sm:inline">LINE</span>
      </button>

      {/* Web Share API */}
      {supportsWebShare && (
        <button
          type="button"
          onClick={handleWebShare}
          aria-label="シェアする"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span class="hidden sm:inline">共有</span>
        </button>
      )}
    </div>
  );
};
