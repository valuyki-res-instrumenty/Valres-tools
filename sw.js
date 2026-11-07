// Валрес-инструменты — сервисный скрипт PWA
// Версия 4: добавлены калькуляторы стрел провеса СИП-2 и СИП-4
const CACHE_NAME = 'valuyki-instruments-v4';

const ASSETS = [
  './',
  './index.html',
  './sip2_calc_mobile.html',
  './sip4_calc_mobile.html',
  './vl-10-sag-calculator.html',
  './sag-04kv.html',
  './kz-04kv.html',
  './manifest.json'
];

// Установка: сохраняем все страницы сайта
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Активация: удаляем старые версии кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Запросы: сначала кэш, параллельно тихо обновляем из сети
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
