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
  // フレイキーテスト対策: ローカル1回、CI2回リトライ
  retries: process.env.CI ? 2 : 1,
  // ワーカー数: ローカルは自動（CPU数に応じて並列）、CIは50%
  workers: process.env.CI ? '50%' : undefined,

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

    // 並列実行時の安定性向上
    actionTimeout: 10000,

    // Cookie同意バナーを非表示にする（E2Eテスト対象外）
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:4321',
          localStorage: [{ name: 'exvs2-cookie-consent', value: 'denied' }],
        },
      ],
    },
  },

  // expectのタイムアウト（デフォルト5000ms→10000ms）
  expect: {
    timeout: 10000,
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
    url: 'http://localhost:4321/works/exvs2-cost-calculator/',
    reuseExistingServer: !process.env.CI,
  },
});
