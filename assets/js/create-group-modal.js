/* ============================================
   CREATE-GROUP-MODAL.JS v1.0
   🎯 Modal de création de groupe avec sélection de membres
   ✅ Upload photo de groupe vers R2
   ✅ Validation (min 2 membres + nom requis)
   ============================================ */

class CreateGroupModal {
    constructor() {
        this.currentUser = null;
        this.selectedMembers = new Map(); // userId -> userData
        this.groupPhoto = null;
        this.searchTimeout = null;
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        // URL du Worker R2
        this.R2_WORKER_URL = 'https://alphavault-image-storage.raphnardone.workers.dev';
    }

    initialize() {
        console.log('🎨 Initializing Create Group Modal...');
        
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                this.setupEventListeners();
            }
        });
    }

    setupEventListeners() {
        // Recherche de membres
        const memberSearchInput = document.getElementById('memberSearchInput');
        if (memberSearchInput) {
            memberSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                clearTimeout(this.searchTimeout);
                
                if (query.length < 2) {
                    this.hideSearchResults();
                    return;
                }
                
                this.searchTimeout = setTimeout(() => {
                    this.searchMembers(query);
                }, 300);
            });
        }

        // Upload photo de groupe
        const groupPhotoInput = document.getElementById('groupPhotoInput');
        if (groupPhotoInput) {
            groupPhotoInput.addEventListener('change', (e) => {
                this.handlePhotoSelect(e);
            });
        }

        // Fermer les résultats de recherche si clic à l'extérieur
        document.addEventListener('click', (e) => {
            const searchResults = document.getElementById('memberSearchResults');
            const searchInput = document.getElementById('memberSearchInput');
            
            if (searchResults && searchInput) {
                if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
                    this.hideSearchResults();
                }
            }
        });
    }

    /* ==========================================
       🔍 RECHERCHE DE MEMBRES
       ========================================== */
    
    async searchMembers(query) {
        const searchResults = document.getElementById('memberSearchResults');
        if (!searchResults) return;

        searchResults.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: #667eea;"></i>
            </div>
        `;
        searchResults.style.display = 'block';

        try {
            const queryLower = query.toLowerCase();

            // Recherche par email et nom
            const emailQuery = this.db
                .collection('users')
                .where('email', '>=', queryLower)
                .where('email', '<=', queryLower + '\uf8ff')
                .limit(10)
                .get();

            const nameQuery = this.db
                .collection('users')
                .where('displayName', '>=', query)
                .where('displayName', '<=', query + '\uf8ff')
                .limit(10)
                .get();

            const [emailSnapshot, nameSnapshot] = await Promise.all([emailQuery, nameQuery]);

            const usersMap = new Map();

            emailSnapshot.docs.forEach(doc => {
                if (doc.id !== this.currentUser.uid && !this.selectedMembers.has(doc.id)) {
                    usersMap.set(doc.id, { uid: doc.id, ...doc.data() });
                }
            });

            nameSnapshot.docs.forEach(doc => {
                if (doc.id !== this.currentUser.uid && !this.selectedMembers.has(doc.id)) {
                    usersMap.set(doc.id, { uid: doc.id, ...doc.data() });
                }
            });

            const users = Array.from(usersMap.values());

            if (users.length === 0) {
                searchResults.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-user-slash"></i>
                        <p>No users found</p>
                    </div>
                `;
                return;
            }

            this.renderSearchResults(users);

        } catch (error) {
            console.error('❌ Error searching members:', error);
            searchResults.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error searching users</p>
                </div>
            `;
        }
    }

    renderSearchResults(users) {
        const searchResults = document.getElementById('memberSearchResults');
        if (!searchResults) return;

        const resultsHTML = users.map(user => {
            const displayName = user.displayName || user.email?.split('@')[0] || 'Unknown';
            const avatar = user.photoURL || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

            return `
                <div class="member-search-result" onclick="window.createGroupModal.addMember('${user.uid}', ${JSON.stringify(user).replace(/"/g, '&quot;')})">
                    <img src="${avatar}" alt="${this.escapeHtml(displayName)}" class="member-result-avatar">
                    <div class="member-result-info">
                        <div class="member-result-name">${this.escapeHtml(displayName)}</div>
                        <div class="member-result-email">${this.escapeHtml(user.email || '')}</div>
                    </div>
                    <button class="add-member-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        }).join('');

        searchResults.innerHTML = resultsHTML;
        searchResults.style.display = 'block';
    }

    hideSearchResults() {
        const searchResults = document.getElementById('memberSearchResults');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    /* ==========================================
       👥 GESTION DES MEMBRES SÉLECTIONNÉS
       ========================================== */
    
    addMember(userId, userData) {
        console.log('➕ Adding member:', userData.displayName);
        
        this.selectedMembers.set(userId, userData);
        this.renderSelectedMembers();
        this.hideSearchResults();
        
        // Vider la recherche
        const memberSearchInput = document.getElementById('memberSearchInput');
        if (memberSearchInput) {
            memberSearchInput.value = '';
        }
    }

    removeMember(userId) {
        console.log('➖ Removing member:', userId);
        this.selectedMembers.delete(userId);
        this.renderSelectedMembers();
    }

    renderSelectedMembers() {
        const container = document.getElementById('selectedMembers');
        if (!container) return;

        if (this.selectedMembers.size === 0) {
            container.innerHTML = `
                <div class="no-members-selected">
                    <i class="fas fa-users"></i>
                    <p>No members selected yet</p>
                </div>
            `;
            return;
        }

        const membersHTML = Array.from(this.selectedMembers.values()).map(user => {
            const displayName = user.displayName || user.email?.split('@')[0] || 'Unknown';
            const avatar = user.photoURL || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

            return `
                <div class="selected-member-chip">
                    <img src="${avatar}" alt="${this.escapeHtml(displayName)}" class="selected-member-avatar">
                    <span class="selected-member-name">${this.escapeHtml(displayName)}</span>
                    <button class="remove-member-btn" onclick="window.createGroupModal.removeMember('${user.uid}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="selected-members-grid">
                ${membersHTML}
            </div>
            <div class="members-count">
                ${this.selectedMembers.size} member${this.selectedMembers.size > 1 ? 's' : ''} selected
            </div>
        `;
    }

    /* ==========================================
       📷 UPLOAD PHOTO DE GROUPE
       ========================================== */
    
    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Vérifier le type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image is too large (max 5MB)');
            return;
        }

        this.groupPhoto = file;

        // Prévisualisation
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('groupPhotoPreview');
            if (preview) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Group photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                `;
            }
        };
        reader.readAsDataURL(file);

        console.log('📷 Group photo selected:', file.name);
    }

    async uploadGroupPhoto() {
        if (!this.groupPhoto) return null;

        try {
            console.log('📤 Uploading group photo...');

            const token = await this.currentUser.getIdToken();
            const formData = new FormData();
            formData.append('file', this.groupPhoto);
            formData.append('userId', this.currentUser.uid);
            formData.append('folder', 'groups');

            const response = await fetch(`${this.R2_WORKER_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            console.log('✅ Group photo uploaded:', data.url);

            return data.url;

        } catch (error) {
            console.error('❌ Error uploading group photo:', error);
            return null;
        }
    }

    /* ==========================================
    📧 ENVOYER NOTIFICATIONS CRÉATION GROUPE
    ========================================== */

    async sendGroupCreatedNotifications(groupData) {
        try {
            console.log('📧 Sending group created notifications...');

            // Préparer la liste des membres (avec emails)
            const members = [];
            
            for (const userId of groupData.participants) {
                if (userId === this.currentUser.uid) continue; // Skip créateur
                
                const userData = groupData.participantsData[userId];
                if (userData && userData.email) {
                    members.push({
                        email: userData.email,
                        displayName: userData.displayName || 'User'
                    });
                }
            }

            if (members.length === 0) {
                console.log('ℹ No members to notify (creator only)');
                return;
            }

            console.log(`📤 Sending notifications to ${members.length} members:`, members.map(m => m.email));

            // ✅ CORRECTION : Bon endpoint + bonne structure (sans "type" ni "data")
            const response = await fetch('https://message-notification-sender.raphnardone.workers.dev/send-group-created', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    groupName: groupData.name,
                    groupPhoto: groupData.photoURL,
                    creatorName: this.currentUser.displayName || window.currentUserData?.displayName || 'Someone',
                    creatorEmail: this.currentUser.email,
                    members: members
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Worker response error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log(`✅ Group created notifications sent to ${result.sent} members`);
            } else {
                console.error('❌ Failed to send notifications:', result.error);
            }

        } catch (error) {
            console.error('❌ Error sending group created notifications:', error);
            // Ne pas bloquer la création du groupe si les emails échouent
        }
    }

    /* ==========================================
       ✅ CRÉATION DU GROUPE
       ========================================== */
    
    async create() {
        const groupName = document.getElementById('groupName')?.value.trim();
        const groupDescription = document.getElementById('groupDescription')?.value.trim();

        // Validation
        if (!groupName) {
            alert('Please enter a group name');
            return;
        }

        if (this.selectedMembers.size < 2) {
            alert('Please select at least 2 members');
            return;
        }

        const createBtn = document.getElementById('createGroupBtn');
        if (createBtn) createBtn.disabled = true;

        try {
            console.log('🆕 Creating group:', groupName);

            // Upload photo si sélectionnée
            let photoURL = null;
            if (this.groupPhoto) {
                photoURL = await this.uploadGroupPhoto();
            }

            // Préparer les participants (membres + créateur)
            const participants = [this.currentUser.uid];
            const participantsData = {
                [this.currentUser.uid]: {
                    displayName: this.currentUser.displayName || window.currentUserData?.displayName || 'You',
                    photoURL: this.currentUser.photoURL || window.currentUserData?.photoURL || null,
                    email: this.currentUser.email,
                    plan: window.currentUserData?.plan || 'free',
                    role: 'admin',
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                }
            };

            this.selectedMembers.forEach((userData, userId) => {
                participants.push(userId);
                participantsData[userId] = {
                    displayName: userData.displayName || userData.email?.split('@')[0] || 'User',
                    photoURL: userData.photoURL || null,
                    email: userData.email || null,
                    plan: userData.plan || 'free',
                    role: 'member',
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
            });

            // Créer le groupe dans Firestore
            const groupData = {
                type: 'group',
                name: groupName,
                description: groupDescription || '',
                photoURL: photoURL,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
                participants: participants,
                participantsData: participantsData,
                admins: [this.currentUser.uid],
                lastMessage: {
                    text: `${this.currentUser.displayName || 'Someone'} created the group`,
                    senderId: this.currentUser.uid
                },
                unreadCount: {},
                deletedBy: [],
                settings: {
                    allowMembersToInvite: true,
                    onlyAdminsCanMessage: false
                }
            };

            // Initialiser unreadCount pour tous les participants
            participants.forEach(userId => {
                groupData.unreadCount[userId] = 0;
            });

            const groupRef = await this.db.collection('conversations').add(groupData);

            console.log('✅ Group created:', groupRef.id);

            // ✅ ✨ NOUVEAU : Envoyer les notifications ✨
            await this.sendGroupCreatedNotifications(groupData);

            // Fermer le modal
            this.close();

            // Recharger les conversations
            if (window.messagesHub) {
                await window.messagesHub.loadConversations();
            }

            // Ouvrir le groupe
            setTimeout(() => {
                if (window.messagesHub) {
                    window.messagesHub.openGroup(groupRef.id, groupData);
                }
            }, 500);

            alert(`✅ Group "${groupName}" created successfully!`);

        } catch (error) {
            console.error('❌ Error creating group:', error);
            alert('Failed to create group. Please try again.');
        } finally {
            if (createBtn) createBtn.disabled = false;
        }
    }

    /* ==========================================
       🎨 MODAL CONTROLS
       ========================================== */
    
    open() {
        const modal = document.getElementById('createGroupModal');
        if (!modal) return;

        // Réinitialiser les champs
        this.selectedMembers.clear();
        this.groupPhoto = null;

        const groupName = document.getElementById('groupName');
        const groupDescription = document.getElementById('groupDescription');
        const memberSearchInput = document.getElementById('memberSearchInput');
        const groupPhotoPreview = document.getElementById('groupPhotoPreview');

        if (groupName) groupName.value = '';
        if (groupDescription) groupDescription.value = '';
        if (memberSearchInput) memberSearchInput.value = '';
        if (groupPhotoPreview) {
            groupPhotoPreview.innerHTML = '<i class="fas fa-users"></i>';
        }

        this.renderSelectedMembers();
        this.hideSearchResults();

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        console.log('✅ Create Group Modal opened');
    }

    close() {
        const modal = document.getElementById('createGroupModal');
        if (!modal) return;

        modal.style.display = 'none';
        document.body.style.overflow = '';

        console.log('✅ Create Group Modal closed');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.createGroupModal = new CreateGroupModal();
    window.createGroupModal.initialize();
});

console.log('✅ create-group-modal.js loaded (v1.0)');