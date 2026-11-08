// Автономный встроенный клиент Supabase для работы на любых мобильных сетях, eSIM в роуминге и без внешних CDN (v55)
(function () {
  function getProjectRef(supabaseUrl) {
    try {
      const host = new URL(supabaseUrl).hostname;
      return host.split('.')[0] || 'default';
    } catch (e) {
      return 'tdvpxxpnyinjzirizxea';
    }
  }

  function createNativeSupabaseClient(supabaseUrl, supabaseKey) {
    const baseUrl = String(supabaseUrl || '').replace(/\/+$/, '');
    const storageKey = `sb-${getProjectRef(baseUrl)}-auth-token`;
    const authListeners = [];

    function getStoredSession() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.access_token && parsed.user) return parsed;
        if (parsed && parsed.currentSession && parsed.currentSession.access_token) {
          return parsed.currentSession;
        }
        return null;
      } catch (e) {
        return null;
      }
    }

    function saveStoredSession(sess) {
      try {
        if (!sess) {
          localStorage.removeItem(storageKey);
        } else {
          localStorage.setItem(storageKey, JSON.stringify(sess));
        }
      } catch (e) {}
    }

    function notifyAuth(event, session) {
      authListeners.forEach((cb) => {
        try { cb(event, session); } catch (e) {}
      });
    }

    function getHeaders(extra = {}) {
      const sess = getStoredSession();
      const token = (sess && sess.access_token) ? sess.access_token : supabaseKey;
      return Object.assign(
        {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`
        },
        extra
      );
    }

    // Умный fetch для мобильного интернета и eSIM в роуминге: быстрый таймаут + автоматический повтор и резервный релей при подвисании сокета (v58)
    async function smartFetch(url, options = {}) {
      const timeoutMs = options.body instanceof Blob ? 20000 : 6500;
      const attemptDirect = async (ms) => {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const tid = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
        try {
          const res = await fetch(url, Object.assign({}, options, {
            cache: 'no-store',
            signal: ctrl ? ctrl.signal : undefined
          }));
          if (tid) clearTimeout(tid);
          return res;
        } catch (err) {
          if (tid) clearTimeout(tid);
          throw err;
        }
      };

      try {
        return await attemptDirect(timeoutMs);
      } catch (firstErr) {
        // Вторая попытка через новый чистый сокет (помогает при переключении сот LTE/5G в роуминге)
        try {
          return await attemptDirect(timeoutMs);
        } catch (secondErr) {
          // Резервная попытка через Worker-релей, если мобильный оператор режет прямой маршрут к supabase.co
          const cfg = window.MESSENGER_CONFIG || {};
          const relayBase = (cfg.PUSH_WORKER_URL || '').trim();
          if (relayBase && String(url).startsWith(baseUrl)) {
            const relayHeaders = Object.assign({}, options.headers || {}, { 'x-target-url': url });
            return await fetch(`${relayBase}?target=${encodeURIComponent(url)}`, {
              method: options.method || 'GET',
              headers: relayHeaders,
              body: options.body
            });
          }
          throw secondErr;
        }
      }
    }

    async function refreshSessionIfNeeded(sess) {
      if (!sess || !sess.refresh_token) return sess;
      const nowSec = Math.floor(Date.now() / 1000);
      if (sess.expires_at && sess.expires_at - nowSec > 90) {
        return sess;
      }
      try {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const tid = ctrl ? setTimeout(() => ctrl.abort(), 6500) : null;
        const res = await smartFetch(`${baseUrl}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh_token: sess.refresh_token })
        });
        if (tid) clearTimeout(tid);
        if (res.ok) {
          const refreshed = await res.json();
          if (refreshed && refreshed.access_token) {
            if (!refreshed.expires_at && refreshed.expires_in) {
              refreshed.expires_at = Math.floor(Date.now() / 1000) + Number(refreshed.expires_in);
            }
            saveStoredSession(refreshed);
            notifyAuth('TOKEN_REFRESHED', refreshed);
            return refreshed;
          }
        }
      } catch (e) {
        // На медленном мобильном интернете или в роуминге сохраняем существующую сессию, чтобы не выкидывало из аккаунта!
        return sess;
      }
      return sess;
    }

    // Проверка ссылки восстановления пароля (#access_token=...&type=recovery)
    setTimeout(() => {
      try {
        if (window.location.hash && window.location.hash.includes('access_token=')) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token') || '';
          const type = params.get('type') || '';
          if (access_token) {
            fetch(`${baseUrl}/auth/v1/user`, {
              headers: { apikey: supabaseKey, Authorization: `Bearer ${access_token}` }
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((user) => {
                if (user && user.id) {
                  const sess = {
                    access_token,
                    refresh_token,
                    user,
                    expires_at: Math.floor(Date.now() / 1000) + 3600
                  };
                  saveStoredSession(sess);
                  if (type === 'recovery') notifyAuth('PASSWORD_RECOVERY', sess);
                  else notifyAuth('SIGNED_IN', sess);
                }
              })
              .catch(() => {});
          }
        }
      } catch (e) {}
    }, 50);

    const auth = {
      onAuthStateChange(cb) {
        if (typeof cb === 'function') authListeners.push(cb);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async getSession() {
        let sess = getStoredSession();
        if (sess) {
          sess = await refreshSessionIfNeeded(sess);
        }
        return { data: { session: sess }, error: null };
      },
      async signInWithPassword({ email, password }) {
        try {
          const res = await smartFetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: new Error(data.error_description || data.msg || data.message || 'Invalid login credentials') };
          }
          if (!data.expires_at && data.expires_in) {
            data.expires_at = Math.floor(Date.now() / 1000) + Number(data.expires_in);
          }
          saveStoredSession(data);
          notifyAuth('SIGNED_IN', data);
          return { data: { user: data.user, session: data }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async signUp({ email, password, options }) {
        try {
          const res = await smartFetch(`${baseUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              data: (options && options.data) || {}
            })
          });
          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: new Error(data.error_description || data.msg || data.message || 'Ошибка регистрации') };
          }
          const session = data.access_token ? data : null;
          const user = data.user || (data.id ? data : null);
          if (session) {
            if (!session.expires_at && session.expires_in) {
              session.expires_at = Math.floor(Date.now() / 1000) + Number(session.expires_in);
            }
            saveStoredSession(session);
            notifyAuth('SIGNED_IN', session);
          }
          return { data: { user, session }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async signOut() {
        saveStoredSession(null);
        notifyAuth('SIGNED_OUT', null);
        return { error: null };
      },
      async resetPasswordForEmail(email, opts) {
        try {
          const redirectTo = (opts && opts.redirectTo) ? `?redirect_to=${encodeURIComponent(opts.redirectTo)}` : '';
          const res = await smartFetch(`${baseUrl}/auth/v1/recover${redirectTo}`, {
            method: 'POST',
            headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return { data: null, error: new Error(errData.msg || errData.message || 'Ошибка отправки письма') };
          }
          return { data: {}, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async setSession({ access_token, refresh_token }) {
        try {
          const res = await smartFetch(`${baseUrl}/auth/v1/user`, {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${access_token}` }
          });
          const user = await res.json();
          if (!res.ok || !user || !user.id) {
            return { data: null, error: new Error('Недействительная ссылка восстановления') };
          }
          const sess = {
            access_token,
            refresh_token: refresh_token || '',
            user,
            expires_at: Math.floor(Date.now() / 1000) + 3600
          };
          saveStoredSession(sess);
          return { data: { session: sess, user }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async verifyOtp(params) {
        try {
          const res = await smartFetch(`${baseUrl}/auth/v1/verify`, {
            method: 'POST',
            headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          });
          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: new Error(data.msg || data.message || 'Неверный код') };
          }
          if (data && data.access_token) {
            saveStoredSession(data);
          }
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      async updateUser(attrs) {
        try {
          const res = await smartFetch(`${baseUrl}/auth/v1/user`, {
            method: 'PUT',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(attrs)
          });
          const data = await res.json();
          if (!res.ok) {
            return { data: null, error: new Error(data.msg || data.message || 'Не удалось обновить пароль') };
          }
          return { data: { user: data }, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    };

    function createQueryBuilder(table) {
      let method = 'GET';
      let selectCols = '*';
      let bodyPayload = null;
      let preferParts = [];
      let wantReturnRep = false;
      let isSingle = false;
      let isMaybeSingle = false;
      const queryParams = [];

      const builder = {
        select(cols = '*') {
          selectCols = cols || '*';
          if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
            wantReturnRep = true;
          }
          return builder;
        },
        insert(payload) {
          method = 'POST';
          bodyPayload = payload;
          return builder;
        },
        update(payload) {
          method = 'PATCH';
          bodyPayload = payload;
          return builder;
        },
        upsert(payload) {
          method = 'POST';
          bodyPayload = payload;
          preferParts.push('resolution=merge-duplicates');
          return builder;
        },
        delete() {
          method = 'DELETE';
          return builder;
        },
        eq(col, val) {
          queryParams.push([col, `eq.${val}`]);
          return builder;
        },
        gt(col, val) {
          queryParams.push([col, `gt.${val}`]);
          return builder;
        },
        in(col, arr) {
          const list = (Array.isArray(arr) ? arr : []).join(',');
          queryParams.push([col, `in.(${list})`]);
          return builder;
        },
        order(col, opts) {
          const dir = opts && opts.ascending === false ? 'desc' : 'asc';
          queryParams.push(['order', `${col}.${dir}`]);
          return builder;
        },
        limit(n) {
          queryParams.push(['limit', String(n)]);
          return builder;
        },
        single() {
          isSingle = true;
          return builder;
        },
        maybeSingle() {
          isMaybeSingle = true;
          return builder;
        },
        async execute() {
          try {
            const sp = new URLSearchParams();
            if (method === 'GET' || wantReturnRep) {
              sp.set('select', selectCols);
            }
            queryParams.forEach(([k, v]) => sp.append(k, v));
            const qs = sp.toString();
            const url = `${baseUrl}/rest/v1/${encodeURIComponent(table)}${qs ? `?${qs}` : ''}`;

            const pList = [...preferParts];
            if (wantReturnRep) pList.push('return=representation');
            else if (method !== 'GET') pList.push('return=minimal');

            const headers = getHeaders({
              'Content-Type': 'application/json'
            });
            if (pList.length) headers.Prefer = pList.join(',');

            const res = await smartFetch(url, {
              method,
              headers,
              body: bodyPayload !== null ? JSON.stringify(bodyPayload) : undefined
            });

            if (res.status === 204) {
              return { data: isSingle || isMaybeSingle ? null : [], error: null };
            }
            const text = await res.text();
            const parsed = text ? JSON.parse(text) : null;
            if (!res.ok) {
              const msg = (parsed && (parsed.message || parsed.msg || parsed.details)) || `HTTP ${res.status}`;
              return { data: null, error: new Error(msg) };
            }
            if (isMaybeSingle) {
              const row = Array.isArray(parsed) ? (parsed[0] || null) : parsed;
              return { data: row, error: null };
            }
            if (isSingle) {
              const row = Array.isArray(parsed) ? (parsed[0] || null) : parsed;
              return { data: row, error: row ? null : new Error('Row not found') };
            }
            return { data: parsed, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },
        then(onFulfilled, onRejected) {
          return builder.execute().then(onFulfilled, onRejected);
        }
      };

      return builder;
    }

    function createRealtimeChannel(channelName, opts) {
      let ws = null;
      let hbTimer = null;
      let closedByApp = false;
      let isJoined = false;
      let refCounter = 1;
      const sendQueue = [];
      const broadcastHandlers = new Map();
      const pgHandlers = [];
      let presenceSyncHandlers = [];
      let presenceStateObj = {};
      const myPresenceKey = (opts && opts.config && opts.config.presence && opts.config.presence.key) || 'anon';
      const topic = `realtime:${channelName}`;

      const ch = {
        on(type, filter, callback) {
          if (type === 'broadcast' && filter && filter.event) {
            broadcastHandlers.set(filter.event, callback);
          } else if (type === 'postgres_changes' && typeof callback === 'function') {
            pgHandlers.push({ filter, callback });
          } else if (type === 'presence' && filter && filter.event === 'sync' && typeof callback === 'function') {
            presenceSyncHandlers.push(callback);
          }
          return ch;
        },
        presenceState() {
          return presenceStateObj;
        },
        async track(payload) {
          const pkt = JSON.stringify({
            topic,
            event: 'presence',
            payload: { type: 'presence', event: 'track', key: myPresenceKey, payload },
            ref: String(++refCounter)
          });
          if (ws && ws.readyState === WebSocket.OPEN && isJoined) {
            ws.send(pkt);
          } else {
            sendQueue.push(pkt);
          }
        },
        async send(msg) {
          if (!msg || msg.type !== 'broadcast') return;
          const pkt = JSON.stringify({
            topic,
            event: 'broadcast',
            payload: { type: 'broadcast', event: msg.event, payload: msg.payload },
            ref: String(++refCounter)
          });
          if (ws && ws.readyState === WebSocket.OPEN && isJoined) {
            ws.send(pkt);
          } else {
            sendQueue.push(pkt);
            // Дублируем отправку через HTTP REST API Broadcast, если WebSocket ещё подключается после пуша! (v56)
            fetch(`${baseUrl}/realtime/v1/api/broadcast`, {
              method: 'POST',
              headers: getHeaders({ 'Content-Type': 'application/json' }),
              body: JSON.stringify({
                messages: [{ topic: channelName, event: msg.event, payload: msg.payload }]
              })
            }).catch(() => {});
          }
        },
        subscribe(statusCb) {
          const connectWs = () => {
            if (closedByApp) return;
            isJoined = false;
            try {
              const wsBase = baseUrl.replace(/^http/i, 'ws');
              const wsUrl = `${wsBase}/realtime/v1/websocket?apikey=${encodeURIComponent(supabaseKey)}&vsn=1.0.0`;
              ws = new WebSocket(wsUrl);
              ws.onopen = () => {
                const sess = getStoredSession();
                const accessToken = (sess && sess.access_token) ? sess.access_token : supabaseKey;
                const postgres_changes = pgHandlers.map((h) => ({
                  event: (h.filter && h.filter.event) || '*',
                  schema: (h.filter && h.filter.schema) || 'public',
                  table: (h.filter && h.filter.table) || undefined
                }));
                ws.send(JSON.stringify({
                  topic,
                  event: 'phx_join',
                  payload: {
                    config: {
                      broadcast: { ack: false, self: false },
                      presence: { key: myPresenceKey },
                      postgres_changes
                    },
                    access_token: accessToken
                  },
                  ref: String(++refCounter)
                }));
                isJoined = true;
                while (sendQueue.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
                  ws.send(sendQueue.shift());
                }
                if (typeof statusCb === 'function') statusCb('SUBSCRIBED');
                clearInterval(hbTimer);
                hbTimer = setInterval(() => {
                  if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      topic: 'phoenix',
                      event: 'heartbeat',
                      payload: {},
                      ref: String(++refCounter)
                    }));
                  }
                }, 25000);
              };
              ws.onmessage = (ev) => {
                try {
                  const data = JSON.parse(ev.data);
                  if (!data) return;
                  if (data.event === 'broadcast' && data.payload) {
                    const bEv = data.payload.event || (data.payload.payload && data.payload.payload.event);
                    const innerPayload = data.payload.payload !== undefined ? data.payload.payload : data.payload;
                    const fn = broadcastHandlers.get(bEv);
                    if (fn) fn({ payload: innerPayload });
                  } else if (data.event === 'postgres_changes' && data.payload && data.payload.data) {
                    const d = data.payload.data;
                    const table = d.table;
                    const eventType = d.type;
                    pgHandlers.forEach((h) => {
                      const fTable = h.filter && h.filter.table;
                      const fEv = (h.filter && h.filter.event) || '*';
                      if ((!fTable || fTable === table) && (fEv === '*' || fEv === eventType)) {
                        h.callback({
                          eventType,
                          table,
                          new: d.record || d.new || null,
                          old: d.old_record || d.old || null
                        });
                      }
                    });
                  } else if (data.event === 'presence_state' && data.payload) {
                    presenceStateObj = data.payload;
                    presenceSyncHandlers.forEach((cb) => cb());
                  } else if (data.event === 'presence_diff' && data.payload) {
                    const joins = data.payload.joins || {};
                    const leaves = data.payload.leaves || {};
                    Object.keys(leaves).forEach((k) => { delete presenceStateObj[k]; });
                    Object.assign(presenceStateObj, joins);
                    presenceSyncHandlers.forEach((cb) => cb());
                  }
                } catch (e) {}
              };
              ws.onclose = () => {
                clearInterval(hbTimer);
                if (!closedByApp) setTimeout(connectWs, 4000);
              };
            } catch (e) {}
          };
          connectWs();
          return ch;
        },
        _close() {
          closedByApp = true;
          clearInterval(hbTimer);
          if (ws) {
            try { ws.close(); } catch (e) {}
          }
        }
      };
      return ch;
    }

    return {
      auth,
      from(table) {
        return createQueryBuilder(table);
      },
      async rpc(fnName, params) {
        try {
          const res = await smartFetch(`${baseUrl}/rest/v1/rpc/${encodeURIComponent(fnName)}`, {
            method: 'POST',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(params || {})
          });
          if (!res.ok) return { data: null, error: new Error(`RPC ${res.status}`) };
          const data = await res.json();
          return { data, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      },
      storage: {
        from(bucket) {
          return {
            async upload(path, blob, opts) {
              try {
                const cleanPath = String(path || '').replace(/^\/+/, '');
                const contentType = (opts && opts.contentType) || (blob && blob.type) || 'application/octet-stream';
                const extraHeaders = { 'Content-Type': contentType };
                if (opts && opts.upsert) extraHeaders['x-upsert'] = 'true';
                const res = await smartFetch(
                  `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${cleanPath}`,
                  {
                    method: 'POST',
                    headers: getHeaders(extraHeaders),
                    body: blob
                  }
                );
                if (!res.ok) {
                  const errJson = await res.json().catch(() => ({}));
                  return { data: null, error: new Error(errJson.message || errJson.error || `Upload HTTP ${res.status}`) };
                }
                return { data: { path: cleanPath }, error: null };
              } catch (err) {
                return { data: null, error: err };
              }
            },
            getPublicUrl(path) {
              const cleanPath = String(path || '').replace(/^\/+/, '');
              return {
                data: {
                  publicUrl: `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${cleanPath}`
                }
              };
            }
          };
        }
      },
      channel(name, opts) {
        return createRealtimeChannel(name, opts);
      },
      removeChannel(ch) {
        if (ch && typeof ch._close === 'function') ch._close();
      }
    };
  }

  // Сразу регистрируем локальный автономный клиент (0 мс ожидания внешних CDN!)
  if (!window.supabase) {
    window.supabase = {
      createClient: createNativeSupabaseClient
    };
  }
})();
