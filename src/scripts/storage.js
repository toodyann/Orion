// Модуль для роботи з localStorage
export const Storage = {
  // Користувач
  loadUser() {
    const saved = localStorage.getItem('bridge_user');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: 'Користувач Orion',
      email: 'user@example.com',
      status: 'Доступний',
      bio: 'Привіт! Я користувач Orion месенджера.',
      avatarColor: 'linear-gradient(135deg, #ff9500, #ff6b6b)'
    };
  },

  saveUser(userData) {
    localStorage.setItem('bridge_user', JSON.stringify(userData));
  },

  // Налаштування
  loadSettings() {
    const saved = localStorage.getItem('bridge_settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      soundNotifications: true,
      desktopNotifications: true,
      showOnlineStatus: true,
      showTypingIndicator: true,
      fontSize: 'medium',
      theme: 'light'
    };
  },

  saveSettings(settingsData) {
    localStorage.setItem('bridge_settings', JSON.stringify(settingsData));
  },

  // Чати
  loadChats() {
    const stored = localStorage.getItem('bridge_chats');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  },

  saveChats(chats) {
    localStorage.setItem('bridge_chats', JSON.stringify(chats));
  },

  // Тема
  loadTheme() {
    const savedTheme = localStorage.getItem('bridge_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('bridge_theme', 'light');
    }
  },

  saveTheme(isDark) {
    localStorage.setItem('bridge_theme', isDark ? 'dark' : 'light');
  }
};
