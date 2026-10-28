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

    const res = await supabaseClient.from('messages').insert(payload).select();
    if (res && res.data && res.data[0]) {
      const targetRm = myRooms.find((r) => r.id === room_id) || activeRoom;
      if (targetRm && !(content || "").startsWith("__REACT__") && !(content || "").startsWith("__PIN__")) {
        extractMessagePreviewText(res.data[0], targetRm).then((prev) => {
          dispatchClosedAppWebPushForRoom(targetRm, prev);
        }).catch(() => {});
      }
    }
    if (res && res.data && res.data[0] && realtimeChannel) {
      try {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'new-message',
          payload: res.data[0]
        });
      } catch (e) {}
    }
    return res;
  }

  function detectMessageKind(msg) {
    if (msg.content && msg.content.startsWith('__REACT__|')) {
      return 'reaction_packet';
    }
    if (msg.content && (msg.content.startsWith('__PIN__|') || msg.content.startsWith('__PUSH__|'))) {
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

  // 0. СТАБИЛЬНАЯ ФИКСАЦИЯ ЭКРАНА И КЛАВИАТУРЫ БЕЗ СЪЕЗЖАНИЯ ПОЛОСЫ ВВОДА И СПИСКА СООБЩЕНИЙ (v42)
  let lastAppliedVvHeight = 0;
  let wasKeyboardOpenBefore = false;

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

    const isKeyboardOpen = vv ? (innerH - vvH > 105) : false;
    const targetH = isKeyboardOpen && vv ? Math.round(vvH) : Math.round(fullPhysicalH);
    const targetTop = isKeyboardOpen && vv ? Math.max(0, Math.round(vv.offsetTop)) : 0;

    document.body.classList.toggle('keyboard-open', isKeyboardOpen);

    if (appShell) {
      const prevH = lastAppliedVvHeight || targetH;
      const heightDelta = prevH - targetH;
      lastAppliedVvHeight = targetH;

      appShell.style.top = `${targetTop}px`;
      appShell.style.bottom = 'auto';
      appShell.style.height = `${targetH}px`;

      // Сдвигаем скролл ровно на высоту открывшейся клавиатуры ТОЛЬКО в момент её открытия, чтобы сообщение перед глазами не уезжало!
      if (isKeyboardOpen && !wasKeyboardOpenBefore && heightDelta > 60 && messagesViewport) {
        messagesViewport.scrollTop += heightDelta;
      }
    }
    wasKeyboardOpenBefore = isKeyboardOpen;

    if (window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
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
        enablePushInSettingsBtn.textContent = 'Обновить токен';
        enablePushInSettingsBtn.disabled = false;
      }
      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = 'Проверка фонового токена Apple APNs...';
      }
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then((reg) => reg.pushManager.getSubscription()).then((sub) => {
          if (sub && pushStatusSubtext && enablePushInSettingsBtn) {
            enablePushInSettingsBtn.textContent = '✓ Фон активен';
            pushStatusSubtext.textContent = '✓ Токен Apple APNs активен (работает при закрытом приложении)';
            pushStatusSubtext.style.color = 'var(--success)';
          } else if (pushStatusSubtext && enablePushInSettingsBtn) {
            enablePushInSettingsBtn.textContent = 'Включить фон';
            pushStatusSubtext.textContent = '⚠️ Нажмите кнопку справа для привязки фоновых пушей Apple';
            pushStatusSubtext.style.color = 'var(--warning)';
          }
        }).catch(() => {});
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


  // =========================================================================
  // СИСТЕМА ЗАКРЫТЫХ WEB PUSH УВЕДОМЛЕНИЙ (VAPID P-256 + RFC 8291 aes128gcm)
  // Работает через Apple APNs (web.push.apple.com) и Google FCM даже когда приложение закрыто!
  // Проверено в Apple WebKit (CoreCrypto / Security.framework) — точная пара P-256 (v32)
  // =========================================================================
  const VAPID_PUBLIC_B64U = "BNx408mM4zlTTpxhdNA04JuZ7Ajn_Av9KylLpdioUucSkA6qn_aObq6osNkyamzIRi6FwdLZeTbh0yV65gqmb5Y";
  const VAPID_PRIVATE_JWK = {
    kty: "EC",
    crv: "P-256",
    x: "3HjTyYzjOVNOnGF00DTgm5nsCOf8C_0rKUul2KhS5xI",
    y: "kA6qn_aObq6osNkyamzIRi6FwdLZeTbh0yV65gqmb5Y",
    d: "_XnW3CDlbmSO-lZV-xEuDwNUEh9TIhzK0ZqMjklinlw",
    key_ops: ["sign"],
    ext: true
  };
  const VAPID_PRIVATE_PKCS8_B64U = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg_XnW3CDlbmSO-lZV-xEuDwNUEh9TIhzK0ZqMjklinlyhRANCAATceNPJjOM5U06cYXTQNOCbmewI5_wL_SspS6XYqFLnEpAOqp_2jm6uqLDZMmpsyEYuhcHS2Xk24dMleuYKpm-W";
  const VAPID_VER_STORAGE_KEY = "pulse_vapid_pub_v32";

  function b64uToBytes(b64u) {
    const noPad = String(b64u || "").trim().replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
    const pad = "=".repeat((4 - (noPad.length % 4)) % 4);
    const raw = atob(noPad + pad);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function bytesToB64u(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function concatUint8(...arrays) {
    const total = arrays.reduce((acc, a) => acc + a.length, 0);
    const res = new Uint8Array(total);
    let off = 0;
    for (const a of arrays) {
      res.set(a, off);
      off += a.length;
    }
    return res;
  }

  function isSubUsingCurrentVapid(sub) {
    if (!sub) return false;
    try {
      if (sub.options && sub.options.applicationServerKey) {
        const keyB64u = bytesToB64u(new Uint8Array(sub.options.applicationServerKey));
        if (keyB64u && keyB64u !== VAPID_PUBLIC_B64U) return false;
      }
    } catch (e) {}
    return localStorage.getItem(VAPID_VER_STORAGE_KEY) === VAPID_PUBLIC_B64U;
  }

  let cachedSwReg = null;
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(async (r) => {
      cachedSwReg = r;
      try {
        if (r.pushManager) {
          const existing = await r.pushManager.getSubscription();
          if (existing && !isSubUsingCurrentVapid(existing)) {
            await existing.unsubscribe();
          }
        }
      } catch (e) {}
    }).catch(() => {});
  }

  async function extractSubJson(sub) {
    if (!sub) return null;
    const rawJson = typeof sub.toJSON === "function" ? sub.toJSON() : sub;
    const endpoint = (rawJson && rawJson.endpoint) || sub.endpoint;
    let p256dh = rawJson && rawJson.keys && rawJson.keys.p256dh;
    let auth = rawJson && rawJson.keys && rawJson.keys.auth;
    if ((!p256dh || !auth) && typeof sub.getKey === "function") {
      const k1 = sub.getKey("p256dh");
      const k2 = sub.getKey("auth");
      if (k1) p256dh = bytesToB64u(new Uint8Array(k1));
      if (k2) auth = bytesToB64u(new Uint8Array(k2));
    }
    if (!endpoint || !p256dh || !auth) return null;
    return { endpoint, keys: { p256dh, auth }, v: 32 };
  }

  async function registerAndSaveWebPushSubscription(directSubPromise, forceResubscribe = false) {
    if (!currentUser || !supabaseClient || !("serviceWorker" in navigator) || !("PushManager" in window)) return null;
    try {
      const reg = cachedSwReg || (await navigator.serviceWorker.ready);
      cachedSwReg = reg;
      let sub = null;

      if (forceResubscribe) {
        const oldSub = await reg.pushManager.getSubscription();
        if (oldSub) {
          try { await oldSub.unsubscribe(); } catch (e) {}
        }
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64uToBytes(VAPID_PUBLIC_B64U)
        });
      } else if (directSubPromise) {
        try {
          sub = await directSubPromise;
          if (sub && !isSubUsingCurrentVapid(sub)) {
            try { await sub.unsubscribe(); } catch (e) {}
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: b64uToBytes(VAPID_PUBLIC_B64U)
            });
          }
        } catch (subErr) {
          const oldSub = await reg.pushManager.getSubscription();
          if (oldSub) {
            try { await oldSub.unsubscribe(); } catch (e) {}
          }
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: b64uToBytes(VAPID_PUBLIC_B64U)
          });
        }
      } else {
        sub = await reg.pushManager.getSubscription();
        if (sub && !isSubUsingCurrentVapid(sub)) {
          try { await sub.unsubscribe(); } catch (e) {}
          sub = null;
        }
        if (!sub && "Notification" in window && Notification.permission === "granted") {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: b64uToBytes(VAPID_PUBLIC_B64U)
          });
        }
      }

      if (!sub) return null;
      localStorage.setItem(VAPID_VER_STORAGE_KEY, VAPID_PUBLIC_B64U);

      const subJson = await extractSubJson(sub);
      if (!subJson) return null;

      const existingSubs = Array.isArray(currentUser.push_subs) ? currentUser.push_subs : [];
      const filtered = existingSubs.filter((s) => s && s.v === 32 && s.endpoint && s.endpoint !== subJson.endpoint);
      filtered.push(subJson);
      const trimmed = filtered.slice(-4);

      currentUser.push_subs = trimmed;
      const packed = packProfileMeta({
        color: currentUser.color,
        username: currentUser.username,
        phone: currentUser.phone,
        avatar_url: currentUser.avatar_url,
        bio: currentUser.bio,
        push_subs: trimmed
      });
      await supabaseClient
        .from("profiles")
        .update({ avatar_color: packed, last_seen: new Date().toISOString() })
        .eq("id", currentUser.id);
      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = "✓ Токен Apple APNs активен (работает при закрытом приложении)";
        pushStatusSubtext.style.color = "var(--success)";
      }
      if (enablePushInSettingsBtn) {
        enablePushInSettingsBtn.textContent = "Тест пуша (6с)";
      }
      return subJson;
    } catch (e) {
      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = "Ошибка привязки токена: " + (e.message || e);
        pushStatusSubtext.style.color = "var(--danger)";
      }
      return null;
    }
  }

  // На iOS WebKit pushManager.subscribe требует прямого касания экрана (user gesture)
  const ensurePushSubOnGesture = () => {
    if (currentUser && "Notification" in window && Notification.permission === "granted") {
      registerAndSaveWebPushSubscription();
    }
  };
  window.addEventListener("touchend", ensurePushSubOnGesture, { once: true, passive: true });
  window.addEventListener("click", ensurePushSubOnGesture, { once: true });

  async function hmacSha256(keyBytes, dataBytes) {
    const k = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", k, dataBytes);
    return new Uint8Array(sig);
  }

  async function hkdfExtractAndExpand(salt, ikm, infoBytes, length) {
    const prk = await hmacSha256(salt, ikm);
    const t = await hmacSha256(prk, concatUint8(infoBytes, new Uint8Array([1])));
    return t.slice(0, length);
  }

  async function importVapidSigningKey() {
    try {
      return await crypto.subtle.importKey(
        "jwk",
        VAPID_PRIVATE_JWK,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign"]
      );
    } catch (jwkErr) {
      return await crypto.subtle.importKey(
        "pkcs8",
        b64uToBytes(VAPID_PRIVATE_PKCS8_B64U),
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign"]
      );
    }
  }

  async function buildWebPushEncryptedPacket(sub, payloadObj) {
    const enc = new TextEncoder();
    const plainBytes = enc.encode(JSON.stringify(payloadObj));
    const uaPublicBytes = b64uToBytes(sub.keys.p256dh);
    const authSecretBytes = b64uToBytes(sub.keys.auth);

    const uaPubKey = await crypto.subtle.importKey(
      "raw",
      uaPublicBytes,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );
    const asKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    const asPublicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", asKeyPair.publicKey));
    const sharedSecret = new Uint8Array(
      await crypto.subtle.deriveBits({ name: "ECDH", public: uaPubKey }, asKeyPair.privateKey, 256)
    );

    const keyInfo = concatUint8(enc.encode("WebPush: info"), new Uint8Array([0]), uaPublicBytes, asPublicRaw);
    const ikm = await hkdfExtractAndExpand(authSecretBytes, sharedSecret, keyInfo, 32);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const cek = await hkdfExtractAndExpand(salt, ikm, concatUint8(enc.encode("Content-Encoding: aes128gcm"), new Uint8Array([0])), 16);
    const nonce = await hkdfExtractAndExpand(salt, ikm, concatUint8(enc.encode("Content-Encoding: nonce"), new Uint8Array([0])), 12);

    const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
    const paddedPlain = concatUint8(plainBytes, new Uint8Array([2]));
    const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, aesKey, paddedPlain);
    const cipherBytes = new Uint8Array(cipherBuf);

    // Header RFC 8291: salt(16) + rs(4, 4096) + idlen(1, 65) + keyid(65)
    const rsBytes = new Uint8Array([0x00, 0x00, 0x10, 0x00]);
    const idLenBytes = new Uint8Array([65]);
    const bodyBytes = concatUint8(salt, rsBytes, idLenBytes, asPublicRaw, cipherBytes);

    // VAPID JWT (RFC 8292)
    const u = new URL(sub.endpoint);
    const aud = `${u.protocol}//${u.host}`;
    const exp = Math.floor(Date.now() / 1000) + 43200;
    const jwtHdr = bytesToB64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
    const jwtPay = bytesToB64u(enc.encode(JSON.stringify({ aud, exp, sub: "mailto:pulse@rickaveri.github.io" })));
    const unsignedToken = `${jwtHdr}.${jwtPay}`;
    const vapidKey = await importVapidSigningKey();
    const sigBuf = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      vapidKey,
      enc.encode(unsignedToken)
    );
    const jwt = `${unsignedToken}.${bytesToB64u(new Uint8Array(sigBuf))}`;
    const authHeader = `vapid t=${jwt}, k=${VAPID_PUBLIC_B64U}`;

    return { endpoint: sub.endpoint, authHeader, bodyBytes };
  }

  async function dispatchClosedAppWebPushForRoom(room, plainPreview) {
    if (!room || !currentUser || !supabaseClient) return;
    try {
      const dk = room.direct_key || "";
      if (dk.startsWith("saved_")) return;
      let targetRecipientIds = [];
      if (!room.is_group && dk.includes("_")) {
        targetRecipientIds = dk.split("_").filter((id) => id && id !== currentUser.id);
      } else if (room.is_group && dk.startsWith("grp|")) {
        targetRecipientIds = (dk.split("|")[1] || "").split(",").filter((id) => id && id !== currentUser.id);
      }
      if (!targetRecipientIds.length) return;

      const senderTitle = currentUser.display_name || currentUser.username || "Pulse";
      const pushPayload = {
        title: senderTitle,
        body: plainPreview || "Новое сообщение",
        roomId: room.id
      };

      const { data: freshProfs } = await supabaseClient
        .from("profiles")
        .select("*")
        .in("id", targetRecipientIds);
      const freshList = (freshProfs || []).map(unpackProfile).filter(Boolean);

      for (const uid of targetRecipientIds) {
        const prof = freshList.find((p) => p.id === uid) || allProfiles.find((p) => p.id === uid);
        const subs = prof && Array.isArray(prof.push_subs) ? prof.push_subs : [];
        for (const sub of subs) {
          if (!sub || !sub.endpoint || !sub.keys) continue;
          try {
            const pkt = await buildWebPushEncryptedPacket(sub, pushPayload);
            const bodyB64 = uint8ToBase64(pkt.bodyBytes);
            const workerUrl = (window.MESSENGER_CONFIG && window.MESSENGER_CONFIG.PUSH_WORKER_URL) || "https://morning-grass-d126.rikaverisestakov.workers.dev/";
            // 0) Мгновенная 24/7 отправка через круглосуточный облачный сервер Cloudflare Workers в Apple APNs / Google FCM!
            fetch(workerUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                endpoint: pkt.endpoint,
                authHeader: pkt.authHeader,
                bodyB64: bodyB64
              }),
              keepalive: true
            }).catch(() => {});
          } catch (err) {}
        }
      }
    } catch (e) {}
  }

  async function requestNotificationPermission() {
    triggerHaptic('medium');
    if (!('Notification' in window)) {
      alert('Чтобы получать системные Push-уведомления на iPhone, откройте Pulse с иконки на экране «Домой» (iOS 16.4 и новее).');
      return;
    }
    try {
      let directSubPromise = null;
      const isAlreadyV32 = localStorage.getItem(VAPID_VER_STORAGE_KEY) === VAPID_PUBLIC_B64U;
      if (Notification.permission === 'granted' && cachedSwReg && cachedSwReg.pushManager && isAlreadyV32) {
        directSubPromise = cachedSwReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64uToBytes(VAPID_PUBLIC_B64U)
        });
      } else if (Notification.permission !== 'granted') {
        const permRes = await Notification.requestPermission();
        if (permRes !== 'granted') {
          updatePushPermissionUI();
          return;
        }
        const reg = cachedSwReg || (await navigator.serviceWorker.ready);
        cachedSwReg = reg;
        directSubPromise = reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64uToBytes(VAPID_PUBLIC_B64U)
        });
      }

      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = 'Связь с сервером Apple APNs и Cloudflare...';
      }

      let subJson = await registerAndSaveWebPushSubscription(directSubPromise, !isAlreadyV32);
      if (!subJson) return;

      let pkt = await buildWebPushEncryptedPacket(subJson, {
        title: "Pulse — Облачный пуш 24/7 🔔",
        body: "Ура! Уведомления при полностью закрытом приложении работают!",
        roomId: null
      });

      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = '📲 Сразу сверните приложение: через 6 сек облако пришлёт пуш!';
        pushStatusSubtext.style.color = 'var(--success)';
      }

      const workerUrl = (window.MESSENGER_CONFIG && window.MESSENGER_CONFIG.PUSH_WORKER_URL) || "https://morning-grass-d126.rikaverisestakov.workers.dev/";
      let res = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: pkt.endpoint,
          authHeader: pkt.authHeader,
          bodyB64: uint8ToBase64(pkt.bodyBytes),
          delayMs: 6000
        }),
        keepalive: true
      });
      let textResp = await res.text();
      let parsedResp = null;
      try { parsedResp = JSON.parse(textResp); } catch (e) {}

      // Если на iPhone оставался старый токен APNs (403 BadJwtToken / 410), автоматически пересоздаём токен и повторяем!
      if (parsedResp && !parsedResp.ok && (parsedResp.status === 403 || parsedResp.status === 410 || parsedResp.status === 400)) {
        subJson = await registerAndSaveWebPushSubscription(null, true);
        if (subJson) {
          pkt = await buildWebPushEncryptedPacket(subJson, {
            title: "Pulse — Облачный пуш 24/7 🔔",
            body: "Токен обновлён! Уведомления при закрытом приложении работают!",
            roomId: null
          });
          res = await fetch(workerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: pkt.endpoint,
              authHeader: pkt.authHeader,
              bodyB64: uint8ToBase64(pkt.bodyBytes),
              delayMs: 6000
            }),
            keepalive: true
          });
          textResp = await res.text();
          try { parsedResp = JSON.parse(textResp); } catch (e) {}
        }
      }

      if (parsedResp && parsedResp.ok) {
        if (pushStatusSubtext) {
          pushStatusSubtext.textContent = `✓ Apple APNs принял пуш (HTTP ${parsedResp.status})! Работает 24/7`;
          pushStatusSubtext.style.color = 'var(--success)';
        }
      } else if (parsedResp && !parsedResp.ok) {
        if (pushStatusSubtext) {
          pushStatusSubtext.textContent = `Ответ APNs (${parsedResp.status}): ${parsedResp.info || parsedResp.error || "ошибка"}`;
          pushStatusSubtext.style.color = 'var(--danger)';
        }
      }
    } catch (e) {
      if (pushStatusSubtext) {
        pushStatusSubtext.textContent = 'Ошибка: ' + (e.message || e);
        pushStatusSubtext.style.color = 'var(--danger)';
      }
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
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            body,
            roomId: roomId || null
          });
          return;
        }
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body,
            tag: `pulse-msg-${Date.now()}`,
            renotify: true,
            vibrate: [200, 100, 200],
            data: { roomId: roomId || null }
          });
          return;
        }
      }
      const n = new Notification(title, { body, tag: `pulse-${Date.now()}` });
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


  function getPeerReadTimestampForRoom(room, msgs) {
    if (!room || !currentUser) return 0;
    const dk = room.direct_key || '';
    if (dk.startsWith('saved_')) return Date.now() + 86400000;

    let bestTs = peerReadByRoom.get(room.id) || 0;

    // Проверяем read_receipts у собеседника(ов) в профилях
    if (!room.is_group && dk.includes('_')) {
      const peerId = dk.split('_').find((id) => id && id !== currentUser.id);
      const peer = allProfiles.find((p) => p.id === peerId);
      if (peer && peer.read_receipts && peer.read_receipts[room.id]) {
        bestTs = Math.max(bestTs, Number(peer.read_receipts[room.id]) || 0);
      }
    } else if (room.is_group && dk.startsWith('grp|')) {
      const memberIds = (dk.split('|')[1] || '').split(',').filter((id) => id && id !== currentUser.id);
      memberIds.forEach((uid) => {
        const p = allProfiles.find((pr) => pr.id === uid);
        if (p && p.read_receipts && p.read_receipts[room.id]) {
          bestTs = Math.max(bestTs, Number(p.read_receipts[room.id]) || 0);
        }
      });
    }

    // Если собеседник прислал любое сообщение или реакцию позже — значит все сообщения до этого момента точно прочитаны
    const list = msgs || roomMessagesCache.get(room.id) || [];
    for (let i = list.length - 1; i >= 0; i--) {
      const m = list[i];
      if (m && m.sender_id && m.sender_id !== currentUser.id && m.created_at) {
        const t = new Date(m.created_at).getTime();
        if (t > bestTs) bestTs = t;
        break;
      }
    }
    return bestTs;
  }

  let lastPublishedReadByRoom = new Map();
  async function publishReadReceiptForRoom(roomId) {
    if (!roomId || !currentUser || !supabaseClient) return;
    const nowTs = Date.now();
    const prevPub = lastPublishedReadByRoom.get(roomId) || 0;
    if (nowTs - prevPub < 2500) return;
    lastPublishedReadByRoom.set(roomId, nowTs);

    if (!currentUser.read_receipts || typeof currentUser.read_receipts !== 'object') {
      currentUser.read_receipts = {};
    }
    currentUser.read_receipts[roomId] = nowTs;

    // 1) Мгновенный сигнал собеседнику через Realtime-канал (0 мс)
    if (realtimeChannel) {
      realtimeChannel.send({
        type: 'broadcast',
        event: 'room-read',
        payload: {
          room_id: roomId,
          user_id: currentUser.id,
          read_ts: nowTs
        }
      }).catch(() => {});
    }

    // 2) Сохранение метки прочтения в профиле Supabase (чтобы статус сохранялся после перезагрузки)
    try {
      const rrEntries = Object.entries(currentUser.read_receipts)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 25);
      currentUser.read_receipts = Object.fromEntries(rrEntries);
      const packed = packProfileMeta({
        color: currentUser.color,
        username: currentUser.username,
        phone: currentUser.phone,
        avatar_url: currentUser.avatar_url,
        bio: currentUser.bio,
        push_subs: currentUser.push_subs,
        read_receipts: currentUser.read_receipts
      });
      await supabaseClient
        .from('profiles')
        .update({ avatar_color: packed, last_seen: new Date().toISOString() })
        .eq('id', currentUser.id);
    } catch (e) {}
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
    const isSavedRm = (room.direct_key || '').startsWith('saved_');
    const isLastMine = !isSavedRm && lastMsg.sender_id === currentUser.id;
    const msgTs = new Date(lastMsg.created_at).getTime();
    const peerReadTs = isLastMine ? getPeerReadTimestampForRoom(room, visible) : 0;
    const isLastRead = isLastMine && peerReadTs >= (msgTs - 1500);
    const prefix = lastMsg.sender_id === currentUser.id && !isSavedRm ? 'Вы: ' : '';
    roomSummaryMap.set(room.id, {
      preview: `${prefix}${rawPreview}`,
      timeStr: formatShortRoomTime(lastMsg.created_at),
      timestamp: msgTs,
      isLastMine,
      isLastRead
    });
  }

  async function preloadAllRoomsMessages() {
    if (!currentUser || !supabaseClient || myRooms.length === 0) return;
    const roomIds = myRooms.map((r) => r.id);
    const { data: descData, error } = await supabaseClient
      .from('messages')
      .select('*')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false })
      .limit(800);
    const data = descData
      ? [...descData].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      : null;

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
          let lastReadTs = getLastReadTimestamp(room.id);
          const isSavedRoom = (room.direct_key || "").startsWith("saved_");
          if (lastReadTs === 0) {
            if (isSavedRoom) {
              setLastReadTimestamp(room.id, Date.now());
              lastReadTs = Date.now();
            } else {
              lastReadTs = Date.now() - 86400000;
            }
          }
          if (lastReadTs > 0) {
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

  const notifiedMsgIds = new Set();
  async function handleIncomingMessageNotification(incoming) {
    if (!currentUser || !incoming || incoming.sender_id === currentUser.id) return;
    if (incoming.id && notifiedMsgIds.has(incoming.id)) return;
    if (incoming.id) notifiedMsgIds.add(incoming.id);

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

    const k = detectMessageKind(incoming);
    if (!isChatCurrentlyVisible) {
      if (k !== 'reaction_packet' && k !== 'pin_packet') {
        const prevCount = unreadCounts.get(room.id) || 0;
        unreadCounts.set(room.id, prevCount + 1);
        updateAppIconBadge();
        renderSidebarList();
      }
    } else {
      setLastReadTimestamp(room.id, Date.now());
    }

    showInAppToast({
      title: senderName,
      text: previewText,
      peer: senderProfile,
      roomId: room.id
    });

    sendSystemNotification(senderName, previewText, room.id);
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
      setTimeout(() => {
        if (sharedAudioCtx && !activeCallState && sharedAudioCtx.state === 'running') {
          sharedAudioCtx.suspend().catch(() => {});
        }
      }, 340);
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

  // 4. Сквозное шифрование AES-256-GCM (с мгновенным RAM-кэшем расшифровки и Promise-дедупликацией ключей v38)
  const cryptoKeyCache = new Map();
  const decryptedTextCache = new Map();

  function getRoomCustomSecret(roomId) {
    return localStorage.getItem(`pulse_e2e_${roomId}`) || '';
  }

  function setRoomCustomSecret(roomId, secret) {
    if (secret) {
      localStorage.setItem(`pulse_e2e_${roomId}`, secret);
    } else {
      localStorage.removeItem(`pulse_e2e_${roomId}`);
    }
    cryptoKeyCache.clear();
    decryptedTextCache.clear();
  }

  function deriveRoomCryptoKey(room) {
    const roomId = room.id;
    const customSecret = getRoomCustomSecret(roomId);
    const cacheKey = `${roomId}:${customSecret}`;
    if (cryptoKeyCache.has(cacheKey)) return cryptoKeyCache.get(cacheKey);

    const keyPromise = (async () => {
      const enc = new TextEncoder();
      const baseMaterial = `pulse-aes256-v1|${room.direct_key || room.id}|${customSecret}`;
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(baseMaterial),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      return crypto.subtle.deriveKey(
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
    })();

    cryptoKeyCache.set(cacheKey, keyPromise);
    return keyPromise;
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
      const cipherStr = `ENC1:${ivB64}:${cipherB64}`;
      const customSecret = getRoomCustomSecret(room.id);
      decryptedTextCache.set(`${room.id}:${customSecret}:${cipherStr}`, plainText);
      return cipherStr;
    } catch (e) {
      return plainText;
    }
  }

  async function decryptTextForRoom(storedText, room) {
    if (!storedText || !storedText.startsWith('ENC1:')) return storedText;
    const customSecret = getRoomCustomSecret(room.id);
    const memoKey = `${room.id}:${customSecret}:${storedText}`;
    if (decryptedTextCache.has(memoKey)) {
      return decryptedTextCache.get(memoKey);
    }
    try {
      const parts = storedText.split(':');
      if (parts.length !== 3) return storedText;
      const iv = base64ToUint8(parts[1]);
      const cipherBytes = base64ToUint8(parts[2]);
      const key = await deriveRoomCryptoKey(room);
      const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
      const decoded = new TextDecoder().decode(plainBuf);
      if (decryptedTextCache.size > 2500) {
        decryptedTextCache.clear();
      }
      decryptedTextCache.set(memoKey, decoded);
      return decoded;
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
  const peerReadByRoom = new Map();

  function packProfileMeta(meta) {
    return JSON.stringify({
      c: meta.color || '#6366f1',
      u: sanitizeUsername(meta.username),
      p: normalizePhone(meta.phone || ''),
      a: meta.avatar_url || '',
      b: (meta.bio || '').trim(),
      ps: meta.push_subs || (currentUser && currentUser.push_subs) || [],
      rr: meta.read_receipts || (currentUser && currentUser.read_receipts) || {}
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
          push_subs: Array.isArray(parsed.ps) ? parsed.ps : [],
          read_receipts: (parsed.rr && typeof parsed.rr === 'object') ? parsed.rr : {},
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
    if (!el) return;
    const cleanLetter = (letter || 'U')[0].toUpperCase();
    const cleanColor = color || '#6366f1';
    const nextKey = avatar_url ? `img:${avatar_url}` : `txt:${cleanLetter}:${cleanColor}`;
    if (el.dataset.renderedAvatarKey === nextKey) return;
    el.dataset.renderedAvatarKey = nextKey;

    if (avatar_url) {
      el.innerHTML = `<img src="${escapeHtml(avatar_url)}" alt="Аватар" decoding="async" />`;
      el.style.background = 'transparent';
    } else {
      el.innerHTML = '';
      el.textContent = cleanLetter;
      el.style.background = cleanColor;
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
    registerAndSaveWebPushSubscription();

    // Seed existing message IDs so we only notify on brand-new messages
    roomMessagesCache.forEach((msgs) => {
      (msgs || []).forEach((m) => { if (m && m.id) notifiedMsgIds.add(m.id); });
    });

    let lastPolledIso = new Date(Date.now() - 15000).toISOString();
    let pollTick = 0;
    setInterval(async () => {
      if (!currentUser || !supabaseClient) return;
      try {
        pollTick += 1;
        const prevRoomCount = myRooms.length;
        // Обновляем список комнат раз в 3 цикла (~9 сек), а новые сообщения проверяем легковесным дельта-запросом
        if (pollTick % 3 === 0 || myRooms.length === 0) {
          await refreshDirectoryAndRooms();
        }
        if (myRooms.length === 0) return;
        const rIds = myRooms.map((r) => r.id);
        const { data: recent } = await supabaseClient
          .from('messages')
          .select('*')
          .in('room_id', rIds)
          .gt('created_at', lastPolledIso)
          .order('created_at', { ascending: true })
          .limit(20);
        if (!recent || !recent.length) {
          if (myRooms.length !== prevRoomCount) await preloadAllRoomsMessages();
          return;
        }
        lastPolledIso = recent[recent.length - 1].created_at || new Date().toISOString();
        let hasNew = false;
        for (const m of recent) {
          if (m.id && !notifiedMsgIds.has(m.id)) {
            hasNew = true;
            if (m.sender_id !== currentUser.id) {
              await handleIncomingMessageNotification(m);
            } else {
              notifiedMsgIds.add(m.id);
            }
          }
        }
        if (hasNew) {
          if (activeRoom) await loadMessages(activeRoom.id);
          await preloadAllRoomsMessages();
        }
      } catch (e) {}
    }, 3200);

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
            <div class="chat-item-sub ${pres.isTyping ? 'typing' : draft ? 'draft' : ''}">${(!pres.isTyping && !draft && summary && summary.isLastMine) ? `<span class="sidebar-read-tick ${summary.isLastRead ? 'is-read' : ''}">${summary.isLastRead ? '✓✓' : '✓'}</span> ` : ''}${escapeHtml(subLine)}</div>
            ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
          </div>
        `;

        item.appendChild(avatarWrap);
        item.appendChild(body);
        let touchStartY = 0;
        let touchStartX = 0;
        let openedOnTouch = false;
        item.addEventListener('touchstart', (ev) => {
          const t = ev.touches && ev.touches[0];
          if (t) {
            touchStartX = t.clientX;
            touchStartY = t.clientY;
          }
          openedOnTouch = false;
        }, { passive: true });
        item.addEventListener('touchend', (ev) => {
          const t = ev.changedTouches && ev.changedTouches[0];
          if (!t) return;
          if (Math.abs(t.clientX - touchStartX) < 12 && Math.abs(t.clientY - touchStartY) < 12) {
            openedOnTouch = true;
            triggerHaptic('light');
            selectRoom(room);
          }
        }, { passive: true });
        item.addEventListener('click', () => {
          if (openedOnTouch) {
            openedOnTouch = false;
            return;
          }
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

  // 10. Выбор комнаты, сохранение черновика и МГНОВЕННОЕ открытие сразу на последнем сообщении без скачков (v40)
  let lastRoomOpenTs = 0;
  const fullyLoadedRoomIds = new Set();

  function pinChatToBottomInstant() {
    if (!messagesViewport) return;
    messagesViewport.scrollTop = messagesViewport.scrollHeight + 20000;
    requestAnimationFrame(() => {
      if (messagesViewport) {
        messagesViewport.scrollTop = messagesViewport.scrollHeight + 20000;
      }
    });
  }

  async function selectRoom(room) {
    if (activeRoom && !editingMsg) {
      setRoomDraft(activeRoom.id, messageInput.value);
    }

    activeRoom = room;
    currentSelectingRoomId = room.id;
    lastRoomOpenTs = Date.now();
    activeChatFilterQuery = '';
    if (chatSearchBar) chatSearchBar.classList.add('hidden');
    if (chatSearchInput) chatSearchInput.value = '';

    setLastReadTimestamp(room.id, Date.now());
    publishReadReceiptForRoom(room.id);
    if (unreadCounts.has(room.id)) {
      unreadCounts.delete(room.id);
      updateAppIconBadge();
    }

    clearComposerState();
    messageInput.value = getRoomDraft(room.id);
    updateSmartActionButtonUI();
    updateActiveRoomHeader();

    if (scrollBottomBtn) scrollBottomBtn.classList.add('hidden');
    if (pinnedMsgBar) pinnedMsgBar.classList.add('hidden');

    // СНАЧАЛА делаем контейнер чата видимым, чтобы scrollHeight имел реальную высоту, а не 0!
    emptyChatState.classList.add('hidden');
    activeChatView.classList.remove('hidden');
    appShell.classList.add('chat-active');
    renderSidebarList();
    syncViewportHeight();

    const cachedMsgs = roomMessagesCache.get(room.id);
    if (cachedMsgs && cachedMsgs.length > 0) {
      roomMessages = cachedMsgs;
      await renderMessages(room.id, true);
      pinChatToBottomInstant();
    } else {
      messagesViewport.innerHTML = '';
      messagesViewport.dataset.renderedRoomId = '';
      roomMessages = [];
    }

    await loadMessages(room.id, !cachedMsgs || cachedMsgs.length === 0);
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

  async function loadMessages(roomId, forceScrollBottom = false) {
    const { data: descMsgs, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(150);

    if (error) return;
    // Строгая хронологическая сортировка от старых к новым (чтобы сообщения из разных дней НИКОГДА не путались местами!)
    const fetched = (descMsgs || []).slice().sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const prevCached = roomMessagesCache.get(roomId) || [];
    const isIdenticalToRendered =
      messagesViewport.dataset.renderedRoomId === roomId &&
      prevCached.length === fetched.length &&
      prevCached.every((m, idx) => m.id === fetched[idx].id && m.content === fetched[idx].content);

    fullyLoadedRoomIds.add(roomId);
    roomMessagesCache.set(roomId, fetched);

    const targetRoomObj = myRooms.find((r) => r.id === roomId);
    if (targetRoomObj) {
      await updateSingleRoomSummaryFromMessages(targetRoomObj, fetched);
      if (!appShell.classList.contains('chat-active')) {
        renderSidebarList();
      }
    }

    if (!activeRoom || activeRoom.id !== roomId || currentSelectingRoomId !== roomId) return;

    roomMessages = fetched;
    setLastReadTimestamp(roomId, Date.now());

    // Если этот же полный список сообщений уже отрисован на экране — вообще не трогаем DOM, чтобы не было ни единого дёргания!
    if (isIdenticalToRendered) {
      if (forceScrollBottom) pinChatToBottomInstant();
      return;
    }

    await renderMessages(roomId, forceScrollBottom);
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

  async function renderMessages(targetRoomId, forceScrollBottom = false) {
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

    actualMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

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

    const distFromBottomBefore =
      messagesViewport.scrollHeight - messagesViewport.scrollTop - messagesViewport.clientHeight;
    const isSwitchingRoomNow = messagesViewport.dataset.renderedRoomId !== roomSnapshot.id;
    const isMediaPlayingInChat = Boolean(activePlayingMediaEl && !activePlayingMediaEl.paused);
    const wasNearBottom =
      Boolean(forceScrollBottom) ||
      isSwitchingRoomNow ||
      (!isMediaPlayingInChat && !replyToMsg && !editingMsg && distFromBottomBefore < 95);

    if (filteredList.length === 0) {
      messagesViewport.innerHTML = '';
      messagesViewport.dataset.renderedRoomId = roomSnapshot.id;
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

    // Проверяем, можно ли достроить только новые сообщения в конец без пересборки:
    // Только если в DOM уже лежит точное начало того же самого списка filteredList!
    const currentDomRows = Array.from(messagesViewport.querySelectorAll('.msg-row'));
    let canPatchIncrementally =
      messagesViewport.dataset.renderedRoomId === roomSnapshot.id &&
      !activeChatFilterQuery &&
      currentDomRows.length > 0 &&
      currentDomRows.length <= filteredList.length;

    if (canPatchIncrementally) {
      for (let i = 0; i < currentDomRows.length; i++) {
        const domId = currentDomRows[i].dataset.msgId || '';
        const targetId = String(filteredList[i].msg.id || '');
        if (!domId.startsWith('optimistic_msg_') && domId !== targetId) {
          canPatchIncrementally = false;
          break;
        }
      }
    }

    const isSameRoomIncremental = canPatchIncrementally;

    const existingRowsById = new Map();
    const existingOptRows = [];
    if (isSameRoomIncremental) {
      currentDomRows.forEach((el) => {
        const mid = el.dataset.msgId || '';
        if (mid.startsWith('optimistic_msg_')) {
          existingOptRows.push(el);
        } else if (mid) {
          existingRowsById.set(mid, el);
        }
      });
    } else {
      messagesViewport.innerHTML = '';
      messagesViewport.dataset.renderedRoomId = roomSnapshot.id;
    }

    // Капсулу прочтения обновляем мягко на месте в конце функции без удаления/мигания

    const peerReadTsForAll = getPeerReadTimestampForRoom(roomSnapshot, actualMessages);
    let lastDateKey = '';
    const existingDateKeys = new Set();
    if (isSameRoomIncremental) {
      Array.from(messagesViewport.querySelectorAll('.date-divider')).forEach((dEl) => {
        if (dEl.dataset.dateKey) existingDateKeys.add(dEl.dataset.dateKey);
      });
    }

    const validDomIds = new Set();

    filteredList.forEach(({ msg, plain }) => {
      const dKey = new Date(msg.created_at).toDateString();
      if (dKey !== lastDateKey) {
        lastDateKey = dKey;
        if (!existingDateKeys.has(dKey)) {
          existingDateKeys.add(dKey);
          const sep = document.createElement('div');
          sep.className = 'date-divider date-separator';
          sep.dataset.dateKey = dKey;
          sep.innerHTML = `<span>${escapeHtml(formatDateSeparator(msg.created_at))}</span>`;
          messagesViewport.appendChild(sep);
        }
      }

      const isMine = msg.sender_id === currentUser.id;
      const packetMapForSig = reactionsByTargetId.get(msg.id);
      const reactSig = packetMapForSig
        ? Array.from(packetMapForSig.entries()).map(([u, v]) => `${u}:${v.emoji}`).join(',')
        : '';
      const rowSig = `${msg.content || ''}|${reactSig}`;

      validDomIds.add(String(msg.id));

      // Проверяем: есть ли уже эта строка в DOM (или её оптимистичный двойник при отправке)
      let reusableRow = existingRowsById.get(String(msg.id));
      if (!reusableRow && isMine && !String(msg.id).startsWith('optimistic_') && existingOptRows.length > 0) {
        const matchIdx = existingOptRows.findIndex((el) => el.dataset.rowSig === rowSig);
        if (matchIdx !== -1) {
          reusableRow = existingOptRows.splice(matchIdx, 1)[0];
          reusableRow.dataset.msgId = String(msg.id);
        }
      }

      if (reusableRow && reusableRow.dataset.rowSig === rowSig) {
        // Обновляем только галочки прочтения (✓ -> ✓✓) на месте, НЕ трогая сам пузырёк сообщения!
        if (isMine) {
          const ticksEl = reusableRow.querySelector('.read-ticks');
          if (ticksEl) {
            const msgTimeMs = new Date(msg.created_at).getTime();
            const isReadByPeer = !msg._optimistic && peerReadTsForAll >= (msgTimeMs - 1500);
            ticksEl.className = `read-ticks ${isReadByPeer ? 'is-read' : 'is-sent'}`;
            ticksEl.textContent = msg._optimistic ? '⏳' : isReadByPeer ? '✓✓' : '✓';
          }
        }
        return;
      }
      const sender = allProfiles.find((p) => p.id === msg.sender_id);
      const senderName = (sender && sender.display_name) || msg.sender_name || 'Пользователь';

      const row = document.createElement('div');
      row.className = `msg-row ${isMine ? 'own mine' : 'other theirs'}`;
      row.dataset.msgId = msg.id;
      row.dataset.rowSig = rowSig;

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
          img.decoding = 'async';
          img.src = msg.media_url;
          img.alt = 'Фото';
          img.addEventListener('load', () => {
            if (!messagesViewport) return;
            if ((Date.now() - lastRoomOpenTs) < 900) {
              pinChatToBottomInstant();
            }
          }, { once: true });
          img.addEventListener('click', (ev) => {
            ev.stopPropagation();
            lightboxImg.src = msg.media_url;
            lightbox.classList.remove('hidden');
          });
          bubble.appendChild(img);
        } else if (kind === 'video_circle') {
          const circleOuter = document.createElement('div');
          circleOuter.className = 'circle-player-outer';

          const circleWrap = document.createElement('div');
          circleWrap.className = 'video-note-wrap video-circle-msg';
          const vid = document.createElement('video');
          vid.src = msg.media_url;
          vid.playsInline = true;
          vid.loop = false;
          vid.muted = false;
          vid.preload = 'metadata';

          let totalDurSec = Number(msg.media_duration) || 0;
          const badge = document.createElement('div');
          badge.className = 'video-note-badge circle-play-badge';
          badge.textContent = totalDurSec > 0 ? `▶ ${formatSec(totalDurSec)}` : '▶ Кружочек';

          // Интерактивная полоса перемотки и скорости под видеокружочком
          const controlsRow = document.createElement('div');
          controlsRow.className = 'circle-controls-row';
          controlsRow.addEventListener('click', (ev) => ev.stopPropagation());

          const scrubTrack = document.createElement('div');
          scrubTrack.className = 'circle-scrub-track';
          const scrubFill = document.createElement('div');
          scrubFill.className = 'circle-scrub-fill';
          scrubTrack.appendChild(scrubFill);

          const speedBtn = document.createElement('button');
          speedBtn.type = 'button';
          speedBtn.className = 'voice-speed-btn circle-speed-btn';
          speedBtn.textContent = '1x';
          const cSpeeds = [1, 1.5, 2];
          let cSpeedIdx = 0;
          speedBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            triggerHaptic('light');
            cSpeedIdx = (cSpeedIdx + 1) % cSpeeds.length;
            vid.playbackRate = cSpeeds[cSpeedIdx];
            speedBtn.textContent = `${cSpeeds[cSpeedIdx]}x`;
          });

          const seekCircleByClientX = (clientX) => {
            const rect = scrubTrack.getBoundingClientRect();
            if (!rect.width) return;
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const d = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : totalDurSec;
            if (d > 0) {
              try { vid.currentTime = ratio * d; } catch (e) {}
              scrubFill.style.width = `${Math.round(ratio * 100)}%`;
              const cur = Math.floor(ratio * d);
              badge.textContent = `${vid.paused ? '▶' : '⏸'} ${formatSec(cur)} / ${formatSec(Math.round(d))}`;
            }
          };

          scrubTrack.addEventListener('click', (ev) => {
            ev.stopPropagation();
            triggerHaptic('light');
            seekCircleByClientX(ev.clientX);
          });
          scrubTrack.addEventListener('touchmove', (ev) => {
            if (ev.touches && ev.touches[0]) {
              seekCircleByClientX(ev.touches[0].clientX);
            }
          }, { passive: true });

          vid.addEventListener('loadedmetadata', () => {
            if (isFinite(vid.duration) && vid.duration > 0) {
              totalDurSec = Math.round(vid.duration);
              if (vid.paused) {
                badge.textContent = `▶ ${formatSec(totalDurSec)}`;
              }
            }
            if ((Date.now() - lastRoomOpenTs) < 900) {
              pinChatToBottomInstant();
            }
          });

          vid.addEventListener('timeupdate', () => {
            const d = (isFinite(vid.duration) && vid.duration > 0) ? vid.duration : totalDurSec;
            const cur = Math.floor(vid.currentTime || 0);
            const ratio = d > 0 ? Math.min(1, (vid.currentTime || 0) / d) : 0;
            scrubFill.style.width = `${Math.round(ratio * 100)}%`;
            if (!vid.paused) {
              badge.textContent = d > 0 ? `⏸ ${formatSec(cur)} / ${formatSec(Math.round(d))}` : `⏸ ${formatSec(cur)}`;
            }
          });

          vid.addEventListener('ended', () => {
            vid.pause();
            if (activePlayingMediaEl === vid) activePlayingMediaEl = null;
            try { vid.currentTime = 0; } catch (e) {}
            scrubFill.style.width = '0%';
            badge.textContent = totalDurSec > 0 ? `▶ ${formatSec(totalDurSec)}` : '▶ Кружочек';
          });

          circleWrap.addEventListener('click', (ev) => {
            ev.stopPropagation();
            triggerHaptic('light');
            if (vid.paused || vid.ended) {
              pauseOtherActiveMedia(vid);
              if (vid.ended) {
                try { vid.currentTime = 0; } catch (e) {}
              }
              vid.playbackRate = cSpeeds[cSpeedIdx];
              vid.play().catch(() => {});
              const d = (isFinite(vid.duration) && vid.duration > 0) ? Math.round(vid.duration) : totalDurSec;
              const cur = Math.floor(vid.currentTime || 0);
              badge.textContent = d > 0 ? `⏸ ${formatSec(cur)} / ${formatSec(d)}` : '⏸ Пауза';
            } else {
              vid.pause();
              if (activePlayingMediaEl === vid) activePlayingMediaEl = null;
              const d = (isFinite(vid.duration) && vid.duration > 0) ? Math.round(vid.duration) : totalDurSec;
              const cur = Math.floor(vid.currentTime || 0);
              badge.textContent = d > 0 ? `▶ ${formatSec(cur)} / ${formatSec(d)}` : '▶ Пауза';
            }
          });

          circleWrap.appendChild(vid);
          circleWrap.appendChild(badge);
          controlsRow.appendChild(scrubTrack);
          controlsRow.appendChild(speedBtn);
          circleOuter.appendChild(circleWrap);
          circleOuter.appendChild(controlsRow);
          bubble.appendChild(circleOuter);
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

      const isSavedRoomView = (roomSnapshot.direct_key || '').startsWith('saved_');
      if (isMine && !isSavedRoomView) {
        const peerReadTs = getPeerReadTimestampForRoom(roomSnapshot, actualMessages);
        const msgTimeMs = new Date(msg.created_at).getTime();
        const isReadByPeer = !msg._optimistic && peerReadTs >= (msgTimeMs - 1500);
        const ticks = document.createElement('span');
        ticks.className = `read-ticks ${isReadByPeer ? 'is-read' : 'is-sent'}`;
        ticks.dataset.msgTs = String(msgTimeMs);
        ticks.textContent = msg._optimistic ? '⏳' : isReadByPeer ? '✓✓' : '✓';
        ticks.title = msg._optimistic
          ? 'Отправляется...'
          : isReadByPeer
          ? 'Прочитано собеседником'
          : 'Доставлено (ожидает прочтения)';
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

      if (reusableRow && reusableRow.parentNode === messagesViewport) {
        messagesViewport.replaceChild(row, reusableRow);
      } else {
        messagesViewport.appendChild(row);
      }
    });

    // Удаляем устаревшие строки (например, удалённые сообщения или старые временные строки)
    if (isSameRoomIncremental) {
      Array.from(messagesViewport.querySelectorAll('.msg-row')).forEach((el) => {
        if (!validDomIds.has(String(el.dataset.msgId || ''))) {
          el.remove();
        }
      });
    }

    // Мягкое обновление капсулы прочтения на месте БЕЗ пересоздания и мигания (v42)
    let seenCapsule = document.getElementById('pulseLiveSeenCapsule');
    const isSavedRoomNow = (roomSnapshot.direct_key || '').startsWith('saved_');
    if (filteredList.length > 0 && !activeChatFilterQuery && !isSavedRoomNow) {
      const lastEntry = filteredList[filteredList.length - 1];
      if (lastEntry && lastEntry.msg && lastEntry.msg.sender_id === currentUser.id) {
        const peerReadTs = getPeerReadTimestampForRoom(roomSnapshot, actualMessages);
        const lastMsgTs = new Date(lastEntry.msg.created_at).getTime();
        const isSeen = !lastEntry.msg._optimistic && peerReadTs >= (lastMsgTs - 1500);
        const pres = getRoomPresentation(roomSnapshot);
        const peerNameStr = pres.peer ? pres.peer.display_name : 'участниками';
        const seenTimeLabel = isSeen && peerReadTs > 0
          ? new Date(peerReadTs).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
          : '';
        const nextSeenKey = `${lastEntry.msg.id}:${lastEntry.msg._optimistic ? 'opt' : isSeen ? 'seen' : 'sent'}:${seenTimeLabel}`;

        if (!seenCapsule) {
          seenCapsule = document.createElement('div');
          seenCapsule.id = 'pulseLiveSeenCapsule';
        }
        if (seenCapsule.dataset.seenKey !== nextSeenKey) {
          seenCapsule.dataset.seenKey = nextSeenKey;
          seenCapsule.className = `pulse-seen-capsule ${isSeen ? 'seen-active' : 'sent-waiting'}`;
          if (lastEntry.msg._optimistic) {
            seenCapsule.innerHTML = `<span class="seen-dot-icon">⏳</span><span>Отправляется...</span>`;
          } else if (isSeen) {
            const initial = escapeHtml((peerNameStr || 'П').slice(0, 1).toUpperCase());
            const bgCol = (pres.peer && pres.peer.color) || 'var(--accent)';
            seenCapsule.innerHTML = `
              <span class="seen-mini-avatar" style="background:${bgCol};">${initial}</span>
              <span class="seen-status-text">👁️ Прочитано • <strong>${escapeHtml(peerNameStr)}</strong>${seenTimeLabel ? ` в ${seenTimeLabel}` : ''}</span>
            `;
          } else {
            seenCapsule.innerHTML = `<span class="seen-dot-icon">✓</span><span>Доставлено • ждёт прочтения</span>`;
          }
        }
        if (seenCapsule.parentNode !== messagesViewport || messagesViewport.lastElementChild !== seenCapsule) {
          messagesViewport.appendChild(seenCapsule);
        }
      } else {
        if (seenCapsule) seenCapsule.remove();
        if (document.visibilityState === 'visible') {
          publishReadReceiptForRoom(roomSnapshot.id);
        }
      }
    } else if (seenCapsule) {
      seenCapsule.remove();
    }

    if (!activeChatFilterQuery && wasNearBottom) {
      pinChatToBottomInstant();
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

  let activePlayingMediaEl = null;
  function pauseOtherActiveMedia(newMediaEl) {
    if (activePlayingMediaEl && activePlayingMediaEl !== newMediaEl) {
      try { activePlayingMediaEl.pause(); } catch (e) {}
    }
    activePlayingMediaEl = newMediaEl;
  }

  function buildCustomVoicePlayer(audioUrl, initialDuration) {
    const wrap = document.createElement('div');
    wrap.className = 'voice-player';
    wrap.addEventListener('click', (ev) => ev.stopPropagation());

    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';

    let knownTotalSec = Number(initialDuration) || 0;

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'voice-play-btn';
    playBtn.textContent = '▶';

    const barsWrap = document.createElement('div');
    barsWrap.className = 'voice-wave voice-bars';
    barsWrap.title = 'Нажмите или проведите пальцем для перемотки';
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
    durLabel.textContent = knownTotalSec > 0 ? formatSec(knownTotalSec) : '0:00';

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

    const seekByClientX = (clientX) => {
      const rect = barsWrap.getBoundingClientRect();
      if (!rect.width) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const total = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : knownTotalSec;
      if (total > 0) {
        try { audio.currentTime = ratio * total; } catch (e) {}
        const activeCount = Math.ceil(ratio * barEls.length);
        barEls.forEach((b, idx) => b.classList.toggle('played', idx < activeCount));
        durLabel.textContent = `${formatSec(Math.floor(ratio * total))} / ${formatSec(Math.round(total))}`;
      }
    };

    barsWrap.addEventListener('click', (ev) => {
      ev.stopPropagation();
      triggerHaptic('light');
      seekByClientX(ev.clientX);
    });

    barsWrap.addEventListener('touchmove', (ev) => {
      if (ev.touches && ev.touches[0]) {
        seekByClientX(ev.touches[0].clientX);
      }
    }, { passive: true });

    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        knownTotalSec = Math.round(audio.duration);
        if (audio.paused && audio.currentTime === 0) {
          durLabel.textContent = formatSec(knownTotalSec);
        }
      }
    });

    audio.addEventListener('timeupdate', () => {
      const total = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : knownTotalSec;
      const ratio = total > 0 ? Math.min(1, audio.currentTime / total) : 0;
      const activeCount = Math.ceil(ratio * barEls.length);
      barEls.forEach((b, idx) => b.classList.toggle('played', idx < activeCount));
      const cur = Math.floor(audio.currentTime || 0);
      durLabel.textContent = total > 0 ? `${formatSec(cur)} / ${formatSec(Math.round(total))}` : formatSec(cur);
    });

    audio.addEventListener('pause', () => {
      playBtn.textContent = '▶';
    });

    audio.addEventListener('ended', () => {
      playBtn.textContent = '▶';
      if (activePlayingMediaEl === audio) activePlayingMediaEl = null;
      try { audio.currentTime = 0; } catch (e) {}
      barEls.forEach((b) => b.classList.remove('played'));
      durLabel.textContent = knownTotalSec > 0 ? formatSec(knownTotalSec) : '0:00';
    });

    playBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      triggerHaptic('light');
      if (audio.paused) {
        pauseOtherActiveMedia(audio);
        audio.playbackRate = speeds[speedIdx];
        audio.play().catch(() => {});
        playBtn.textContent = '⏸';
      } else {
        audio.pause();
        if (activePlayingMediaEl === audio) activePlayingMediaEl = null;
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

    const { data: insertedRows, error } = await insertMessageRow({
      room_id: roomSnapshot.id,
      content: encrypted,
      media_type: 'text'
    });

    if (error) {
      alert('Ошибка отправки: ' + error.message);
      await loadMessages(roomSnapshot.id);
      return;
    }

    if (insertedRows && insertedRows[0]) {
      const realRow = insertedRows[0];
      roomMessages = roomMessages.map((m) => (m.id === tempId ? realRow : m));
      // Удаляем дубликат, если realtime уже успел добавить его
      const seenIds = new Set();
      roomMessages = roomMessages.filter((m) => {
        if (seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      });
      roomMessagesCache.set(roomSnapshot.id, roomMessages);
      await updateSingleRoomSummaryFromMessages(roomSnapshot, roomMessages);
      if (!appShell.classList.contains('chat-active')) {
        renderSidebarList();
      }
      if (activeRoom && activeRoom.id === roomSnapshot.id) {
        await renderMessages(roomSnapshot.id);
      }
    }
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
          uploadBlob = await compressImage(file, 1080, 0.80);
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

  let vcCanvas = null;
  let vcCanvasCtx = null;
  let vcDrawRafId = null;
  let vcCameraTrackStream = null;
  let isFinishingRecord = false;

  function stopVcCanvasLoop() {
    if (vcDrawRafId) {
      cancelAnimationFrame(vcDrawRafId);
      vcDrawRafId = null;
    }
    if (vcCameraTrackStream) {
      vcCameraTrackStream.getTracks().forEach((t) => t.stop());
      vcCameraTrackStream = null;
    }
  }

  function startVcCanvasDrawingLoop() {
    if (!vcCanvas) {
      vcCanvas = document.createElement('canvas');
      vcCanvas.width = 360;
      vcCanvas.height = 360;
      vcCanvasCtx = vcCanvas.getContext('2d');
    }
    const drawFrame = () => {
      if (!isRecording || recordMode !== 'video') return;
      if (videoCirclePreview && videoCirclePreview.readyState >= 2 && !isRecordingPaused) {
        const vw = videoCirclePreview.videoWidth || 360;
        const vh = videoCirclePreview.videoHeight || 360;
        const side = Math.min(vw, vh);
        const sx = Math.floor((vw - side) / 2);
        const sy = Math.floor((vh - side) / 2);
        vcCanvasCtx.save();
        if (cameraFacingMode === 'user') {
          vcCanvasCtx.translate(360, 0);
          vcCanvasCtx.scale(-1, 1);
        }
        vcCanvasCtx.drawImage(videoCirclePreview, sx, sy, side, side, 0, 0, 360, 360);
        vcCanvasCtx.restore();
      }
      vcDrawRafId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
  }

  async function startMediaRecording(mode) {
    if (isRecording || isFinishingRecord || !activeRoom) return;
    try {
      const isVideo = mode === 'video';
      cameraFacingMode = 'user';

      let recorderStream = null;
      if (isVideo) {
        const camStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          video: { facingMode: cameraFacingMode, width: { ideal: 360 }, height: { ideal: 360 }, frameRate: { ideal: 24, max: 24 } }
        });
        vcCameraTrackStream = camStream;
        videoCirclePreview.srcObject = camStream;
        videoCirclePreview.muted = true;
        videoCirclePreview.playsInline = true;
        videoCirclePreview.play().catch(() => {});
        videoCirclePreview.classList.toggle('mirrored', cameraFacingMode === 'user');

        isRecording = true;
        isRecordingLocked = true;
        isRecordingPaused = false;
        recordCanceled = false;
        recordedChunks = [];
        elapsedRecordMs = 0;
        lastResumeTime = Date.now();

        startVcCanvasDrawingLoop();

        // Объединяем непрерывный поток холста (360x360 @ 24fps) и микрофона, чтобы при переключении фронталки/основной камеры запись НЕ прерывалась!
        if (vcCanvas && typeof vcCanvas.captureStream === 'function') {
          const canvasStream = vcCanvas.captureStream(24);
          const combined = new MediaStream();
          canvasStream.getVideoTracks().forEach((t) => combined.addTrack(t));
          camStream.getAudioTracks().forEach((t) => combined.addTrack(t));
          recorderStream = combined;
        } else {
          recorderStream = camStream;
        }
        activeMediaStream = recorderStream;
        vcPauseBtn.textContent = '⏸ Пауза';
        videoCircleOverlay.classList.remove('hidden');
      } else {
        const audioStream = await acquireVoiceStreamOnce();
        activeMediaStream = audioStream;
        recorderStream = audioStream;
        isRecording = true;
        isRecordingLocked = false;
        isRecordingPaused = false;
        recordCanceled = false;
        recordedChunks = [];
        elapsedRecordMs = 0;
        lastResumeTime = Date.now();

        messageInput.classList.add('hidden');
        recordingBar.classList.remove('hidden');
        pauseVoiceBtn.textContent = '⏸ Пауза';
        recDot.classList.remove('paused');
      }

      updateRecordingTimersUI();
      updateSmartActionButtonUI();

      recordTimerInterval = setInterval(updateRecordingTimersUI, 300);

      activeMediaRecorder = createMediaRecorderForStream(recorderStream, isVideo);
      activeMediaRecorder.start(200);
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

    const recOpts = supportedMime ? { mimeType: supportedMime } : {};
    if (isVideo) {
      recOpts.videoBitsPerSecond = 260000;
      recOpts.audioBitsPerSecond = 32000;
    } else {
      recOpts.audioBitsPerSecond = 32000;
    }
    let recorder;
    try {
      recorder = new MediaRecorder(stream, recOpts);
    } catch (e) {
      recorder = supportedMime ? new MediaRecorder(stream, { mimeType: supportedMime }) : new MediaRecorder(stream);
    }

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data);
    };

    recorder.onstop = async () => {
      isFinishingRecord = false;
      const wasCanceled = recordCanceled;
      const chunks = [...recordedChunks];
      const recMime = recorder.mimeType || (isVideo ? 'video/mp4' : 'audio/webm');
      const totalSec = Math.max(1, getElapsedRecordingSeconds());
      const targetRoomSnapshot = activeRoom;
      cleanupRecordingUI();

      if (wasCanceled || chunks.length === 0 || !targetRoomSnapshot) return;

      const blob = new Blob(chunks, { type: recMime });
      const ext = isVideo
        ? recMime.includes('mp4') ? 'mp4' : 'webm'
        : recMime.includes('mp4') ? 'm4a' : 'webm';
      const path = `${targetRoomSnapshot.id}/${isVideo ? 'circle' : 'voice'}_${Date.now()}.${ext}`;

      // Мгновенно показываем оптимистичное сообщение в ленте чата (0 мс), чтобы пользователь сразу видел отправку!
      const tempId = `optimistic_msg_${Date.now()}`;
      const localBlobUrl = URL.createObjectURL(blob);
      const optimisticMediaRow = {
        id: tempId,
        room_id: targetRoomSnapshot.id,
        sender_id: currentUser.id,
        sender_name: currentUser.display_name,
        sender_color: currentUser.color,
        content: '',
        media_url: localBlobUrl,
        media_type: 'audio',
        media_duration: totalSec,
        created_at: new Date().toISOString(),
        _optimistic: true
      };
      if (activeRoom && activeRoom.id === targetRoomSnapshot.id) {
        roomMessages.push(optimisticMediaRow);
        roomMessagesCache.set(targetRoomSnapshot.id, roomMessages);
        await renderMessages(targetRoomSnapshot.id, true);
      }

      try {
        const { error: upErr } = await supabaseClient.storage
          .from('chat-media')
          .upload(path, blob, { contentType: blob.type });
        if (upErr) throw upErr;

        const { data: pub } = supabaseClient.storage.from('chat-media').getPublicUrl(path);
        const { data: insertedRows, error } = await insertMessageRow({
          room_id: targetRoomSnapshot.id,
          content: '',
          media_url: pub.publicUrl,
          media_type: 'audio',
          media_duration: totalSec
        });
        if (error) throw error;

        if (insertedRows && insertedRows[0]) {
          const realRow = insertedRows[0];
          roomMessages = roomMessages.map((m) => (m.id === tempId ? realRow : m));
          const seenIds = new Set();
          roomMessages = roomMessages.filter((m) => {
            if (seenIds.has(m.id)) return false;
            seenIds.add(m.id);
            return true;
          });
          roomMessagesCache.set(targetRoomSnapshot.id, roomMessages);
          await updateSingleRoomSummaryFromMessages(targetRoomSnapshot, roomMessages);
          if (activeRoom && activeRoom.id === targetRoomSnapshot.id) {
            await renderMessages(targetRoomSnapshot.id, true);
          }
        }
      } catch (err) {
        alert('Не удалось отправить запись: ' + (err.message || err));
        await loadMessages(targetRoomSnapshot.id, true);
      }
    };

    return recorder;
  }

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

  // Бесшовное переключение камеры прямо во время записи кружочка БЕЗ остановки MediaRecorder!
  let isFlippingCamera = false;
  async function flipVideoCircleCamera(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (!isRecording || recordMode !== 'video' || isFlippingCamera) return;
    isFlippingCamera = true;
    triggerHaptic('light');
    const nextFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    try {
      const newVideoOnlyStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextFacing, width: { ideal: 360 }, height: { ideal: 360 }, frameRate: { ideal: 24, max: 24 } },
        audio: false
      });
      const newVideoTrack = newVideoOnlyStream.getVideoTracks()[0];
      if (newVideoTrack && vcCameraTrackStream) {
        vcCameraTrackStream.getVideoTracks().forEach((oldTrack) => {
          vcCameraTrackStream.removeTrack(oldTrack);
          oldTrack.stop();
        });
        vcCameraTrackStream.addTrack(newVideoTrack);
      }
      cameraFacingMode = nextFacing;
      videoCirclePreview.srcObject = vcCameraTrackStream;
      videoCirclePreview.classList.toggle('mirrored', cameraFacingMode === 'user');
      await videoCirclePreview.play().catch(() => {});
    } catch (err) {
      alert('Не удалось переключить камеру: ' + (err.message || err));
    } finally {
      isFlippingCamera = false;
    }
  }

  vcFlipCamBtn.addEventListener('click', flipVideoCircleCamera);

  function finishRecordingAndSend(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (!isRecording || !activeMediaRecorder || isFinishingRecord) return;
    isFinishingRecord = true;
    triggerHaptic('medium');
    recordCanceled = false;
    try {
      if (activeMediaRecorder.state === 'paused' && activeMediaRecorder.resume) {
        activeMediaRecorder.resume();
      }
      if (activeMediaRecorder.state !== 'inactive') {
        try { activeMediaRecorder.requestData(); } catch (e) {}
        activeMediaRecorder.stop();
      } else {
        isFinishingRecord = false;
        cleanupRecordingUI();
      }
    } catch (e) {
      isFinishingRecord = false;
      cleanupRecordingUI();
    }
  }

  function cancelActiveRecording(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    if (!isRecording) return;
    triggerHaptic('light');
    recordCanceled = true;
    isFinishingRecord = false;
    if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
      try { activeMediaRecorder.stop(); } catch (e) { cleanupRecordingUI(); }
    } else {
      cleanupRecordingUI();
    }
  }

  cancelRecordBtn.addEventListener('click', cancelActiveRecording);
  vcCancelBtn.addEventListener('click', cancelActiveRecording);
  vcSendBtn.addEventListener('click', finishRecordingAndSend);
  vcSendBtn.addEventListener('touchend', finishRecordingAndSend, { passive: false });
  vcCancelBtn.addEventListener('touchend', cancelActiveRecording, { passive: false });
  vcFlipCamBtn.addEventListener('touchend', flipVideoCircleCamera, { passive: false });

  function cleanupRecordingUI() {
    isRecording = false;
    isRecordingLocked = false;
    isRecordingPaused = false;
    clearInterval(recordTimerInterval);
    stopVcCanvasLoop();
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

      // Мгновенно будим телефон собеседника через облачный Web Push (Apple APNs / Google FCM), если приложение у него закрыто!
      dispatchClosedAppWebPushForRoom(
        activeRoom,
        isVideo ? '📹 Входящий видеозвонок — нажмите, чтобы ответить!' : '📞 Входящий аудиозвонок — нажмите, чтобы ответить!'
      );

      const sendOfferBroadcast = () => {
        if (!activeCallState || !activeCallState.isOutgoing || activeCallState.callStartTime || !realtimeChannel) return;
        realtimeChannel.send({
          type: 'broadcast',
          event: 'call-signal',
          payload: {
            type: 'offer',
            from_id: currentUser.id,
            to_id: pres.peer.id,
            room_id: activeRoom.id,
            is_video: isVideo,
            sdp: rtcPeerConnection ? rtcPeerConnection.localDescription || offer : offer
          }
        }).catch(() => {});
      };
      sendOfferBroadcast();
      activeCallState.offerRepeatId = setInterval(sendOfferBroadcast, 900);
      // Автоматический сброс гудков через 35 секунд, если собеседник не ответил
      activeCallState.noAnswerTimeoutId = setTimeout(() => {
        if (activeCallState && activeCallState.isOutgoing && !activeCallState.callStartTime) {
          endActiveCall(true);
        }
      }, 35000);
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
      if (activeCallState) {
        if (!activeCallState.isOutgoing && activeCallState.peerId === payload.from_id && payload.sdp) {
          activeCallState.incomingOffer = payload.sdp;
        }
        return;
      }
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
      if (activeCallState && activeCallState.offerRepeatId) {
        clearInterval(activeCallState.offerRepeatId);
        activeCallState.offerRepeatId = null;
      }
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
    if (stateSnapshot && stateSnapshot.offerRepeatId) {
      clearInterval(stateSnapshot.offerRepeatId);
    }
    if (stateSnapshot && stateSnapshot.noAnswerTimeoutId) {
      clearTimeout(stateSnapshot.noAnswerTimeoutId);
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
      .on('broadcast', { event: 'room-read' }, ({ payload }) => {
        if (!payload || !payload.room_id || payload.user_id === currentUser.id) return;
        const ts = Number(payload.read_ts) || Date.now();
        peerReadByRoom.set(payload.room_id, ts);
        const prof = allProfiles.find((p) => p.id === payload.user_id);
        if (prof) {
          if (!prof.read_receipts) prof.read_receipts = {};
          prof.read_receipts[payload.room_id] = ts;
        }
        const rm = myRooms.find((r) => r.id === payload.room_id);
        if (rm) {
          const cached = roomMessagesCache.get(rm.id) || [];
          updateSingleRoomSummaryFromMessages(rm, cached).then(() => renderSidebarList()).catch(() => {});
        }
        if (activeRoom && activeRoom.id === payload.room_id) {
          renderMessages(activeRoom.id);
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload || payload.user_id === currentUser.id) return;
        const prevEntry = typingByRoom.get(payload.room_id);
        if (prevEntry && prevEntry.timerId) clearTimeout(prevEntry.timerId);
        const timerId = setTimeout(() => {
          typingByRoom.delete(payload.room_id);
          updateActiveRoomHeader();
          if (!appShell.classList.contains('chat-active')) renderSidebarList();
        }, 3400);
        typingByRoom.set(payload.room_id, { userId: payload.user_id, ts: Date.now(), timerId });
        updateActiveRoomHeader();
        if (!appShell.classList.contains('chat-active')) renderSidebarList();
      })
      .on('broadcast', { event: 'call-signal' }, ({ payload }) => {
        handleIncomingCallSignal(payload);
      })
      .on('broadcast', { event: 'new-message' }, async ({ payload }) => {
        if (!payload || !currentUser || payload.sender_id === currentUser.id) return;
        await handleIncomingMessageNotification(payload);
        if (activeRoom && payload.room_id === activeRoom.id) {
          if (!roomMessages.some((m) => m.id === payload.id)) {
            roomMessages.push(payload);
            roomMessagesCache.set(activeRoom.id, roomMessages);
            await renderMessages(activeRoom.id);
            await updateSingleRoomSummaryFromMessages(activeRoom, roomMessages);
          }
        } else if (payload.room_id) {
          const cached = roomMessagesCache.get(payload.room_id) || [];
          if (!cached.some((m) => m.id === payload.id)) {
            cached.push(payload);
            roomMessagesCache.set(payload.room_id, cached);
            const rm = myRooms.find((r) => r.id === payload.room_id);
            if (rm) {
              await updateSingleRoomSummaryFromMessages(rm, cached);
              renderSidebarList();
            }
          }
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        async (payload) => {
          const incoming = payload.new || payload.old;
          if (!incoming) return;

          if (payload.eventType === 'INSERT' && payload.new) {
            await handleIncomingMessageNotification(payload.new);
            if (activeRoom && incoming.room_id === activeRoom.id) {
              // Если сообщение уже добавлено локально (optimistic или через broadcast) — не дёргаем сеть и DOM повторно!
              if (roomMessages.some((m) => m.id === incoming.id || (m._optimistic && m.content === incoming.content))) {
                return;
              }
              roomMessages.push(incoming);
              roomMessagesCache.set(activeRoom.id, roomMessages);
              await renderMessages(activeRoom.id);
              await updateSingleRoomSummaryFromMessages(activeRoom, roomMessages);
              return;
            }
          }

          if (activeRoom && incoming.room_id === activeRoom.id) {
            await loadMessages(activeRoom.id);
          } else if (incoming.room_id) {
            const cached = roomMessagesCache.get(incoming.room_id) || [];
            if (payload.eventType === 'INSERT' && payload.new && !cached.some((m) => m.id === incoming.id)) {
              cached.push(incoming);
              roomMessagesCache.set(incoming.room_id, cached);
              const rm = myRooms.find((r) => r.id === incoming.room_id);
              if (rm) {
                await updateSingleRoomSummaryFromMessages(rm, cached);
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
          if (payload.eventType === 'UPDATE' && payload.new && wasKnown) {
            // Обновляем профиль в памяти без тяжёлой перезагрузки таблиц!
            const updatedProf = unpackProfile(payload.new);
            if (updatedProf) {
              allProfiles = allProfiles.map((p) => (p.id === updatedProf.id ? updatedProf : p));
              updateActiveRoomHeader();
              if (activeRoom) {
                renderMessages(activeRoom.id);
              }
            }
            return;
          }
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
  function compressImage(file, maxDim = 1080, quality = 0.80) {
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

  // =========================================================================
  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v15:
  // 1) Сворачивание активного звонка в компактную верхнюю панель (Mini Call Bar)
  // 2) Живой индикатор голоса собеседника в звонке (Speaking Ring)
  // 3) Вкладки-фильтры диалогов (Все / Непрочитанные / Личные / Группы)
  // 4) Свайп вправо от левого края экрана на телефоне для возврата к списку чатов
  // 5) Форматирование текста (**жирный**, *курсив*, `код`, ~~зачёркнутый~~), группировка пузырей и переход по цитате
  // 6) Полноэкранный просмотр фото с зумом и скачиванием в 1 клик
  // =========================================================================
  const callMinimizeBtn = document.getElementById('callMinimizeBtn');
  const miniCallBar = document.getElementById('miniCallBar');
  const miniCallRestoreArea = document.getElementById('miniCallRestoreArea');
  const miniCallText = document.getElementById('miniCallText');
  const miniCallHangupBtn = document.getElementById('miniCallHangupBtn');
  const chatFilterTabs = document.getElementById('chatFilterTabs');
  const filterUnreadCount = document.getElementById('filterUnreadCount');

  let isCallMinimized = false;
  let activeSidebarCategory = 'all';

  // 1. Свёрнутый режим звонка (Mini Call Bar) — общайтесь в чатах прямо во время звонка
  if (callMinimizeBtn && miniCallBar && callOverlay) {
    callMinimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('light');
      isCallMinimized = true;
      callOverlay.classList.add('hidden');
      miniCallBar.classList.remove('hidden');
      const peerLabel = callPeerName ? callPeerName.textContent : 'Собеседник';
      const statusLabel = callStatusText ? callStatusText.textContent : 'В звонке';
      if (miniCallText) {
        miniCallText.textContent = `📞 ${peerLabel} • ${statusLabel} (нажмите, чтобы открыть)`;
      }
    });

    if (miniCallRestoreArea) {
      miniCallRestoreArea.addEventListener('click', () => {
        triggerHaptic('light');
        isCallMinimized = false;
        miniCallBar.classList.add('hidden');
        callOverlay.classList.remove('hidden');
      });
    }

    if (miniCallHangupBtn && callHangupBtn) {
      miniCallHangupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('medium');
        isCallMinimized = false;
        miniCallBar.classList.add('hidden');
        callHangupBtn.click();
      });
    }

    if (callHangupBtn) {
      callHangupBtn.addEventListener('click', () => {
        isCallMinimized = false;
        miniCallBar.classList.add('hidden');
      });
    }

    setInterval(() => {
      if (!isCallMinimized) return;
      const hasStream =
        (callRemoteAudio && callRemoteAudio.srcObject) ||
        (callRemoteVideo && callRemoteVideo.srcObject) ||
        (callLocalVideo && callLocalVideo.srcObject);
      const statusStr = callStatusText ? callStatusText.textContent : '';
      if (!hasStream && (!statusStr || statusStr.includes('Заверш'))) {
        isCallMinimized = false;
        miniCallBar.classList.add('hidden');
        return;
      }
      if (miniCallText) {
        const peerLabel = callPeerName ? callPeerName.textContent : 'Собеседник';
        miniCallText.textContent = `📞 ${peerLabel} • ${statusStr || 'Идёт разговор'}`;
      }
    }, 800);
  }

  // 2. Живой индикатор голосовой активности собеседника (пульсирующее зелёное кольцо вокруг аватарки)
  let remoteVoiceAnalyser = null;
  let remoteVoiceSourceStream = null;
  let remoteVoiceDataArray = null;

  setInterval(() => {
    if (!callPeerAvatar) return;
    const stream =
      (callRemoteAudio && callRemoteAudio.srcObject) ||
      (callRemoteVideo && callRemoteVideo.srcObject) ||
      null;

    if (!stream || (callOverlay && callOverlay.classList.contains('hidden') && !isCallMinimized)) {
      callPeerAvatar.classList.remove('speaking');
      return;
    }

    if (stream !== remoteVoiceSourceStream) {
      try {
        const ctx = getAudioCtx();
        if (ctx && stream.getAudioTracks && stream.getAudioTracks().length > 0) {
          remoteVoiceSourceStream = stream;
          const src = ctx.createMediaStreamSource(stream);
          remoteVoiceAnalyser = ctx.createAnalyser();
          remoteVoiceAnalyser.fftSize = 128;
          src.connect(remoteVoiceAnalyser);
          remoteVoiceDataArray = new Uint8Array(remoteVoiceAnalyser.frequencyBinCount);
        }
      } catch (e) {}
    }

    if (remoteVoiceAnalyser && remoteVoiceDataArray) {
      try {
        remoteVoiceAnalyser.getByteFrequencyData(remoteVoiceDataArray);
        let sum = 0;
        for (let i = 0; i < 24; i++) sum += remoteVoiceDataArray[i];
        const avg = sum / 24;
        callPeerAvatar.classList.toggle('speaking', avg > 18);
      } catch (e) {}
    }
  }, 140);

  // 3. Вкладки-фильтры диалогов (Все / Непрочитанные / Личные / Группы)
  function applyChatListFilter() {
    if (!chatList) return;
    let totalUnreadRooms = 0;
    unreadCounts.forEach((cnt) => {
      if (cnt > 0) totalUnreadRooms += cnt;
    });
    if (filterUnreadCount) {
      filterUnreadCount.textContent = String(totalUnreadRooms);
      filterUnreadCount.classList.toggle('hidden', totalUnreadRooms === 0);
    }

    const q = searchInput ? searchInput.value.trim() : '';
    if (q) return;

    const items = Array.from(chatList.querySelectorAll('.chat-item'));
    items.forEach((item) => {
      const hasUnreadBadge = !!item.querySelector('.unread-badge');
      const titleEl = item.querySelector('.chat-item-title, .chat-item-name');
      const titleText = titleEl ? titleEl.textContent.trim() : '';
      const matchedRoom = myRooms.find((r) => {
        if (r.is_group && r.name === titleText) return true;
        return false;
      });
      const isGroupItem = !!matchedRoom || titleText.includes('Группа');

      let visible = true;
      if (activeSidebarCategory === 'unread') {
        visible = hasUnreadBadge;
      } else if (activeSidebarCategory === 'group') {
        visible = isGroupItem;
      } else if (activeSidebarCategory === 'dm') {
        visible = !isGroupItem;
      }
      item.style.display = visible ? '' : 'none';
    });
  }

  if (chatFilterTabs) {
    const tabBtns = Array.from(chatFilterTabs.querySelectorAll('[data-chat-filter]'));
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        triggerHaptic('light');
        activeSidebarCategory = btn.getAttribute('data-chat-filter') || 'all';
        tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
        applyChatListFilter();
      });
    });

    if (chatList && 'MutationObserver' in window) {
      const listObs = new MutationObserver(() => {
        applyChatListFilter();
      });
      listObs.observe(chatList, { childList: true });
    }
  }

  // 4. Свайп вправо от левого края экрана для быстрого возврата из чата к списку диалогов (iOS жест)
  if (activeChatView && mobileBackBtn) {
    let edgeStartX = 0;
    let edgeStartY = 0;
    let isEdgeSwiping = false;

    activeChatView.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX <= 34) {
        edgeStartX = t.clientX;
        edgeStartY = t.clientY;
        isEdgeSwiping = true;
      } else {
        isEdgeSwiping = false;
      }
    }, { passive: true });

    activeChatView.addEventListener('touchend', (e) => {
      if (!isEdgeSwiping || !e.changedTouches || e.changedTouches.length === 0) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - edgeStartX;
      const dy = Math.abs(t.clientY - edgeStartY);
      isEdgeSwiping = false;
      if (dx > 72 && dy < 55) {
        triggerHaptic('light');
        mobileBackBtn.click();
      }
    }, { passive: true });
  }

  // 5. Форматирование текста (**жирный**, *курсив*, `код`, ~~зачёркнутый~~), группировка пузырей и переход по цитате
  function enhanceRenderedMessages() {
    if (!messagesViewport) return;
    const rows = Array.from(messagesViewport.querySelectorAll('.msg-row'));
    let prevSenderClass = '';

    rows.forEach((row) => {
      const curClass = row.classList.contains('own') || row.classList.contains('mine') ? 'own' : 'other';
      const prevEl = row.previousElementSibling;
      const isConsecutiveSameSide =
        prevEl &&
        prevEl.classList.contains('msg-row') &&
        curClass === prevSenderClass;

      row.classList.toggle('grouped-prev', !!isConsecutiveSameSide);
      if (isConsecutiveSameSide && curClass === 'other') {
        const authorEl = row.querySelector('.msg-author');
        if (authorEl) authorEl.style.display = 'none';
      }
      prevSenderClass = curClass;

      // Клик по цитате ответа прокручивает чат к исходному сообщению
      const quoteEl = row.querySelector('.msg-reply-quote');
      if (quoteEl && !quoteEl.dataset.quoteBound) {
        quoteEl.dataset.quoteBound = '1';
        quoteEl.style.cursor = 'pointer';
        quoteEl.title = 'Нажмите, чтобы перейти к цитируемому сообщению';
        quoteEl.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic('light');
          const rawQuote = quoteEl.textContent.replace(/^↩\s*/, '').trim();
          const snippet = rawQuote.includes(':') ? rawQuote.split(':').slice(1).join(':').trim() : rawQuote;
          if (!snippet) return;
          const targetRow = rows.find((r) => r !== row && r.textContent.includes(snippet.slice(0, 24)));
          if (targetRow) {
            targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const targetBubble = targetRow.querySelector('.msg-bubble');
            if (targetBubble) {
              targetBubble.classList.add('highlight-flash');
              setTimeout(() => targetBubble.classList.remove('highlight-flash'), 1600);
            }
          }
        });
      }

      // Безопасное форматирование Markdown в текстовых узлах пузыря
      const bubble = row.querySelector('.msg-bubble');
      if (bubble && !bubble.dataset.mdFormatted) {
        bubble.dataset.mdFormatted = '1';
        Array.from(bubble.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue && /[*`~]/.test(node.nodeValue)) {
            const safe = node.nodeValue
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
            const formatted = safe
              .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em>$1</em>')
              .replace(/~~([^~]+)~~/g, '<del>$1</del>');
            if (formatted !== safe) {
              const span = document.createElement('span');
              span.innerHTML = formatted;
              bubble.replaceChild(span, node);
            }
          }
        });
      }
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    let isEnhancing = false;
    const msgObs = new MutationObserver(() => {
      if (isEnhancing) return;
      isEnhancing = true;
      enhanceRenderedMessages();
      isEnhancing = false;
    });
    msgObs.observe(messagesViewport, { childList: true });
  }

  // 6. Прокачанный полноэкранный просмотр фото (Lightbox с зумом 2x и кнопкой Скачать)
  if (lightbox && lightboxImg) {
    let isZoomed = false;
    lightboxImg.style.transition = 'transform 0.22s ease';

    const lbControls = document.createElement('div');
    lbControls.style.cssText =
      'position:fixed; bottom:calc(24px + env(safe-area-inset-bottom, 0px)); left:50%; transform:translateX(-50%); display:flex; gap:10px; z-index:220;';
    lbControls.innerHTML = `
      <button type="button" id="lbZoomBtn" class="vc-btn" style="background:rgba(17,23,38,0.85);">🔍 Увеличить</button>
      <a id="lbDownloadLink" class="vc-btn send" href="#" download="pulse-photo.jpg" target="_blank" rel="noopener" style="text-decoration:none;">⬇ Скачать</a>
    `;
    lightbox.appendChild(lbControls);

    const lbZoomBtn = lbControls.querySelector('#lbZoomBtn');
    const lbDownloadLink = lbControls.querySelector('#lbDownloadLink');

    if (lbZoomBtn) {
      lbZoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('light');
        isZoomed = !isZoomed;
        lightboxImg.style.transform = isZoomed ? 'scale(2)' : 'scale(1)';
        lbZoomBtn.textContent = isZoomed ? '🔍 Уменьшить' : '🔍 Увеличить';
      });
    }

    if (lbDownloadLink) {
      lbDownloadLink.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('light');
        lbDownloadLink.href = lightboxImg.src || '#';
      });
    }

    lightbox.addEventListener('click', () => {
      isZoomed = false;
      lightboxImg.style.transform = 'scale(1)';
      if (lbZoomBtn) lbZoomBtn.textContent = '🔍 Увеличить';
    });
  }

  // =========================================================================
  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v16:
  // 1) Выдвижная панель быстрых эмодзи и стикеров над полем ввода (😊)
  // 2) Голосовой набор текста на русском языке (🎙️ Диктовка через Web Speech API)
  // 3) Гигантские эмодзи-стикеры (Jumbo Emojis) для сообщений из 1-3 смайликов + копирование `кода` в 1 тап
  // 4) Двойной тап (или двойной клик) по сообщению для мгновенного лайка ❤️ с анимацией сердца
  // 5) Закрепление важных диалогов наверху списка чатов (правый клик по диалогу в списке)
  // 6) Живой индикатор состояния сети (Ожидание сети / На связи с автосинхронизацией)
  // =========================================================================
  const emojiToggleBtn = document.getElementById('emojiToggleBtn');
  const emojiDrawer = document.getElementById('emojiDrawer');
  const voiceDictateBtn = document.getElementById('voiceDictateBtn');
  const networkStatusBanner = document.getElementById('networkStatusBanner');

  // 1. Панель быстрых эмодзи и стикеров
  if (emojiToggleBtn && emojiDrawer && messageInput) {
    emojiToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('light');
      emojiDrawer.classList.toggle('hidden');
    });

    const quickEmojiBtns = Array.from(emojiDrawer.querySelectorAll('[data-insert-emoji]'));
    quickEmojiBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        triggerHaptic('light');
        const emoji = btn.getAttribute('data-insert-emoji') || '';
        const start = messageInput.selectionStart || messageInput.value.length;
        const end = messageInput.selectionEnd || messageInput.value.length;
        const val = messageInput.value;
        messageInput.value = val.slice(0, start) + emoji + val.slice(end);
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        messageInput.focus();
      });
    });
  }

  // 2. Голосовой набор текста (Speech-to-Text диктовка на русском языке)
  let speechRecognizer = null;
  let isDictating = false;

  if (voiceDictateBtn && messageInput) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      voiceDictateBtn.style.display = 'none';
    } else {
      voiceDictateBtn.addEventListener('click', () => {
        triggerHaptic('medium');
        if (isDictating && speechRecognizer) {
          try {
            speechRecognizer.stop();
          } catch (e) {}
          return;
        }
        try {
          speechRecognizer = new SpeechRec();
          speechRecognizer.lang = 'ru-RU';
          speechRecognizer.interimResults = false;
          speechRecognizer.maxAlternatives = 1;

          speechRecognizer.onstart = () => {
            isDictating = true;
            voiceDictateBtn.classList.add('listening');
            voiceDictateBtn.textContent = '🔴 Слушаю...';
          };

          speechRecognizer.onresult = (event) => {
            const transcript =
              event.results &&
              event.results[0] &&
              event.results[0][0]
                ? event.results[0][0].transcript
                : '';
            if (transcript) {
              const prefix = messageInput.value && !messageInput.value.endsWith(' ') ? ' ' : '';
              messageInput.value += prefix + transcript;
              messageInput.dispatchEvent(new Event('input', { bubbles: true }));
              messageInput.focus();
            }
          };

          speechRecognizer.onerror = () => {
            isDictating = false;
            voiceDictateBtn.classList.remove('listening');
            voiceDictateBtn.textContent = '🎙️ Диктовка';
          };

          speechRecognizer.onend = () => {
            isDictating = false;
            voiceDictateBtn.classList.remove('listening');
            voiceDictateBtn.textContent = '🎙️ Диктовка';
          };

          speechRecognizer.start();
        } catch (e) {
          isDictating = false;
          voiceDictateBtn.classList.remove('listening');
          voiceDictateBtn.textContent = '🎙️ Диктовка';
        }
      });
    }
  }

  // 3. Гигантские эмодзи (Jumbo Emojis), копирование inline-кода и 4. Двойной тап для лайка ❤️
  function isJumboEmojiOnly(str) {
    const clean = String(str || '').trim();
    if (!clean || clean.length > 14) return false;
    if (/[a-zA-Zа-яА-ЯёЁ0-9.,!?:;'"()[\]{}<>/\\|@#$%^&*_+=~`-]/.test(clean)) return false;
    return /\p{Extended_Pictographic}/u.test(clean);
  }

  function applyV16BubbleUpgrades() {
    if (!messagesViewport) return;
    const bubbles = Array.from(messagesViewport.querySelectorAll('.msg-bubble:not([data-v16-bound])'));

    bubbles.forEach((bubble) => {
      bubble.dataset.v16Bound = '1';

      const hasMedia = bubble.querySelector('img, video, .voice-player, .file-card, .call-log-card, .msg-reply-quote');
      if (!hasMedia) {
        const metaEl = bubble.querySelector('.msg-meta');
        const clone = bubble.cloneNode(true);
        const cloneMeta = clone.querySelector('.msg-meta');
        if (cloneMeta) cloneMeta.remove();
        const cloneReacts = clone.querySelectorAll('.reaction-chip-pill');
        cloneReacts.forEach((r) => r.remove());
        const pureText = clone.textContent.trim();

        if (isJumboEmojiOnly(pureText) && (!metaEl || pureText.length <= 12)) {
          bubble.classList.add('jumbo-emoji-bubble');
        }
      }

      // Копирование моноширинного `кода` в 1 клик
      const codeBlocks = Array.from(bubble.querySelectorAll('.inline-code'));
      codeBlocks.forEach((codeEl) => {
        codeEl.title = 'Нажмите, чтобы скопировать код';
        codeEl.addEventListener('click', (e) => {
          e.stopPropagation();
          triggerHaptic('light');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(codeEl.textContent || '').catch(() => {});
          }
          showInAppToast({
            title: 'Скопировано 📋',
            text: codeEl.textContent || '',
            peer: null,
            roomId: activeRoom ? activeRoom.id : null
          });
        });
      });

      // Двойной тап (или двойной клик) по пузырю сообщения для быстрого лайка ❤️
      let lastTapTs = 0;
      const triggerHeartLike = (e) => {
        e.stopPropagation();
        triggerHaptic('medium');

        const heart = document.createElement('div');
        heart.className = 'double-tap-heart';
        heart.textContent = '❤️';
        bubble.appendChild(heart);
        setTimeout(() => heart.remove(), 600);

        const existingPill = Array.from(bubble.querySelectorAll('.reaction-chip-pill')).find((el) =>
          el.textContent.includes('❤️')
        );
        if (existingPill) {
          existingPill.click();
        }
      };

      bubble.addEventListener('dblclick', triggerHeartLike);
      bubble.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTapTs < 280 && now - lastTapTs > 40) {
          triggerHeartLike(e);
          lastTapTs = 0;
        } else {
          lastTapTs = now;
        }
      }, { passive: true });
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    const v16MsgObs = new MutationObserver(() => {
      applyV16BubbleUpgrades();
    });
    v16MsgObs.observe(messagesViewport, { childList: true, subtree: false });
    applyV16BubbleUpgrades();
  }

  // 5. Закрепление важных диалогов наверху списка чатов (Правый клик по диалогу в сайдбаре)
  function getPinnedChatTitles() {
    try {
      return new Set(JSON.parse(localStorage.getItem('pulse_pinned_chats') || '[]'));
    } catch (e) {
      return new Set();
    }
  }

  function togglePinnedChatTitle(title) {
    if (!title) return;
    const set = getPinnedChatTitles();
    if (set.has(title)) set.delete(title);
    else set.add(title);
    localStorage.setItem('pulse_pinned_chats', JSON.stringify(Array.from(set)));
  }

  let isReorderingChats = false;
  function applyPinnedChatsInSidebar() {
    if (!chatList || isReorderingChats) return;
    isReorderingChats = true;
    try {
      const pinnedSet = getPinnedChatTitles();
      const items = Array.from(chatList.querySelectorAll('.chat-item'));

      items.forEach((item) => {
        const titleEl = item.querySelector('.chat-item-title, .chat-item-name');
        if (!titleEl) return;
        const cleanTitle = titleEl.textContent.replace(/^📌\s*/, '').trim();
        titleEl.dataset.cleanTitle = cleanTitle;

        const isPinned = pinnedSet.has(cleanTitle);
        if (isPinned && !titleEl.textContent.startsWith('📌')) {
          titleEl.textContent = `📌 ${cleanTitle}`;
        } else if (!isPinned && titleEl.textContent.startsWith('📌')) {
          titleEl.textContent = cleanTitle;
        }

        if (!item.dataset.pinBound) {
          item.dataset.pinBound = '1';
          item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            triggerHaptic('medium');
            togglePinnedChatTitle(cleanTitle);
            applyPinnedChatsInSidebar();
          });
        }
      });

      const pinnedItems = items.filter((item) => {
        const tEl = item.querySelector('.chat-item-title, .chat-item-name');
        const cTitle = tEl ? (tEl.dataset.cleanTitle || '') : '';
        return pinnedSet.has(cTitle);
      });

      pinnedItems.reverse().forEach((pItem) => {
        if (chatList.firstElementChild && chatList.firstElementChild !== pItem) {
          chatList.insertBefore(pItem, chatList.firstElementChild);
        }
      });
    } finally {
      isReorderingChats = false;
    }
  }

  if (chatList && 'MutationObserver' in window) {
    const pinChatObs = new MutationObserver(() => {
      applyPinnedChatsInSidebar();
    });
    pinChatObs.observe(chatList, { childList: true });
    applyPinnedChatsInSidebar();
  }

  // 6. Живой индикатор состояния интернет-соединения с автосинхронизацией
  if (networkStatusBanner) {
    window.addEventListener('offline', () => {
      networkStatusBanner.textContent = '⚠️ Ожидание сети... Проверьте подключение';
      networkStatusBanner.classList.remove('online-restored', 'hidden');
    });

    window.addEventListener('online', () => {
      networkStatusBanner.textContent = '✓ Соединение восстановлено';
      networkStatusBanner.classList.add('online-restored');
      networkStatusBanner.classList.remove('hidden');
      if (typeof preloadAllRoomsMessages === 'function') {
        preloadAllRoomsMessages().catch(() => {});
      }
      setTimeout(() => {
        networkStatusBanner.classList.add('hidden');
      }, 2400);
    });
  }

  // =========================================================================
  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v17:
  // 1) Кастомизация дизайна: 5 акцентных тем + 4 варианта обоев переписки
  // 2) Мгновенная вставка скриншотов и фото из буфера обмена (Cmd+V / Ctrl+V)
  // 3) Интерактивные опросы и голосования прямо в чатах (📊 Опрос)
  // 4) Кнопка «✓✓ Прочитать всё» в панели фильтров
  // 5) Плавная 60/120 FPS оптимизация через requestAnimationFrame
  // =========================================================================
  const accentBtns = Array.from(document.querySelectorAll('[data-set-accent]'));
  const wallpaperBtns = Array.from(document.querySelectorAll('[data-set-wallpaper]'));
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  const createPollBtn = document.getElementById('createPollBtn');
  const pollModal = document.getElementById('pollModal');
  const pollQuestionInput = document.getElementById('pollQuestionInput');
  const pollOpt1 = document.getElementById('pollOpt1');
  const pollOpt2 = document.getElementById('pollOpt2');
  const pollOpt3 = document.getElementById('pollOpt3');
  const pollOpt4 = document.getElementById('pollOpt4');
  const sendPollConfirmBtn = document.getElementById('sendPollConfirmBtn');
  const cancelPollModalBtn = document.getElementById('cancelPollModalBtn');

  // 1. Применение цветовых акцентов и обоев переписки
  function applySavedVisualAppearance() {
    const savedAccent = localStorage.getItem('pulse_accent') || 'indigo';
    const savedWallpaper = localStorage.getItem('pulse_wallpaper') || 'aurora';
    document.documentElement.setAttribute('data-accent', savedAccent);
    document.documentElement.setAttribute('data-wallpaper', savedWallpaper);
    if (document.body) {
      document.body.setAttribute('data-accent', savedAccent);
      document.body.setAttribute('data-wallpaper', savedWallpaper);
    }
    accentBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-set-accent') === savedAccent));
    wallpaperBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-set-wallpaper') === savedWallpaper));
  }

  accentBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      const acc = btn.getAttribute('data-set-accent') || 'indigo';
      localStorage.setItem('pulse_accent', acc);
      applySavedVisualAppearance();
    });
  });

  wallpaperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      const wp = btn.getAttribute('data-set-wallpaper') || 'aurora';
      localStorage.setItem('pulse_wallpaper', wp);
      applySavedVisualAppearance();
    });
  });

  applySavedVisualAppearance();

  // 2. Вставка скриншотов и изображений из буфера обмена (Cmd+V / Ctrl+V)
  window.addEventListener('paste', (e) => {
    if (!activeRoom || !e.clipboardData || !e.clipboardData.items) return;
    const items = Array.from(e.clipboardData.items);
    const imgItem = items.find((it) => it.type && it.type.startsWith('image/'));
    if (!imgItem) return;
    const blob = imgItem.getAsFile();
    if (!blob || !attachmentInput) return;
    e.preventDefault();
    triggerHaptic('medium');
    try {
      const dt = new DataTransfer();
      const file = new File([blob], `screenshot_${Date.now()}.png`, { type: blob.type || 'image/png' });
      dt.items.add(file);
      attachmentInput.files = dt.files;
      attachmentInput.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (err) {}
  });

  // 3. Создание и рендер интерактивных опросов (📊 Опрос)
  if (createPollBtn && pollModal) {
    createPollBtn.addEventListener('click', () => {
      triggerHaptic('light');
      if (emojiDrawer) emojiDrawer.classList.add('hidden');
      if (pollQuestionInput) pollQuestionInput.value = '';
      if (pollOpt1) pollOpt1.value = '';
      if (pollOpt2) pollOpt2.value = '';
      if (pollOpt3) pollOpt3.value = '';
      if (pollOpt4) pollOpt4.value = '';
      pollModal.classList.remove('hidden');
      setTimeout(() => { if (pollQuestionInput) pollQuestionInput.focus(); }, 60);
    });

    if (cancelPollModalBtn) {
      cancelPollModalBtn.addEventListener('click', () => pollModal.classList.add('hidden'));
    }

    if (sendPollConfirmBtn && messageInput && smartActionBtn) {
      sendPollConfirmBtn.addEventListener('click', () => {
        const q = (pollQuestionInput ? pollQuestionInput.value : '').trim();
        const opts = [pollOpt1, pollOpt2, pollOpt3, pollOpt4]
          .map((el) => (el ? el.value.trim() : ''))
          .filter(Boolean);
        if (!q || opts.length < 2) {
          alert('Введите вопрос и минимум 2 варианта ответа');
          return;
        }
        triggerHaptic('medium');
        pollModal.classList.add('hidden');
        const pollText = `📊 ОПРОС: ${q}\n` + opts.map((o, idx) => `[${idx + 1}] ${o}`).join('\n');
        messageInput.value = pollText;
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        smartActionBtn.click();
      });
    }
  }

  function renderInteractivePollsInChat() {
    if (!messagesViewport) return;
    Array.from(messagesViewport.querySelectorAll('.msg-bubble:not([data-poll-rendered])')).forEach((bubble) => {
      const rawText = bubble.textContent || '';
      if (!rawText.includes('📊 ОПРОС:')) return;
      bubble.dataset.pollRendered = '1';

      const metaEl = bubble.querySelector('.msg-meta');
      const clone = bubble.cloneNode(true);
      const cMeta = clone.querySelector('.msg-meta');
      if (cMeta) cMeta.remove();
      clone.querySelectorAll('.reaction-chip-pill').forEach((r) => r.remove());

      const lines = clone.textContent.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      const headerLine = lines.find((l) => l.startsWith('📊 ОПРОС:'));
      if (!headerLine) return;
      const question = headerLine.replace('📊 ОПРОС:', '').trim();
      const optLines = lines
        .filter((l) => /^\[\d+\]\s+/.test(l))
        .map((l) => l.replace(/^\[\d+\]\s+/, '').trim());
      if (optLines.length < 2) return;

      const pollKey = `pulse_poll_vote_${question.slice(0, 32)}`;
      const card = document.createElement('div');
      card.className = 'poll-card';

      const updatePollUI = () => {
        const myVoteIdx = localStorage.getItem(pollKey);
        const hasVoted = myVoteIdx !== null;
        card.innerHTML = `
          <div class="poll-badge">📊 Голосование в чате</div>
          <div class="poll-question"></div>
          <div class="poll-options-list"></div>
          <div class="poll-footer-meta">${hasVoted ? 'Вы проголосовали • Нажмите для смены' : 'Нажмите на вариант, чтобы проголосовать'}</div>
        `;
        card.querySelector('.poll-question').textContent = question;
        const listEl = card.querySelector('.poll-options-list');

        optLines.forEach((optText, idx) => {
          const isSelected = String(idx) === myVoteIdx;
          const pct = hasVoted ? (isSelected ? 100 : 0) : 0;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'poll-option-btn' + (isSelected ? ' voted' : '');
          btn.innerHTML = `
            <div class="poll-option-bar" style="width:${pct}%;"></div>
            <div class="poll-option-row">
              <span class="poll-opt-label"></span>
              <span class="poll-option-pct">${hasVoted ? pct + '%' : ''}</span>
            </div>
          `;
          btn.querySelector('.poll-opt-label').textContent = (isSelected ? '✓ ' : '') + optText;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic('light');
            localStorage.setItem(pollKey, String(idx));
            updatePollUI();
          });
          listEl.appendChild(btn);
        });
      };

      updatePollUI();
      bubble.innerHTML = '';
      bubble.appendChild(card);
      if (metaEl) bubble.appendChild(metaEl);
    });
  }

  // 4. Кнопка «✓✓ Прочитать всё» для быстрого сброса всех счётчиков непрочитанных
  function syncMarkAllReadVisibility() {
    if (!markAllReadBtn) return;
    let total = 0;
    unreadCounts.forEach((cnt) => { total += cnt; });
    markAllReadBtn.classList.toggle('hidden', total === 0);
  }

  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerHaptic('medium');
      const now = Date.now();
      myRooms.forEach((r) => setLastReadTimestamp(r.id, now));
      unreadCounts.clear();
      updateAppIconBadge();
      if (chatList) {
        Array.from(chatList.querySelectorAll('.unread-badge')).forEach((b) => b.remove());
      }
      syncMarkAllReadVisibility();
      if (filterUnreadCount) filterUnreadCount.classList.add('hidden');
    });
  }

  // 5. Единый RAF-планировщик (60/120 FPS без лишних перерисовок)
  let rafMsgPending = false;
  if (messagesViewport && 'MutationObserver' in window) {
    const v17MsgObs = new MutationObserver(() => {
      if (rafMsgPending) return;
      rafMsgPending = true;
      requestAnimationFrame(() => {
        rafMsgPending = false;
        renderInteractivePollsInChat();
      });
    });
    v17MsgObs.observe(messagesViewport, { childList: true });
    renderInteractivePollsInChat();
  }

  if (chatList && 'MutationObserver' in window) {
    const v17ListObs = new MutationObserver(() => syncMarkAllReadVisibility());
    v17ListObs.observe(chatList, { childList: true });
    syncMarkAllReadVisibility();
  }

  // =========================================================================
  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v18:
  // 1) Регулятор размера шрифта сообщений в Настройках (Компактный / Обычный / Крупный)
  // 2) Скрытый текст-спойлер ||спойлер|| с размытием и раскрытием по нажатию (👁️ Спойлер)
  // 3) Интерактивные списки задач в чатах и Избранном (☑️ Список)
  // 4) Отправка геолокации в 1 клик с карточкой карты (📍 Гео)
  // 5) Экспорт истории переписки в текстовый файл (.txt) в окне информации о чате
  // =========================================================================
  const fontSizeBtns = Array.from(document.querySelectorAll('[data-set-fontsize]'));
  const insertSpoilerBtn = document.getElementById('insertSpoilerBtn');
  const createChecklistBtn = document.getElementById('createChecklistBtn');
  const sendLocationBtn = document.getElementById('sendLocationBtn');
  const checklistModal = document.getElementById('checklistModal');
  const checklistTitleInput = document.getElementById('checklistTitleInput');
  const chkItem1 = document.getElementById('chkItem1');
  const chkItem2 = document.getElementById('chkItem2');
  const chkItem3 = document.getElementById('chkItem3');
  const chkItem4 = document.getElementById('chkItem4');
  const sendChecklistConfirmBtn = document.getElementById('sendChecklistConfirmBtn');
  const cancelChecklistModalBtn = document.getElementById('cancelChecklistModalBtn');
  const exportChatHistoryBtn = document.getElementById('exportChatHistoryBtn');

  // 1. Размер шрифта сообщений
  function applySavedFontSize() {
    const savedSize = localStorage.getItem('pulse_font_size') || '15px';
    document.documentElement.style.setProperty('--msg-font-size', savedSize);
    fontSizeBtns.forEach((b) =>
      b.classList.toggle('active', b.getAttribute('data-set-fontsize') === savedSize)
    );
  }

  fontSizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      const sz = btn.getAttribute('data-set-fontsize') || '15px';
      localStorage.setItem('pulse_font_size', sz);
      applySavedFontSize();
    });
  });
  applySavedFontSize();

  // 2. Вставка спойлера ||текст||
  if (insertSpoilerBtn && messageInput) {
    insertSpoilerBtn.addEventListener('click', () => {
      triggerHaptic('light');
      const start = messageInput.selectionStart || 0;
      const end = messageInput.selectionEnd || 0;
      const val = messageInput.value;
      if (end > start) {
        const selected = val.slice(start, end);
        messageInput.value = val.slice(0, start) + `||${selected}||` + val.slice(end);
      } else {
        messageInput.value = val + (val && !val.endsWith(' ') ? ' ' : '') + '||секрет||';
      }
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      messageInput.focus();
    });
  }

  // 3. Модальное окно создания интерактивного чек-листа
  if (createChecklistBtn && checklistModal) {
    createChecklistBtn.addEventListener('click', () => {
      triggerHaptic('light');
      if (emojiDrawer) emojiDrawer.classList.add('hidden');
      if (checklistTitleInput) checklistTitleInput.value = '';
      [chkItem1, chkItem2, chkItem3, chkItem4].forEach((el) => { if (el) el.value = ''; });
      checklistModal.classList.remove('hidden');
      setTimeout(() => { if (checklistTitleInput) checklistTitleInput.focus(); }, 60);
    });

    if (cancelChecklistModalBtn) {
      cancelChecklistModalBtn.addEventListener('click', () => checklistModal.classList.add('hidden'));
    }

    if (sendChecklistConfirmBtn && messageInput && smartActionBtn) {
      sendChecklistConfirmBtn.addEventListener('click', () => {
        const title = (checklistTitleInput ? checklistTitleInput.value : '').trim() || 'Список задач';
        const tasks = [chkItem1, chkItem2, chkItem3, chkItem4]
          .map((el) => (el ? el.value.trim() : ''))
          .filter(Boolean);
        if (tasks.length === 0) {
          alert('Добавьте хотя бы одну задачу в список');
          return;
        }
        triggerHaptic('medium');
        checklistModal.classList.add('hidden');
        messageInput.value = `☑️ ЧЕК-ЛИСТ: ${title}\n` + tasks.map((t, i) => `[${i + 1}] ${t}`).join('\n');
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        smartActionBtn.click();
      });
    }
  }

  // 4. Отправка текущей геолокации в 1 клик (📍 Гео)
  if (sendLocationBtn && messageInput && smartActionBtn) {
    sendLocationBtn.addEventListener('click', () => {
      triggerHaptic('medium');
      if (!navigator.geolocation) {
        alert('Геолокация не поддерживается на этом устройстве');
        return;
      }
      sendLocationBtn.textContent = '📍 Поиск...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendLocationBtn.textContent = '📍 Гео';
          if (emojiDrawer) emojiDrawer.classList.add('hidden');
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          messageInput.value = `📍 ГЕОЛОКАЦИЯ: ${lat},${lng}`;
          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
          smartActionBtn.click();
        },
        () => {
          sendLocationBtn.textContent = '📍 Гео';
          alert('Разрешите доступ к геолокации в настройках браузера');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  // 5. Экспорт истории чата в файл .txt
  if (exportChatHistoryBtn) {
    exportChatHistoryBtn.addEventListener('click', () => {
      triggerHaptic('medium');
      if (!messagesViewport || !activeRoom) return;
      const roomTitle = activeRoomTitle ? activeRoomTitle.textContent.trim() : 'chat';
      const rows = Array.from(messagesViewport.querySelectorAll('.msg-row'));
      const lines = [`=== История переписки Pulse: ${roomTitle} ===`, `Экспортировано: ${new Date().toLocaleString('ru-RU')}`, ''];
      rows.forEach((r) => {
        const isMine = r.classList.contains('own') || r.classList.contains('mine');
        const authorEl = r.querySelector('.msg-author');
        const sender = isMine ? 'Вы' : (authorEl ? authorEl.textContent.trim() : roomTitle);
        const bubble = r.querySelector('.msg-bubble');
        if (!bubble) return;
        const text = bubble.textContent.replace(/\s+/g, ' ').trim();
        lines.push(`[${sender}]: ${text}`);
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pulse_${roomTitle.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }

  // Отрисовка спойлеров ||...||, интерактивных чек-листов и карточек геолокации в ленте
  function renderV18RichMessages() {
    if (!messagesViewport) return;
    Array.from(messagesViewport.querySelectorAll('.msg-bubble:not([data-v18-processed])')).forEach((bubble) => {
      const raw = bubble.textContent || '';

      // А) Интерактивный чек-лист
      if (raw.includes('☑️ ЧЕК-ЛИСТ:')) {
        bubble.dataset.v18Processed = '1';
        const metaEl = bubble.querySelector('.msg-meta');
        const clone = bubble.cloneNode(true);
        const cMeta = clone.querySelector('.msg-meta');
        if (cMeta) cMeta.remove();
        clone.querySelectorAll('.reaction-chip-pill').forEach((r) => r.remove());

        const lines = clone.textContent.trim().split('\n').map((l) => l.trim()).filter(Boolean);
        const hdr = lines.find((l) => l.startsWith('☑️ ЧЕК-ЛИСТ:'));
        if (hdr) {
          const title = hdr.replace('☑️ ЧЕК-ЛИСТ:', '').trim();
          const tasks = lines
            .filter((l) => /^\[\d+\]\s+/.test(l))
            .map((l) => l.replace(/^\[\d+\]\s+/, '').trim());
          if (tasks.length > 0) {
            const stateKey = `pulse_chk_${title.slice(0, 28)}_${tasks.length}`;
            const card = document.createElement('div');
            card.className = 'checklist-card';

            const renderTasks = () => {
              let doneSet = new Set();
              try { doneSet = new Set(JSON.parse(localStorage.getItem(stateKey) || '[]')); } catch (e) {}
              card.innerHTML = `
                <div class="checklist-badge">☑️ Список задач (${doneSet.size}/${tasks.length})</div>
                <div class="checklist-title"></div>
                <div class="checklist-items-wrap"></div>
              `;
              card.querySelector('.checklist-title').textContent = title;
              const wrap = card.querySelector('.checklist-items-wrap');
              tasks.forEach((tText, idx) => {
                const isDone = doneSet.has(idx);
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'checklist-item-btn' + (isDone ? ' done' : '');
                btn.textContent = `${isDone ? '☑️' : '⬜'} ${tText}`;
                btn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  if (doneSet.has(idx)) doneSet.delete(idx); else doneSet.add(idx);
                  localStorage.setItem(stateKey, JSON.stringify(Array.from(doneSet)));
                  renderTasks();
                });
                wrap.appendChild(btn);
              });
            };

            renderTasks();
            bubble.innerHTML = '';
            bubble.appendChild(card);
            if (metaEl) bubble.appendChild(metaEl);
            return;
          }
        }
      }

      // Б) Карточка геолокации
      if (raw.includes('📍 ГЕОЛОКАЦИЯ:')) {
        bubble.dataset.v18Processed = '1';
        const match = raw.match(/📍 ГЕОЛОКАЦИЯ:\s*([-0-9.]+),([-0-9.]+)/);
        if (match) {
          const lat = match[1];
          const lng = match[2];
          const metaEl = bubble.querySelector('.msg-meta');
          const locLink = document.createElement('a');
          locLink.className = 'location-card';
          locLink.href = `https://www.google.com/maps?q=${lat},${lng}`;
          locLink.target = '_blank';
          locLink.rel = 'noopener noreferrer';
          locLink.innerHTML = `
            <div class="location-pin-icon">📍</div>
            <div style="min-width:0; flex:1;">
              <div style="font-weight:700; font-size:14px;">Точка на карте</div>
              <div style="font-size:11.5px; opacity:0.85;">${lat}, ${lng} • Открыть карту ↗</div>
            </div>
          `;
          locLink.addEventListener('click', (e) => e.stopPropagation());
          bubble.innerHTML = '';
          bubble.appendChild(locLink);
          if (metaEl) bubble.appendChild(metaEl);
          return;
        }
      }

      // В) Текст-спойлер ||скрытый текст||
      if (raw.includes('||')) {
        bubble.dataset.v18Processed = '1';
        Array.from(bubble.childNodes).forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.includes('||')) {
            const parts = node.nodeValue.split(/\|\|([^|]+)\|\|/g);
            if (parts.length > 1) {
              const frag = document.createDocumentFragment();
              parts.forEach((part, idx) => {
                if (idx % 2 === 1) {
                  const sp = document.createElement('span');
                  sp.className = 'msg-spoiler';
                  sp.title = 'Нажмите, чтобы показать скрытый текст';
                  sp.textContent = part;
                  sp.addEventListener('click', (e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    sp.classList.toggle('revealed');
                  });
                  frag.appendChild(sp);
                } else if (part) {
                  frag.appendChild(document.createTextNode(part));
                }
              });
              bubble.replaceChild(frag, node);
            }
          }
        });
      }
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    let v18Raf = false;
    const v18Obs = new MutationObserver(() => {
      if (v18Raf) return;
      v18Raf = true;
      requestAnimationFrame(() => {
        v18Raf = false;
        renderV18RichMessages();
      });
    });
    v18Obs.observe(messagesViewport, { childList: true });
    renderV18RichMessages();
  }

  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v19 (Часть 1: Отложенные сообщения, Озвучивание и Перевод)
  const scheduleMsgBtn = document.getElementById('scheduleMsgBtn');
  const scheduleModal = document.getElementById('scheduleModal');
  const scheduleTextInput = document.getElementById('scheduleTextInput');
  const schedMinBtns = Array.from(document.querySelectorAll('[data-sched-mins]'));
  const scheduledPendingList = document.getElementById('scheduledPendingList');
  const confirmScheduleBtn = document.getElementById('confirmScheduleBtn');
  const cancelScheduleModalBtn = document.getElementById('cancelScheduleModalBtn');
  const sheetSpeakBtn = document.getElementById('sheetSpeakBtn');
  const sheetTranslateBtn = document.getElementById('sheetTranslateBtn');
  const forceRefreshCacheBtn = document.getElementById('forceRefreshCacheBtn');
  const pingStatusText = document.getElementById('pingStatusText');

  let selectedScheduleMins = 1;

  function getScheduledQueue() {
    try { return JSON.parse(localStorage.getItem('pulse_scheduled_queue') || '[]'); }
    catch (e) { return []; }
  }

  function saveScheduledQueue(list) {
    localStorage.setItem('pulse_scheduled_queue', JSON.stringify(list || []));
  }

  function renderScheduledPendingList() {
    if (!scheduledPendingList) return;
    const list = getScheduledQueue();
    if (!list.length) {
      scheduledPendingList.innerHTML = 'Нет запланированных сообщений';
      return;
    }
    scheduledPendingList.innerHTML = '';
    list.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'scheduled-item-pill';
      const timeStr = new Date(item.sendAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const span = document.createElement('span');
      span.style.cssText = 'overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';
      span.textContent = `⏰ ${timeStr} — ${item.text}`;
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'toast-close';
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        saveScheduledQueue(getScheduledQueue().filter((x) => x.id !== item.id));
        renderScheduledPendingList();
      });
      row.appendChild(span);
      row.appendChild(delBtn);
      scheduledPendingList.appendChild(row);
    });
  }

  schedMinBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      selectedScheduleMins = Number(btn.getAttribute('data-sched-mins') || 1);
      schedMinBtns.forEach((b) => b.classList.toggle('active', b === btn));
    });
  });

  if (scheduleMsgBtn && scheduleModal) {
    scheduleMsgBtn.addEventListener('click', () => {
      triggerHaptic('light');
      if (emojiDrawer) emojiDrawer.classList.add('hidden');
      if (scheduleTextInput && messageInput) {
        scheduleTextInput.value = messageInput.value.trim();
      }
      renderScheduledPendingList();
      scheduleModal.classList.remove('hidden');
    });

    if (cancelScheduleModalBtn) {
      cancelScheduleModalBtn.addEventListener('click', () => scheduleModal.classList.add('hidden'));
    }

    if (confirmScheduleBtn) {
      confirmScheduleBtn.addEventListener('click', () => {
        if (!activeRoom) return;
        const txt = (scheduleTextInput ? scheduleTextInput.value : '').trim();
        if (!txt) return alert('Введите текст сообщения');
        triggerHaptic('medium');
        const list = getScheduledQueue();
        list.push({
          id: `sched_${Date.now()}`,
          roomId: activeRoom.id,
          text: txt,
          sendAt: Date.now() + selectedScheduleMins * 60 * 1000
        });
        saveScheduledQueue(list);
        if (messageInput && messageInput.value.trim() === txt) {
          messageInput.value = '';
          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        scheduleModal.classList.add('hidden');
        showInAppToast({
          title: 'Отложенное сообщение ⏰',
          text: `Будет отправлено через ${selectedScheduleMins} мин.`,
          peer: null,
          roomId: activeRoom.id
        });
      });
    }
  }

  // Фоновый таймер отправки запланированных сообщений
  setInterval(async () => {
    if (!currentUser || !supabaseClient) return;
    const list = getScheduledQueue();
    if (!list.length) return;
    const now = Date.now();
    const due = list.filter((x) => x.sendAt <= now);
    if (!due.length) return;
    saveScheduledQueue(list.filter((x) => x.sendAt > now));

    for (const item of due) {
      try {
        const room = myRooms.find((r) => r.id === item.roomId) || activeRoom;
        if (!room) continue;
        const enc = await encryptTextForRoom(`⏰ ${item.text}`, room);
        await insertMessageRow({
          room_id: room.id,
          content: enc,
          media_type: 'text'
        });
        showInAppToast({
          title: 'Отправлено по таймеру ⏰',
          text: item.text,
          peer: null,
          roomId: room.id
        });
      } catch (e) {}
    }
  }, 4500);

  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v19 (Часть 2: Озвучка, Перевод RU/EN, Drag & Drop файлов, Кэш и Пинг)
  if (sheetSpeakBtn) {
    sheetSpeakBtn.addEventListener('click', () => {
      triggerHaptic('light');
      if (msgActionModal) msgActionModal.classList.add('hidden');
      const txt = selectedMsgContext && selectedMsgContext.cleanText ? selectedMsgContext.cleanText.trim() : '';
      if (!txt || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(txt);
        utt.lang = /[а-яА-ЯёЁ]/.test(txt) ? 'ru-RU' : 'en-US';
        utt.rate = 1.04;
        window.speechSynthesis.speak(utt);
      } catch (e) {}
    });
  }

  if (sheetTranslateBtn) {
    sheetTranslateBtn.addEventListener('click', async () => {
      triggerHaptic('light');
      if (msgActionModal) msgActionModal.classList.add('hidden');
      const txt = selectedMsgContext && selectedMsgContext.cleanText ? selectedMsgContext.cleanText.trim() : '';
      const msgId = selectedMsgContext && selectedMsgContext.msg ? selectedMsgContext.msg.id : null;
      if (!txt) return;
      const isRussian = /[а-яА-ЯёЁ]/.test(txt);
      const langPair = isRussian ? 'ru|en' : 'en|ru';
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(txt.slice(0, 450))}&langpair=${langPair}`
        );
        const json = await res.json();
        const translated =
          json && json.responseData && json.responseData.translatedText
            ? json.responseData.translatedText
            : '';
        if (!translated) return;

        if (messagesViewport && msgId) {
          const row = messagesViewport.querySelector(`[data-msg-id="${msgId}"]`);
          const bubble = row ? row.querySelector('.msg-bubble') : null;
          if (bubble) {
            const oldBox = bubble.querySelector('.msg-translation-box');
            if (oldBox) oldBox.remove();
            const box = document.createElement('div');
            box.className = 'msg-translation-box';
            box.innerHTML = `<div class="msg-translation-label">🌐 Перевод (${isRussian ? 'EN' : 'RU'})</div><div></div>`;
            box.lastElementChild.textContent = translated;
            bubble.appendChild(box);
            return;
          }
        }
        showInAppToast({
          title: `Перевод 🌐 (${isRussian ? 'EN' : 'RU'})`,
          text: translated,
          peer: null,
          roomId: activeRoom ? activeRoom.id : null
        });
      } catch (e) {}
    });
  }

  // Перетаскивание файлов и фотографий мышью прямо в окно чата (Drag & Drop)
  if (activeChatView && attachmentInput) {
    activeChatView.addEventListener('dragover', (e) => {
      e.preventDefault();
      activeChatView.classList.add('drag-over-chat');
    });
    activeChatView.addEventListener('dragleave', (e) => {
      if (e.target === activeChatView) activeChatView.classList.remove('drag-over-chat');
    });
    activeChatView.addEventListener('drop', (e) => {
      e.preventDefault();
      activeChatView.classList.remove('drag-over-chat');
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      triggerHaptic('medium');
      try {
        const dt = new DataTransfer();
        dt.items.add(e.dataTransfer.files[0]);
        attachmentInput.files = dt.files;
        attachmentInput.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (err) {}
    });
  }

  // Быстрое обновление кэша и проверка пинга в Настройках
  if (forceRefreshCacheBtn) {
    forceRefreshCacheBtn.addEventListener('click', async () => {
      triggerHaptic('medium');
      forceRefreshCacheBtn.textContent = 'Обновляем...';
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.update()));
        }
      } catch (e) {}
      window.location.reload();
    });
  }

  if (myProfileTrigger && pingStatusText) {
    myProfileTrigger.addEventListener('click', async () => {
      if (!supabaseClient) return;
      const t0 = performance.now();
      try {
        await supabaseClient.from('rooms').select('id').limit(1);
        const ms = Math.max(12, Math.round(performance.now() - t0));
        pingStatusText.textContent = `⚡ Пинг: ${ms} мс • AES-256 активен`;
      } catch (e) {}
    });
  }

  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v20 (Часть 1: PIN-блокировка, Сохранение в Избранное в 1 клик, Автообновление)
  const setupPinLockBtn = document.getElementById('setupPinLockBtn');
  const pinStatusSubtext = document.getElementById('pinStatusSubtext');
  const pinLockOverlay = document.getElementById('pinLockOverlay');
  const pinLockTitle = document.getElementById('pinLockTitle');
  const pinLockSub = document.getElementById('pinLockSub');
  const pinDots = Array.from(document.querySelectorAll('#pinDotsRow .pin-dot'));
  const pinKeys = Array.from(document.querySelectorAll('[data-pin-key]'));
  const pinCancelSetupBtn = document.getElementById('pinCancelSetupBtn');
  const sheetSaveToFavBtn = document.getElementById('sheetSaveToFavBtn');
  const selfDestructToggleBtn = document.getElementById('selfDestructToggleBtn');

  let enteredPin = '';
  let pinMode = 'unlock'; // 'unlock' | 'setup'

  function getSavedPin() {
    return localStorage.getItem('pulse_app_pin') || '';
  }

  function updatePinSettingsUI() {
    const hasPin = !!getSavedPin();
    if (setupPinLockBtn) {
      setupPinLockBtn.textContent = hasPin ? 'Отключить PIN' : 'Установить';
    }
    if (pinStatusSubtext) {
      pinStatusSubtext.textContent = hasPin
        ? '🔐 Защита активна • Запрашивается при входе'
        : 'Защита мессенджера 4-значным кодом';
    }
  }

  function renderPinDots() {
    pinDots.forEach((d, idx) => d.classList.toggle('filled', idx < enteredPin.length));
  }

  function openPinOverlay(mode) {
    if (!pinLockOverlay) return;
    pinMode = mode;
    enteredPin = '';
    renderPinDots();
    if (pinLockTitle) {
      pinLockTitle.textContent = mode === 'setup' ? 'Придумайте 4 цифры PIN' : 'Введите код-пароль';
    }
    if (pinLockSub) {
      pinLockSub.textContent =
        mode === 'setup' ? 'Этот код защитит вход в приложение' : 'Для доступа к вашим чатам Pulse';
    }
    if (pinCancelSetupBtn) {
      pinCancelSetupBtn.style.visibility = mode === 'setup' ? 'visible' : 'hidden';
    }
    pinLockOverlay.classList.remove('hidden');
  }

  if (setupPinLockBtn) {
    setupPinLockBtn.addEventListener('click', () => {
      triggerHaptic('light');
      if (getSavedPin()) {
        localStorage.removeItem('pulse_app_pin');
        updatePinSettingsUI();
        showInAppToast({ title: 'PIN-защита отключена 🔓', text: 'Вход без кода-пароля', peer: null, roomId: null });
      } else {
        openPinOverlay('setup');
      }
    });
  }

  if (pinCancelSetupBtn) {
    pinCancelSetupBtn.addEventListener('click', () => {
      if (pinMode === 'setup' && pinLockOverlay) pinLockOverlay.classList.add('hidden');
    });
  }

  pinKeys.forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      const k = btn.getAttribute('data-pin-key');
      if (k === 'back') {
        enteredPin = enteredPin.slice(0, -1);
        renderPinDots();
        return;
      }
      if (enteredPin.length < 4) {
        enteredPin += k;
        renderPinDots();
      }
      if (enteredPin.length === 4) {
        setTimeout(() => {
          if (pinMode === 'setup') {
            localStorage.setItem('pulse_app_pin', enteredPin);
            updatePinSettingsUI();
            if (pinLockOverlay) pinLockOverlay.classList.add('hidden');
            showInAppToast({ title: 'Код-пароль установлен 🔐', text: 'Приложение защищено PIN-кодом', peer: null, roomId: null });
          } else {
            if (enteredPin === getSavedPin()) {
              triggerHaptic('medium');
              if (pinLockOverlay) pinLockOverlay.classList.add('hidden');
            } else {
              triggerHaptic('heavy');
              enteredPin = '';
              renderPinDots();
              if (pinLockSub) pinLockSub.textContent = '❌ Неверный код, попробуйте ещё раз';
            }
          }
        }, 120);
      }
    });
  });

  updatePinSettingsUI();
  if (getSavedPin()) {
    openPinOverlay('unlock');
  }

  // Быстрое сохранение любого сообщения в «Избранное» в 1 касание (⭐)
  if (sheetSaveToFavBtn) {
    sheetSaveToFavBtn.addEventListener('click', async () => {
      triggerHaptic('medium');
      if (msgActionModal) msgActionModal.classList.add('hidden');
      if (!selectedMsgContext || !selectedMsgContext.msg || !currentUser) return;
      const favRoom = myRooms.find(
        (r) => r.name === 'Избранное' || r.saved_for === currentUser.id
      );
      if (!favRoom) return;
      const orig = selectedMsgContext.msg;
      const cleanTxt = selectedMsgContext.cleanText || '';
      const enc = cleanTxt ? await encryptTextForRoom(`⭐ ${cleanTxt}`, favRoom) : '';
      await insertMessageRow({
        room_id: favRoom.id,
        content: enc,
        media_type: orig.media_type || 'text',
        media_url: orig.media_url || null,
        media_duration: orig.media_duration || 0
      });
      showInAppToast({
        title: 'Сохранено в Избранное ⭐',
        text: cleanTxt || 'Вложение добавлено в Избранное',
        peer: null,
        roomId: favRoom.id
      });
    });
  }

  // МОДУЛЬ ОБНОВЛЕНИЯ PULSE v20 (Часть 2: Секретные исчезающие сообщения 🔥 30с, YouTube-превью и автообновление)
  if (selfDestructToggleBtn && messageInput) {
    selfDestructToggleBtn.addEventListener('click', () => {
      triggerHaptic('light');
      const v = messageInput.value;
      if (v.startsWith('🔥30s:')) {
        messageInput.value = v.replace(/^🔥30s:\s*/, '');
        selfDestructToggleBtn.classList.remove('burn-active');
      } else {
        messageInput.value = `🔥30s: ${v}`;
        selfDestructToggleBtn.classList.add('burn-active');
      }
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      messageInput.focus();
    });
  }

  function processV20Messages() {
    if (!messagesViewport) return;
    Array.from(messagesViewport.querySelectorAll('.msg-row')).forEach((row) => {
      const bubble = row.querySelector('.msg-bubble');
      if (!bubble || bubble.dataset.v20Processed) return;
      bubble.dataset.v20Processed = '1';
      const raw = bubble.textContent || '';

      // 1) Самоуничтожающееся сообщение 🔥30s:
      if (raw.includes('🔥30s:')) {
        const msgId = row.getAttribute('data-msg-id');
        Array.from(bubble.childNodes).forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE && n.nodeValue && n.nodeValue.includes('🔥30s:')) {
            n.nodeValue = n.nodeValue.replace('🔥30s:', '').trimStart();
          }
        });
        const badge = document.createElement('div');
        badge.className = 'self-destruct-badge';
        let secLeft = 30;
        badge.textContent = `🔥 Исчезнет через ${secLeft}с`;
        bubble.insertBefore(badge, bubble.firstChild);

        const timer = setInterval(async () => {
          secLeft -= 1;
          if (secLeft > 0) {
            badge.textContent = `🔥 Исчезнет через ${secLeft}с`;
          } else {
            clearInterval(timer);
            row.style.opacity = '0';
            setTimeout(() => row.remove(), 250);
            if (msgId) {
              hideMsgLocally(msgId);
              if (supabaseClient) {
                try { await supabaseClient.from('messages').delete().eq('id', msgId); } catch (e) {}
              }
            }
          }
        }, 1000);
      }

      // 2) Автоматическое превью YouTube-роликов прямо в сообщении
      const ytMatch = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch && !bubble.querySelector('.yt-preview-card')) {
        const vidId = ytMatch[1];
        const card = document.createElement('a');
        card.className = 'yt-preview-card';
        card.href = `https://www.youtube.com/watch?v=${vidId}`;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.innerHTML = `
          <img src="https://img.youtube.com/vi/${vidId}/hqdefault.jpg" alt="YouTube Video" loading="lazy" />
          <div class="yt-preview-title">▶️ Смотреть видео на YouTube ↗</div>
        `;
        card.addEventListener('click', (e) => e.stopPropagation());
        const metaEl = bubble.querySelector('.msg-meta');
        if (metaEl) bubble.insertBefore(card, metaEl);
        else bubble.appendChild(card);
      }
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    let v20Raf = false;
    const v20Obs = new MutationObserver(() => {
      if (v20Raf) return;
      v20Raf = true;
      requestAnimationFrame(() => {
        v20Raf = false;
        processV20Messages();
      });
    });
    v20Obs.observe(messagesViewport, { childList: true });
    processV20Messages();
  }

  // Бесшовное фоновое автообновление PWA (как в Telegram, без ручных кнопок кэша)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=42').then((reg) => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            reg.update().catch(() => {});
          }
        });
      }).catch(() => {});
    });
  }

  if (initSupabase()) {
    bootSession();
  }
})();
