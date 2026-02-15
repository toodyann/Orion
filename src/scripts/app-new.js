import { Storage } from './storage.js';
import { getContactColor, escapeHtml, formatMessageDateTime, insertAtCursor, applyFontSize } from './utils.js';
import { ModalManager } from './modals.js';

class ChatApp {
  constructor() {
    this.chats = Storage.loadChats();
    this.currentChat = null;
    this.user = Storage.loadUser();
    this.settings = Storage.loadSettings();
    this.editingMessageId = null;
    this.replyTarget = null;
    this.messageMenuState = { id: null, from: null, text: '' };
    this.chatListMenuState = { id: null, name: '' };
    this.addToGroupTarget = null;
    Storage.loadTheme();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupModalEnterHandlers();
    this.renderChatsList();
    applyFontSize(this.settings.fontSize);
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    Storage.saveTheme(isDark);
  }

  // Використовуємо функції з utils.js
  getContactColor(name) {
    return getContactColor(name);
  }

  escapeHtml(text) {
    return escapeHtml(text);
  }

  insertAtCursor(input, text) {
    return insertAtCursor(input, text);
  }

  formatMessageDateTime(date, time) {
    return formatMessageDateTime(date, time);
  }

  // Використовуємо ModalManager
  showAlert(message, title = 'Повідомлення') {
    return ModalManager.showAlert(message, title);
  }

  showConfirm(message, title = 'Підтвердження') {
    return ModalManager.showConfirm(message, title);
  }

  saveUserProfile(userData) {
    this.user = userData;
    Storage.saveUser(userData);
  }

  saveSettings(settingsData) {
    this.settings = settingsData;
    Storage.saveSettings(settingsData);
  }

  saveChats() {
    Storage.saveChats(this.chats);
  }

  applyFontSize(size) {
    applyFontSize(size);
  }

  // Решта методів без змін...
  // (Всі методи з оригінального app.js, окрім тих що винесені в модулі)

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

  setupEventListeners() {
    document.getElementById('newChatBtn').addEventListener('click', () => this.openNewChatModal());
    document.getElementById('closeModalBtn').addEventListener('click', () => this.closeNewChatModal());
    document.getElementById('cancelBtn').addEventListener('click', () => this.closeNewChatModal());
    document.getElementById('confirmBtn').addEventListener('click', () => this.createNewChat());
    document.getElementById('modalOverlay').addEventListener('click', () => this.closeNewChatModal());
    
    const profileMenuBtn = document.getElementById('profileMenuBtn');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileMenuBtn && closeMenuBtn && profileMenu) {
      profileMenuBtn.addEventListener('click', () => {
        profileMenu.classList.toggle('active');
      });
      
      closeMenuBtn.addEventListener('click', () => {
        profileMenu.classList.remove('active');
      });
    }
    
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.showSettings(section);
        profileMenu.classList.remove('active');
      });
    });
    
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

  renderChatsList() {
    const chatsList = document.getElementById('chatsList');
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
    this.renderChat(newMessage.id);
    this.renderChatsList();

    this.simulateResponse();
  }

  simulateResponse() {
    setTimeout(() => {
      if (!this.currentChat) return;

      const responses = [
        'пох',
        'Не гони',
        'Внатурі?',
        'Шариш?',
        'Іб чотко',
        'Чотінько',
        'Нах пішов',
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const now = new Date();
      const time = now.getHours().toString().padStart(2, '0') + ':' + 
                   now.getMinutes().toString().padStart(2, '0');

      const response = {
        id: this.getNextMessageId(this.currentChat),
        text: randomResponse,
        from: 'other',
        time: time,
        date: now.toISOString().slice(0,10)
      };

      this.currentChat.messages.push(response);
      this.saveChats();
      this.renderChat(response.id);
    }, 1000 + Math.random() * 2000);
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
    const existing = this.chats.find(c => (c.name || '').toLowerCase().trim() === normalized);
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

  async showSettings(sectionName) {
    const settingsContainer = document.getElementById('settingsContainer');
    
    try {
      let htmlContent = '';
      
      switch(sectionName) {
        case 'profile-settings':
          const profileResponse = await fetch('./src/html/profile-settings.html');
          htmlContent = await profileResponse.text();
          break;
        case 'messenger-settings':
          const messengerResponse = await fetch('./src/html/messenger-settings.html');
          htmlContent = await messengerResponse.text();
          break;
        case 'about':
          const aboutResponse = await fetch('./src/html/about.html');
          htmlContent = await aboutResponse.text();
          break;
        case 'help':
          const helpResponse = await fetch('./src/html/help.html');
          htmlContent = await helpResponse.text();
          break;
      }
      
      settingsContainer.innerHTML = htmlContent;
      settingsContainer.classList.add('active');
      
      const settingsSection = settingsContainer.querySelector('.settings-section');
      if (settingsSection) {
        settingsSection.classList.add('active');
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
    const fontSize = document.getElementById('fontSize')?.value || 'medium';
    
    const settings = {
      soundNotifications,
      desktopNotifications,
      showOnlineStatus,
      showTypingIndicator,
      fontSize
    };
    
    this.saveSettings(settings);
    this.applyFontSize(fontSize);
    
    await this.showAlert('Налаштування месенджера збережено!');
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
