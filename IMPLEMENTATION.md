# Інструкція по впровадженню змін

Щоб відновити всі зміни, виконайте наступні кроки вручну:

## 1. У файлі src/scripts/app.js

### Замініть template 'messenger-settings' (біля рядка 1769):

Старий код з `<h3>Сповіщення</h3>` замініть на:

```javascript
      'messenger-settings': `
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
          <p class="settings-item-desc">Звуки, вібрація, preview</p>
        </div>
        <span class="settings-menu-arrow">›</span>
      </div>
      <!-- Додайте ще 4 пункти меню для privacy, messages, appearance, language -->
    </div>
  </div>
</div>
      `.trim(),
```

### Додайте 5 нових templates після 'messenger-settings':

- 'notifications-settings'
- 'privacy-settings'
- 'messages-settings'
- 'appearance-settings' (з fontSizeSlider)
- 'language-settings'

### Додайте метод showSettingsSubsection після showSettings:

```javascript
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
```

### Додайте метод updateFontPreview:

```javascript
updateFontPreview(fontSize, displayElement, previewElement) {
  const fontSizeLabels = {
    12: 'Малий', 13: 'Малий', 14: 'Малий',
    15: 'Середній', 16: 'Середній',
    17: 'Великий', 18: 'Великий', 19: 'Великий', 20: 'Великий'
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
```

## 2. У файлі src/styles/settings.css

Видаліть всі `transition:` та `animation:` властивості
Видаліть `@keyframes` блоки

## 3. Додайте нові стилі в settings.css:

```css
.settings-menu-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--bg-color);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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

.settings-menu-item:hover {
  background: var(--bg-secondary);
}

.settings-menu-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-color-dark)
  );
}
```

Файл готовий для ручного впровадження змін.
