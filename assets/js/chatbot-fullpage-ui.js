// // ============================================
// // CHATBOT FULL PAGE UI v4.1 - VERSION FIREBASE + WALL STREET PRO
// // ✅ NOUVEAU v4.1: Firebase Serialization Fix (Nested Arrays)
// // ✅ v4.0: Firebase Integration (Cloud Storage)
// // ✅ v3.2: Photo de profil utilisateur Firebase (LOGIQUE LANDING.JS)
// // ✅ v3.1: Sauvegarde et restauration des graphiques
// // ✅ FIX: Chart routing method added
// // Visual Cards + Metrics Tables + Comparison Charts
// // No emojis version
// // ============================================

// class ChatbotFullPageUI {
//     constructor(config) {
//         this.config = config;
//         this.engine = null;
//         this.charts = null;
//         this.suggestions = null;
        
//         this.elements = {};
//         this.isTyping = false;
//         this.messageCount = 0;
//         this.chartCount = 0;
//         this.totalResponseTime = 0;
        
//         this.conversations = [];
//         this.currentConversationId = null;
        
//         // ✅ FIREBASE: Variables
//         this.db = null;
//         this.currentUser = null;
//         this.firebaseReady = false;
        
//         // Clés de stockage (fallback)
//         this.conversationsKey = 'alphy_conversations';
//         this.chartsDataKey = 'alphy_charts_data';
        
//         this.sidebarCollapsed = this.loadSidebarState();
        
//         this.init();
//     }

//     async init() {
//         try {
//             console.log('🚀 Initializing Full Page UI v4.1 (Firebase + Serialization Fix)...');
            
//             // ✅ FIREBASE: Attendre l'initialisation
//             await this.waitForFirebase();
            
//             await new Promise(resolve => setTimeout(resolve, 100));
            
//             this.cacheElements();
//             this.createReopenButton();
//             this.attachEventListeners();
//             await this.initializeComponents();
            
//             // ✅ FIREBASE: Charger depuis Firebase ou localStorage
//             await this.loadConversations();
            
//             this.applySidebarState();
            
//             if (typeof initializeParticles === 'function') {
//                 initializeParticles();
//             }
            
//             console.log('✅ Full Page UI v4.1 initialized successfully');
            
//         } catch (error) {
//             console.error('❌ Full Page UI initialization error:', error);
//         }
//     }

//     // ============================================
//     // ✅ FIREBASE: INITIALIZATION
//     // ============================================
    
//     /**
//      * Attendre que Firebase et ChatbotModals soient prêts
//      */
//     async waitForFirebase() {
//         return new Promise((resolve) => {
//             const maxWait = 5000; // 5 secondes max
//             const startTime = Date.now();
            
//             const checkFirebase = () => {
//                 // Vérifier si chatbotModals existe et est initialisé
//                 if (window.chatbotModals && window.chatbotModals.currentUser) {
//                     this.db = window.chatbotModals.db;
//                     this.currentUser = window.chatbotModals.currentUser;
//                     this.firebaseReady = true;
//                     console.log('✅ Firebase ready for chatbot UI');
//                     resolve();
//                     return;
//                 }
                
//                 // Timeout après 5 secondes
//                 if (Date.now() - startTime > maxWait) {
//                     console.warn('⚠ Firebase timeout - using localStorage fallback');
//                     this.firebaseReady = false;
//                     resolve();
//                     return;
//                 }
                
//                 // Réessayer dans 200ms
//                 setTimeout(checkFirebase, 200);
//             };
            
//             checkFirebase();
//         });
//     }

//     // ============================================
//     // USER PROFILE PHOTO MANAGEMENT (v3.2 - LOGIQUE LANDING.JS)
//     // ============================================
    
//     /**
//      * Récupère la photo de profil de l'utilisateur Firebase
//      * UTILISE EXACTEMENT LA MÊME LOGIQUE QUE LANDING.JS
//      * @returns {string} URL de la photo ou avatar par défaut
//      */
//     getUserProfilePhoto() {
//         try {
//             // Vérifier si Firebase Auth est disponible
//             if (typeof firebase === 'undefined' || !firebase.auth) {
//                 return 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff&bold=true&size=128';
//             }
            
//             // Récupérer l'utilisateur actuel
//             const user = firebase.auth().currentUser;
            
//             if (!user) {
//                 return 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff&bold=true&size=128';
//             }
            
//             // MÊME LOGIQUE QUE LANDING.JS
//             const displayName = user.displayName || user.email?.split('@')[0] || 'User';
            
//             // Si photoURL existe, l'utiliser (priorité 1)
//             if (user.photoURL) {
//                 return user.photoURL;
//             }
            
//             // Sinon, générer un avatar avec ui-avatars.com
//             return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&bold=true&size=128`;
            
//         } catch (error) {
//             console.error('Error getting user profile photo:', error);
//             return 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff&bold=true&size=128';
//         }
//     }

//     /**
//      * Génère le HTML de l'avatar utilisateur avec photo
//      * @returns {string} HTML de l'avatar
//      */
//     getUserAvatarHTML() {
//         const photoURL = this.getUserProfilePhoto();
//         return `<img src="${photoURL}" 
//                      alt="User Avatar" 
//                      class="user-avatar-img"
//                      onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff&bold=true&size=128';">`;
//     }

//     // ============================================
//     // ELEMENTS CACHING
//     // ============================================

//     cacheElements() {
//         this.elements = {
//             messages: document.getElementById('chatbot-messages-content'),
//             welcomeScreen: document.getElementById('welcome-screen'),
//             input: document.getElementById('chatbot-input'),
//             sendBtn: document.getElementById('chatbot-send-btn'),
//             inputClearBtn: document.getElementById('input-clear-btn'),
//             inputSuggestions: document.getElementById('input-suggestions'),
//             inputCounter: document.getElementById('input-counter'),
            
//             newChatBtn: document.getElementById('new-chat-btn'),
//             shareBtn: document.getElementById('share-btn'),
//             settingsBtn: document.getElementById('settings-btn'),
            
//             conversationsSidebar: document.getElementById('conversations-sidebar'),
//             conversationsToggle: document.getElementById('conversations-toggle'),
//             conversationsList: document.getElementById('conversations-list'),
            
//             chatMessagesArea: document.querySelector('.chat-messages-area')
//         };
        
//         console.log('Elements cached');
//     }

//     createReopenButton() {
//         if (!this.elements.chatMessagesArea) return;
        
//         const reopenBtn = document.createElement('button');
//         reopenBtn.className = 'sidebar-reopen-btn';
//         reopenBtn.id = 'sidebar-reopen-btn';
//         reopenBtn.setAttribute('aria-label', 'Open conversations sidebar');
//         reopenBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
//         this.elements.chatMessagesArea.insertBefore(reopenBtn, this.elements.chatMessagesArea.firstChild);
//         this.elements.reopenBtn = reopenBtn;
        
//         console.log('Reopen button created');
//     }

//     attachEventListeners() {
//         if (this.elements.reopenBtn) {
//             this.elements.reopenBtn.addEventListener('click', () => {
//                 this.toggleConversationsSidebar();
//             });
//         }
        
//         const welcomeSuggestions = document.querySelectorAll('.welcome-suggestion-btn');
//         welcomeSuggestions.forEach(btn => {
//             btn.addEventListener('click', () => {
//                 const query = btn.dataset.query;
//                 if (query) {
//                     this.sendMessage(query);
//                 }
//             });
//         });
        
//         if (this.elements.input) {
//             this.elements.input.addEventListener('keydown', (e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) {
//                     e.preventDefault();
//                     this.sendMessage();
//                 }
//             });
            
//             this.elements.input.addEventListener('input', () => {
//                 this.autoResizeTextarea();
//                 this.updateCharCounter();
//             });
//         }
        
//         if (this.elements.sendBtn) {
//             this.elements.sendBtn.addEventListener('click', () => {
//                 this.sendMessage();
//             });
//         }
        
//         if (this.elements.inputClearBtn) {
//             this.elements.inputClearBtn.addEventListener('click', () => {
//                 if (this.elements.input) {
//                     this.elements.input.value = '';
//                     this.autoResizeTextarea();
//                     this.updateCharCounter();
//                     this.elements.input.focus();
//                 }
//             });
//         }
        
//         if (this.elements.inputSuggestions) {
//             this.elements.inputSuggestions.addEventListener('click', (e) => {
//                 if (e.target.classList.contains('input-suggestion-chip')) {
//                     this.sendMessage(e.target.textContent);
//                 }
//             });
//         }
        
//         if (this.elements.newChatBtn) {
//             this.elements.newChatBtn.addEventListener('click', () => {
//                 this.startNewConversation();
//             });
//         }
        
//         if (this.elements.conversationsToggle) {
//             this.elements.conversationsToggle.addEventListener('click', () => {
//                 this.toggleConversationsSidebar();
//             });
//         }
        
//         if (this.elements.conversationsList) {
//             this.elements.conversationsList.addEventListener('click', (e) => {
//                 const item = e.target.closest('.conversation-item');
//                 const deleteBtn = e.target.closest('.conversation-delete');
                
//                 if (deleteBtn && item) {
//                     e.stopPropagation();
//                     this.deleteConversation(item.dataset.id);
//                 } else if (item) {
//                     this.loadConversation(item.dataset.id);
//                 }
//             });
//         }
        
//         console.log('Event listeners attached');
//     }

//     async initializeComponents() {
//         if (typeof ChatbotAIEngine !== 'undefined') {
//             this.engine = new ChatbotAIEngine(this.config);
//             await this.engine.initialize(); // ✅ AJOUT CRITIQUE
//             console.log('✅ Engine initialized');
//         } else {
//             console.error('❌ ChatbotAIEngine not found');
//         }
        
//         if (typeof ChatbotCharts !== 'undefined') {
//             this.charts = new ChatbotCharts(this.config);
//             console.log('✅ Charts initialized');
//         }
        
//         if (typeof ChatbotSuggestions !== 'undefined') {
//             this.suggestions = new ChatbotSuggestions(this.config);
//             console.log('✅ Suggestions initialized');
//         }
//     }

//     // ============================================
//     // SIDEBAR TOGGLE MANAGEMENT
//     // ============================================
    
//     toggleConversationsSidebar() {
//         this.sidebarCollapsed = !this.sidebarCollapsed;
//         this.applySidebarState();
//         this.saveSidebarState();
        
//         console.log(`Sidebar ${this.sidebarCollapsed ? 'closed' : 'opened'}`);
//     }
    
//     applySidebarState() {
//         if (!this.elements.conversationsSidebar) return;
        
//         if (this.sidebarCollapsed) {
//             this.elements.conversationsSidebar.classList.add('collapsed');
//         } else {
//             this.elements.conversationsSidebar.classList.remove('collapsed');
//         }
//     }
    
//     saveSidebarState() {
//         try {
//             localStorage.setItem('alphy_sidebar_collapsed', JSON.stringify(this.sidebarCollapsed));
//         } catch (e) {
//             console.warn('Could not save sidebar state:', e);
//         }
//     }
    
//     loadSidebarState() {
//         try {
//             const saved = localStorage.getItem('alphy_sidebar_collapsed');
//             return saved ? JSON.parse(saved) : false;
//         } catch (e) {
//             console.warn('Could not load sidebar state:', e);
//             return false;
//         }
//     }

//     // ============================================
//     // ✅ FIREBASE: CONVERSATIONS MANAGEMENT
//     // ============================================
    
//     /**
//      * ✅ FIREBASE: Charger les conversations (Firebase ou localStorage)
//      */
//     async loadConversations() {
//         if (this.firebaseReady && this.currentUser) {
//             console.log('📚 Loading conversations from Firebase...');
//             await this.loadConversationsFromFirebase();
//         } else {
//             console.log('📚 Loading conversations from localStorage (fallback)...');
//             this.loadConversationsFromLocalStorage();
//         }
        
//         if (this.conversations.length === 0) {
//             this.startNewConversation();
//         } else {
//             this.currentConversationId = this.conversations[0].id;
//             await this.loadConversation(this.currentConversationId);
//         }
        
//         this.renderConversations();
//     }

//     /**
//      * ✅ FIREBASE: Charger depuis Firebase (avec désérialisation - v4.1)
//      */
//     async loadConversationsFromFirebase() {
//         if (!this.firebaseReady || !this.currentUser) return;
        
//         try {
//             const snapshot = await this.db.collection('users')
//                 .doc(this.currentUser.uid)
//                 .collection('conversations')
//                 .orderBy('updatedAt', 'desc')
//                 .limit(50)
//                 .get();
            
//             this.conversations = [];
            
//             snapshot.forEach(doc => {
//                 const data = doc.data();
                
//                 // ✅ v4.1: Désérialiser les messages
//                 const deserializedMessages = (data.messages || []).map(msg => {
//                     const deserializedMsg = {
//                         type: msg.type,
//                         content: msg.content,
//                         timestamp: msg.timestamp
//                     };
                    
//                     // Désérialiser chartRequests et visualCards depuis JSON strings
//                     if (msg.chartRequests) {
//                         try {
//                             deserializedMsg.chartRequests = typeof msg.chartRequests === 'string' 
//                                 ? JSON.parse(msg.chartRequests) 
//                                 : msg.chartRequests;
//                         } catch (e) {
//                             console.warn('Failed to parse chartRequests:', e);
//                             deserializedMsg.chartRequests = null;
//                         }
//                     }
                    
//                     if (msg.visualCards) {
//                         try {
//                             deserializedMsg.visualCards = typeof msg.visualCards === 'string'
//                                 ? JSON.parse(msg.visualCards)
//                                 : msg.visualCards;
//                         } catch (e) {
//                             console.warn('Failed to parse visualCards:', e);
//                             deserializedMsg.visualCards = null;
//                         }
//                     }
                    
//                     return deserializedMsg;
//                 });
                
//                 this.conversations.push({
//                     id: doc.id,
//                     title: data.title || 'New Conversation',
//                     messages: deserializedMessages, // ✅ Messages désérialisés
//                     createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
//                     updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now()
//                 });
//             });
            
//             console.log(`✅ Loaded ${this.conversations.length} conversations from Firebase`);
//         } catch (error) {
//             console.error('❌ Firebase load error:', error);
//             this.loadConversationsFromLocalStorage();
//         }
//     }

//     /**
//      * Charger depuis localStorage (fallback)
//      */
//     loadConversationsFromLocalStorage() {
//         const saved = localStorage.getItem(this.conversationsKey);
//         if (saved) {
//             this.conversations = JSON.parse(saved);
//             console.log(`Loaded ${this.conversations.length} conversations from localStorage`);
//         } else {
//             this.conversations = [];
//         }
//     }

//     /**
//      * ✅ FIREBASE: Sauvegarder les conversations
//      */
//     async saveConversations() {
//         if (this.firebaseReady && this.currentUser) {
//             await this.saveConversationsToFirebase();
//         } else {
//             this.saveConversationsToLocalStorage();
//         }
//     }

//     /**
//      * ✅ FIREBASE: Sauvegarder dans Firebase (avec sérialisation - v4.1)
//      */
//     async saveConversationsToFirebase() {
//         if (!this.firebaseReady || !this.currentUser) return;
        
//         const conv = this.getCurrentConversation();
//         if (!conv) return;
        
//         try {
//             const docRef = this.db.collection('users')
//                 .doc(this.currentUser.uid)
//                 .collection('conversations')
//                 .doc(conv.id);
            
//             // ✅ v4.1: Sérialiser les messages pour éviter "nested arrays"
//             const serializedMessages = conv.messages.map(msg => {
//                 const serializedMsg = {
//                     type: msg.type,
//                     content: msg.content,
//                     timestamp: msg.timestamp
//                 };
                
//                 // Sérialiser chartRequests et visualCards en JSON strings
//                 if (msg.chartRequests) {
//                     serializedMsg.chartRequests = JSON.stringify(msg.chartRequests);
//                 }
                
//                 if (msg.visualCards) {
//                     serializedMsg.visualCards = JSON.stringify(msg.visualCards);
//                 }
                
//                 return serializedMsg;
//             });
            
//             await docRef.set({
//                 id: conv.id,
//                 title: conv.title,
//                 messages: serializedMessages, // ✅ Messages sérialisés
//                 createdAt: firebase.firestore.Timestamp.fromMillis(conv.createdAt),
//                 updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
//                 messageCount: conv.messages.length
//             });
            
//             console.log('💾 Conversation saved to Firebase:', conv.id);
//         } catch (error) {
//             console.error('❌ Firebase save error:', error);
//             this.saveConversationsToLocalStorage();
//         }
//     }

//     /**
//      * Sauvegarder dans localStorage (fallback)
//      */
//     saveConversationsToLocalStorage() {
//         try {
//             localStorage.setItem(this.conversationsKey, JSON.stringify(this.conversations));
//             console.log('💾 Conversations saved to localStorage');
//         } catch (e) {
//             console.warn('Could not save to localStorage:', e);
//         }
//     }

//     async startNewConversation() {
//         console.log('✨ Starting new conversation...');
        
//         const newConv = {
//             id: 'conv-' + Date.now(),
//             title: 'New Conversation',
//             messages: [],
//             createdAt: Date.now(),
//             updatedAt: Date.now()
//         };
        
//         this.conversations.unshift(newConv);
//         this.currentConversationId = newConv.id;
        
//         this.resetInterface();
        
//         await this.saveConversations();
//         this.renderConversations();
        
//         console.log('New conversation started:', newConv.id);
//     }

//     resetInterface() {
//         console.log('Resetting interface...');
        
//         if (this.charts) {
//             this.charts.destroyAllCharts();
//         }
        
//         this.clearMessages();
//         this.showWelcomeScreen();
//         this.showInitialSuggestions();
        
//         if (this.elements.input) {
//             this.elements.input.value = '';
//             this.autoResizeTextarea();
//             this.updateCharCounter();
//         }
        
//         this.messageCount = 0;
//         this.chartCount = 0;
        
//         console.log('Interface reset complete');
//     }

//     async loadConversation(id) {
//         const conv = this.conversations.find(c => c.id === id);
//         if (!conv) return;
        
//         console.log(`📖 Loading conversation: ${id}`);
        
//         this.currentConversationId = id;
        
//         if (this.charts) {
//             this.charts.destroyAllCharts();
//         }
        
//         this.clearMessages();
        
//         if (conv.messages.length === 0) {
//             this.showWelcomeScreen();
//             this.showInitialSuggestions();
//         } else {
//             this.hideWelcomeScreen();
            
//             for (const msg of conv.messages) {
//                 this.addMessage(msg.type, msg.content, false);
                
//                 if (msg.chartRequests && msg.chartRequests.length > 0) {
//                     await this.restoreCharts(msg.chartRequests);
//                 }
                
//                 if (msg.visualCards && msg.visualCards.length > 0) {
//                     await this.renderVisualCards(msg.visualCards);
//                 }
//             }
//         }
        
//         this.renderConversations();
//         console.log('Conversation loaded successfully');
//     }

//     /**
//      * ✅ FIREBASE: Supprimer une conversation
//      */
//     async deleteConversation(id) {
//         if (!confirm('Delete this conversation?')) return;
        
//         // Supprimer localement
//         this.conversations = this.conversations.filter(c => c.id !== id);
        
//         // ✅ FIREBASE: Supprimer de Firebase
//         if (this.firebaseReady && this.currentUser) {
//             try {
//                 await this.db.collection('users')
//                     .doc(this.currentUser.uid)
//                     .collection('conversations')
//                     .doc(id)
//                     .delete();
                
//                 console.log('🗑 Conversation deleted from Firebase:', id);
//             } catch (error) {
//                 console.error('❌ Firebase delete error:', error);
//             }
//         }
        
//         // Supprimer de localStorage aussi (fallback)
//         this.saveConversationsToLocalStorage();
        
//         if (this.currentConversationId === id) {
//             if (this.conversations.length > 0) {
//                 await this.loadConversation(this.conversations[0].id);
//             } else {
//                 this.startNewConversation();
//             }
//         }
        
//         this.renderConversations();
//         console.log('Conversation deleted:', id);
//     }

//     getCurrentConversation() {
//         return this.conversations.find(c => c.id === this.currentConversationId);
//     }

//     updateConversationTitle(message) {
//         const conv = this.getCurrentConversation();
//         if (conv && conv.title === 'New Conversation') {
//             conv.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
//             this.saveConversations();
//             this.renderConversations();
//         }
//     }

//     renderConversations() {
//         if (!this.elements.conversationsList) return;
        
//         const groups = {
//             today: [],
//             yesterday: [],
//             lastWeek: []
//         };
        
//         const now = Date.now();
//         const oneDayMs = 86400000;
        
//         this.conversations.forEach(conv => {
//             const age = now - conv.updatedAt;
            
//             if (age < oneDayMs) {
//                 groups.today.push(conv);
//             } else if (age < oneDayMs * 2) {
//                 groups.yesterday.push(conv);
//             } else {
//                 groups.lastWeek.push(conv);
//             }
//         });
        
//         let html = '';
        
//         if (groups.today.length > 0) {
//             html += `<div class="conversation-group">
//                 <h4 class="group-title">Today</h4>
//                 ${groups.today.map(c => this.renderConversationItem(c)).join('')}
//             </div>`;
//         }
        
//         if (groups.yesterday.length > 0) {
//             html += `<div class="conversation-group">
//                 <h4 class="group-title">Yesterday</h4>
//                 ${groups.yesterday.map(c => this.renderConversationItem(c)).join('')}
//             </div>`;
//         }
        
//         if (groups.lastWeek.length > 0) {
//             html += `<div class="conversation-group">
//                 <h4 class="group-title">Last 7 Days</h4>
//                 ${groups.lastWeek.map(c => this.renderConversationItem(c)).join('')}
//             </div>`;
//         }
        
//         if (html === '') {
//             html = `
//                 <div style="padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
//                     <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
//                     No conversations yet
//                 </div>
//             `;
//         }
        
//         this.elements.conversationsList.innerHTML = html;
//     }

//     renderConversationItem(conv) {
//         const isActive = conv.id === this.currentConversationId;
//         return `
//             <div class="conversation-item ${isActive ? 'active' : ''}" data-id="${conv.id}">
//                 <i class="fas fa-message"></i>
//                 <span class="conversation-title">${this.escapeHtml(conv.title)}</span>
//                 <button class="conversation-delete" title="Delete">
//                     <i class="fas fa-trash"></i>
//                 </button>
//             </div>
//         `;
//     }
    
//     escapeHtml(text) {
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }

//     // ============================================
//     // SEND MESSAGE (WITH FIREBASE AUTO-SAVE)
//     // ============================================
    
//     async sendMessage(messageText = null) {
//         if (!this.elements.input) {
//             console.error('Input element not found!');
//             return;
//         }
        
//         const message = messageText || this.elements.input.value.trim();
        
//         if (!message || this.isTyping) {
//             return;
//         }
        
//         console.log('Sending message:', message);
        
//         this.hideWelcomeScreen();
        
//         this.elements.input.value = '';
//         this.autoResizeTextarea();
//         this.updateCharCounter();
        
//         this.addMessage('user', message);
//         this.updateConversationTitle(message);
        
//         this.clearSuggestions();
//         this.showTypingIndicator();
        
//         try {
//             const startTime = performance.now();
            
//             if (!this.engine) {
//                 throw new Error('Engine not initialized');
//             }
            
//             const response = await this.engine.processMessage(message);
            
//             const responseTime = performance.now() - startTime;
//             this.totalResponseTime += responseTime;
            
//             this.hideTypingIndicator();
            
//             this.addMessage('bot', response.text);
            
//             if (response.visualCards && response.visualCards.length > 0) {
//                 await this.renderVisualCards(response.visualCards);
//             }
            
//             if (response.chartRequests && response.chartRequests.length > 0) {
//                 await this.generateCharts(response.chartRequests);
//             }
            
//             // Update last message with complete data
//             const conv = this.getCurrentConversation();
//             if (conv && conv.messages.length > 0) {
//                 const lastMsg = conv.messages[conv.messages.length - 1];
//                 if (lastMsg.type === 'bot') {
//                     lastMsg.chartRequests = response.chartRequests || null;
//                     lastMsg.visualCards = response.visualCards || null;
//                 }
//             }
            
//             // ✅ FIREBASE: Auto-save après chaque message
//             await this.saveConversations();
            
//             if (response.suggestions && response.suggestions.length > 0) {
//                 this.showSuggestions(response.suggestions);
//             } else if (this.suggestions) {
//                 const contextualSuggestions = this.suggestions.getContextualSuggestions(
//                     response.intent,
//                     response.entities,
//                     response
//                 );
//                 this.showSuggestions(contextualSuggestions);
//             }
            
//         } catch (error) {
//             console.error('Message processing error:', error);
//             this.hideTypingIndicator();
//             this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
//         }
//     }

//     // ============================================
//     // ADD MESSAGE (WITH USER PROFILE PHOTO - v3.2)
//     // ============================================
    
//     addMessage(type, content, save = true) {
//         if (!this.elements.messages) {
//             console.error('Messages container not found!');
//             return;
//         }
        
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `message ${type}-message`;
        
//         const avatar = document.createElement('div');
//         avatar.className = `message-avatar ${type}-avatar`;
        
//         // v3.2: User profile photo for user messages (LOGIQUE LANDING.JS)
//         if (type === 'user') {
//             avatar.innerHTML = this.getUserAvatarHTML();
//         } else {
//             avatar.innerHTML = '<i class="fas fa-robot"></i>';
//         }
        
//         const contentDiv = document.createElement('div');
//         contentDiv.className = 'message-content';
        
//         const bubble = document.createElement('div');
//         bubble.className = 'message-bubble';
        
//         const text = document.createElement('div');
//         text.className = 'message-text';
//         text.innerHTML = this.formatMessage(content);
        
//         bubble.appendChild(text);
        
//         const time = document.createElement('span');
//         time.className = 'message-time';
//         time.textContent = new Date().toLocaleTimeString('en-US', { 
//             hour: '2-digit', 
//             minute: '2-digit' 
//         });
//         bubble.appendChild(time);
        
//         contentDiv.appendChild(bubble);
//         messageDiv.appendChild(avatar);
//         messageDiv.appendChild(contentDiv);
        
//         this.elements.messages.appendChild(messageDiv);
//         this.scrollToBottom();
        
//         this.messageCount++;
        
//         if (save) {
//             const conv = this.getCurrentConversation();
//             if (conv) {
//                 conv.messages.push({ 
//                     type, 
//                     content, 
//                     timestamp: Date.now()
//                 });
//                 conv.updatedAt = Date.now();
//             }
//         }
//     }

//     formatMessage(text) {
//         return text
//             .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
//             .replace(/\*(.+?)\*/g, '<em>$1</em>')
//             .replace(/`(.+?)`/g, '<code>$1</code>')
//             .replace(/\n/g, '<br>');
//     }

//     showTypingIndicator() {
//         if (!this.elements.messages) return;
        
//         this.isTyping = true;
        
//         const typingDiv = document.createElement('div');
//         typingDiv.className = 'message bot-message';
//         typingDiv.id = 'typing-indicator';
        
//         const avatar = document.createElement('div');
//         avatar.className = 'message-avatar bot-avatar';
//         avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
//         const contentDiv = document.createElement('div');
//         contentDiv.className = 'message-content';
        
//         const bubble = document.createElement('div');
//         bubble.className = 'message-bubble';
        
//         const indicator = document.createElement('div');
//         indicator.className = 'typing-indicator';
//         indicator.innerHTML = `
//             <span class="typing-dot"></span>
//             <span class="typing-dot"></span>
//             <span class="typing-dot"></span>
//         `;
        
//         bubble.appendChild(indicator);
//         contentDiv.appendChild(bubble);
//         typingDiv.appendChild(avatar);
//         typingDiv.appendChild(contentDiv);
        
//         this.elements.messages.appendChild(typingDiv);
//         this.scrollToBottom();
//     }

//     hideTypingIndicator() {
//         this.isTyping = false;
//         const indicator = document.getElementById('typing-indicator');
//         if (indicator) {
//             indicator.remove();
//         }
//     }

//     // ============================================
//     // VISUAL CARDS RENDERING
//     // ============================================
    
//     async renderVisualCards(cards) {
//         if (!this.elements.messages || !cards || cards.length === 0) return;
        
//         console.log(`Rendering ${cards.length} visual cards`);
        
//         const cardsContainer = document.createElement('div');
//         cardsContainer.className = 'visual-cards-container';
        
//         const metricCards = cards.filter(c => c.type === 'metric');
//         if (metricCards.length > 0) {
//             const metricsGrid = document.createElement('div');
//             metricsGrid.className = 'metrics-cards-grid';
            
//             metricCards.forEach(card => {
//                 const cardElement = this.createMetricCard(card);
//                 metricsGrid.appendChild(cardElement);
//             });
            
//             cardsContainer.appendChild(metricsGrid);
//         }
        
//         const comparisonCards = cards.filter(c => c.type === 'comparison-card');
//         if (comparisonCards.length > 0) {
//             const comparisonGrid = document.createElement('div');
//             comparisonGrid.className = 'comparison-cards-grid';
            
//             comparisonCards.forEach(card => {
//                 const cardElement = this.createComparisonCard(card);
//                 comparisonGrid.appendChild(cardElement);
//             });
            
//             cardsContainer.appendChild(comparisonGrid);
//         }
        
//         this.elements.messages.appendChild(cardsContainer);
//         this.scrollToBottom();
//     }
    
//     createMetricCard(card) {
//         const cardDiv = document.createElement('div');
//         cardDiv.className = `metric-card ${card.trend ? `trend-${card.trend}` : ''}`;
        
//         cardDiv.innerHTML = `
//             <div class="metric-card-icon">${card.icon || '<i class="fas fa-chart-line"></i>'}</div>
//             <div class="metric-card-content">
//                 <div class="metric-card-title">${card.title}</div>
//                 <div class="metric-card-value">${card.value}</div>
//                 ${card.change ? `<div class="metric-card-change ${card.trend}">${card.change}</div>` : ''}
//                 ${card.subtitle ? `<div class="metric-card-subtitle">${card.subtitle}</div>` : ''}
//             </div>
//         `;
        
//         return cardDiv;
//     }
    
//     createComparisonCard(card) {
//         const cardDiv = document.createElement('div');
//         cardDiv.className = `comparison-card ${card.trend ? `trend-${card.trend}` : ''}`;
        
//         cardDiv.innerHTML = `
//             <div class="comparison-card-header">
//                 <div class="comparison-card-symbol">${card.symbol}</div>
//                 <div class="comparison-card-change ${card.trend}">${card.change}</div>
//             </div>
//             <div class="comparison-card-name">${card.name}</div>
//             <div class="comparison-card-price">${card.price}</div>
//             <div class="comparison-card-metrics">
//                 <div class="comparison-metric">
//                     <span class="comparison-metric-label">Market Cap</span>
//                     <span class="comparison-metric-value">${card.marketCap}</span>
//                 </div>
//                 <div class="comparison-metric">
//                     <span class="comparison-metric-label">P/E Ratio</span>
//                     <span class="comparison-metric-value">${card.peRatio}</span>
//                 </div>
//             </div>
//         `;
        
//         return cardDiv;
//     }

//     // ============================================
//     // SUGGESTIONS
//     // ============================================

//     showInitialSuggestions() {
//         if (this.suggestions) {
//             const initial = this.suggestions.getInitialSuggestions();
//             this.showSuggestions(initial);
//         }
//     }

//     showSuggestions(suggestions) {
//         if (!this.elements.inputSuggestions) return;
        
//         this.clearSuggestions();
        
//         suggestions.forEach(suggestion => {
//             const chip = document.createElement('button');
//             chip.className = 'input-suggestion-chip';
//             chip.textContent = suggestion;
//             this.elements.inputSuggestions.appendChild(chip);
//         });
//     }

//     clearSuggestions() {
//         if (this.elements.inputSuggestions) {
//             this.elements.inputSuggestions.innerHTML = '';
//         }
//     }

//     // ============================================
//     // ✅ CHART ROUTER - Maps chart requests to ChatbotCharts methods
//     // ============================================

//     /**
//      * Crée un graphique à partir d'une requête
//      * @param {Object} request - Requête de graphique avec type, data, options
//      * @param {HTMLElement} container - Conteneur DOM pour le graphique
//      * @returns {Promise<string|null>} - ID du graphique créé ou null
//      */
//     // ============================================
//     // ✅ ULTRA-COMPLETE CHART ROUTER (50+ Chart Types)
//     // ============================================

//     /**
//      * Crée un graphique à partir d'une requête
//      * ✅ ROUTER COMPLET - TOUS LES 50+ TYPES DE GRAPHIQUES
//      */
//     async createChartFromRequest(request, container) {
//         if (!this.charts) {
//             console.error('❌ ChatbotCharts not initialized');
//             return null;
//         }

//         try {
//             console.log(`📊 Creating chart of type: ${request.type}`);
            
//             if (!container.id) {
//                 container.id = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//             }

//             let chartData = null;

//             // ═══════════════════════════════════════════════════════════
//             // ✅ SECTION 1: TECHNICAL INDICATORS CHARTS
//             // ═══════════════════════════════════════════════════════════
//             switch (request.type) {
//                 case 'rsi':
//                     chartData = this.charts.createRSIChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'macd':
//                     chartData = this.charts.createMACDChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'stochastic':
//                     chartData = this.charts.createStochasticChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'adx':
//                     chartData = this.charts.createADXChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'bollinger':
//                 case 'bollinger-bands':
//                     chartData = this.charts.createBollingerBandsChart(request.data.bollinger, request.data.price, container.id, request.options || {});
//                     break;

//                 case 'fibonacci':
//                     chartData = this.charts.createFibonacciChart(request.data.fibonacci, request.data.price, container.id, request.options || {});
//                     break;

//                 case 'ichimoku':
//                     chartData = this.charts.createIchimokuChart(request.data.ichimoku, request.data.price, container.id, request.options || {});
//                     break;

//                 case 'pivot-points':
//                 case 'pivots':
//                     chartData = this.charts.createPivotPointsChart(request.data.pivots, request.data.price, container.id, request.options || {});
//                     break;

//                 case 'moving-averages':
//                 case 'ma':
//                     chartData = this.charts.createMovingAveragesChart(request.data.ma, request.data.price, container.id, request.options || {});
//                     break;

//                 case 'atr':
//                     chartData = this.charts.createATRChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'obv':
//                     chartData = this.charts.createOBVChart(request.data, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ SECTION 2: FOREX CHARTS
//                 // ═══════════════════════════════════════════════════════════
//                 case 'forex-historical':
//                     chartData = this.charts.createForexHistoricalChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'forex-volatility':
//                     chartData = this.charts.createForexVolatilityChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'currency-strength':
//                     chartData = this.charts.createCurrencyStrengthChart(request.data, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ SECTION 3: INSIDER TRADING CHARTS
//                 // ═══════════════════════════════════════════════════════════
//                 case 'insider-timeline':
//                     chartData = this.charts.createInsiderTimelineChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'insider-pie':
//                 case 'insider-buy-sell':
//                     chartData = this.charts.createInsiderBuySellPieChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'insider-role':
//                 case 'insider-role-analysis':
//                     chartData = this.charts.createInsiderRoleAnalysisChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'insider-sentiment':
//                 case 'insider-gauge':
//                     chartData = this.charts.createInsiderSentimentGaugeChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'whale-insider':
//                 case 'insider-whales':
//                     chartData = this.charts.createWhaleInsiderChart(request.data, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ SECTION 4: IPO CHARTS
//                 // ═══════════════════════════════════════════════════════════
//                 case 'ipo-score-distribution':
//                     chartData = this.charts.createIPOScoreDistributionChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'ipo-sector-performance':
//                     chartData = this.charts.createIPOSectorPerformanceChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'ipo-risk-opportunity':
//                     chartData = this.charts.createIPORiskOpportunityChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'ipo-top-rankings':
//                     chartData = this.charts.createIPOTopRankingsChart(request.data, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ SECTION 5: M&A CHARTS
//                 // ═══════════════════════════════════════════════════════════
//                 case 'ma-success-probability':
//                     chartData = this.charts.createMASuccessProbabilityChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'ma-deal-timeline':
//                 case 'ma-timeline':
//                     chartData = this.charts.createMADealValueTimelineChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'ma-sector-breakdown':
//                     chartData = this.charts.createMASectorBreakdownChart(request.data, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ SECTION 6: BUDGET CHARTS
//                 // ═══════════════════════════════════════════════════════════
//                 case 'budget-overview':
//                     chartData = this.charts.createBudgetOverviewChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'portfolio-evolution':
//                     chartData = this.charts.createPortfolioEvolutionChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'roi-chart':
//                 case 'roi':
//                     chartData = this.charts.createROIChart(request.data, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ SECTION 7: INVESTMENT CHARTS
//                 // ═══════════════════════════════════════════════════════════
//                 case 'asset-allocation':
//                     chartData = this.charts.createAssetAllocationChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'efficient-frontier':
//                     chartData = this.charts.createEfficientFrontierChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'backtest':
//                 case 'backtest-performance':
//                     chartData = this.charts.createBacktestChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'diversification-radar':
//                 case 'diversification':
//                     chartData = this.charts.createDiversificationRadarChart(request.data, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ SECTION 8: COMPARISON CHARTS
//                 // ═══════════════════════════════════════════════════════════
//                 case 'radar':
//                 case 'radar-chart':
//                     chartData = this.charts.createRadarChart(request.data, container.id, request.options || {});
//                     break;

//                 case 'heatmap':
//                 case 'correlation-matrix':
//                     chartData = this.charts.createHeatmapChart(request.data.matrix, request.data.symbols, container.id, request.options || {});
//                     break;

//                 // ═══════════════════════════════════════════════════════════
//                 // ✅ FALLBACK
//                 // ═══════════════════════════════════════════════════════════
//                 default:
//                     console.warn(`⚠ Unknown chart type: ${request.type}`);
//                     return null;
//             }

//             if (chartData && chartData.config) {
//                 // ✅ RENDER CHART
//                 const chart = this.charts.renderChart(chartData, container);
                
//                 if (chart) {
//                     console.log(`✅ Chart created successfully: ${request.type}`);
//                     return container.id;
//                 }
//             }

//             console.error(`❌ Failed to create chart: ${request.type}`);
//             return null;

//         } catch (error) {
//             console.error(`❌ Error creating chart from request:`, error);
//             return null;
//         }
//     }

//     // ============================================
//     // CHARTS GENERATION (WITH PERSISTENCE)
//     // ============================================
    
//     async generateCharts(chartRequests) {
//         if (!this.elements.messages || !this.charts) return;
        
//         console.log(`Generating ${chartRequests.length} charts`);
        
//         for (const request of chartRequests) {
//             const chartContainer = document.createElement('div');
//             chartContainer.className = 'chart-message';
            
//             const containerId = `chart-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//             chartContainer.setAttribute('data-chart-container', containerId);
            
//             this.elements.messages.appendChild(chartContainer);
            
//             // ✅ CORRECTION : Appeler createChartFromRequest (router)
//             const chartId = await this.createChartFromRequest(request, chartContainer);
            
//             if (chartId) {
//                 // Store chart metadata (optionnel - pour la restauration)
//                 if (!this.charts.chartDataStore) {
//                     this.charts.chartDataStore = new Map();
//                 }
//                 this.charts.chartDataStore.set(chartId, {
//                     chartRequest: request,
//                     containerId: containerId
//                 });
//             }
            
//             this.chartCount++;
//             this.scrollToBottom();
//         }
        
//         console.log('Charts generated successfully');
//     }

//     async restoreCharts(chartRequests) {
//         if (!chartRequests || chartRequests.length === 0 || !this.charts) {
//             return;
//         }
        
//         console.log(`Restoring ${chartRequests.length} charts`);
        
//         for (const request of chartRequests) {
//             const chartContainer = document.createElement('div');
//             chartContainer.className = 'chart-message';
            
//             const containerId = `chart-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//             chartContainer.setAttribute('data-chart-container', containerId);
            
//             this.elements.messages.appendChild(chartContainer);
            
//             try {
//                 // ✅ CORRECTION : Appeler createChartFromRequest (router)
//                 const chartId = await this.createChartFromRequest(request, chartContainer);
                
//                 if (chartId) {
//                     if (!this.charts.chartDataStore) {
//                         this.charts.chartDataStore = new Map();
//                     }
//                     this.charts.chartDataStore.set(chartId, {
//                         chartRequest: request,
//                         containerId: containerId
//                     });
//                 }
                
//                 console.log(`Chart restored: ${request.type}`);
//             } catch (error) {
//                 console.error(`Failed to restore chart:`, error);
//             }
            
//             this.scrollToBottom();
//         }
        
//         console.log('Charts restoration complete');
//     }

//     // ============================================
//     // UTILITY METHODS
//     // ============================================

//     clearMessages() {
//         if (this.elements.messages) {
//             const messages = this.elements.messages.querySelectorAll('.message, .chart-message, .visual-cards-container, .metrics-table-container, #typing-indicator');
//             messages.forEach(msg => msg.remove());
//         }
//     }

//     showWelcomeScreen() {
//         if (this.elements.welcomeScreen) {
//             this.elements.welcomeScreen.style.display = 'block';
//             console.log('Welcome screen shown');
//         }
//     }

//     hideWelcomeScreen() {
//         if (this.elements.welcomeScreen) {
//             this.elements.welcomeScreen.style.display = 'none';
//         }
//     }

//     autoResizeTextarea() {
//         if (!this.elements.input) return;
        
//         const textarea = this.elements.input;
//         textarea.style.height = 'auto';
//         textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
//     }

//     updateCharCounter() {
//         if (!this.elements.input || !this.elements.inputCounter) return;
        
//         const length = this.elements.input.value.length;
//         this.elements.inputCounter.textContent = `${length}/2000`;
//     }

//     scrollToBottom() {
//         const wrapper = document.querySelector('.chatbot-messages-wrapper');
//         if (wrapper) {
//             setTimeout(() => {
//                 wrapper.scrollTop = wrapper.scrollHeight;
//             }, 100);
//         }
//     }
// }

// // ============================================
// // INITIALIZATION
// // ============================================
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('🚀 Initializing Chatbot Full Page v4.1 (Firebase + Serialization Fix)...');
    
//     if (typeof ChatbotConfig === 'undefined') {
//         console.error('❌ ChatbotConfig not defined!');
//         return;
//     }
    
//     try {
//         window.financialChatbotFullPage = new ChatbotFullPageUI(ChatbotConfig);
//         console.log('✅ Chatbot Full Page v4.1 ready! (Firebase + Wall Street Pro + User Photo)');
//     } catch (error) {
//         console.error('❌ Initialization error:', error);
//     }
// });

// ============================================
// CHATBOT FULLPAGE UI v6.0 ULTRA
// Interface complète avec Robot 3D + Firebase
// ============================================

class ChatbotUI {
    constructor(config) {
        this.config = config;
        this.aiEngine = new ChatbotAIEngine(config);
        this.messages = [];
        this.isTyping = false;
        this.currentConversationId = null;
        this.robot3D = null;
        
        this.init();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 INITIALIZATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async init() {
        console.log('🚀 Initializing ChatbotUI v6.0...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Get DOM elements
        this.elements = {
            messagesContent: document.getElementById('chatbot-messages-content'),
            input: document.getElementById('chatbot-input'),
            sendBtn: document.getElementById('chatbot-send-btn'),
            welcomeScreen: document.getElementById('welcome-screen'),
            newChatBtn: document.getElementById('new-chat-btn'),
            inputClearBtn: document.getElementById('input-clear-btn'),
            inputCounter: document.getElementById('input-counter'),
            conversationsList: document.getElementById('conversations-list'),
            conversationsSidebar: document.getElementById('conversations-sidebar'),
            conversationsToggle: document.getElementById('conversations-toggle')
        };

        // Validate critical elements
        if (!this.elements.messagesContent || !this.elements.input || !this.elements.sendBtn) {
            console.error('❌ Critical UI elements not found!');
            return;
        }

        // Initialize 3D Robot
        if (this.config.ui.enable3DRobot) {
            this.init3DRobot();
        }

        // Attach event listeners
        this.attachEventListeners();

        // Load conversations from Firebase
        await this.loadConversationsFromFirebase();

        // Auto-scroll to bottom
        this.scrollToBottom();

        console.log('✅ ChatbotUI initialized successfully!');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖 INITIALIZE 3D ROBOT (THREE.JS)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    init3DRobot() {
        try {
            if (typeof THREE === 'undefined') {
                console.warn('⚠ Three.js not loaded, skipping 3D robot');
                return;
            }

            const container = document.getElementById('robot-3d-container');
            if (!container) {
                console.warn('⚠ Robot container not found');
                return;
            }

            // Create scene
            const scene = new THREE.Scene();
            
            // Camera
            const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            camera.position.set(0, 2, 8);
            camera.lookAt(0, 1, 0);

            // Renderer
            const renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true 
            });
            renderer.setSize(300, 300);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 7);
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x667eea, 1, 50);
            pointLight.position.set(0, 3, 3);
            scene.add(pointLight);

            // Create Robot
            const robot = this.create3DRobot();
            scene.add(robot);

            // Animation loop
            let animationTime = 0;
            const animate = () => {
                requestAnimationFrame(animate);
                
                animationTime += 0.016;
                
                // Floating animation
                robot.position.y = Math.sin(animationTime * 2) * 0.2 + 1;
                
                // Gentle rotation
                robot.rotation.y = Math.sin(animationTime * 0.5) * 0.3;
                
                renderer.render(scene, camera);
            };
            
            animate();

            this.robot3D = { scene, camera, renderer, robot };
            console.log('✅ 3D Robot initialized');

        } catch (error) {
            console.error('❌ 3D Robot initialization error:', error);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 CREATE 3D ROBOT MODEL (CORRECTION)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    create3DRobot() {
        const robot = new THREE.Group();

        // Materials
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x667eea,
            shininess: 100,
            specular: 0x444444
        });

        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const accentMaterial = new THREE.MeshPhongMaterial({ color: 0x764ba2 });

        // Head
        const headGeometry = new THREE.BoxGeometry(1.5, 1.2, 1.5);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 2;
        robot.add(head);

        // Eyes
        const eyeGeometry = new THREE.CircleGeometry(0.15, 16);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 2.2, 0.76);
        robot.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 2.2, 0.76);
        robot.add(rightEye);

        // Antenna
        const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
        const antenna = new THREE.Mesh(antennaGeometry, accentMaterial);
        antenna.position.y = 2.9;
        robot.add(antenna);

        const antennaTopGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const antennaTop = new THREE.Mesh(antennaTopGeometry, eyeMaterial);
        antennaTop.position.y = 3.2;
        robot.add(antennaTop);

        // Body
        const bodyGeometry = new THREE.BoxGeometry(1.8, 2, 1.2);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        robot.add(body);

        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.2, 1.2, 4, 8);
        
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-1.2, 0.8, 0);
        leftArm.rotation.z = Math.PI / 6;
        robot.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(1.2, 0.8, 0);
        rightArm.rotation.z = -Math.PI / 6;
        robot.add(rightArm);

        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.25, 1, 4, 8);
        
        const leftLeg = new THREE.Mesh(legGeometry, accentMaterial);
        leftLeg.position.set(-0.5, -0.9, 0);
        robot.add(leftLeg);

        // ✅ CORRECTION ICI
        const rightLeg = new THREE.Mesh(legGeometry, accentMaterial);  // Utilise legGeometry + accentMaterial
        rightLeg.position.set(0.5, -0.9, 0);
        robot.add(rightLeg);

        return robot;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎮 ATTACH EVENT LISTENERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    attachEventListeners() {
        // Send message
        this.elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
        
        // Enter key
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Input counter
        this.elements.input.addEventListener('input', () => {
            const length = this.elements.input.value.length;
            const max = this.config.security.maxMessageLength;
            this.elements.inputCounter.textContent = `${length}/${max}`;
            
            // Auto-resize textarea
            this.elements.input.style.height = 'auto';
            this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, 150) + 'px';
        });

        // Clear input
        this.elements.inputClearBtn?.addEventListener('click', () => {
            this.elements.input.value = '';
            this.elements.input.style.height = 'auto';
            this.elements.inputCounter.textContent = '0/' + this.config.security.maxMessageLength;
            this.elements.input.focus();
        });

        // New chat
        this.elements.newChatBtn?.addEventListener('click', () => this.startNewConversation());

        // Welcome suggestions
        document.querySelectorAll('.welcome-suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.currentTarget.dataset.query;
                if (query) {
                    this.elements.input.value = query;
                    this.handleSendMessage();
                }
            });
        });

        // Conversations sidebar toggle
        this.elements.conversationsToggle?.addEventListener('click', () => {
            this.elements.conversationsSidebar.classList.toggle('collapsed');
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 HANDLE SEND MESSAGE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async handleSendMessage() {
        const userMessage = this.elements.input.value.trim();
        
        if (!userMessage || this.isTyping) {
            return;
        }

        // Hide welcome screen
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'none';
        }

        // Add user message to UI
        this.addMessage('user', userMessage);

        // Clear input
        this.elements.input.value = '';
        this.elements.input.style.height = 'auto';
        this.elements.inputCounter.textContent = '0/' + this.config.security.maxMessageLength;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Process with AI Engine
            const response = await this.aiEngine.processMessage(userMessage);

            // Remove typing indicator
            this.hideTypingIndicator();

            if (response.success) {
                // Add AI response
                await this.addMessage('assistant', response.text, {
                    intent: response.intent,
                    entities: response.entities
                });

                // Save to Firebase
                await this.saveConversationToFirebase();

            } else {
                this.addMessage('assistant', response.message, { error: true });
            }

        } catch (error) {
            console.error('❌ Send message error:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', this.config.messages.error, { error: true });
        }

        this.scrollToBottom();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 ADD MESSAGE TO UI
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async addMessage(role, text, options = {}) {
        const messageData = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            role: role,
            text: text,
            timestamp: new Date().toISOString(),
            ...options
        };

        this.messages.push(messageData);

        const messageEl = this.createMessageElement(messageData);
        this.elements.messagesContent.appendChild(messageEl);

        // Streaming effect for assistant messages
        if (role === 'assistant' && !options.error) {
            await this.streamText(messageEl.querySelector('.message-text'), text);
        }

        this.scrollToBottom();
        return messageEl;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 CREATE MESSAGE ELEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.role}-message`;
        messageDiv.dataset.messageId = messageData.id;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = messageData.role === 'user' 
            ? '<i class="fas fa-user"></i>'
            : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        
        if (messageData.role === 'assistant') {
            textDiv.innerHTML = ''; // Will be filled by streaming
        } else {
            textDiv.textContent = messageData.text;
        }

        bubble.appendChild(textDiv);

        if (this.config.ui.showTimestamps) {
            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = new Date(messageData.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            bubble.appendChild(time);
        }

        content.appendChild(bubble);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        return messageDiv;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⌨ STREAM TEXT EFFECT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async streamText(element, text) {
        element.innerHTML = '';
        
        // Parse markdown-style formatting
        const formatted = this.formatMarkdown(text);
        
        for (let i = 0; i < formatted.length; i++) {
            element.innerHTML += formatted[i];
            this.scrollToBottom();
            
            // Variable delay (faster for spaces)
            const delay = formatted[i] === ' ' ? 10 : this.config.ui.messageDelay;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 FORMAT MARKDOWN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    formatMarkdown(text) {
        if (!this.config.ui.enableMarkdown) return text;

        return text
            // Bold: **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            
            // Italic: *text* or _text_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            
            // Code: `code`
            .replace(/`(.*?)`/g, '<code>$1</code>')
            
            // Line breaks
            .replace(/\n/g, '<br>');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⏳ TYPING INDICATOR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    showTypingIndicator() {
        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.id = 'typing-indicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;

        this.elements.messagesContent.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
            typingEl.remove();
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📜 SCROLL TO BOTTOM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    scrollToBottom() {
        if (this.config.ui.autoScroll && this.elements.messagesContent) {
            this.elements.messagesContent.scrollTop = this.elements.messagesContent.scrollHeight;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 START NEW CONVERSATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    startNewConversation() {
        if (confirm('Start a new conversation? Current chat will be saved.')) {
            this.aiEngine.resetConversation();
            this.messages = [];
            this.currentConversationId = null;
            
            this.elements.messagesContent.innerHTML = '';
            
            if (this.elements.welcomeScreen) {
                this.elements.welcomeScreen.style.display = 'block';
            }

            console.log('🔄 New conversation started');
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 SAVE TO FIREBASE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async saveConversationToFirebase() {
        if (!this.config.storage.useFirebase || !window.chatbotModals) {
            return;
        }

        try {
            const conversationId = await window.chatbotModals.saveConversation(
                this.messages,
                this.currentConversationId
            );

            if (conversationId && !this.currentConversationId) {
                this.currentConversationId = conversationId;
                await this.loadConversationsFromFirebase();
            }

        } catch (error) {
            console.error('❌ Firebase save error:', error);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📚 LOAD CONVERSATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async loadConversationsFromFirebase() {
        if (!this.config.storage.useFirebase || !window.chatbotModals) {
            return;
        }

        try {
            const conversations = await window.chatbotModals.loadConversations();
            this.renderConversationsList(conversations);
        } catch (error) {
            console.error('❌ Firebase load error:', error);
        }
    }

    renderConversationsList(conversations) {
        if (!this.elements.conversationsList) return;

        this.elements.conversationsList.innerHTML = '';

        if (conversations.length === 0) {
            this.elements.conversationsList.innerHTML = `
                <div class="no-conversations">
                    <i class="fas fa-comments"></i>
                    <p>No saved conversations</p>
                </div>
            `;
            return;
        }

        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            if (conv.id === this.currentConversationId) {
                item.classList.add('active');
            }

            const preview = conv.messages[0]?.content?.substring(0, 50) || 'Empty conversation';
            const date = conv.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date';

            item.innerHTML = `
                <div class="conversation-preview">${preview}...</div>
                <div class="conversation-meta">
                    <span class="conversation-date">${date}</span>
                    <span class="conversation-count">${conv.messageCount || 0} messages</span>
                </div>
            `;

            item.addEventListener('click', () => this.loadConversation(conv));

            this.elements.conversationsList.appendChild(item);
        });
    }

    loadConversation(conversation) {
        this.currentConversationId = conversation.id;
        this.messages = conversation.messages || [];
        
        this.elements.messagesContent.innerHTML = '';
        
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'none';
        }

        this.messages.forEach(msg => {
            const messageEl = this.createMessageElement(msg);
            const textEl = messageEl.querySelector('.message-text');
            if (textEl) {
                textEl.innerHTML = this.formatMarkdown(msg.text);
            }
            this.elements.messagesContent.appendChild(messageEl);
        });

        this.scrollToBottom();
        console.log('📖 Conversation loaded:', conversation.id);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ AUTO-INITIALIZE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ChatbotConfig !== 'undefined') {
        window.chatbotUI = new ChatbotUI(ChatbotConfig);
        console.log('🎉 Chatbot fully initialized and ready!');
    } else {
        console.error('❌ ChatbotConfig not loaded!');
    }
});

console.log('✅ ChatbotUI class loaded');