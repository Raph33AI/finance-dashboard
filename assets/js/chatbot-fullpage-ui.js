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
    // 🚀 INITIALIZATION (CORRECTION)
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
            conversationsToggle: document.getElementById('conversations-toggle'),
            conversationsReopenBtn: document.getElementById('conversations-reopen-btn')
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

        // ✅ CORRECTION: Attendre que Firebase et ChatbotModals soient prêts
        this.waitForFirebaseAndLoadConversations();

        // Auto-scroll to bottom
        this.scrollToBottom();

        console.log('✅ ChatbotUI initialized successfully!');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⏳ WAIT FOR FIREBASE & LOAD CONVERSATIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async waitForFirebaseAndLoadConversations() {
        console.log('⏳ Waiting for Firebase authentication...');

        // Attendre que Firebase soit initialisé
        if (typeof firebase === 'undefined') {
            console.warn('⚠ Firebase not available, skipping conversation loading');
            return;
        }

        // Attendre l'authentification Firebase
        const maxWaitTime = 5000; // 5 secondes max
        const startTime = Date.now();

        const waitForAuth = () => {
            return new Promise((resolve) => {
                const checkAuth = () => {
                    const user = firebase.auth().currentUser;
                    
                    if (user) {
                        console.log('✅ User authenticated, loading conversations...');
                        resolve(true);
                    } else if (Date.now() - startTime > maxWaitTime) {
                        console.warn('⚠ Auth timeout, skipping conversation loading');
                        resolve(false);
                    } else {
                        setTimeout(checkAuth, 200); // Vérifier toutes les 200ms
                    }
                };
                
                checkAuth();
            });
        };

        const isAuthenticated = await waitForAuth();

        if (!isAuthenticated) {
            return;
        }

        // Attendre que ChatbotModals soit prêt
        let attempts = 0;
        const maxAttempts = 25; // 5 secondes (25 × 200ms)

        const waitForModals = () => {
            return new Promise((resolve) => {
                const checkModals = () => {
                    attempts++;
                    
                    if (window.chatbotModals && typeof window.chatbotModals.loadConversations === 'function') {
                        console.log('✅ ChatbotModals ready');
                        resolve(true);
                    } else if (attempts >= maxAttempts) {
                        console.warn('⚠ ChatbotModals timeout');
                        resolve(false);
                    } else {
                        setTimeout(checkModals, 200);
                    }
                };
                
                checkModals();
            });
        };

        const modalsReady = await waitForModals();

        if (!modalsReady) {
            console.warn('⚠ Could not load conversations (modals not ready)');
            return;
        }

        // ✅ Charger les conversations
        try {
            console.log('📚 Loading conversations from Firebase...');
            await this.loadConversationsFromFirebase();
            
            // ✅ Afficher la sidebar par défaut
            if (this.elements.conversationsSidebar) {
                this.elements.conversationsSidebar.classList.remove('collapsed');
            }
            
            console.log('✅ Conversations loaded and sidebar displayed');
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
        }
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

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Conversations sidebar toggle
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this.elements.conversationsToggle?.addEventListener('click', () => {
            this.toggleConversationsSidebar(true); // Fermer
        });

        this.elements.conversationsReopenBtn?.addEventListener('click', () => {
            this.toggleConversationsSidebar(false); // Ouvrir
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 TOGGLE CONVERSATIONS SIDEBAR (CORRECTION FINALE)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    toggleConversationsSidebar(collapse) {
        const sidebar = this.elements.conversationsSidebar;
        const reopenBtn = this.elements.conversationsReopenBtn;
        const toggleBtn = this.elements.conversationsToggle;
        
        if (!sidebar) {
            console.error('❌ Sidebar element not found');
            return;
        }
        
        console.log('🔄 Toggling sidebar:', collapse ? 'CLOSE' : 'OPEN');
        
        if (collapse) {
            // ✅ Fermer la sidebar
            sidebar.classList.add('collapsed');
            
            // ✅ Afficher le bouton de réouverture
            if (reopenBtn) {
                reopenBtn.classList.add('visible');
                reopenBtn.style.opacity = '1';
                reopenBtn.style.pointerEvents = 'all';
                console.log('✅ Reopen button shown');
            } else {
                console.warn('⚠ Reopen button element not found');
                
                // ✅ Créer le bouton s'il n'existe pas
                const newBtn = document.createElement('button');
                newBtn.id = 'conversations-reopen-btn';
                newBtn.className = 'conversations-reopen-btn visible';
                newBtn.title = 'Show conversations';
                newBtn.innerHTML = '<i class="fas fa-history"></i>';
                newBtn.addEventListener('click', () => this.toggleConversationsSidebar(false));
                document.body.appendChild(newBtn);
                
                // Mettre à jour la référence
                this.elements.conversationsReopenBtn = newBtn;
                console.log('✅ Reopen button created dynamically');
            }
            
            // Changer l'icône du toggle
            const icon = toggleBtn?.querySelector('i');
            if (icon) icon.className = 'fas fa-chevron-right';
            
            console.log('📕 Conversations sidebar collapsed');
            
        } else {
            // ✅ Ouvrir la sidebar
            sidebar.classList.remove('collapsed');
            
            // ✅ Cacher le bouton de réouverture
            if (reopenBtn) {
                reopenBtn.classList.remove('visible');
                reopenBtn.style.opacity = '0';
                reopenBtn.style.pointerEvents = 'none';
                console.log('✅ Reopen button hidden');
            }
            
            // Changer l'icône du toggle
            const icon = toggleBtn?.querySelector('i');
            if (icon) icon.className = 'fas fa-chevron-left';
            
            console.log('📖 Conversations sidebar expanded');
        }
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
        } else if (role === 'user') {
            // Pour les messages utilisateur, pas de HTML
            messageEl.querySelector('.message-text').textContent = text;
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
    // ⌨ STREAM TEXT EFFECT (ULTRA-FAST)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async streamText(element, text) {
        // ✅ Si streaming désactivé, afficher instantanément
        if (!this.config.ui.enableStreaming) {
            element.innerHTML = this.formatContent(text);
            return;
        }

        element.innerHTML = '';
        
        // Format le texte complet une seule fois
        const formattedText = this.formatContent(text);
        
        // Split par mots au lieu de caractères (beaucoup plus rapide)
        const words = formattedText.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            element.innerHTML += words[i] + ' ';
            
            // Scroll uniquement tous les 10 mots (optimisation)
            if (i % 10 === 0) {
                this.scrollToBottom();
            }
            
            // Délai ultra-court (5ms par mot au lieu de 50ms par caractère)
            await new Promise(resolve => setTimeout(resolve, this.config.ui.messageDelay));
        }
        
        // Scroll final
        this.scrollToBottom();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 FORMAT CONTENT (HTML + Markdown) - CORRECTION FINALE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    formatContent(text) {
        if (!text) return '';

        let formatted = text;

        // ✅ ÉTAPE 0: Nettoyer les attributs style inline (CRITIQUE)
        formatted = formatted.replace(/style="[^"]*"/g, '');
        formatted = formatted.replace(/style='[^']*'/g, '');

        // ✅ ÉTAPE 1: Nettoyer les balises HTML mal formées
        formatted = formatted
            .replace(/<br\s*\/?>/gi, '<br>')
            .replace(/<\/br>/gi, '')
            .replace(/<strong>/gi, '<strong>')
            .replace(/<\/strong>/gi, '</strong>')
            .replace(/<em>/gi, '<em>')
            .replace(/<\/em>/gi, '</em>')
            .replace(/<code>/gi, '<code>')
            .replace(/<\/code>/gi, '</code>');

        // ✅ ÉTAPE 2: Convertir les listes à puces (• ou *)
        formatted = formatted
            .replace(/^[•*]\s+(.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*?<\/li>\n?)+/gs, '<ul style="margin: 12px 0; padding-left: 24px; line-height: 1.8;">$&</ul>')
            .replace(/<li>/g, '<li style="margin: 6px 0;">');

        // ✅ ÉTAPE 3: Gérer les titres (Markdown → HTML avec styles)
        formatted = formatted
            .replace(/^### (.+)$/gm, '<h3 style="font-size: 1.2em; font-weight: 700; color: #667eea; margin: 16px 0 8px 0;">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 style="font-size: 1.4em; font-weight: 800; color: #667eea; margin: 20px 0 10px 0;">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 style="font-size: 1.6em; font-weight: 900; color: #667eea; margin: 24px 0 12px 0;">$1</h1>');

        // ✅ ÉTAPE 4: Gérer les séparateurs (--- → <hr>)
        formatted = formatted.replace(/^---+$/gm, '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;">');

        // ✅ ÉTAPE 5: Gérer le gras/italique Markdown (si pas déjà en HTML)
        formatted = formatted
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');

        // ✅ ÉTAPE 6: Améliorer le rendu des emojis financiers
        const emojiMap = {
            '📊': '<span style="font-size: 1.2em;">📊</span>',
            '📈': '<span style="font-size: 1.2em; color: #10b981;">📈</span>',
            '📉': '<span style="font-size: 1.2em; color: #ef4444;">📉</span>',
            '💰': '<span style="font-size: 1.2em;">💰</span>',
            '🚀': '<span style="font-size: 1.2em;">🚀</span>',
            '⚠': '<span style="font-size: 1.2em; color: #f59e0b;">⚠</span>',
            '✅': '<span style="font-size: 1.2em; color: #10b981;">✅</span>',
            '❌': '<span style="font-size: 1.2em; color: #ef4444;">❌</span>'
        };

        Object.keys(emojiMap).forEach(emoji => {
            formatted = formatted.replace(new RegExp(emoji, 'g'), emojiMap[emoji]);
        });

        // ✅ ÉTAPE 7: Gérer les retours à la ligne (si pas de <br> déjà présent)
        if (!formatted.includes('<br>')) {
            formatted = formatted.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
        }

        return formatted;
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
    // 🔄 START NEW CONVERSATION (CORRECTION COMPLÈTE)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    startNewConversation() {
        console.log('🔄 Starting new conversation...');
        
        // Sauvegarder la conversation actuelle si elle existe et qu'elle contient des messages
        if (this.currentConversationId && this.messages.length > 0) {
            console.log('💾 Saving current conversation before starting new one...');
            this.saveConversationToFirebase();
        }
        
        // Réinitialiser le moteur AI
        this.aiEngine.resetConversation();
        
        // Réinitialiser les messages
        this.messages = [];
        this.currentConversationId = null;
        
        // Vider le conteneur de messages
        this.elements.messagesContent.innerHTML = '';
        
        // ✅ CORRECTION: Réafficher le Welcome Screen
        if (this.elements.welcomeScreen) {
            // Recréer le welcome screen HTML complet
            const welcomeHTML = `
                <!-- ✅ ROBOT 3D ULTRA-RÉALISTE (THREE.JS) -->
                <div id="robot-3d-container" class="robot-3d-container-threejs"></div>
                
                <h2 class="welcome-title">Welcome to Alphy AI</h2>
                <p class="welcome-subtitle">Your elite financial analyst powered by real-time market data</p>
                
                <div class="welcome-features">
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <div class="feature-title">Real-Time Analysis</div>
                        <div class="feature-desc">Live market data from Finnhub & Twelve Data</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🧠</div>
                        <div class="feature-title">AI-Powered Insights</div>
                        <div class="feature-desc">Advanced Gemini AI with 8192 token output</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📈</div>
                        <div class="feature-title">Technical Analysis</div>
                        <div class="feature-desc">RSI, MACD, Bollinger Bands & more</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🚀</div>
                        <div class="feature-title">IPO Scoring</div>
                        <div class="feature-desc">Advanced multi-criteria IPO evaluation</div>
                    </div>
                </div>

                <div class="welcome-suggestions">
                    <h3 class="suggestions-title">Try asking:</h3>
                    <div class="welcome-suggestion-grid">
                        <button class="welcome-suggestion-btn" data-query="Analyze NVDA stock performance over the last 5 years">
                            <span class="suggestion-icon">📈</span>
                            <span class="suggestion-text">Analyze NVDA stock performance over the last 5 years</span>
                        </button>
                        <button class="welcome-suggestion-btn" data-query="Show me the top 5 highest potential IPOs">
                            <span class="suggestion-icon">🚀</span>
                            <span class="suggestion-text">Show me the top 5 highest potential IPOs</span>
                        </button>
                        <button class="welcome-suggestion-btn" data-query="What's the market sentiment today?">
                            <span class="suggestion-icon">💰</span>
                            <span class="suggestion-text">What's the market sentiment today?</span>
                        </button>
                        <button class="welcome-suggestion-btn" data-query="Compare AAPL vs MSFT technical indicators">
                            <span class="suggestion-icon">📊</span>
                            <span class="suggestion-text">Compare AAPL vs MSFT technical indicators</span>
                        </button>
                    </div>
                </div>
            `;
            
            this.elements.welcomeScreen.innerHTML = welcomeHTML;
            this.elements.welcomeScreen.style.display = 'block';
            
            // ✅ Réattacher les event listeners aux suggestions
            this.attachWelcomeSuggestionListeners();
            
            // ✅ Réinitialiser le robot 3D
            if (this.config.ui.enable3DRobot) {
                setTimeout(() => {
                    this.init3DRobot();
                }, 100);
            }
        }
        
        // Retirer la surbrillance de toutes les conversations
        document.querySelectorAll('.conversation-item').forEach(el => {
            el.classList.remove('active');
        });
        
        // Vider l'input
        if (this.elements.input) {
            this.elements.input.value = '';
            this.elements.input.style.height = 'auto';
        }
        
        if (this.elements.inputCounter) {
            this.elements.inputCounter.textContent = '0/' + this.config.security.maxMessageLength;
        }
        
        console.log('✅ New conversation started - Welcome screen displayed');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 ATTACH WELCOME SUGGESTION LISTENERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    attachWelcomeSuggestionListeners() {
        document.querySelectorAll('.welcome-suggestion-btn').forEach(btn => {
            // Retirer les anciens listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Ajouter le nouveau listener
            newBtn.addEventListener('click', (e) => {
                const query = e.currentTarget.dataset.query;
                if (query) {
                    this.elements.input.value = query;
                    this.handleSendMessage();
                }
            });
        });
        
        console.log('✅ Welcome suggestion listeners attached');
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
    // 📚 LOAD CONVERSATIONS (AVEC LOGS)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async loadConversationsFromFirebase() {
        if (!this.config.storage.useFirebase) {
            console.log('ℹ Firebase storage disabled in config');
            return;
        }

        if (!window.chatbotModals) {
            console.warn('⚠ ChatbotModals not available');
            return;
        }

        try {
            console.log('📡 Fetching conversations from Firebase...');
            const conversations = await window.chatbotModals.loadConversations();
            
            console.log(`✅ Retrieved ${conversations.length} conversations from Firebase`);
            
            if (conversations.length > 0) {
                console.log('📋 Conversations:', conversations.map(c => ({
                    id: c.id,
                    messageCount: c.messageCount || c.messages?.length || 0,
                    date: c.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'
                })));
            }
            
            this.renderConversationsList(conversations);
            
        } catch (error) {
            console.error('❌ Firebase load error:', error);
            
            // Afficher un message d'erreur dans la sidebar
            if (this.elements.conversationsList) {
                this.elements.conversationsList.innerHTML = `
                    <div class="no-conversations" style="text-align: center; padding: 40px 20px; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <p style="font-size: 14px; font-weight: 600;">Error loading conversations</p>
                        <p style="font-size: 12px; margin-top: 8px;">${error.message}</p>
                        <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📚 RENDER CONVERSATIONS LIST (COMPLET)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    renderConversationsList(conversations) {
        if (!this.elements.conversationsList) return;

        this.elements.conversationsList.innerHTML = '';

        if (conversations.length === 0) {
            this.elements.conversationsList.innerHTML = `
                <div class="no-conversations" style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                    <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p style="font-size: 14px;">No saved conversations</p>
                    <p style="font-size: 12px; margin-top: 8px;">Start chatting to save your first conversation!</p>
                </div>
            `;
            return;
        }

        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            item.dataset.conversationId = conv.id;
            
            // ✅ Surbrillance si conversation active
            if (conv.id === this.currentConversationId) {
                item.classList.add('active');
            }

            // Extract preview text
            const firstMessage = conv.messages?.[0];
            let preview = 'Empty conversation';
            
            if (firstMessage && firstMessage.text) {
                preview = firstMessage.text.replace(/<[^>]*>/g, '').substring(0, 60);
            } else if (firstMessage && firstMessage.content) {
                preview = firstMessage.content.replace(/<[^>]*>/g, '').substring(0, 60);
            }

            const date = conv.updatedAt?.toDate?.()?.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) || 'Unknown date';

            item.innerHTML = `
                <div class="conversation-content">
                    <div class="conversation-preview">${preview}${preview.length >= 60 ? '...' : ''}</div>
                    <div class="conversation-meta">
                        <span class="conversation-date">
                            <i class="fas fa-clock"></i> ${date}
                        </span>
                        <span class="conversation-count">
                            <i class="fas fa-comment"></i> ${conv.messageCount || conv.messages?.length || 0}
                        </span>
                    </div>
                </div>
                <button class="conversation-delete-btn" data-conversation-id="${conv.id}" title="Delete conversation">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            // ✅ Clic pour charger la conversation
            const contentDiv = item.querySelector('.conversation-content');
            contentDiv.addEventListener('click', () => {
                // Retirer la classe active de toutes les conversations
                document.querySelectorAll('.conversation-item').forEach(el => {
                    el.classList.remove('active');
                });
                
                // Ajouter la classe active à celle-ci
                item.classList.add('active');
                
                this.loadConversation(conv);
            });

            // ✅ Bouton de suppression
            const deleteBtn = item.querySelector('.conversation-delete-btn');
            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation(); // Empêcher le clic de charger la conversation
                
                if (confirm('Delete this conversation? This action cannot be undone.')) {
                    await this.deleteConversation(conv.id);
                }
            });

            this.elements.conversationsList.appendChild(item);
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🗑 DELETE CONVERSATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async deleteConversation(conversationId) {
        try {
            console.log('🗑 Deleting conversation:', conversationId);

            // Supprimer de Firebase si disponible
            if (this.config.storage.useFirebase && window.chatbotModals) {
                const user = firebase.auth().currentUser;
                if (user) {
                    await firebase.firestore()
                        .collection('users')
                        .doc(user.uid)
                        .collection('conversations')
                        .doc(conversationId)
                        .delete();
                    
                    console.log('✅ Conversation deleted from Firebase');
                }
            }

            // Si c'est la conversation active, réinitialiser
            if (conversationId === this.currentConversationId) {
                this.startNewConversation();
            }

            // Recharger la liste
            await this.loadConversationsFromFirebase();

            console.log('✅ Conversation deleted successfully');

        } catch (error) {
            console.error('❌ Delete conversation error:', error);
            alert('Failed to delete conversation. Please try again.');
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📖 LOAD CONVERSATION (CORRECTION)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
            if (textEl && msg.text) {  // ✅ Vérification que msg.text existe
                textEl.innerHTML = this.formatContent(msg.text);
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