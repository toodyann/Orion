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
    this.loadTheme();
    this.init();
  }

  loadUserProfile() {
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
  }

  saveUserProfile(userData) {
    this.user = userData;
    localStorage.setItem('bridge_user', JSON.stringify(userData));
    this.updateProfileMenuButton();
  }

  updateProfileMenuButton() {
    const navProfile = document.getElementById('navProfile');
    if (!navProfile) return;

    const avatarEl = navProfile.querySelector('.nav-avatar');

    const name = this.user?.name || 'Користувач Orion';

    if (avatarEl) {
      const initials = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      avatarEl.textContent = initials;
      avatarEl.style.background = this.user?.avatarColor || this.getContactColor(name);
    }
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

  getContactColor(name) {
    const baseColors = [
      '#FF6B6B', // red
      '#4ECDC4', // teal
      '#45B7D1', // blue
      '#FFA07A', // light salmon
      '#98D8C8', // mint
      '#F7DC6F', // yellow
      '#BB8FCE', // purple
      '#85C1E9', // light blue
      '#FF9F43', // orange
      '#6FCF97'  // green
    ];

    if (!name) return baseColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    const idx1 = Math.abs(hash) % baseColors.length;
    const idx2 = Math.abs((hash >> 3)) % baseColors.length;
    const c1 = baseColors[idx1];
    const c2 = baseColors[idx2];
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('bridge_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('bridge_theme', 'light');
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
    this.setupMobileSwipeBack();
  }

  setupMobileSwipeBack() {
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
      if (window.innerWidth > 768 || !this.currentChat) return;
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      dragging = true;
      active = false;
      lastTranslate = 0;
    };

    const onMove = (e) => {
      if (!dragging || window.innerWidth > 768 || !this.currentChat) return;
      
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
        this.closeChat();
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
    
    if (navCalls) {
      navCalls.addEventListener('click', () => {
        this.setActiveNavButton(navCalls);
        this.showSettings('calls');
      });
    }
    
    if (navChats) {
      navChats.addEventListener('click', () => {
        this.setActiveNavButton(navChats);
        // Show chats list and hide settings
        const settingsContainer = document.getElementById('settingsContainer');
        const settingsContainerMobile = document.getElementById('settingsContainerMobile');
        const chatsList = document.getElementById('chatsList');
        const chatContainer = document.getElementById('chatContainer');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (settingsContainer) {
          settingsContainer.classList.remove('active');
          settingsContainer.style.display = 'none';
        }
        if (settingsContainerMobile) {
          settingsContainerMobile.classList.remove('active');
          settingsContainerMobile.style.display = 'none';
        }
        if (chatsList) chatsList.classList.remove('hidden');
        
        // Clear current chat and show welcome screen
        this.currentChat = null;
        if (chatContainer) {
          chatContainer.classList.remove('active');
          chatContainer.style.display = 'none';
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

    document.getElementById('backBtn').addEventListener('click', () => this.closeChat());

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

  showAlert(message, title = 'Повідомлення') {
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

  showConfirm(message, title = 'Підтвердження') {
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

  setupEmojiPicker() {
    const emojiBtn = document.querySelector('.btn-emoji');
    const inputWrapper = document.querySelector('.input-wrapper');
    const input = document.getElementById('messageInput');

    if (!emojiBtn || !inputWrapper || !input) return;

    const picker = document.createElement('div');
    picker.className = 'emoji-picker';
    picker.style.display = 'none';

    const emojis = ['😀','😁','😂','🤣','😊','😍','😅','😎','😢','😡','👍','👎','🙌','🎉','❤️','😄','🤔','🤷','🙈','🔥','✨','🤝','🥳','🤩','👏'];

    emojis.forEach(e => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-item';
      btn.textContent = e;
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        this.insertAtCursor(input, e);
        input.focus();
        picker.style.display = 'none';
      });
      picker.appendChild(btn);
    });

    inputWrapper.appendChild(picker);

    emojiBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      picker.style.display = picker.style.display === 'none' ? 'grid' : 'none';
    });

    document.addEventListener('click', (e) => {
      if (!inputWrapper.contains(e.target)) {
        picker.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') picker.style.display = 'none';
    });
  }

  insertAtCursor(input, text) {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = input.value || '';
    input.value = value.slice(0, start) + text + value.slice(end);
    const pos = start + text.length;
    input.setSelectionRange(pos, pos);
    input.dispatchEvent(new Event('input', { bubbles: true }));
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
    try {
      const appEl = document.querySelector('.bridge-app');
      const sidebar = document.querySelector('.sidebar');
      const sidebarOverlay = document.getElementById('sidebarOverlay');
      
      if (window.innerWidth <= 768) {
        if (appEl) appEl.classList.add('mobile-chat-open');
        if (sidebar) {
          sidebar.classList.add('hidden');
          sidebar.classList.remove('active', 'mobile-menu');
        }
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
      }
    } catch (e) {
    }
  }

  closeChat() {
    this.currentChat = null;
    document.getElementById('messageInput').value = '';
    this.renderChatsList();
    this.showWelcomeScreen();
    this.clearMessages();
    try {
      const appEl = document.querySelector('.bridge-app');
      const sidebar = document.querySelector('.sidebar');
      
      if (window.innerWidth <= 768) {
        if (appEl) appEl.classList.remove('mobile-chat-open');
        if (sidebar) sidebar.classList.remove('hidden');
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
        const initials = this.user.name.split(' ').map(w => w[0]).join('').toUpperCase();
        avatarHtml = `<div class="message-avatar" style="background: ${this.user.avatarColor}">${initials}</div>`;
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
    const header = document.getElementById('chatHeader');
    const contactName = document.getElementById('contactName');
    const contactStatus = document.getElementById('contactStatus');
    const avatar = document.querySelector('.contact-info .avatar');
    const contactDetails = document.querySelector('.contact-info');

    if (this.currentChat) {
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
      const initials = this.user.name.split(' ').map(w => w[0]).join('').toUpperCase();
      avatarHtml = `<div class="message-avatar" style="background: ${this.user.avatarColor}">${initials}</div>`;
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getSettingsTemplate(sectionName) {
    const templates = {
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
      >
Привіт! Я користувач Orion месенджера.</textarea>
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
      `.trim(),
      'privacy-settings': `
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
      `.trim(),
      'messages-settings': `
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
      `.trim(),
      'appearance-settings': `
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
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
      <h3>Немає дзвінків</h3>
      <p>Поки що історія дзвінків порожня. Зробіть перший дзвінок контакту!</p>
    </div>
  </div>
</div>
      `.trim()
    };

    return templates[sectionName] || '';
  }

  setActiveNavButton(btn) {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    if (btn) {
      btn.classList.add('active');
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

  setupSettingsSwipeBack(settingsContainer) {
    if (window.innerWidth > 768) return; // Тільки для мобільних

    let startX = 0;
    let startY = 0;
    let dragging = false;
    let active = false;
    let lastTranslate = 0;

    const onStart = (e) => {
      if (window.innerWidth > 768) return;
      if (e.touches.length !== 1) return;
      
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
        if (dx < 0) return; // Ігноруємо свайп вліво
        active = true;
      }

      const distance = Math.min(Math.max(0, dx), window.innerWidth * 0.5);
      lastTranslate = distance;

      settingsContainer.style.transition = 'none';
      settingsContainer.style.transform = `translateX(${distance}px)`;
      settingsContainer.style.opacity = 1 - (distance / (window.innerWidth * 0.5)) * 0.3;

      if (active) e.preventDefault();
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;

      if (!active) return;

      settingsContainer.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

      const shouldGoBack = lastTranslate > window.innerWidth * 0.25;

      if (shouldGoBack) {
        settingsContainer.style.transform = `translateX(${window.innerWidth}px)`;
        settingsContainer.style.opacity = '0';
        setTimeout(() => {
          settingsContainer.style.transition = '';
          this.showSettings('messenger-settings');
        }, 300);
      } else {
        settingsContainer.style.transform = '';
        settingsContainer.style.opacity = '';
        setTimeout(() => {
          settingsContainer.style.transition = '';
        }, 300);
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

  async showSettings(sectionName) {
    // На мобільному використовуємо settingsContainerMobile, на ПК - settingsContainer
    const isMobile = window.innerWidth <= 768;
    const settingsContainerId = isMobile ? 'settingsContainerMobile' : 'settingsContainer';
    const settingsContainer = document.getElementById(settingsContainerId);
    
    const chatContainer = document.getElementById('chatContainer');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatsList = document.getElementById('chatsList');
    
    // Hide chat and welcome screen
    if (chatContainer) chatContainer.classList.remove('active');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    
    // On mobile, hide chats list when showing settings
    if (chatsList) {
      if (isMobile) {
        chatsList.classList.add('hidden');
      } else {
        chatsList.classList.remove('hidden-on-settings');
      }
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
        const profileStatusInput = settingsContainer.querySelector('#profileStatus');
        const profileBioInput = settingsContainer.querySelector('#profileBio');
        const avatarDiv = settingsContainer.querySelector('.profile-avatar-large');
        
        if (profileNameInput) profileNameInput.value = this.user.name;
        if (profileEmailInput) profileEmailInput.value = this.user.email;
        if (profileStatusInput) profileStatusInput.value = this.user.status;
        if (profileBioInput) profileBioInput.value = this.user.bio;
        
        if (avatarDiv) {
          const initials = this.user.name.split(' ').map(w => w[0]).join('').toUpperCase();
          avatarDiv.style.background = this.user.avatarColor;
          avatarDiv.innerHTML = `<span style="color: white; font-size: 32px; font-weight: 600;">${initials}</span>`;
        }
        
        const changeAvatarBtn = settingsContainer.querySelector('.btn-change-avatar');
        if (changeAvatarBtn) {
          changeAvatarBtn.addEventListener('click', () => this.handleAvatarChange(settingsContainer));
        }
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
      
      // Додаємо свайп для повернення назад в підрозділах
      if (sectionName !== 'messenger-settings' && sectionName !== 'profile' && sectionName !== 'calls') {
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
    const name = document.getElementById('profileName')?.value;
    const email = document.getElementById('profileEmail')?.value;
    const status = document.getElementById('profileStatus')?.value;
    const bio = document.getElementById('profileBio')?.value;
    
    if (!name) {
      await this.showAlert('Будь ласка, введіть ім\'я');
      return;
    }
    
    const profileData = {
      name: name.trim(),
      email: email?.trim() || '',
      status: status?.trim() || 'Доступний',
      bio: bio?.trim() || '',
      avatarColor: this.user.avatarColor
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
    if (avatarDiv) {
      const initials = this.user.name.split(' ').map(w => w[0]).join('').toUpperCase();
      avatarDiv.style.background = newColor;
      avatarDiv.innerHTML = `<span style="color: white; font-size: 32px; font-weight: 600;">${initials}</span>`;
    }
    
    this.user.avatarColor = newColor;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChatApp();
});
