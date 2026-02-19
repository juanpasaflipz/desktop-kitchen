const CACHE_NAME = 'juanbertos-pos-v2';
const API_CACHE_NAME = 'juanbertos-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// GET API endpoints eligible for stale-while-revalidate caching
const CACHEABLE_API_PATTERNS = [
  '/api/menu/categories',
  '/api/menu/items',
  '/api/menu/items/popular',
  '/api/menu/categories/suggested-order',
  '/api/modifiers/items-with-modifiers',
  '/api/combos',
  '/api/order-templates',
];

function isApiCacheable(url) {
  return CACHEABLE_API_PATTERNS.some((p) => url.pathname.startsWith(p));
}

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET for API (POST/PUT handled by app-level IndexedDB)
  if (url.pathname.startsWith('/api') && request.method !== 'GET') {
    return;
  }

  // GET API requests: stale-while-revalidate for cacheable endpoints
  if (url.pathname.startsWith('/api')) {
    if (isApiCacheable(url)) {
      event.respondWith(staleWhileRevalidate(request));
    } else {
      // Non-cacheable API (health, reports, etc.): network only
      event.respondWith(
        fetch(request).catch(() =>
          new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      );
    }
    return;
  }

  // Static assets: cache-first (JS/CSS have content hashes from Vite)
  event.respondWith(cacheFirst(request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cached = await cache.match(request);

  // Start network fetch in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    // Background revalidate (don't await)
    fetchPromise;
    return cached;
  }

  // No cache — must wait for network
  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;

  return new Response(JSON.stringify({ error: 'Offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // SPA fallback: return index.html for navigation requests
    const fallback = await cache.match('/');
    if (fallback) return fallback;
    return new Response('Offline', { status: 503 });
  }
}
