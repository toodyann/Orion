import { ChatAppCoreMethods } from './app-modules/core-methods.js';
import { ChatAppInteractionMethods } from './app-modules/interaction-methods.js';
import { ChatAppMessagingMethods } from './app-modules/messaging-methods.js';
import { ChatAppFeaturesMethods } from './app-modules/features-methods.js';
import { ChatAppProfileMethods } from './app-modules/profile-methods.js';
import { ChatAppShopMethods } from './app-modules/shop-methods.js';
import { ChatAppGamesMethods } from './app-modules/games-methods.js';
import { ChatAppChatRenderMethods } from './app-modules/chat-render-methods.js';
import { ChatAppComposerMethods } from './app-modules/composer-methods.js';

function attachMethods(targetClass, sourceClass) {
  Object.getOwnPropertyNames(sourceClass.prototype).forEach((methodName) => {
    if (methodName === 'constructor') return;
    const descriptor = Object.getOwnPropertyDescriptor(sourceClass.prototype, methodName);
    if (descriptor) {
      Object.defineProperty(targetClass.prototype, methodName, descriptor);
    }
  });
}

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
    this.lastSendTriggerAt = 0;
    this.forceComposerFocusUntil = 0;
    this.attachSheetOpen = false;
    this.nativePickerOpen = false;
    this.nativePickerResetTimer = null;
    this.cameraCaptureOpen = false;
    this.cameraStream = null;
    this.cameraFacingMode = 'environment';
    this.voiceRecorder = null;
    this.voiceRecordingStream = null;
    this.voiceRecordingChunks = [];
    this.voiceRecordingStartedAt = 0;
    this.voiceRecordingActive = false;
    this.voiceRecordingDiscarded = false;
    this.activeVoiceAudio = null;
    this.chatEnterAnimation = null;
    this.chatCloseAnimation = null;
    this.attachSheetTouchStartY = 0;
    this.attachSheetTouchCurrentY = 0;
    this.attachSheetTouchDragging = false;
    this.mobileScrollLockY = 0;
    this.mobileScrollLocked = false;
    this.mobileTouchMoveLockHandler = null;
    this.bottomNavHomeAnchor = null;
    this.bottomNavInSidebarTop = false;
    this.settingsParentSection = 'messenger-settings';
    this.imageViewerState = null;
    this.loadTheme();
    this.profileMenuPlaceholder = null;
    this.init();
  }
}

attachMethods(ChatApp, ChatAppCoreMethods);
attachMethods(ChatApp, ChatAppInteractionMethods);
attachMethods(ChatApp, ChatAppMessagingMethods);
attachMethods(ChatApp, ChatAppFeaturesMethods);
attachMethods(ChatApp, ChatAppProfileMethods);
attachMethods(ChatApp, ChatAppShopMethods);
attachMethods(ChatApp, ChatAppGamesMethods);
attachMethods(ChatApp, ChatAppChatRenderMethods);
attachMethods(ChatApp, ChatAppComposerMethods);

document.addEventListener('DOMContentLoaded', () => {
  window.app = new ChatApp();
});
