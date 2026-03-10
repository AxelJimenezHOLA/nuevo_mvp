const CACHE_VERSION = "v2";
const CACHE_NAME = `article-app-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/db.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// INSTALL → cachea el App Shell
self.addEventListener("install", (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(APP_SHELL);
      })
  );
});

// ACTIVATE → limpia caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH → estrategia Offline-First
self.addEventListener("fetch", (event) => {

  // Solo manejamos GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      // Si está en cache → devolver
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en cache → intentar red
      return fetch(event.request)
        .then((networkResponse) => {

          // Guardar en cache dinámico
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });

        })
        .catch(() => {
          // Si falla red y no hay cache
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});