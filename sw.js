// Service Worker for Mango Paradise — offline support
const CACHE_NAME = 'mango-paradise-v2';
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
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
