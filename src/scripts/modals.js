// Модуль для роботи з модальними вікнами
export class ModalManager {
  static showAlert(message, title = 'Повідомлення') {
    const overlay = document.getElementById('alertOverlay');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const okBtn = document.getElementById('alertOkBtn');
    const cancelBtn = document.getElementById('alertCancelBtn');
    const closeBtn = document.getElementById('alertCloseBtn');

    if (!overlay || !titleEl || !messageEl || !okBtn || !cancelBtn || !closeBtn) {
      alert(message);
      return Promise.resolve();
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    cancelBtn.style.display = 'none';

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    return new Promise(resolve => {
      const cleanup = () => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        okBtn.removeEventListener('click', onOk);
        closeBtn.removeEventListener('click', onOk);
        overlay.removeEventListener('click', onOverlay);
        document.removeEventListener('keydown', onEnter);
      };
      const onOk = () => {
        cleanup();
        resolve();
      };
      const onOverlay = (e) => {
        if (e.target === overlay) onOk();
      };
      const onEnter = (e) => {
        if (e.key === 'Enter') onOk();
      };
      okBtn.addEventListener('click', onOk);
      closeBtn.addEventListener('click', onOk);
      overlay.addEventListener('click', onOverlay);
      document.addEventListener('keydown', onEnter);
    });
  }

  static showConfirm(message, title = 'Підтвердження') {
    const overlay = document.getElementById('alertOverlay');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const okBtn = document.getElementById('alertOkBtn');
    const cancelBtn = document.getElementById('alertCancelBtn');
    const closeBtn = document.getElementById('alertCloseBtn');

    if (!overlay || !titleEl || !messageEl || !okBtn || !cancelBtn || !closeBtn) {
      return Promise.resolve(confirm(message));
    }

    titleEl.textContent = title;
    messageEl.textContent = message;
    cancelBtn.style.display = 'inline-flex';

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');

    return new Promise(resolve => {
      const cleanup = () => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        closeBtn.removeEventListener('click', onCancel);
        overlay.removeEventListener('click', onOverlay);
        document.removeEventListener('keydown', onEnter);
      };
      const onOk = () => {
        cleanup();
        resolve(true);
      };
      const onCancel = () => {
        cleanup();
        resolve(false);
      };
      const onOverlay = (e) => {
        if (e.target === overlay) onCancel();
      };
      const onEnter = (e) => {
        if (e.key === 'Enter') onOk();
      };
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      closeBtn.addEventListener('click', onCancel);
      overlay.addEventListener('click', onOverlay);
      document.addEventListener('keydown', onEnter);
    });
  }
}
