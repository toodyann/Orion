// Шаблони налаштувань для Orion

export const settingsTemplates = {
  'profile': `
<div class="settings-section" id="profile">
  <div class="settings-header">
    <h2>Мій профіль</h2>
  </div>

  <div class="settings-content">
    <div class="profile-avatar-section">
      <div class="profile-avatar-large">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M12 14c-5 0-8 2.5-8 5v4h16v-4c0-2.5-3-5-8-5z" />
        </svg>
      </div>
    </div>

    <div class="form-group">
      <label>Ім'я:</label>
      <p id="profileName" style="font-weight: 600; color: var(--text-primary);">Користувач Orion</p>
    </div>

    <div class="form-group">
      <label>Email:</label>
      <p id="profileEmail" style="color: var(--text-secondary);">user@example.com</p>
    </div>

    <div class="form-group">
      <label>Статус:</label>
      <p id="profileStatus" style="color: var(--text-secondary);">Онлайн</p>
    </div>

    <div class="form-group">
      <label>Біографія:</label>
      <p id="profileBio" style="color: var(--text-secondary); white-space: pre-wrap;">Добро пожалувати!</p>
    </div>

    <button class="btn btn-primary" style="width: 100%; margin-top: 16px;">Редагувати профіль</button>
  </div>
</div>
  `.trim(),

  'profile-settings': `
<div class="settings-section" id="profile-settings">
  <div class="settings-header">
    <h2>Налаштування профілю</h2>
  </div>

  <div class="settings-content">
    <div class="profile-avatar-section">
      <div class="profile-avatar-large">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M12 14c-5 0-8 2.5-8 5v4h16v-4c0-2.5-3-5-8-5z" />
        </svg>
      </div>
      <button class="btn btn-primary btn-change-avatar">Змінити аватар</button>
    </div>

    <div class="form-group">
      <label for="profileName">Ім'я:</label>
      <input
        type="text"
        id="profileName"
        class="form-input"
        placeholder="Введіть ваше ім'я"
        value="Користувач Orion"
      />
    </div>

    <div class="form-group">
      <label for="profileEmail">Email:</label>
      <input
        type="email"
        id="profileEmail"
        class="form-input"
        placeholder="example@email.com"
        value="user@example.com"
      />
    </div>

    <div class="form-group">
      <label for="profileStatus">Статус:</label>
      <input
        type="text"
        id="profileStatus"
        class="form-input"
        placeholder="Ваш статус"
        value="Доступний"
      />
    </div>

    <div class="form-group">
      <label for="profileBio">Біографія:</label>
      <textarea
        id="profileBio"
        class="form-textarea"
        placeholder="Розкажіть про себе"
        rows="4"
      >Привіт! Я користувач Orion месенджера.</textarea>
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-profile">Зберегти зміни</button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
  `.trim(),

  'messenger-settings': `
<div class="settings-section" id="messenger-settings">
  <div class="settings-header">
    <button class="btn-back-settings">‹</button>
    <h2>Налаштування</h2>
  </div>

  <div class="settings-content">
    <div class="settings-menu-list">
      <div class="settings-menu-item" data-section="notifications">
        <div class="settings-menu-icon settings-icon-notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-menu-label">
          <span>Сповіщення</span>
          <p class="settings-item-desc">Звуки, вібрація, попередній перегляд</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="privacy">
        <div class="settings-menu-icon settings-icon-privacy">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" stroke-width="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="settings-menu-label">
          <span>Конфіденційність</span>
          <p class="settings-item-desc">Статус онлайн, індикатор набору</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="messages">
        <div class="settings-menu-icon settings-icon-messages">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="settings-menu-label">
          <span>Повідомлення</span>
          <p class="settings-item-desc">Відправка, автовідтворення медіа</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="appearance">
        <div class="settings-menu-icon settings-icon-appearance">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="settings-menu-label">
          <span>Інтерфейс</span>
          <p class="settings-item-desc">Розмір шрифту, тема, анімації</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="language">
        <div class="settings-menu-icon settings-icon-language">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="settings-menu-label">
          <span>Мова</span>
          <p class="settings-item-desc">Українська</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>
    </div>
  </div>
</div>
  `.trim(),

  'notifications-settings': `
<div class="settings-section" id="notifications-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">‹</button>
    <h2>Сповіщення</h2>
  </div>

  <div class="settings-content">
    <div class="settings-group">
      <div class="settings-item">
        <div class="settings-item-label">
          <span>Звукові сповіщення</span>
          <p class="settings-item-desc">Відтворювати звук при новому повідомленні</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="soundNotifications" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Десктоп сповіщення</span>
          <p class="settings-item-desc">Показувати сповіщення на робочому столі</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="desktopNotifications" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Вібрація</span>
          <p class="settings-item-desc">Вібрувати при отриманні повідомлення</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="vibrationEnabled" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Попередній перегляд</span>
          <p class="settings-item-desc">Показувати текст повідомлення в сповіщенні</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="messagePreview" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-messenger">Зберегти налаштування</button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
  `.trim(),

  'privacy-settings': `
<div class="settings-section" id="privacy-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">‹</button>
    <h2>Конфіденційність</h2>
  </div>

  <div class="settings-content">
    <div class="settings-group">
      <div class="settings-item">
        <div class="settings-item-label">
          <span>Показувати статус онлайн</span>
          <p class="settings-item-desc">Дозволити іншим бачити, коли ви онлайн</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="showOnlineStatus" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Показувати індикатор набору</span>
          <p class="settings-item-desc">Показувати, коли ви набираєте повідомлення</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="showTypingIndicator" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Підтвердження прочитання</span>
          <p class="settings-item-desc">Відправляти підтвердження прочитання повідомлень</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="readReceipts" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Останній раз в мережі</span>
          <p class="settings-item-desc">Показувати час останнього входу</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="lastSeen" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-messenger">Зберегти налаштування</button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
  `.trim(),

  'messages-settings': `
<div class="settings-section" id="messages-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">‹</button>
    <h2>Повідомлення</h2>
  </div>

  <div class="settings-content">
    <div class="settings-group">
      <div class="settings-item">
        <div class="settings-item-label">
          <span>Enter для відправки</span>
          <p class="settings-item-desc">Натискання Enter відправляє повідомлення</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="enterToSend" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Автовідтворення медіа</span>
          <p class="settings-item-desc">Автоматично відтворювати відео та GIF</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="autoPlayMedia" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Автозбереження медіа</span>
          <p class="settings-item-desc">Автоматично зберігати отримані фото та відео</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="autoSaveMedia" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-messenger">Зберегти налаштування</button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
  `.trim(),

  'appearance-settings': `
<div class="settings-section" id="appearance-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">‹</button>
    <h2>Інтерфейс</h2>
  </div>

  <div class="settings-content">
    <div class="settings-group">
      <div class="settings-item settings-item-column">
        <div class="settings-item-label">
          <span>Розмір шрифту</span>
          <p class="settings-item-desc">Виберіть зручний розмір шрифту</p>
        </div>
        <div class="font-size-slider-container">
          <div class="font-size-labels">
            <span class="font-label">A</span>
            <span class="font-label-large">A</span>
          </div>
          <div class="font-size-slider-wrapper">
            <input type="range" id="fontSizeSlider" class="font-size-slider" min="12" max="20" value="15" step="1" />
          </div>
          <div class="font-size-value">
            <span id="fontSizeDisplay">Середній</span>
          </div>
        </div>
        <div class="font-preview" id="fontPreview">
          <div class="preview-message">
            <div class="preview-bubble">
              <p>Це приклад повідомлення</p>
              <span class="preview-time">12:34</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Тема оформлення</span>
          <p class="settings-item-desc">Вибір між світлою та темною темою</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="themeToggleCheckbox" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Анімації</span>
          <p class="settings-item-desc">Увімкнути анімації інтерфейсу</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="animationsEnabled" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Компактний режим</span>
          <p class="settings-item-desc">Зменшити відступи між елементами</p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="compactMode" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-messenger">Зберегти налаштування</button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
  `.trim(),

  'language-settings': `
<div class="settings-section" id="language-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">‹</button>
    <h2>Мова</h2>
  </div>

  <div class="settings-content">
    <div class="settings-group">
      <div class="settings-item">
        <div class="settings-item-label">
          <span>Мова інтерфейсу</span>
          <p class="settings-item-desc">Виберіть мову інтерфейсу додатку</p>
        </div>
        <select class="form-select" id="language">
          <option value="uk" selected>Українська</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-messenger">Зберегти налаштування</button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
  `.trim(),

  'calls': `
<div class="settings-section" id="calls">
  <div class="settings-header">
    <h2>Дзвінки</h2>
  </div>

  <div class="settings-content">
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z" fill="currentColor"/>
      </svg>
      <h3>Немає дзвінків</h3>
      <p>Поки що історія дзвінків порожня. Зробіть перший дзвінок контакту!</p>
    </div>
  </div>
</div>
  `.trim()
};

export function getSettingsTemplate(sectionName) {
  return settingsTemplates[sectionName] || '';
}
