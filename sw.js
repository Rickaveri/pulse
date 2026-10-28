const CACHE_NAME = 'pulse-pwa-v37';
const SUPABASE_URL = 'https://tdvpxxpnyinjzirizxea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uiEi-rt3J7ZCeGKrskZy2w_FVoVMNPV';

const ASSETS = [
  './',
  './index.html',
  './styles.css?v=37',
  './config.js?v=37',
  './app.js?v=37',
  './enhancements.js?v=37',
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

// Обработчик системного будильника Apple APNs / Google FCM при ПОЛНОСТЬЮ ЗАКРЫТОМ приложении
self.addEventListener('push', (event) => {
  const handlePushWake = async () => {
    let title = 'Pulse';
    let body = 'У вас новое сообщение 💬';
    let roomId = null;
    let gotPayload = false;

    if (event.data) {
      try {
        const txt = event.data.text();
        if (txt) {
          try {
            const parsed = JSON.parse(txt);
            if (parsed && (parsed.title || parsed.body)) {
              title = parsed.title || title;
              body = parsed.body || body;
              roomId = parsed.roomId || null;
              gotPayload = true;
            }
          } catch (e) {
            body = txt;
            gotPayload = true;
          }
        }
      } catch (e) {}
    }

    // Если пришёл пустой сигнал-будильник от APNs, подтягиваем имя отправителя напрямую из Supabase
    if (!gotPayload) {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/messages?select=sender_name,media_type,room_id&order=created_at.desc&limit=1`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows[0]) {
            title = rows[0].sender_name || 'Новое сообщение';
            roomId = rows[0].room_id || null;
            body = rows[0].media_type === 'image'
              ? '📷 Прислал(а) фотографию'
              : rows[0].media_type === 'audio'
              ? '🎤 Голосовое сообщение'
              : '💬 Прислал(а) вам новое сообщение';
          }
        }
      } catch (e) {}
    }

    const isIncomingCall = body.includes('Входящий аудиозвонок') || body.includes('Входящий видеозвонок');
    const notifOpts = {
      body,
      tag: isIncomingCall ? 'pulse-incoming-call' : `pulse-push-${Date.now()}`,
      renotify: true,
      requireInteraction: isIncomingCall,
      vibrate: isIncomingCall ? [300, 150, 300, 150, 300] : [220, 100, 220],
      data: { roomId, isCall: isIncomingCall }
    };
    if (isIncomingCall) {
      notifOpts.actions = [
        { action: 'accept_call', title: '📞 Ответить' },
        { action: 'decline_call', title: '✕ Отклонить' }
      ];
    }
    await self.registration.showNotification(title, notifOpts);
  };

  event.waitUntil(handlePushWake());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetRoomId = event.notification.data && event.notification.data.roomId;
  const isCall = Boolean(event.notification.data && event.notification.data.isCall);
  const act = event.action || (isCall ? 'accept_call' : '');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'OPEN_ROOM',
            roomId: targetRoomId || null,
            callAction: act
          });
          return;
        }
      }
      if (self.clients.openWindow) {
        const q = targetRoomId ? `?roomId=${encodeURIComponent(targetRoomId)}&callAction=${encodeURIComponent(act)}` : '';
        return self.clients.openWindow(`./index.html${q}`);
      }
    })
  );
});
