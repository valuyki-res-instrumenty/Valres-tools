/* Сервисный работник: офлайн-кэш для калькулятора ВЛ-10 кВ */
const CACHE_NAME = "res-instrumenty-v1";
const ASSETS = [
  "vl-10-sag-calculator.html",
  "index.html",
  "manifest.json"
];

/* При первом открытии сохраняем страницу в кэш телефона */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* Запросы: сначала из кэша, при отсутствии — из сети */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          /* вышли в сеть — тихо обновляем кэш свежей версией */
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

/* Удаление старых версий кэша */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
