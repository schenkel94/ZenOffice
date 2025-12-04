const CACHE_NAME = 'zenoffice-master-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './qr.png',
  './profile.png',
  './alarme.mp3',
  './bubble.mp3',
  './foco.mp3',
  './natureza.mp3',
  './lo-fi.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto: Baixando todos os arquivos...');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se existir
        if (response) {
          return response;
        }
        // Se não, busca na rede
        return fetch(event.request);
      })
  );
});

// Remove caches antigos ao atualizar a versão
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
