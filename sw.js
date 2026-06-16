const CACHE_NAME = 'discipuladores-v1';
const ASSETS = [
  '/Portal-Discipulador/',
  '/Portal-Discipulador/index.html',
  '/Portal-Discipulador/manifest.json',
  '/Portal-Discipulador/icon-192.png',
  '/Portal-Discipulador/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase e fontes externas: sempre busca na rede
  if (
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('firebase') ||
    e.request.url.includes('fonts.googleapis.com') ||
    e.request.url.includes('fonts.gstatic.com') ||
    e.request.url.includes('gstatic.com')
  ) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Assets do app: cache primeiro, rede como fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      });
    })
  );
});
