import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // 並列実行の設定
  fullyParallel: true,

  // CI環境での設定
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // LocalStorage競合を避けるため、常にシングルワーカーで実行
  workers: 1,

  // レポーター設定
  reporter: 'html',

  // 共通設定
  use: {
    // ベースURL（開発サーバー起動時）
    baseURL: 'http://localhost:4321',

    // トレース設定（失敗時のみ）
    trace: 'on-first-retry',

    // スクリーンショット設定（失敗時のみ）
    screenshot: 'only-on-failure',

    // ビデオ設定（失敗時のみ）
    video: 'retain-on-failure',
  },

  // テスト対象ブラウザ
  projects: [
    // デスクトップブラウザ
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // モバイルデバイス（デスクトップ専用テストを除外）
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testIgnore: ['**/*.desktop.spec.ts'],
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testIgnore: ['**/*.desktop.spec.ts'],
    },

    // タブレット（デスクトップ専用テストを除外）
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
      testIgnore: ['**/*.desktop.spec.ts'],
    },
  ],

  // 開発サーバーの自動起動
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
