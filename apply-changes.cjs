const fs = require('fs');
const path = require('path');

// Читаємо файл
const appJsPath = path.join(__dirname, 'src/scripts/app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// 1. Замінюємо messenger-settings template на Telegram-style
const oldMessengerSettings = `      'messenger-settings': \`
<div class="settings-section" id="messenger-settings">
  <div class="settings-header">
    <h2>Налаштування месенджера</h2>
  </div>

  <div class="settings-content">
    <div class="settings-group">
      <h3>Сповіщення</h3>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Звукові сповіщення</span>
          <p class="settings-item-desc">
            Відтворювати звук при новому повідомленні
          </p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="soundNotifications" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Десктоп сповіщення</span>
          <p class="settings-item-desc">
            Показувати сповіщення на робочому столі
          </p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="desktopNotifications" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-group">
      <h3>Конфіденційність</h3>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Показувати статус онлайн</span>
          <p class="settings-item-desc">
            Дозволити іншим бачити, коли ви онлайн
          </p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="showOnlineStatus" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Показувати індикатор набору</span>
          <p class="settings-item-desc">
            Показувати, коли користувач пише повідомлення
          </p>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="showTypingIndicator" checked />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-group">
      <h3>Інтерфейс</h3>

      <div class="settings-item">
        <div class="settings-item-label">
          <span>Розмір шрифту</span>
          <p class="settings-item-desc">Виберіть зручний розмір шрифту</p>
        </div>
        <select class="form-select" id="fontSize">
          <option value="small">Малий</option>
          <option value="medium" selected>Середній</option>
          <option value="large">Великий</option>
        </select>
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
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-messenger">
        Зберегти налаштування
      </button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
      \`.trim(),`;

const newMessengerSettings = `      'messenger-settings': \`
<div class="settings-section" id="messenger-settings">
  <div class="settings-header">
    <h2>Налаштування</h2>
  </div>

  <div class="settings-content">
    <div class="settings-menu-list">
      <div class="settings-menu-item" data-section="notifications">
        <div class="settings-menu-icon">📢</div>
        <div class="settings-menu-label">
          <span>Сповіщення</span>
          <p class="settings-item-desc">Звуки, вібрація, попередній перегляд</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="privacy">
        <div class="settings-menu-icon">🔒</div>
        <div class="settings-menu-label">
          <span>Конфіденційність</span>
          <p class="settings-item-desc">Статус онлайн, індикатор набору</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="messages">
        <div class="settings-menu-icon">💬</div>
        <div class="settings-menu-label">
          <span>Повідомлення</span>
          <p class="settings-item-desc">Відправка, автовідтворення медіа</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="appearance">
        <div class="settings-menu-icon">🎨</div>
        <div class="settings-menu-label">
          <span>Інтерфейс</span>
          <p class="settings-item-desc">Розмір шрифту, тема, анімації</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>

      <div class="settings-menu-item" data-section="language">
        <div class="settings-menu-icon">🌐</div>
        <div class="settings-menu-label">
          <span>Мова</span>
          <p class="settings-item-desc">Українська</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>
    </div>
  </div>
</div>
      \`.trim(),
      'notifications-settings': \`
<div class="settings-section" id="notifications-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">← Назад</button>
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
      \`.trim(),
      'privacy-settings': \`
<div class="settings-section" id="privacy-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">← Назад</button>
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
      \`.trim(),
      'messages-settings': \`
<div class="settings-section" id="messages-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">← Назад</button>
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
      \`.trim(),
      'appearance-settings': \`
<div class="settings-section" id="appearance-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">← Назад</button>
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
          <input type="range" id="fontSizeSlider" class="font-size-slider" min="12" max="20" value="15" step="1" />
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
      \`.trim(),
      'language-settings': \`
<div class="settings-section" id="language-settings">
  <div class="settings-header">
    <button class="btn-back-subsection">← Назад</button>
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
          <option value="ru">Русский</option>
        </select>
      </div>
    </div>

    <div class="settings-buttons">
      <button class="btn btn-primary btn-save-messenger">Зберегти налаштування</button>
      <button class="btn btn-secondary">Скасувати</button>
    </div>
  </div>
</div>
      \`.trim(),`;

content = content.replace(oldMessengerSettings, newMessengerSettings);

// 2. Додаємо методи після showSettings (знаходимо кінець методу)
const showSettingsEnd = '  async showSettings(sectionName) {';
const insertAfterShowSettings = `

  showSettingsSubsection(subsectionName, settingsContainerId) {
    const sectionMap = {
      'notifications': 'notifications-settings',
      'privacy': 'privacy-settings',
      'messages': 'messages-settings',
      'appearance': 'appearance-settings',
      'language': 'language-settings'
    };
    
    const sectionName = sectionMap[subsectionName];
    if (sectionName) {
      this.showSettings(sectionName);
    }
  }

  updateFontPreview(fontSize, displayElement, previewElement) {
    const fontSizeLabels = {
      12: 'Малий',
      13: 'Малий',
      14: 'Малий',
      15: 'Середній',
      16: 'Середній',
      17: 'Великий',
      18: 'Великий',
      19: 'Великий',
      20: 'Великий'
    };
    
    if (displayElement) {
      displayElement.textContent = fontSizeLabels[fontSize] || 'Середній';
    }
    
    if (previewElement) {
      const previewText = previewElement.querySelector('.preview-bubble p');
      const previewTime = previewElement.querySelector('.preview-time');
      
      if (previewText) {
        previewText.style.fontSize = fontSize + 'px';
      }
      if (previewTime) {
        previewTime.style.fontSize = Math.max(10, fontSize - 4) + 'px';
      }
    }
  }

  async showSettings(sectionName) {`;

// Знаходимо початок showSettings і додаємо методи перед ним
const showSettingsIndex = content.indexOf('  async showSettings(sectionName) {');
if (showSettingsIndex !== -1) {
  content = content.slice(0, showSettingsIndex) + insertAfterShowSettings + content.slice(showSettingsIndex + showSettingsEnd.length);
}

// 3. Оновлюємо обробники в showSettings для підменю
const oldMessengerHandler = `      if (sectionName === 'messenger-settings') {
        const soundNotif = settingsContainer.querySelector('#soundNotifications');
        const desktopNotif = settingsContainer.querySelector('#desktopNotifications');
        const onlineStatus = settingsContainer.querySelector('#showOnlineStatus');
        const typingIndic = settingsContainer.querySelector('#showTypingIndicator');
        const fontSizeSelect = settingsContainer.querySelector('#fontSize');
        
        if (soundNotif) soundNotif.checked = this.settings.soundNotifications;
        if (desktopNotif) desktopNotif.checked = this.settings.desktopNotifications;
        if (onlineStatus) onlineStatus.checked = this.settings.showOnlineStatus;
        if (typingIndic) typingIndic.checked = this.settings.showTypingIndicator;
        if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize;
      }`;

const newMessengerHandler = `      if (sectionName === 'messenger-settings') {
        // Додаємо обробники для кнопок-розділів
        const menuItems = settingsContainer.querySelectorAll('.settings-menu-item');
        menuItems.forEach(item => {
          item.addEventListener('click', () => {
            const subsection = item.getAttribute('data-section');
            if (subsection) {
              this.showSettingsSubsection(subsection, settingsContainerId);
            }
          });
        });
      }
      
      // Завантаження значень для підрозділів
      if (sectionName === 'notifications-settings') {
        const soundNotif = settingsContainer.querySelector('#soundNotifications');
        const desktopNotif = settingsContainer.querySelector('#desktopNotifications');
        const vibrationEnabled = settingsContainer.querySelector('#vibrationEnabled');
        const messagePreview = settingsContainer.querySelector('#messagePreview');
        
        if (soundNotif) soundNotif.checked = this.settings.soundNotifications ?? true;
        if (desktopNotif) desktopNotif.checked = this.settings.desktopNotifications ?? true;
        if (vibrationEnabled) vibrationEnabled.checked = this.settings.vibrationEnabled ?? true;
        if (messagePreview) messagePreview.checked = this.settings.messagePreview ?? true;
      }
      
      if (sectionName === 'privacy-settings') {
        const onlineStatus = settingsContainer.querySelector('#showOnlineStatus');
        const typingIndic = settingsContainer.querySelector('#showTypingIndicator');
        const readReceipts = settingsContainer.querySelector('#readReceipts');
        const lastSeen = settingsContainer.querySelector('#lastSeen');
        
        if (onlineStatus) onlineStatus.checked = this.settings.showOnlineStatus ?? true;
        if (typingIndic) typingIndic.checked = this.settings.showTypingIndicator ?? true;
        if (readReceipts) readReceipts.checked = this.settings.readReceipts ?? true;
        if (lastSeen) lastSeen.checked = this.settings.lastSeen ?? true;
      }
      
      if (sectionName === 'messages-settings') {
        const enterToSend = settingsContainer.querySelector('#enterToSend');
        const autoPlayMedia = settingsContainer.querySelector('#autoPlayMedia');
        const autoSaveMedia = settingsContainer.querySelector('#autoSaveMedia');
        
        if (enterToSend) enterToSend.checked = this.settings.enterToSend ?? true;
        if (autoPlayMedia) autoPlayMedia.checked = this.settings.autoPlayMedia ?? true;
        if (autoSaveMedia) autoSaveMedia.checked = this.settings.autoSaveMedia ?? false;
      }
      
      if (sectionName === 'appearance-settings') {
        const fontSizeSlider = settingsContainer.querySelector('#fontSizeSlider');
        const fontSizeDisplay = settingsContainer.querySelector('#fontSizeDisplay');
        const fontPreview = settingsContainer.querySelector('#fontPreview');
        const animationsEnabled = settingsContainer.querySelector('#animationsEnabled');
        const compactMode = settingsContainer.querySelector('#compactMode');
        
        if (fontSizeSlider) {
          const currentFontSize = this.settings.fontSize || 'medium';
          const fontSizeMap = { 'small': 13, 'medium': 15, 'large': 18 };
          const sliderValue = fontSizeMap[currentFontSize] || 15;
          fontSizeSlider.value = sliderValue;
          
          this.updateFontPreview(sliderValue, fontSizeDisplay, fontPreview);
          
          fontSizeSlider.addEventListener('input', (e) => {
            const fontSize = parseInt(e.target.value);
            this.updateFontPreview(fontSize, fontSizeDisplay, fontPreview);
          });
        }
        
        if (animationsEnabled) animationsEnabled.checked = this.settings.animationsEnabled ?? true;
        if (compactMode) compactMode.checked = this.settings.compactMode ?? false;
      }
      
      if (sectionName === 'language-settings') {
        const language = settingsContainer.querySelector('#language');
        if (language) language.value = this.settings.language || 'uk';
      }
      
      // Обробник кнопки назад для підрозділів
      const backSubsectionBtn = settingsContainer.querySelector('.btn-back-subsection');
      if (backSubsectionBtn) {
        backSubsectionBtn.addEventListener('click', () => {
          this.showSettings('messenger-settings');
        });
      }`;

content = content.replace(oldMessengerHandler, newMessengerHandler);

// 4. Оновлюємо saveMessengerSettings для slider
const oldSaveMessenger = `  async saveMessengerSettings() {
    const soundNotifications = document.getElementById('soundNotifications')?.checked ?? true;
    const desktopNotifications = document.getElementById('desktopNotifications')?.checked ?? true;
    const showOnlineStatus = document.getElementById('showOnlineStatus')?.checked ?? true;
    const showTypingIndicator = document.getElementById('showTypingIndicator')?.checked ?? true;
    const fontSize = document.getElementById('fontSize')?.value || 'medium';`;

const newSaveMessenger = `  async saveMessengerSettings() {
    const soundNotifications = document.getElementById('soundNotifications')?.checked ?? true;
    const desktopNotifications = document.getElementById('desktopNotifications')?.checked ?? true;
    const showOnlineStatus = document.getElementById('showOnlineStatus')?.checked ?? true;
    const showTypingIndicator = document.getElementById('showTypingIndicator')?.checked ?? true;
    const vibrationEnabled = document.getElementById('vibrationEnabled')?.checked ?? true;
    const messagePreview = document.getElementById('messagePreview')?.checked ?? true;
    const readReceipts = document.getElementById('readReceipts')?.checked ?? true;
    const lastSeen = document.getElementById('lastSeen')?.checked ?? true;
    const enterToSend = document.getElementById('enterToSend')?.checked ?? true;
    const autoPlayMedia = document.getElementById('autoPlayMedia')?.checked ?? true;
    const autoSaveMedia = document.getElementById('autoSaveMedia')?.checked ?? false;
    const animationsEnabled = document.getElementById('animationsEnabled')?.checked ?? true;
    const compactMode = document.getElementById('compactMode')?.checked ?? false;
    const language = document.getElementById('language')?.value || 'uk';
    
    // Отримуємо розмір шрифту з slider
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    let fontSize = 'medium';
    if (fontSizeSlider) {
      const sliderValue = parseInt(fontSizeSlider.value);
      if (sliderValue <= 14) fontSize = 'small';
      else if (sliderValue <= 16) fontSize = 'medium';
      else fontSize = 'large';
    } else {
      fontSize = document.getElementById('fontSize')?.value || 'medium';
    }`;

content = content.replace(oldSaveMessenger, newSaveMessenger);

// Додаємо нові поля в settings object
const oldSettingsObj = `    const settings = {
      soundNotifications,
      desktopNotifications,
      showOnlineStatus,
      showTypingIndicator,
      fontSize
    };`;

const newSettingsObj = `    const settings = {
      soundNotifications,
      desktopNotifications,
      showOnlineStatus,
      showTypingIndicator,
      vibrationEnabled,
      messagePreview,
      readReceipts,
      lastSeen,
      enterToSend,
      autoPlayMedia,
      autoSaveMedia,
      animationsEnabled,
      compactMode,
      language,
      fontSize
    };`;

content = content.replace(oldSettingsObj, newSettingsObj);

// Записуємо файл
fs.writeFileSync(appJsPath, content, 'utf8');

console.log('✓ app.js updated successfully');

// Тепер оновлюємо CSS
const cssPath = path.join(__dirname, 'src/styles/settings.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Видаляємо всі transition
cssContent = cssContent.replace(/\s*transition:[^;]+;/g, '');

// Видаляємо всі animation
cssContent = cssContent.replace(/\s*animation:[^;]+;/g, '');

// Видаляємо @keyframes блоки
cssContent = cssContent.replace(/@keyframes[^}]+\{[^}]+\}/g, '');

// Додаємо нові стилі для Telegram-style menu
const newCSSStyles = `
/* Telegram-style settings menu */
.settings-menu-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--bg-color);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

.settings-menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  gap: 14px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color);
}

.settings-menu-item:last-child {
  border-bottom: none;
}

.settings-menu-item:hover {
  background: var(--bg-secondary);
}

.settings-menu-item:active {
  background: var(--bg-secondary);
  opacity: 0.8;
}

.settings-menu-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.settings-menu-label {
  flex: 1;
  min-width: 0;
}

.settings-menu-label span {
  display: block;
  font-weight: 500;
  margin-bottom: 2px;
  font-size: 15px;
  color: var(--text-primary);
}

.settings-menu-arrow {
  color: var(--text-secondary);
  font-size: 20px;
  opacity: 0.5;
}

.btn-back-subsection {
  padding: 8px 12px;
  margin: 0;
  font-size: 16px;
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.settings-item-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-color);
  gap: 12px;
}

.font-size-slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.font-size-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.font-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.font-label-large {
  font-size: 20px;
  color: var(--text-secondary);
  font-weight: 600;
}

.font-size-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, 
    var(--primary-color) 0%, 
    var(--primary-color) 50%, 
    var(--border-color) 50%, 
    var(--border-color) 100%);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.font-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 3px solid var(--primary-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.font-size-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: 3px solid var(--primary-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.font-size-value {
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 4px;
}

.font-preview {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-top: 8px;
}

.preview-message {
  display: flex;
  justify-content: flex-end;
}

.preview-bubble {
  background: var(--primary-color);
  color: white;
  border-radius: 16px;
  padding: 10px 14px;
  max-width: 70%;
  position: relative;
}

.preview-bubble p {
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.preview-time {
  font-size: 11px;
  opacity: 0.7;
  display: block;
  text-align: right;
}
`;

// Додаємо нові стилі в кінець файлу
cssContent += newCSSStyles;

fs.writeFileSync(cssPath, cssContent, 'utf8');

console.log('✓ settings.css updated successfully');
console.log('✓ All changes applied successfully!');
