document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  const htmlContent = `<div class="bridge-app">
  <!-- Sidebar з контактами -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand">
        <img src="./src/Assets/Orion_logo.png" alt="Orion" class="app-logo">
        <h1 class="app-title">ORION</h1>
      </div>
    </div>

    <!-- Пошук контактів -->
    <div class="search-box">
      <input 
        type="text" 
        id="searchInput" 
        class="search-input" 
        placeholder="Пошук чатів..."
        autocomplete="off"
      >
      <button class="btn-new-chat" id="newChatBtn" aria-label="Новий чат">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.5 6.5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 19L14.65 14.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Список чатів -->
    <div class="chats-list" id="chatsList">
      <!-- Чати динамічно додаватимуться тут -->
    </div>

    <!-- Меню профілю -->
    <div class="profile-menu-wrapper">
      <button class="btn-profile" id="profileMenuBtn" title="Меню">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4"/>
          <path d="M12 14c-5 0-8 2.5-8 5v4h16v-4c0-2.5-3-5-8-5z"/>
        </svg>
      </button>
      
      <div class="profile-menu" id="profileMenu">
        <div class="profile-menu-header">
          <h3>Меню</h3>
          <button class="btn-close-menu" id="closeMenuBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <nav class="profile-menu-nav">
          <button class="menu-item" data-section="profile-settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Налаштування профілю</span>
          </button>
          <button class="menu-item" data-section="messenger-settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="19" cy="12" r="1" fill="currentColor"/>
              <circle cx="5" cy="12" r="1" fill="currentColor"/>
            </svg>
            <span>Налаштування месенджера</span>
          </button>
          <button class="menu-item" data-section="about">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Про додаток</span>
          </button>
          <button class="menu-item" data-section="help">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9 10c0-1.657 1.34-3 3-3s3 1.343 3 3c0 1-1 2-2 2.5M12 19v-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Допомога</span>
          </button>
        </nav>
      </div>
    </div>
  </aside>

  <!-- Основна область чату -->
  <main class="chat-area">
    <div class="chat-container" id="chatContainer">
      <!-- Заголовок чату -->
      <div class="chat-header" id="chatHeader">
        <div class="chat-header-left">
          <button class="btn-back" id="backBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="contact-info">
            <div class="avatar"></div>
            <div class="contact-details">
              <h2 id="contactName">Виберіть контакт</h2>
              <p id="contactStatus" class="status">онлайн</p>
            </div>
          </div>
        </div>
        <div class="chat-header-actions">
          <button class="btn-icon" id="callBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
          <button class="btn-icon" id="historyBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0z" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="chat-menu-wrapper">
            <button class="btn-icon" id="chatMenuBtn" aria-haspopup="true" aria-expanded="false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="12" cy="5" r="1" fill="currentColor"/>
                <circle cx="12" cy="19" r="1" fill="currentColor"/>
              </svg>
            </button>
            <div class="chat-menu" id="chatMenu">
              <button class="chat-menu-item" data-action="clear">Очистити чат</button>
              <button class="chat-menu-item" data-action="delete">Видалити чат</button>
              <button class="chat-menu-item" data-action="info">Інформація</button>
              <button class="chat-menu-item" data-action="group-info">Деталі групи</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Область повідомлень -->
      <div class="messages-container" id="messagesContainer">
        <!-- Повідомлення будуть додаватися динамічно -->
      </div>

      <!-- Поле введення повідомлення -->
      <div class="message-input-area">
        <div class="reply-bar" id="replyBar">
          <div class="reply-bar-content">
            <div class="reply-bar-label">Відповідь</div>
            <div class="reply-bar-text" id="replyBarText"></div>
          </div>
          <button class="reply-bar-close" id="replyBarClose" aria-label="Скасувати відповідь">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="input-wrapper">
          <button type="button" class="btn-icon btn-attach">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.5 2H2.5C1.12 2 0 3.12 0 4.5v15C0 20.88 1.12 22 2.5 22h19C22.88 22 24 20.88 24 19.5v-15C24 3.12 22.88 2 21.5 2zm-8 16h-5v-10h5v10zm8-14h-7v4h7v-4z" fill="currentColor"/>
            </svg>
          </button>
          <input 
            type="text" 
            id="messageInput" 
            class="message-input" 
            placeholder="Напишіть повідомлення..."
            autocomplete="off"
          >
          <button type="button" class="btn-emoji">😊</button>
          <button type="button" class="btn-send" id="sendBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.9702544,11.6889879 22.9702544,11.6889879 22.9702544,11.6889879 L4.13399899,2.89156808 C3.34915502,2.40289614 2.40734225,2.51449029 1.77946707,3.0857824 C0.994623095,3.89052102 0.837654326,4.98001571 1.15159189,5.76550319 L3.03521743,12.2065962 C3.03521743,12.3636936 3.34915502,12.5741566 3.50612381,12.5741566 L16.6915026,13.3596434 C16.6915026,13.3596434 17.1624089,13.3596434 17.1624089,12.9173502 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Екран привітання -->
    <div class="welcome-screen" id="welcomeScreen">
      <div class="welcome-content">
        <div class="welcome-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor"/>
          </svg>
        </div>
        <h2>Ласкаво просимо до Orion</h2>
        <p>Виберіть контакт зі списку, щоб почати спілкування</p>
      </div>
    </div>
  </main>
</div>

<!-- Sidebar overlay для мобільного -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- Модальне вікно для нового чату -->
<div class="modal" id="newChatModal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Новий чат</h3>
      <button class="btn-close" id="closeModalBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="modal-body">
      <input 
        type="text" 
        id="newContactInput" 
        class="contact-input" 
        placeholder="Ім'я контакту"
        autocomplete="off"
      >
      <label class="group-toggle">
        <input type="checkbox" id="isGroupToggle" />
        <span>Це група</span>
      </label>
      <div class="group-fields" id="groupFields">
        <input
          type="text"
          id="groupMembersInput"
          class="contact-input"
          placeholder="Учасники (через кому)"
          autocomplete="off"
        >
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="cancelBtn">Скасувати</button>
      <button class="btn btn-primary" id="confirmBtn">Створити</button>
    </div>
  </div>
</div>

<!-- Модальний фон -->
<div class="modal-overlay" id="modalOverlay"></div>

<!-- Custom alert/confirm modal -->
<div class="alert-overlay" id="alertOverlay" aria-hidden="true">
  <div class="alert-modal" role="dialog" aria-modal="true" aria-labelledby="alertTitle">
    <div class="alert-header">
      <h3 id="alertTitle">Повідомлення</h3>
      <button class="alert-close" id="alertCloseBtn" aria-label="Закрити">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="alert-body" id="alertMessage"></div>
    <div class="alert-actions">
      <button class="btn btn-secondary" id="alertCancelBtn">Скасувати</button>
      <button class="btn btn-primary" id="alertOkBtn">OK</button>
    </div>
  </div>
</div>

<!-- Group info modal -->
<div class="modal" id="groupInfoModal">
  <div class="modal-header">
    <h3>Деталі групи</h3>
    <button class="btn-close" id="closeGroupInfoBtn" aria-label="Закрити">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
  <div class="modal-body">
    <div class="group-info-header">
      <div class="group-avatar" id="groupInfoAvatar"></div>
      <div class="group-info-main">
        <div class="group-info-name" id="groupInfoName"></div>
        <div class="group-info-count" id="groupInfoCount"></div>
      </div>
    </div>
    <div class="group-info-section">
      <label class="group-info-label" for="groupInfoDescription">Опис</label>
      <textarea id="groupInfoDescription" class="group-info-textarea" rows="3" placeholder="Додайте опис групи..."></textarea>
    </div>
    <div class="group-info-section">
      <div class="group-info-label">Учасники</div>
      <ul class="group-info-members" id="groupInfoMembers"></ul>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" id="closeGroupInfoBtn2">Закрити</button>
    <button class="btn btn-primary" id="saveGroupInfoBtn">Зберегти</button>
  </div>
</div>

<!-- Message context menu -->
<div class="message-menu" id="messageMenu" aria-hidden="true">
  <div class="message-menu-date" id="messageMenuDate"></div>
  <button class="message-menu-item" id="messageMenuReply">Відповісти</button>
  <button class="message-menu-item" id="messageMenuEdit">Редагувати</button>
  <button class="message-menu-item" id="messageMenuDelete">Видалити</button>
  <button class="message-menu-item" id="messageMenuCopy">Копіювати</button>
</div>

<!-- Розділи налаштувань -->
<div class="settings-container" id="settingsContainer">
  <!-- Розділи динамічно завантажуватимуться сюди -->
</div>`;

  const extraUi = `
<!-- Chat list context menu -->
<div class="chat-list-menu" id="chatListMenu" aria-hidden="true">
  <button class="chat-list-menu-item" id="chatListMenuPin">Закріпити</button>
  <button class="chat-list-menu-item" id="chatListMenuDelete">Видалити чат</button>
  <button class="chat-list-menu-item" id="chatListMenuAddToGroup">Додати до групи</button>
</div>

<!-- Add to group modal -->
<div class="modal" id="addToGroupModal">
  <div class="modal-header">
    <h3>Додати до групи</h3>
    <button class="btn-close" id="closeAddToGroupBtn" aria-label="Закрити">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
  <div class="modal-body">
    <label class="group-info-label" for="addToGroupSelect">Група</label>
    <select id="addToGroupSelect" class="group-select"></select>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" id="cancelAddToGroupBtn">Скасувати</button>
    <button class="btn btn-primary" id="confirmAddToGroupBtn">Додати</button>
  </div>
</div>
`;

  appContainer.innerHTML = htmlContent + extraUi;
});
