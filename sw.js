// Service Worker for Mango Paradise — offline support
const CACHE_NAME = 'mango-paradise-v3';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/utils.js', './js/audio.js', './js/storage.js', './js/particles.js',
  './js/levels.js', './js/achievements.js', './js/collection.js', './js/estate.js',
  './js/boss.js', './js/story.js', './js/daily.js', './js/game.js',
  './js/ui.js', './js/tutorial.js', './js/main.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first: always try fresh, fallback to cache
  e.respondWith(
    fetch(e.request).then(response => {
      // Update cache with fresh response
      const clone = response.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
