// Pulse Messenger v14 — Чистый звук звонков без хрипа (подавление эха и шума), переключатель «Обычный динамик / Громкая связь» в звонках, предпросмотр фото с подписью перед отправкой, свайп влево по сообщению для ответа, мгновенные реакции
(function () {
  const LEGACY_PUBLIC_ROOM_ID = '00000000-0000-0000-0000-000000000001';
  const AVATAR_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#3b82f6'];

  const ICON_SEND = `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="transform:translateX(1px);"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  const ICON_MIC = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
  const ICON_VIDEO = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;

  // DOM: Тактильный отклик iPhone Taptic Engine
  const iosHapticLabel = document.getElementById('iosHapticLabel');

  // DOM: Всплывающий баннер уведомлений (In-App Toast) и Push-баннер
  const inAppToast = document.getElementById('inAppToast');
  const toastAvatar = document.getElementById('toastAvatar');
  const toastTitle = document.getElementById('toastTitle');
  const toastText = document.getElementById('toastText');
  const toastCloseBtn = document.getElementById('toastCloseBtn');
  const pushPromptBanner = document.getElementById('pushPromptBanner');
  const enablePushBannerBtn = document.getElementById('enablePushBannerBtn');
  const enablePushInSettingsBtn = document.getElementById('enablePushInSettingsBtn');
  const pushStatusSubtext = document.getElementById('pushStatusSubtext');

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
  const shareInviteBtn = document.getElementById('shareInviteBtn');
  const requestLogoutBtn = document.getElementById('requestLogoutBtn');

  const logoutConfirmModal = document.getElementById('logoutConfirmModal');
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

  // DOM: Предпросмотр фото и файла с подписью перед отправкой
  const mediaPreviewModal = document.getElementById('mediaPreviewModal');
  const mediaPreviewTitle = document.getElementById('mediaPreviewTitle');
  const mediaPreviewImg = document.getElementById('mediaPreviewImg');
  const mediaPreviewFileBox = document.getElementById('mediaPreviewFileBox');
  const mediaCaptionInput = document.getElementById('mediaCaptionInput');
  const confirmSendMediaBtn = document.getElementById('confirmSendMediaBtn');
  const cancelSendMediaBtn = document.getElementById('cancelSendMediaBtn');

  // DOM: Меню действий над сообщением, закрепление, пересылка, скачивание и удаление
  const msgActionModal = document.getElementById('msgActionModal');
  const reactEmojiBtns = Array.from(document.querySelectorAll('[data-react]'));
  const sheetReplyBtn = document.getElementById('sheetReplyBtn');
  const sheetPinBtn = document.getElementById('sheetPinBtn');
  const sheetForwardBtn = document.getElementById('sheetForwardBtn');
  const sheetEditBtn = document.getElementById('sheetEditBtn');
  const sheetCopyBtn = document.getElementById('sheetCopyBtn');
  const sheetDownloadBtn = document.getElementById('sheetDownloadBtn');
  const sheetDeleteBtn = document.getElementById('sheetDeleteBtn');
  const sheetCancelBtn = document.getElementById('sheetCancelBtn');

  const forwardModal = document.getElementById('forwardModal');
  const forwardRoomsList = document.getElementById('forwardRoomsList');
  const cancelForwardBtn = document.getElementById('cancelForwardBtn');

  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const deleteForMeBtn = document.getElementById('deleteForMeBtn');
  const deleteForAllBtn = document.getElementById('deleteForAllBtn');
  const cancelDeleteModalBtn = document.getElementById('cancelDeleteModalBtn');

  // DOM: Экран аудио/видеозвонков P2P WebRTC с переключателем Громкая / Обычный динамик
  const callOverlay = document.getElementById('callOverlay');
  const callRemoteAudio = document.getElementById('callRemoteAudio');
  const callVideoStage = document.getElementById('callVideoStage');
  const callRemoteVideo = document.getElementById('callRemoteVideo');
  const callLocalVideo = document.getElementById('callLocalVideo');
  const callPeerAvatar = document.getElementById('callPeerAvatar');
  const callPeerName = document.getElementById('callPeerName');
  const callStatusText = document.getElementById('callStatusText');
  const callSpeakerBtn = document.getElementById('callSpeakerBtn');
  const callSpeakerLabel = document.getElementById('callSpeakerLabel');
  const callMuteBtn = document.getElementById('callMuteBtn');
  const callMuteLabel = document.getElementById('callMuteLabel');
  const callFlipCamWrap = document.getElementById('callFlipCamWrap');
  const callFlipCamBtn = document.getElementById('callFlipCamBtn');
  const callAcceptWrap = document.getElementById('callAcceptWrap');
  const callAcceptBtn = document.getElementById('callAcceptBtn');
  const callHangupBtn = document.getElementById('callHangupBtn');
  const voiceCallBtn = document.getElementById('voiceCallBtn');
  const videoCallBtn = document.getElementById('videoCallBtn');

  // DOM: Видеокружочки с управлением камерой и паузой
  const videoCircleOverlay = document.getElementById('videoCircleOverlay');
  const videoCirclePreview = document.getElementById('videoCirclePreview');
  const vcStatusLabel = document.getElementById('vcStatusLabel');
  const vcCancelBtn = document.getElementById('vcCancelBtn');
  const vcFlipCamBtn = document.getElementById('vcFlipCamBtn');
  const vcPauseBtn = document.getElementById('vcPauseBtn');
  const vcSendBtn = document.getElementById('vcSendBtn');

  // DOM: Группы, карточка собеседника/чата с галереей и E2EE
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
  const sharedMediaGrid = document.getElementById('sharedMediaGrid');
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
  const chatSearchToggleBtn = document.getElementById('chatSearchToggleBtn');
  const chatSearchBar = document.getElementById('chatSearchBar');
  const chatSearchInput = document.getElementById('chatSearchInput');
  const chatSearchCloseBtn = document.getElementById('chatSearchCloseBtn');
  const pinnedMsgBar = document.getElementById('pinnedMsgBar');
  const pinnedMsgText = document.getElementById('pinnedMsgText');
  const unpinMsgBtn = document.getElementById('unpinMsgBtn');
  const messagesViewport = document.getElementById('messagesViewport');
  const scrollBottomBtn = document.getElementById('scrollBottomBtn');

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

  const roomMessagesCache = new Map();
  const roomSummaryMap = new Map();
  let currentSelectingRoomId = null;
  let activeChatFilterQuery = '';

  function getRoomDraft(roomId) {
    return localStorage.getItem(`pulse_draft_${roomId}`) || '';
  }

  function setRoomDraft(roomId, text) {
    if (!roomId) return;
    if (text && text.trim()) {
      localStorage.setItem(`pulse_draft_${roomId}`, text);
    } else {
      localStorage.removeItem(`pulse_draft_${roomId}`);
    }
  }

  const unreadCounts = new Map();
  let toastTimeout = null;
  let toastTargetRoomId = null;

  function getLastReadTimestamp(roomId) {
    return Number(localStorage.getItem(`pulse_read_ts_${roomId}`) || 0);
  }

  function setLastReadTimestamp(roomId, ts) {
    localStorage.setItem(`pulse_read_ts_${roomId}`, String(ts || Date.now()));
  }

  let replyToMsg = null;
  let editingMsg = null;
  let selectedMsgContext = null;
  let pendingAttachmentFile = null;

  const onlineUserIds = new Set();
  const typingByRoom = new Map();
  let lastTypingBroadcastAt = 0;
  let soundEnabled = localStorage.getItem('pulse_sound') !== 'off';

  // БЕЗЗВУЧНАЯ ТАКТИЛЬНАЯ ВИБРАЦИЯ (Убран низкочастотный генератор, вызывавший хрип динамика!)
  let sharedAudioCtx = null;
  function getAudioCtx() {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  }

  function triggerHaptic(type = 'light') {
    if (navigator.vibrate) {
      try {
        if (type === 'heavy') navigator.vibrate([22, 35, 18]);
        else if (type === 'medium') navigator.vibrate(16);
        else navigator.vibrate(9);
      } catch (e) {}
    }
    if (iosHapticLabel) {
      try {
        iosHapticLabel.click();
      } catch (e) {}
    }
  }

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
  let cameraFacingMode = 'user';
  let isRecording = false;
  let isRecordingLocked = false;
  let isRecordingPaused = false;
  let recordCanceled = false;
  let activeMediaRecorder = null;
  let activeMediaStream = null;
  let cachedAudioStream = null;
  let recordedChunks = [];
  let elapsedRecordMs = 0;
  let lastResumeTime = 0;
  let recordTimerInterval = null;
  let holdTimer = null;
  let pointerStartY = 0;

  // УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ВСТАВКИ СООБЩЕНИЯ В SUPABASE
  async function insertMessageRow({
    id,
    room_id,
    content,
    media_type,
    media_url,
    media_duration,
    created_at
  }) {
    const safeMediaType = ['text', 'image', 'audio'].includes(media_type) ? media_type : 'text';
    const payload = {
      room_id,
      sender_id: currentUser.id,
      sender_name: currentUser.display_name || currentUser.username || 'Пользователь',
      sender_color: currentUser.color || '#6366f1',
      content: content || '',
      media_type: safeMediaType,
      media_url: media_url || null,
      media_duration: media_duration || 0
    };
    if (id) payload.id = id;
    if (created_at) payload.created_at = created_at;

    return await supabaseClient.from('messages').insert(payload).select();
  }

  function detectMessageKind(msg) {
    if (msg.content && msg.content.startsWith('__REACT__|')) {
      return 'reaction_packet';
    }
    if (msg.content && msg.content.startsWith('__PIN__|')) {
      return 'pin_packet';
    }
    if (msg.content && msg.content.startsWith('__CALL__|')) {
      return 'call_log';
    }
    const url = (msg.media_url || '').toLowerCase();
    const mType = (msg.media_type || 'text').toLowerCase();

    if (url) {
      if (mType === 'video_circle' || url.includes('/circle_') || url.includes('video_circle')) {
        return 'video_circle';
      }
      if (mType === 'voice' || url.includes('/voice_') || (mType === 'audio' && !url.includes('/file_'))) {
        return 'voice';
      }
      if (mType === 'image' || /\.(jpg|jpeg|png|gif|webp|heic)(\?|$)/i.test(url)) {
        return 'image';
      }
      return 'file';
    }
    return 'text';
  }

  function parseCallLogMessage(content) {
    const parts = String(content || '').split('|');
    return {
      callType: parts[1] === 'video' ? 'video' : 'audio',
      status: parts[2] || 'missed',
      durationSec: Number(parts[3] || 0)
    };
  }

  // 0. ИСПРАВЛЕНИЕ КЛАВИАТУРЫ И ПОЛНОЙ ВЫСОТЫ ЭКРАНА В ВЕБ-ПРИЛОЖЕНИИ НА IPHONE
  function syncViewportHeight() {
    const vv = window.visualViewport;
    const screenH = window.screen ? window.screen.height : window.innerHeight;
    const innerH = window.innerHeight;
    const vvH = vv ? vv.height : innerH;

    const isStandalone = window.navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    const isPortrait = innerH >= window.innerWidth;
    const fullPhysicalH = (isStandalone && isPortrait && screenH > innerH && (screenH - innerH <= 90))
      ? screenH
      : innerH;

    const isKeyboardOpen = vv ? (innerH - vvH > 100) : false;
    document.body.classList.toggle('keyboard-open', isKeyboardOpen);

    if (appShell) {
      if (isKeyboardOpen && vv) {
        document.documentElement.style.height = `${Math.round(vvH)}px`;
        document.body.style.height = `${Math.round(vvH)}px`;
        appShell.style.bottom = 'auto';
        appShell.style.top = `${Math.max(0, Math.round(vv.offsetTop))}px`;
        appShell.style.height = `${Math.round(vvH)}px`;
      } else {
        document.documentElement.style.height = `${fullPhysicalH}px`;
        document.body.style.height = `${fullPhysicalH}px`;
        appShell.style.top = '0px';
        appShell.style.bottom = 'auto';
        appShell.style.height = `${fullPhysicalH}px`;
      }
    }

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

  if (messagesViewport && scrollBottomBtn) {
    messagesViewport.addEventListener('scroll', () => {
      const distFromBottom =
        messagesViewport.scrollHeight - messagesViewport.scrollTop - messagesViewport.clientHeight;
      scrollBottomBtn.classList.toggle('hidden', distFromBottom < 180);
    });
    scrollBottomBtn.addEventListener('click', () => {
      triggerHaptic('light');
      messagesViewport.scrollTo({ top: messagesViewport.scrollHeight, behavior: 'smooth' });
    });
  }

  if (chatSearchToggleBtn && chatSearchBar) {
    chatSearchToggleBtn.addEventListener('click', () => {
      triggerHaptic('light');
      const isHidden = chatSearchBar.classList.contains('hidden');
      if (isHidden) {
        chatSearchBar.classList.remove('hidden');
        chatSearchInput.value = '';
        activeChatFilterQuery = '';
        chatSearchInput.focus();
      } else {
        chatSearchBar.classList.add('hidden');
        chatSearchInput.value = '';
        activeChatFilterQuery = '';
        if (activeRoom) renderMessages(activeRoom.id);
      }
    });

    chatSearchInput.addEventListener('input', () => {
      activeChatFilterQuery = chatSearchInput.value.trim().toLowerCase();
      if (activeRoom) renderMessages(activeRoom.id);
    });

    chatSearchCloseBtn.addEventListener('click', () => {
      chatSearchBar.classList.add('hidden');
      chatSearchInput.value = '';
      activeChatFilterQuery = '';
      if (activeRoom) renderMessages(activeRoom.id);
    });
  }

  // 0.5. PUSH-УВЕДОМЛЕНИЯ И ВСПЛЫВАЮЩИЙ БАННЕР НОВЫХ СООБЩЕНИЙ
  function updatePushPermissionUI() {
    const supported = 'Notification' in window;
    if (!supported) {
      if (pushPromptBanner) pushPromptBanner.classList.add('hidden');
      if (enablePushInSettingsBtn) {
        enablePushInSettingsBtn.textContent = 'Только на экране Домой';
        enablePushInSettingsBtn.disabled = true;
      }
      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = 'Добавьте приложение «На экран Домой» в Safari (iOS 16.4+)';
      }
      return;
    }

    const perm = Notification.permission;
    if (perm === 'granted') {
      if (pushPromptBanner) pushPromptBanner.classList.add('hidden');
      if (enablePushInSettingsBtn) {
        enablePushInSettingsBtn.textContent = '✓ Включены';
        enablePushInSettingsBtn.disabled = false;
      }
      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = 'Системные Push-уведомления активны на этом устройстве';
      }
    } else if (perm === 'denied') {
      if (pushPromptBanner) pushPromptBanner.classList.add('hidden');
      if (enablePushInSettingsBtn) {
        enablePushInSettingsBtn.textContent = 'Заблокированы';
      }
      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = 'Разрешите уведомления для Pulse в настройках телефона';
      }
    } else {
      if (pushPromptBanner) pushPromptBanner.classList.remove('hidden');
      if (enablePushInSettingsBtn) {
        enablePushInSettingsBtn.textContent = 'Включить';
        enablePushInSettingsBtn.disabled = false;
      }
    }
  }

  async function requestNotificationPermission() {
    triggerHaptic('medium');
    if (!('Notification' in window)) {
      alert('Чтобы получать системные Push-уведомления на iPhone, откройте Pulse с иконки на экране «Домой» (iOS 16.4 и новее). Внутри приложения уведомления и баннеры уже работают!');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      updatePushPermissionUI();
      if (result === 'granted') {
        sendSystemNotification('Pulse — Уведомления включены 🔔', 'Теперь вы будете сразу получать оповещения о новых сообщениях и звонках.', null);
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  }

  if (enablePushBannerBtn) {
    enablePushBannerBtn.addEventListener('click', requestNotificationPermission);
  }
  if (enablePushInSettingsBtn) {
    enablePushInSettingsBtn.addEventListener('click', requestNotificationPermission);
  }

  async function sendSystemNotification(title, body, roomId) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            tag: roomId ? `pulse-room-${roomId}` : 'pulse-general',
            renotify: true,
            vibrate: [180, 80, 180],
            data: { roomId: roomId || null }
          });
          return;
        }
      }
      const n = new Notification(title, { body, tag: roomId || 'pulse' });
      n.onclick = () => {
        window.focus();
        if (roomId) {
          const target = myRooms.find((r) => r.id === roomId);
          if (target) selectRoom(target);
        }
      };
    } catch (e) {}
  }

  function showInAppToast({ title, text, peer, roomId }) {
    if (!inAppToast) return;
    toastTargetRoomId = roomId || null;
    toastTitle.textContent = title || 'Новое сообщение';
    toastText.textContent = text || 'Откройте диалог, чтобы прочитать';

    if (peer) {
      renderAvatarElement(toastAvatar, {
        avatar_url: peer.avatar_url,
        letter: peer.display_name,
        color: peer.color
      });
    } else {
      renderAvatarElement(toastAvatar, {
        avatar_url: '',
        letter: title || 'P',
        color: '#6366f1'
      });
    }

    inAppToast.classList.remove('hidden');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      inAppToast.classList.add('hidden');
    }, 4800);
  }

  if (inAppToast) {
    inAppToast.addEventListener('click', (e) => {
      if (e.target === toastCloseBtn) return;
      inAppToast.classList.add('hidden');
      if (toastTargetRoomId) {
        const room = myRooms.find((r) => r.id === toastTargetRoomId);
        if (room) selectRoom(room);
      }
    });
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      inAppToast.classList.add('hidden');
    });
  }

  function updateAppIconBadge() {
    let total = 0;
    unreadCounts.forEach((cnt) => {
      total += cnt;
    });
    if ('setAppBadge' in navigator) {
      if (total > 0) {
        navigator.setAppBadge(total).catch(() => {});
      } else if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch(() => {});
      }
    }
    document.title = total > 0 ? `(${total}) Pulse — Защищённый мессенджер` : 'Pulse — Защищённый мессенджер';
  }

  function parseCleanMessageStruct(decryptedText) {
    let textBody = String(decryptedText || '');
    let quoteLine = '';
    let isEdited = false;
    let inlineReaction = '';

    if (textBody.startsWith('[edit]')) {
      isEdited = true;
      textBody = textBody.slice(6).trimStart();
    }

    const reactMatch = textBody.match(/\n\[react:([^\]]+)\]$/);
    if (reactMatch) {
      inlineReaction = reactMatch[1];
      textBody = textBody.slice(0, -reactMatch[0].length);
    }

    if (textBody.endsWith('\n[edited]')) {
      isEdited = true;
      textBody = textBody.slice(0, -9);
    } else if (textBody === '[edited]') {
      isEdited = true;
      textBody = '';
    }

    if (textBody.startsWith('> ')) {
      const nlIdx = textBody.indexOf('\n');
      if (nlIdx !== -1) {
        quoteLine = textBody.slice(2, nlIdx).trim();
        textBody = textBody.slice(nlIdx + 1);
      }
    } else if (textBody.startsWith('>>')) {
      const nlIdx = textBody.indexOf('\n');
      if (nlIdx !== -1) {
        quoteLine = textBody.slice(2, nlIdx).trim();
        textBody = textBody.slice(nlIdx + 1);
      } else {
        quoteLine = '';
        textBody = textBody.replace(/^>>/, '↩ ');
      }
    }

    return { textBody, quoteLine, isEdited, inlineReaction };
  }

  async function extractMessagePreviewText(msg, room) {
    if (!msg) return '';
    const kind = detectMessageKind(msg);
    if (kind === 'reaction_packet') {
      const parts = msg.content.split('|');
      return `Поставил(а) реакцию ${parts[2] || '❤️'}`;
    }
    if (kind === 'pin_packet') {
      return '📌 Закрепил(а) сообщение';
    }
    if (kind === 'call_log') {
      const info = parseCallLogMessage(msg.content);
      const label = info.callType === 'video' ? '📹 Видеозвонок' : '📞 Аудиозвонок';
      if (info.status === 'completed' && info.durationSec > 0) {
        return `${label} (${formatSec(info.durationSec)})`;
      }
      return `${label} (пропущенный)`;
    }
    if (kind === 'voice') return '🎤 Голосовое сообщение';
    if (kind === 'video_circle') return '📹 Видеокружочек';
    if (kind === 'image') {
      if (msg.content) {
        const dec = await decryptTextForRoom(msg.content, room);
        const { textBody } = parseCleanMessageStruct(dec);
        if (textBody.trim()) return `📷 ${textBody.trim()}`;
      }
      return '📷 Фотография';
    }
    if (kind === 'file') return '📎 Файл';
    if (msg.content) {
      const decrypted = await decryptTextForRoom(msg.content, room);
      const { textBody } = parseCleanMessageStruct(decrypted);
      return textBody.trim() || 'Сообщение';
    }
    return 'Сообщение';
  }

  function formatShortRoomTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    }
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  }

  async function updateSingleRoomSummaryFromMessages(room, msgs) {
    if (!room) return;
    const hiddenIds = getLocallyHiddenMsgIds();
    const visible = (msgs || []).filter((m) => {
      const k = detectMessageKind(m);
      return !hiddenIds.has(m.id) && k !== 'reaction_packet' && k !== 'pin_packet';
    });
    if (visible.length === 0) {
      roomSummaryMap.delete(room.id);
      return;
    }
    const lastMsg = visible[visible.length - 1];
    const rawPreview = await extractMessagePreviewText(lastMsg, room);
    const prefix = lastMsg.sender_id === currentUser.id ? 'Вы: ' : '';
    roomSummaryMap.set(room.id, {
      preview: `${prefix}${rawPreview}`,
      timeStr: formatShortRoomTime(lastMsg.created_at),
      timestamp: new Date(lastMsg.created_at).getTime()
    });
  }

  async function preloadAllRoomsMessages() {
    if (!currentUser || !supabaseClient || myRooms.length === 0) return;
    const roomIds = myRooms.map((r) => r.id);
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .in('room_id', roomIds)
      .order('created_at', { ascending: true })
      .limit(900);

    if (error || !data) return;

    const grouped = new Map();
    roomIds.forEach((id) => grouped.set(id, []));
    data.forEach((m) => {
      if (!grouped.has(m.room_id)) grouped.set(m.room_id, []);
      grouped.get(m.room_id).push(m);
    });

    await Promise.all(
      myRooms.map(async (room) => {
        const list = grouped.get(room.id) || [];
        roomMessagesCache.set(room.id, list);

        if (!activeRoom || activeRoom.id !== room.id) {
          const lastReadTs = getLastReadTimestamp(room.id);
          if (lastReadTs === 0) {
            setLastReadTimestamp(room.id, Date.now());
          } else {
            const unreadCount = list.filter((m) => {
              const k = detectMessageKind(m);
              return (
                m.sender_id !== currentUser.id &&
                k !== 'reaction_packet' &&
                k !== 'pin_packet' &&
                new Date(m.created_at).getTime() > lastReadTs
              );
            }).length;
            if (unreadCount > 0) {
              unreadCounts.set(room.id, unreadCount);
            } else {
              unreadCounts.delete(room.id);
            }
          }
        }

        await updateSingleRoomSummaryFromMessages(room, list);
      })
    );

    updateAppIconBadge();
    renderSidebarList();
  }

  async function handleIncomingMessageNotification(incoming) {
    if (!currentUser || incoming.sender_id === currentUser.id) return;

    let room = myRooms.find((r) => r.id === incoming.room_id);
    if (!room) {
      await refreshDirectoryAndRooms();
      room = myRooms.find((r) => r.id === incoming.room_id);
    }
    if (!room || !isRoomVisibleToCurrentUser(room)) return;

    const isChatCurrentlyVisible =
      activeRoom &&
      activeRoom.id === incoming.room_id &&
      !document.hidden &&
      (window.innerWidth > 768 || appShell.classList.contains('chat-active'));

    playNotificationSound();
    triggerHaptic('medium');

    const previewText = await extractMessagePreviewText(incoming, room);
    const senderProfile = allProfiles.find((p) => p.id === incoming.sender_id);
    const senderName =
      (senderProfile && senderProfile.display_name) ||
      incoming.sender_name ||
      getRoomPresentation(room).title;

    if (!isChatCurrentlyVisible) {
      const k = detectMessageKind(incoming);
      if (k !== 'reaction_packet' && k !== 'pin_packet') {
        const prevCount = unreadCounts.get(room.id) || 0;
        unreadCounts.set(room.id, prevCount + 1);
        updateAppIconBadge();
        renderSidebarList();
      }

      showInAppToast({
        title: senderName,
        text: previewText,
        peer: senderProfile,
        roomId: room.id
      });

      sendSystemNotification(senderName, previewText, room.id);
    } else {
      setLastReadTimestamp(room.id, Date.now());
    }
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'OPEN_ROOM' && event.data.roomId) {
        const room = myRooms.find((r) => r.id === event.data.roomId);
        if (room) selectRoom(room);
      }
    });
  }

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
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      applyTheme(btn.dataset.setTheme);
    });
  });
  applyTheme(localStorage.getItem('pulse_theme') || 'system');

  // 2. Звуковой сигнал при новом сообщении
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
      const ctx = getAudioCtx();
      if (!ctx) return;
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
      gain.gain.linearRampToValueAtTime(0.11, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.29);
      osc2.stop(now + 0.29);
    } catch (e) {}
  }

  if (shareInviteBtn) {
    shareInviteBtn.addEventListener('click', async () => {
      triggerHaptic('light');
      const shareUrl = 'https://rickaveri.github.io/pulse/';
      const shareText = `Добавляйся ко мне в защищённый мессенджер Pulse! Мой никнейм: @${currentUser ? currentUser.username : ''}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Pulse Messenger', text: shareText, url: shareUrl });
          return;
        } catch (e) {}
      }
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Ссылка и ваш @username скопированы в буфер обмена!');
      } catch (e) {
        prompt('Скопируйте ссылку для приглашения друга:', shareUrl);
      }
    });
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
    updatePushPermissionUI();

    authScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
    syncViewportHeight();

    await ensureSavedMessagesRoom();
    await refreshDirectoryAndRooms();
    await preloadAllRoomsMessages();
    subscribeRealtime();

    setInterval(async () => {
      if (!currentUser || !supabaseClient) return;
      await supabaseClient
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUser.id);
    }, 45000);
  }

  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && currentUser && supabaseClient) {
      await refreshDirectoryAndRooms();
      await preloadAllRoomsMessages();
      if (activeRoom) {
        await loadMessages(activeRoom.id);
        setLastReadTimestamp(activeRoom.id, Date.now());
      }
    }
  });

  window.addEventListener('online', async () => {
    if (currentUser && supabaseClient) {
      await refreshDirectoryAndRooms();
      await preloadAllRoomsMessages();
      if (activeRoom) await loadMessages(activeRoom.id);
    }
  });

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
    triggerHaptic('light');
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
    updatePushPermissionUI();
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
      alert('Укажите имя и корректный @username (минимум 3 символа).');
      return;
    }

    const packed = packProfileMeta({
      color: currentUser.color,
      username: newHandle,
      phone: newPhone,
      avatar_url: pendingAvatarUrl !== null ? pendingAvatarUrl : currentUser.avatar_url,
      bio: newBio
    });

    saveProfileBtn.disabled = true;
    const { error } = await supabaseClient
      .from('profiles')
      .update({
        display_name: newName,
        avatar_color: packed,
        last_seen: new Date().toISOString()
      })
      .eq('id', currentUser.id);
    saveProfileBtn.disabled = false;

    if (error) {
      alert('Ошибка сохранения: ' + error.message);
      return;
    }

    currentUser.display_name = newName;
    currentUser.username = newHandle;
    currentUser.phone = newPhone;
    currentUser.bio = newBio;
    if (pendingAvatarUrl !== null) currentUser.avatar_url = pendingAvatarUrl;

    triggerHaptic('medium');
    updateMyHeaderUI();
    profileModal.classList.add('hidden');
    await refreshDirectoryAndRooms();
  });

  requestLogoutBtn.addEventListener('click', () => {
    profileModal.classList.add('hidden');
    logoutConfirmModal.classList.remove('hidden');
  });

  cancelLogoutBtn.addEventListener('click', () => {
    logoutConfirmModal.classList.add('hidden');
  });

  confirmLogoutBtn.addEventListener('click', async () => {
    logoutConfirmModal.classList.add('hidden');
    if (cachedAudioStream) {
      cachedAudioStream.getTracks().forEach((t) => t.stop());
      cachedAudioStream = null;
    }
    if (supabaseClient) await supabaseClient.auth.signOut();
    window.location.reload();
  });

  // 8. Закрытая видимость чатов и поиск по @username и номеру телефона
  function isRoomVisibleToCurrentUser(room) {
    if (!room || !currentUser) return false;
    if (room.id === LEGACY_PUBLIC_ROOM_ID) return false;

    const dk = room.direct_key || '';
    if (dk.startsWith('saved_')) {
      return dk === `saved_${currentUser.id}`;
    }
    if (!room.is_group && dk.includes('_')) {
      const parts = dk.split('_');
      return parts.includes(currentUser.id);
    }
    if (room.is_group) {
      if (dk.startsWith('grp|')) {
        const memberPart = dk.split('|')[1] || '';
        const memberIds = memberPart.split(',').filter(Boolean);
        return memberIds.includes(currentUser.id) || room.created_by === currentUser.id;
      }
      return room.created_by === currentUser.id;
    }
    return room.created_by === currentUser.id;
  }

  async function refreshDirectoryAndRooms() {
    const [{ data: rawProfiles }, { data: rooms }] = await Promise.all([
      supabaseClient.from('profiles').select('*').order('display_name', { ascending: true }),
      supabaseClient.from('rooms').select('*').order('created_at', { ascending: true })
    ]);

    allProfiles = (rawProfiles || []).map(unpackProfile).filter(Boolean);
    myRooms = (rooms || []).filter(isRoomVisibleToCurrentUser);

    if (activeRoom) {
      const updatedActive = myRooms.find((r) => r.id === activeRoom.id);
      if (updatedActive) {
        activeRoom = updatedActive;
        updateActiveRoomHeader();
      }
    }

    renderSidebarList();
  }

  function getPeerForDirectRoom(room) {
    if (!room || room.is_group) return null;
    const dk = room.direct_key || '';
    if (dk.startsWith('saved_')) return currentUser;
    const parts = dk.split('_');
    const peerId = parts.find((id) => id !== currentUser.id) || currentUser.id;
    return allProfiles.find((p) => p.id === peerId) || null;
  }

  function getRoomPresentation(room) {
    const dk = room.direct_key || '';
    if (dk.startsWith('saved_')) {
      return {
        title: 'Избранное (Заметки)',
        subtitle: 'Личное зашифрованное хранилище',
        letter: '★',
        color: '#6366f1',
        avatar_url: '',
        online: false,
        peer: null,
        isSaved: true
      };
    }

    if (!room.is_group) {
      const peer = getPeerForDirectRoom(room);
      if (peer) {
        const isTyping = isRoomTyping(room.id);
        return {
          title: peer.display_name,
          subtitle: isTyping ? 'печатает...' : formatPresenceStatus(peer),
          isTyping,
          letter: peer.display_name[0] || '@',
          color: peer.color || '#6366f1',
          avatar_url: peer.avatar_url || '',
          online: isPersonOnline(peer),
          peer
        };
      }
    }

    let memberCountText = 'Закрытая группа';
    if (dk.startsWith('grp|')) {
      const ids = (dk.split('|')[1] || '').split(',').filter(Boolean);
      memberCountText = `Закрытая группа • ${ids.length} участн.`;
    }

    const isTyping = isRoomTyping(room.id);
    return {
      title: room.name || 'Группа',
      subtitle: isTyping ? 'кто-то печатает...' : memberCountText,
      isTyping,
      letter: (room.name || 'Г')[0],
      color: '#10b981',
      avatar_url: '',
      online: false,
      peer: null
    };
  }

  function isRoomTyping(roomId) {
    const entry = typingByRoom.get(roomId);
    if (!entry) return false;
    if (Date.now() - entry.ts > 3500) {
      typingByRoom.delete(roomId);
      return false;
    }
    return true;
  }

  function renderSidebarList() {
    const rawQuery = searchInput.value.trim();
    searchClearBtn.classList.toggle('hidden', !rawQuery);
    chatList.innerHTML = '';

    if (!rawQuery) {
      listSectionLabel.textContent = 'Мои диалоги';

      const sortedRooms = [...myRooms].sort((a, b) => {
        const aSaved = (a.direct_key || '').startsWith('saved_') ? 1 : 0;
        const bSaved = (b.direct_key || '').startsWith('saved_') ? 1 : 0;
        if (aSaved !== bSaved) return bSaved - aSaved;
        const aTs = roomSummaryMap.get(a.id)?.timestamp || new Date(a.created_at || 0).getTime();
        const bTs = roomSummaryMap.get(b.id)?.timestamp || new Date(b.created_at || 0).getTime();
        return bTs - aTs;
      });

      sortedRooms.forEach((room) => {
        const pres = getRoomPresentation(room);
        const summary = roomSummaryMap.get(room.id);
        const unread = unreadCounts.get(room.id) || 0;
        const draft = (!activeRoom || activeRoom.id !== room.id) ? getRoomDraft(room.id) : '';
        const item = document.createElement('div');
        item.className = `chat-item ${activeRoom && activeRoom.id === room.id ? 'active' : ''}`;

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'avatar-wrap';
        const av = document.createElement('div');
        av.className = 'avatar';
        renderAvatarElement(av, {
          avatar_url: pres.avatar_url,
          letter: pres.letter,
          color: pres.color
        });
        avatarWrap.appendChild(av);

        if (pres.online) {
          const dot = document.createElement('span');
          dot.className = 'online-dot';
          avatarWrap.appendChild(dot);
        }

        const subLine = pres.isTyping
          ? pres.subtitle
          : draft
          ? `Черновик: ${draft}`
          : (summary && summary.preview ? summary.preview : pres.subtitle);
        const timeLabel = summary && summary.timeStr ? summary.timeStr : '';

        const body = document.createElement('div');
        body.className = 'chat-item-body';
        body.innerHTML = `
          <div class="chat-item-top">
            <span class="chat-item-title">${escapeHtml(pres.title)}</span>
            ${timeLabel ? `<span class="chat-item-time">${escapeHtml(timeLabel)}</span>` : ''}
          </div>
          <div class="chat-item-bottom">
            <div class="chat-item-sub ${pres.isTyping ? 'typing' : draft ? 'draft' : ''}">${escapeHtml(subLine)}</div>
            ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
          </div>
        `;

        item.appendChild(avatarWrap);
        item.appendChild(body);
        item.addEventListener('click', () => {
          triggerHaptic('light');
          selectRoom(room);
        });
        chatList.appendChild(item);
      });
      return;
    }

    listSectionLabel.textContent = 'Результаты поиска';
    const cleanQ = rawQuery.toLowerCase().replace(/^@+/, '');
    const phoneQ = rawQuery.replace(/\D/g, '');

    const matchedPeople = allProfiles.filter((p) => {
      if (p.id === currentUser.id) return false;
      const matchHandle = p.username && p.username.toLowerCase().includes(cleanQ);
      const matchName = p.display_name && p.display_name.toLowerCase().includes(cleanQ);
      const pDigits = (p.phone || '').replace(/\D/g, '');
      const matchPhone = phoneQ.length >= 3 && pDigits.includes(phoneQ);
      return matchHandle || matchName || matchPhone;
    });

    if (matchedPeople.length === 0) {
      const empty = document.createElement('div');
      empty.style.padding = '24px 14px';
      empty.style.textAlign = 'center';
      empty.style.color = 'var(--text-muted)';
      empty.style.fontSize = '13px';
      empty.textContent = 'Пользователь с таким @username или телефоном не найден.';
      chatList.appendChild(empty);
      return;
    }

    matchedPeople.forEach((person) => {
      const item = document.createElement('div');
      item.className = 'chat-item';

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'avatar-wrap';
      const av = document.createElement('div');
      av.className = 'avatar';
      renderAvatarElement(av, {
        avatar_url: person.avatar_url,
        letter: person.display_name,
        color: person.color
      });
      avatarWrap.appendChild(av);

      if (isPersonOnline(person)) {
        const dot = document.createElement('span');
        dot.className = 'online-dot';
        avatarWrap.appendChild(dot);
      }

      const subParts = [`@${person.username}`];
      if (person.phone) subParts.push(person.phone);

      const body = document.createElement('div');
      body.className = 'chat-item-body';
      body.innerHTML = `
        <div class="chat-item-top">
          <span class="chat-item-title">${escapeHtml(person.display_name)}</span>
        </div>
        <div class="chat-item-sub">${escapeHtml(subParts.join(' • '))}</div>
      `;

      item.appendChild(avatarWrap);
      item.appendChild(body);
      item.addEventListener('click', async () => {
        triggerHaptic('light');
        searchInput.value = '';
        searchClearBtn.classList.add('hidden');
        await openOrCreateDirectMessage(person);
      });
      chatList.appendChild(item);
    });
  }

  searchInput.addEventListener('input', renderSidebarList);
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderSidebarList();
  });

  async function openOrCreateDirectMessage(peer) {
    const pairKey = [currentUser.id, peer.id].sort().join('_');
    let room = myRooms.find((r) => r.direct_key === pairKey);

    if (!room) {
      const { data: existingInDb } = await supabaseClient
        .from('rooms')
        .select('*')
        .eq('direct_key', pairKey)
        .maybeSingle();

      if (existingInDb) {
        room = existingInDb;
      } else {
        const { data: created, error } = await supabaseClient
          .from('rooms')
          .insert({
            name: `${currentUser.display_name} & ${peer.display_name}`,
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
        room = created;
      }
      await refreshDirectoryAndRooms();
    }

    await selectRoom(room);
  }

  // 9. Создание закрытой группы
  newGroupBtn.addEventListener('click', () => {
    triggerHaptic('light');
    groupNameInput.value = '';
    groupMembersPicker.innerHTML = '';

    const others = allProfiles.filter((p) => p.id !== currentUser.id);
    if (others.length === 0) {
      groupMembersPicker.innerHTML = `<div style="padding:12px; color:var(--text-muted); font-size:13px;">Пока нет других зарегистрированных пользователей.</div>`;
    } else {
      others.forEach((person) => {
        const label = document.createElement('label');
        label.className = 'member-option';
        label.innerHTML = `
          <input type="checkbox" value="${escapeHtml(person.id)}" />
          <span><strong>${escapeHtml(person.display_name)}</strong> <small style="color:var(--text-muted);">@${escapeHtml(person.username)}</small></span>
        `;
        groupMembersPicker.appendChild(label);
      });
    }

    groupModal.classList.remove('hidden');
  });

  closeGroupModalBtn.addEventListener('click', () => groupModal.classList.add('hidden'));

  createGroupConfirmBtn.addEventListener('click', async () => {
    const name = groupNameInput.value.trim();
    if (!name) {
      alert('Введите название группы');
      return;
    }

    const checkedIds = Array.from(groupMembersPicker.querySelectorAll('input[type="checkbox"]:checked')).map(
      (cb) => cb.value
    );
    const allMemberIds = Array.from(new Set([currentUser.id, ...checkedIds])).sort();
    const groupKey = `grp|${allMemberIds.join(',')}|${Date.now()}`;

    createGroupConfirmBtn.disabled = true;
    const { data: newRoom, error } = await supabaseClient
      .from('rooms')
      .insert({
        name,
        is_group: true,
        direct_key: groupKey,
        created_by: currentUser.id
      })
      .select()
      .single();
    createGroupConfirmBtn.disabled = false;

    if (error) {
      alert('Ошибка создания группы: ' + error.message);
      return;
    }

    groupModal.classList.add('hidden');
    await refreshDirectoryAndRooms();
    if (newRoom) await selectRoom(newRoom);
  });

  // 10. Выбор комнаты, сохранение черновика и МГНОВЕННОЕ отображение без мелькания
  async function selectRoom(room) {
    if (activeRoom && !editingMsg) {
      setRoomDraft(activeRoom.id, messageInput.value);
    }

    activeRoom = room;
    currentSelectingRoomId = room.id;
    activeChatFilterQuery = '';
    if (chatSearchBar) chatSearchBar.classList.add('hidden');
    if (chatSearchInput) chatSearchInput.value = '';

    setLastReadTimestamp(room.id, Date.now());
    if (unreadCounts.has(room.id)) {
      unreadCounts.delete(room.id);
      updateAppIconBadge();
    }

    clearComposerState();
    messageInput.value = getRoomDraft(room.id);
    updateSmartActionButtonUI();
    updateActiveRoomHeader();

    messagesViewport.innerHTML = '';
    if (scrollBottomBtn) scrollBottomBtn.classList.add('hidden');
    if (pinnedMsgBar) pinnedMsgBar.classList.add('hidden');

    const cachedMsgs = roomMessagesCache.get(room.id);
    if (cachedMsgs) {
      roomMessages = cachedMsgs;
      await renderMessages(room.id);
    } else {
      roomMessages = [];
    }

    emptyChatState.classList.add('hidden');
    activeChatView.classList.remove('hidden');
    appShell.classList.add('chat-active');
    renderSidebarList();
    syncViewportHeight();

    await loadMessages(room.id);
  }

  function updateActiveRoomHeader() {
    if (!activeRoom) return;
    const pres = getRoomPresentation(activeRoom);
    activeRoomTitle.textContent = pres.title;
    activeRoomStatus.textContent = pres.subtitle;
    activeRoomStatus.classList.toggle('typing', Boolean(pres.isTyping));
    renderAvatarElement(activeRoomAvatar, {
      avatar_url: pres.avatar_url,
      letter: pres.letter,
      color: pres.color
    });
    activeRoomOnlineDot.classList.toggle('hidden', !pres.online);

    const canCallPeer = Boolean(pres.peer && !pres.isSaved);
    if (voiceCallBtn) voiceCallBtn.classList.toggle('hidden', !canCallPeer);
    if (videoCallBtn) videoCallBtn.classList.toggle('hidden', !canCallPeer);

    const hasCustomSecret = Boolean(getRoomCustomSecret(activeRoom.id));
    e2eBadgeText.textContent = hasCustomSecret ? 'AES-256 + Ключ' : 'AES-256';
  }

  mobileBackBtn.addEventListener('click', () => {
    triggerHaptic('light');
    if (activeRoom && !editingMsg) {
      setRoomDraft(activeRoom.id, messageInput.value);
    }
    messageInput.blur();
    appShell.classList.remove('chat-active');
    activeRoom = null;
    currentSelectingRoomId = null;
    messagesViewport.innerHTML = '';
    renderSidebarList();
    syncViewportHeight();
  });

  // Карточка собеседника / диалога + Копирование @username/телефона + Галерея общих фотографий
  chatHeaderTrigger.addEventListener('click', (e) => {
    if (e.target.closest('#mobileBackBtn')) return;
    if (!activeRoom) return;
    triggerHaptic('light');
    const pres = getRoomPresentation(activeRoom);

    renderAvatarElement(peerAvatar, {
      avatar_url: pres.avatar_url,
      letter: pres.letter,
      color: pres.color
    });
    peerName.textContent = pres.title;

    if (pres.peer) {
      peerHandle.textContent = `@${pres.peer.username}`;
      peerPhone.textContent = pres.peer.phone ? `Телефон: ${pres.peer.phone}` : 'Номер телефона скрыт';
      if (pres.peer.bio) {
        peerBio.textContent = pres.peer.bio;
        peerBio.classList.remove('hidden');
      } else {
        peerBio.classList.add('hidden');
      }
    } else {
      peerHandle.textContent = pres.subtitle;
      peerPhone.textContent = '';
      peerBio.classList.add('hidden');
    }

    if (sharedMediaGrid) {
      sharedMediaGrid.innerHTML = '';
      const mediaMsgs = roomMessages.filter((m) => Boolean(m.media_url));
      if (mediaMsgs.length === 0) {
        sharedMediaGrid.innerHTML = `<div style="grid-column:1/-1; font-size:12.5px; color:var(--text-muted); padding:8px 0;">В этом диалоге пока нет отправленных фото или файлов.</div>`;
      } else {
        mediaMsgs.slice().reverse().forEach((m) => {
          const k = detectMessageKind(m);
          if (k === 'image') {
            const img = document.createElement('img');
            img.className = 'shared-media-thumb';
            img.src = m.media_url;
            img.alt = 'Фото';
            img.addEventListener('click', () => {
              peerModal.classList.add('hidden');
              lightboxImg.src = m.media_url;
              lightbox.classList.remove('hidden');
            });
            sharedMediaGrid.appendChild(img);
          } else {
            const link = document.createElement('a');
            link.href = m.media_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'flex';
            link.style.flexDirection = 'column';
            link.style.alignItems = 'center';
            link.style.justifyContent = 'center';
            link.style.height = '78px';
            link.style.background = 'var(--bg-input)';
            link.style.border = '1px solid var(--border)';
            link.style.borderRadius = '10px';
            link.style.textDecoration = 'none';
            link.style.color = 'var(--text-main)';
            link.style.fontSize = '11px';
            link.innerHTML = `<span style="font-size:20px;">${k === 'video_circle' ? '📹' : k === 'voice' ? '🎤' : '📎'}</span><span style="margin-top:3px;">${k === 'video_circle' ? 'Кружок' : k === 'voice' ? 'Голос' : 'Файл'}</span>`;
            sharedMediaGrid.appendChild(link);
          }
        });
      }
    }

    peerModal.classList.remove('hidden');
  });

  if (peerHandle) {
    peerHandle.addEventListener('click', async () => {
      const txt = peerHandle.textContent.trim();
      if (!txt.startsWith('@')) return;
      try {
        await navigator.clipboard.writeText(txt);
        peerHandle.textContent = `${txt} (Скопировано ✓)`;
        setTimeout(() => {
          peerHandle.textContent = txt;
        }, 1200);
      } catch (e) {}
    });
  }

  closePeerModalBtn.addEventListener('click', () => peerModal.classList.add('hidden'));

  e2eBadgeBtn.addEventListener('click', () => {
    if (!activeRoom) return;
    triggerHaptic('light');
    chatSecretKeyInput.value = getRoomCustomSecret(activeRoom.id);
    e2eModal.classList.remove('hidden');
  });

  closeE2eModalBtn.addEventListener('click', () => e2eModal.classList.add('hidden'));

  saveE2eKeyBtn.addEventListener('click', async () => {
    if (!activeRoom) return;
    setRoomCustomSecret(activeRoom.id, chatSecretKeyInput.value.trim());
    updateActiveRoomHeader();
    e2eModal.classList.add('hidden');
    await renderMessages(activeRoom.id);
  });

  async function loadMessages(roomId) {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(350);

    if (error) return;
    const fetched = data || [];
    roomMessagesCache.set(roomId, fetched);

    const targetRoomObj = myRooms.find((r) => r.id === roomId);
    if (targetRoomObj) {
      await updateSingleRoomSummaryFromMessages(targetRoomObj, fetched);
      renderSidebarList();
    }

    if (!activeRoom || activeRoom.id !== roomId || currentSelectingRoomId !== roomId) return;

    roomMessages = fetched;
    setLastReadTimestamp(roomId, Date.now());
    await renderMessages(roomId);
  }

  function formatDateSeparator(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Сегодня';
    if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }

  function renderTextWithLinks(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="msg-link" onclick="event.stopPropagation()">$1</a>'
    );
  }

  let currentPinnedTargetId = null;
  let currentPinPacketId = null;

  if (pinnedMsgBar) {
    pinnedMsgBar.addEventListener('click', (e) => {
      if (e.target === unpinMsgBtn) return;
      if (!currentPinnedTargetId) return;
      triggerHaptic('light');
      const targetEl = messagesViewport.querySelector(`[data-msg-id="${currentPinnedTargetId}"]`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const b = targetEl.querySelector('.msg-bubble');
        if (b) {
          b.classList.add('highlight-flash');
          setTimeout(() => b.classList.remove('highlight-flash'), 1400);
        }
      }
    });
  }

  if (unpinMsgBtn) {
    unpinMsgBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!activeRoom) return;
      triggerHaptic('light');
      localStorage.removeItem(`pulse_pin_${activeRoom.id}`);
      if (currentPinPacketId) {
        await supabaseClient.from('messages').delete().eq('id', currentPinPacketId);
      }
      currentPinnedTargetId = null;
      currentPinPacketId = null;
      pinnedMsgBar.classList.add('hidden');
      await loadMessages(activeRoom.id);
    });
  }

  async function renderMessages(targetRoomId) {
    if (!activeRoom) return;
    const roomSnapshot = activeRoom;
    if (targetRoomId && roomSnapshot.id !== targetRoomId) return;

    const hiddenIds = getLocallyHiddenMsgIds();

    const reactionsByTargetId = new Map();
    let latestPinPacket = null;
    const actualMessages = [];

    roomMessages.forEach((m) => {
      if (m.content && m.content.startsWith('__REACT__|')) {
        const parts = m.content.split('|');
        const targetId = parts[1];
        const emoji = parts[2];
        if (targetId && emoji) {
          if (!reactionsByTargetId.has(targetId)) {
            reactionsByTargetId.set(targetId, new Map());
          }
          reactionsByTargetId.get(targetId).set(m.sender_id, { emoji, packetId: m.id });
        }
      } else if (m.content && m.content.startsWith('__PIN__|')) {
        latestPinPacket = m;
      } else if (!hiddenIds.has(m.id)) {
        actualMessages.push(m);
      }
    });

    const decryptedList = await Promise.all(
      actualMessages.map(async (msg) => {
        const plain = msg.content ? await decryptTextForRoom(msg.content, roomSnapshot) : '';
        return { msg, plain };
      })
    );

    if (!activeRoom || activeRoom.id !== roomSnapshot.id) return;

    currentPinnedTargetId = null;
    currentPinPacketId = null;
    if (latestPinPacket) {
      const parts = latestPinPacket.content.split('|');
      currentPinnedTargetId = parts[1] || null;
      currentPinPacketId = latestPinPacket.id;
    } else {
      currentPinnedTargetId = localStorage.getItem(`pulse_pin_${roomSnapshot.id}`) || null;
    }

    if (currentPinnedTargetId && pinnedMsgBar) {
      const pinnedEntry = decryptedList.find((item) => item.msg.id === currentPinnedTargetId);
      if (pinnedEntry) {
        const { textBody } = parseCleanMessageStruct(pinnedEntry.plain);
        const k = detectMessageKind(pinnedEntry.msg);
        pinnedMsgText.textContent =
          textBody ||
          (k === 'voice'
            ? '🎤 Голосовое сообщение'
            : k === 'video_circle'
            ? '📹 Видеокружочек'
            : k === 'image'
            ? '📷 Фотография'
            : '📎 Вложение');
        pinnedMsgBar.classList.remove('hidden');
      } else {
        pinnedMsgBar.classList.add('hidden');
      }
    } else if (pinnedMsgBar) {
      pinnedMsgBar.classList.add('hidden');
    }

    const filteredList = activeChatFilterQuery
      ? decryptedList.filter(({ plain }) => {
          const { textBody } = parseCleanMessageStruct(plain);
          return textBody.toLowerCase().includes(activeChatFilterQuery);
        })
      : decryptedList;

    messagesViewport.innerHTML = '';

    if (filteredList.length === 0) {
      const empty = document.createElement('div');
      empty.style.margin = 'auto';
      empty.style.textAlign = 'center';
      empty.style.color = 'var(--text-muted)';
      empty.style.fontSize = '13px';
      empty.textContent = activeChatFilterQuery
        ? 'По вашему запросу сообщений не найдено.'
        : 'Сообщений пока нет. Напишите первым!';
      messagesViewport.appendChild(empty);
      return;
    }

    let lastDateKey = '';

    filteredList.forEach(({ msg, plain }) => {
      const dKey = new Date(msg.created_at).toDateString();
      if (dKey !== lastDateKey) {
        lastDateKey = dKey;
        const sep = document.createElement('div');
        sep.className = 'date-divider date-separator';
        sep.innerHTML = `<span>${escapeHtml(formatDateSeparator(msg.created_at))}</span>`;
        messagesViewport.appendChild(sep);
      }

      const isMine = msg.sender_id === currentUser.id;
      const sender = allProfiles.find((p) => p.id === msg.sender_id);
      const senderName = (sender && sender.display_name) || msg.sender_name || 'Пользователь';

      const row = document.createElement('div');
      row.className = `msg-row ${isMine ? 'own mine' : 'other theirs'}`;
      row.dataset.msgId = msg.id;

      if (roomSnapshot.is_group && !isMine) {
        const authorEl = document.createElement('div');
        authorEl.className = 'msg-author';
        authorEl.textContent = senderName;
        row.appendChild(authorEl);
      }

      const kind = detectMessageKind(msg);
      const isCircle = kind === 'video_circle';
      const bubble = document.createElement('div');
      bubble.className = `msg-bubble ${isCircle ? 'circle-bubble' : ''}`;

      const { textBody, quoteLine, isEdited, inlineReaction } = parseCleanMessageStruct(plain);

      if (quoteLine && !isCircle && kind !== 'call_log') {
        const qBox = document.createElement('div');
        qBox.className = 'msg-reply-quote';
        qBox.textContent = quoteLine;
        bubble.appendChild(qBox);
      }

      if (kind === 'call_log') {
        const callInfo = parseCallLogMessage(msg.content);
        const isVideoCall = callInfo.callType === 'video';
        const isCompleted = callInfo.status === 'completed' && callInfo.durationSec > 0;

        let titleLabel = isVideoCall ? 'Видеозвонок' : 'Аудиозвонок';
        let subLabel = '';
        if (isCompleted) {
          subLabel = `${isMine ? 'Исходящий' : 'Входящий'} • ${formatSec(callInfo.durationSec)}`;
        } else if (isMine) {
          subLabel = 'Отменён / Нет ответа';
        } else {
          titleLabel = isVideoCall ? 'Пропущенный видеозвонок' : 'Пропущенный аудиозвонок';
          subLabel = 'Нажмите, чтобы перезвонить';
        }

        const callCard = document.createElement('div');
        callCard.className = 'call-log-card';
        callCard.innerHTML = `
          <div class="call-log-icon ${!isCompleted && !isMine ? 'missed' : ''}">${isVideoCall ? '📹' : '📞'}</div>
          <div class="call-log-info">
            <div class="call-log-title">${escapeHtml(titleLabel)}</div>
            <div class="call-log-sub">${escapeHtml(subLabel)}</div>
          </div>
          <button type="button" class="call-log-redial">Позвонить</button>
        `;
        const redialBtn = callCard.querySelector('.call-log-redial');
        redialBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          triggerHaptic('medium');
          startOutgoingCall(isVideoCall);
        });
        bubble.appendChild(callCard);
      } else if (msg.media_url) {
        if (kind === 'image') {
          const img = document.createElement('img');
          img.className = 'msg-photo msg-image';
          img.src = msg.media_url;
          img.alt = 'Фото';
          img.addEventListener('click', (ev) => {
            ev.stopPropagation();
            lightboxImg.src = msg.media_url;
            lightbox.classList.remove('hidden');
          });
          bubble.appendChild(img);
        } else if (kind === 'video_circle') {
          const circleWrap = document.createElement('div');
          circleWrap.className = 'video-note-wrap video-circle-msg';
          const vid = document.createElement('video');
          vid.src = msg.media_url;
          vid.playsInline = true;
          vid.loop = true;
          vid.muted = false;
          vid.preload = 'metadata';

          const badge = document.createElement('div');
          badge.className = 'video-note-badge circle-play-badge';
          badge.textContent = '▶ Кружочек';

          circleWrap.addEventListener('click', (ev) => {
            ev.stopPropagation();
            triggerHaptic('light');
            if (vid.paused) {
              vid.play();
              badge.textContent = '⏸ Пауза';
            } else {
              vid.pause();
              badge.textContent = '▶ Кружочек';
            }
          });

          circleWrap.appendChild(vid);
          circleWrap.appendChild(badge);
          bubble.appendChild(circleWrap);
        } else if (kind === 'voice') {
          const voiceCard = buildCustomVoicePlayer(msg.media_url, msg.media_duration);
          bubble.appendChild(voiceCard);
        } else {
          const fileName = textBody || 'Скачать файл';
          const fileLink = document.createElement('a');
          fileLink.className = 'file-card file-attachment';
          fileLink.href = msg.media_url;
          fileLink.target = '_blank';
          fileLink.rel = 'noopener noreferrer';
          fileLink.addEventListener('click', (ev) => ev.stopPropagation());
          fileLink.innerHTML = `
            <div class="file-icon-box file-icon">📎</div>
            <div class="file-meta file-info">
              <div class="file-name">${escapeHtml(fileName)}</div>
              <div class="file-sub">Нажмите, чтобы открыть файл</div>
            </div>
          `;
          bubble.appendChild(fileLink);
        }
      }

      if (textBody && kind !== 'file' && kind !== 'call_log') {
        const txt = document.createElement('div');
        txt.innerHTML = renderTextWithLinks(textBody);
        bubble.appendChild(txt);
      }

      const timeStr = new Date(msg.created_at).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const meta = document.createElement('div');
      meta.className = 'msg-meta';

      const packetMap = reactionsByTargetId.get(msg.id);
      const myReactionEntry = packetMap ? packetMap.get(currentUser.id) : null;
      const allEmojis = [];
      if (inlineReaction) allEmojis.push(inlineReaction);
      if (packetMap) {
        packetMap.forEach((val) => {
          allEmojis.push(val.emoji);
        });
      }

      if (allEmojis.length > 0) {
        const reactPill = document.createElement('span');
        reactPill.className = 'reaction-chip-pill';
        reactPill.title = 'Нажмите, чтобы убрать или поставить реакцию';
        reactPill.textContent = allEmojis.join(' ');
        reactPill.addEventListener('click', async (ev) => {
          ev.stopPropagation();
          await toggleReactionOnMessage({
            msg,
            emoji: myReactionEntry ? myReactionEntry.emoji : allEmojis[0],
            myReactionPacketId: myReactionEntry ? myReactionEntry.packetId : null,
            myReactionEmoji: myReactionEntry ? myReactionEntry.emoji : null
          });
        });
        meta.appendChild(reactPill);
      }

      if (isEdited) {
        const edSpan = document.createElement('span');
        edSpan.className = 'edited-label';
        edSpan.textContent = 'изменено';
        meta.appendChild(edSpan);
      }

      const timeSpan = document.createElement('span');
      timeSpan.textContent = timeStr;
      meta.appendChild(timeSpan);

      if (isMine) {
        const ticks = document.createElement('span');
        ticks.className = 'read-ticks';
        ticks.textContent = msg._optimistic ? '✓' : '✓✓';
        meta.appendChild(ticks);
      }

      if (isCircle) {
        row.appendChild(bubble);
        row.appendChild(meta);
      } else {
        bubble.appendChild(meta);
        row.appendChild(bubble);
      }

      const ctxPayload = {
        msg,
        kind,
        senderName,
        plainText: textBody,
        quoteLine,
        isEdited,
        myReactionPacketId: myReactionEntry ? myReactionEntry.packetId : null,
        myReactionEmoji: myReactionEntry ? myReactionEntry.emoji : inlineReaction
      };

      // ЖЕСТЫ СООБЩЕНИЯ:
      // 1) Свайп влево по пузырьку — мгновенный ответ (Reply) как в Telegram!
      // 2) Удержание (300 мс) — пружинящее сжатие + открытие меню
      // 3) Двойной тап — мгновенный лайк ❤️ за 0 мс
      // 4) Одиночный тап — меню действий
      let longPressTimer = null;
      let longPressFired = false;
      let clickTimeout = null;
      let touchStartX = 0;
      let touchStartY = 0;
      let swipedReply = false;

      bubble.addEventListener('pointerdown', (ev) => {
        if (ev.target.closest('a, button, video')) return;
        longPressFired = false;
        swipedReply = false;
        touchStartX = ev.clientX;
        touchStartY = ev.clientY;
        bubble.classList.add('pressing');
        longPressTimer = setTimeout(() => {
          longPressFired = true;
          bubble.classList.remove('pressing');
          bubble.classList.add('haptic-pop');
          setTimeout(() => bubble.classList.remove('haptic-pop'), 280);
          triggerHaptic('medium');
          openMessageActionSheet(ctxPayload);
        }, 300);
      });

      bubble.addEventListener('pointermove', (ev) => {
        if (!touchStartX) return;
        const dx = ev.clientX - touchStartX;
        const dy = Math.abs(ev.clientY - touchStartY);
        if (Math.abs(dx) > 10 || dy > 10) {
          bubble.classList.remove('pressing');
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
        // Свайп влево для быстрого ответа
        if (dx < -15 && dy < 30) {
          const offset = Math.max(-55, dx);
          bubble.style.transform = `translateX(${offset}px)`;
          if (dx <= -42 && !swipedReply) {
            swipedReply = true;
            triggerHaptic('medium');
            setReplyMessage(msg, senderName, textBody);
          }
        }
      });

      const finishPointer = () => {
        touchStartX = 0;
        bubble.style.transform = '';
        bubble.classList.remove('pressing');
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      };

      bubble.addEventListener('pointerup', finishPointer);
      bubble.addEventListener('pointercancel', finishPointer);

      bubble.addEventListener('click', (ev) => {
        if (ev.target.closest('a, button')) return;
        if (longPressFired || swipedReply) {
          longPressFired = false;
          swipedReply = false;
          return;
        }
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
          bubble.classList.add('haptic-pop');
          setTimeout(() => bubble.classList.remove('haptic-pop'), 280);
          toggleReactionOnMessage({
            msg,
            emoji: '❤️',
            myReactionPacketId: myReactionEntry ? myReactionEntry.packetId : null,
            myReactionEmoji: myReactionEntry ? myReactionEntry.emoji : null
          });
          return;
        }
        clickTimeout = setTimeout(() => {
          clickTimeout = null;
          triggerHaptic('light');
          openMessageActionSheet(ctxPayload);
        }, 175);
      });

      messagesViewport.appendChild(row);
    });

    if (!activeChatFilterQuery) {
      messagesViewport.scrollTop = messagesViewport.scrollHeight;
    }
  }

  // МГНОВЕННАЯ РЕАКЦИЯ ЗА 0 МС (Optimistic UI Update!)
  async function toggleReactionOnMessage({ msg, emoji, myReactionPacketId, myReactionEmoji }) {
    if (!activeRoom || !msg) return;
    triggerHaptic('medium');

    const roomId = activeRoom.id;
    const isRemoving = myReactionEmoji === emoji;

    if (myReactionPacketId) {
      roomMessages = roomMessages.filter((m) => m.id !== myReactionPacketId);
    }
    const tempPacketId = `optimistic_react_${Date.now()}`;
    if (!isRemoving) {
      roomMessages.push({
        id: tempPacketId,
        room_id: roomId,
        sender_id: currentUser.id,
        sender_name: currentUser.display_name,
        content: `__REACT__|${msg.id}|${emoji}`,
        media_type: 'text',
        created_at: new Date().toISOString()
      });
    }
    roomMessagesCache.set(roomId, roomMessages);
    await renderMessages(roomId);

    try {
      if (myReactionPacketId && !String(myReactionPacketId).startsWith('optimistic_')) {
        await supabaseClient.from('messages').delete().eq('id', myReactionPacketId);
      }
      if (!isRemoving) {
        const { data } = await insertMessageRow({
          room_id: roomId,
          content: `__REACT__|${msg.id}|${emoji}`,
          media_type: 'text'
        });
        if (data && data[0]) {
          roomMessages = roomMessages.map((m) => (m.id === tempPacketId ? data[0] : m));
          roomMessagesCache.set(roomId, roomMessages);
        }
      }
    } catch (err) {
      console.warn('Reaction sync error:', err);
    }
  }

  // 11. Меню действий над сообщением
  function openMessageActionSheet(ctx) {
    selectedMsgContext = ctx;
    const isMine = ctx.msg.sender_id === currentUser.id;
    const isTextEditable = isMine && ctx.kind === 'text';

    sheetEditBtn.classList.toggle('hidden', !isTextEditable);
    sheetCopyBtn.classList.toggle('hidden', !ctx.plainText);
    if (sheetDownloadBtn) {
      sheetDownloadBtn.classList.toggle('hidden', !ctx.msg.media_url);
    }

    msgActionModal.classList.remove('hidden');
  }

  sheetCancelBtn.addEventListener('click', () => {
    triggerHaptic('light');
    msgActionModal.classList.add('hidden');
  });

  msgActionModal.addEventListener('click', (e) => {
    if (e.target === msgActionModal) msgActionModal.classList.add('hidden');
  });

  if (sheetDownloadBtn) {
    sheetDownloadBtn.addEventListener('click', () => {
      if (!selectedMsgContext || !selectedMsgContext.msg.media_url) return;
      triggerHaptic('light');
      const url = selectedMsgContext.msg.media_url;
      msgActionModal.classList.add('hidden');
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  reactEmojiBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!selectedMsgContext || !activeRoom) return;
      const emoji = btn.dataset.react;
      const ctx = selectedMsgContext;
      msgActionModal.classList.add('hidden');

      await toggleReactionOnMessage({
        msg: ctx.msg,
        emoji,
        myReactionPacketId: ctx.myReactionPacketId,
        myReactionEmoji: ctx.myReactionEmoji
      });
    });
  });

  sheetReplyBtn.addEventListener('click', () => {
    if (!selectedMsgContext) return;
    triggerHaptic('light');
    const { msg, senderName, plainText } = selectedMsgContext;
    msgActionModal.classList.add('hidden');
    setReplyMessage(msg, senderName, plainText);
  });

  if (sheetPinBtn) {
    sheetPinBtn.addEventListener('click', async () => {
      if (!selectedMsgContext || !activeRoom) return;
      triggerHaptic('medium');
      const targetId = selectedMsgContext.msg.id;
      msgActionModal.classList.add('hidden');

      localStorage.setItem(`pulse_pin_${activeRoom.id}`, targetId);
      if (currentPinPacketId) {
        await supabaseClient.from('messages').delete().eq('id', currentPinPacketId);
      }
      await insertMessageRow({
        room_id: activeRoom.id,
        content: `__PIN__|${targetId}`,
        media_type: 'text'
      });
      await loadMessages(activeRoom.id);
    });
  }

  if (sheetForwardBtn) {
    sheetForwardBtn.addEventListener('click', () => {
      if (!selectedMsgContext) return;
      triggerHaptic('light');
      msgActionModal.classList.add('hidden');
      forwardRoomsList.innerHTML = '';

      myRooms.forEach((targetRoom) => {
        const pres = getRoomPresentation(targetRoom);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sheet-item';
        btn.innerHTML = `<span><strong>${escapeHtml(pres.title)}</strong></span>`;
        btn.addEventListener('click', async () => {
          triggerHaptic('medium');
          forwardModal.classList.add('hidden');
          const { msg, senderName, plainText } = selectedMsgContext;
          const forwardPlain = plainText
            ? `> ↪ Переслано от ${senderName}\n${plainText}`
            : `> ↪ Переслано от ${senderName}\n`;
          const enc = await encryptTextForRoom(forwardPlain, targetRoom);

          const { error } = await insertMessageRow({
            room_id: targetRoom.id,
            content: enc,
            media_url: msg.media_url || null,
            media_type: msg.media_type || 'text',
            media_duration: msg.media_duration || 0
          });

          if (error) {
            alert('Ошибка при пересылке: ' + error.message);
            return;
          }

          await selectRoom(targetRoom);
        });
        forwardRoomsList.appendChild(btn);
      });

      forwardModal.classList.remove('hidden');
    });
  }

  if (cancelForwardBtn) {
    cancelForwardBtn.addEventListener('click', () => {
      forwardModal.classList.add('hidden');
    });
  }

  sheetCopyBtn.addEventListener('click', async () => {
    if (!selectedMsgContext || !selectedMsgContext.plainText) return;
    triggerHaptic('light');
    try {
      await navigator.clipboard.writeText(selectedMsgContext.plainText);
    } catch (e) {}
    msgActionModal.classList.add('hidden');
  });

  sheetEditBtn.addEventListener('click', () => {
    if (!selectedMsgContext) return;
    triggerHaptic('light');
    const { msg, plainText, quoteLine } = selectedMsgContext;
    msgActionModal.classList.add('hidden');

    replyToMsg = null;
    editingMsg = {
      id: msg.id,
      created_at: msg.created_at,
      room_id: msg.room_id,
      quoteLine: quoteLine || '',
      plainText: plainText || ''
    };

    replyTargetAuthor.textContent = '✏️ Редактирование сообщения';
    replyTargetText.textContent = plainText || '';
    replyPreviewBar.classList.remove('hidden');

    messageInput.value = plainText || '';
    updateSmartActionButtonUI();
    messageInput.focus();
  });

  sheetDeleteBtn.addEventListener('click', () => {
    if (!selectedMsgContext) return;
    triggerHaptic('light');
    msgActionModal.classList.add('hidden');
    const isMine = selectedMsgContext.msg.sender_id === currentUser.id;
    deleteForAllBtn.classList.toggle('hidden', !isMine);
    deleteConfirmModal.classList.remove('hidden');
  });

  cancelDeleteModalBtn.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
  });

  deleteForMeBtn.addEventListener('click', async () => {
    if (!selectedMsgContext) return;
    triggerHaptic('medium');
    hideMsgLocally(selectedMsgContext.msg.id);
    deleteConfirmModal.classList.add('hidden');
    selectedMsgContext = null;
    if (activeRoom) {
      await updateSingleRoomSummaryFromMessages(activeRoom, roomMessages);
      renderSidebarList();
      await renderMessages(activeRoom.id);
    }
  });

  deleteForAllBtn.addEventListener('click', async () => {
    if (!selectedMsgContext || !activeRoom) return;
    triggerHaptic('medium');
    const msgId = selectedMsgContext.msg.id;
    deleteConfirmModal.classList.add('hidden');
    selectedMsgContext = null;

    roomMessages = roomMessages.filter((m) => m.id !== msgId);
    roomMessagesCache.set(activeRoom.id, roomMessages);
    await renderMessages(activeRoom.id);

    await supabaseClient.from('messages').delete().eq('id', msgId);
    await loadMessages(activeRoom.id);
  });

  function buildCustomVoicePlayer(audioUrl, initialDuration) {
    const wrap = document.createElement('div');
    wrap.className = 'voice-player';
    wrap.addEventListener('click', (ev) => ev.stopPropagation());

    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'voice-play-btn';
    playBtn.textContent = '▶';

    const barsWrap = document.createElement('div');
    barsWrap.className = 'voice-wave voice-bars';
    const heights = [35, 65, 50, 85, 45, 95, 60, 75, 40, 88, 55, 70, 50, 80, 45, 60, 35, 50];
    const barEls = heights.map((h) => {
      const b = document.createElement('span');
      b.className = 'voice-bar';
      b.style.height = `${h}%`;
      barsWrap.appendChild(b);
      return b;
    });

    const durLabel = document.createElement('span');
    durLabel.className = 'voice-duration';
    durLabel.textContent = initialDuration ? formatSec(initialDuration) : '0:00';

    const speedBtn = document.createElement('button');
    speedBtn.type = 'button';
    speedBtn.className = 'voice-speed-btn';
    speedBtn.textContent = '1x';
    const speeds = [1, 1.5, 2];
    let speedIdx = 0;

    speedBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      triggerHaptic('light');
      speedIdx = (speedIdx + 1) % speeds.length;
      audio.playbackRate = speeds[speedIdx];
      speedBtn.textContent = `${speeds[speedIdx]}x`;
    });

    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        durLabel.textContent = formatSec(Math.round(audio.duration));
      }
    });

    audio.addEventListener('timeupdate', () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      const activeCount = Math.ceil(ratio * barEls.length);
      barEls.forEach((b, idx) => b.classList.toggle('played', idx < activeCount));
      durLabel.textContent = formatSec(Math.floor(audio.currentTime));
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶';
      barEls.forEach((b) => b.classList.remove('played'));
    });

    playBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      triggerHaptic('light');
      if (audio.paused) {
        audio.playbackRate = speeds[speedIdx];
        audio.play();
        playBtn.textContent = '⏸';
      } else {
        audio.pause();
        playBtn.textContent = '▶';
      }
    });

    wrap.appendChild(playBtn);
    wrap.appendChild(barsWrap);
    wrap.appendChild(durLabel);
    wrap.appendChild(speedBtn);
    return wrap;
  }

  function formatSec(sec) {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function setReplyMessage(msg, senderName, plainText) {
    editingMsg = null;
    const kind = detectMessageKind(msg);
    const preview =
      plainText ||
      (kind === 'voice'
        ? '🎤 Голосовое сообщение'
        : kind === 'video_circle'
        ? '📹 Видеокружочек'
        : kind === 'image'
        ? '📷 Фотография'
        : '📎 Вложение');
    replyToMsg = { senderName, preview };
    replyTargetAuthor.textContent = `Ответ: ${senderName}`;
    replyTargetText.textContent = preview;
    replyPreviewBar.classList.remove('hidden');
    messageInput.focus();
  }

  function clearComposerState() {
    replyToMsg = null;
    editingMsg = null;
    replyPreviewBar.classList.add('hidden');
  }

  cancelReplyBtn.addEventListener('click', clearComposerState);

  // 12. Умная кнопка 3-в-1 + Мгновенная отправка сообщений + Предпросмотр фото с подписью
  function updateSmartActionButtonUI() {
    const hasText = messageInput.value.trim().length > 0;

    if (isRecording) {
      smartActionBtn.innerHTML = ICON_SEND;
      smartActionBtn.classList.add('recording-ready');
      lockHintPill.classList.toggle('hidden', isRecordingLocked);
      return;
    }

    smartActionBtn.classList.remove('recording-ready');
    lockHintPill.classList.add('hidden');

    if (hasText || editingMsg) {
      smartActionBtn.innerHTML = ICON_SEND;
      smartActionBtn.title = editingMsg ? 'Сохранить изменения' : 'Отправить сообщение';
    } else if (recordMode === 'video') {
      smartActionBtn.innerHTML = ICON_VIDEO;
      smartActionBtn.title = 'Тап — переключить на микрофон, Удержание — записать видеокружочек';
    } else {
      smartActionBtn.innerHTML = ICON_MIC;
      smartActionBtn.title = 'Тап — переключить на видеокружочек, Удержание — записать голосовое';
    }
  }

  async function submitTextMessage() {
    if (!activeRoom || !currentUser) return;
    const rawText = messageInput.value.trim();
    if (!rawText) return;

    triggerHaptic('light');
    messageInput.value = '';
    setRoomDraft(activeRoom.id, '');

    if (editingMsg) {
      const editTarget = editingMsg;
      clearComposerState();
      updateSmartActionButtonUI();

      let updatedPlain = '';
      if (editTarget.quoteLine) {
        updatedPlain += `> ${editTarget.quoteLine}\n`;
      }
      updatedPlain += `${rawText}\n[edited]`;

      const encrypted = await encryptTextForRoom(updatedPlain, activeRoom);

      await supabaseClient.from('messages').delete().eq('id', editTarget.id);
      const { error } = await insertMessageRow({
        id: editTarget.id,
        room_id: activeRoom.id,
        content: encrypted,
        media_type: 'text',
        created_at: editTarget.created_at
      });

      if (error) {
        alert('Ошибка сохранения изменений: ' + error.message);
      }
      await loadMessages(activeRoom.id);
      return;
    }

    updateSmartActionButtonUI();

    let finalPlain = rawText;
    if (replyToMsg) {
      finalPlain = `> ${replyToMsg.senderName}: ${replyToMsg.preview}\n${rawText}`;
      clearComposerState();
    }

    const roomSnapshot = activeRoom;
    const encrypted = await encryptTextForRoom(finalPlain, roomSnapshot);

    const tempId = `optimistic_msg_${Date.now()}`;
    const optimisticRow = {
      id: tempId,
      room_id: roomSnapshot.id,
      sender_id: currentUser.id,
      sender_name: currentUser.display_name,
      sender_color: currentUser.color,
      content: encrypted,
      media_type: 'text',
      created_at: new Date().toISOString(),
      _optimistic: true
    };
    roomMessages.push(optimisticRow);
    roomMessagesCache.set(roomSnapshot.id, roomMessages);
    await renderMessages(roomSnapshot.id);

    const { error } = await insertMessageRow({
      room_id: roomSnapshot.id,
      content: encrypted,
      media_type: 'text'
    });

    if (error) {
      alert('Ошибка отправки: ' + error.message);
    }
    await loadMessages(roomSnapshot.id);
  }

  messageInput.addEventListener('input', () => {
    updateSmartActionButtonUI();
    if (activeRoom && !editingMsg) {
      setRoomDraft(activeRoom.id, messageInput.value);
    }
    if (!realtimeChannel || !activeRoom || !currentUser) return;
    const now = Date.now();
    if (now - lastTypingBroadcastAt > 1500) {
      lastTypingBroadcastAt = now;
      realtimeChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { room_id: activeRoom.id, user_id: currentUser.id }
      });
    }
  });

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitTextMessage();
    } else if (e.key === 'Escape' && (replyToMsg || editingMsg)) {
      clearComposerState();
      messageInput.value = activeRoom ? getRoomDraft(activeRoom.id) : '';
      updateSmartActionButtonUI();
    }
  });

  attachBtn.addEventListener('click', () => {
    if (!activeRoom) return;
    triggerHaptic('light');
    attachmentInput.click();
  });

  // Предпросмотр фото или файла перед отправкой + возможность добавить подпись!
  attachmentInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !activeRoom) return;
    attachmentInput.value = '';

    pendingAttachmentFile = file;
    mediaCaptionInput.value = '';

    if (file.type.startsWith('image/')) {
      mediaPreviewTitle.textContent = 'Отправить фотографию';
      mediaPreviewImg.src = URL.createObjectURL(file);
      mediaPreviewImg.classList.remove('hidden');
      mediaPreviewFileBox.classList.add('hidden');
    } else {
      mediaPreviewTitle.textContent = 'Отправить файл';
      mediaPreviewImg.classList.add('hidden');
      mediaPreviewFileBox.textContent = `📎 ${file.name}`;
      mediaPreviewFileBox.classList.remove('hidden');
    }

    mediaPreviewModal.classList.remove('hidden');
    setTimeout(() => mediaCaptionInput.focus(), 80);
  });

  if (cancelSendMediaBtn) {
    cancelSendMediaBtn.addEventListener('click', () => {
      pendingAttachmentFile = null;
      mediaPreviewModal.classList.add('hidden');
    });
  }

  if (confirmSendMediaBtn) {
    confirmSendMediaBtn.addEventListener('click', async () => {
      if (!pendingAttachmentFile || !activeRoom) return;
      const file = pendingAttachmentFile;
      const captionText = mediaCaptionInput.value.trim();
      pendingAttachmentFile = null;
      mediaPreviewModal.classList.add('hidden');
      triggerHaptic('medium');

      const isImg = file.type.startsWith('image/');
      try {
        let uploadBlob = file;
        let ext = (file.name.split('.').pop() || 'bin').toLowerCase();
        let contentType = file.type || 'application/octet-stream';

        if (isImg) {
          uploadBlob = await compressImage(file, 1280, 0.84);
          ext = 'jpg';
          contentType = 'image/jpeg';
        }

        const prefix = isImg ? 'img' : 'file';
        const path = `${activeRoom.id}/${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabaseClient.storage
          .from('chat-media')
          .upload(path, uploadBlob, { contentType });
        if (upErr) throw upErr;

        const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
        const textToEncrypt = isImg ? captionText : (captionText || file.name);
        const captionEncrypted = textToEncrypt ? await encryptTextForRoom(textToEncrypt, activeRoom) : '';

        const { error } = await insertMessageRow({
          room_id: activeRoom.id,
          content: captionEncrypted,
          media_url: pub.publicUrl,
          media_type: isImg ? 'image' : 'text'
        });
        if (error) throw error;
        await loadMessages(activeRoom.id);
      } catch (err) {
        alert('Ошибка отправки файла: ' + (err.message || err));
      }
    });
  }

  smartActionBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!activeRoom) return;

    if (messageInput.value.trim().length > 0 || editingMsg) {
      submitTextMessage();
      return;
    }

    if (isRecording && isRecordingLocked) {
      finishRecordingAndSend();
      return;
    }

    pointerStartY = e.clientY;
    try {
      smartActionBtn.setPointerCapture(e.pointerId);
    } catch (err) {}

    holdTimer = setTimeout(() => {
      holdTimer = null;
      triggerHaptic('medium');
      startMediaRecording(recordMode);
    }, 210);
  });

  smartActionBtn.addEventListener('pointermove', (e) => {
    if (!isRecording || isRecordingLocked) return;
    const deltaY = pointerStartY - e.clientY;
    if (deltaY > 45) {
      isRecordingLocked = true;
      triggerHaptic('medium');
      updateSmartActionButtonUI();
    }
  });

  function handleSmartPointerEnd() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
      triggerHaptic('light');
      recordMode = recordMode === 'voice' ? 'video' : 'voice';
      localStorage.setItem('pulse_rec_mode', recordMode);
      updateSmartActionButtonUI();
      return;
    }

    if (isRecording && !isRecordingLocked) {
      finishRecordingAndSend();
    }
  }

  smartActionBtn.addEventListener('pointerup', handleSmartPointerEnd);
  smartActionBtn.addEventListener('pointercancel', handleSmartPointerEnd);

  function getElapsedRecordingSeconds() {
    const runningExtra = isRecordingPaused ? 0 : (Date.now() - lastResumeTime);
    return Math.floor((elapsedRecordMs + runningExtra) / 1000);
  }

  function updateRecordingTimersUI() {
    const secStr = formatSec(getElapsedRecordingSeconds());
    recordingTimer.textContent = secStr;
    if (vcStatusLabel) {
      vcStatusLabel.innerHTML = isRecordingPaused
        ? `⏸ На паузе: <span>${secStr}</span>`
        : `🔴 Запись: <span>${secStr}</span>`;
    }
  }

  async function acquireVoiceStreamOnce() {
    const hasLiveTracks =
      cachedAudioStream &&
      cachedAudioStream.getAudioTracks().some((t) => t.readyState === 'live');

    if (hasLiveTracks) {
      cachedAudioStream.getAudioTracks().forEach((t) => {
        t.enabled = true;
      });
      return cachedAudioStream;
    }

    cachedAudioStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    return cachedAudioStream;
  }

  async function startMediaRecording(mode) {
    if (isRecording || !activeRoom) return;
    try {
      const isVideo = mode === 'video';
      cameraFacingMode = 'user';

      const stream = isVideo
        ? await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: { facingMode: cameraFacingMode, width: { ideal: 480 }, height: { ideal: 480 } }
          })
        : await acquireVoiceStreamOnce();

      activeMediaStream = stream;
      isRecording = true;
      isRecordingLocked = isVideo;
      isRecordingPaused = false;
      recordCanceled = false;
      recordedChunks = [];
      elapsedRecordMs = 0;
      lastResumeTime = Date.now();

      if (isVideo) {
        videoCirclePreview.srcObject = stream;
        videoCirclePreview.classList.toggle('mirrored', cameraFacingMode === 'user');
        vcPauseBtn.textContent = '⏸ Пауза';
        videoCircleOverlay.classList.remove('hidden');
      } else {
        messageInput.classList.add('hidden');
        recordingBar.classList.remove('hidden');
        pauseVoiceBtn.textContent = '⏸ Пауза';
        recDot.classList.remove('paused');
      }

      updateRecordingTimersUI();
      updateSmartActionButtonUI();

      recordTimerInterval = setInterval(updateRecordingTimersUI, 300);

      activeMediaRecorder = createMediaRecorderForStream(stream, isVideo);
      activeMediaRecorder.start(250);
    } catch (err) {
      alert('Для записи разрешите доступ к микрофону и камере в браузере.');
      cleanupRecordingUI();
    }
  }

  function createMediaRecorderForStream(stream, isVideo) {
    const mimeOptions = isVideo
      ? ['video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm']
      : ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
    const supportedMime = mimeOptions.find(
      (m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)
    );

    const recorder = supportedMime
      ? new MediaRecorder(stream, { mimeType: supportedMime })
      : new MediaRecorder(stream);

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data);
    };

    recorder.onstop = async () => {
      if (record.keepRecordingOnFlip) return;

      const wasCanceled = recordCanceled;
      const chunks = [...recordedChunks];
      const recMime = recorder.mimeType || (isVideo ? 'video/mp4' : 'audio/webm');
      const totalSec = getElapsedRecordingSeconds();
      cleanupRecordingUI();

      if (wasCanceled || chunks.length === 0 || !activeRoom) return;

      const blob = new Blob(chunks, { type: recMime });
      const ext = isVideo
        ? recMime.includes('mp4') ? 'mp4' : 'webm'
        : recMime.includes('mp4') ? 'm4a' : 'webm';
      const path = `${activeRoom.id}/${isVideo ? 'circle' : 'voice'}_${Date.now()}.${ext}`;

      try {
        const { error: upErr } = await supabaseClient.storage
          .from('chat-media')
          .upload(path, blob, { contentType: blob.type });
        if (upErr) throw upErr;

        const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
        const { error } = await insertMessageRow({
          room_id: activeRoom.id,
          content: '',
          media_url: pub.publicUrl,
          media_type: 'audio',
          media_duration: totalSec
        });
        if (error) throw error;
        await loadMessages(activeRoom.id);
      } catch (err) {
        alert('Не удалось отправить запись: ' + (err.message || err));
      }
    };

    return recorder;
  }

  const record = { keepRecordingOnFlip: false };

  function togglePauseRecording() {
    if (!isRecording || !activeMediaRecorder) return;
    triggerHaptic('light');
    if (!isRecordingPaused) {
      isRecordingPaused = true;
      elapsedRecordMs += Date.now() - lastResumeTime;
      if (activeMediaRecorder.state === 'recording' && activeMediaRecorder.pause) {
        try { activeMediaRecorder.pause(); } catch (e) {}
      }
      pauseVoiceBtn.textContent = '▶ Продолжить';
      vcPauseBtn.textContent = '▶ Дальше';
      recDot.classList.add('paused');
    } else {
      isRecordingPaused = false;
      lastResumeTime = Date.now();
      if (activeMediaRecorder.state === 'paused' && activeMediaRecorder.resume) {
        try { activeMediaRecorder.resume(); } catch (e) {}
      }
      pauseVoiceBtn.textContent = '⏸ Пауза';
      vcPauseBtn.textContent = '⏸ Пауза';
      recDot.classList.remove('paused');
    }
    updateRecordingTimersUI();
  }

  pauseVoiceBtn.addEventListener('click', togglePauseRecording);
  vcPauseBtn.addEventListener('click', togglePauseRecording);

  vcFlipCamBtn.addEventListener('click', async () => {
    if (!isRecording || recordMode !== 'video') return;
    triggerHaptic('light');
    cameraFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    try {
      record.keepRecordingOnFlip = true;
      if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
        activeMediaRecorder.stop();
      }
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((t) => t.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: { facingMode: cameraFacingMode, width: { ideal: 480 }, height: { ideal: 480 } }
      });

      activeMediaStream = newStream;
      videoCirclePreview.srcObject = newStream;
      videoCirclePreview.classList.toggle('mirrored', cameraFacingMode === 'user');

      record.keepRecordingOnFlip = false;
      activeMediaRecorder = createMediaRecorderForStream(newStream, true);
      activeMediaRecorder.start(250);
      if (isRecordingPaused && activeMediaRecorder.pause) {
        try { activeMediaRecorder.pause(); } catch (e) {}
      }
    } catch (err) {
      record.keepRecordingOnFlip = false;
      alert('Не удалось переключить камеру: ' + (err.message || err));
    }
  });

  function finishRecordingAndSend() {
    if (!isRecording || !activeMediaRecorder) return;
    triggerHaptic('medium');
    recordCanceled = false;
    record.keepRecordingOnFlip = false;
    if (activeMediaRecorder.state !== 'inactive') {
      activeMediaRecorder.stop();
    }
  }

  function cancelActiveRecording() {
    if (!isRecording) return;
    triggerHaptic('light');
    recordCanceled = true;
    record.keepRecordingOnFlip = false;
    if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
      activeMediaRecorder.stop();
    } else {
      cleanupRecordingUI();
    }
  }

  cancelRecordBtn.addEventListener('click', cancelActiveRecording);
  vcCancelBtn.addEventListener('click', cancelActiveRecording);
  vcSendBtn.addEventListener('click', finishRecordingAndSend);

  function cleanupRecordingUI() {
    isRecording = false;
    isRecordingLocked = false;
    isRecordingPaused = false;
    clearInterval(recordTimerInterval);
    if (activeMediaStream) {
      if (activeMediaStream === cachedAudioStream) {
        activeMediaStream.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      } else {
        activeMediaStream.getTracks().forEach((t) => t.stop());
      }
      activeMediaStream = null;
    }
    videoCirclePreview.srcObject = null;
    videoCircleOverlay.classList.add('hidden');
    recordingBar.classList.add('hidden');
    messageInput.classList.remove('hidden');
    updateSmartActionButtonUI();
  }

  // 12.5. АУДИО- И ВИДЕОЗВОНКИ БЕЗ VPN (с чистым звуком без хрипа и переключателем «Динамик / Громкая связь»!)
  let rtcPeerConnection = null;
  let localCallStream = null;
  let activeCallState = null;
  let isCallMuted = false;
  let isSpeakerphoneOn = false; // По умолчанию в аудиозвонках выключена громкая связь (режим обычного телефонного динамика)
  let callFacingMode = 'user';

  const RTC_CONFIG = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Применение режима «Обычный динамик (Тихо / у уха)» vs «Громкая связь»
  async function applySpeakerMode(speakerOn) {
    isSpeakerphoneOn = Boolean(speakerOn);
    if (callSpeakerBtn) {
      callSpeakerBtn.textContent = isSpeakerphoneOn ? '🔊' : '🔈';
      callSpeakerBtn.classList.toggle('active-mode', isSpeakerphoneOn);
    }
    if (callSpeakerLabel) {
      callSpeakerLabel.textContent = isSpeakerphoneOn ? 'Громкая' : 'Динамик';
    }

    const targetVolume = isSpeakerphoneOn ? 1.0 : 0.26;
    if (callRemoteAudio) callRemoteAudio.volume = targetVolume;
    if (callRemoteVideo) callRemoteVideo.volume = targetVolume;

    // Если браузер поддерживает выбор аудиовыхода (setSinkId), выбираем спикерфон или наушники/динамик
    const mediaEl = activeCallState && activeCallState.isVideo ? callRemoteVideo : callRemoteAudio;
    if (mediaEl && typeof mediaEl.setSinkId === 'function' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === 'audiooutput');
        if (outputs.length > 1) {
          const speakerDev = outputs.find((d) => /speaker|громк/i.test(d.label));
          const receiverDev = outputs.find((d) => /receiver|earpiece|headphone|airpods/i.test(d.label));
          if (isSpeakerphoneOn && speakerDev) {
            await mediaEl.setSinkId(speakerDev.deviceId);
          } else if (!isSpeakerphoneOn && receiverDev) {
            await mediaEl.setSinkId(receiverDev.deviceId);
          }
        }
      } catch (e) {}
    }
  }

  if (callSpeakerBtn) {
    callSpeakerBtn.addEventListener('click', () => {
      triggerHaptic('light');
      applySpeakerMode(!isSpeakerphoneOn);
    });
  }

  // Чистый мягкий телефонный гудок без искажений и хрипа (плавная огибающая синусоиды 440 Гц)
  function playCleanDialTone(isIncoming) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isIncoming ? 523.25 : 440, now);
      if (isIncoming) {
        osc.frequency.setValueAtTime(659.25, now + 0.16);
      }

      // Плавное нарастание и плавный спад в ноль — полностью исключает щелчки и хрип динамика!
      const maxGain = isSpeakerphoneOn ? 0.065 : 0.025;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(maxGain, now + 0.04);
      gain.gain.setValueAtTime(maxGain, now + 0.32);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.44);
    } catch (e) {}
  }

  function startCallRingingLoop(isIncoming) {
    playCleanDialTone(isIncoming);
    return setInterval(() => {
      playCleanDialTone(isIncoming);
      if (isIncoming) triggerHaptic('medium');
    }, 2400);
  }

  function stopCallRingingLoop() {
    if (activeCallState && activeCallState.ringTimerId) {
      clearInterval(activeCallState.ringTimerId);
      activeCallState.ringTimerId = null;
    }
  }

  function setupCallOverlayUI(peer, statusMsg, showAccept, isVideo) {
    if (!callOverlay) return;
    renderAvatarElement(callPeerAvatar, {
      avatar_url: peer ? peer.avatar_url : '',
      letter: peer ? peer.display_name : 'З',
      color: peer ? peer.color : '#6366f1'
    });
    callPeerName.textContent = peer ? peer.display_name : 'Собеседник';
    callStatusText.textContent = statusMsg;
    if (callAcceptWrap) callAcceptWrap.classList.toggle('hidden', !showAccept);
    if (callFlipCamWrap) callFlipCamWrap.classList.toggle('hidden', !isVideo);
    callVideoStage.classList.toggle('hidden', !isVideo);
    callOverlay.classList.remove('hidden');
  }

  async function startOutgoingCall(isVideo) {
    if (!activeRoom || !realtimeChannel) return;
    const pres = getRoomPresentation(activeRoom);
    if (!pres.peer) return;

    triggerHaptic('medium');
    callFacingMode = 'user';

    // Аудиозвонок начинается на обычном тихом динамике (не на громкой!), а видеозвонок — на громкой
    await applySpeakerMode(Boolean(isVideo));

    try {
      localCallStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: isVideo ? { facingMode: callFacingMode, width: { ideal: 640 }, height: { ideal: 480 } } : false
      });

      if (isVideo && callLocalVideo) {
        callLocalVideo.srcObject = localCallStream;
      }

      const peerOnline = isPersonOnline(pres.peer);
      activeCallState = {
        peerId: pres.peer.id,
        roomId: activeRoom.id,
        isVideo,
        isOutgoing: true,
        incomingOffer: null,
        callStartTime: 0,
        timerId: null,
        ringTimerId: startCallRingingLoop(false),
        logged: false
      };
      isCallMuted = false;
      callMuteBtn.classList.remove('active-mode');
      if (callMuteLabel) callMuteLabel.textContent = 'Микрофон';

      setupCallOverlayUI(
        pres.peer,
        peerOnline
          ? (isVideo ? 'Видеовызов (в сети)...' : 'Аудиовызов (в сети)...')
          : 'Вызов... (собеседник не в сети — останется уведомление)',
        false,
        isVideo
      );

      rtcPeerConnection = createRtcPeerConnection(pres.peer.id, isVideo);
      localCallStream.getTracks().forEach((track) => rtcPeerConnection.addTrack(track, localCallStream));

      const offer = await rtcPeerConnection.createOffer();
      await rtcPeerConnection.setLocalDescription(offer);

      realtimeChannel.send({
        type: 'broadcast',
        event: 'call-signal',
        payload: {
          type: 'offer',
          from_id: currentUser.id,
          to_id: pres.peer.id,
          room_id: activeRoom.id,
          is_video: isVideo,
          sdp: offer
        }
      });
    } catch (err) {
      alert('Для звонка разрешите доступ к микрофону/камере: ' + (err.message || err));
      await endActiveCall(false);
    }
  }

  function createRtcPeerConnection(targetPeerId, isVideo) {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'call-signal',
          payload: {
            type: 'ice',
            from_id: currentUser.id,
            to_id: targetPeerId,
            candidate: event.candidate
          }
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams && event.streams[0];
      if (!stream) return;
      if (isVideo && callRemoteVideo) {
        callRemoteVideo.srcObject = stream;
        callRemoteVideo.volume = isSpeakerphoneOn ? 1.0 : 0.26;
      } else if (callRemoteAudio) {
        // Для аудиозвонка выводим звук через <audio>, чтобы iOS не принуждал громкую связь видеоплеера!
        callRemoteAudio.srcObject = stream;
        callRemoteAudio.volume = isSpeakerphoneOn ? 1.0 : 0.26;
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected' && activeCallState && !activeCallState.callStartTime) {
        stopCallRingingLoop();
        triggerHaptic('medium');
        activeCallState.callStartTime = Date.now();
        activeCallState.timerId = setInterval(() => {
          if (!activeCallState) return;
          const sec = Math.floor((Date.now() - activeCallState.callStartTime) / 1000);
          callStatusText.textContent = `В разговоре • ${formatSec(sec)}`;
        }, 1000);
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        endActiveCall(false);
      }
    };

    return pc;
  }

  async function handleIncomingCallSignal(payload) {
    if (!payload || payload.to_id !== currentUser.id) return;
    const caller = allProfiles.find((p) => p.id === payload.from_id);

    if (payload.type === 'offer') {
      if (activeCallState) return;
      triggerHaptic('heavy');
      const isVid = Boolean(payload.is_video);
      await applySpeakerMode(isVid);

      activeCallState = {
        peerId: payload.from_id,
        roomId: payload.room_id,
        isVideo: isVid,
        isOutgoing: false,
        incomingOffer: payload.sdp,
        callStartTime: 0,
        timerId: null,
        ringTimerId: startCallRingingLoop(true),
        logged: false
      };

      setupCallOverlayUI(
        caller,
        isVid ? 'Входящий видеозвонок...' : 'Входящий аудиозвонок...',
        true,
        isVid
      );

      sendSystemNotification(
        caller ? caller.display_name : 'Входящий звонок',
        isVid ? '📹 Входящий видеозвонок в Pulse' : '📞 Входящий аудиозвонок в Pulse',
        payload.room_id
      );
    } else if (payload.type === 'answer' && rtcPeerConnection) {
      stopCallRingingLoop();
      await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      callStatusText.textContent = 'Соединение установлено';
    } else if (payload.type === 'ice' && rtcPeerConnection && payload.candidate) {
      try {
        await rtcPeerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (e) {}
    } else if (payload.type === 'hangup') {
      await endActiveCall(false);
    }
  }

  if (callAcceptBtn) {
    callAcceptBtn.addEventListener('click', async () => {
      if (!activeCallState || !activeCallState.incomingOffer) return;
      triggerHaptic('medium');
      stopCallRingingLoop();
      try {
        if (callAcceptWrap) callAcceptWrap.classList.add('hidden');
        callStatusText.textContent = 'Подключение...';

        localCallStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: activeCallState.isVideo ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false
        });

        if (activeCallState.isVideo && callLocalVideo) {
          callLocalVideo.srcObject = localCallStream;
        }

        rtcPeerConnection = createRtcPeerConnection(activeCallState.peerId, activeCallState.isVideo);
        localCallStream.getTracks().forEach((track) => rtcPeerConnection.addTrack(track, localCallStream));

        await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(activeCallState.incomingOffer));
        const answer = await rtcPeerConnection.createAnswer();
        await rtcPeerConnection.setLocalDescription(answer);

        realtimeChannel.send({
          type: 'broadcast',
          event: 'call-signal',
          payload: {
            type: 'answer',
            from_id: currentUser.id,
            to_id: activeCallState.peerId,
            sdp: answer
          }
        });
      } catch (err) {
        alert('Не удалось принять звонок: ' + (err.message || err));
        await endActiveCall(true);
      }
    });
  }

  // Переключение фронтальной и основной камеры прямо во время видеозвонка
  if (callFlipCamBtn) {
    callFlipCamBtn.addEventListener('click', async () => {
      if (!activeCallState || !activeCallState.isVideo || !localCallStream) return;
      triggerHaptic('light');
      callFacingMode = callFacingMode === 'user' ? 'environment' : 'user';
      try {
        const newVidStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: callFacingMode, width: { ideal: 640 }, height: { ideal: 480 } }
        });
        const newVideoTrack = newVidStream.getVideoTracks()[0];
        const oldVideoTrack = localCallStream.getVideoTracks()[0];
        if (oldVideoTrack) {
          localCallStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }
        localCallStream.addTrack(newVideoTrack);
        if (callLocalVideo) {
          callLocalVideo.srcObject = localCallStream;
          callLocalVideo.style.transform = callFacingMode === 'user' ? 'scaleX(-1)' : 'none';
        }
        if (rtcPeerConnection) {
          const sender = rtcPeerConnection.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) await sender.replaceTrack(newVideoTrack);
        }
      } catch (e) {}
    });
  }

  async function endActiveCall(notifyPeer = true) {
    stopCallRingingLoop();
    const stateSnapshot = activeCallState;
    activeCallState = null;

    if (stateSnapshot && stateSnapshot.timerId) {
      clearInterval(stateSnapshot.timerId);
    }
    if (rtcPeerConnection) {
      try { rtcPeerConnection.close(); } catch (e) {}
      rtcPeerConnection = null;
    }
    if (localCallStream) {
      localCallStream.getTracks().forEach((t) => t.stop());
      localCallStream = null;
    }
    if (callRemoteAudio) callRemoteAudio.srcObject = null;
    if (callRemoteVideo) callRemoteVideo.srcObject = null;
    if (callLocalVideo) callLocalVideo.srcObject = null;
    if (callOverlay) callOverlay.classList.add('hidden');

    if (!stateSnapshot) return;

    if (notifyPeer && realtimeChannel) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'call-signal',
        payload: {
          type: 'hangup',
          from_id: currentUser.id,
          to_id: stateSnapshot.peerId
        }
      });
    }

    if (stateSnapshot.isOutgoing && !stateSnapshot.logged && stateSnapshot.roomId) {
      stateSnapshot.logged = true;
      const durSec = stateSnapshot.callStartTime
        ? Math.max(1, Math.floor((Date.now() - stateSnapshot.callStartTime) / 1000))
        : 0;
      const status = durSec > 0 ? 'completed' : 'missed';
      const callTypeStr = stateSnapshot.isVideo ? 'video' : 'audio';

      await insertMessageRow({
        room_id: stateSnapshot.roomId,
        content: `__CALL__|${callTypeStr}|${status}|${durSec}`,
        media_type: 'text',
        media_duration: durSec
      });
      if (activeRoom && activeRoom.id === stateSnapshot.roomId) {
        await loadMessages(stateSnapshot.roomId);
      }
    }
  }

  if (voiceCallBtn) {
    voiceCallBtn.addEventListener('click', () => startOutgoingCall(false));
  }
  if (videoCallBtn) {
    videoCallBtn.addEventListener('click', () => startOutgoingCall(true));
  }
  if (callHangupBtn) {
    callHangupBtn.addEventListener('click', () => {
      triggerHaptic('medium');
      endActiveCall(true);
    });
  }
  if (callMuteBtn) {
    callMuteBtn.addEventListener('click', () => {
      if (!localCallStream) return;
      triggerHaptic('light');
      isCallMuted = !isCallMuted;
      localCallStream.getAudioTracks().forEach((t) => {
        t.enabled = !isCallMuted;
      });
      callMuteBtn.classList.toggle('active-mode', isCallMuted);
      if (callMuteLabel) {
        callMuteLabel.textContent = isCallMuted ? 'Выключен' : 'Микрофон';
      }
    });
  }

  // 13. Realtime-подписка
  function subscribeRealtime() {
    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);

    realtimeChannel = supabaseClient
      .channel('pulse-live-v14', {
        config: { presence: { key: currentUser.id } }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = realtimeChannel.presenceState();
        onlineUserIds.clear();
        onlineUserIds.add(currentUser.id);
        Object.keys(state).forEach((uid) => onlineUserIds.add(uid));
        renderSidebarList();
        updateActiveRoomHeader();
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload || payload.user_id === currentUser.id) return;
        typingByRoom.set(payload.room_id, { userId: payload.user_id, ts: Date.now() });
        renderSidebarList();
        updateActiveRoomHeader();
        setTimeout(() => {
          renderSidebarList();
          updateActiveRoomHeader();
        }, 3600);
      })
      .on('broadcast', { event: 'call-signal' }, ({ payload }) => {
        handleIncomingCallSignal(payload);
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        async (payload) => {
          const incoming = payload.new || payload.old;
          if (!incoming) return;

          if (payload.eventType === 'INSERT' && payload.new) {
            await handleIncomingMessageNotification(payload.new);
          }

          if (activeRoom && incoming.room_id === activeRoom.id) {
            await loadMessages(activeRoom.id);
          } else if (incoming.room_id) {
            const { data } = await supabaseClient
              .from('messages')
              .select('*')
              .eq('room_id', incoming.room_id)
              .order('created_at', { ascending: true })
              .limit(350);
            if (data) {
              roomMessagesCache.set(incoming.room_id, data);
              const rm = myRooms.find((r) => r.id === incoming.room_id);
              if (rm) {
                await updateSingleRoomSummaryFromMessages(rm, data);
                renderSidebarList();
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        async () => {
          await refreshDirectoryAndRooms();
          await preloadAllRoomsMessages();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async (payload) => {
          const wasKnown = payload.new ? allProfiles.some((p) => p.id === payload.new.id) : true;
          await refreshDirectoryAndRooms();
          if (payload.eventType === 'INSERT' && payload.new && payload.new.id !== currentUser.id && !wasKnown) {
            const newPerson = unpackProfile(payload.new);
            if (newPerson) {
              playNotificationSound();
              showInAppToast({
                title: '🎉 Новый пользователь в Pulse!',
                text: `${newPerson.display_name} (@${newPerson.username}) зарегистрировался`,
                peer: newPerson,
                roomId: null
              });
              sendSystemNotification(
                'Новый пользователь в Pulse!',
                `${newPerson.display_name} (@${newPerson.username}) теперь в мессенджере.`,
                null
              );
            }
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await realtimeChannel.track({ online_at: new Date().toISOString() });
        }
      });
  }

  // 14. Сжатие изображений и утилиты
  function compressImage(file, maxDim = 1280, quality = 0.84) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Ошибка сжатия'))),
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  lightbox.addEventListener('click', () => {
    lightbox.classList.add('hidden');
    lightboxImg.src = '';
  });

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=14').catch(() => {});
    });
  }

  if (initSupabase()) {
    bootSession();
  }
})();
