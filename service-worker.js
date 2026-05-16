const CACHE_NAME = 'info-system-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // ยกเว้นการทำ Cache สำหรับรูปภาพจากแหล่งอื่นหรือ API ป้องกันบั๊ก
  if (event.request.url.startsWith('chrome-extension') || event.request.url.includes('extension')) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ถ้าเจอไฟล์ใน Cache ให้เอามาใช้เลย (ทำให้เปิดตอนออฟไลน์ได้)
        if (response) {
          return response;
        }
        
        // ถ้าไม่เจอ ให้ไปดึงจากอินเทอร์เน็ต
        return fetch(event.request).then(
          function(response) {
            // เช็คว่า response ถูกต้องไหม
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // ถ้าถูกต้อง นำไปจำไว้ใน Cache สำหรับการใช้งานครั้งหน้า
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

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
  self.clients.claim();
});
