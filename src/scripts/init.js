document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error('App container not found');
    return;
  }

  const htmlContent = `<div class="bridge-app">
  <header class="app-header">
    <div class="app-header-left">
      <div class="chat-brand">
        <img class="app-logo" src="./src/Assets/Orion_logo.png" alt="Orion" />
        <h1 class="app-title">ORION</h1>
      </div>
      <div class="app-chat-info" id="appChatInfo">
        <button class="btn-back" id="backBtn" aria-label="Назад">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
          </svg>
        </button>
        <div class="app-chat-avatar" id="appChatAvatar"></div>
        <div class="app-chat-meta">
          <div class="app-chat-name" id="contactName">Виберіть контакт</div>
          <div class="app-chat-status" id="contactStatus">онлайн</div>
        </div>
      </div>
    </div>
    <div class="app-header-right">
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
  </header>
  <div class="main-layout">
  <!-- Sidebar з контактами -->
  <aside class="sidebar">

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

    <!-- Заголовок списку чатів -->
    <div class="chats-list-header">
      <h2>Повідомлення</h2>
    </div>

    <!-- Список чатів -->
    <div class="chats-list" id="chatsList">
      <!-- Чати динамічно додаватимуться тут -->
    </div>

    <!-- Розділи налаштувань (мобільна версія) -->
    <div class="settings-container" id="settingsContainerMobile">
      <!-- Розділи динамічно завантажуватимуться сюди -->
    </div>

    <!-- Меню профілю -->
    <div class="profile-menu-wrapper">
      <div class="bottom-nav">
        <div class="bottom-nav-indicator" aria-hidden="true"></div>
        <button class="bottom-nav-item active" id="navChats" title="Чати">
          <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M232.07,186.76a80,80,0,0,0-62.5-114.17A80,80,0,1,0,23.93,138.76l-7.27,24.71a16,16,0,0,0,19.87,19.87l24.71-7.27a80.39,80.39,0,0,0,25.18,7.35,80,80,0,0,0,108.34,40.65l24.71,7.27a16,16,0,0,0,19.87-19.86ZM62,159.5a8.28,8.28,0,0,0-2.26.32L32,168l8.17-27.76a8,8,0,0,0-.63-6,64,64,0,1,1,26.26,26.26A8,8,0,0,0,62,159.5Zm153.79,28.73L224,216l-27.76-8.17a8,8,0,0,0-6,.63,64.05,64.05,0,0,1-85.87-24.88A79.93,79.93,0,0,0,174.7,89.71a64,64,0,0,1,41.75,92.48A8,8,0,0,0,215.82,188.23Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
          </svg>
          <span>Чати</span>
        </button>
        <button class="bottom-nav-item" id="navCalls" title="Дзвінки">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"></path></svg>
          <span>Дзвінки</span>
        </button>
        <button class="bottom-nav-item" id="navSettings" title="Параметри">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path></svg>
          <span>Параметри</span>
        </button>
        <button class="bottom-nav-item" id="navGames" title="Міні-ігри">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M208,144H136V95.19a40,40,0,1,0-16,0V144H48a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V160A16,16,0,0,0,208,144ZM104,56a24,24,0,1,1,24,24A24,24,0,0,1,104,56ZM208,208H48V160H208v48Zm-40-96h32a8,8,0,0,1,0,16H168a8,8,0,0,1,0-16Z"></path></svg>
          <span>Ігри</span>
        </button>
        <button class="bottom-nav-item" id="navProfile" title="Профіль">
          <span class="nav-avatar" aria-hidden="true"></span>
          <span>Профіль</span>
        </button>
      </div>
    </div>
    <button class="nav-reveal-handle" id="navRevealHandle" aria-label="Показати меню" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
        <path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"></path>
      </svg>
    </button>
    <button class="nav-hide-handle" id="navHideHandle" aria-label="Приховати меню" type="button">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
        <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
      </svg>
    </button>
  </aside>

  <!-- Основна область чату -->
  <main class="chat-area">
    <div class="chat-container" id="chatContainer">
      <div class="chat-modal-header">
        <div class="chat-modal-header-left">
          <button class="btn-back" id="chatBackBtn" aria-label="Назад">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
            </svg>
          </button>
          <div class="app-chat-info" id="chatModalInfo">
            <div class="app-chat-avatar" id="chatModalAvatar"></div>
            <div class="app-chat-meta">
              <div class="app-chat-name" id="chatModalName">Виберіть контакт</div>
              <div class="app-chat-status" id="chatModalStatus"></div>
            </div>
          </div>
        </div>
        <div class="chat-modal-header-right">
          <button class="btn-icon" id="chatModalCallBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </button>
          <button class="btn-icon" id="chatModalHistoryBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0z" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="chat-menu-wrapper">
            <button class="btn-icon" id="chatModalMenuBtn" aria-haspopup="true" aria-expanded="false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="12" cy="5" r="1" fill="currentColor"/>
                <circle cx="12" cy="19" r="1" fill="currentColor"/>
              </svg>
            </button>
            <div class="chat-menu" id="chatModalMenu">
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-88a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z"></path>
            </svg>
          </button>
          <input type="file" id="galleryPickerInput" accept="image/*" hidden />
          <input type="file" id="cameraPickerInput" accept="image/*" capture="environment" hidden />
          <input type="file" id="filePickerInput" accept="image/*" hidden />
          <textarea
            id="messageInput"
            class="message-input"
            placeholder="Напишіть повідомлення..."
            rows="1"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="none"
            spellcheck="false"
            inputmode="text"
            enterkeyhint="send"
          ></textarea>
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

    <!-- Розділи налаштувань -->
    <div class="settings-container" id="settingsContainer">
      <!-- Розділи динамічно завантажуватимуться сюди -->
    </div>
  </main>
  </div>
</div>

<!-- Sidebar overlay для мобільного -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- Mobile attach sheet -->
<div class="attach-sheet-overlay" id="attachSheetOverlay" aria-hidden="true">
  <div class="attach-sheet" id="attachSheet" role="dialog" aria-modal="true" aria-label="Меню вкладень">
    <div class="attach-sheet-handle" aria-hidden="true"></div>
    <div class="attach-sheet-grid">
      <button type="button" class="attach-sheet-item" data-attach-action="gallery">
        <span class="attach-sheet-icon gallery" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V152l-38.34-38.34a16,16,0,0,0-22.63,0L120,148.69,94.34,123a16,16,0,0,0-22.63,0L40,154.69ZM216,200H40V177.31l43-43L108.69,160a16,16,0,0,0,22.62,0L166.34,125,216,174.69V200ZM92,96A12,12,0,1,1,80,84,12,12,0,0,1,92,96Z"></path>
          </svg>
        </span>
        <span class="attach-sheet-label">Галерея</span>
      </button>
      <button type="button" class="attach-sheet-item" data-attach-action="camera">
        <span class="attach-sheet-icon camera" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,64H176L163.58,45.37A8,8,0,0,0,156.92,40H99.08a8,8,0,0,0-6.66,3.37L80,64H40A16,16,0,0,0,24,80V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM128,176a40,40,0,1,1,40-40A40,40,0,0,1,128,176Zm0-64a24,24,0,1,0,24,24A24,24,0,0,0,128,112Z"></path>
          </svg>
        </span>
        <span class="attach-sheet-label">Камера</span>
      </button>
      <button type="button" class="attach-sheet-item" data-attach-action="file">
        <span class="attach-sheet-icon file" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
            <path d="M213.66,82.34l-40-40A8,8,0,0,0,168,40H72A16,16,0,0,0,56,56V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V88A8,8,0,0,0,197.66,82.34ZM168,56l24,24H168ZM72,200V56h80V88a16,16,0,0,0,16,16h16V200Z"></path>
          </svg>
        </span>
        <span class="attach-sheet-label">Файл</span>
      </button>
      <button type="button" class="attach-sheet-item" data-attach-action="location">
        <span class="attach-sheet-icon location" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,16A88.1,88.1,0,0,0,40,104c0,87.06,77.9,131.78,81.21,133.64a8,8,0,0,0,7.58,0C132.1,235.78,210,191.06,210,104A88.1,88.1,0,0,0,128,16Zm0,203.13C111.63,208.85,56,168.08,56,104a72,72,0,0,1,144,0C200,168.08,144.37,208.85,128,219.13ZM128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path>
          </svg>
        </span>
        <span class="attach-sheet-label">Локація</span>
      </button>
    </div>
    <button type="button" class="attach-sheet-cancel" id="attachSheetCancelBtn">Скасувати</button>
  </div>
</div>

<!-- Mobile custom camera -->
<div class="camera-capture-overlay" id="cameraCaptureOverlay" aria-hidden="true">
  <div class="camera-capture">
    <video id="cameraCaptureVideo" class="camera-capture-video" autoplay playsinline muted></video>
    <div class="camera-capture-top">
      <button type="button" class="camera-capture-btn ghost" id="cameraCloseBtn" aria-label="Закрити камеру">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
          <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66A8,8,0,0,1,50.34,194.34L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
        </svg>
      </button>
      <button type="button" class="camera-capture-btn ghost" id="cameraSwitchBtn" aria-label="Перемкнути камеру">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
          <path d="M208,56H157.77l-11.4-17.1A16,16,0,0,0,133.06,32H122.94a16,16,0,0,0-13.31,6.9L98.23,56H48A16,16,0,0,0,32,72V184a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A16,16,0,0,0,208,56ZM124,160a36,36,0,1,1,36-36A36,36,0,0,1,124,160Zm68.94-40a8,8,0,0,1,0,11.31l-20,20A8,8,0,0,1,161.63,140L168,133.66H152a56.06,56.06,0,0,1-56-56V72a8,8,0,0,1,16,0v5.66a40,40,0,0,0,40,40h16l-6.34-6.34a8,8,0,0,1,11.31-11.32Z"></path>
        </svg>
      </button>
    </div>
    <div class="camera-capture-bottom">
      <button type="button" class="camera-shutter-btn" id="cameraShutterBtn" aria-label="Зробити фото"></button>
    </div>
  </div>
</div>

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
<div class="message-menu-backdrop" id="messageMenuBackdrop" aria-hidden="true"></div>
<div class="message-menu" id="messageMenu" aria-hidden="true">
  <div class="message-menu-date" id="messageMenuDate"></div>
  <button class="message-menu-item" id="messageMenuReply">
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M224,128a8,8,0,0,1-8,8H91.31l34.35,34.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48a8,8,0,0,1,11.32,11.32L91.31,120H216A8,8,0,0,1,224,128Z"></path>
    </svg>
    <span>Відповісти</span>
  </button>
  <button class="message-menu-item" id="messageMenuEdit">
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96A16,16,0,0,0,227.31,73.37ZM92.69,208H48V163.31L136,75.31,180.69,120Z"></path>
    </svg>
    <span>Редагувати</span>
  </button>
  <button class="message-menu-item" id="messageMenuDelete">
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16Z"></path>
    </svg>
    <span>Видалити</span>
  </button>
  <button class="message-menu-item" id="messageMenuCopy">
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M216,40H120A16,16,0,0,0,104,56V80H80A16,16,0,0,0,64,96V216a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V192h24a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Z"></path>
    </svg>
    <span>Копіювати</span>
  </button>
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
