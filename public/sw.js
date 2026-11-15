const CACHE = 'emotional-damage-shell-v15';
const SHELL = [
  '/',
  '/index.html',
  '/boot.js',
  '/style.css',
  '/app.js',
  '/model.js',
  '/translations.js',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];
const NETWORK_TIMEOUT_MS = 2000;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('emotional-damage-shell-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const path = url.pathname;
  if (!SHELL.includes(path)) return;
  event.respondWith(networkOrCache(event.request, path));
});

async function networkOrCache(request, path) {
  const controller = new AbortController();
  const network = fetch(request, { signal: controller.signal });
  const cached = caches.match(path, { cacheName: CACHE }).catch(() => undefined);
  let timer;
  try {
    const response = await Promise.race([
      network,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT_MS);
      }),
    ]);
    return response.ok ? response : ((await cached) ?? response);
  } catch {
    const fallback = await cached;
    if (fallback) {
      controller.abort();
      return fallback;
    }
    // With no cached copy, a slow first request must still be allowed to finish.
    return await network;
  } finally {
    clearTimeout(timer);
  }
}
