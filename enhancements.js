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

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=22').then((reg) => {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update().catch(() => {});
        });
      }).catch(() => {});
    });
  }
})();
