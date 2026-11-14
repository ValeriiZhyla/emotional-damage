const CACHE = 'emotional-damage-shell-v9';
const SHELL = ['/', '/index.html', '/style.css', '/app.js', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('emotional-damage-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const path = event.request.mode === 'navigate' && url.pathname === '/' ? '/' : url.pathname;
  if (!SHELL.includes(path)) return;
  // Online visits get current files; a complete cached shell is the offline fallback.
  // Do not cache unrelated paths or any user data. Bump CACHE when shell files change.
  event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(path))));
});
