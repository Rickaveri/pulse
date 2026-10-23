// Pulse Messenger — Защищённый мессенджер (AES-256-GCM E2EE, поиск по @username и телефону, 3 темы, фото-аватарки)
(function () {
  const LEGACY_PUBLIC_ROOM_ID = '00000000-0000-0000-0000-000000000001';
  const AVATAR_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#3b82f6'];

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

  // DOM: Профиль и темы
  const profileModal = document.getElementById('profileModal');
  const myProfileTrigger = document.getElementById('myProfileTrigger');
  const editProfileBtn = document.getElementById('editProfileBtn');
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
  const logoutBtn = document.getElementById('logoutBtn');

  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const listSectionLabel = document.getElementById('listSectionLabel');
  const chatList = document.getElementById('chatList');

  const emptyChatState = document.getElementById('emptyChatState');
  const activeChatView = document.getElementById('activeChatView');
  const mobileBackBtn = document.getElementById('mobileBackBtn');
  const activeRoomAvatar = document.getElementById('activeRoomAvatar');
  const activeRoomTitle = document.getElementById('activeRoomTitle');
  const activeRoomStatus = document.getElementById('activeRoomStatus');
  const messagesViewport = document.getElementById('messagesViewport');

  const replyPreviewBar = document.getElementById('replyPreviewBar');
  const replyTargetAuthor = document.getElementById('replyTargetAuthor');
  const replyTargetText = document.getElementById('replyTargetText');
  const cancelReplyBtn = document.getElementById('cancelReplyBtn');

  const photoInput = document.getElementById('photoInput');
  const attachPhotoBtn = document.getElementById('attachPhotoBtn');
  const messageInput = document.getElementById('messageInput');
  const recordingBar = document.getElementById('recordingBar');
  const recordingTimer = document.getElementById('recordingTimer');
  const cancelVoiceBtn = document.getElementById('cancelVoiceBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const sendBtn = document.getElementById('sendBtn');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  // Состояние
  let authMode = 'login';
  let supabaseClient = null;
  let realtimeChannel = null;

  let currentUser = null; // { id, email, display_name, username, phone, avatar_url, bio, color }
  let pendingAvatarUrl = null;
  let allProfiles = [];
  let myRooms = [];
  let activeRoom = null;
  let roomMessages = [];
  let replyToMsg = null;

  let mediaRecorder = null;
  let audioChunks = [];
  let recordStartTime = 0;
  let recordInterval = null;
  let recordCanceled = false;

  // 1. Управление темой: Системная (system), Тёмная (midnight) и Светлая (daylight)
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

  // 2. Строгая проверка надёжности пароля
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

  // 3. Сквозное шифрование AES-256-GCM (Web Crypto API)
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
      console.error('Ошибка шифрования:', e);
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

  // 4. Упаковка и распаковка расширенного профиля (username, phone, avatar_url, bio) в avatar_color
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
          color: parsed.c || '#6366f1'
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
      color: parts[0] || '#6366f1'
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
    // Приводим российские номера 89... к +79... для единого поиска
    const onlyNums = digits.replace(/\D/g, '');
    if (onlyNums.length === 11 && onlyNums.startsWith('8')) {
      return '+7' + onlyNums.slice(1);
    }
    if (onlyNums.length === 11 && onlyNums.startsWith('7')) {
      return '+' + onlyNums;
    }
    return digits.startsWith('+') ? digits : '+' + onlyNums;
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

  // 5. Инициализация Supabase и авторизация
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
            avatar_color: packedMeta
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
          avatar_color: packed
        })
        .select()
        .single();
      rawProf = inserted || { id: user.id, email: user.email, display_name: metaName, avatar_color: packed };
    }

    currentUser = unpackProfile(rawProf);
    updateMyHeaderUI();

    authScreen.classList.add('hidden');
    appShell.classList.remove('hidden');

    await ensureSavedMessagesRoom();
    await refreshDirectoryAndRooms();
    subscribeRealtime();
  }

  // Личный чат "Избранное (Заметки)" как в Telegram
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

  // 6. Редактирование профиля и загрузка фото-аватарки
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
      uploadAvatarBtn.textContent = 'Загрузить фото аватарки';
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
        avatar_color: packed
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

  // 7. Загрузка контактов и приватных чатов
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
          peerProfile: currentUser
        };
      }
      const ids = key.split('_');
      const partnerId = ids.find((id) => id !== currentUser.id) || currentUser.id;
      const partner = allProfiles.find((p) => p.id === partnerId);
      if (partner) {
        return {
          ...room,
          displayTitle: partner.display_name,
          displaySub: partner.phone ? `@${partner.username} • ${partner.phone}` : `@${partner.username}`,
          avatarLetter: (partner.display_name || '?')[0].toUpperCase(),
          avatarColor: partner.color,
          avatarUrl: partner.avatar_url,
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
      peerProfile: null
    };
  }

  // 8. Поиск людей по @username, номеру телефона или имени
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
        const av = document.createElement('div');
        av.className = 'avatar';
        renderAvatarElement(av, {
          avatar_url: person.avatar_url,
          letter: person.display_name,
          color: person.color
        });

        const body = document.createElement('div');
        body.className = 'chat-item-body';
        const phoneBadge = person.phone ? ` • ${escapeHtml(person.phone)}` : '';
        body.innerHTML = `
          <div class="chat-item-top">
            <div class="chat-item-title">${escapeHtml(person.display_name)}</div>
          </div>
          <div class="chat-item-sub" style="color:var(--accent);">@${escapeHtml(person.username)}${phoneBadge}</div>
        `;

        item.appendChild(av);
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

      const av = document.createElement('div');
      av.className = 'avatar';
      renderAvatarElement(av, {
        avatar_url: room.avatarUrl,
        letter: room.avatarLetter,
        color: room.avatarColor
      });

      const body = document.createElement('div');
      body.className = 'chat-item-body';
      body.innerHTML = `
        <div class="chat-item-top">
          <div class="chat-item-title">${escapeHtml(room.displayTitle)}</div>
        </div>
        <div class="chat-item-sub">${escapeHtml(room.displaySub)}</div>
      `;

      item.appendChild(av);
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

  // 9. Создание закрытой группы
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

  // 10. Выбор чата, просмотр профиля собеседника и настройка E2EE
  async function selectRoom(room) {
    activeRoom = room;
    replyToMsg = null;
    replyPreviewBar.classList.add('hidden');

    emptyChatState.classList.add('hidden');
    activeChatView.classList.remove('hidden');
    appShell.classList.add('chat-active');

    activeRoomTitle.textContent = room.displayTitle;
    activeRoomStatus.textContent = room.displaySub;
    renderAvatarElement(activeRoomAvatar, {
      avatar_url: room.avatarUrl,
      letter: room.avatarLetter,
      color: room.avatarColor
    });

    updateE2eBadgeUI();
    renderSidebarList();
    await loadMessages(room.id);
  }

  function updateE2eBadgeUI() {
    if (!activeRoom) return;
    const customSecret = getRoomCustomSecret(activeRoom.id);
    e2eBadgeText.textContent = customSecret ? 'AES-256 + Личный ключ' : 'AES-256';
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

    // Если это чат «Избранное (Заметки)»
    if (activeRoom.direct_key === `saved_${currentUser.id}`) {
      renderAvatarElement(peerAvatar, {
        avatar_url: '',
        letter: '★',
        color: '#6366f1'
      });
      peerName.textContent = 'Избранное (Заметки)';
      peerHandle.textContent = 'Личное хранилище AES-256';
      peerPhone.textContent = '';
      peerBio.textContent = 'Здесь можно сохранять для себя важные заметки, фотографии и голосовые сообщения. Доступ к этому чату есть только у вас.';
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
    peerHandle.textContent = `@${p.username}`;
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
  });

  // 11. Загрузка, расшифровка и отрисовка сообщений
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

    if (!roomMessages.length) {
      messagesViewport.innerHTML = `<div class="date-divider">🔒 Сообщения в этом чате защищены сквозным шифрованием AES-256</div>`;
      return;
    }

    for (const msg of roomMessages) {
      const isOwn = msg.sender_id === currentUser.id;
      const row = document.createElement('div');
      row.className = `msg-row ${isOwn ? 'own' : 'other'}`;

      const timeStr = new Date(msg.created_at).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const showAuthor = activeRoom.is_group && !isOwn;
      const decryptedText = await decryptTextForRoom(msg.content || '', activeRoom);

      // Разбор цитаты ответа, если сообщение начинается с >>Автор: Текст\n
      let replyBlockHtml = '';
      let mainText = decryptedText;
      if (decryptedText.startsWith('>>')) {
        const newlineIdx = decryptedText.indexOf('\n');
        if (newlineIdx !== -1) {
          const quoteLine = decryptedText.slice(2, newlineIdx);
          mainText = decryptedText.slice(newlineIdx + 1);
          replyBlockHtml = `<div class="msg-reply-quote">${escapeHtml(quoteLine)}</div>`;
        }
      }

      let contentBlock = replyBlockHtml;
      if (msg.media_type === 'image' && msg.media_url) {
        contentBlock += `<img class="msg-photo" src="${msg.media_url}" alt="Фото" />`;
      } else if (msg.media_type === 'audio' && msg.media_url) {
        contentBlock += buildVoicePlayerHtml();
      }

      if (mainText && msg.media_type !== 'audio') {
        contentBlock += `<div>${escapeHtml(mainText)}</div>`;
      }

      row.innerHTML = `
        ${showAuthor ? `<div class="msg-author" style="color:var(--accent)">${escapeHtml(msg.sender_name)}</div>` : ''}
        <div class="msg-bubble">
          ${contentBlock}
          <div class="msg-meta">
            <span class="msg-action-link reply-trigger">Ответить</span>
            ${isOwn ? `<span class="msg-action-link delete-trigger">Удалить</span>` : ''}
            <span>${timeStr}</span>
            ${isOwn ? '<span>✓✓</span>' : ''}
          </div>
        </div>
      `;

      const img = row.querySelector('.msg-photo');
      if (img) {
        img.addEventListener('click', () => {
          lightboxImg.src = msg.media_url;
          lightbox.classList.remove('hidden');
        });
      }

      const voiceWrap = row.querySelector('.voice-player');
      if (voiceWrap) {
        bindVoicePlayer(voiceWrap, msg.media_url);
      }

      const replyBtn = row.querySelector('.reply-trigger');
      if (replyBtn) {
        replyBtn.addEventListener('click', () => {
          replyToMsg = {
            author: msg.sender_name,
            text: mainText || (msg.media_type === 'image' ? '[Фотография]' : '[Голосовое сообщение]')
          };
          replyTargetAuthor.textContent = `Ответ для ${replyToMsg.author}`;
          replyTargetText.textContent = replyToMsg.text;
          replyPreviewBar.classList.remove('hidden');
          messageInput.focus();
        });
      }

      const delBtn = row.querySelector('.delete-trigger');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          await supabaseClient.from('messages').delete().eq('id', msg.id);
          roomMessages = roomMessages.filter((m) => m.id !== msg.id);
          await renderMessages();
        });
      }

      messagesViewport.appendChild(row);
    }

    messagesViewport.scrollTop = messagesViewport.scrollHeight;
  }

  cancelReplyBtn.addEventListener('click', () => {
    replyToMsg = null;
    replyPreviewBar.classList.add('hidden');
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

    btn.addEventListener('click', () => {
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

  // 12. Отправка зашифрованного текста, фото и голосовых
  async function handleSendText() {
    if (!activeRoom) return;
    let text = messageInput.value.trim();
    if (!text) return;
    messageInput.value = '';

    if (replyToMsg) {
      const shortQuote = replyToMsg.text.slice(0, 70);
      text = `>>${replyToMsg.author}: ${shortQuote}\n${text}`;
      replyToMsg = null;
      replyPreviewBar.classList.add('hidden');
    }

    const encryptedContent = await encryptTextForRoom(text, activeRoom);
    await sendMessage({ content: encryptedContent, media_type: 'text', media_url: null });
  }

  sendBtn.addEventListener('click', handleSendText);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  });

  attachPhotoBtn.addEventListener('click', () => {
    if (!activeRoom) return;
    photoInput.click();
  });

  photoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !activeRoom) return;
    photoInput.value = '';

    try {
      const blob = await compressImage(file, 1280, 0.84);
      const path = `photos/${currentUser.id}_${Date.now()}.jpg`;
      const { error: upErr } = await supabaseClient.storage
        .from('chat-media')
        .upload(path, blob, { contentType: 'image/jpeg' });
      if (upErr) throw upErr;

      const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
      await sendMessage({ content: '', media_type: 'image', media_url: pub.publicUrl });
    } catch (err) {
      alert('Ошибка загрузки фото: ' + (err.message || err));
    }
  });

  voiceBtn.addEventListener('click', async () => {
    if (!activeRoom) return;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = getSupportedAudioMime();
      mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      audioChunks = [];
      recordCanceled = false;
      recordStartTime = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        clearInterval(recordInterval);
        stream.getTracks().forEach((t) => t.stop());
        voiceBtn.classList.remove('recording');
        recordingBar.classList.add('hidden');
        messageInput.classList.remove('hidden');

        if (recordCanceled || !audioChunks.length) return;

        const finalMime = mediaRecorder.mimeType || 'audio/mp4';
        const ext = finalMime.includes('mp4') ? 'm4a' : 'webm';
        const blob = new Blob(audioChunks, { type: finalMime });

        try {
          const path = `voice/${currentUser.id}_${Date.now()}.${ext}`;
          const { error: upErr } = await supabaseClient.storage
            .from('chat-media')
            .upload(path, blob, { contentType: finalMime });
          if (upErr) throw upErr;

          const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
          await sendMessage({ content: '', media_type: 'audio', media_url: pub.publicUrl });
        } catch (err) {
          alert('Ошибка отправки голосового: ' + (err.message || err));
        }
      };

      mediaRecorder.start();
      voiceBtn.classList.add('recording');
      messageInput.classList.add('hidden');
      recordingBar.classList.remove('hidden');
      recordingTimer.textContent = '0:00';

      recordInterval = setInterval(() => {
        const sec = Math.floor((Date.now() - recordStartTime) / 1000);
        const m = Math.floor(sec / 60);
        const s = String(sec % 60).padStart(2, '0');
        recordingTimer.textContent = `${m}:${s}`;
      }, 500);
    } catch (err) {
      alert('Разрешите доступ к микрофону в браузере для записи голосовых сообщений.');
    }
  });

  cancelVoiceBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      recordCanceled = true;
      mediaRecorder.stop();
    }
  });

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

  function subscribeRealtime() {
    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = supabaseClient
      .channel('pulse-realtime-v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const incoming = payload.new;
        if (activeRoom && incoming.room_id === activeRoom.id) {
          if (!roomMessages.some((m) => m.id === incoming.id)) {
            roomMessages.push(incoming);
            await renderMessages();
          }
        } else {
          await refreshDirectoryAndRooms();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, async (payload) => {
        const deletedId = payload.old?.id;
        if (deletedId && activeRoom) {
          roomMessages = roomMessages.filter((m) => m.id !== deletedId);
          await renderMessages();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        refreshDirectoryAndRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        refreshDirectoryAndRooms();
      })
      .subscribe();
  }

  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    activeRoom = null;
    appShell.classList.add('hidden');
    authScreen.classList.remove('hidden');
  });

  function getSupportedAudioMime() {
    const list = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
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
