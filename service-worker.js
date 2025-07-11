const CACHE_NAME = 'tetris-offline-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // Agrega aquí otros recursos si los añades (CSS, JS, imágenes)
];

// Instalación y caching de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Estrategia Cache-First con actualización en segundo plano
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes GET del mismo origen
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Intentar obtener de red primero
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Actualizar caché
            return caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => cachedResponse); // Fallback a caché si hay error

        return cachedResponse || fetchPromise;
      })
  );
});

// Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
