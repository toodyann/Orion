// Обробники свайпів для мобільних пристроїв

/**
 * Налаштування свайпу для закриття чату
 * @param {ChatApp} app - Інстанс додатку
 */
export function setupMobileSwipeBack(app) {
  const chatContainer = document.getElementById('chatContainer');
  const sidebar = document.querySelector('.sidebar');
  const appEl = document.querySelector('.bridge-app');

  if (!chatContainer || !sidebar || !appEl) return;

  let startX = 0;
  let startY = 0;
  let dragging = false;
  let active = false;
  let lastTranslate = 0;

  const getMaxReveal = () => Math.min(window.innerWidth * 0.82, 320);

  const onStart = (e) => {
    if (window.innerWidth > 768 || !app.currentChat) return;
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    dragging = true;
    active = false;
    lastTranslate = 0;
  };

  const onMove = (e) => {
    if (!dragging || window.innerWidth > 768 || !app.currentChat) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (!active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) return; // Ignore swipe left
      active = true;
      chatContainer.classList.add('swiping');
      sidebar.classList.add('revealed');
    }

    const maxReveal = getMaxReveal();
    const distance = Math.min(Math.max(0, dx), maxReveal);
    lastTranslate = distance;

    chatContainer.style.transform = `translateX(${distance}px)`;
    sidebar.style.setProperty('--sidebar-reveal', `${distance}px`);

    if (active && !e.target.closest('#messagesContainer')) e.preventDefault();
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;

    if (!active) return;

    chatContainer.classList.remove('swiping');
    sidebar.classList.remove('revealed');

    const maxReveal = getMaxReveal();
    const shouldClose = lastTranslate > maxReveal * 0.35;

    if (shouldClose) {
      chatContainer.style.transform = '';
      sidebar.style.removeProperty('--sidebar-reveal');
      app.closeChat();
      return;
    }

    chatContainer.style.transform = '';
    sidebar.style.removeProperty('--sidebar-reveal');
  };

  chatContainer.addEventListener('touchstart', onStart, { passive: true });
  chatContainer.addEventListener('touchmove', onMove, { passive: false });
  chatContainer.addEventListener('touchend', onEnd);
  chatContainer.addEventListener('touchcancel', onEnd);
}

/**
 * Налаштування свайпу для повернення з підрозділу налаштувань
 * @param {HTMLElement} settingsContainer - Контейнер налаштувань
 * @param {ChatApp} app - Інстанс додатку
 */
export function setupSettingsSwipeBack(settingsContainer, app) {
  if (window.innerWidth > 768) return;

  let startX = 0;
  let startY = 0;
  let dragging = false;
  let active = false;
  let lastTranslate = 0;

  const onStart = (e) => {
    if (window.innerWidth > 768) return;
    if (e.touches.length !== 1) return;
    
    const target = e.target;
    if (target.closest('input[type="range"]') || 
        target.closest('.font-size-slider-wrapper') || 
        target.closest('.font-size-slider-container') || 
        target.closest('.toggle-switch') || 
        target.closest('select') || 
        target.closest('input')) {
      dragging = false;
      return;
    }
    
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    dragging = true;
    active = false;
    lastTranslate = 0;
  };

  const onMove = (e) => {
    if (!dragging || window.innerWidth > 768) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (!active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) return;
      active = true;
    }

    const maxReveal = window.innerWidth;
    const distance = Math.min(Math.max(0, dx), maxReveal);
    lastTranslate = distance;

    settingsContainer.style.transform = `translateX(${distance}px)`;

    if (active) e.preventDefault();
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;

    if (!active) return;

    const shouldGoBack = lastTranslate > window.innerWidth * 0.25;

    settingsContainer.style.transform = '';
    
    if (shouldGoBack) {
      app.showSettings('messenger-settings');
    }
  };

  const settingsSection = settingsContainer.querySelector('.settings-section');
  if (settingsSection) {
    settingsSection.addEventListener('touchstart', onStart, { passive: true });
    settingsSection.addEventListener('touchmove', onMove, { passive: false });
    settingsSection.addEventListener('touchend', onEnd);
    settingsSection.addEventListener('touchcancel', onEnd);
  }
}
