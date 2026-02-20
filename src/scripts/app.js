// Імпорти модулів
import { getSettingsTemplate } from './templates.js';
import { setupMobileSwipeBack, setupSettingsSwipeBack } from './swipe-handlers.js';
import { 
  showAlert, 
  showConfirm, 
  setupEmojiPicker, 
  insertAtCursor, 
  escapeHtml, 
  getContactColor,
  formatMessageDateTime 
} from './ui-helpers.js';

class ChatApp {
  constructor() {
    this.chats = this.loadChats();
    this.currentChat = null;
    this.user = this.loadUserProfile();
    this.settings = this.loadSettings();
    this.editingMessageId = null;
    this.replyTarget = null;
    this.messageMenuState = { id: null, from: null, text: '' };
    this.chatListMenuState = { id: null, name: '' };
    this.addToGroupTarget = null;
    this.bottomNavHidden = false;
    this.navRevealTimeout = null;
    this.loadTheme();
    this.profileMenuPlaceholder = null;
    this.init();
  }

  loadUserProfile() {
    const saved = localStorage.getItem('bridge_user');
    if (saved) {
      const data = JSON.parse(saved);
      return {
        name: data.name || 'Користувач Orion',
        email: data.email || 'user@example.com',
        status: data.status || 'online',
        bio: data.bio || 'Вітаю!',
        birthDate: data.birthDate || '',
        avatarColor: data.avatarColor || '',
        avatarImage: data.avatarImage || ''
      };
    }
    return {
      name: 'Користувач Orion',
      email: 'user@example.com',
      status: 'online',
      bio: 'Вітаю!',
      birthDate: '',
      avatarColor: 'linear-gradient(135deg, #ff9500, #ff6b6b)',
      avatarImage: ''
    };
  }

  saveUserProfile(userData) {
    this.user = userData;
    localStorage.setItem('bridge_user', JSON.stringify(userData));
    this.updateProfileMenuButton();
    this.updateProfileDisplay();
  }

  updateProfileMenuButton() {
    const navProfile = document.getElementById('navProfile');
    if (!navProfile) return;

    const avatarEl = navProfile.querySelector('.nav-avatar');

    const name = this.user?.name || 'Користувач Orion';

    this.applyUserAvatarToElement(avatarEl, name);
  }

  getInitials(name) {
    return name
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRandomAvatarGradient() {
    const colors = [
      'linear-gradient(135deg, #ff9500, #ff6b6b)',
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #30cfd0, #330867)',
      'linear-gradient(135deg, #a8edea, #fed6e3)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  escapeAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  applyUserAvatarToElement(avatarEl, name = '') {
    if (!avatarEl) return;
    const displayName = name || this.user?.name || 'Користувач Orion';
    if (!this.user?.avatarColor) {
      this.user.avatarColor = this.getRandomAvatarGradient();
    }

    if (this.user?.avatarImage) {
      avatarEl.textContent = '';
      avatarEl.style.backgroundImage = `url("${this.escapeAttr(this.user.avatarImage)}")`;
      avatarEl.style.backgroundColor = 'transparent';
    } else {
      avatarEl.style.backgroundImage = '';
      avatarEl.textContent = this.getInitials(displayName);
      avatarEl.style.background = this.user.avatarColor || this.getContactColor(displayName);
    }
  }

  getUserAvatarHtml() {
    if (this.user?.avatarImage) {
      const safeUrl = this.escapeAttr(this.user.avatarImage);
      return `<div class="message-avatar is-image" style="background-image: url(&quot;${safeUrl}&quot;);"></div>`;
    }
    const initials = this.getInitials(this.user?.name || 'Користувач Orion');
    return `<div class="message-avatar" style="background: ${this.user.avatarColor}">${initials}</div>`;
  }

  renderProfileAvatar(avatarEl) {
    if (!avatarEl) return;
    const name = this.user?.name || 'Користувач Orion';
    if (!this.user?.avatarColor) {
      this.user.avatarColor = this.getRandomAvatarGradient();
    }
    const imageEl = avatarEl.querySelector('.profile-avatar-image');
    const initialsEl = avatarEl.querySelector('.profile-avatar-initials');

    if (this.user?.avatarImage) {
      if (imageEl) {
        imageEl.src = this.user.avatarImage;
        imageEl.style.display = 'block';
      }
      if (initialsEl) initialsEl.style.display = 'none';
      avatarEl.style.background = 'transparent';
    } else {
      if (imageEl) imageEl.style.display = 'none';
      if (initialsEl) {
        initialsEl.textContent = this.getInitials(name);
        initialsEl.style.display = 'flex';
      }
      avatarEl.style.background = this.user.avatarColor;
    }
  }

  updateProfileDisplay() {
    const profileSection = document.getElementById('profile');
    if (!profileSection) return;

    const profileName = profileSection.querySelector('#profileName');
    const profileStatus = profileSection.querySelector('#profileStatus');
    const profileBio = profileSection.querySelector('#profileBio');
    const profileEmail = profileSection.querySelector('#profileEmail');
    const profileDob = profileSection.querySelector('#profileDob');
    const avatarDiv = profileSection.querySelector('.profile-avatar-large');

    if (profileName) profileName.textContent = this.user.name;
    if (profileStatus) this.renderStatusIndicator(profileStatus);
    if (profileBio) profileBio.textContent = this.user.bio || '';
    if (profileEmail) profileEmail.textContent = this.user.email || '';
    if (profileDob) profileDob.textContent = this.formatBirthDate(this.user.birthDate);

    this.renderProfileAvatar(avatarDiv);
  }

  renderStatusIndicator(container) {
    if (!container) return;
    const dot = container.querySelector('.status-dot');
    const showStatus = this.settings?.showOnlineStatus ?? true;
    const isOnline = showStatus;

    if (dot) {
      dot.classList.toggle('online', isOnline);
    }
    container.setAttribute('aria-label', isOnline ? 'Онлайн' : 'Офлайн');
  }

  formatBirthDate(value) {
    if (!value) return '—';
    const dateObj = new Date(`${value}T00:00:00`);
    if (Number.isNaN(dateObj.getTime())) return '—';
    return new Intl.DateTimeFormat('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
  }

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
  }

  saveSettings(settingsData) {
    this.settings = settingsData;
    localStorage.setItem('bridge_settings', JSON.stringify(settingsData));
  }

  // Метод-обгортка для імпортованої функції
  getContactColor(name) {
    return getContactColor(name);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('bridge_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('bridge_theme', 'light');
    } else {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('bridge_theme', 'dark');
    }
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    localStorage.setItem('bridge_theme', isDark ? 'dark' : 'light');
  }

  loadChats() {
    const stored = localStorage.getItem('bridge_chats');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  saveChats() {
    localStorage.setItem('bridge_chats', JSON.stringify(this.chats));
  }

  setupModalEnterHandlers() {
    const newChatModal = document.getElementById('newChatModal');
    if (newChatModal) {
      newChatModal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && newChatModal.classList.contains('active')) {
          const input = e.target;
          if (input.id === 'newContactInput' || input.id === 'groupMembersInput') {
            e.preventDefault();
            this.createNewChat();
          }
        }
      });
    }

    const groupInfoModal = document.getElementById('groupInfoModal');
    if (groupInfoModal) {
      groupInfoModal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey && groupInfoModal.classList.contains('active')) {
          e.preventDefault();
          this.saveGroupInfo();
        }
      });
    }

    const addToGroupModal = document.getElementById('addToGroupModal');
    if (addToGroupModal) {
      addToGroupModal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && addToGroupModal.classList.contains('active')) {
          e.preventDefault();
          this.confirmAddToGroup();
        }
      });
    }
  }

  init() {
    this.setupEventListeners();
    this.setupModalEnterHandlers();
    this.renderChatsList();
    this.applyFontSize(this.settings.fontSize);
    this.updateProfileMenuButton();
    this.updateBottomNavIndicator();
    this.setupMobileSwipeBack();
    this.setupBottomNavReveal();
    window.addEventListener('resize', () => {
      this.updateBottomNavIndicator();
      this.handleBottomNavResize();
    });
  }

  // Метод-обгортка для імпортованої функції setupMobileSwipeBack
  setupMobileSwipeBack() {
    setupMobileSwipeBack(this);
  }

  setupEventListeners() {
    document.getElementById('newChatBtn').addEventListener('click', () => this.openNewChatModal());
    document.getElementById('closeModalBtn').addEventListener('click', () => this.closeNewChatModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeNewChatModal());
    document.getElementById('confirmBtn').addEventListener('click', () => this.createNewChat());
    document.getElementById('modalOverlay').addEventListener('click', () => this.closeNewChatModal());
    
    const navProfile = document.getElementById('navProfile');
    const navSettings = document.getElementById('navSettings');
    const navCalls = document.getElementById('navCalls');
    const navChats = document.getElementById('navChats');
    const navGames = document.getElementById('navGames');
    
    if (navProfile) {
      navProfile.addEventListener('click', () => {
        this.setActiveNavButton(navProfile);
        this.showSettings('profile');
      });
    }
    
    if (navSettings) {
      navSettings.addEventListener('click', () => {
        this.setActiveNavButton(navSettings);
        this.showSettings('messenger-settings');
      });
    }

    if (navGames) {
      navGames.addEventListener('click', () => {
        this.setActiveNavButton(navGames);
        this.showSettings('mini-games');
      });
    }
    
    if (navCalls) {
      navCalls.addEventListener('click', () => {
        this.setActiveNavButton(navCalls);
        this.showSettings('calls');
      });
    }
    
    if (navChats) {
      navChats.addEventListener('click', () => {
        this.setActiveNavButton(navChats);
        this.showBottomNav();
        // Show chats list and hide settings
        const settingsContainer = document.getElementById('settingsContainer');
        const settingsContainerMobile = document.getElementById('settingsContainerMobile');
        const chatsList = document.getElementById('chatsList');
        const chatContainer = document.getElementById('chatContainer');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const chatsListHeader = document.querySelector('.chats-list-header');
        const sidebar = document.querySelector('.sidebar');
        const profileMenu = document.querySelector('.profile-menu-wrapper');
        const appEl = document.querySelector('.bridge-app');
        
        if (settingsContainer) {
          settingsContainer.classList.remove('active');
          settingsContainer.style.display = 'none';
        }
        if (settingsContainerMobile) {
          settingsContainerMobile.classList.remove('active');
          settingsContainerMobile.style.display = 'none';
        }
        if (chatsList) chatsList.classList.remove('hidden');
        
        // Show chats list header
        if (chatsListHeader) chatsListHeader.style.display = '';
        
        // Show search box back
        const searchBox = document.querySelector('.search-box');
        if (searchBox) searchBox.style.display = '';

        if (sidebar) {
          sidebar.style.display = '';
          sidebar.classList.remove('compact');
        }
        if (profileMenu && this.profileMenuPlaceholder) {
          this.profileMenuPlaceholder.parentNode?.insertBefore(profileMenu, this.profileMenuPlaceholder);
          profileMenu.classList.remove('floating-nav');
        }
        
        // Clear current chat and show welcome screen
        this.currentChat = null;
        this.updateChatHeader();
        if (appEl) appEl.classList.remove('chat-open');
        if (chatContainer) {
          chatContainer.style.display = '';
          chatContainer.classList.remove('active');
        }
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        
        this.renderChatsList();
      });
    }
    
    document.getElementById('sendBtn').addEventListener('click', (e) => {
      e.preventDefault();
      this.sendMessage();
    });
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    document.getElementById('searchInput').addEventListener('input', (e) => this.filterChats(e.target.value));

    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => this.closeChat());

    document.getElementById('newContactInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.createNewChat();
      }
    });

    const isGroupToggle = document.getElementById('isGroupToggle');
    const groupFields = document.getElementById('groupFields');
    if (isGroupToggle && groupFields) {
      const toggleGroupFields = () => {
        if (isGroupToggle.checked) {
          groupFields.classList.add('active');
        } else {
          groupFields.classList.remove('active');
        }
      };
      isGroupToggle.addEventListener('change', toggleGroupFields);
      toggleGroupFields();
    }

    const callBtn = document.getElementById('callBtn');
    const historyBtn = document.getElementById('historyBtn');

    if (callBtn) {
      callBtn.addEventListener('click', () => {
        if (!this.currentChat) {
          this.showAlert('Спочатку оберіть чат.');
          return;
        }
        this.showAlert(`Дзвінок з ${this.currentChat.name} поки недоступний.`, 'Дзвінок');
      });
    }

    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        if (!this.currentChat) {
          this.showAlert('Спочатку оберіть чат.');
          return;
        }
        this.showAlert(`Історія для ${this.currentChat.name} буде додана пізніше.`, 'Історія');
      });
    }

    const chatsList = document.getElementById('chatsList');
    if (chatsList) {
      chatsList.addEventListener('contextmenu', (e) => {
        const item = e.target.closest('.chat-item');
        if (!item) return;
        e.preventDefault();
        this.openChatListMenu(item, e.clientX, e.clientY);
      });

      let pressTimer = null;
      chatsList.addEventListener('touchstart', (e) => {
        const item = e.target.closest('.chat-item');
        if (!item) return;
        pressTimer = setTimeout(() => {
          const rect = item.getBoundingClientRect();
          this.openChatListMenu(item, rect.left + rect.width / 2, rect.bottom + 6);
        }, 450);
      }, { passive: true });

      chatsList.addEventListener('touchend', () => {
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = null;
      });

      chatsList.addEventListener('touchmove', () => {
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = null;
      });
    }

    const closeAddToGroupBtn = document.getElementById('closeAddToGroupBtn');
    const cancelAddToGroupBtn = document.getElementById('cancelAddToGroupBtn');
    const confirmAddToGroupBtn = document.getElementById('confirmAddToGroupBtn');
    if (closeAddToGroupBtn) closeAddToGroupBtn.addEventListener('click', () => this.closeAddToGroupModal());
    if (cancelAddToGroupBtn) cancelAddToGroupBtn.addEventListener('click', () => this.closeAddToGroupModal());
    if (confirmAddToGroupBtn) confirmAddToGroupBtn.addEventListener('click', () => this.confirmAddToGroup());

    const replyBarClose = document.getElementById('replyBarClose');
    if (replyBarClose) {
      replyBarClose.addEventListener('click', () => this.clearReplyTarget());
    }

    this.setupEmojiPicker();

    const chatMenuBtn = document.getElementById('chatMenuBtn');
    const chatMenu = document.getElementById('chatMenu');
    const closeChatMenu = () => {
      if (!chatMenu || !chatMenuBtn) return;
      chatMenu.classList.remove('active');
      chatMenuBtn.setAttribute('aria-expanded', 'false');
    };

    if (chatMenuBtn && chatMenu) {
      chatMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatMenu.classList.toggle('active');
        chatMenuBtn.setAttribute('aria-expanded', chatMenu.classList.contains('active') ? 'true' : 'false');
      });

      chatMenu.addEventListener('click', (e) => {
        const item = e.target.closest('.chat-menu-item');
        if (!item) return;
        const action = item.dataset.action;
        if (!this.currentChat) {
          closeChatMenu();
          return;
        }

        if (action === 'clear') {
          this.showConfirm('Очистити всі повідомлення в цьому чаті?').then(ok => {
            if (!ok) return;
            this.currentChat.messages = [];
            this.saveChats();
            this.renderChat();
            this.renderChatsList();
          });
        }

        if (action === 'delete') {
          this.deleteChat(this.currentChat.id);
        }

        if (action === 'info') {
          const count = this.currentChat.messages?.length || 0;
          this.showAlert(`Чат: ${this.currentChat.name}\nПовідомлень: ${count}`);
        }

        if (action === 'group-info') {
          this.openGroupInfoModal();
        }

        closeChatMenu();
      });

      document.addEventListener('click', (e) => {
        if (!chatMenu.contains(e.target) && e.target !== chatMenuBtn) {
          closeChatMenu();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeChatMenu();
        }
      });
    }

    const closeGroupInfoBtn = document.getElementById('closeGroupInfoBtn');
    const closeGroupInfoBtn2 = document.getElementById('closeGroupInfoBtn2');
    const saveGroupInfoBtn = document.getElementById('saveGroupInfoBtn');
    if (closeGroupInfoBtn) closeGroupInfoBtn.addEventListener('click', () => this.closeGroupInfoModal());
    if (closeGroupInfoBtn2) closeGroupInfoBtn2.addEventListener('click', () => this.closeGroupInfoModal());
    if (saveGroupInfoBtn) saveGroupInfoBtn.addEventListener('click', () => this.saveGroupInfo());

    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggleBtn && sidebarOverlay && sidebar) {
      menuToggleBtn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.add('mobile-menu', 'active');
          sidebarOverlay.classList.add('active');
        }
      });
      
      sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
      });
    }
  }

  // Методи-обгортки для імпортованих UI функцій
  showAlert(message, title = 'Повідомлення') {
    return showAlert(message, title);
  }

  showConfirm(message, title = 'Підтвердження') {
    return showConfirm(message, title);
  }

  setupEmojiPicker() {
    setupEmojiPicker((input, text) => this.insertAtCursor(input, text));
  }

  insertAtCursor(input, text) {
    insertAtCursor(input, text);
  }

  renderChatsList() {
    const chatsList = document.getElementById('chatsList');
    
    // On mobile, show chats list when rendering
    chatsList.classList.remove('hidden-on-settings');
    
    chatsList.innerHTML = '';

    const sortedChats = this.getSortedChats();
    
    if (sortedChats.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'chats-list-empty';
      emptyState.innerHTML = `
        <div class="empty-state-content">
          <div class="empty-state-emoji">💬</div>
          <div class="empty-state-text">Чатів ще немає</div>
          <div class="empty-state-hint">Натисніть + щоб почати розмову</div>
        </div>
      `;
      chatsList.appendChild(emptyState);
      return;
    }

    sortedChats.forEach(chat => {
      const lastMessage = chat.messages[chat.messages.length - 1];
      const chatItem = document.createElement('button');
      const pinnedClass = chat.isPinned ? ' pinned' : '';
      chatItem.className = `chat-item ${this.currentChat?.id === chat.id ? 'active' : ''}${pinnedClass}`;
      chatItem.dataset.chatId = chat.id;
      chatItem.dataset.chatName = chat.name;
      const initials = chat.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
      const color = this.getContactColor(chat.name);
      chatItem.innerHTML = `
        <div class="chat-avatar" style="background: ${color}">${initials}</div>
        <div class="chat-info">
          <span class="chat-name">${chat.name}</span>
          <span class="chat-preview">${lastMessage?.text || 'Немає повідомлень'}</span>
        </div>
        <span class="chat-time">${lastMessage?.time || ''}</span>
        ${chat.isPinned ? `
          <div class="chat-pin-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"><path d="M235.32,81.37,174.63,20.69a16,16,0,0,0-22.63,0L98.37,74.49c-10.66-3.34-35-7.37-60.4,13.14a16,16,0,0,0-1.29,23.78L85,159.71,42.34,202.34a8,8,0,0,0,11.32,11.32L96.29,171l48.29,48.29A16,16,0,0,0,155.9,224c.38,0,.75,0,1.13,0a15.93,15.93,0,0,0,11.64-6.33c19.64-26.1,17.75-47.32,13.19-60L235.33,104A16,16,0,0,0,235.32,81.37ZM224,92.69h0l-57.27,57.46a8,8,0,0,0-1.49,9.22c9.46,18.93-1.8,38.59-9.34,48.62L48,100.08c12.08-9.74,23.64-12.31,32.48-12.31A40.13,40.13,0,0,1,96.81,91a8,8,0,0,0,9.25-1.51L163.32,32,224,92.68Z"></path></svg>
          </div>
        ` : ''}
        <div class="chat-item-actions">
          <button class="btn-delete-chat" data-chat-id="${chat.id}" title="Видалити чат">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      `;
      chatItem.addEventListener('click', () => this.selectChat(chat.id));
      
      const deleteBtn = chatItem.querySelector('.btn-delete-chat');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteChat(chat.id);
      });
      
      chatsList.appendChild(chatItem);
    });
  }

  getSortedChats() {
    const pinned = [];
    const normal = [];
    this.chats.forEach(c => (c.isPinned ? pinned : normal).push(c));
    pinned.sort((a, b) => (b.pinnedAt || 0) - (a.pinnedAt || 0));
    return [...pinned, ...normal];
  }

  openChatListMenu(item, clientX, clientY) {
    const menu = document.getElementById('chatListMenu');
    const pinBtn = document.getElementById('chatListMenuPin');
    const delBtn = document.getElementById('chatListMenuDelete');
    const addBtn = document.getElementById('chatListMenuAddToGroup');
    if (!menu || !pinBtn || !delBtn || !addBtn) return;

    const chatId = Number(item.dataset.chatId);
    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) return;
    this.chatListMenuState = { id: chatId, name: chat.name };

    pinBtn.textContent = chat.isPinned ? 'Відкріпити' : 'Закріпити';

    const closeMenu = () => {
      menu.classList.remove('active');
      menu.setAttribute('aria-hidden', 'true');
      this.chatListMenuState = { id: null, name: '' };
    };

    menu.classList.add('active');
    menu.setAttribute('aria-hidden', 'false');
    const rect = menu.getBoundingClientRect();
    const x = Math.min(clientX, window.innerWidth - rect.width - 8);
    const y = Math.min(clientY, window.innerHeight - rect.height - 8);
    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;

    pinBtn.onclick = () => {
      chat.isPinned = !chat.isPinned;
      chat.pinnedAt = chat.isPinned ? Date.now() : null;
      this.saveChats();
      this.renderChatsList();
      closeMenu();
    };

    delBtn.onclick = () => {
      this.deleteChat(chatId);
      closeMenu();
    };

    addBtn.onclick = () => {
      this.openAddToGroupModal(chat.name);
      closeMenu();
    };

    document.addEventListener('click', function onDocClick(e) {
      if (!menu.contains(e.target)) {
        closeMenu();
        document.removeEventListener('click', onDocClick);
      }
    });

    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') {
        closeMenu();
        document.removeEventListener('keydown', onEsc);
      }
    });
  }

  openAddToGroupModal(memberName) {
    const groups = this.chats.filter(c => c.isGroup);
    if (!groups.length) {
      this.showAlert('Спочатку створіть групу');
      return;
    }
    const modal = document.getElementById('addToGroupModal');
    const select = document.getElementById('addToGroupSelect');
    if (!modal || !select) return;

    select.innerHTML = '';
    groups.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      select.appendChild(opt);
    });

    this.addToGroupTarget = memberName;
    modal.classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
  }

  closeAddToGroupModal() {
    const modal = document.getElementById('addToGroupModal');
    if (modal) modal.classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    this.addToGroupTarget = null;
  }

  async confirmAddToGroup() {
    const select = document.getElementById('addToGroupSelect');
    if (!select || !this.addToGroupTarget) return;
    const groupId = Number(select.value);
    const group = this.chats.find(c => c.id === groupId);
    if (!group || !group.isGroup) return;

    const memberName = this.addToGroupTarget;
    group.members = Array.isArray(group.members) ? group.members : [];
    const exists = group.members.some(m => m.toLowerCase().trim() === memberName.toLowerCase().trim());
    if (exists) {
      await this.showAlert('Користувач вже є в цій групі');
      this.closeAddToGroupModal();
      return;
    }

    group.members.push(memberName);
    this.saveChats();
    await this.showAlert('Додано до групи');
    this.closeAddToGroupModal();
  }

  filterChats(query) {
    const chatsList = document.getElementById('chatsList');
    const items = chatsList.querySelectorAll('.chat-item');

    items.forEach(item => {
      const name = item.querySelector('.chat-name').textContent.toLowerCase();
      if (name.includes(query.toLowerCase())) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  selectChat(chatId) {
    this.currentChat = this.chats.find(c => c.id === chatId);
    document.getElementById('newContactInput').value = '';
    
    // Hide settings sections completely
    const settingsContainer = document.getElementById('settingsContainer');
    const settingsContainerMobile = document.getElementById('settingsContainerMobile');
    if (settingsContainer) {
      settingsContainer.classList.remove('active');
      settingsContainer.style.display = 'none';
    }
    if (settingsContainerMobile) {
      settingsContainerMobile.classList.remove('active');
      settingsContainerMobile.style.display = 'none';
    }
    
    // Show chat container
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.classList.add('active');
      chatContainer.style.display = 'flex';
    }
    
    this.renderChatsList();
    this.renderChat();
    this.updateChatHeader();
    this.hideWelcomeScreen();
    this.hideBottomNavForChat();
    const appEl = document.querySelector('.bridge-app');
    if (appEl) appEl.classList.add('chat-open');
    if (window.innerWidth > 768) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.add('compact');
    }
    try {
      const sidebar = document.querySelector('.sidebar');
      const sidebarOverlay = document.getElementById('sidebarOverlay');
      const profileMenu = document.querySelector('.profile-menu-wrapper');
      
      if (window.innerWidth <= 768) {
        if (appEl) appEl.classList.add('mobile-chat-open');
        if (sidebar) {
          sidebar.classList.add('hidden');
          sidebar.classList.remove('active', 'mobile-menu');
        }
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        if (profileMenu) profileMenu.style.display = 'none';
      }
    } catch (e) {
    }
  }

  closeChat() {
    this.currentChat = null;
    document.getElementById('messageInput').value = '';
    this.renderChatsList();
    this.updateChatHeader();
    this.showWelcomeScreen();
    this.clearMessages();
    this.showBottomNav();
    const appEl = document.querySelector('.bridge-app');
    if (appEl) appEl.classList.remove('chat-open');
    if (window.innerWidth > 768) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('compact');
    }
    try {
      const appEl = document.querySelector('.bridge-app');
      const sidebar = document.querySelector('.sidebar');
      const profileMenu = document.querySelector('.profile-menu-wrapper');
      
      if (window.innerWidth <= 768) {
        if (appEl) appEl.classList.remove('mobile-chat-open');
        if (sidebar) sidebar.classList.remove('hidden');
        if (profileMenu) profileMenu.style.display = '';
      }
    } catch (e) {}
  }

  async deleteChat(chatId) {
    const ok = await this.showConfirm('Ви впевнені, що хочете видалити цей чат?');
    if (!ok) return;

    const idx = this.chats.findIndex(c => c.id === chatId);
    if (idx === -1) return;

    this.chats.splice(idx, 1);
    this.saveChats();

    if (this.currentChat?.id === chatId) {
      this.closeChat();
    } else {
      this.renderChatsList();
    }
  }

  renderChat(highlightId = null) {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';

    if (!this.currentChat) return;

    if (!this.currentChat.messages || this.currentChat.messages.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'chat-empty-state';
      emptyEl.innerHTML = `
        <div class="chat-empty-emoji" aria-hidden="true">💬</div>
        <div class="chat-empty-title">Повідомлень ще немає</div>
        <div class="chat-empty-subtitle">Напишіть перше повідомлення у цей чат</div>
      `;
      messagesContainer.appendChild(emptyEl);
      return;
    }

    let lastDate = null;
    this.currentChat.messages.forEach(msg => {
      const msgDateKey = msg.date || new Date().toISOString().slice(0,10);

      if (msgDateKey !== lastDate) {
        lastDate = msgDateKey;
        const dateObj = new Date(msgDateKey + 'T00:00:00');
        let dateLabel = new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric' }).format(dateObj);
        dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
        const sep = document.createElement('div');
        sep.className = 'date-separator';
        sep.innerHTML = `<span class="date-separator-text">${dateLabel}</span>`;
        messagesContainer.appendChild(sep);
      }

      const messageEl = document.createElement('div');
      const highlightClass = highlightId && msg.id === highlightId ? ' new-message' : '';
      messageEl.className = `message ${msg.from}${highlightClass}`;
      messageEl.dataset.id = msg.id;
      messageEl.dataset.from = msg.from;
      messageEl.dataset.text = msg.text || '';
      messageEl.dataset.date = msg.date || '';
      messageEl.dataset.time = msg.time || '';
      
      let avatarHtml = '';
      let senderNameHtml = '';
      
      if (msg.from === 'other') {
        const initials = this.currentChat.name.split(' ').map(w => w[0]).join('').toUpperCase();
        const color = this.getContactColor(this.currentChat.name);
        avatarHtml = `<div class="message-avatar" style="background: ${color}">${initials}</div>`;
      } else {
        senderNameHtml = `<div class="message-sender-name">${this.user.name}</div>`;
        avatarHtml = this.getUserAvatarHtml();
      }
      
      const editedLabel = msg.edited ? '<span class="message-edited">• редаговано</span>' : '';
      const editedClass = msg.edited ? ' edited' : '';
      const replyHtml = msg.replyTo
        ? `<div class="message-reply">
            <div class="message-reply-name">${msg.replyTo.from === 'own' ? this.user.name : this.currentChat.name}</div>
            <div class="message-reply-text">${this.escapeHtml(msg.replyTo.text || '')}</div>
          </div>`
        : '';

      messageEl.innerHTML = `
        ${avatarHtml}
        <div class="message-bubble">
          ${senderNameHtml}
          <div class="message-content${editedClass}">
            ${replyHtml}
            ${this.escapeHtml(msg.text)}
            <span class="message-meta"><span class="message-time">${msg.time || ''}</span>${editedLabel}</span>
          </div>
        </div>
      `;
      messagesContainer.appendChild(messageEl);
    });

    this.bindMessageContextMenu();

    // Auto-scroll to bottom
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
  }

  bindMessageContextMenu() {
    const messagesContainer = document.getElementById('messagesContainer');
    const menu = document.getElementById('messageMenu');
    const menuDate = document.getElementById('messageMenuDate');
    const btnReply = document.getElementById('messageMenuReply');
    const btnEdit = document.getElementById('messageMenuEdit');
    const btnDelete = document.getElementById('messageMenuDelete');
    const btnCopy = document.getElementById('messageMenuCopy');

    if (!messagesContainer || !menu || !menuDate || !btnReply || !btnEdit || !btnDelete || !btnCopy) return;

    const closeMenu = () => {
      menu.classList.remove('active');
      menu.setAttribute('aria-hidden', 'true');
      this.messageMenuState = { id: null, from: null, text: '' };
    };

    const openMenu = (messageEl) => {
      const id = Number(messageEl.dataset.id);
      const from = messageEl.dataset.from;
      const text = messageEl.dataset.text || '';
      const date = messageEl.dataset.date || new Date().toISOString().slice(0,10);
      const time = messageEl.dataset.time || '';

      this.messageMenuState = { id, from, text };

      const formatted = this.formatMessageDateTime(date, time);
      menuDate.textContent = formatted;

      if (from === 'own') {
        btnEdit.classList.remove('disabled');
      } else {
        btnEdit.classList.add('disabled');
      }

      menu.style.left = '0px';
      menu.style.top = '0px';
      menu.classList.add('active');
      menu.setAttribute('aria-hidden', 'false');

      const menuRect = menu.getBoundingClientRect();
      const msgRect = messageEl.getBoundingClientRect();
      const desiredX = from === 'own'
        ? msgRect.right - menuRect.width
        : msgRect.left;
      const x = Math.min(Math.max(8, desiredX), window.innerWidth - menuRect.width - 8);
      const y = Math.min(msgRect.bottom + 6, window.innerHeight - menuRect.height - 8);
      menu.style.left = `${Math.max(8, x)}px`;
      menu.style.top = `${Math.max(8, y)}px`;
    };

    messagesContainer.addEventListener('contextmenu', (e) => {
      const messageEl = e.target.closest('.message');
      if (!messageEl) return;
      e.preventDefault();
      openMenu(messageEl);
    });

    let pressTimer = null;
    messagesContainer.addEventListener('touchstart', (e) => {
      const messageEl = e.target.closest('.message');
      if (!messageEl) return;
      pressTimer = setTimeout(() => {
        openMenu(messageEl);
      }, 450);
    }, { passive: true });

    messagesContainer.addEventListener('touchend', () => {
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = null;
    });

    messagesContainer.addEventListener('touchmove', () => {
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = null;
    });

    btnEdit.addEventListener('click', () => {
      if (btnEdit.classList.contains('disabled')) return;
      if (this.messageMenuState.id != null) {
        this.beginEditMessage(this.messageMenuState.id);
      }
      closeMenu();
    });

    btnReply.addEventListener('click', () => {
      if (this.messageMenuState.id == null) return;
      this.setReplyTarget(this.messageMenuState);
      closeMenu();
    });

    btnDelete.addEventListener('click', () => {
      if (this.messageMenuState.id == null) return;
      const messageId = this.messageMenuState.id;
      this.showConfirm('Видалити це повідомлення?').then(ok => {
        if (!ok) return;
        this.deleteMessageById(messageId);
      });
      closeMenu();
    });

    btnCopy.addEventListener('click', async () => {
      const text = this.messageMenuState.text || '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.showAlert('Скопійовано');
      } catch (e) {
        this.showAlert('Не вдалося скопіювати');
      }
      closeMenu();
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('scroll', closeMenu, { passive: true });
    window.addEventListener('resize', closeMenu);
  }

  openGroupInfoModal() {
    if (!this.currentChat || !this.currentChat.isGroup) {
      this.showAlert('Це не груповий чат');
      return;
    }
    const modal = document.getElementById('groupInfoModal');
    const avatar = document.getElementById('groupInfoAvatar');
    const name = document.getElementById('groupInfoName');
    const count = document.getElementById('groupInfoCount');
    const desc = document.getElementById('groupInfoDescription');
    const membersList = document.getElementById('groupInfoMembers');

    if (!modal || !avatar || !name || !count || !desc || !membersList) return;

    const initials = this.currentChat.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    avatar.textContent = initials;
    avatar.style.background = this.getContactColor(this.currentChat.name);
    name.textContent = this.currentChat.name;

    const members = Array.isArray(this.currentChat.members) ? this.currentChat.members : [];
    const total = members.length + 1;
    count.textContent = `учасників: ${total}`;
    desc.value = this.currentChat.description || '';

    membersList.innerHTML = '';
    const allMembers = [this.user.name, ...members];
    allMembers.forEach((m, index) => {
      const initials = m.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="group-member-avatar" style="background: ${this.getContactColor(m)}">${initials}</div>
        <div class="group-member-name">
          <span>${m}</span>
          ${index === 0 ? '<span class="group-member-self">(Ви)</span>' : ''}
        </div>
      `;
      membersList.appendChild(li);
    });

    modal.classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
  }

  closeGroupInfoModal() {
    const modal = document.getElementById('groupInfoModal');
    if (modal) modal.classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
  }

  async saveGroupInfo() {
    if (!this.currentChat || !this.currentChat.isGroup) return;
    const desc = document.getElementById('groupInfoDescription');
    if (desc) {
      this.currentChat.description = desc.value.trim();
      this.saveChats();
      await this.showAlert('Деталі групи збережено');
    }
    this.closeGroupInfoModal();
  }

  getNextMessageId(chat) {
    if (!chat || !Array.isArray(chat.messages) || chat.messages.length === 0) return 1;
    const maxId = Math.max(...chat.messages.map(m => m.id || 0));
    return maxId + 1;
  }

  setReplyTarget(messageState) {
    const replyBar = document.getElementById('replyBar');
    const replyBarText = document.getElementById('replyBarText');
    if (!replyBar || !replyBarText) return;
    const name = messageState.from === 'own' ? this.user.name : (this.currentChat?.name || '');
    this.replyTarget = {
      id: messageState.id,
      text: messageState.text || '',
      from: messageState.from,
      name
    };
    replyBarText.textContent = `${name}: ${this.replyTarget.text}`;
    replyBar.classList.add('active');
  }

  clearReplyTarget() {
    const replyBar = document.getElementById('replyBar');
    const replyBarText = document.getElementById('replyBarText');
    this.replyTarget = null;
    if (replyBarText) replyBarText.textContent = '';
    if (replyBar) replyBar.classList.remove('active');
  }

  deleteMessageById(messageId) {
    if (!this.currentChat) return;
    const idx = this.currentChat.messages.findIndex(m => m.id === messageId);
    if (idx === -1) return;
    this.currentChat.messages.splice(idx, 1);
    this.saveChats();
    this.renderChat();
    this.renderChatsList();
  }

  formatMessageDateTime(dateStr, timeStr) {
    const dateObj = new Date((dateStr || new Date().toISOString().slice(0,10)) + 'T00:00:00');
    const dateText = new Intl.DateTimeFormat('uk-UA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
    const timeText = timeStr ? ` ${timeStr}` : '';
    return `${dateText.charAt(0).toUpperCase() + dateText.slice(1)}${timeText}`;
  }

  updateChatHeader() {
    const contactName = document.getElementById('contactName');
    const contactStatus = document.getElementById('contactStatus');
    const avatar = document.getElementById('appChatAvatar');
    const contactDetails = document.getElementById('appChatInfo');

    if (this.currentChat && contactName && contactStatus) {
      contactName.textContent = this.currentChat.name;
      if (this.currentChat.isGroup) {
        const count = Array.isArray(this.currentChat.members) ? this.currentChat.members.length + 1 : 1;
        contactStatus.textContent = `учасників: ${count}`;
      } else {
        contactStatus.textContent = 'онлайн';
      }
      contactStatus.classList.add('online');
      if (avatar) {
        const initials = this.currentChat.name.split(' ').map(w => w[0]).join('').toUpperCase();
        const color = this.getContactColor(this.currentChat.name);
        avatar.textContent = initials;
        avatar.style.background = color;
      }

      if (contactDetails) {
        contactDetails.style.cursor = this.currentChat.isGroup ? 'pointer' : 'default';
        contactDetails.onclick = this.currentChat.isGroup
          ? () => this.openGroupInfoModal()
          : null;
      }
    } else {
      if (contactName) contactName.textContent = 'Виберіть контакт';
      if (contactStatus) {
        contactStatus.textContent = '';
        contactStatus.classList.remove('online');
      }
      if (avatar) {
        avatar.textContent = '';
        avatar.style.background = '';
      }
      if (contactDetails) {
        contactDetails.style.cursor = 'default';
        contactDetails.onclick = null;
      }
    }
  }

  clearMessages() {
    document.getElementById('messagesContainer').innerHTML = '';
  }

  appendMessage(msg, highlightClass = '') {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer || !this.currentChat) return;

    const messageEl = document.createElement('div');
    messageEl.className = `message ${msg.from}${highlightClass}`;
    messageEl.dataset.id = msg.id;
    messageEl.dataset.from = msg.from;
    messageEl.dataset.text = msg.text || '';
    messageEl.dataset.date = msg.date || '';
    messageEl.dataset.time = msg.time || '';
    
    let avatarHtml = '';
    let senderNameHtml = '';
    
    if (msg.from === 'other') {
      const initials = this.currentChat.name.split(' ').map(w => w[0]).join('').toUpperCase();
      const color = this.getContactColor(this.currentChat.name);
      avatarHtml = `<div class="message-avatar" style="background: ${color}">${initials}</div>`;
    } else {
      senderNameHtml = `<div class="message-sender-name">${this.user.name}</div>`;
      avatarHtml = this.getUserAvatarHtml();
    }
    
    const editedLabel = msg.edited ? '<span class="message-edited">• редаговано</span>' : '';
    const editedClass = msg.edited ? ' edited' : '';
    const replyHtml = msg.replyTo
      ? `<div class="message-reply">
          <div class="message-reply-name">${msg.replyTo.from === 'own' ? this.user.name : this.currentChat.name}</div>
          <div class="message-reply-text">${this.escapeHtml(msg.replyTo.text || '')}</div>
        </div>`
      : '';

    messageEl.innerHTML = `
      ${avatarHtml}
      <div class="message-bubble">
        ${senderNameHtml}
        <div class="message-content${editedClass}">
          ${replyHtml}
          ${this.escapeHtml(msg.text)}
          <span class="message-meta"><span class="message-time">${msg.time || ''}</span>${editedLabel}</span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || !this.currentChat) return;

    if (this.editingMessageId) {
      const msg = this.currentChat.messages.find(m => m.id === this.editingMessageId);
      if (!msg) {
        this.editingMessageId = null;
        return;
      }
      msg.text = message;
      msg.edited = true;
      this.saveChats();
      input.value = '';
      this.editingMessageId = null;
      this.renderChat();
      this.renderChatsList();
      return;
    }

    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + 
                 now.getMinutes().toString().padStart(2, '0');

    const newMessage = {
      id: this.getNextMessageId(this.currentChat),
      text: message,
      from: 'own',
      time: time,
      date: now.toISOString().slice(0,10),
      replyTo: this.replyTarget
        ? { id: this.replyTarget.id, text: this.replyTarget.text, from: this.replyTarget.from }
        : null
    };

    this.currentChat.messages.push(newMessage);
    this.saveChats();
    input.value = '';
    this.clearReplyTarget();
    if (this.currentChat.messages.length === 1) {
      this.renderChat(newMessage.id);
    } else {
      this.appendMessage(newMessage, ' new-message');
    }
    this.renderChatsList();
  }

  openNewChatModal() {
    document.getElementById('newChatModal').classList.add('active');
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('newContactInput').focus();
  }

  closeNewChatModal() {
    document.getElementById('newChatModal').classList.remove('active');
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('newContactInput').value = '';
    const isGroupToggle = document.getElementById('isGroupToggle');
    const groupMembersInput = document.getElementById('groupMembersInput');
    const groupFields = document.getElementById('groupFields');
    if (isGroupToggle) isGroupToggle.checked = false;
    if (groupMembersInput) groupMembersInput.value = '';
    if (groupFields) groupFields.classList.remove('active');
  }

  async createNewChat() {
    const input = document.getElementById('newContactInput');
    const isGroupToggle = document.getElementById('isGroupToggle');
    const groupMembersInput = document.getElementById('groupMembersInput');
    const raw = input.value || '';
    const name = raw.trim();

    if (!name) {
      await this.showAlert('Будь ласка, введіть ім\'я контакту');
      return;
    }

    const isGroup = !!isGroupToggle?.checked;
    let members = [];
    if (isGroup) {
      const rawMembers = groupMembersInput?.value || '';
      members = rawMembers
        .split(',')
        .map(m => m.trim())
        .filter(Boolean);
      if (members.length === 0) {
        await this.showAlert('Додайте хоча б одного учасника групи');
        return;
      }
    }

    const normalized = name.toLowerCase();
    console.log('createNewChat:', { name, normalized, chats: this.chats });
    const existing = this.chats.find(c => (c.name || '').toLowerCase().trim() === normalized);
    console.log('createNewChat existing:', existing);
    if (existing) {
      await this.showAlert('Цей контакт вже існує!');
      return;
    }

    const newChat = {
      id: Math.max(...this.chats.map(c => c.id), 0) + 1,
      name: name,
      messages: [],
      isGroup,
      members
    };

    this.chats.push(newChat);
    this.saveChats();
    this.renderChatsList();
    this.closeNewChatModal();
    this.selectChat(newChat.id);
  }

  beginEditMessage(messageId) {
    if (!this.currentChat) return;
    const msg = this.currentChat.messages.find(m => m.id === messageId);
    if (!msg || msg.from !== 'own') return;

    const input = document.getElementById('messageInput');
    if (!input) return;
    this.editingMessageId = messageId;
    input.value = msg.text;
    input.focus();
  }

  hideWelcomeScreen() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('chatContainer').classList.add('active');
  }

  showWelcomeScreen() {
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('chatContainer').classList.remove('active');
  }

  // Метод-обгортка для імпортованої функції escapeHtml
  escapeHtml(text) {
    return escapeHtml(text);
  }

  // Метод-обгортка для імпортованої функції getSettingsTemplate
  getSettingsTemplate(sectionName) {
    return getSettingsTemplate(sectionName);
  }

  setActiveNavButton(btn) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    if (btn) {
      btn.classList.add('active');
    }
    this.updateBottomNavIndicator(btn);
  }

  setupBottomNavReveal() {
    const revealHandle = document.getElementById('navRevealHandle');
    const hideHandle = document.getElementById('navHideHandle');
    if (revealHandle) {
      revealHandle.addEventListener('click', () => this.showBottomNav());
    }
    if (hideHandle) {
      hideHandle.addEventListener('click', () => this.hideBottomNavForChat());
    }

    document.addEventListener('mousemove', (event) => {
      if (!this.bottomNavHidden) return;
      if (!this.currentChat) return;
      if (window.innerWidth <= 768) return;
      if (event.clientY >= window.innerHeight - 6) {
        this.showBottomNav();
      }
    });
  }

  handleBottomNavResize() {
    if (window.innerWidth <= 768) {
      this.showBottomNav();
      return;
    }
    if (this.currentChat) {
      this.hideBottomNavForChat();
    }
  }

  hideBottomNavForChat() {
    if (window.innerWidth <= 768) return;
    const profileMenu = document.querySelector('.profile-menu-wrapper');
    const revealHandle = document.getElementById('navRevealHandle');
    const hideHandle = document.getElementById('navHideHandle');
    if (!profileMenu) return;
    profileMenu.classList.add('nav-hidden');
    this.bottomNavHidden = true;
    if (revealHandle) revealHandle.classList.remove('show');
    if (hideHandle) hideHandle.classList.remove('show');
    if (this.navRevealTimeout) window.clearTimeout(this.navRevealTimeout);
    this.navRevealTimeout = window.setTimeout(() => {
      if (this.bottomNavHidden && revealHandle) revealHandle.classList.add('show');
    }, 320);
  }

  showBottomNav() {
    const profileMenu = document.querySelector('.profile-menu-wrapper');
    const revealHandle = document.getElementById('navRevealHandle');
    const hideHandle = document.getElementById('navHideHandle');
    if (profileMenu) profileMenu.classList.remove('nav-hidden');
    if (revealHandle) revealHandle.classList.remove('show');
    if (hideHandle) {
      hideHandle.classList.toggle(
        'show',
        Boolean(this.currentChat) && window.innerWidth > 768
      );
    }
    this.bottomNavHidden = false;
  }

  updateBottomNavIndicator(activeBtn = null) {
    const nav = document.querySelector('.bottom-nav');
    const indicator = nav?.querySelector('.bottom-nav-indicator');
    const target = activeBtn || nav?.querySelector('.bottom-nav-item.active');
    if (!nav || !indicator || !target) return;

    const navRect = nav.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offsetX = targetRect.left - navRect.left + (targetRect.width - indicator.offsetWidth) / 2;
    indicator.style.transform = `translateX(${Math.max(0, offsetX)}px)`;
  }

  triggerGameEnd(panel, message) {
    if (!panel) return;
    panel.dataset.endMessage = message || 'Гру завершено';
    const canvas = panel.querySelector('.mini-game-canvas');
    if (canvas) canvas.setAttribute('data-end-message', panel.dataset.endMessage);
    panel.classList.add('game-over');
    setTimeout(() => {
      panel.classList.remove('game-over');
    }, 1200);
  }

  initMiniGames(settingsContainer) {
    const list = settingsContainer.querySelector('.mini-games-list');
    const view = settingsContainer.querySelector('#miniGameView');
    const backBtn = settingsContainer.querySelector('#miniGameBack');
    const titleEl = settingsContainer.querySelector('#miniGameTitle');
    const scoreLabel = settingsContainer.querySelector('#miniGameScoreLabel');
    const setMaxScoreLabel = (game) => {
      if (!scoreLabel) return;
      const max = this.getMiniGameMax(game);
      scoreLabel.textContent = `Рекорд: ${max}`;
    };

    const showGame = (game) => {
      if (!view || !list) return;
      list.style.display = 'none';
      view.classList.add('active');
      settingsContainer.classList.add('mini-games-active');
      this.currentMiniGame = game;

      const panels = settingsContainer.querySelectorAll('.mini-game-panel');
      panels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.game === game);
      });

      if (titleEl) {
        titleEl.textContent = game === 'snake' ? 'Snake' : game === 'g2048' ? '2048' : 'Memory';
      }
      setMaxScoreLabel(game);

      this.initSnake(settingsContainer);
      this.init2048(settingsContainer);
      this.initMemory(settingsContainer);
    };

    const showList = () => {
      if (!view || !list) return;
      view.classList.remove('active');
      list.style.display = 'grid';
      settingsContainer.classList.remove('mini-games-active');
    };

    if (backBtn) backBtn.addEventListener('click', showList);

    settingsContainer.querySelectorAll('.mini-game-select').forEach(btn => {
      btn.addEventListener('click', () => showGame(btn.dataset.game));
    });
  }

  initSnake(settingsContainer) {
    const boardEl = settingsContainer.querySelector('#snakeBoard');
    const startBtn = settingsContainer.querySelector('#snakeStart');
    const scoreEl = settingsContainer.querySelector('#snakeScore');
    const panel = settingsContainer.querySelector('.mini-game-panel[data-game="snake"]');
    if (!boardEl || !startBtn || !scoreEl) return;
    if (boardEl.dataset.bound === 'true') return;
    boardEl.dataset.bound = 'true';

    const size = 12;
    let direction = { x: 1, y: 0 };
    let snake = [{ x: 5, y: 5 }];
    let food = { x: 8, y: 5 };
    let score = 0;
    let timer = null;

    const buildGrid = () => {
      boardEl.innerHTML = '';
      boardEl.style.display = 'grid';
      boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
      boardEl.style.gridTemplateRows = `repeat(${size}, 1fr)`;
      for (let i = 0; i < size * size; i += 1) {
        const cell = document.createElement('div');
        cell.className = 'snake-cell';
        boardEl.appendChild(cell);
      }
    };

    const indexOf = (x, y) => y * size + x;

    const draw = () => {
      const cells = boardEl.querySelectorAll('.snake-cell');
      cells.forEach(cell => {
        cell.classList.remove('snake', 'food');
      });
      snake.forEach(part => {
        const idx = indexOf(part.x, part.y);
        cells[idx]?.classList.add('snake');
      });
      const foodIdx = indexOf(food.x, food.y);
      cells[foodIdx]?.classList.add('food');
      scoreEl.textContent = String(score);
      this.updateMiniGameMax('snake', score);
    };

    const spawnFood = () => {
      let x = Math.floor(Math.random() * size);
      let y = Math.floor(Math.random() * size);
      while (snake.some(p => p.x === x && p.y === y)) {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
      }
      food = { x, y };
    };

    const setDirection = (next) => {
      if (direction.x === -next.x && direction.y === -next.y) return;
      direction = next;
    };

    const step = () => {
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size) {
        clearInterval(timer);
        timer = null;
        this.triggerGameEnd(panel, 'Гру завершено');
        return;
      }
      if (snake.some(p => p.x === head.x && p.y === head.y)) {
        clearInterval(timer);
        timer = null;
        this.triggerGameEnd(panel, 'Гру завершено');
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 1;
        spawnFood();
      } else {
        snake.pop();
      }
      draw();
    };

    const reset = () => {
      direction = { x: 1, y: 0 };
      snake = [{ x: 5, y: 5 }];
      score = 0;
      spawnFood();
      draw();
      panel?.classList.remove('game-over');
    };

    buildGrid();
    reset();

    startBtn.addEventListener('click', () => {
      reset();
      if (timer) clearInterval(timer);
      timer = setInterval(step, 140);
    });

    const onKey = (e) => {
      const key = (e.key || '').toLowerCase();
      if (key === 'arrowup' || key === 'w') setDirection({ x: 0, y: -1 });
      if (key === 'arrowdown' || key === 's') setDirection({ x: 0, y: 1 });
      if (key === 'arrowleft' || key === 'a') setDirection({ x: -1, y: 0 });
      if (key === 'arrowright' || key === 'd') setDirection({ x: 1, y: 0 });
    };

    document.addEventListener('keydown', onKey);

    let touchStartX = 0;
    let touchStartY = 0;

    boardEl.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    boardEl.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        setDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      } else {
        setDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
    });
  }

  init2048(settingsContainer) {
    const boardEl = settingsContainer.querySelector('#g2048Board');
    const startBtn = settingsContainer.querySelector('#g2048Start');
    const scoreEl = settingsContainer.querySelector('#g2048Score');
    const panel = settingsContainer.querySelector('.mini-game-panel[data-game="g2048"]');
    if (!boardEl || !startBtn || !scoreEl) return;

    const size = 4;
    let score = 0;
    let grid = Array.from({ length: size }, () => Array(size).fill(0));

    const draw = () => {
      boardEl.innerHTML = '';
      grid.flat().forEach(value => {
        const tile = document.createElement('div');
        tile.className = `tile value-${value || 0}`;
        tile.textContent = value ? String(value) : '';
        boardEl.appendChild(tile);
      });
      scoreEl.textContent = String(score);
      this.updateMiniGameMax('g2048', score);
    };

    const addRandom = () => {
      const empty = [];
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          if (grid[y][x] === 0) empty.push({ x, y });
        }
      }
      if (!empty.length) return;
      const spot = empty[Math.floor(Math.random() * empty.length)];
      grid[spot.y][spot.x] = Math.random() < 0.9 ? 2 : 4;
    };

    const slide = (row) => {
      const filtered = row.filter(n => n !== 0);
      for (let i = 0; i < filtered.length - 1; i += 1) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          score += filtered[i];
          filtered[i + 1] = 0;
        }
      }
      const merged = filtered.filter(n => n !== 0);
      while (merged.length < size) merged.push(0);
      return merged;
    };

    const moveLeft = () => {
      const old = JSON.stringify(grid);
      grid = grid.map(row => slide(row));
      if (JSON.stringify(grid) !== old) addRandom();
      draw();
      checkGameOver();
    };

    const moveRight = () => {
      const old = JSON.stringify(grid);
      grid = grid.map(row => slide([...row].reverse()).reverse());
      if (JSON.stringify(grid) !== old) addRandom();
      draw();
      checkGameOver();
    };

    const moveUp = () => {
      const old = JSON.stringify(grid);
      const transposed = grid[0].map((_, i) => grid.map(r => r[i]));
      const moved = transposed.map(row => slide(row));
      grid = moved[0].map((_, i) => moved.map(r => r[i]));
      if (JSON.stringify(grid) !== old) addRandom();
      draw();
      checkGameOver();
    };

    const moveDown = () => {
      const old = JSON.stringify(grid);
      const transposed = grid[0].map((_, i) => grid.map(r => r[i]));
      const moved = transposed.map(row => slide([...row].reverse()).reverse());
      grid = moved[0].map((_, i) => moved.map(r => r[i]));
      if (JSON.stringify(grid) !== old) addRandom();
      draw();
      checkGameOver();
    };

    const reset = () => {
      grid = Array.from({ length: size }, () => Array(size).fill(0));
      score = 0;
      addRandom();
      addRandom();
      draw();
      panel?.classList.remove('game-over');
    };

    const checkGameOver = () => {
      const hasEmpty = grid.some(row => row.some(v => v === 0));
      if (hasEmpty) return;
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const v = grid[y][x];
          if ((grid[y + 1] && grid[y + 1][x] === v) || (grid[y][x + 1] === v)) {
            return;
          }
        }
      }
      this.triggerGameEnd(panel, 'Ходів більше немає');
    };

    if (boardEl.dataset.bound === 'true') return;
    boardEl.dataset.bound = 'true';
    reset();
    startBtn.addEventListener('click', reset);

    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') moveLeft();
      if (key === 'arrowright' || key === 'd') moveRight();
      if (key === 'arrowup' || key === 'w') moveUp();
      if (key === 'arrowdown' || key === 's') moveDown();
    };
    window.addEventListener('keydown', onKey);
  }

  initMemory(settingsContainer) {
    const boardEl = settingsContainer.querySelector('#memoryBoard');
    const startBtn = settingsContainer.querySelector('#memoryStart');
    const scoreEl = settingsContainer.querySelector('#memoryScore');
    const panel = settingsContainer.querySelector('.mini-game-panel[data-game="memory"]');
    if (!boardEl || !startBtn || !scoreEl) return;

    const icons = ['🚀', '🛰️', '🌕', '⭐', '🪐', '☄️', '🌌', '🧠'];
    let deck = [];
    let open = [];
    let matched = 0;

    const draw = () => {
      boardEl.innerHTML = '';
      deck.forEach((card, index) => {
        const cell = document.createElement('button');
        cell.className = 'memory-card' + (card.revealed ? ' revealed' : '');
        cell.textContent = card.revealed ? card.icon : '';
        cell.addEventListener('click', () => flip(index));
        boardEl.appendChild(cell);
      });
      scoreEl.textContent = String(matched);
      this.updateMiniGameMax('memory', matched);
    };

    const reset = () => {
      deck = [...icons, ...icons]
        .map(icon => ({ icon, revealed: false }))
        .sort(() => Math.random() - 0.5);
      open = [];
      matched = 0;
      draw();
      panel?.classList.remove('game-over');
    };

    const flip = (idx) => {
      if (open.length === 2) return;
      if (deck[idx].revealed) return;
      deck[idx].revealed = true;
      open.push(idx);
      draw();
      if (open.length === 2) {
        const [a, b] = open;
        if (deck[a].icon === deck[b].icon) {
          matched += 1;
          open = [];
          draw();
          if (matched === icons.length) {
            this.triggerGameEnd(panel, 'Перемога!');
          }
        } else {
          setTimeout(() => {
            deck[a].revealed = false;
            deck[b].revealed = false;
            open = [];
            draw();
          }, 600);
        }
      }
    };

    if (boardEl.dataset.bound === 'true') return;
    boardEl.dataset.bound = 'true';
    startBtn.addEventListener('click', reset);
    reset();
  }

  getMiniGameMax(game) {
    const raw = localStorage.getItem(`bridge_game_max_${game}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  updateMiniGameMax(game, value) {
    const current = this.getMiniGameMax(game);
    if (value <= current) return;
    localStorage.setItem(`bridge_game_max_${game}`, String(value));
    if (this.currentMiniGame === game) {
      const scoreLabel = document.getElementById('miniGameScoreLabel');
      if (scoreLabel) scoreLabel.textContent = `Рекорд: ${value}`;
    }
  }



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

  // Метод-обгортка для імпортованої функції setupSettingsSwipeBack
  setupSettingsSwipeBack(settingsContainer) {
    setupSettingsSwipeBack(settingsContainer, this);
  }

  async showSettings(sectionName) {
    this.showBottomNav();
    // На мобільному використовуємо settingsContainerMobile, на ПК - settingsContainer
    const isMobile = window.innerWidth <= 768;
    const settingsContainerId = isMobile ? 'settingsContainerMobile' : 'settingsContainer';
    const settingsContainer = document.getElementById(settingsContainerId);
    
    const chatContainer = document.getElementById('chatContainer');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatsList = document.getElementById('chatsList');
    const chatsListHeader = document.querySelector('.chats-list-header');
    
    // Hide chat and welcome screen
    if (chatContainer) chatContainer.classList.remove('active');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    
    // Hide chats list header when showing settings
    if (chatsListHeader) chatsListHeader.style.display = 'none';

    // On desktop, hide sidebar when showing settings (keep bottom nav visible)
    if (!isMobile) {
      const sidebar = document.querySelector('.sidebar');
      const profileMenu = document.querySelector('.profile-menu-wrapper');
      if (sidebar) {
        sidebar.style.display = 'none';
        sidebar.classList.remove('compact');
      }
      if (profileMenu) {
        if (!this.profileMenuPlaceholder) {
          this.profileMenuPlaceholder = document.createElement('span');
          this.profileMenuPlaceholder.className = 'profile-menu-placeholder';
          profileMenu.parentNode?.insertBefore(this.profileMenuPlaceholder, profileMenu);
        }
        document.body.appendChild(profileMenu);
        profileMenu.classList.add('floating-nav');
      }
    }
    
    // On mobile, hide chats list and search when showing settings
    const searchBox = document.querySelector('.search-box');
    if (chatsList) {
      if (isMobile) {
        chatsList.classList.add('hidden');
        if (searchBox) searchBox.style.display = 'none';
      } else {
        chatsList.classList.remove('hidden-on-settings');
      }
    }

    // On desktop, hide chat container display
    if (!isMobile && chatContainer) {
      chatContainer.style.display = 'none';
    }
    
    try {
      const htmlContent = this.getSettingsTemplate(sectionName);
      if (!htmlContent) {
        console.error('Template not found for:', sectionName);
        return;
      }
      
      settingsContainer.innerHTML = htmlContent;
      settingsContainer.classList.add('active');
      
      // Очищаємо всі попередні секції
      document.querySelectorAll('.settings-section').forEach(section => {
        if (section !== settingsContainer.querySelector('.settings-section')) {
          section.classList.remove('active');
        }
      });
      
      if (isMobile) {
        // На мобільному видаляємо всі позиційні стилі
        settingsContainer.style.cssText = `
          display: flex !important;
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          width: 100% !important;
          height: auto !important;
          z-index: auto !important;
          background-color: transparent !important;
          flex-direction: column !important;
          overflow: visible !important;
          flex: 1;
        `;
      } else {
        // На ПК просто показуємо контейнер як flex item в chat-area (займає місце welcomeScreen)
        settingsContainer.style.cssText = `
          display: flex !important;
          flex: 1 !important;
          flex-direction: column !important;
          width: auto !important;
          height: auto !important;
          position: static !important;
          overflow: hidden !important;
          background-color: var(--bg-color) !important;
        `;
      }
      
      const settingsSection = settingsContainer.querySelector('.settings-section');
      
      if (settingsSection) {
        settingsSection.classList.add('active');
        
        // Force inline styles for section
        settingsSection.style.display = 'flex';
        settingsSection.style.flexDirection = 'column';
        settingsSection.style.height = '100%';
        settingsSection.style.width = '100%';
      }
      
      if (sectionName === 'profile-settings') {
        const profileNameInput = settingsContainer.querySelector('#profileName');
        const profileEmailInput = settingsContainer.querySelector('#profileEmail');
        const profileBioInput = settingsContainer.querySelector('#profileBio');
        const profileDobInput = settingsContainer.querySelector('#profileDob');
        const avatarDiv = settingsContainer.querySelector('.profile-avatar-large');
        
        if (profileNameInput) profileNameInput.value = this.user.name;
        if (profileEmailInput) profileEmailInput.value = this.user.email;
        if (profileBioInput) profileBioInput.value = this.user.bio;
        if (profileDobInput) profileDobInput.value = this.user.birthDate || '';
        
        this.renderProfileAvatar(avatarDiv);

        const avatarUpload = settingsContainer.querySelector('#profileAvatarUpload');
        if (avatarUpload) {
          avatarUpload.addEventListener('change', async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
              await this.showAlert('Файл завеликий. Максимум 2MB.');
              avatarUpload.value = '';
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              this.user.avatarImage = reader.result?.toString() || '';
              this.saveUserProfile(this.user);
              this.renderProfileAvatar(avatarDiv);
            };
            reader.readAsDataURL(file);
          });
        }
        
        const changeAvatarBtn = settingsContainer.querySelector('.btn-change-avatar');
        if (changeAvatarBtn) {
          changeAvatarBtn.addEventListener('click', () => this.handleAvatarChange(settingsContainer));
        }
      }

      if (sectionName === 'profile') {
        const profileName = settingsContainer.querySelector('#profileName');
        const profileStatus = settingsContainer.querySelector('#profileStatus');
        const profileBio = settingsContainer.querySelector('#profileBio');
        const profileEmail = settingsContainer.querySelector('#profileEmail');
        const profileDob = settingsContainer.querySelector('#profileDob');
        const avatarDiv = settingsContainer.querySelector('.profile-avatar-large');
        const editBtn = settingsContainer.querySelector('.profile-edit-btn');
        const fabBtn = settingsContainer.querySelector('.profile-fab');
        const inlineEditBtn = settingsContainer.querySelector('.profile-edit-inline');

        if (profileName) profileName.textContent = this.user.name;
        if (profileStatus) this.renderStatusIndicator(profileStatus);
        if (profileBio) profileBio.textContent = this.user.bio || '';
        if (profileEmail) profileEmail.textContent = this.user.email || '';
        if (profileDob) profileDob.textContent = this.formatBirthDate(this.user.birthDate);

        this.renderProfileAvatar(avatarDiv);
        this.updateProfileMenuButton();

        const openProfileSettings = () => this.showSettings('profile-settings');
        if (editBtn) editBtn.addEventListener('click', openProfileSettings);
        if (fabBtn) fabBtn.addEventListener('click', openProfileSettings);
        if (inlineEditBtn) inlineEditBtn.addEventListener('click', openProfileSettings);
      }

      if (sectionName === 'mini-games') {
        this.initMiniGames(settingsContainer);
      }

      if (sectionName === 'messenger-settings') {
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
          
          // Функція для оновлення градієнта slider
          const updateSliderBackground = (value) => {
            const min = parseInt(fontSizeSlider.min);
            const max = parseInt(fontSizeSlider.max);
            const percentage = ((value - min) / (max - min)) * 100;
            fontSizeSlider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percentage}%, var(--border-color) ${percentage}%, var(--border-color) 100%)`;
          };
          
          // Оновлюємо початковий градієнт
          updateSliderBackground(sliderValue);
          
          this.updateFontPreview(sliderValue, fontSizeDisplay, fontPreview);
          
          fontSizeSlider.addEventListener('input', (e) => {
            const fontSize = parseInt(e.target.value);
            updateSliderBackground(fontSize);
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
      }

      // Обробник кнопки назад для головного меню налаштувань
      const backSettingsBtn = settingsContainer.querySelector('.btn-back-settings');
      if (backSettingsBtn) {
        backSettingsBtn.addEventListener('click', () => {
          settingsContainer.classList.remove('active');
          settingsContainer.style.display = 'none';
          const section = settingsContainer.querySelector('.settings-section');
          if (section) {
            section.classList.remove('active');
          }
          // Restore chat area
          const chatContainer = document.getElementById('chatContainer');
          const welcomeScreen = document.getElementById('welcomeScreen');
          if (chatContainer) chatContainer.style.display = '';
          if (welcomeScreen) welcomeScreen.classList.remove('hidden');
          // Set nav back to chats
          const navChats = document.getElementById('navChats');
          if (navChats) this.setActiveNavButton(navChats);
        });
      }
      
      // Додаємо свайп для повернення назад в підрозділах
      if (sectionName !== 'messenger-settings' && sectionName !== 'profile' && sectionName !== 'calls' && sectionName !== 'mini-games') {
        this.setupSettingsSwipeBack(settingsContainer);
      }
      
      const backBtn = settingsContainer.querySelector('.settings-header button');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          settingsContainer.classList.remove('active');
          const section = settingsContainer.querySelector('.settings-section');
          if (section) {
            section.classList.remove('active');
          }
        });
      }
      
      const themeToggleCheckbox = settingsContainer.querySelector('#themeToggleCheckbox');
      if (themeToggleCheckbox) {
        const isDark = document.documentElement.classList.contains('dark-theme');
        themeToggleCheckbox.checked = isDark;
        
        themeToggleCheckbox.addEventListener('change', () => {
          this.toggleTheme();
          themeToggleCheckbox.checked = document.documentElement.classList.contains('dark-theme');
        });
      }
      
      const closeButtons = settingsContainer.querySelectorAll('.btn-secondary');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          settingsContainer.classList.remove('active');
        });
      });
      
      const saveProfileBtn = settingsContainer.querySelector('.btn-save-profile');
      if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
          this.saveProfileSettings();
        });
      }
      
      const saveMessengerBtn = settingsContainer.querySelector('.btn-save-messenger');
      if (saveMessengerBtn) {
        saveMessengerBtn.addEventListener('click', () => {
          this.saveMessengerSettings();
        });
      }
      
    } catch (error) {
      console.error('Error loading settings:', error);
      settingsContainer.innerHTML = '<p>Помилка завантаження розділу</p>';
    }
  }

  async saveProfileSettings() {
    const container = document.getElementById('profile-settings');
    const name = container?.querySelector('#profileName')?.value;
    const email = container?.querySelector('#profileEmail')?.value;
    const bio = container?.querySelector('#profileBio')?.value;
    const birthDate = container?.querySelector('#profileDob')?.value;
    
    if (!name) {
      await this.showAlert('Будь ласка, введіть ім\'я');
      return;
    }
    
    const profileData = {
      name: name.trim(),
      email: email?.trim() || '',
      status: this.user.status || 'online',
      bio: bio?.trim() || '',
      birthDate: birthDate?.trim() || '',
      avatarColor: this.user.avatarColor,
      avatarImage: this.user.avatarImage || ''
    };
    
    this.saveUserProfile(profileData);
    await this.showAlert('Налаштування профілю збережено!');
    
    if (this.currentChat) {
      this.renderChat();
    }
  }

  async saveMessengerSettings() {
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
    }
    
    const settings = {
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
    };
    
    this.saveSettings(settings);
    
    this.applyFontSize(fontSize);
    
    await this.showAlert('Налаштування месенджера збережено!');
  }

  applyFontSize(size) {
    const root = document.documentElement;
    switch(size) {
      case 'small':
        root.style.fontSize = '12px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'medium':
      default:
        root.style.fontSize = '16px';
    }
  }

  handleAvatarChange(settingsContainer) {
    const colors = [
      'linear-gradient(135deg, #ff9500, #ff6b6b)',
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #30cfd0, #330867)',
      'linear-gradient(135deg, #a8edea, #fed6e3)'
    ];

    let colorIndex = colors.findIndex(c => c === this.user.avatarColor);
    if (colorIndex === -1) colorIndex = 0;
    
    colorIndex = (colorIndex + 1) % colors.length;
    const newColor = colors[colorIndex];
    
    const avatarDiv = settingsContainer.querySelector('.profile-avatar-large');
    this.user.avatarColor = newColor;
    this.user.avatarImage = '';

    if (avatarDiv) {
      this.renderProfileAvatar(avatarDiv);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChatApp();
});
