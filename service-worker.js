// service-worker.js
const CACHE_NAME = 'tetris-offline-v3';
const ASSETS = [
  './',                  // Raíz del sitio
  './index.html',        // Archivo principal
  './manifest.json',     // Config PWA
  // './icon-192.png',   // Descomenta si añades íconos
  // './icon-512.png'
];

// ----- Instalación -----
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())  // Activa el SW inmediatamente
  );
});

// ----- Estrategia: Cache-First -----
self.addEventListener('fetch', (event) => {
  // Ignora solicitudes externas o no-GET
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Devuelve caché o busca en red
        return cachedResponse || fetch(event.request)
          .then(response => {
            // Opcional: Cachear nuevas respuestas
            return caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, response.clone());
                return response;
              });
          });
      })
  );
});

// ----- Limpieza de cachés viejas -----
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de la página
  );
});
