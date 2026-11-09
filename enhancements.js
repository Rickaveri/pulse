// Pulse Messenger v22 Enhancements Module
// 1) Калькулятор выражений в поле ввода (🧮)
// 2) Поворот фото на 90° и улучшение цвета перед отправкой
// 3) Режим «Не беспокоить» (🌙)
// 4) Быстрые мини-игры и слэш-команды (🎲 Кубик, 🪙 Монетка, 🤷 Shrug)
// 5) Режим «Анти-шпион» (🕶️ Размытие чата от посторонних глаз)
// 6) Персональная QR-визитка профиля для быстрого приглашения друзей
(function () {
  const messageInput = document.getElementById('messageInput');
  const smartActionBtn = document.getElementById('smartActionBtn');
  const calcHelperPill = document.getElementById('calcHelperPill');
  const dndToggleBtn = document.getElementById('dndToggleBtn');
  const rotatePhotoBtn = document.getElementById('rotatePhotoBtn');
  const enhancePhotoBtn = document.getElementById('enhancePhotoBtn');
  const mediaPreviewImg = document.getElementById('mediaPreviewImg');
  const attachmentInput = document.getElementById('attachmentInput');
  const messagesViewport = document.getElementById('messagesViewport');
  const iosHapticLabel = document.getElementById('iosHapticLabel');
  const inAppToast = document.getElementById('inAppToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastText = document.getElementById('toastText');
  const privacyBlurToggleBtn = document.getElementById('privacyBlurToggleBtn');
  const showQrCardBtn = document.getElementById('showQrCardBtn');
  const qrInviteModal = document.getElementById('qrInviteModal');
  const closeQrModalBtn = document.getElementById('closeQrModalBtn');
  const qrHandleLabel = document.getElementById('qrHandleLabel');
  const myHandle = document.getElementById('myHandle');
  const diceRollBtn = document.getElementById('diceRollBtn');
  const coinFlipBtn = document.getElementById('coinFlipBtn');
  const emojiDrawer = document.getElementById('emojiDrawer');

  function haptic(type) {
    if (navigator.vibrate) {
      try { navigator.vibrate(type === 'medium' ? 16 : 9); } catch (e) {}
    }
    if (
      iosHapticLabel &&
      !document.body.classList.contains('keyboard-open') &&
      document.activeElement !== messageInput
    ) {
      try { iosHapticLabel.click(); } catch (e) {}
    }
  }

  function showQuickToast(title, text) {
    if (!inAppToast || !toastTitle || !toastText) return;
    toastTitle.textContent = title;
    toastText.textContent = text;
    inAppToast.classList.remove('hidden');
    setTimeout(() => inAppToast.classList.add('hidden'), 3200);
  }

  // 1. Встроенный калькулятор выражений в поле ввода
  let currentCalcResult = null;
  if (messageInput && calcHelperPill) {
    messageInput.addEventListener('input', () => {
      const raw = messageInput.value.trim().replace(/^=\s*/, '');
      if (!/^[0-9+\-*/().\s]{3,40}$/.test(raw) || !/[+\-*/]/.test(raw) || !/\d+\s*$/.test(raw)) {
        calcHelperPill.classList.add('hidden');
        currentCalcResult = null;
        return;
      }
      try {
        const val = Function('"use strict"; return (' + raw + ');')();
        if (typeof val === 'number' && Number.isFinite(val) && String(val) !== raw) {
          currentCalcResult = String(Math.round(val * 10000) / 10000);
          calcHelperPill.textContent = `🧮 = ${currentCalcResult} (нажмите, чтобы подставить)`;
          calcHelperPill.classList.remove('hidden');
        } else {
          calcHelperPill.classList.add('hidden');
        }
      } catch (e) {
        calcHelperPill.classList.add('hidden');
      }
    });

    calcHelperPill.addEventListener('click', () => {
      if (!currentCalcResult) return;
      haptic('light');
      const raw = messageInput.value.trim();
      messageInput.value = raw.startsWith('=') ? currentCalcResult : `${raw} = ${currentCalcResult}`;
      calcHelperPill.classList.add('hidden');
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      messageInput.focus();
    });
  }

  // 2. Поворот на 90° и улучшение цвета фото перед отправкой
  let photoEnhanced = false;
  function transformPreviewPhoto(rotateDeg, toggleEnhance) {
    if (!mediaPreviewImg || !mediaPreviewImg.src || mediaPreviewImg.classList.contains('hidden')) return;
    haptic('light');
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const swap = rotateDeg === 90 || rotateDeg === 270;
      canvas.width = swap ? img.height : img.width;
      canvas.height = swap ? img.width : img.height;
      const ctx = canvas.getContext('2d');
      if (toggleEnhance) photoEnhanced = !photoEnhanced;
      if (photoEnhanced) ctx.filter = 'contrast(1.14) saturate(1.22) brightness(1.04)';
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (rotateDeg) ctx.rotate((rotateDeg * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const editedFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        mediaPreviewImg.dataset.isEdited = '1';
        mediaPreviewImg.src = URL.createObjectURL(blob);
        if (attachmentInput) {
          try {
            const dt = new DataTransfer();
            dt.items.add(editedFile);
            attachmentInput.files = dt.files;
          } catch (e) {}
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = mediaPreviewImg.src;
  }

  if (rotatePhotoBtn) rotatePhotoBtn.addEventListener('click', () => transformPreviewPhoto(90, false));
  if (enhancePhotoBtn) {
    enhancePhotoBtn.addEventListener('click', () => {
      transformPreviewPhoto(0, true);
      enhancePhotoBtn.classList.toggle('active', photoEnhanced);
    });
  }

  // 3. Режим «Не беспокоить» (🌙)
  let isDndActive = localStorage.getItem('pulse_dnd_mode') === 'on';
  function syncDndUI() {
    if (!dndToggleBtn) return;
    dndToggleBtn.classList.toggle('dnd-active', isDndActive);
    dndToggleBtn.textContent = isDndActive ? '🔕' : '🌙';
    localStorage.setItem('pulse_sound', isDndActive ? 'off' : 'on');
  }
  if (dndToggleBtn) {
    dndToggleBtn.addEventListener('click', () => {
      haptic('medium');
      isDndActive = !isDndActive;
      localStorage.setItem('pulse_dnd_mode', isDndActive ? 'on' : 'off');
      syncDndUI();
      showQuickToast(
        isDndActive ? 'Режим «Не беспокоить» включён 🌙' : 'Звук уведомлений включён 🔔',
        isDndActive ? 'Звуковые сигналы временно отключены' : 'Обычный режим оповещений активен'
      );
    });
    syncDndUI();
  }

  // 4. Мини-игры в чате: 🎲 Бросить кубик и 🪙 Подбросить монетку
  if (diceRollBtn && messageInput && smartActionBtn) {
    diceRollBtn.addEventListener('click', () => {
      haptic('medium');
      if (emojiDrawer) emojiDrawer.classList.add('hidden');
      const roll = Math.floor(Math.random() * 6) + 1;
      const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      messageInput.value = `🎲 Бросок кубика: ${faces[roll - 1]} (выпало ${roll} из 6)`;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      smartActionBtn.click();
    });
  }

  if (coinFlipBtn && messageInput && smartActionBtn) {
    coinFlipBtn.addEventListener('click', () => {
      haptic('medium');
      if (emojiDrawer) emojiDrawer.classList.add('hidden');
      const isHeads = Math.random() < 0.5;
      messageInput.value = `🪙 Монетка: выпал(а) **${isHeads ? 'Орёл 🦅' : 'Решка 👑'}**`;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      smartActionBtn.click();
    });
  }

  // 5. Режим «Анти-шпион» (🕶️ Размытие сообщений чата от посторонних глаз)
  if (privacyBlurToggleBtn && messagesViewport) {
    privacyBlurToggleBtn.addEventListener('click', () => {
      haptic('light');
      const active = messagesViewport.classList.toggle('privacy-blur-mode');
      privacyBlurToggleBtn.classList.toggle('dnd-active', active);
      showQuickToast(
        active ? 'Режим «Анти-шпион» включён 🕶️' : 'Размытие чата отключено 👁️',
        active ? 'Наведите или коснитесь сообщения, чтобы прочитать' : 'Сообщения снова видны полностью'
      );
    });
  }

  // 6. Персональная QR-визитка профиля в Настройках (?contact=username)
  if (showQrCardBtn && qrInviteModal) {
    showQrCardBtn.addEventListener('click', () => {
      haptic('light');
      const rawHandleText = (myHandle ? myHandle.textContent : '') || '@username';
      const handleOnly = rawHandleText.split('•')[0].trim();
      const cleanUser = handleOnly.replace(/^@+/, '').trim();
      if (qrHandleLabel) {
        qrHandleLabel.textContent = handleOnly;
      }
      const qrImg = qrInviteModal.querySelector('img');
      if (qrImg && cleanUser) {
        const personalUrl = `https://rickaveri.github.io/pulse/?contact=${encodeURIComponent(cleanUser)}`;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(personalUrl)}`;
      }
      qrInviteModal.classList.remove('hidden');
    });
  }
  if (closeQrModalBtn && qrInviteModal) {
    closeQrModalBtn.addEventListener('click', () => qrInviteModal.classList.add('hidden'));
  }

  // 7. Навигация по датам и фоновое обновление PWA v22
  if (messagesViewport) {
    messagesViewport.addEventListener('click', (e) => {
      const div = e.target.closest('.date-divider, .date-separator');
      if (!div) return;
      haptic('light');
      const allDivs = Array.from(messagesViewport.querySelectorAll('.date-divider, .date-separator'));
      const idx = allDivs.indexOf(div);
      const target = idx > 0 ? allDivs[idx - 1] : allDivs[0];
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // 8. Исправления и улучшения v23 (Спойлер, чистый таймер 30с, Анти-шпион без меню, 3D-игры, Озвучка и Перевод)
  const dndSettingsToggle = document.getElementById('dndSettingsToggle');
  if (dndSettingsToggle) {
    const syncDnd = () => {
      const on = localStorage.getItem('pulse_dnd_mode') === 'on';
      dndSettingsToggle.classList.toggle('on', on);
      localStorage.setItem('pulse_sound', on ? 'off' : 'on');
    };
    dndSettingsToggle.addEventListener('click', () => {
      haptic('medium');
      const next = localStorage.getItem('pulse_dnd_mode') !== 'on';
      localStorage.setItem('pulse_dnd_mode', next ? 'on' : 'off');
      syncDnd();
      showQuickToast(
        next ? 'Режим «Не беспокоить» включён 🌙' : 'Звук уведомлений включён 🔔',
        next ? 'Звуковые сигналы временно отключены' : 'Обычный режим оповещений активен'
      );
    });
    syncDnd();
  }

  // В режиме «Анти-шпион» одиночное касание проявляет пузырь без открытия всплывающего меню
  if (messagesViewport) {
    messagesViewport.addEventListener(
      'click',
      (e) => {
        if (!messagesViewport.classList.contains('privacy-blur-mode')) return;
        const bubble = e.target.closest('.msg-bubble');
        if (!bubble) return;
        e.stopPropagation();
        e.preventDefault();
        haptic('light');
        bubble.classList.toggle('peek-unblurred');
      },
      true
    );
  }

  const msgActionModal = document.getElementById('msgActionModal');
  const sheetSpeakBtn = document.getElementById('sheetSpeakBtn');
  const sheetTranslateBtn = document.getElementById('sheetTranslateBtn');
  const selfDestructToggleBtn = document.getElementById('selfDestructToggleBtn');
  let lastTargetBubble = null;

  function extractCleanBubbleText(bubble) {
    if (!bubble) return '';
    const clone = bubble.cloneNode(true);
    clone
      .querySelectorAll(
        '.msg-meta, .reaction-chip-pill, .self-destruct-badge, .msg-reply-quote, .msg-translation-box, .yt-preview-card'
      )
      .forEach((el) => el.remove());
    return clone.textContent.replace(/🔥\s*30s:\s*/gi, '').replace(/\|\|/g, '').trim();
  }

  if (messagesViewport) {
    const trackBubble = (e) => {
      const b = e.target.closest('.msg-bubble');
      if (b) lastTargetBubble = b;
    };
    messagesViewport.addEventListener('pointerdown', trackBubble, true);
    messagesViewport.addEventListener('touchstart', trackBubble, { capture: true, passive: true });
    messagesViewport.addEventListener('click', trackBubble, true);
  }

  if (sheetSpeakBtn) {
    sheetSpeakBtn.addEventListener(
      'click',
      (e) => {
        e.stopImmediatePropagation();
        haptic('light');
        if (msgActionModal) msgActionModal.classList.add('hidden');
        const txt = extractCleanBubbleText(lastTargetBubble);
        if (!txt) return;
        showQuickToast('🔊 Озвучиваю сообщение', txt);
        if ('speechSynthesis' in window) {
          try {
            if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
            setTimeout(() => {
              const utt = new SpeechSynthesisUtterance(txt);
              utt.lang = /[а-яА-ЯёЁ]/.test(txt) ? 'ru-RU' : 'en-US';
              utt.rate = 1.0;
              window.speechSynthesis.speak(utt);
            }, 80);
          } catch (err) {}
        }
      },
      true
    );
  }

  if (sheetTranslateBtn) {
    sheetTranslateBtn.addEventListener(
      'click',
      async (e) => {
        e.stopImmediatePropagation();
        haptic('light');
        if (msgActionModal) msgActionModal.classList.add('hidden');
        const bubble = lastTargetBubble;
        const txt = extractCleanBubbleText(bubble);
        if (!txt) return;
        const isRu = /[а-яА-ЯёЁ]/.test(txt);
        const tl = isRu ? 'en' : 'ru';
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tl}&dt=t&q=${encodeURIComponent(txt.slice(0, 500))}`;
          const res = await fetch(url);
          const data = await res.json();
          const translated = Array.isArray(data && data[0])
            ? data[0].map((part) => part[0]).join('')
            : '';
          if (!translated) return;
          if (bubble) {
            const old = bubble.querySelector('.msg-translation-box');
            if (old) old.remove();
            const box = document.createElement('div');
            box.className = 'msg-translation-box';
            box.innerHTML = `<div class="msg-translation-label">🌐 Перевод (${tl.toUpperCase()})</div><div></div>`;
            box.lastElementChild.textContent = translated;
            const meta = bubble.querySelector('.msg-meta');
            if (meta) bubble.insertBefore(box, meta);
            else bubble.appendChild(box);
          } else {
            showQuickToast(`🌐 Перевод (${tl.toUpperCase()})`, translated);
          }
        } catch (err) {}
      },
      true
    );
  }

  // 9. Глубокая обработка текста внутри пузырей (Спойлер ||...||, очистка 🔥 30s: и 3D-анимация Кубика/Монетки)
  function processV23DeepBubbles() {
    if (!messagesViewport) return;
    Array.from(messagesViewport.querySelectorAll('.msg-bubble:not([data-v23-done])')).forEach((bubble) => {
      bubble.setAttribute('data-v23-done', '1');

      const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT, null);
      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) textNodes.push(n);

      textNodes.forEach((tNode) => {
        if (!tNode.nodeValue) return;

        // А) Убираем служебный префикс 🔥 30s: перед словом
        if (/🔥\s*30s:\s*/i.test(tNode.nodeValue)) {
          tNode.nodeValue = tNode.nodeValue.replace(/🔥\s*30s:\s*/gi, '');
          if (selfDestructToggleBtn) selfDestructToggleBtn.classList.remove('burn-active');
        }

        // Б) Прячем ||секрет|| за размытый спойлер на любой глубине вложенности
        if (tNode.nodeValue.includes('||') && tNode.parentNode) {
          const parts = tNode.nodeValue.split(/\|\|([^|]+)\|\|/g);
          if (parts.length > 1) {
            const frag = document.createDocumentFragment();
            parts.forEach((part, idx) => {
              if (idx % 2 === 1) {
                const sp = document.createElement('span');
                sp.className = 'msg-spoiler';
                sp.title = 'Нажмите, чтобы показать скрытый текст';
                sp.textContent = part;
                const toggleSpoiler = (ev) => {
                  ev.stopPropagation();
                  haptic('light');
                  sp.classList.toggle('revealed');
                };
                sp.addEventListener('click', toggleSpoiler, true);
                sp.addEventListener('touchend', toggleSpoiler, { capture: true, passive: false });
                frag.appendChild(sp);
              } else if (part) {
                frag.appendChild(document.createTextNode(part));
              }
            });
            tNode.parentNode.replaceChild(frag, tNode);
          }
        }
      });

      // В) 3D-анимация для броска кубика 🎲 и монетки 🪙
      if (!bubble.dataset.gameCardRendered) {
        const fullTxt = bubble.textContent || '';
        const diceMatch = fullTxt.match(/🎲 Бросок кубика:\s*([⚀⚁⚂⚃⚄⚅])\s*\(выпало (\d) из 6\)/);
        if (diceMatch) {
          bubble.dataset.gameCardRendered = '1';
          const metaEl = bubble.querySelector('.msg-meta');
          const card = document.createElement('div');
          card.className = 'game-visual-card';
          card.innerHTML = `
            <div class="dice-cube-anim">${diceMatch[1]}</div>
            <div>
              <div style="font-weight:700; font-size:14.5px;">Бросок кубика 🎲</div>
              <div style="font-size:12.5px; opacity:0.88;">Выпало: <strong>${diceMatch[2]} из 6</strong></div>
            </div>
          `;
          bubble.innerHTML = '';
          bubble.appendChild(card);
          if (metaEl) bubble.appendChild(metaEl);
          return;
        }

        const coinMatch = fullTxt.match(/🪙 Монетка:\s*выпал\(а\)\s*\**\s*(Орёл 🦅|Решка 👑)/);
        if (coinMatch) {
          bubble.dataset.gameCardRendered = '1';
          const isEagle = coinMatch[1].includes('Орёл');
          const metaEl = bubble.querySelector('.msg-meta');
          const card = document.createElement('div');
          card.className = 'game-visual-card';
          card.innerHTML = `
            <div class="coin-disc-anim">${isEagle ? '🦅' : '👑'}</div>
            <div>
              <div style="font-weight:700; font-size:14.5px;">Бросок монетки 🪙</div>
              <div style="font-size:12.5px; opacity:0.88;">Результат: <strong>${coinMatch[1]}</strong></div>
            </div>
          `;
          bubble.innerHTML = '';
          bubble.appendChild(card);
          if (metaEl) bubble.appendChild(metaEl);
        }
      }
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    let v23Raf = false;
    const v23Obs = new MutationObserver(() => {
      if (v23Raf) return;
      v23Raf = true;
      requestAnimationFrame(() => {
        v23Raf = false;
        processV23DeepBubbles();
      });
    });
    v23Obs.observe(messagesViewport, { childList: true });
    processV23DeepBubbles();
  }


  // =========================================================================
  // 11. ОБНОВЛЕНИЕ v35: Двойной тап ❤️ с анимацией, Умные быстрые ответы и Индикатор качества звонка (Ping)
  // =========================================================================

  // А) Двойной тап / двойной клик по сообщению -> мгновенная реакция ❤️ с вылетающим сердцем
  let lastBubbleTapTime = 0;
  let lastTappedBubble = null;

  function triggerHeartBurstOnBubble(bubble, clientX, clientY) {
    if (!bubble) return;
    const heart = document.createElement('div');
    heart.className = 'dbltap-heart-burst';
    heart.textContent = '❤️';
    const rect = bubble.getBoundingClientRect();
    const x = clientX || (rect.left + rect.width / 2);
    const y = clientY || (rect.top + rect.height / 2);
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 750);

    // Открываем меню реакций или сразу кликаем ❤️
    const rightClickEvt = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    bubble.dispatchEvent(rightClickEvt);
    setTimeout(() => {
      const heartBtn = document.querySelector('[data-react="❤️"]');
      if (heartBtn) heartBtn.click();
    }, 35);
  }

  if (messagesViewport) {
    messagesViewport.addEventListener('dblclick', (e) => {
      const bubble = e.target.closest('.msg-bubble');
      if (!bubble) return;
      e.preventDefault();
      triggerHeartBurstOnBubble(bubble, e.clientX, e.clientY);
    });

    messagesViewport.addEventListener('touchend', (e) => {
      const bubble = e.target.closest('.msg-bubble');
      if (!bubble || e.target.closest('button, a, audio, video, .spoiler-mask')) return;
      const now = Date.now();
      if (lastTappedBubble === bubble && (now - lastBubbleTapTime) < 280) {
        lastBubbleTapTime = 0;
        lastTappedBubble = null;
        const touch = (e.changedTouches && e.changedTouches[0]) || null;
        triggerHeartBurstOnBubble(bubble, touch ? touch.clientX : 0, touch ? touch.clientY : 0);
      } else {
        lastBubbleTapTime = now;
        lastTappedBubble = bubble;
      }
    }, { passive: true });
  }

  // Б) Умные быстрые ответы (Smart Quick Replies) над строкой ввода, когда собеседник прислал вопрос или приветствие
  const composerWrap = document.querySelector('.chat-composer') || (messageInput && messageInput.parentElement);
  let smartRepliesBar = document.getElementById('smartQuickRepliesBar');
  if (!smartRepliesBar && composerWrap && composerWrap.parentElement) {
    smartRepliesBar = document.createElement('div');
    smartRepliesBar.id = 'smartQuickRepliesBar';
    smartRepliesBar.className = 'smart-quick-replies-bar hidden';
    composerWrap.parentElement.insertBefore(smartRepliesBar, composerWrap);
  }

  let lastEvaluatedIncomingId = '';
  const dismissedQuickReplyMsgIds = new Set();

  function dismissCurrentQuickReplies() {
    if (!smartRepliesBar) return;
    smartRepliesBar.classList.add('hidden');
    if (lastEvaluatedIncomingId) {
      dismissedQuickReplyMsgIds.add(lastEvaluatedIncomingId);
    }
  }

  function updateSmartQuickReplies() {
    if (!smartRepliesBar || !messagesViewport || !messageInput) return;

    // Никогда не показываем и не дёргаем панель быстрых ответов, когда пользователь уже печатает или открыта клавиатура!
    if (
      document.activeElement === messageInput ||
      document.body.classList.contains('keyboard-open') ||
      messageInput.value.trim().length > 0
    ) {
      smartRepliesBar.classList.add('hidden');
      return;
    }

    const rows = Array.from(messagesViewport.querySelectorAll('.msg-row'));
    if (!rows.length) {
      smartRepliesBar.classList.add('hidden');
      return;
    }
    const lastRow = rows[rows.length - 1];
    if (lastRow.classList.contains('mine') || lastRow.classList.contains('own')) {
      smartRepliesBar.classList.add('hidden');
      return;
    }
    const msgId = String(lastRow.dataset.msgId || '');
    if (msgId && dismissedQuickReplyMsgIds.has(msgId)) {
      smartRepliesBar.classList.add('hidden');
      return;
    }
    const bubble = lastRow.querySelector('.msg-bubble');
    if (!bubble) {
      smartRepliesBar.classList.add('hidden');
      return;
    }

    const cleanClone = bubble.cloneNode(true);
    cleanClone.querySelectorAll('.msg-meta, .msg-reply-quote, .reaction-chip-pill').forEach((el) => el.remove());
    const rawText = (cleanClone.textContent || '').trim().toLowerCase();
    if (!rawText) {
      smartRepliesBar.classList.add('hidden');
      return;
    }

    // Показываем быстрые ответы ТОЛЬКО когда собеседник задал конкретный вопрос (?), поздоровался или предложил созвониться
    let suggestions = [];
    if (/^(привет|здравствуй|доброе|добрый|хай|салам)/i.test(rawText)) {
      suggestions = ['Привет! 👋', 'Привет, как дела?', 'На связи! ✨'];
    } else if (rawText.includes('звонок') || rawText.includes('позвон') || rawText.includes('созвон')) {
      suggestions = ['Давай созвонимся 📞', 'Наберу через 5 мин', 'Сейчас не могу говорить'];
    } else if (rawText.includes('?')) {
      suggestions = ['👍 Да!', 'Сейчас гляну 👀', 'Ок, договорились 🤝', 'Чуть позже напишу'];
    }

    if (!suggestions.length) {
      smartRepliesBar.classList.add('hidden');
      return;
    }

    if (msgId && msgId === lastEvaluatedIncomingId && !smartRepliesBar.classList.contains('hidden')) {
      return;
    }
    lastEvaluatedIncomingId = msgId || rawText;

    smartRepliesBar.innerHTML = '';
    suggestions.forEach((txt) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'smart-reply-chip';
      chip.textContent = txt;
      chip.addEventListener('click', () => {
        dismissCurrentQuickReplies();
        messageInput.value = txt;
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        const sendBtn = document.getElementById('smartActionBtn');
        if (sendBtn) sendBtn.click();
      });
      smartRepliesBar.appendChild(chip);
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'smart-reply-chip';
    closeBtn.style.cssText = 'padding:4px 8px; opacity:0.7; border-color:transparent; background:transparent;';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Скрыть подсказки';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissCurrentQuickReplies();
    });
    smartRepliesBar.appendChild(closeBtn);
    smartRepliesBar.classList.remove('hidden');
  }

  if (messagesViewport && 'MutationObserver' in window) {
    const srObs = new MutationObserver(() => {
      requestAnimationFrame(updateSmartQuickReplies);
    });
    srObs.observe(messagesViewport, { childList: true });
  }
  if (messageInput) {
    // Как только пользователь нажал на поле ввода, чтобы печатать сам — сразу убираем подсказки и не возвращаем их для этого сообщения
    messageInput.addEventListener('focus', dismissCurrentQuickReplies);
    messageInput.addEventListener('input', dismissCurrentQuickReplies);
  }


  // В) Ускорение голосовых сообщений и видеокружочков (1x -> 1.5x -> 2x) + Карточки превью ссылок (v36)
  let currentVoiceSpeed = 1.0;
  function enhanceMediaAndLinksV36() {
    if (!messagesViewport) return;
    const bubbles = messagesViewport.querySelectorAll(".msg-bubble:not([data-v36-ready])");
    bubbles.forEach((bubble) => {
      bubble.setAttribute("data-v36-ready", "1");

      // Кнопка скорости 1x/1.5x/2x уже встроена напрямую в плееры голосовых и кружочков

      // 2) Автоматическая карточка сайта (Rich Link Preview) для внешних ссылок
      const linkEl = bubble.querySelector("a[href^=\"http\"]");
      if (linkEl && !bubble.querySelector(".rich-link-card") && !bubble.querySelector("iframe")) {
        try {
          const urlObj = new URL(linkEl.href);
          if (!urlObj.hostname.includes("supabase.co")) {
            const card = document.createElement("a");
            card.className = "rich-link-card";
            card.href = linkEl.href;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            const domSpan = document.createElement("span");
            domSpan.className = "rich-link-domain";
            domSpan.textContent = "🌐 " + urlObj.hostname.replace(/^www\./, "");
            const openSpan = document.createElement("span");
            openSpan.className = "rich-link-open";
            openSpan.textContent = "Открыть ↗";
            card.appendChild(domSpan);
            card.appendChild(openSpan);
            const metaEl = bubble.querySelector(".msg-meta");
            if (metaEl) bubble.insertBefore(card, metaEl);
            else bubble.appendChild(card);
          }
        } catch (e) {}
      }
    });
  }

  if (messagesViewport && "MutationObserver" in window) {
    let v36Raf = false;
    const v36Obs = new MutationObserver(() => {
      if (v36Raf) return;
      v36Raf = true;
      requestAnimationFrame(() => {
        v36Raf = false;
        enhanceMediaAndLinksV36();
      });
    });
    v36Obs.observe(messagesViewport, { childList: true });
    enhanceMediaAndLinksV36();
  }

  // 12. Вкладки-фильтры вложений чата в карточке собеседника/группы (Все / Фото / Кружки и голос / Файлы) (v59)
  const sharedMediaTabs = document.getElementById('sharedMediaTabs');
  const sharedMediaGrid = document.getElementById('sharedMediaGrid');
  if (sharedMediaTabs && sharedMediaGrid) {
    sharedMediaTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-media-tab]');
      if (!btn) return;
      haptic('light');
      const tab = btn.getAttribute('data-media-tab') || 'all';
      sharedMediaTabs.querySelectorAll('[data-media-tab]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      const items = Array.from(sharedMediaGrid.children);
      let visibleCount = 0;
      items.forEach((el) => {
        if (el.classList.contains('shared-media-tab-empty')) return;
        const kind = el.getAttribute('data-media-kind') || '';
        if (!kind) return;
        const show =
          tab === 'all' ||
          (tab === 'image' && kind === 'image') ||
          (tab === 'voice_circle' && (kind === 'video_circle' || kind === 'voice')) ||
          (tab === 'file' && kind === 'file');
        el.style.display = show ? (el.tagName === 'IMG' ? 'block' : 'flex') : 'none';
        if (show) visibleCount += 1;
      });
      let emptyNotice = sharedMediaGrid.querySelector('.shared-media-tab-empty');
      if (visibleCount === 0) {
        if (!emptyNotice) {
          emptyNotice = document.createElement('div');
          emptyNotice.className = 'shared-media-tab-empty';
          emptyNotice.style.cssText = 'grid-column:1/-1; font-size:12.5px; color:var(--text-muted); padding:8px 0;';
          sharedMediaGrid.appendChild(emptyNotice);
        }
        emptyNotice.textContent = 'В этой категории пока нет вложений.';
        emptyNotice.style.display = 'block';
      } else if (emptyNotice) {
        emptyNotice.style.display = 'none';
      }
    });
  }

  // =========================================================================
  // 13. ОБНОВЛЕНИЕ v60:
  // А) Листание фото в полноэкранной галерее (свайп влево/вправо + кнопки ‹ › + счётчик 1/N)
  // Б) Точка «Не прослушано» на новых входящих голосовых и видеокружочках
  // В) Плавный переход с подсветкой при нажатии на цитату ответа
  // Г) Пакетная отправка сразу нескольких выбранных фотографий/файлов
  // =========================================================================

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let galleryUrls = [];
  let galleryIndex = 0;
  let lbPrevBtn = null;
  let lbNextBtn = null;
  let lbCounter = null;

  function ensureLightboxGalleryControls() {
    if (!lightbox || lbCounter) return;
    lbCounter = document.createElement('div');
    lbCounter.className = 'lb-counter-pill hidden';
    lbPrevBtn = document.createElement('button');
    lbPrevBtn.type = 'button';
    lbPrevBtn.className = 'lb-nav-btn prev hidden';
    lbPrevBtn.textContent = '‹';
    lbNextBtn = document.createElement('button');
    lbNextBtn.type = 'button';
    lbNextBtn.className = 'lb-nav-btn next hidden';
    lbNextBtn.textContent = '›';

    const stepGallery = (dir, ev) => {
      if (ev) {
        ev.stopPropagation();
        ev.preventDefault();
      }
      if (galleryUrls.length <= 1) return;
      haptic('light');
      galleryIndex = (galleryIndex + dir + galleryUrls.length) % galleryUrls.length;
      if (lightboxImg) {
        lightboxImg.style.transform = 'scale(1)';
        lightboxImg.src = galleryUrls[galleryIndex];
      }
      updateLightboxGalleryUI();
    };

    lbPrevBtn.addEventListener('click', (e) => stepGallery(-1, e));
    lbNextBtn.addEventListener('click', (e) => stepGallery(1, e));

    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      if (!touchStartX || galleryUrls.length <= 1) return;
      const t = (e.changedTouches && e.changedTouches[0]) || null;
      if (!t) return;
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      touchStartX = 0;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        stepGallery(dx < 0 ? 1 : -1, null);
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (!lightbox || lightbox.classList.contains('hidden') || galleryUrls.length <= 1) return;
      if (e.key === 'ArrowRight') stepGallery(1, null);
      else if (e.key === 'ArrowLeft') stepGallery(-1, null);
    });

    lightbox.appendChild(lbCounter);
    lightbox.appendChild(lbPrevBtn);
    lightbox.appendChild(lbNextBtn);
  }

  function updateLightboxGalleryUI() {
    ensureLightboxGalleryControls();
    if (!lbCounter || !lbPrevBtn || !lbNextBtn) return;
    const multi = galleryUrls.length > 1;
    lbCounter.classList.toggle('hidden', !multi);
    lbPrevBtn.classList.toggle('hidden', !multi);
    lbNextBtn.classList.toggle('hidden', !multi);
    if (multi) {
      lbCounter.textContent = `${galleryIndex + 1} / ${galleryUrls.length}`;
    }
    const dlLink = lightbox ? lightbox.querySelector('a[download]') : null;
    if (dlLink && lightboxImg) dlLink.href = lightboxImg.src || '#';
  }

  if (lightbox && lightboxImg && 'MutationObserver' in window) {
    const lbObs = new MutationObserver(() => {
      if (lightbox.classList.contains('hidden') || !lightboxImg.src) return;
      const imgs = messagesViewport
        ? Array.from(messagesViewport.querySelectorAll('.msg-bubble img'))
            .map((im) => im.src)
            .filter((s) => s && !s.includes('img.youtube.com'))
        : [];
      const unique = Array.from(new Set(imgs));
      const cur = lightboxImg.src;
      if (unique.length > 0 && unique.includes(cur)) {
        galleryUrls = unique;
        galleryIndex = unique.indexOf(cur);
      } else {
        galleryUrls = cur ? [cur] : [];
        galleryIndex = 0;
      }
      updateLightboxGalleryUI();
    });
    lbObs.observe(lightbox, { attributes: true, attributeFilter: ['class'] });
  }

  // Б) Метка «Не прослушано» (акцентная точка) на входящих голосовых и видеокружочках
  const PLAYED_MEDIA_KEY = 'pulse_played_media_v60';
  function getPlayedMediaSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem(PLAYED_MEDIA_KEY) || '[]'));
    } catch (e) {
      return new Set();
    }
  }
  function markMediaPlayed(msgId, dotEl) {
    if (dotEl) dotEl.remove();
    if (!msgId) return;
    try {
      const set = getPlayedMediaSet();
      set.add(String(msgId));
      const arr = Array.from(set).slice(-400);
      localStorage.setItem(PLAYED_MEDIA_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function decorateUnplayedVoiceAndCircles() {
    if (!messagesViewport) return;
    const playedSet = getPlayedMediaSet();
    const rows = messagesViewport.querySelectorAll('.msg-row:not([data-v60-unplayed-checked])');
    rows.forEach((row) => {
      row.setAttribute('data-v60-unplayed-checked', '1');
      if (row.classList.contains('mine') || row.classList.contains('own')) return;
      const msgId = row.getAttribute('data-msg-id') || '';
      if (!msgId || playedSet.has(msgId)) return;

      const voicePlayer = row.querySelector('.voice-player');
      if (voicePlayer) {
        const dot = document.createElement('span');
        dot.className = 'unplayed-media-dot';
        dot.title = 'Ещё не прослушано';
        voicePlayer.appendChild(dot);
        const playBtn = voicePlayer.querySelector('.voice-play-btn');
        if (playBtn) {
          playBtn.addEventListener('click', () => markMediaPlayed(msgId, dot), { once: true });
        }
        const origStart = voicePlayer._startSeqPlay;
        if (typeof origStart === 'function') {
          voicePlayer._startSeqPlay = function () {
            markMediaPlayed(msgId, dot);
            return origStart.apply(this, arguments);
          };
        }
      }

      const circleVideo = row.querySelector('video[data-seq-media="1"]');
      if (circleVideo) {
        const badge = row.querySelector('.video-circle-badge');
        const dot = document.createElement('span');
        dot.className = 'unplayed-media-dot';
        dot.title = 'Ещё не просмотрено со звуком';
        if (badge) badge.appendChild(dot);
        circleVideo.addEventListener('play', () => {
          if (!circleVideo.muted) markMediaPlayed(msgId, dot);
        });
        const circleWrap = circleVideo.parentElement;
        if (circleWrap) {
          circleWrap.addEventListener('click', () => markMediaPlayed(msgId, dot), { once: true });
        }
      }
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    const unplayedObs = new MutationObserver(() => {
      requestAnimationFrame(decorateUnplayedVoiceAndCircles);
    });
    unplayedObs.observe(messagesViewport, { childList: true });
    decorateUnplayedVoiceAndCircles();
  }

  // В) Плавная подсветка исходного сообщения при клике на цитату ответа (.msg-reply-quote)
  if (messagesViewport) {
    messagesViewport.addEventListener('click', (e) => {
      const quote = e.target.closest('.msg-reply-quote');
      if (!quote) return;
      const snippet = (quote.textContent || '').trim();
      if (!snippet) return;
      const allRows = Array.from(messagesViewport.querySelectorAll('.msg-row'));
      const currentRow = quote.closest('.msg-row');
      for (const r of allRows) {
        if (r === currentRow) continue;
        const b = r.querySelector('.msg-bubble');
        if (b && (b.textContent || '').includes(snippet.slice(-18))) {
          r.scrollIntoView({ behavior: 'smooth', block: 'center' });
          r.classList.remove('msg-highlight-flash');
          void r.offsetWidth;
          r.classList.add('msg-highlight-flash');
          setTimeout(() => r.classList.remove('msg-highlight-flash'), 1700);
          break;
        }
      }
    });
  }

  // Г) Пакетная отправка сразу нескольких выбранных фото/файлов через скрепку
  let batchPendingFiles = [];
  const mediaPreviewTitle = document.getElementById('mediaPreviewTitle');
  const confirmSendMediaBtn = document.getElementById('confirmSendMediaBtn');
  const cancelSendMediaBtn = document.getElementById('cancelSendMediaBtn');

  if (attachmentInput) {
    attachmentInput.addEventListener('change', (e) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 1) {
        batchPendingFiles = files.slice(1);
        setTimeout(() => {
          if (mediaPreviewTitle) {
            mediaPreviewTitle.textContent = `Отправить ${files.length} влож. (пачкой)`;
          }
        }, 30);
      } else if (batchPendingFiles.length === 0) {
        batchPendingFiles = [];
      }
    }, true);
  }

  if (cancelSendMediaBtn) {
    cancelSendMediaBtn.addEventListener('click', () => {
      batchPendingFiles = [];
    });
  }

  if (confirmSendMediaBtn && attachmentInput) {
    confirmSendMediaBtn.addEventListener('click', () => {
      if (batchPendingFiles.length === 0) return;
      const nextFile = batchPendingFiles.shift();
      setTimeout(() => {
        try {
          const dt = new DataTransfer();
          dt.items.add(nextFile);
          attachmentInput.files = dt.files;
          attachmentInput.dispatchEvent(new Event('change', { bubbles: true }));
          setTimeout(() => {
            confirmSendMediaBtn.click();
          }, 220);
        } catch (e) {}
      }, 420);
    });
  }

  // =========================================================================
  // 14. ОБНОВЛЕНИЕ v61:
  // А) Запоминание позиции паузы длинных голосовых и видеокружочков (Resume Playback)
  // Б) Копирование кодов (4–8 цифр) и номеров в тексте сообщения в 1 тап
  // В) Счётчик новых сообщений на кнопке прокрутки вниз (↓) при чтении истории
  // Г) Мгновенная фоновая предзагрузка соседних снимков в фотогалерее (0 мс свайп)
  // =========================================================================

  const MEDIA_RESUME_KEY = 'pulse_media_resume_v61';
  function getResumeMap() {
    try {
      return JSON.parse(localStorage.getItem(MEDIA_RESUME_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  function saveResumePos(msgId, sec) {
    if (!msgId) return;
    try {
      const map = getResumeMap();
      if (sec <= 1) {
        delete map[msgId];
      } else {
        map[msgId] = Math.floor(sec);
      }
      const keys = Object.keys(map);
      if (keys.length > 150) delete map[keys[0]];
      localStorage.setItem(MEDIA_RESUME_KEY, JSON.stringify(map));
    } catch (e) {}
  }

  function bindMediaResumeAndCodesV61() {
    if (!messagesViewport) return;
    const resumeMap = getResumeMap();

    messagesViewport.querySelectorAll('video[data-seq-media="1"]:not([data-v61-resume])').forEach((vid) => {
      vid.setAttribute('data-v61-resume', '1');
      const row = vid.closest('.msg-row');
      const msgId = row ? row.getAttribute('data-msg-id') : '';
      if (!msgId) return;
      if (resumeMap[msgId] && resumeMap[msgId] > 2) {
        vid.addEventListener('loadedmetadata', () => {
          if (vid.duration > resumeMap[msgId] + 2) {
            try { vid.currentTime = resumeMap[msgId]; } catch (e) {}
          }
        }, { once: true });
      }
      vid.addEventListener('pause', () => {
        if (!vid.ended && vid.currentTime > 3 && vid.duration > 12) {
          saveResumePos(msgId, vid.currentTime);
        }
      });
      vid.addEventListener('ended', () => saveResumePos(msgId, 0));
    });

    messagesViewport.querySelectorAll('.msg-bubble:not([data-v61-codes])').forEach((bubble) => {
      bubble.setAttribute('data-v61-codes', '1');
      if (bubble.querySelector('.voice-player, video, .game-visual-card')) return;
      const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) {
        if (n.parentElement && !n.parentElement.closest('.msg-meta, .msg-reply-quote, a, code, .copyable-code-chip')) {
          nodes.push(n);
        }
      }
      nodes.forEach((tNode) => {
        const val = tNode.nodeValue || '';
        if (!/\b\d{4,8}\b/.test(val) || /\d{4}-\d{2}-\d{2}/.test(val)) return;
        const parts = val.split(/(\b\d{4,8}\b)/g);
        if (parts.length <= 1 || !tNode.parentNode) return;
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (/^\d{4,8}$/.test(part)) {
            const chip = document.createElement('span');
            chip.className = 'copyable-code-chip';
            chip.title = 'Нажмите, чтобы скопировать код';
            chip.textContent = part;
            chip.addEventListener('click', (ev) => {
              ev.stopPropagation();
              haptic('medium');
              if (navigator.clipboard) {
                navigator.clipboard.writeText(part).catch(() => {});
              }
              showQuickToast('📋 Код скопирован', `${part} скопирован в буфер обмена`);
            });
            frag.appendChild(chip);
          } else if (part) {
            frag.appendChild(document.createTextNode(part));
          }
        });
        tNode.parentNode.replaceChild(frag, tNode);
      });
    });
  }

  const scrollBottomBtn = document.getElementById('scrollBottomBtn');
  let knownRowCountWhileBottom = 0;
  if (messagesViewport && scrollBottomBtn) {
    messagesViewport.addEventListener('scroll', () => {
      const dist = messagesViewport.scrollHeight - messagesViewport.scrollTop - messagesViewport.clientHeight;
      if (dist < 180) {
        knownRowCountWhileBottom = messagesViewport.querySelectorAll('.msg-row').length;
        scrollBottomBtn.textContent = '↓';
      }
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    const v61Obs = new MutationObserver(() => {
      requestAnimationFrame(() => {
        bindMediaResumeAndCodesV61();
        if (scrollBottomBtn && messagesViewport) {
          const totalRows = messagesViewport.querySelectorAll('.msg-row').length;
          const dist = messagesViewport.scrollHeight - messagesViewport.scrollTop - messagesViewport.clientHeight;
          if (dist >= 180 && knownRowCountWhileBottom > 0 && totalRows > knownRowCountWhileBottom) {
            const diff = totalRows - knownRowCountWhileBottom;
            scrollBottomBtn.textContent = `↓ ${diff}`;
          } else {
            knownRowCountWhileBottom = totalRows;
          }
        }
      });
    });
    v61Obs.observe(messagesViewport, { childList: true });
    bindMediaResumeAndCodesV61();
  }

  if (lightbox && lightboxImg && 'MutationObserver' in window) {
    const preloadObs = new MutationObserver(() => {
      if (lightbox.classList.contains('hidden') || galleryUrls.length <= 1) return;
      const nextUrl = galleryUrls[(galleryIndex + 1) % galleryUrls.length];
      const prevUrl = galleryUrls[(galleryIndex - 1 + galleryUrls.length) % galleryUrls.length];
      [nextUrl, prevUrl].forEach((u) => {
        if (u) {
          const pre = new Image();
          pre.src = u;
        }
      });
    });
    preloadObs.observe(lightboxImg, { attributes: true, attributeFilter: ['src'] });
  }

  // =========================================================================
  // 15. ОБНОВЛЕНИЕ v62:
  // А) Защита от случайного закрытия вкладки во время активного звонка или записи кружочка/голосового
  // Б) Быстрое форматирование выделенного текста в поле ввода (Cmd+B / Ctrl+B жирный, Cmd+I / Ctrl+I курсив)
  // В) Перетаскивание увеличенного фото (Pan & Zoom) в полноэкранной галерее
  // Г) Отображение количества символов при наборе длинного сообщения (> 200 симв.)
  // =========================================================================

  // А) Предупреждение при случайном закрытии вкладки во время звонка или записи
  const callOverlayEl = document.getElementById('callOverlay');
  const recordingBarEl = document.getElementById('recordingBar');
  const videoCircleOverlayEl = document.getElementById('videoCircleOverlay');
  window.addEventListener('beforeunload', (e) => {
    const inCall = callOverlayEl && !callOverlayEl.classList.contains('hidden');
    const inVoiceRec = recordingBarEl && !recordingBarEl.classList.contains('hidden');
    const inVideoRec = videoCircleOverlayEl && !videoCircleOverlayEl.classList.contains('hidden');
    if (inCall || inVoiceRec || inVideoRec) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Б) Быстрое оборачивание выделенного текста в **жирный** (Cmd/Ctrl+B) или *курсив* (Cmd/Ctrl+I)
  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'i')) {
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        if (typeof start === 'number' && typeof end === 'number' && end > start) {
          e.preventDefault();
          const wrap = e.key.toLowerCase() === 'b' ? '**' : '*';
          const val = messageInput.value;
          const selected = val.slice(start, end);
          messageInput.value = val.slice(0, start) + wrap + selected + wrap + val.slice(end);
          messageInput.selectionStart = start + wrap.length;
          messageInput.selectionEnd = end + wrap.length;
          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });
  }

  // В) Двойной тап для зума 2.2x на фото в полноэкранной галерее
  let lbLastTap = 0;
  let lbZoomed = false;
  if (lightbox && lightboxImg) {
    lightboxImg.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lbLastTap < 280) {
        e.stopPropagation();
        haptic('light');
        lbZoomed = !lbZoomed;
        lightboxImg.style.transform = lbZoomed ? 'scale(2.2)' : 'scale(1)';
        lbLastTap = 0;
      } else {
        lbLastTap = now;
      }
    }, { passive: true });
  }

  // =========================================================================
  // 16. ОБНОВЛЕНИЕ v63:
  // А) Верхняя панель в полноэкранной галерее (🔍 Зум, 💾 Скачать, ✕ Закрыть) + зум колёсиком мыши
  // Б) Рисование маркером на фото перед отправкой (✏️ Маркер в окне предпросмотра)
  // В) Живой счётчик совпадений при поиске внутри диалога (Найдено: N)
  // Г) Счётчик символов при наборе длинного сообщения (от 200 символов)
  // =========================================================================

  // А) Панель инструментов в полноэкранной фотогалерее (#lightbox)
  let lbScale = 1;
  if (lightbox && lightboxImg) {
    const topBar = document.createElement('div');
    topBar.className = 'lb-top-toolbar';

    const zoomBtn = document.createElement('button');
    zoomBtn.type = 'button';
    zoomBtn.className = 'lb-tool-btn';
    zoomBtn.title = 'Увеличить / уменьшить фото';
    zoomBtn.textContent = '🔍';

    const dlBtn = document.createElement('button');
    dlBtn.type = 'button';
    dlBtn.className = 'lb-tool-btn';
    dlBtn.title = 'Скачать фото';
    dlBtn.textContent = '💾';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lb-tool-btn';
    closeBtn.title = 'Закрыть просмотр';
    closeBtn.textContent = '✕';

    zoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      haptic('light');
      lbScale = lbScale > 1.1 ? 1 : 2.2;
      lbZoomed = lbScale > 1.1;
      lightboxImg.style.transition = 'transform 0.18s ease';
      lightboxImg.style.transform = `scale(${lbScale})`;
    });

    dlBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      haptic('medium');
      const src = lightboxImg.src;
      if (!src) return;
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pulse_photo_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } catch (err) {
        const a = document.createElement('a');
        a.href = src;
        a.target = '_blank';
        a.download = `pulse_photo_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      haptic('light');
      lbScale = 1;
      lbZoomed = false;
      lightboxImg.style.transform = 'scale(1)';
      lightbox.classList.add('hidden');
    });

    lightbox.addEventListener('wheel', (e) => {
      if (lightbox.classList.contains('hidden')) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      lbScale = Math.min(3.2, Math.max(1, lbScale + delta));
      lbZoomed = lbScale > 1.1;
      lightboxImg.style.transition = 'transform 0.08s ease';
      lightboxImg.style.transform = `scale(${lbScale})`;
    }, { passive: false });

    topBar.appendChild(zoomBtn);
    topBar.appendChild(dlBtn);
    topBar.appendChild(closeBtn);
    lightbox.appendChild(topBar);
  }

  // Б) Рисование маркером на фото перед отправкой (✏️ Маркер + палитра цветов и сброс v64)
  const mediaPhotoTools = document.getElementById('mediaPhotoTools');
  let activeMarkerColor = '#ef4444';
  let originalPhotoBlobUrl = '';
  if (mediaPhotoTools && mediaPreviewImg) {
    const drawMarkerBtn = document.createElement('button');
    drawMarkerBtn.type = 'button';
    drawMarkerBtn.className = 'theme-pill';
    drawMarkerBtn.textContent = '✏️ Маркер';
    mediaPhotoTools.appendChild(drawMarkerBtn);

    const paletteBar = document.createElement('div');
    paletteBar.className = 'marker-palette-bar hidden';
    const colors = [
      { hex: '#ef4444', title: 'Красный маркер' },
      { hex: '#facc15', title: 'Жёлтый маркер' },
      { hex: '#10b981', title: 'Зелёный маркер' },
      { hex: '#38bdf8', title: 'Голубой маркер' }
    ];
    colors.forEach((c, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `marker-color-dot ${idx === 0 ? 'active' : ''}`;
      dot.style.background = c.hex;
      dot.title = c.title;
      dot.addEventListener('click', () => {
        haptic('light');
        activeMarkerColor = c.hex;
        paletteBar.querySelectorAll('.marker-color-dot').forEach((d) => d.classList.toggle('active', d === dot));
      });
      paletteBar.appendChild(dot);
    });

    const resetPhotoBtn = document.createElement('button');
    resetPhotoBtn.type = 'button';
    resetPhotoBtn.className = 'theme-pill';
    resetPhotoBtn.style.cssText = 'flex:0 0 auto; padding:4px 10px; font-size:11.5px;';
    resetPhotoBtn.textContent = '↩️ Сброс';
    resetPhotoBtn.addEventListener('click', () => {
      if (!originalPhotoBlobUrl) return;
      haptic('light');
      mediaPreviewImg.dataset.isEdited = '';
      mediaPreviewImg.src = originalPhotoBlobUrl;
    });
    paletteBar.appendChild(resetPhotoBtn);
    mediaPhotoTools.parentElement.insertBefore(paletteBar, mediaPhotoTools.nextSibling);

    let isDrawingMode = false;
    let isPointerDrawing = false;

    const resetMarkerMode = () => {
      isDrawingMode = false;
      drawMarkerBtn.classList.remove('active');
      drawMarkerBtn.textContent = '✏️ Маркер';
      paletteBar.classList.add('hidden');
      mediaPreviewImg.style.touchAction = '';
      mediaPreviewImg.style.cursor = '';
      setTimeout(() => {
        if (mediaPreviewImg.src && !mediaPreviewImg.dataset.isEdited) {
          originalPhotoBlobUrl = mediaPreviewImg.src;
        }
      }, 40);
    };

    if (attachmentInput) {
      attachmentInput.addEventListener('change', resetMarkerMode);
    }

    drawMarkerBtn.addEventListener('click', () => {
      if (!mediaPreviewImg.src || mediaPreviewImg.classList.contains('hidden')) return;
      if (!originalPhotoBlobUrl) originalPhotoBlobUrl = mediaPreviewImg.src;
      haptic('light');
      isDrawingMode = !isDrawingMode;
      drawMarkerBtn.classList.toggle('active', isDrawingMode);
      drawMarkerBtn.textContent = isDrawingMode ? '✏️ Рисуйте' : '✏️ Маркер';
      paletteBar.classList.toggle('hidden', !isDrawingMode);
      mediaPreviewImg.style.touchAction = isDrawingMode ? 'none' : '';
      mediaPreviewImg.style.cursor = isDrawingMode ? 'crosshair' : '';
    });

    let strokePoints = [];
    const getRelCoords = (ev) => {
      const rect = mediaPreviewImg.getBoundingClientRect();
      const clientX = ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches && ev.touches[0] ? ev.touches[0].clientY : ev.clientY;
      return {
        x: Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1))),
        y: Math.max(0, Math.min(1, (clientY - rect.top) / (rect.height || 1)))
      };
    };

    const commitStrokeToImage = () => {
      if (strokePoints.length < 2 || !mediaPreviewImg.src) return;
      const pts = [...strokePoints];
      strokePoints = [];
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = activeMarkerColor;
        ctx.lineWidth = Math.max(4, Math.round(Math.min(img.width, img.height) * 0.014));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x * img.width, pts[0].y * img.height);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * img.width, pts[i].y * img.height);
        }
        ctx.stroke();
        canvas.toBlob((blob) => {
          if (!blob) return;
          mediaPreviewImg.dataset.isEdited = '1';
          mediaPreviewImg.src = URL.createObjectURL(blob);
        }, 'image/jpeg', 0.92);
      };
      img.src = mediaPreviewImg.src;
    };

    mediaPreviewImg.addEventListener('pointerdown', (e) => {
      if (!isDrawingMode) return;
      e.preventDefault();
      isPointerDrawing = true;
      strokePoints = [getRelCoords(e)];
    });
    mediaPreviewImg.addEventListener('pointermove', (e) => {
      if (!isDrawingMode || !isPointerDrawing) return;
      e.preventDefault();
      strokePoints.push(getRelCoords(e));
    });
    const endDraw = () => {
      if (!isPointerDrawing) return;
      isPointerDrawing = false;
      commitStrokeToImage();
    };
    mediaPreviewImg.addEventListener('pointerup', endDraw);
    mediaPreviewImg.addEventListener('pointercancel', endDraw);
  }

  // В) Живой счётчик найденных сообщений и подсветка совпадений при поиске внутри диалога (#chatSearchBar)
  const chatSearchBarEl = document.getElementById('chatSearchBar');
  const chatSearchInputEl = document.getElementById('chatSearchInput');
  const chatSearchCloseBtnEl = document.getElementById('chatSearchCloseBtn');
  if (chatSearchBarEl && chatSearchInputEl && chatSearchCloseBtnEl) {
    const matchPill = document.createElement('span');
    matchPill.className = 'search-match-pill hidden';
    chatSearchBarEl.insertBefore(matchPill, chatSearchCloseBtnEl);

    const highlightSearchTermsInChat = (query) => {
      if (!messagesViewport || !query) return;
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      messagesViewport.querySelectorAll('.msg-bubble').forEach((bubble) => {
        if (bubble.querySelector('.voice-player, video, .game-visual-card')) return;
        const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT, null);
        const tNodes = [];
        let n;
        while ((n = walker.nextNode())) {
          if (n.parentElement && !n.parentElement.closest('.msg-meta, .msg-reply-quote, .search-hit-mark')) {
            tNodes.push(n);
          }
        }
        tNodes.forEach((tNode) => {
          const val = tNode.nodeValue || '';
          if (!regex.test(val)) return;
          regex.lastIndex = 0;
          const parts = val.split(regex);
          if (parts.length <= 1 || !tNode.parentNode) return;
          const frag = document.createDocumentFragment();
          parts.forEach((part, idx) => {
            if (idx % 2 === 1) {
              const mark = document.createElement('mark');
              mark.className = 'search-hit-mark';
              mark.textContent = part;
              frag.appendChild(mark);
            } else if (part) {
              frag.appendChild(document.createTextNode(part));
            }
          });
          tNode.parentNode.replaceChild(frag, tNode);
        });
      });
    };

    const updateSearchMatchCount = () => {
      const q = (chatSearchInputEl.value || '').trim();
      if (!q || chatSearchBarEl.classList.contains('hidden')) {
        matchPill.classList.add('hidden');
        return;
      }
      setTimeout(() => {
        const count = messagesViewport ? messagesViewport.querySelectorAll('.msg-row').length : 0;
        matchPill.textContent = `Найдено: ${count}`;
        matchPill.classList.remove('hidden');
        highlightSearchTermsInChat(q);
      }, 25);
    };

    chatSearchInputEl.addEventListener('input', updateSearchMatchCount);
    chatSearchCloseBtnEl.addEventListener('click', () => matchPill.classList.add('hidden'));
  }

  // Г) Компактный счётчик длины текста при наборе длинного сообщения (от 200 символов)
  const composerFooter = document.querySelector('footer.composer');
  if (messageInput && composerFooter) {
    const charBadge = document.createElement('div');
    charBadge.className = 'composer-char-badge hidden';
    composerFooter.appendChild(charBadge);

    const syncCharBadge = () => {
      const len = (messageInput.value || '').length;
      if (len >= 200) {
        charBadge.textContent = `${len} симв.`;
        charBadge.classList.remove('hidden');
      } else {
        charBadge.classList.add('hidden');
      }
    };
    messageInput.addEventListener('input', syncCharBadge);
  }

  // =========================================================================
  // 17. ОБНОВЛЕНИЕ v64:
  // А) Быстрая вставка скриншотов и изображений в чат прямо из буфера обмена (Cmd+V / Ctrl+V)
  // Б) Палитра из 4 цветов маркера (🔴 🟡 🟢 🔵) и кнопка «↩️ Сброс» при рисовании на фото
  // В) Подсветка найденного слова жёлтым маркером внутри сообщений при поиске по чату
  // Г) Переключение камеры по двойному тапу на видеокружочек во время записи
  // =========================================================================

  // А) Отправка скриншотов и картинок из буфера обмена (Cmd+V / Ctrl+V / Вставить)
  const activeChatViewEl = document.getElementById('activeChatView');
  window.addEventListener('paste', (e) => {
    if (!activeChatViewEl || activeChatViewEl.classList.contains('hidden') || !attachmentInput) return;
    const cd = e.clipboardData;
    if (!cd) return;
    let pastedFile = null;
    if (cd.files && cd.files.length > 0) {
      pastedFile = cd.files[0];
    } else if (cd.items) {
      for (let i = 0; i < cd.items.length; i++) {
        const item = cd.items[i];
        if (item.kind === 'file') {
          pastedFile = item.getAsFile();
          break;
        }
      }
    }
    if (!pastedFile) return;
    e.preventDefault();
    haptic('medium');
    try {
      const dt = new DataTransfer();
      dt.items.add(pastedFile);
      attachmentInput.files = dt.files;
      attachmentInput.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (err) {}
  });

  // Г) Двойной тап по превью видеокружочка во время записи -> быстрое переключение камеры
  const vcPreviewEl = document.getElementById('videoCirclePreview');
  const vcFlipBtnEl = document.getElementById('vcFlipCamBtn');
  let lastVcTap = 0;
  if (vcPreviewEl && vcFlipBtnEl) {
    vcPreviewEl.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastVcTap < 300) {
        e.preventDefault();
        haptic('light');
        vcFlipBtnEl.click();
        lastVcTap = 0;
      } else {
        lastVcTap = now;
      }
    }, { passive: false });
    vcPreviewEl.addEventListener('dblclick', () => {
      haptic('light');
      vcFlipBtnEl.click();
    });
  }

  // =========================================================================
  // 18. ОБНОВЛЕНИЕ v65:
  // А) Автоматическое сворачивание очень длинных сообщений (> 650 символов) с кнопкой «Показать полностью ▾ / Свернуть ▴»
  // Б) Интерактивные теги @username внутри текста сообщений (тап по @username сразу ищет или открывает контакт)
  // В) Кнопка «📋 Копировать фото» в верхней панели полноэкранной галереи (#lightbox)
  // =========================================================================

  // А + Б) Сворачивание длинных текстов и кликабельные @username в пузырьках сообщений
  const searchInputSidebar = document.getElementById('searchInput');
  const mobileBackBtnEl = document.getElementById('mobileBackBtn');

  function decorateLongTextsAndMentionsV65() {
    if (!messagesViewport) return;
    messagesViewport.querySelectorAll('.msg-bubble:not([data-v65-ready])').forEach((bubble) => {
      bubble.setAttribute('data-v65-ready', '1');
      if (bubble.querySelector('.voice-player, video, .game-visual-card, .poll-card, .checklist-card')) return;

      // 1) Кликабельные упоминания @username
      const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT, null);
      const tNodes = [];
      let n;
      while ((n = walker.nextNode())) {
        if (n.parentElement && !n.parentElement.closest('.msg-meta, .msg-reply-quote, a, code, .mention-tag-chip')) {
          tNodes.push(n);
        }
      }
      tNodes.forEach((tNode) => {
        const val = tNode.nodeValue || '';
        if (!/(?:^|\s)@[a-zA-Z0-9_.]{3,28}\b/.test(val)) return;
        const parts = val.split(/(@[a-zA-Z0-9_.]{3,28}\b)/g);
        if (parts.length <= 1 || !tNode.parentNode) return;
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (/^@[a-zA-Z0-9_.]{3,28}$/.test(part)) {
            const chip = document.createElement('span');
            chip.className = 'mention-tag-chip';
            chip.title = `Найти или открыть диалог с ${part}`;
            chip.textContent = part;
            chip.addEventListener('click', (ev) => {
              ev.stopPropagation();
              haptic('light');
              if (window.innerWidth <= 768 && mobileBackBtnEl) {
                mobileBackBtnEl.click();
              }
              if (searchInputSidebar) {
                searchInputSidebar.value = part;
                searchInputSidebar.dispatchEvent(new Event('input', { bubbles: true }));
                searchInputSidebar.focus();
              }
              showQuickToast('🔎 Поиск контакта', `Ищем пользователя ${part}`);
            });
            frag.appendChild(chip);
          } else if (part) {
            frag.appendChild(document.createTextNode(part));
          }
        });
        tNode.parentNode.replaceChild(frag, tNode);
      });

      // 2) Аккуратное сворачивание очень длинных сообщений (> 650 символов)
      const textDivs = Array.from(bubble.children).filter(
        (el) =>
          el.tagName === 'DIV' &&
          !el.classList.contains('msg-meta') &&
          !el.classList.contains('msg-reply-quote') &&
          !el.classList.contains('msg-translation-box')
      );
      const bodyDiv = textDivs[textDivs.length - 1];
      if (bodyDiv && (bodyDiv.textContent || '').trim().length > 650) {
        bodyDiv.classList.add('msg-long-clamp');
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'msg-readmore-btn';
        toggleBtn.textContent = 'Показать полностью ▾';
        toggleBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          haptic('light');
          const clamped = bodyDiv.classList.toggle('msg-long-clamp');
          toggleBtn.textContent = clamped ? 'Показать полностью ▾' : 'Свернуть ▴';
        });
        const metaEl = bubble.querySelector('.msg-meta');
        if (metaEl) bubble.insertBefore(toggleBtn, metaEl);
        else bubble.appendChild(toggleBtn);
      }
    });
  }

  if (messagesViewport && 'MutationObserver' in window) {
    const v65Obs = new MutationObserver(() => {
      requestAnimationFrame(decorateLongTextsAndMentionsV65);
    });
    v65Obs.observe(messagesViewport, { childList: true });
    decorateLongTextsAndMentionsV65();
  }

  // В) Кнопка «📋» (Копировать фото или ссылку) в верхней панели полноэкранной галереи (#lightbox)
  if (lightbox && lightboxImg) {
    const topBar = lightbox.querySelector('.lb-top-toolbar');
    if (topBar) {
      const copyImgBtn = document.createElement('button');
      copyImgBtn.type = 'button';
      copyImgBtn.className = 'lb-tool-btn';
      copyImgBtn.title = 'Скопировать фото в буфер обмена';
      copyImgBtn.textContent = '📋';
      copyImgBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        haptic('medium');
        const src = lightboxImg.src;
        if (!src) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((res, rej) => {
              img.onload = res;
              img.onerror = rej;
              img.src = src;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            const pngBlob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
            if (pngBlob) {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
              showQuickToast('📋 Фото скопировано', 'Изображение скопировано в буфер обмена');
              return;
            }
          }
        } catch (err) {}
        if (navigator.clipboard) {
          navigator.clipboard.writeText(src).catch(() => {});
          showQuickToast('📋 Ссылка скопирована', 'Ссылка на фото скопирована в буфер обмена');
        }
      });
      topBar.insertBefore(copyImgBtn, topBar.lastElementChild);
    }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=65').then((reg) => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        });
      }).catch(() => {});
    });
  }
})();
