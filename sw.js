const CACHE_NAME = 'pulse-pwa-v61';
const SUPABASE_URL = 'https://tdvpxxpnyinjzirizxea.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uiEi-rt3J7ZCeGKrskZy2w_FVoVMNPV';
const VAPID_PUBLIC_B64U = 'BNx408mM4zlTTpxhdNA04JuZ7Ajn_Av9KylLpdioUucSkA6qn_aObq6osNkyamzIRi6FwdLZeTbh0yV65gqmb5Y';

const ASSETS = [
  './',
  './index.html',
  './styles.css?v=61',
  './config.js?v=61',
  './supabase-local.js?v=61',
  './app.js?v=61',
  './enhancements.js?v=61',
  './manifest.json'
];

let lastPushNotifSignature = '';
let lastPushNotifTime = 0;

// Кэшируем каждый файл по отдельности (чтобы сбой одного файла при деплое GitHub Pages никогда не оставлял кэш пустым!) (v58)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS.map((url) =>
          fetch(url, { cache: 'reload' }).then((res) => {
            if (res && res.ok) return cache.put(url, res);
          })
        )
      );
    }).catch(() => {})
  );
  self.skipWaiting();
});

const MEDIA_CACHE_NAME = 'pulse-media-cache-v1';

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (newCache) => {
      const newKeys = await newCache.keys();
      // Удаляем старые кэши только если новый кэш успешно заполнен!
      if (newKeys.length >= 4) {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== MEDIA_CACHE_NAME)
            .map((k) => caches.delete(k))
        );
      }
    }).catch(() => {})
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = event.request.url || '';

  // 1) Постоянный локальный кэш на телефоне для фото, голосовых и кружочков
  if (reqUrl.includes('/storage/v1/object/public/chat-media/') && !reqUrl.includes('/auth_idx/')) {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then(async (mediaCache) => {
        const cachedResp = await mediaCache.match(event.request);
        if (cachedResp) return cachedResp;
        const netResp = await fetch(event.request);
        if (netResp && netResp.ok) {
          mediaCache.put(event.request, netResp.clone()).catch(() => {});
        }
        return netResp;
      }).catch(() => fetch(event.request))
    );
    return;
  }

  // 2) Запросы к API базы данных (supabase.co/rest, supabase.co/auth, workers.dev) НЕ перехватываем кэшем статики!
  if (
    reqUrl.includes('.supabase.co/') ||
    reqUrl.includes('.workers.dev/') ||
    reqUrl.includes('api.qrserver.com/')
  ) {
    return;
  }

  // 3) Для файлов самого приложения (HTML, CSS, JS) на мобильном интернете / eSIM:
  // Ищем и по точному URL, и без query-параметров (?v=...), чтобы приложение открывалось за 0.01 сек даже без сети! (v58)
  event.respondWith(
    (async () => {
      let cached = await caches.match(event.request, { ignoreSearch: false });
      if (!cached) {
        cached = await caches.match(event.request, { ignoreSearch: true });
      }

      const fetchAndUpdate = fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          }
          return res;
        });

      if (cached) {
        fetchAndUpdate.catch(() => {});
        return cached;
      }

      try {
        return await fetchAndUpdate;
      } catch (e) {
        const fallback = (await caches.match('./index.html', { ignoreSearch: true })) || (await caches.match('./', { ignoreSearch: true }));
        return fallback || Response.error();
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Если приложение сейчас открыто на экране — не дублируем системным баннером
        const isAppVisible = clientList.some((c) => c.visibilityState === 'visible' || c.focused);
        if (isAppVisible) return;

        const title = data.title || 'Новое сообщение в Pulse';
        const body = data.body || 'Откройте приложение, чтобы прочитать';
        const roomId = data.roomId || null;
        const sig = `${roomId || ''}|${title}|${body}`;
        const now = Date.now();
        if (sig === lastPushNotifSignature && (now - lastPushNotifTime) < 3500) return;
        lastPushNotifSignature = sig;
        lastPushNotifTime = now;

        return self.registration.showNotification(title, {
          body,
          tag: roomId ? `pulse-room-${roomId}` : 'pulse-msg',
          renotify: true,
          vibrate: [200, 100, 200],
          data: { roomId }
        });
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

    const isIncomingCall = body.includes('Входящий аудиозвонок') || body.includes('Входящий видеозвонок');

    // Проверяем: если приложение сейчас открыто и активно на экране телефона, НЕ показываем системный пуш поверх чата!
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const hasVisibleClient = clientList.some((c) => c.visibilityState === 'visible' || c.focused);
    if (hasVisibleClient && !isIncomingCall) {
      return;
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

    // Защита от двойных уведомлений за одно и то же сообщение
    const sig = `${roomId || ''}|${title}|${body}`;
    const now = Date.now();
    if (!isIncomingCall && sig === lastPushNotifSignature && (now - lastPushNotifTime) < 3500) {
      return;
    }
    lastPushNotifSignature = sig;
    lastPushNotifTime = now;

    const notifOpts = {
      body,
      tag: isIncomingCall ? 'pulse-incoming-call' : (roomId ? `pulse-room-${roomId}` : 'pulse-push'),
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

// Автопродление пуш-подписки в фоне, если Apple APNs / Google FCM ротировал токен спустя сутки (v54)
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const padding = '='.repeat((4 - (VAPID_PUBLIC_B64U.length % 4)) % 4);
        const b64 = (VAPID_PUBLIC_B64U + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(b64);
        const keyBytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) keyBytes[i] = raw.charCodeAt(i);
        const newSub = await self.registration.pushManager.subscribe(
          event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true, applicationServerKey: keyBytes }
        );
        const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientList.forEach((c) => c.postMessage({ type: 'PUSH_SUB_RENEWED', sub: newSub ? newSub.toJSON() : null }));
      } catch (e) {}
    })()
  );
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
