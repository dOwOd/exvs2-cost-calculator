/**
 * エラーバウンダリコンポーネント（Preact class component）
 * getDerivedStateFromError は class component でのみ使用可能
 */

import { Component } from 'preact';
import type { ComponentChildren } from 'preact';

type ErrorBoundaryProps = {
  children: ComponentChildren;
  fallbackMessage?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('[ErrorBoundary]', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6"
        >
          <p class="text-sm text-red-700 dark:text-red-400 mb-3">
            {this.props.fallbackMessage ?? 'エラーが発生しました'}
          </p>
          <button
            onClick={this.handleReload}
            class="text-sm px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
          >
            ページを再読み込み
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
