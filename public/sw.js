// Service Worker for EXVS2 Cost Calculator
// Version: 1.0.0

const CACHE_NAME = 'exvs2-calculator-v2';

// キャッシュするリソース（静的ファイル）
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-180x180.png',
  '/icons/maskable-icon-512x512.png',
];

// インストール時: 静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  // 新しいService Workerをすぐにアクティブ化
  self.skipWaiting();
});

// アクティブ化時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      );
    }),
  );
  // すべてのクライアントを制御
  self.clients.claim();
});

// Fetchイベント: キャッシュ戦略を適用
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }

  // HTMLリクエスト: Network First
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静的アセット（JS/CSS/画像）: Stale-While-Revalidate
  // キャッシュから即座に返しつつ、バックグラウンドで最新を取得
  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // その他: Network First
  event.respondWith(networkFirst(request));
});

// Network First戦略
const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    // 成功したらキャッシュを更新
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // ネットワーク失敗時はキャッシュから取得
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // キャッシュもない場合はオフラインページを返す（または404）
    throw error;
  }
};

// Stale-While-Revalidate戦略
// キャッシュから即座に返し、バックグラウンドで最新を取得してキャッシュを更新
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // バックグラウンドでネットワークから取得してキャッシュを更新
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // キャッシュがあれば即座に返す、なければネットワークを待つ
  return cached || fetchPromise;
};

// 静的アセットかどうかを判定
const isStaticAsset = (pathname) => {
  // Astroのビルド出力（ハッシュ付きファイル）
  if (pathname.startsWith('/_astro/')) {
    return true;
  }
  // アイコン
  if (pathname.startsWith('/icons/')) {
    return true;
  }
  // その他の静的ファイル
  const staticExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
};
