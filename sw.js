const CACHE_NAME = 'pulse-pwa-v25';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=25',
  './config.js?v=25',
  './app.js?v=25',
  './enhancements.js?v=25',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification(data.title || 'Новое сообщение в Pulse', {
        body: data.body || 'Откройте приложение, чтобы прочитать',
        tag: `pulse-msg-${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        data: { roomId: data.roomId || null }
      })
    );
  }
});

// Системный обработчик APNs / FCM Web Push, который будит телефон даже при полностью закрытом приложении!
self.addEventListener('push', (event) => {
  let payload = { title: 'Новое сообщение в Pulse', body: 'Откройте мессенджер, чтобы прочитать', roomId: null };
  try {
    if (event.data) {
      const txt = event.data.text();
      try {
        payload = Object.assign(payload, JSON.parse(txt));
      } catch (e) {
        if (txt) payload.body = txt;
      }
    }
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Pulse', {
      body: payload.body || 'Новое сообщение',
      tag: `pulse-push-${Date.now()}`,
      renotify: true,
      vibrate: [220, 100, 220],
      data: { roomId: payload.roomId || null }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetRoomId = event.notification.data && event.notification.data.roomId;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (targetRoomId) {
            client.postMessage({ type: 'OPEN_ROOM', roomId: targetRoomId });
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./index.html');
      }
    })
  );
});
