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
    if (iosHapticLabel) {
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

  // 6. QR-визитка профиля в Настройках
  if (showQrCardBtn && qrInviteModal) {
    showQrCardBtn.addEventListener('click', () => {
      haptic('light');
      if (qrHandleLabel && myHandle) {
        qrHandleLabel.textContent = myHandle.textContent || '@username';
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
    Array.from(messagesViewport.querySelectorAll('.msg-row')).forEach((row) => {
      const bubble = row.querySelector('.msg-bubble');
      if (!bubble) return;

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
    v23Obs.observe(messagesViewport, { childList: true, subtree: true });
    processV23DeepBubbles();
  }


  // 10. Фоновый Keep-Alive для iPhone PWA (чтобы iOS не усыпляла сокет и пуши при переключении в Safari)
  let bgKeepAliveStarted = false;
  function startIosBackgroundKeepAlive() {
    if (bgKeepAliveStarted) return;
    bgKeepAliveStarted = true;
    try {
      // Генерируем 1 секунду абсолютно тихого (нулевого) WAV-аудио в памяти
      const sampleRate = 8000;
      const numSamples = sampleRate;
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);
      const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
      writeStr(0, "RIFF");
      view.setUint32(4, 36 + numSamples * 2, true);
      writeStr(8, "WAVEfmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeStr(36, "data");
      view.setUint32(40, numSamples * 2, true);
      const blob = new Blob([buffer], { type: "audio/wav" });
      const silentAudio = document.createElement("audio");
      silentAudio.src = URL.createObjectURL(blob);
      silentAudio.loop = true;
      silentAudio.volume = 0.01;
      silentAudio.setAttribute("playsinline", "");
      silentAudio.style.display = "none";
      document.body.appendChild(silentAudio);
      silentAudio.play().catch(() => {});
    } catch (e) {}
  }

  window.addEventListener("touchstart", startIosBackgroundKeepAlive, { once: true, passive: true });
  window.addEventListener("click", startIosBackgroundKeepAlive, { once: true });


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

  let lastEvaluatedIncomingText = '';
  function updateSmartQuickReplies() {
    if (!smartRepliesBar || !messagesViewport || !messageInput) return;
    const rows = Array.from(messagesViewport.querySelectorAll('.msg-row'));
    if (!rows.length) {
      smartRepliesBar.classList.add('hidden');
      return;
    }
    const lastRow = rows[rows.length - 1];
    if (lastRow.classList.contains('mine')) {
      smartRepliesBar.classList.add('hidden');
      return;
    }
    const bubble = lastRow.querySelector('.msg-bubble');
    if (!bubble) {
      smartRepliesBar.classList.add('hidden');
      return;
    }
    const rawText = (bubble.textContent || '').trim().toLowerCase();
    if (!rawText || rawText === lastEvaluatedIncomingText) return;
    lastEvaluatedIncomingText = rawText;

    let suggestions = [];
    if (rawText.includes('привет') || rawText.includes('здравствуй') || rawText.includes('добр')) {
      suggestions = ['Привет! 👋', 'Привет, как дела?', 'На связи! ✨'];
    } else if (rawText.includes('звонок') || rawText.includes('позвон') || rawText.includes('созвон')) {
      suggestions = ['Давай созвонимся 📞', 'Наберу через 5 мин', 'Сейчас не могу говорить'];
    } else if (rawText.includes('?')) {
      suggestions = ['👍 Да!', 'Сейчас гляну 👀', 'Ок, договорились 🤝', 'Чуть позже напишу'];
    } else if (rawText.length > 2) {
      suggestions = ['👍 Супер!', 'Понял, спасибо!', 'Ок 👌'];
    }

    if (!suggestions.length) {
      smartRepliesBar.classList.add('hidden');
      return;
    }

    smartRepliesBar.innerHTML = '';
    suggestions.forEach((txt) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'smart-reply-chip';
      chip.textContent = txt;
      chip.addEventListener('click', () => {
        smartRepliesBar.classList.add('hidden');
        messageInput.value = txt;
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        const sendBtn = document.getElementById('smartActionBtn');
        if (sendBtn) sendBtn.click();
      });
      smartRepliesBar.appendChild(chip);
    });
    smartRepliesBar.classList.remove('hidden');
  }

  if (messagesViewport && 'MutationObserver' in window) {
    const srObs = new MutationObserver(() => {
      requestAnimationFrame(updateSmartQuickReplies);
    });
    srObs.observe(messagesViewport, { childList: true });
  }
  if (messageInput) {
    messageInput.addEventListener('input', () => {
      if (messageInput.value.trim().length > 0 && smartRepliesBar) {
        smartRepliesBar.classList.add('hidden');
      }
    });
  }


  // В) Ускорение голосовых сообщений и видеокружочков (1x -> 1.5x -> 2x) + Карточки превью ссылок (v36)
  let currentVoiceSpeed = 1.0;
  function enhanceMediaAndLinksV36() {
    if (!messagesViewport) return;
    const bubbles = messagesViewport.querySelectorAll(".msg-bubble:not([data-v36-ready])");
    bubbles.forEach((bubble) => {
      bubble.setAttribute("data-v36-ready", "1");

      // 1) Кнопка скорости 1x / 1.5x / 2x рядом с голосовым сообщением
      const audioEl = bubble.querySelector("audio");
      if (audioEl && !bubble.querySelector(".audio-speed-pill")) {
        audioEl.playbackRate = currentVoiceSpeed;
        const speedPill = document.createElement("button");
        speedPill.type = "button";
        speedPill.className = "audio-speed-pill";
        speedPill.textContent = currentVoiceSpeed + "x";
        speedPill.title = "Скорость воспроизведения";
        speedPill.addEventListener("click", (e) => {
          e.stopPropagation();
          currentVoiceSpeed = currentVoiceSpeed === 1.0 ? 1.5 : currentVoiceSpeed === 1.5 ? 2.0 : 1.0;
          document.querySelectorAll(".msg-bubble audio").forEach((a) => { a.playbackRate = currentVoiceSpeed; });
          document.querySelectorAll(".audio-speed-pill").forEach((p) => { p.textContent = currentVoiceSpeed + "x"; });
        });
        audioEl.insertAdjacentElement("afterend", speedPill);
      }

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
    v36Obs.observe(messagesViewport, { childList: true, subtree: true });
    enhanceMediaAndLinksV36();
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=36').then((reg) => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        });
      }).catch(() => {});
    });
  }
})();
