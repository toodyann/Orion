// Обробники свайпів для мобільних пристроїв

/**
 * Налаштування свайпу для закриття чату
 * @param {ChatApp} app - Інстанс додатку
 */
export function setupMobileSwipeBack(app) {
  const chatContainer = document.getElementById('chatContainer');
  const appRoot = document.querySelector('.bridge-app');
  if (!chatContainer) return;

  let startX = 0;
  let startY = 0;
  let dragging = false;
  let active = false;
  let lastTranslate = 0;

  const getMaxReveal = () => window.innerWidth;
  const CLOSE_THRESHOLD_RATIO = 0.35;
  const SNAP_BACK_DURATION_MS = 320;
  const CLOSE_DURATION_MS = 360;

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
      if (Math.abs(dx) < 8) return;
      if (Math.abs(dx) < Math.abs(dy)) {
        dragging = false;
        return;
      }
      if (dx < 0) return; // Ignore swipe left
      active = true;
      chatContainer.style.removeProperty('transition');
      chatContainer.style.willChange = 'transform';
      chatContainer.classList.add('swiping');
      if (appRoot) appRoot.classList.add('swipe-peek');
    }

    const maxReveal = getMaxReveal();
    const distance = Math.min(Math.max(0, dx), maxReveal);
    lastTranslate = distance;

    chatContainer.style.transform = `translateX(${distance}px)`;
    if (active) e.preventDefault();
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;

    if (!active) return;

    chatContainer.classList.remove('swiping');
    const shouldClose = lastTranslate >= window.innerWidth * CLOSE_THRESHOLD_RATIO;
    const targetX = shouldClose ? getMaxReveal() : 0;
    const duration = shouldClose ? CLOSE_DURATION_MS : SNAP_BACK_DURATION_MS;
    const easing = shouldClose
      ? 'cubic-bezier(0.2, 0.7, 0, 1)'
      : 'cubic-bezier(0.22, 1, 0.36, 1)';

    const finish = () => {
      chatContainer.style.removeProperty('transition');
      chatContainer.style.removeProperty('transform');
      chatContainer.style.removeProperty('will-change');
      if (appRoot) appRoot.classList.remove('swipe-peek');
      if (shouldClose) app.closeChat({ animate: false });
    };

    chatContainer.style.transition = `transform ${duration}ms ${easing}`;
    chatContainer.style.transform = `translate3d(${targetX}px, 0, 0)`;
    window.setTimeout(finish, duration + 20);
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
