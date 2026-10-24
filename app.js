// Pulse Messenger v5 — Умная клавиатура iOS, меню сообщений (Ответить / Изменить / Удалить у меня или у всех), пауза и смена камеры в кружочках, единые Настройки
(function () {
  const LEGACY_PUBLIC_ROOM_ID = '00000000-0000-0000-0000-000000000001';
  const AVATAR_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#3b82f6'];

  const ICON_SEND = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="transform:translateX(1px);"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  const ICON_MIC = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
  const ICON_VIDEO = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;

  // DOM: Авторизация
  const authScreen = document.getElementById('authScreen');
  const appShell = document.getElementById('appShell');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const registerFields = document.getElementById('registerFields');
  const displayNameInput = document.getElementById('displayNameInput');
  const usernameInput = document.getElementById('usernameInput');
  const phoneInput = document.getElementById('phoneInput');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const pwdMeter = document.getElementById('pwdMeter');
  const pwdBars = [
    document.getElementById('pwdBar1'),
    document.getElementById('pwdBar2'),
    document.getElementById('pwdBar3'),
    document.getElementById('pwdBar4')
  ];
  const ruleLen = document.getElementById('ruleLen');
  const ruleCase = document.getElementById('ruleCase');
  const ruleNumSym = document.getElementById('ruleNumSym');
  const ruleNoSeq = document.getElementById('ruleNoSeq');
  const authForm = document.getElementById('authForm');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authStatus = document.getElementById('authStatus');

  // DOM: Единый раздел Настройки и подтверждение выхода
  const profileModal = document.getElementById('profileModal');
  const myProfileTrigger = document.getElementById('myProfileTrigger');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const soundToggleSwitch = document.getElementById('soundToggleSwitch');
  const editAvatarPreview = document.getElementById('editAvatarPreview');
  const avatarFileInput = document.getElementById('avatarFileInput');
  const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
  const editNameInput = document.getElementById('editNameInput');
  const editUsernameInput = document.getElementById('editUsernameInput');
  const editPhoneInput = document.getElementById('editPhoneInput');
  const editBioInput = document.getElementById('editBioInput');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const closeProfileBtn = document.getElementById('closeProfileBtn');
  const themePills = Array.from(document.querySelectorAll('[data-set-theme]'));
  const requestLogoutBtn = document.getElementById('requestLogoutBtn');

  const logoutConfirmModal = document.getElementById('logoutConfirmModal');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

  // DOM: Меню действий над сообщением и подтверждение удаления
  const msgActionModal = document.getElementById('msgActionModal');
  const sheetReplyBtn = document.getElementById('sheetReplyBtn');
  const sheetEditBtn = document.getElementById('sheetEditBtn');
  const sheetCopyBtn = document.getElementById('sheetCopyBtn');
  const sheetDeleteBtn = document.getElementById('sheetDeleteBtn');
  const sheetCancelBtn = document.getElementById('sheetCancelBtn');

  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const deleteForMeBtn = document.getElementById('deleteForMeBtn');
  const deleteForAllBtn = document.getElementById('deleteForAllBtn');
  const cancelDeleteModalBtn = document.getElementById('cancelDeleteModalBtn');

  // DOM: Видеокружочки с управлением камерой и паузой
  const videoCircleOverlay = document.getElementById('videoCircleOverlay');
  const videoCirclePreview = document.getElementById('videoCirclePreview');
  const vcStatusLabel = document.getElementById('vcStatusLabel');
  const vcCancelBtn = document.getElementById('vcCancelBtn');
  const vcFlipCamBtn = document.getElementById('vcFlipCamBtn');
  const vcPauseBtn = document.getElementById('vcPauseBtn');
  const vcSendBtn = document.getElementById('vcSendBtn');

  // DOM: Группы, карточка собеседника и E2EE
  const groupModal = document.getElementById('groupModal');
  const newGroupBtn = document.getElementById('newGroupBtn');
  const groupNameInput = document.getElementById('groupNameInput');
  const groupMembersPicker = document.getElementById('groupMembersPicker');
  const createGroupConfirmBtn = document.getElementById('createGroupConfirmBtn');
  const closeGroupModalBtn = document.getElementById('closeGroupModalBtn');

  const peerModal = document.getElementById('peerModal');
  const chatHeaderTrigger = document.getElementById('chatHeaderTrigger');
  const peerAvatar = document.getElementById('peerAvatar');
  const peerName = document.getElementById('peerName');
  const peerHandle = document.getElementById('peerHandle');
  const peerPhone = document.getElementById('peerPhone');
  const peerBio = document.getElementById('peerBio');
  const closePeerModalBtn = document.getElementById('closePeerModalBtn');

  const e2eModal = document.getElementById('e2eModal');
  const e2eBadgeBtn = document.getElementById('e2eBadgeBtn');
  const e2eBadgeText = document.getElementById('e2eBadgeText');
  const chatSecretKeyInput = document.getElementById('chatSecretKeyInput');
  const saveE2eKeyBtn = document.getElementById('saveE2eKeyBtn');
  const closeE2eModalBtn = document.getElementById('closeE2eModalBtn');

  // DOM: Сайдбар и чат
  const myAvatar = document.getElementById('myAvatar');
  const myName = document.getElementById('myName');
  const myHandle = document.getElementById('myHandle');

  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const listSectionLabel = document.getElementById('listSectionLabel');
  const chatList = document.getElementById('chatList');

  const emptyChatState = document.getElementById('emptyChatState');
  const activeChatView = document.getElementById('activeChatView');
  const mobileBackBtn = document.getElementById('mobileBackBtn');
  const activeRoomAvatar = document.getElementById('activeRoomAvatar');
  const activeRoomOnlineDot = document.getElementById('activeRoomOnlineDot');
  const activeRoomTitle = document.getElementById('activeRoomTitle');
  const activeRoomStatus = document.getElementById('activeRoomStatus');
  const messagesViewport = document.getElementById('messagesViewport');

  const replyPreviewBar = document.getElementById('replyPreviewBar');
  const replyTargetAuthor = document.getElementById('replyTargetAuthor');
  const replyTargetText = document.getElementById('replyTargetText');
  const cancelReplyBtn = document.getElementById('cancelReplyBtn');

  const attachmentInput = document.getElementById('attachmentInput');
  const attachBtn = document.getElementById('attachBtn');
  const messageInput = document.getElementById('messageInput');
  const recordingBar = document.getElementById('recordingBar');
  const recDot = document.getElementById('recDot');
  const recordingTimer = document.getElementById('recordingTimer');
  const pauseVoiceBtn = document.getElementById('pauseVoiceBtn');
  const cancelRecordBtn = document.getElementById('cancelRecordBtn');
  const lockHintPill = document.getElementById('lockHintPill');
  const smartActionBtn = document.getElementById('smartActionBtn');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  // Состояние
  let authMode = 'login';
  let supabaseClient = null;
  let realtimeChannel = null;

  let currentUser = null;
  let pendingAvatarUrl = null;
  let allProfiles = [];
  let myRooms = [];
  let activeRoom = null;
  let roomMessages = [];

  // Состояние ответа / редактирования / выбранного сообщения
  let replyToMsg = null;
  let editingMsg = null; // { id, created_at, quoteLine, plainText }
  let selectedMsgContext = null; // { msg, plainText, quoteLine, isEdited }

  const onlineUserIds = new Set();
  const typingByRoom = new Map();
  let lastTypingBroadcastAt = 0;
  let soundEnabled = localStorage.getItem('pulse_sound') !== 'off';

  // Список локально скрытых сообщений ("Удалить только у меня")
  function getLocallyHiddenMsgIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem('pulse_hidden_msgs') || '[]'));
    } catch (e) {
      return new Set();
    }
  }

  function hideMsgLocally(msgId) {
    const set = getLocallyHiddenMsgIds();
    set.add(msgId);
    localStorage.setItem('pulse_hidden_msgs', JSON.stringify(Array.from(set)));
  }

  // Состояние записи (Голос / Видеокружочек)
  let recordMode = localStorage.getItem('pulse_rec_mode') === 'video' ? 'video' : 'voice';
  let cameraFacingMode = 'user'; // 'user' (фронтальная) | 'environment' (основная)
  let isRecording = false;
  let isRecordingLocked = false;
  let isRecordingPaused = false;
  let recordCanceled = false;
  let activeMediaRecorder = null;
  let activeMediaStream = null;
  let recordedChunks = [];
  let elapsedRecordMs = 0;
  let lastResumeTime = 0;
  let recordTimerInterval = null;
  let holdTimer = null;
  let pointerStartY = 0;

  // 0. ИСПРАВЛЕНИЕ КЛАВИАТУРЫ И ОТСТУПА НА IPHONE (VisualViewport Sync)
  function syncViewportHeight() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`);

    const isKeyboardOpen = vv ? (window.innerHeight - vv.height > 110) : false;
    document.body.classList.toggle('keyboard-open', isKeyboardOpen);

    // Сбрасываем фантомный скролл WebKit на iOS
    if (window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
    if (isKeyboardOpen && messagesViewport) {
      messagesViewport.scrollTop = messagesViewport.scrollHeight;
    }
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewportHeight);
    window.visualViewport.addEventListener('scroll', syncViewportHeight);
  }
  window.addEventListener('resize', syncViewportHeight);
  messageInput.addEventListener('focus', () => {
    setTimeout(syncViewportHeight, 60);
    setTimeout(syncViewportHeight, 250);
  });
  messageInput.addEventListener('blur', () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
      syncViewportHeight();
    }, 60);
    setTimeout(syncViewportHeight, 250);
  });
  syncViewportHeight();

  // 1. Управление темой: Авто (system), Тёмная (midnight) и Светлая (daylight)
  const systemLightQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function resolveEffectiveTheme(mode) {
    if (mode === 'system') {
      return systemLightQuery && systemLightQuery.matches ? 'daylight' : 'midnight';
    }
    return mode === 'daylight' ? 'daylight' : 'midnight';
  }

  function applyTheme(themeMode) {
    const validMode = ['system', 'midnight', 'daylight'].includes(themeMode) ? themeMode : 'system';
    const effective = resolveEffectiveTheme(validMode);
    document.documentElement.setAttribute('data-theme', effective);
    localStorage.setItem('pulse_theme', validMode);
    themePills.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.setTheme === validMode);
    });
  }

  if (systemLightQuery && systemLightQuery.addEventListener) {
    systemLightQuery.addEventListener('change', () => {
      const saved = localStorage.getItem('pulse_theme') || 'system';
      if (saved === 'system') applyTheme('system');
    });
  }

  themePills.forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.setTheme));
  });
  applyTheme(localStorage.getItem('pulse_theme') || 'system');

  // 2. Звуковой сигнал при новом сообщении (внутри Настроек)
  function updateSoundSwitchUI() {
    if (!soundToggleSwitch) return;
    soundToggleSwitch.classList.toggle('on', soundEnabled);
  }
  updateSoundSwitchUI();

  if (soundToggleSwitch) {
    soundToggleSwitch.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('pulse_sound', soundEnabled ? 'on' : 'off');
      updateSoundSwitchUI();
      if (soundEnabled) playNotificationSound();
    });
  }

  function playNotificationSound() {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.setValueAtTime(880, now + 0.09);
      osc2.frequency.setValueAtTime(293.66, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.29);
      osc2.stop(now + 0.29);
    } catch (e) {}
  }

  // 3. Строгая проверка надёжности пароля
  function evaluatePasswordStrength(pwd) {
    const hasLen = pwd.length >= 8;
    const hasCase = /[a-zа-яё]/.test(pwd) && /[A-ZА-ЯЁ]/.test(pwd);
    const hasNumSym = /\d/.test(pwd) && /[^a-zA-Zа-яА-ЯёЁ0-9\s]/.test(pwd);

    const lower = pwd.toLowerCase();
    const badPatterns = [
      '12345', '23456', '34567', '45678', '56789', '67890',
      '09876', '98765', '87654', '76543', '65432', '54321',
      'qwerty', 'asdfgh', 'zxcvbn', 'йцукен', 'фывапр', 'пароль', 'password', 'admin'
    ];
    const hasSeq = badPatterns.some((p) => lower.includes(p)) || /(.)\1{3,}/.test(pwd);
    const hasNoSeq = pwd.length > 0 && !hasSeq;

    const score = [hasLen, hasCase, hasNumSym, hasNoSeq].filter(Boolean).length;
    return { hasLen, hasCase, hasNumSym, hasNoSeq, score, isValid: score === 4 };
  }

  passwordInput.addEventListener('input', () => {
    if (authMode !== 'register') return;
    const res = evaluatePasswordStrength(passwordInput.value);

    ruleLen.textContent = `${res.hasLen ? '✓' : '○'} Минимум 8 символов`;
    ruleLen.classList.toggle('ok', res.hasLen);

    ruleCase.textContent = `${res.hasCase ? '✓' : '○'} Заглавная и строчная буквы (A-z)`;
    ruleCase.classList.toggle('ok', res.hasCase);

    ruleNumSym.textContent = `${res.hasNumSym ? '✓' : '○'} Минимум одна цифра и спецсимвол (!@#$%...)`;
    ruleNumSym.classList.toggle('ok', res.hasNumSym);

    ruleNoSeq.textContent = `${res.hasNoSeq ? '✓' : '○'} Без простых комбинаций (123456, qwerty, 1111)`;
    ruleNoSeq.classList.toggle('ok', res.hasNoSeq);

    const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
    pwdBars.forEach((bar, idx) => {
      bar.style.background = idx < res.score ? colors[res.score - 1] : 'var(--border)';
    });
  });

  // 4. Сквозное шифрование AES-256-GCM
  const cryptoKeyCache = new Map();

  function getRoomCustomSecret(roomId) {
    return localStorage.getItem(`pulse_e2e_${roomId}`) || '';
  }

  function setRoomCustomSecret(roomId, secret) {
    if (secret) {
      localStorage.setItem(`pulse_e2e_${roomId}`, secret);
    } else {
      localStorage.removeItem(`pulse_e2e_${roomId}`);
    }
    cryptoKeyCache.delete(roomId);
  }

  async function deriveRoomCryptoKey(room) {
    const roomId = room.id;
    const customSecret = getRoomCustomSecret(roomId);
    const cacheKey = `${roomId}:${customSecret}`;
    if (cryptoKeyCache.has(cacheKey)) return cryptoKeyCache.get(cacheKey);

    const enc = new TextEncoder();
    const baseMaterial = `pulse-aes256-v1|${room.direct_key || room.id}|${customSecret}`;
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(baseMaterial),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(`pulse-salt-${room.id}`),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    cryptoKeyCache.set(cacheKey, derivedKey);
    return derivedKey;
  }

  async function encryptTextForRoom(plainText, room) {
    if (!plainText) return '';
    try {
      const key = await deriveRoomCryptoKey(room);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plainText);
      const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

      const ivB64 = uint8ToBase64(iv);
      const cipherB64 = uint8ToBase64(new Uint8Array(cipherBuf));
      return `ENC1:${ivB64}:${cipherB64}`;
    } catch (e) {
      return plainText;
    }
  }

  async function decryptTextForRoom(storedText, room) {
    if (!storedText || !storedText.startsWith('ENC1:')) return storedText;
    try {
      const parts = storedText.split(':');
      if (parts.length !== 3) return storedText;
      const iv = base64ToUint8(parts[1]);
      const cipherBytes = base64ToUint8(parts[2]);
      const key = await deriveRoomCryptoKey(room);
      const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
      return new TextDecoder().decode(plainBuf);
    } catch (e) {
      return '🔒 [Сообщение зашифровано секретным ключом чата]';
    }
  }

  function uint8ToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToUint8(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // 5. Упаковка и распаковка профиля
  function packProfileMeta(meta) {
    return JSON.stringify({
      c: meta.color || '#6366f1',
      u: sanitizeUsername(meta.username),
      p: normalizePhone(meta.phone || ''),
      a: meta.avatar_url || '',
      b: (meta.bio || '').trim()
    });
  }

  function unpackProfile(rawProfile) {
    if (!rawProfile) return null;
    const rawField = rawProfile.avatar_color || '';
    const fallbackHandle = (rawProfile.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (rawField.startsWith('{')) {
      try {
        const parsed = JSON.parse(rawField);
        return {
          id: rawProfile.id,
          email: rawProfile.email || '',
          display_name: rawProfile.display_name || parsed.u || fallbackHandle,
          username: sanitizeUsername(parsed.u || fallbackHandle),
          phone: normalizePhone(parsed.p || ''),
          avatar_url: parsed.a || '',
          bio: parsed.b || '',
          color: parsed.c || '#6366f1',
          last_seen: rawProfile.last_seen || null
        };
      } catch (e) {}
    }

    const parts = rawField.split('|');
    return {
      id: rawProfile.id,
      email: rawProfile.email || '',
      display_name: rawProfile.display_name || parts[1] || fallbackHandle,
      username: sanitizeUsername(parts[1] || fallbackHandle),
      phone: '',
      avatar_url: '',
      bio: '',
      color: parts[0] || '#6366f1',
      last_seen: rawProfile.last_seen || null
    };
  }

  function sanitizeUsername(str) {
    return String(str || '')
      .trim()
      .replace(/^@+/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, '');
  }

  function normalizePhone(phoneStr) {
    const digits = String(phoneStr || '').replace(/[^\d+]/g, '');
    if (!digits) return '';
    const onlyNums = digits.replace(/\D/g, '');
    if (onlyNums.length === 11 && onlyNums.startsWith('8')) {
      return '+7' + onlyNums.slice(1);
    }
    if (onlyNums.length === 11 && onlyNums.startsWith('7')) {
      return '+' + onlyNums;
    }
    return digits.startsWith('+') ? digits : '+' + onlyNums;
  }

  function formatPresenceStatus(person) {
    if (!person) return '';
    if (onlineUserIds.has(person.id)) {
      return '● в сети';
    }
    if (person.last_seen) {
      const seenDate = new Date(person.last_seen);
      const diffSec = Math.floor((Date.now() - seenDate.getTime()) / 1000);
      if (diffSec < 90) return '● в сети';
      const today = new Date();
      const isToday = seenDate.toDateString() === today.toDateString();
      const timeStr = seenDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `был(а) в сети сегодня в ${timeStr}`;
      }
      const dateStr = seenDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      return `был(а) в сети ${dateStr} в ${timeStr}`;
    }
    return `@${person.username}`;
  }

  function isPersonOnline(person) {
    if (!person) return false;
    if (onlineUserIds.has(person.id)) return true;
    if (person.last_seen) {
      return (Date.now() - new Date(person.last_seen).getTime()) < 90000;
    }
    return false;
  }

  function renderAvatarElement(el, { avatar_url, letter, color }) {
    if (avatar_url) {
      el.innerHTML = `<img src="${escapeHtml(avatar_url)}" alt="Аватар" />`;
      el.style.background = 'transparent';
    } else {
      el.textContent = (letter || 'U')[0].toUpperCase();
      el.style.background = color || '#6366f1';
    }
  }

  // 6. Инициализация Supabase и авторизация
  function initSupabase() {
    const cfg = window.MESSENGER_CONFIG || {};
    const url = (cfg.SUPABASE_URL || '').trim();
    const key = (cfg.SUPABASE_ANON_KEY || '').trim();
    if (!url || !key || !window.supabase) return false;
    supabaseClient = window.supabase.createClient(url, key);
    return true;
  }

  function showAuthStatus(msg, type = 'info') {
    authStatus.textContent = msg;
    authStatus.className = `status-banner ${type}`;
    authStatus.classList.remove('hidden');
  }

  tabLogin.addEventListener('click', () => {
    authMode = 'login';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    registerFields.classList.add('hidden');
    pwdMeter.classList.add('hidden');
    authSubmitBtn.textContent = 'Войти';
    authStatus.classList.add('hidden');
  });

  tabRegister.addEventListener('click', () => {
    authMode = 'register';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerFields.classList.remove('hidden');
    pwdMeter.classList.remove('hidden');
    authSubmitBtn.textContent = 'Создать защищённый аккаунт';
    authStatus.classList.add('hidden');
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient && !initSupabase()) {
      showAuthStatus('Ошибка конфигурации Supabase в config.js', 'error');
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const nameVal = displayNameInput.value.trim();
    const handleVal = sanitizeUsername(usernameInput.value);
    const phoneVal = normalizePhone(phoneInput.value);

    if (authMode === 'register') {
      if (!nameVal) {
        showAuthStatus('Укажите ваше имя и фамилию.', 'error');
        return;
      }
      if (!handleVal || handleVal.length < 3) {
        showAuthStatus('Придумайте уникальный @username (минимум 3 латинских символа или цифры).', 'error');
        return;
      }
      const pwdCheck = evaluatePasswordStrength(password);
      if (!pwdCheck.isValid) {
        showAuthStatus(
          'Пароль слишком простой! Выполните все 4 пункта надёжности (буквы разного регистра, цифры, спецсимвол и отсутствие простых последовательностей вроде 12345678).',
          'error'
        );
        return;
      }
    }

    authSubmitBtn.disabled = true;
    showAuthStatus('Защищённое подключение...', 'info');

    try {
      if (authMode === 'register') {
        const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
        const packedMeta = packProfileMeta({
          color: randomColor,
          username: handleVal,
          phone: phoneVal,
          avatar_url: '',
          bio: ''
        });

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: nameVal,
              username: handleVal,
              phone: phoneVal
            }
          }
        });
        if (error) throw error;

        if (data.user) {
          await supabaseClient.from('profiles').upsert({
            id: data.user.id,
            email,
            display_name: nameVal,
            avatar_color: packedMeta,
            last_seen: new Date().toISOString()
          });
        }

        if (data.user && !data.session) {
          showAuthStatus('Аккаунт создан! Теперь войдите (или отключите Confirm sign up в Supabase).', 'info');
          authSubmitBtn.disabled = false;
          return;
        }
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      await bootSession();
    } catch (err) {
      showAuthStatus(err.message || 'Ошибка авторизации', 'error');
    } finally {
      authSubmitBtn.disabled = false;
    }
  });

  async function bootSession() {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (!sessionData || !sessionData.session) return;

    const user = sessionData.session.user;
    let { data: rawProf } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const metaName = user.user_metadata?.display_name || user.email.split('@')[0];
    const metaHandle = sanitizeUsername(user.user_metadata?.username || user.email.split('@')[0]);
    const metaPhone = normalizePhone(user.user_metadata?.phone || '');

    if (!rawProf) {
      const packed = packProfileMeta({
        color: '#6366f1',
        username: metaHandle,
        phone: metaPhone,
        avatar_url: '',
        bio: ''
      });
      const { data: inserted } = await supabaseClient
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: metaName,
          avatar_color: packed,
          last_seen: new Date().toISOString()
        })
        .select()
        .single();
      rawProf = inserted || { id: user.id, email: user.email, display_name: metaName, avatar_color: packed };
    } else {
      await supabaseClient
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
    }

    currentUser = unpackProfile(rawProf);
    onlineUserIds.add(currentUser.id);
    updateMyHeaderUI();
    updateSmartActionButtonUI();

    authScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
    syncViewportHeight();

    await ensureSavedMessagesRoom();
    await refreshDirectoryAndRooms();
    subscribeRealtime();

    setInterval(async () => {
      if (!currentUser || !supabaseClient) return;
      await supabaseClient
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUser.id);
    }, 45000);
  }

  async function ensureSavedMessagesRoom() {
    const savedKey = `saved_${currentUser.id}`;
    const { data: existing } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('direct_key', savedKey)
      .maybeSingle();

    if (!existing) {
      await supabaseClient.from('rooms').insert({
        name: 'Избранное',
        is_group: false,
        direct_key: savedKey,
        created_by: currentUser.id
      });
    }
  }

  function updateMyHeaderUI() {
    myName.textContent = currentUser.display_name;
    myHandle.textContent = currentUser.phone
      ? `@${currentUser.username} • ${currentUser.phone}`
      : `@${currentUser.username}`;
    renderAvatarElement(myAvatar, {
      avatar_url: currentUser.avatar_url,
      letter: currentUser.display_name,
      color: currentUser.color
    });
  }

  // 7. Единый раздел «Настройки» и подтверждение выхода из аккаунта
  function openProfileModal() {
    pendingAvatarUrl = currentUser.avatar_url || '';
    editNameInput.value = currentUser.display_name;
    editUsernameInput.value = currentUser.username;
    editPhoneInput.value = currentUser.phone || '';
    editBioInput.value = currentUser.bio || '';
    renderAvatarElement(editAvatarPreview, {
      avatar_url: pendingAvatarUrl,
      letter: currentUser.display_name,
      color: currentUser.color
    });
    updateSoundSwitchUI();
    profileModal.classList.remove('hidden');
  }

  myProfileTrigger.addEventListener('click', openProfileModal);
  editProfileBtn.addEventListener('click', openProfileModal);
  closeProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));

  uploadAvatarBtn.addEventListener('click', () => avatarFileInput.click());

  avatarFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    avatarFileInput.value = '';
    uploadAvatarBtn.textContent = 'Загрузка...';
    try {
      const blob = await compressImage(file, 400, 0.85);
      const path = `avatars/${currentUser.id}_${Date.now()}.jpg`;
      const { error: upErr } = await supabaseClient.storage
        .from('chat-media')
        .upload(path, blob, { contentType: 'image/jpeg' });
      if (upErr) throw upErr;

      const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
      pendingAvatarUrl = pub.publicUrl;
      renderAvatarElement(editAvatarPreview, {
        avatar_url: pendingAvatarUrl,
        letter: editNameInput.value || currentUser.display_name,
        color: currentUser.color
      });
    } catch (err) {
      alert('Ошибка загрузки аватарки: ' + (err.message || err));
    } finally {
      uploadAvatarBtn.textContent = 'Изменить фото аватарки';
    }
  });

  saveProfileBtn.addEventListener('click', async () => {
    const newName = editNameInput.value.trim();
    const newHandle = sanitizeUsername(editUsernameInput.value);
    const newPhone = normalizePhone(editPhoneInput.value);
    const newBio = editBioInput.value.trim();

    if (!newName || newHandle.length < 3) {
      alert('Укажите имя и @username (минимум 3 символа).');
      return;
    }

    const duplicateHandle = allProfiles.find(
      (p) => p.id !== currentUser.id && p.username.toLowerCase() === newHandle.toLowerCase()
    );
    if (duplicateHandle) {
      alert(`Никнейм @${newHandle} уже занят.`);
      return;
    }

    const packed = packProfileMeta({
      color: currentUser.color,
      username: newHandle,
      phone: newPhone,
      avatar_url: pendingAvatarUrl,
      bio: newBio
    });

    const { error } = await supabaseClient
      .from('profiles')
      .update({
        display_name: newName,
        avatar_color: packed,
        last_seen: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (error) {
      alert('Ошибка сохранения профиля: ' + error.message);
      return;
    }

    currentUser.display_name = newName;
    currentUser.username = newHandle;
    currentUser.phone = newPhone;
    currentUser.avatar_url = pendingAvatarUrl;
    currentUser.bio = newBio;

    updateMyHeaderUI();
    profileModal.classList.add('hidden');
    await refreshDirectoryAndRooms();
  });

  // Подтверждение выхода из аккаунта
  requestLogoutBtn.addEventListener('click', () => {
    logoutConfirmModal.classList.remove('hidden');
  });

  cancelLogoutBtn.addEventListener('click', () => {
    logoutConfirmModal.classList.add('hidden');
  });

  confirmLogoutBtn.addEventListener('click', async () => {
    logoutConfirmModal.classList.add('hidden');
    profileModal.classList.add('hidden');
    await supabaseClient.auth.signOut();
    activeRoom = null;
    appShell.classList.add('hidden');
    authScreen.classList.remove('hidden');
  });

  // 8. Загрузка контактов и приватных чатов
  async function refreshDirectoryAndRooms() {
    const [{ data: profRows }, { data: roomRows }] = await Promise.all([
      supabaseClient.from('profiles').select('*').order('display_name', { ascending: true }),
      supabaseClient.from('rooms').select('*').order('created_at', { ascending: false })
    ]);

    allProfiles = (profRows || []).map(unpackProfile);

    const rawRooms = (roomRows || []).filter((r) => r.id !== LEGACY_PUBLIC_ROOM_ID);
    myRooms = rawRooms
      .filter((r) => isUserMemberOfRoom(r, currentUser.id))
      .map((r) => decorateRoomForUser(r));

    if (activeRoom) {
      const updatedActive = myRooms.find((r) => r.id === activeRoom.id);
      if (updatedActive) {
        activeRoom = updatedActive;
        updateActiveRoomHeaderUI();
      }
    }

    renderSidebarList();
  }

  function isUserMemberOfRoom(room, userId) {
    if (!room) return false;
    if (room.created_by === userId) return true;
    const key = room.direct_key || '';
    if (!room.is_group && key.includes(userId)) return true;
    if (room.is_group && key.includes('|')) {
      const ids = (key.split('|')[1] || '').split(',');
      return ids.includes(userId);
    }
    return false;
  }

  function decorateRoomForUser(room) {
    if (!room.is_group) {
      const key = room.direct_key || '';
      if (key === `saved_${currentUser.id}`) {
        return {
          ...room,
          displayTitle: 'Избранное (Заметки)',
          displaySub: 'Личное зашифрованное хранилище',
          avatarLetter: '★',
          avatarColor: '#6366f1',
          avatarUrl: '',
          isOnline: false,
          peerProfile: currentUser
        };
      }
      const ids = key.split('_');
      const partnerId = ids.find((id) => id !== currentUser.id) || currentUser.id;
      const partner = allProfiles.find((p) => p.id === partnerId);
      if (partner) {
        const online = isPersonOnline(partner);
        return {
          ...room,
          displayTitle: partner.display_name,
          displaySub: formatPresenceStatus(partner),
          avatarLetter: (partner.display_name || '?')[0].toUpperCase(),
          avatarColor: partner.color,
          avatarUrl: partner.avatar_url,
          isOnline: online,
          peerProfile: partner
        };
      }
    }

    let memberCountText = 'Закрытая группа';
    if (room.direct_key && room.direct_key.includes('|')) {
      const count = room.direct_key.split('|')[1].split(',').filter(Boolean).length;
      memberCountText = `Закрытая группа • ${count} участн.`;
    }
    return {
      ...room,
      displayTitle: room.name,
      displaySub: memberCountText,
      avatarLetter: (room.name || 'Г')[0].toUpperCase(),
      avatarColor: '#4f46e5',
      avatarUrl: '',
      isOnline: false,
      peerProfile: null
    };
  }

  // 9. Поиск людей по @username, номеру телефона или имени
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchClearBtn.classList.toggle('hidden', !q);
    renderSidebarList();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    renderSidebarList();
  });

  function renderSidebarList() {
    const rawQuery = searchInput.value.trim().toLowerCase();
    const cleanQuery = rawQuery.replace(/^@+/, '');
    const normalizedPhoneQuery = normalizePhone(rawQuery).replace(/\D/g, '');
    chatList.innerHTML = '';

    if (cleanQuery.length > 0) {
      listSectionLabel.textContent = 'Поиск людей (@username / телефон)';
      const matches = allProfiles.filter((p) => {
        if (p.id === currentUser.id) return false;
        const byUsername = p.username.toLowerCase().includes(cleanQuery);
        const byName = p.display_name.toLowerCase().includes(cleanQuery);
        const pDigits = (p.phone || '').replace(/\D/g, '');
        const byPhone = normalizedPhoneQuery.length >= 3 && pDigits.includes(normalizedPhoneQuery);
        return byUsername || byName || byPhone;
      });

      if (!matches.length) {
        chatList.innerHTML = `<div class="empty-sidebar">Никого не найдено по запросу «${escapeHtml(rawQuery)}».<br/>Можно искать по <strong>@username</strong>, <strong>номеру телефона</strong> (+7...) или имени.</div>`;
        return;
      }

      matches.forEach((person) => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        const wrap = document.createElement('div');
        wrap.className = 'avatar-wrap';
        const av = document.createElement('div');
        av.className = 'avatar';
        renderAvatarElement(av, {
          avatar_url: person.avatar_url,
          letter: person.display_name,
          color: person.color
        });
        wrap.appendChild(av);
        if (isPersonOnline(person)) {
          const dot = document.createElement('span');
          dot.className = 'online-dot';
          wrap.appendChild(dot);
        }

        const body = document.createElement('div');
        body.className = 'chat-item-body';
        const phoneBadge = person.phone ? ` • ${escapeHtml(person.phone)}` : '';
        body.innerHTML = `
          <div class="chat-item-top">
            <div class="chat-item-title">${escapeHtml(person.display_name)}</div>
          </div>
          <div class="chat-item-sub" style="color:var(--accent);">@${escapeHtml(person.username)}${phoneBadge}</div>
        `;

        item.appendChild(wrap);
        item.appendChild(body);
        item.addEventListener('click', () => {
          searchInput.value = '';
          searchClearBtn.classList.add('hidden');
          openDirectChat(person);
        });
        chatList.appendChild(item);
      });
      return;
    }

    listSectionLabel.textContent = 'Мои диалоги';

    myRooms.forEach((room) => {
      const isSelected = activeRoom && activeRoom.id === room.id;
      const item = document.createElement('div');
      item.className = `chat-item ${isSelected ? 'active' : ''}`;

      const wrap = document.createElement('div');
      wrap.className = 'avatar-wrap';
      const av = document.createElement('div');
      av.className = 'avatar';
      renderAvatarElement(av, {
        avatar_url: room.avatarUrl,
        letter: room.avatarLetter,
        color: room.avatarColor
      });
      wrap.appendChild(av);
      if (room.isOnline) {
        const dot = document.createElement('span');
        dot.className = 'online-dot';
        wrap.appendChild(dot);
      }

      const typingInfo = typingByRoom.get(room.id);
      const isTypingActive = typingInfo && typingInfo.expiresAt > Date.now();
      const subText = isTypingActive
        ? `${typingInfo.name}: ${typingInfo.action}`
        : room.displaySub;

      const body = document.createElement('div');
      body.className = 'chat-item-body';
      body.innerHTML = `
        <div class="chat-item-top">
          <div class="chat-item-title">${escapeHtml(room.displayTitle)}</div>
        </div>
        <div class="chat-item-sub ${isTypingActive ? 'typing-highlight' : ''}">${escapeHtml(subText)}</div>
      `;

      item.appendChild(wrap);
      item.appendChild(body);
      item.addEventListener('click', () => selectRoom(room));
      chatList.appendChild(item);
    });
  }

  async function openDirectChat(person) {
    const pairKey = [currentUser.id, person.id].sort().join('_');

    let { data: existing } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('direct_key', pairKey)
      .maybeSingle();

    if (!existing) {
      const { data: created, error } = await supabaseClient
        .from('rooms')
        .insert({
          name: `${currentUser.display_name} & ${person.display_name}`,
          is_group: false,
          direct_key: pairKey,
          created_by: currentUser.id
        })
        .select()
        .single();

      if (error) {
        alert('Не удалось открыть диалог: ' + error.message);
        return;
      }
      existing = created;
    }

    await refreshDirectoryAndRooms();
    await selectRoom(decorateRoomForUser(existing));
  }

  // 10. Создание закрытой группы
  newGroupBtn.addEventListener('click', () => {
    groupNameInput.value = '';
    groupMembersPicker.innerHTML = '';

    const others = allProfiles.filter((p) => p.id !== currentUser.id);
    if (!others.length) {
      groupMembersPicker.innerHTML = `<div style="padding:10px; font-size:13px; color:var(--text-muted);">Пока нет других зарегистрированных пользователей.</div>`;
    } else {
      others.forEach((person) => {
        const row = document.createElement('label');
        row.className = 'member-option';
        const phoneStr = person.phone ? ` • ${escapeHtml(person.phone)}` : '';
        row.innerHTML = `
          <input type="checkbox" value="${person.id}" />
          <div style="min-width:0;">
            <div style="font-weight:600; font-size:13.5px;">${escapeHtml(person.display_name)}</div>
            <div style="font-size:11.5px; color:var(--text-muted);">@${escapeHtml(person.username)}${phoneStr}</div>
          </div>
        `;
        groupMembersPicker.appendChild(row);
      });
    }

    groupModal.classList.remove('hidden');
  });

  closeGroupModalBtn.addEventListener('click', () => groupModal.classList.add('hidden'));

  createGroupConfirmBtn.addEventListener('click', async () => {
    const title = groupNameInput.value.trim();
    if (!title) {
      alert('Укажите название группы.');
      return;
    }

    const checkedIds = Array.from(groupMembersPicker.querySelectorAll('input[type="checkbox"]:checked')).map(
      (cb) => cb.value
    );
    const allMemberIds = Array.from(new Set([currentUser.id, ...checkedIds]));
    const groupKey = `grp_${Date.now()}|${allMemberIds.join(',')}`;

    const { data: created, error } = await supabaseClient
      .from('rooms')
      .insert({
        name: title,
        is_group: true,
        direct_key: groupKey,
        created_by: currentUser.id
      })
      .select()
      .single();

    if (error) {
      alert('Ошибка создания группы: ' + error.message);
      return;
    }

    groupModal.classList.add('hidden');
    await refreshDirectoryAndRooms();
    await selectRoom(decorateRoomForUser(created));
  });

  // 11. Выбор чата
  async function selectRoom(room) {
    activeRoom = room;
    clearReplyOrEditBar();

    emptyChatState.classList.add('hidden');
    activeChatView.classList.remove('hidden');
    appShell.classList.add('chat-active');

    updateActiveRoomHeaderUI();
    updateE2eBadgeUI();
    updateSmartActionButtonUI();
    renderSidebarList();
    syncViewportHeight();
    await loadMessages(room.id);
  }

  function updateActiveRoomHeaderUI() {
    if (!activeRoom) return;
    activeRoomTitle.textContent = activeRoom.displayTitle;
    renderAvatarElement(activeRoomAvatar, {
      avatar_url: activeRoom.avatarUrl,
      letter: activeRoom.avatarLetter,
      color: activeRoom.avatarColor
    });
    activeRoomOnlineDot.classList.toggle('hidden', !activeRoom.isOnline);

    const typingInfo = typingByRoom.get(activeRoom.id);
    if (typingInfo && typingInfo.expiresAt > Date.now()) {
      activeRoomStatus.textContent = activeRoom.is_group
        ? `${typingInfo.name}: ${typingInfo.action}`
        : typingInfo.action;
      activeRoomStatus.className = 'header-status typing';
    } else {
      activeRoomStatus.textContent = activeRoom.displaySub;
      activeRoomStatus.className = `header-status ${activeRoom.isOnline ? 'online' : ''}`;
    }
  }

  function updateE2eBadgeUI() {
    if (!activeRoom) return;
    const customSecret = getRoomCustomSecret(activeRoom.id);
    e2eBadgeText.textContent = customSecret ? 'AES-256 + Ключ' : 'AES-256';
  }

  e2eBadgeBtn.addEventListener('click', () => {
    if (!activeRoom) return;
    chatSecretKeyInput.value = getRoomCustomSecret(activeRoom.id);
    e2eModal.classList.remove('hidden');
  });

  closeE2eModalBtn.addEventListener('click', () => e2eModal.classList.add('hidden'));

  saveE2eKeyBtn.addEventListener('click', async () => {
    if (!activeRoom) return;
    setRoomCustomSecret(activeRoom.id, chatSecretKeyInput.value.trim());
    updateE2eBadgeUI();
    e2eModal.classList.add('hidden');
    await renderMessages();
  });

  chatHeaderTrigger.addEventListener('click', (e) => {
    if (e.target.closest('#mobileBackBtn')) return;
    if (!activeRoom) return;

    if (activeRoom.direct_key === `saved_${currentUser.id}`) {
      renderAvatarElement(peerAvatar, {
        avatar_url: '',
        letter: '★',
        color: '#6366f1'
      });
      peerName.textContent = 'Избранное (Заметки)';
      peerHandle.textContent = 'Личное хранилище AES-256';
      peerPhone.textContent = '';
      peerBio.textContent = 'Здесь можно сохранять для себя важные заметки, фотографии, видеокружочки и файлы. Доступ к этому чату есть только у вас.';
      peerBio.classList.remove('hidden');
      peerModal.classList.remove('hidden');
      return;
    }

    if (!activeRoom.peerProfile) return;
    const p = activeRoom.peerProfile;
    renderAvatarElement(peerAvatar, {
      avatar_url: p.avatar_url,
      letter: p.display_name,
      color: p.color
    });
    peerName.textContent = p.display_name;
    peerHandle.textContent = `@${p.username} • ${formatPresenceStatus(p)}`;
    peerPhone.textContent = p.phone ? `Телефон: ${p.phone}` : '';
    if (p.bio && p.bio.trim()) {
      peerBio.textContent = p.bio.trim();
      peerBio.classList.remove('hidden');
    } else {
      peerBio.textContent = '';
      peerBio.classList.add('hidden');
    }
    peerModal.classList.remove('hidden');
  });

  closePeerModalBtn.addEventListener('click', () => peerModal.classList.add('hidden'));

  mobileBackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    appShell.classList.remove('chat-active');
    syncViewportHeight();
  });

  // 12. Отрисовка сообщений и аккуратное меню при нажатии на сообщение
  async function loadMessages(roomId) {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(200);

    if (!error && data) {
      roomMessages = data;
      await renderMessages();
    }
  }

  async function renderMessages() {
    if (!activeRoom) return;
    messagesViewport.innerHTML = '';

    const hiddenIds = getLocallyHiddenMsgIds();
    const visibleMessages = roomMessages.filter((m) => !hiddenIds.has(m.id));

    if (!visibleMessages.length) {
      messagesViewport.innerHTML = `<div class="date-divider">🔒 Сообщения в этом чате защищены сквозным шифрованием AES-256</div>`;
      return;
    }

    for (const msg of visibleMessages) {
      const isOwn = msg.sender_id === currentUser.id;
      const row = document.createElement('div');
      row.className = `msg-row ${isOwn ? 'own' : 'other'}`;

      const timeStr = new Date(msg.created_at).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const showAuthor = activeRoom.is_group && !isOwn;
      let decryptedText = await decryptTextForRoom(msg.content || '', activeRoom);

      // Проверка пометки редактирования [edit]
      let isEdited = false;
      if (decryptedText.startsWith('[edit]')) {
        isEdited = true;
        decryptedText = decryptedText.slice(6);
      }

      let replyBlockHtml = '';
      let quoteLine = '';
      let mainText = decryptedText;
      if (decryptedText.startsWith('>>')) {
        const newlineIdx = decryptedText.indexOf('\n');
        if (newlineIdx !== -1) {
          quoteLine = decryptedText.slice(2, newlineIdx);
          mainText = decryptedText.slice(newlineIdx + 1);
          replyBlockHtml = `<div class="msg-reply-quote">${escapeHtml(quoteLine)}</div>`;
        }
      }

      const rawUrl = msg.media_url || '';
      const isVideoCircle = rawUrl.includes('#circle');
      const isRearCircle = rawUrl.includes('#circle-rear');
      const isFileAttachment = rawUrl.includes('#file:');

      let contentBlock = replyBlockHtml;

      if (isVideoCircle) {
        const cleanVideoUrl = rawUrl.split('#')[0];
        contentBlock += `
          <div class="video-note-wrap">
            <video class="${isRearCircle ? '' : 'mirrored'}" src="${escapeHtml(cleanVideoUrl)}#t=0.001" playsinline loop preload="metadata"></video>
            <div class="video-note-badge">▶ Кружочек</div>
          </div>
        `;
      } else if (isFileAttachment) {
        const [cleanFileUrl, hashPart] = rawUrl.split('#file:');
        const metaParts = (hashPart || '').split(':');
        const fileName = decodeURIComponent(metaParts[0] || 'Документ');
        const fileSize = decodeURIComponent(metaParts[1] || '');
        contentBlock += `
          <a class="file-card" href="${escapeHtml(cleanFileUrl)}" target="_blank" rel="noopener" download="${escapeHtml(fileName)}">
            <div class="file-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="file-meta">
              <div class="file-name">${escapeHtml(fileName)}</div>
              <div class="file-sub">${escapeHtml(fileSize || 'Скачать файл')}</div>
            </div>
          </a>
        `;
      } else if (msg.media_type === 'image' && rawUrl) {
        contentBlock += `<img class="msg-photo" src="${escapeHtml(rawUrl)}" alt="Фото" />`;
      } else if (msg.media_type === 'audio' && rawUrl) {
        contentBlock += buildVoicePlayerHtml();
      }

      if (mainText && msg.media_type !== 'audio' && !isVideoCircle) {
        contentBlock += `<div>${escapeHtml(mainText)}</div>`;
      }

      row.innerHTML = `
        ${showAuthor ? `<div class="msg-author" style="color:var(--accent)">${escapeHtml(msg.sender_name)}</div>` : ''}
        <div class="msg-bubble ${isVideoCircle ? 'circle-bubble' : ''}">
          ${contentBlock}
          <div class="msg-meta">
            ${isEdited ? '<span>изм.</span>' : ''}
            <span>${timeStr}</span>
            ${isOwn ? '<span>✓✓</span>' : ''}
          </div>
        </div>
      `;

      const bubbleEl = row.querySelector('.msg-bubble');

      const img = row.querySelector('.msg-photo');
      if (img) {
        img.addEventListener('click', (ev) => {
          ev.stopPropagation();
          lightboxImg.src = rawUrl;
          lightbox.classList.remove('hidden');
        });
      }

      const circleEl = row.querySelector('.video-note-wrap');
      if (circleEl) {
        const vid = circleEl.querySelector('video');
        const badge = circleEl.querySelector('.video-note-badge');
        circleEl.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (vid.paused) {
            vid.muted = false;
            vid.play();
            if (badge) badge.textContent = '⏸ Пауза';
          } else {
            vid.pause();
            if (badge) badge.textContent = '▶ Кружочек';
          }
        });
      }

      const voiceWrap = row.querySelector('.voice-player');
      if (voiceWrap) {
        bindVoicePlayer(voiceWrap, rawUrl);
      }

      // Нажатие на пузырёк сообщения открывает чистое меню действий (как в Telegram)
      bubbleEl.addEventListener('click', (ev) => {
        if (ev.target.closest('.voice-play-btn') || ev.target.closest('.file-card')) return;
        openMessageActionSheet({
          msg,
          plainText: mainText,
          quoteLine,
          isEdited,
          isVideoCircle,
          isFileAttachment
        });
      });

      messagesViewport.appendChild(row);
    }

    messagesViewport.scrollTop = messagesViewport.scrollHeight;
  }

  // Меню действий над сообщением (Ответить / Изменить / Скопировать / Удалить)
  function openMessageActionSheet(ctx) {
    selectedMsgContext = ctx;
    const isOwn = ctx.msg.sender_id === currentUser.id;
    const isPlainTextMsg = ctx.msg.media_type === 'text' && !ctx.msg.media_url;

    sheetEditBtn.classList.toggle('hidden', !(isOwn && isPlainTextMsg));
    sheetCopyBtn.classList.toggle('hidden', !ctx.plainText);
    msgActionModal.classList.remove('hidden');
  }

  sheetCancelBtn.addEventListener('click', () => {
    msgActionModal.classList.add('hidden');
  });

  msgActionModal.addEventListener('click', (e) => {
    if (e.target === msgActionModal) msgActionModal.classList.add('hidden');
  });

  sheetReplyBtn.addEventListener('click', () => {
    if (!selectedMsgContext) return;
    const { msg, plainText, isVideoCircle, isFileAttachment } = selectedMsgContext;
    msgActionModal.classList.add('hidden');
    editingMsg = null;
    replyToMsg = {
      author: msg.sender_name,
      text:
        plainText ||
        (isVideoCircle
          ? '[Видеокружочек]'
          : isFileAttachment
          ? '[Файл]'
          : msg.media_type === 'image'
          ? '[Фотография]'
          : '[Голосовое сообщение]')
    };
    replyTargetAuthor.textContent = `Ответ для ${replyToMsg.author}`;
    replyTargetText.textContent = replyToMsg.text;
    replyPreviewBar.classList.remove('hidden');
    messageInput.focus();
  });

  sheetEditBtn.addEventListener('click', () => {
    if (!selectedMsgContext) return;
    const { msg, plainText, quoteLine } = selectedMsgContext;
    msgActionModal.classList.add('hidden');
    replyToMsg = null;
    editingMsg = {
      id: msg.id,
      created_at: msg.created_at,
      quoteLine: quoteLine || '',
      plainText: plainText || ''
    };
    replyTargetAuthor.textContent = '✏️ Редактирование сообщения';
    replyTargetText.textContent = editingMsg.plainText;
    replyPreviewBar.classList.remove('hidden');
    messageInput.value = editingMsg.plainText;
    updateSmartActionButtonUI();
    messageInput.focus();
  });

  sheetCopyBtn.addEventListener('click', async () => {
    if (!selectedMsgContext || !selectedMsgContext.plainText) return;
    msgActionModal.classList.add('hidden');
    try {
      await navigator.clipboard.writeText(selectedMsgContext.plainText);
    } catch (e) {}
  });

  sheetDeleteBtn.addEventListener('click', () => {
    if (!selectedMsgContext) return;
    msgActionModal.classList.add('hidden');
    const isOwn = selectedMsgContext.msg.sender_id === currentUser.id;
    deleteForAllBtn.classList.toggle('hidden', !isOwn);
    deleteConfirmModal.classList.remove('hidden');
  });

  cancelDeleteModalBtn.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
  });

  // Удаление только у себя (локально скрывает сообщение)
  deleteForMeBtn.addEventListener('click', async () => {
    if (!selectedMsgContext) return;
    const msgId = selectedMsgContext.msg.id;
    deleteConfirmModal.classList.add('hidden');
    hideMsgLocally(msgId);
    await renderMessages();
  });

  // Удаление у всех (с сервера Supabase)
  deleteForAllBtn.addEventListener('click', async () => {
    if (!selectedMsgContext) return;
    const msgId = selectedMsgContext.msg.id;
    deleteConfirmModal.classList.add('hidden');
    await supabaseClient.from('messages').delete().eq('id', msgId);
    roomMessages = roomMessages.filter((m) => m.id !== msgId);
    await renderMessages();
  });

  function clearReplyOrEditBar() {
    replyToMsg = null;
    editingMsg = null;
    replyPreviewBar.classList.add('hidden');
  }

  cancelReplyBtn.addEventListener('click', () => {
    if (editingMsg) {
      messageInput.value = '';
      updateSmartActionButtonUI();
    }
    clearReplyOrEditBar();
  });

  function buildVoicePlayerHtml() {
    const heights = [35, 65, 45, 85, 55, 95, 70, 40, 80, 60, 90, 50, 75, 45, 85, 60, 40, 55];
    const bars = heights.map((h) => `<div class="voice-bar" style="height:${h}%"></div>`).join('');
    return `
      <div class="voice-player">
        <button class="voice-play-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 20 12 6 20 6 4"/>
          </svg>
        </button>
        <div class="voice-wave">${bars}</div>
      </div>
    `;
  }

  function bindVoicePlayer(container, audioUrl) {
    const btn = container.querySelector('.voice-play-btn');
    const bars = Array.from(container.querySelectorAll('.voice-bar'));
    const audio = new Audio(audioUrl);

    const playIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
    const pauseIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (audio.paused) {
        audio.play();
        btn.innerHTML = pauseIcon;
      } else {
        audio.pause();
        btn.innerHTML = playIcon;
      }
    });

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const ratio = audio.currentTime / audio.duration;
      const activeCount = Math.ceil(ratio * bars.length);
      bars.forEach((b, idx) => b.classList.toggle('played', idx < activeCount));
    });

    audio.addEventListener('ended', () => {
      btn.innerHTML = playIcon;
      bars.forEach((b) => b.classList.remove('played'));
    });
  }

  lightbox.addEventListener('click', () => {
    lightbox.classList.add('hidden');
    lightboxImg.src = '';
  });

  // 13. Трансляция индикатора «печатает...»
  function broadcastUserAction(actionText) {
    if (!realtimeChannel || !activeRoom || !currentUser) return;
    const now = Date.now();
    if (now - lastTypingBroadcastAt < 1500 && actionText === 'печатает...') return;
    lastTypingBroadcastAt = now;

    realtimeChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        room_id: activeRoom.id,
        user_id: currentUser.id,
        name: currentUser.display_name,
        action: actionText
      }
    });
  }

  // 14. УМНАЯ КНОПКА 3-В-1 + ЗАПИСЬ КРУЖОЧКОВ С ПАУЗОЙ И ПЕРЕВОРОТОМ КАМЕРЫ
  function hasTypedText() {
    return messageInput.value.trim().length > 0;
  }

  function updateSmartActionButtonUI() {
    if (!smartActionBtn) return;
    if (hasTypedText() || isRecording) {
      smartActionBtn.innerHTML = ICON_SEND;
      smartActionBtn.title = 'Отправить';
    } else if (recordMode === 'video') {
      smartActionBtn.innerHTML = ICON_VIDEO;
      smartActionBtn.title = 'Тап — сменить на микрофон. Удержание — запись видеокружочка';
    } else {
      smartActionBtn.innerHTML = ICON_MIC;
      smartActionBtn.title = 'Тап — сменить на видеокружочек. Удержание — запись голоса';
    }
  }

  updateSmartActionButtonUI();

  messageInput.addEventListener('input', () => {
    updateSmartActionButtonUI();
    if (hasTypedText()) {
      broadcastUserAction('печатает...');
    }
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  });

  attachBtn.addEventListener('click', () => {
    if (!activeRoom || isRecording) return;
    attachmentInput.click();
  });

  attachmentInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !activeRoom) return;
    attachmentInput.value = '';

    if (file.size > 45 * 1024 * 1024) {
      alert('Максимальный размер файла — 45 МБ.');
      return;
    }

    try {
      if (file.type && file.type.startsWith('image/')) {
        broadcastUserAction('отправляет фото...');
        const blob = await compressImage(file, 1280, 0.84);
        const path = `photos/${currentUser.id}_${Date.now()}.jpg`;
        const { error: upErr } = await supabaseClient.storage
          .from('chat-media')
          .upload(path, blob, { contentType: 'image/jpeg' });
        if (upErr) throw upErr;

        const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
        await sendMessage({ content: '', media_type: 'image', media_url: pub.publicUrl });
      } else {
        broadcastUserAction('загружает файл...');
        const safeExt = (file.name.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '');
        const path = `files/${currentUser.id}_${Date.now()}.${safeExt}`;
        const { error: upErr } = await supabaseClient.storage
          .from('chat-media')
          .upload(path, file, { contentType: file.type || 'application/octet-stream' });
        if (upErr) throw upErr;

        const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
        const sizeStr = formatFileSize(file.size);
        const taggedUrl = `${pub.publicUrl}#file:${encodeURIComponent(file.name)}:${encodeURIComponent(sizeStr)}`;
        await sendMessage({ content: '', media_type: 'image', media_url: taggedUrl });
      }
    } catch (err) {
      alert('Ошибка загрузки вложения: ' + (err.message || err));
    }
  });

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  }

  smartActionBtn.addEventListener('pointerdown', (e) => {
    if (!activeRoom) return;
    e.preventDefault();

    if (isRecording) {
      finishAndSendRecording();
      return;
    }

    if (hasTypedText()) {
      handleSendText();
      return;
    }

    pointerStartY = e.clientY;
    try {
      smartActionBtn.setPointerCapture(e.pointerId);
    } catch (err) {}

    holdTimer = setTimeout(() => {
      holdTimer = null;
      startSmartRecording(recordMode);
    }, 220);
  });

  smartActionBtn.addEventListener('pointermove', (e) => {
    if (!isRecording || isRecordingLocked) return;
    const deltaY = e.clientY - pointerStartY;
    if (deltaY < -40) {
      lockActiveRecording();
    }
  });

  function handlePointerRelease() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
      recordMode = recordMode === 'voice' ? 'video' : 'voice';
      localStorage.setItem('pulse_rec_mode', recordMode);
      updateSmartActionButtonUI();
      return;
    }

    // Для видеокружочка сразу оставляем интерактивное окно с кнопками Камера / Пауза / Отмена / Отправить,
    // а для голосового: если не закреплено замком, отпускание пальца отправляет голосовое
    if (isRecording && !isRecordingLocked && recordMode === 'voice') {
      finishAndSendRecording();
    }
  }

  smartActionBtn.addEventListener('pointerup', handlePointerRelease);
  smartActionBtn.addEventListener('pointercancel', handlePointerRelease);

  async function openCameraStream(facing) {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 480 }, height: { ideal: 480 } },
      audio: true
    });
  }

  async function startSmartRecording(mode) {
    if (isRecording || !activeRoom) return;
    isRecording = true;
    isRecordingLocked = mode === 'video'; // Видеокружочек сразу управляемый кнопками (Камера, Пауза, Отмена, Отправить)
    isRecordingPaused = false;
    recordCanceled = false;
    recordedChunks = [];
    elapsedRecordMs = 0;

    try {
      if (mode === 'video') {
        activeMediaStream = await openCameraStream(cameraFacingMode);
        videoCirclePreview.srcObject = activeMediaStream;
        videoCirclePreview.classList.toggle('mirrored', cameraFacingMode === 'user');
        videoCircleOverlay.classList.remove('hidden');
        vcPauseBtn.textContent = '⏸ Пауза';
        const mime = getSupportedVideoMime();
        activeMediaRecorder = mime
          ? new MediaRecorder(activeMediaStream, { mimeType: mime })
          : new MediaRecorder(activeMediaStream);
      } else {
        activeMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mime = getSupportedAudioMime();
        activeMediaRecorder = mime
          ? new MediaRecorder(activeMediaStream, { mimeType: mime })
          : new MediaRecorder(activeMediaStream);
      }

      bindMediaRecorderEvents(mode);
      activeMediaRecorder.start(250);
      lastResumeTime = Date.now();

      if (mode === 'voice') {
        messageInput.classList.add('hidden');
        recordingBar.classList.remove('hidden');
        lockHintPill.classList.remove('hidden');
        smartActionBtn.classList.add('recording-hold');
        recDot.classList.remove('paused');
        pauseVoiceBtn.textContent = '⏸ Пауза';
        recordingTimer.textContent = '0:00';
      } else {
        vcStatusLabel.innerHTML = `🔴 Запись: <span id="vcTimerText">0:00</span>`;
      }

      updateSmartActionButtonUI();
      broadcastUserAction(mode === 'video' ? 'записывает кружочек...' : 'записывает голосовое...');

      recordTimerInterval = setInterval(() => {
        if (isRecordingPaused) return;
        const totalMs = elapsedRecordMs + (Date.now() - lastResumeTime);
        const sec = Math.floor(totalMs / 1000);
        const m = Math.floor(sec / 60);
        const s = String(sec % 60).padStart(2, '0');
        const formatted = `${m}:${s}`;
        if (mode === 'voice') {
          recordingTimer.textContent = formatted;
        } else {
          vcStatusLabel.innerHTML = `🔴 Запись: <span>${formatted}</span>`;
        }
        broadcastUserAction(mode === 'video' ? 'записывает кружочек...' : 'записывает голосовое...');
        if (sec >= 60 && activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
          finishAndSendRecording();
        }
      }, 400);
    } catch (err) {
      cleanupRecordingUI();
      alert('Разрешите доступ к микрофону и камере в настройках браузера.');
    }
  }

  function bindMediaRecorderEvents(mode) {
    activeMediaRecorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data);
    };

    activeMediaRecorder.onstop = async () => {
      // Если идёт смена камеры на лету, не завершаем запись
      if (activeMediaRecorder && activeMediaRecorder._switchingCamera) return;

      clearInterval(recordTimerInterval);
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((t) => t.stop());
        activeMediaStream = null;
      }

      const wasCanceled = recordCanceled;
      const chunksCopy = recordedChunks.slice();
      const usedMime = activeMediaRecorder?.mimeType || (mode === 'video' ? 'video/mp4' : 'audio/mp4');
      const usedFacing = cameraFacingMode;

      cleanupRecordingUI();

      if (wasCanceled || !chunksCopy.length) return;

      const blob = new Blob(chunksCopy, { type: usedMime });
      if (blob.size < 400) return;

      try {
        if (mode === 'video') {
          broadcastUserAction('отправляет кружочек...');
          const ext = usedMime.includes('mp4') ? 'mp4' : 'webm';
          const path = `circles/${currentUser.id}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabaseClient.storage
            .from('chat-media')
            .upload(path, blob, { contentType: usedMime });
          if (upErr) throw upErr;

          const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
          const tag = usedFacing === 'environment' ? '#circle-rear' : '#circle';
          await sendMessage({
            content: '',
            media_type: 'audio',
            media_url: `${pub.publicUrl}${tag}`
          });
        } else {
          broadcastUserAction('отправляет голосовое...');
          const ext = usedMime.includes('mp4') ? 'm4a' : 'webm';
          const path = `voice/${currentUser.id}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabaseClient.storage
            .from('chat-media')
            .upload(path, blob, { contentType: usedMime });
          if (upErr) throw upErr;

          const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
          await sendMessage({
            content: '',
            media_type: 'audio',
            media_url: pub.publicUrl
          });
        }
      } catch (err) {
        alert('Ошибка отправки записи: ' + (err.message || err));
      }
    };
  }

  function cleanupRecordingUI() {
    videoCircleOverlay.classList.add('hidden');
    recordingBar.classList.add('hidden');
    lockHintPill.classList.add('hidden');
    messageInput.classList.remove('hidden');
    smartActionBtn.classList.remove('recording-hold');
    isRecording = false;
    isRecordingLocked = false;
    isRecordingPaused = false;
    activeMediaRecorder = null;
    updateSmartActionButtonUI();
  }

  function lockActiveRecording() {
    if (!isRecording || isRecordingLocked) return;
    isRecordingLocked = true;
    lockHintPill.classList.add('hidden');
    smartActionBtn.classList.remove('recording-hold');
    updateSmartActionButtonUI();
  }

  // Пауза / Продолжить для голосового сообщения
  pauseVoiceBtn.addEventListener('click', () => {
    if (!isRecording || !activeMediaRecorder) return;
    lockActiveRecording();
    togglePauseRecording('voice');
  });

  // Пауза / Продолжить для видеокружочка
  vcPauseBtn.addEventListener('click', () => {
    if (!isRecording || !activeMediaRecorder) return;
    togglePauseRecording('video');
  });

  function togglePauseRecording(mode) {
    try {
      if (!isRecordingPaused && activeMediaRecorder.state === 'recording') {
        activeMediaRecorder.pause();
        elapsedRecordMs += Date.now() - lastResumeTime;
        isRecordingPaused = true;
        if (mode === 'voice') {
          recDot.classList.add('paused');
          pauseVoiceBtn.textContent = '▶ Далее';
        } else {
          vcPauseBtn.textContent = '▶ Далее';
          vcStatusLabel.innerHTML = `⏸ На паузе`;
        }
      } else if (isRecordingPaused && activeMediaRecorder.state === 'paused') {
        activeMediaRecorder.resume();
        lastResumeTime = Date.now();
        isRecordingPaused = false;
        if (mode === 'voice') {
          recDot.classList.remove('paused');
          pauseVoiceBtn.textContent = '⏸ Пауза';
        } else {
          vcPauseBtn.textContent = '⏸ Пауза';
        }
      }
    } catch (e) {}
  }

  // Переворот камеры (Фронтальная ↔ Основная) в видеокружочке
  vcFlipCamBtn.addEventListener('click', async () => {
    if (!isRecording) return;
    cameraFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    try {
      if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
        activeMediaRecorder._switchingCamera = true;
        activeMediaRecorder.stop();
      }
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((t) => t.stop());
      }
      recordedChunks = []; // Начинаем запись с выбранного ракурса камеры
      elapsedRecordMs = 0;
      lastResumeTime = Date.now();
      isRecordingPaused = false;
      vcPauseBtn.textContent = '⏸ Пауза';

      activeMediaStream = await openCameraStream(cameraFacingMode);
      videoCirclePreview.srcObject = activeMediaStream;
      videoCirclePreview.classList.toggle('mirrored', cameraFacingMode === 'user');

      const mime = getSupportedVideoMime();
      activeMediaRecorder = mime
        ? new MediaRecorder(activeMediaStream, { mimeType: mime })
        : new MediaRecorder(activeMediaStream);
      bindMediaRecorderEvents('video');
      activeMediaRecorder.start(250);
    } catch (err) {
      alert('Не удалось переключить камеру: ' + (err.message || err));
    }
  });

  // Отправка и отмена кружочка / голосового
  vcSendBtn.addEventListener('click', () => finishAndSendRecording());

  vcCancelBtn.addEventListener('click', () => {
    if (!isRecording || !activeMediaRecorder) return;
    recordCanceled = true;
    if (activeMediaRecorder.state !== 'inactive') {
      activeMediaRecorder.stop();
    } else {
      cleanupRecordingUI();
    }
  });

  function finishAndSendRecording() {
    if (!isRecording || !activeMediaRecorder) return;
    recordCanceled = false;
    if (activeMediaRecorder.state !== 'inactive') {
      activeMediaRecorder.stop();
    }
  }

  cancelRecordBtn.addEventListener('click', () => {
    if (!isRecording || !activeMediaRecorder) return;
    recordCanceled = true;
    if (activeMediaRecorder.state !== 'inactive') {
      activeMediaRecorder.stop();
    }
  });

  // 15. Отправка и Редактирование текстовых сообщений
  async function handleSendText() {
    if (!activeRoom) return;
    let text = messageInput.value.trim();
    if (!text) return;
    messageInput.value = '';
    updateSmartActionButtonUI();

    // Если редактируем существующее сообщение
    if (editingMsg) {
      const targetId = editingMsg.id;
      const origCreatedAt = editingMsg.created_at;
      const quotePrefix = editingMsg.quoteLine ? `>>${editingMsg.quoteLine}\n` : '';
      const fullPlain = `[edit]${quotePrefix}${text}`;
      clearReplyOrEditBar();

      const encryptedContent = await encryptTextForRoom(fullPlain, activeRoom);

      // Обновляем локально
      const idx = roomMessages.findIndex((m) => m.id === targetId);
      if (idx !== -1) {
        roomMessages[idx].content = encryptedContent;
        await renderMessages();
      }

      // Заменяем запись в Supabase с сохранением исходного id и времени created_at
      await supabaseClient.from('messages').delete().eq('id', targetId);
      const { error } = await supabaseClient.from('messages').insert({
        id: targetId,
        room_id: activeRoom.id,
        sender_id: currentUser.id,
        sender_name: currentUser.display_name,
        sender_color: currentUser.color,
        content: encryptedContent,
        media_type: 'text',
        media_url: null,
        created_at: origCreatedAt
      });

      if (error) {
        alert('Не удалось сохранить изменения: ' + error.message);
      }
      return;
    }

    if (replyToMsg) {
      const shortQuote = replyToMsg.text.slice(0, 70);
      text = `>>${replyToMsg.author}: ${shortQuote}\n${text}`;
      clearReplyOrEditBar();
    }

    const encryptedContent = await encryptTextForRoom(text, activeRoom);
    await sendMessage({ content: encryptedContent, media_type: 'text', media_url: null });
  }

  async function sendMessage({ content, media_type, media_url }) {
    const msg = {
      id: window.crypto?.randomUUID ? crypto.randomUUID() : 'msg_' + Date.now(),
      room_id: activeRoom.id,
      sender_id: currentUser.id,
      sender_name: currentUser.display_name,
      sender_color: currentUser.color,
      content: content || '',
      media_type: media_type || 'text',
      media_url: media_url || null,
      created_at: new Date().toISOString()
    };

    roomMessages.push(msg);
    await renderMessages();

    const { error } = await supabaseClient.from('messages').insert({
      id: msg.id,
      room_id: msg.room_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name,
      sender_color: msg.sender_color,
      content: msg.content,
      media_type: msg.media_type,
      media_url: msg.media_url
    });

    if (error) {
      alert('Ошибка отправки: ' + error.message);
    }
  }

  // 16. Realtime подписка
  function subscribeRealtime() {
    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);

    realtimeChannel = supabaseClient.channel('pulse-global-v5', {
      config: {
        presence: { key: currentUser.id }
      }
    });

    realtimeChannel
      .on('presence', { event: 'sync' }, () => {
        const state = realtimeChannel.presenceState();
        onlineUserIds.clear();
        onlineUserIds.add(currentUser.id);
        Object.keys(state).forEach((uid) => onlineUserIds.add(uid));
        myRooms = myRooms.map((r) => decorateRoomForUser(r));
        if (activeRoom) {
          const updated = myRooms.find((r) => r.id === activeRoom.id);
          if (updated) activeRoom = updated;
        }
        updateActiveRoomHeaderUI();
        renderSidebarList();
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload || payload.user_id === currentUser.id) return;
        typingByRoom.set(payload.room_id, {
          name: payload.name || 'Собеседник',
          action: payload.action || 'печатает...',
          expiresAt: Date.now() + 3000
        });
        updateActiveRoomHeaderUI();
        renderSidebarList();
        setTimeout(() => {
          updateActiveRoomHeaderUI();
          renderSidebarList();
        }, 3100);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const incoming = payload.new;
        if (incoming.sender_id !== currentUser.id) {
          typingByRoom.delete(incoming.room_id);
          playNotificationSound();
        }
        if (activeRoom && incoming.room_id === activeRoom.id) {
          const existingIdx = roomMessages.findIndex((m) => m.id === incoming.id);
          if (existingIdx !== -1) {
            roomMessages[existingIdx] = incoming;
          } else {
            roomMessages.push(incoming);
            roomMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          }
          await renderMessages();
          updateActiveRoomHeaderUI();
        } else {
          await refreshDirectoryAndRooms();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, async (payload) => {
        const deletedId = payload.old?.id;
        if (deletedId && activeRoom) {
          // Небольшая задержка на случай, если удаление было частью редактирования (delete + insert)
          setTimeout(async () => {
            await loadMessages(activeRoom.id);
          }, 250);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        refreshDirectoryAndRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        refreshDirectoryAndRooms();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await realtimeChannel.track({
            user_id: currentUser.id,
            online_at: new Date().toISOString()
          });
        }
      });
  }

  function getSupportedAudioMime() {
    const list = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    for (const m of list) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
    }
    return '';
  }

  function getSupportedVideoMime() {
    const list = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    for (const m of list) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
    }
    return '';
  }

  function compressImage(file, maxSide = 1280, quality = 0.84) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width > height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Ошибка сжатия'))), 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if (initSupabase()) {
    bootSession();
  }
})();
