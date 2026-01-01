/* ============================================
   GROUP-MEMBERS-MANAGER.JS v2.2 - PREVIEW ENHANCED
   👥 Gestion complète des membres du groupe
   ✅ Ajouter/retirer des membres
   ✅ Promouvoir/rétrograder admin
   ✅ Modifier nom, photo, description du groupe
   ✅ Upload photo groupe vers R2
   🔧 FIX: Conflit ID avec create-group-modal
   ✨ NEW: Preview animé + badge "NEW PHOTO"
   ============================================ */

class GroupMembersManager {
    constructor() {
        this.currentUser = null;
        this.currentGroupId = null;
        this.currentGroup = null;
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.R2_WORKER_URL = 'https://alphavault-image-storage.raphnardone.workers.dev';
        this.editMode = false;
        this.newGroupPhoto = null;
    }

    initialize() {
        console.log('👥 Initializing Group Members Manager v2.2 (Preview Enhanced)...');
        
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
        });
    }

    /* ==========================================
       🔓 OUVRIR LE MODAL
       ========================================== */
    
    async open(groupId) {
        console.log('📋 Opening group members manager for:', groupId);

        this.currentGroupId = groupId;
        this.editMode = false;
        this.newGroupPhoto = null;

        try {
            const groupDoc = await this.db.collection('conversations').doc(groupId).get();
            
            if (!groupDoc.exists) {
                console.error('❌ Group not found');
                return;
            }

            this.currentGroup = groupDoc.data();

            if (!this.currentGroup.admins.includes(this.currentUser.uid)) {
                console.error('❌ User is not admin');
                return;
            }

            this.renderModal();

            const modal = document.getElementById('groupMembersModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }

        } catch (error) {
            console.error('❌ Error loading group:', error);
        }
    }

    close() {
        const modal = document.getElementById('groupMembersModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        this.currentGroupId = null;
        this.currentGroup = null;
        this.editMode = false;
        this.newGroupPhoto = null;
    }

    /* ==========================================
       🎨 RENDU DU MODAL
       ========================================== */
    
    renderModal() {
        const groupName = this.currentGroup.name || 'Group';
        const groupPhoto = this.currentGroup.photoURL || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=667eea&color=fff&size=256`;
        const groupDesc = this.currentGroup.description || '';
        const membersCount = this.currentGroup.participants.length;

        let modalHTML = `
            <div id="groupMembersModal" class="modal-overlay" style="display: none;">
                <div class="modal-container" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-users-cog"></i> Group Settings</h2>
                        <button class="modal-close" onclick="window.groupMembersManager.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
                        
                        <!-- ✅ SECTION ÉDITABLE : Group Info -->
                        <div class="group-settings-section">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <h3 class="section-title" style="margin: 0;">Group Information</h3>
                                ${!this.editMode ? `
                                    <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="window.groupMembersManager.toggleEditMode()">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                ` : `
                                    <div style="display: flex; gap: 8px;">
                                        <button class="btn-primary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="window.groupMembersManager.saveGroupInfo()">
                                            <i class="fas fa-save"></i> Save
                                        </button>
                                        <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="window.groupMembersManager.cancelEditMode()">
                                            <i class="fas fa-times"></i> Cancel
                                        </button>
                                    </div>
                                `}
                            </div>
                            
                            ${!this.editMode ? `
                                <!-- MODE LECTURE -->
                                <div class="group-info-display" style="display: flex; gap: 20px; align-items: center; padding: 20px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;">
                                    <img src="${groupPhoto}" 
                                         alt="Group" 
                                         class="group-settings-avatar"
                                         style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                                    <div class="group-info-text" style="flex: 1;">
                                        <div class="group-settings-name" style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                                            ${this.escapeHtml(groupName)}
                                        </div>
                                        <div class="group-settings-desc" style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 8px;">
                                            ${this.escapeHtml(groupDesc || 'No description')}
                                        </div>
                                        <div class="group-settings-meta" style="font-size: 0.85rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px;">
                                            <i class="fas fa-users"></i>
                                            ${membersCount} member${membersCount > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <!-- MODE ÉDITION -->
                                <div class="group-info-edit" style="padding: 20px; background: rgba(102, 126, 234, 0.05); border-radius: 12px;">
                                    
                                    <!-- Photo Upload avec Preview Animé -->
                                    <div style="text-align: center; margin-bottom: 24px;">
                                        <div id="groupPhotoPreviewContainer" style="position: relative; display: inline-block;">
                                            <img src="${groupPhoto}" 
                                                 id="groupPhotoPreview"
                                                 alt="Group" 
                                                 style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #667eea; transition: all 0.3s ease;">
                                            <input type="file" 
                                                   id="editGroupPhotoInput"
                                                   accept="image/*" 
                                                   style="display: none;"
                                                   onchange="window.groupMembersManager.handlePhotoSelect(event)">
                                            <button onclick="document.getElementById('editGroupPhotoInput').click()"
                                                    style="position: absolute; bottom: 0; right: 0; width: 36px; height: 36px; border-radius: 50%; background: #667eea; color: white; border: 2px solid white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: all 0.2s; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);">
                                                <i class="fas fa-camera"></i>
                                            </button>
                                        </div>
                                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">Click the camera to change photo</p>
                                    </div>
                                    
                                    <!-- Nom du groupe -->
                                    <div style="margin-bottom: 16px;">
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                                            <i class="fas fa-users"></i> Group Name *
                                        </label>
                                        <input type="text" 
                                               id="editGroupName" 
                                               value="${this.escapeHtml(groupName)}"
                                               maxlength="50"
                                               style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; font-weight: 600;"
                                               placeholder="Enter group name">
                                    </div>
                                    
                                    <!-- Description -->
                                    <div>
                                        <label style="display: block; font-weight: 600; margin-bottom: 6px; color: var(--text-primary);">
                                            <i class="fas fa-align-left"></i> Description (optional)
                                        </label>
                                        <textarea id="editGroupDesc"
                                                  maxlength="200"
                                                  rows="3"
                                                  style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; resize: vertical;"
                                                  placeholder="Enter group description">${this.escapeHtml(groupDesc)}</textarea>
                                    </div>
                                </div>
                                
                                <!-- ✨ Animations CSS -->
                                <style>
                                    @keyframes bounceIn {
                                        0% { transform: scale(0); opacity: 0; }
                                        50% { transform: scale(1.1); }
                                        100% { transform: scale(1); opacity: 1; }
                                    }
                                    
                                    @keyframes fadeOut {
                                        0% { opacity: 1; transform: scale(1); }
                                        100% { opacity: 0; transform: scale(0.8); }
                                    }
                                    
                                    @keyframes pulse {
                                        0%, 100% { transform: scale(1); }
                                        50% { transform: scale(1.05); }
                                    }
                                    
                                    #groupPhotoPreviewContainer button:hover {
                                        transform: scale(1.1);
                                        background: #5568d3 !important;
                                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.6) !important;
                                    }
                                </style>
                            `}
                        </div>
                        
                        <!-- Members List -->
                        <div class="group-settings-section">
                            <h3 class="section-title">
                                Members (${membersCount})
                            </h3>
                            
                            <div class="group-members-list" style="max-height: 300px; overflow-y: auto;">
                                ${this.renderMembersList()}
                            </div>
                        </div>
                        
                        <!-- Add Member Button -->
                        <div class="group-settings-section">
                            <button class="btn-secondary" onclick="window.groupMembersManager.openAddMemberModal()" style="width: 100%;">
                                <i class="fas fa-user-plus"></i> Add Member
                            </button>
                        </div>
                        
                        <!-- Danger Zone -->
                        <div class="group-settings-section danger-zone" style="border-top: 2px solid #fee; background: rgba(239, 68, 68, 0.05); padding: 20px; border-radius: 12px;">
                            <h3 class="section-title" style="color: #dc2626;">
                                <i class="fas fa-exclamation-triangle"></i> Danger Zone
                            </h3>
                            <button class="btn-danger" onclick="window.groupMembersManager.deleteGroup()" style="width: 100%;">
                                <i class="fas fa-trash-alt"></i> Delete Group Permanently
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        `;

        let existingModal = document.getElementById('groupMembersModal');
        if (existingModal) {
            existingModal.outerHTML = modalHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    renderMembersList() {
        return this.currentGroup.participants.map(userId => {
            const userData = this.currentGroup.participantsData[userId] || {};
            const isAdmin = this.currentGroup.admins.includes(userId);
            const isCreator = userId === this.currentGroup.createdBy;
            const isSelf = userId === this.currentUser.uid;

            const displayName = userData.displayName || 'Unknown';
            const avatar = userData.photoURL || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

            return `
                <div class="group-member-item" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
                    <img src="${avatar}" 
                         alt="${this.escapeHtml(displayName)}" 
                         class="member-item-avatar"
                         style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-right: 12px;">
                    
                    <div class="member-item-info" style="flex: 1;">
                        <div class="member-item-name" style="font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            ${this.escapeHtml(displayName)}
                            ${isCreator ? '<span class="member-badge creator" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">Creator</span>' : ''}
                            ${isAdmin && !isCreator ? '<span class="member-badge admin" style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">Admin</span>' : ''}
                            ${isSelf ? '<span class="member-badge self" style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700;">You</span>' : ''}
                        </div>
                        <div class="member-item-email" style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                            ${this.escapeHtml(userData.email || '')}
                        </div>
                    </div>
                    
                    ${!isCreator && !isSelf ? `
                        <div class="member-item-actions" style="display: flex; gap: 8px;">
                            ${!isAdmin ? `
                                <button class="member-action-btn" 
                                        onclick="window.groupMembersManager.makeAdmin('${userId}')" 
                                        title="Make admin"
                                        style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                                    <i class="fas fa-user-shield"></i>
                                </button>
                            ` : `
                                <button class="member-action-btn" 
                                        onclick="window.groupMembersManager.removeAdmin('${userId}')" 
                                        title="Remove admin"
                                        style="padding: 8px 12px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                                    <i class="fas fa-user-minus"></i>
                                </button>
                            `}
                            
                            <button class="member-action-btn danger" 
                                    onclick="window.groupMembersManager.removeMember('${userId}')" 
                                    title="Remove from group"
                                    style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    /* ==========================================
       ✏ MODE ÉDITION DU GROUPE
       ========================================== */
    
    toggleEditMode() {
        this.editMode = true;
        this.renderModal();
        
        const modal = document.getElementById('groupMembersModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    cancelEditMode() {
        this.editMode = false;
        this.newGroupPhoto = null;
        this.renderModal();
        
        const modal = document.getElementById('groupMembersModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('🖼 [GROUP EDIT] Photo selected:', file.name, 'Size:', file.size, 'bytes');

        if (!file.type.startsWith('image/')) {
            console.error('⚠ Invalid file type. Please select an image.');
            alert('Please select an image file (JPG, PNG, etc.)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            console.error('⚠ File too large:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            alert('Image is too large (max 5MB)');
            return;
        }

        this.newGroupPhoto = file;
        console.log('✅ [GROUP EDIT] Photo stored in this.newGroupPhoto');

        // ✅ CORRECTION : Preview avec diagnostic CSS complet
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('groupPhotoPreview');
            const previewContainer = document.getElementById('groupPhotoPreviewContainer');
            
            console.log('📸 Reader loaded, preview element:', preview ? 'FOUND' : 'NOT FOUND');
            console.log('📦 Container element:', previewContainer ? 'FOUND' : 'NOT FOUND');
            
            if (preview) {
                // ✅ DIAGNOSTIC : Afficher les styles actuels
                const computedStyle = window.getComputedStyle(preview);
                console.log('🎨 Current styles BEFORE update:', {
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity,
                    width: computedStyle.width,
                    height: computedStyle.height,
                    position: computedStyle.position
                });
                
                // ✅ FORCER tous les styles nécessaires
                preview.style.display = 'block';
                preview.style.visibility = 'visible';
                preview.style.opacity = '1';
                preview.style.width = '100px';
                preview.style.height = '100px';
                preview.style.borderRadius = '50%';
                preview.style.objectFit = 'cover';
                preview.style.border = '3px solid #667eea';
                
                // ✅ Changer le src
                preview.src = e.target.result;
                
                console.log('✅ [GROUP EDIT] Preview SRC updated to:', e.target.result.substring(0, 50) + '...');
                
                // ✅ Vérifier les styles APRÈS update
                setTimeout(() => {
                    const newComputedStyle = window.getComputedStyle(preview);
                    console.log('🎨 Styles AFTER update:', {
                        display: newComputedStyle.display,
                        visibility: newComputedStyle.visibility,
                        opacity: newComputedStyle.opacity,
                        src: preview.src.substring(0, 50) + '...'
                    });
                }, 100);
                
                console.log('✅ [GROUP EDIT] Preview refreshed');
                
                // ✅ Ajouter badge "NEW PHOTO"
                if (previewContainer) {
                    let badge = document.getElementById('newPhotoBadge');
                    
                    if (!badge) {
                        console.log('🎖 Creating NEW PHOTO badge...');
                        badge = document.createElement('div');
                        badge.id = 'newPhotoBadge';
                        badge.innerHTML = '<i class="fas fa-check-circle"></i> NEW PHOTO';
                        badge.style.cssText = `
                            position: absolute;
                            top: -10px;
                            right: -10px;
                            background: linear-gradient(135deg, #10b981, #059669);
                            color: white;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 0.75rem;
                            font-weight: 800;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                            animation: bounceIn 0.5s ease, pulse 2s infinite;
                            z-index: 10;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                        `;
                        previewContainer.appendChild(badge);
                        console.log('✅ Badge created and added');
                    } else {
                        console.log('ℹ Badge already exists, re-animating...');
                        badge.style.animation = 'none';
                        setTimeout(() => {
                            badge.style.animation = 'bounceIn 0.5s ease, pulse 2s infinite';
                        }, 10);
                    }
                } else {
                    console.error('❌ Preview container not found!');
                }
            } else {
                console.error('❌ Preview element (#groupPhotoPreview) not found!');
            }
        };
        
        reader.onerror = (error) => {
            console.error('❌ FileReader error:', error);
        };
        
        console.log('📖 Starting FileReader...');
        reader.readAsDataURL(file);

        console.log('📸 Photo selection complete:', file.name);
    }

    async saveGroupInfo() {
        const nameInput = document.getElementById('editGroupName');
        const descInput = document.getElementById('editGroupDesc');

        if (!nameInput) {
            console.error('❌ Name input not found');
            return;
        }

        const newName = nameInput.value.trim();
        const newDesc = descInput ? descInput.value.trim() : '';

        if (!newName) {
            console.error('⚠ Group name is required');
            alert('Please enter a group name');
            return;
        }

        console.log('💾 Saving group info...');
        console.log('📊 Current state:', {
            newName,
            newDesc,
            hasNewPhoto: !!this.newGroupPhoto,
            photoFileName: this.newGroupPhoto?.name || 'none',
            photoFileSize: this.newGroupPhoto ? `${(this.newGroupPhoto.size / 1024).toFixed(2)} KB` : 'N/A'
        });

        try {
            let newPhotoURL = this.currentGroup.photoURL;

            // ✅ Upload nouvelle photo si sélectionnée
            if (this.newGroupPhoto) {
                console.log('📤 Uploading new photo...');
                console.log('📦 File details:', {
                    name: this.newGroupPhoto.name,
                    type: this.newGroupPhoto.type,
                    size: this.newGroupPhoto.size
                });
                
                newPhotoURL = await this.uploadGroupPhoto();
                
                if (newPhotoURL) {
                    console.log('✅ New photo URL received:', newPhotoURL);
                    
                    // ✅ Retirer le badge "NEW PHOTO" avec animation
                    const badge = document.getElementById('newPhotoBadge');
                    if (badge) {
                        badge.style.animation = 'fadeOut 0.3s ease';
                        setTimeout(() => badge.remove(), 300);
                    }
                } else {
                    console.warn('⚠ Upload returned null URL, keeping old photo');
                }
            } else {
                console.log('ℹ No new photo to upload');
            }

            // ✅ Mettre à jour Firestore
            console.log('📝 Updating Firestore...');
            await this.db.collection('conversations').doc(this.currentGroupId).update({
                name: newName,
                description: newDesc,
                photoURL: newPhotoURL
            });

            console.log('✅ Group info updated successfully');

            // Recharger
            this.editMode = false;
            this.newGroupPhoto = null;
            await this.open(this.currentGroupId);

        } catch (error) {
            console.error('❌ Error saving group info:', error);
            console.error('Error details:', error.message);
            alert('Failed to save group info. Please try again.');
        }
    }

    async uploadGroupPhoto() {
        try {
            console.log('📤 Starting R2 upload process...');

            const token = await this.currentUser.getIdToken();
            console.log('🔑 Auth token obtained');

            const formData = new FormData();
            formData.append('file', this.newGroupPhoto);
            formData.append('userId', this.currentUser.uid);
            formData.append('conversationId', this.currentGroupId);

            console.log('📦 FormData prepared:', {
                fileName: this.newGroupPhoto.name,
                fileSize: this.newGroupPhoto.size,
                userId: this.currentUser.uid,
                conversationId: this.currentGroupId
            });

            console.log('🌐 Uploading to R2:', this.R2_WORKER_URL);

            const response = await fetch(`${this.R2_WORKER_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('📡 R2 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ R2 Upload failed:', errorText);
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Photo uploaded successfully:', data.url);

            return data.url;

        } catch (error) {
            console.error('❌ Error uploading group photo:', error);
            console.error('Error stack:', error.stack);
            alert('Failed to upload photo. Please try again.');
            throw error;
        }
    }

    /* ==========================================
       ➕ AJOUTER UN MEMBRE
       ========================================== */
    
    openAddMemberModal() {
        const addMemberModalHTML = `
            <div id="addMemberModal" class="modal-overlay" style="display: flex; z-index: 10001;">
                <div class="modal-container" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-user-plus"></i> Add Member</h2>
                        <button class="modal-close" onclick="window.groupMembersManager.closeAddMemberModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        
                        <!-- Search Input -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">
                                <i class="fas fa-search"></i> Search Users
                            </label>
                            <input type="text" 
                                   id="addMemberSearchInput" 
                                   placeholder="Search by name or email..."
                                   style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;"
                                   oninput="window.groupMembersManager.searchUsersToAdd(this.value)">
                        </div>
                        
                        <!-- Search Results -->
                        <div id="addMemberSearchResults" style="max-height: 400px; overflow-y: auto;">
                            <p style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                                <i class="fas fa-search" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 12px;"></i>
                                Start typing to search users
                            </p>
                        </div>
                        
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', addMemberModalHTML);
    }

    closeAddMemberModal() {
        const modal = document.getElementById('addMemberModal');
        if (modal) {
            modal.remove();
        }
    }

    searchUsersTimeout = null;

    searchUsersToAdd(query) {
        clearTimeout(this.searchUsersTimeout);

        if (query.trim().length < 2) {
            const resultsContainer = document.getElementById('addMemberSearchResults');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <p style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                        <i class="fas fa-search" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 12px;"></i>
                        Start typing to search users
                    </p>
                `;
            }
            return;
        }

        const resultsContainer = document.getElementById('addMemberSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <p style="text-align: center; padding: 20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: #667eea;"></i>
                </p>
            `;
        }

        this.searchUsersTimeout = setTimeout(() => {
            this.performUserSearch(query);
        }, 300);
    }

    async performUserSearch(query) {
        const resultsContainer = document.getElementById('addMemberSearchResults');
        if (!resultsContainer) return;

        try {
            const queryLower = query.toLowerCase();

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
                const userId = doc.id;
                // Exclure les membres déjà dans le groupe
                if (!this.currentGroup.participants.includes(userId)) {
                    usersMap.set(userId, { uid: userId, ...doc.data() });
                }
            });

            nameSnapshot.docs.forEach(doc => {
                const userId = doc.id;
                if (!this.currentGroup.participants.includes(userId)) {
                    usersMap.set(userId, { uid: userId, ...doc.data() });
                }
            });

            const users = Array.from(usersMap.values());

            if (users.length === 0) {
                resultsContainer.innerHTML = `
                    <p style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
                        <i class="fas fa-user-slash" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 12px;"></i>
                        No users found
                    </p>
                `;
                return;
            }

            const resultsHTML = users.map(user => {
                const displayName = user.displayName || user.email?.split('@')[0] || 'Unknown User';
                const avatar = user.photoURL || 
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff`;

                return `
                    <div class="user-search-result" 
                         onclick="window.groupMembersManager.addMemberToGroup('${user.uid}', ${JSON.stringify(user).replace(/"/g, '&quot;')})"
                         style="display: flex; align-items: center; padding: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s;">
                        
                        <img src="${avatar}" 
                             alt="${this.escapeHtml(displayName)}" 
                             style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; margin-right: 12px;">
                        
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary);">${this.escapeHtml(displayName)}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${this.escapeHtml(user.email || '')}</div>
                        </div>
                        
                        <button style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                `;
            }).join('');

            resultsContainer.innerHTML = resultsHTML;

        } catch (error) {
            console.error('❌ Error searching users:', error);
            resultsContainer.innerHTML = `
                <p style="text-align: center; color: #ef4444; padding: 40px 20px;">
                    Error searching users
                </p>
            `;
        }
    }

    async addMemberToGroup(userId, userData) {
        console.log('➕ Adding member to group:', userId);

        try {
            await this.db.collection('conversations').doc(this.currentGroupId).update({
                participants: firebase.firestore.FieldValue.arrayUnion(userId),
                [`participantsData.${userId}`]: {
                    displayName: userData.displayName || userData.email?.split('@')[0] || 'Unknown User',
                    photoURL: userData.photoURL || null,
                    email: userData.email || null,
                    plan: userData.plan || 'free'
                },
                [`unreadCount.${userId}`]: 0
            });

            console.log('✅ Member added to group');

            this.closeAddMemberModal();
            await this.open(this.currentGroupId);

        } catch (error) {
            console.error('❌ Error adding member:', error);
        }
    }

    /* ==========================================
       👥 GESTION DES MEMBRES
       ========================================== */
    
    async makeAdmin(userId) {
        if (!confirm('Make this user an admin?')) return;

        try {
            await this.db.collection('conversations').doc(this.currentGroupId).update({
                admins: firebase.firestore.FieldValue.arrayUnion(userId)
            });

            console.log('✅ User promoted to admin');
            await this.open(this.currentGroupId);

        } catch (error) {
            console.error('❌ Error promoting user:', error);
        }
    }

    async removeAdmin(userId) {
        if (!confirm('Remove admin privileges from this user?')) return;

        try {
            await this.db.collection('conversations').doc(this.currentGroupId).update({
                admins: firebase.firestore.FieldValue.arrayRemove(userId)
            });

            console.log('✅ Admin removed');
            await this.open(this.currentGroupId);

        } catch (error) {
            console.error('❌ Error removing admin:', error);
        }
    }

    async removeMember(userId) {
        const userData = this.currentGroup.participantsData[userId] || {};
        const displayName = userData.displayName || 'this user';

        if (!confirm(`Remove ${displayName} from the group?`)) return;

        try {
            await this.db.collection('conversations').doc(this.currentGroupId).update({
                participants: firebase.firestore.FieldValue.arrayRemove(userId),
                admins: firebase.firestore.FieldValue.arrayRemove(userId),
                [`participantsData.${userId}`]: firebase.firestore.FieldValue.delete()
            });

            console.log('✅ Member removed');
            await this.open(this.currentGroupId);

        } catch (error) {
            console.error('❌ Error removing member:', error);
        }
    }

    /* ==========================================
       🗑 SUPPRESSION DU GROUPE
       ========================================== */
    
    async deleteGroup() {
        const confirmText = `⚠ WARNING ⚠\n\nAre you sure you want to permanently delete "${this.currentGroup.name}"?\n\n• All messages will be deleted\n• All members will be removed\n• This action cannot be undone\n\nPress OK to confirm deletion.`;
        
        if (!confirm(confirmText)) return;

        try {
            console.log('🗑 Deleting group:', this.currentGroupId);

            const messagesSnapshot = await this.db
                .collection('conversations')
                .doc(this.currentGroupId)
                .collection('messages')
                .get();

            console.log(`📊 Deleting ${messagesSnapshot.size} messages...`);

            const batchSize = 500;
            let batch = this.db.batch();
            let operationCount = 0;

            for (const doc of messagesSnapshot.docs) {
                batch.delete(doc.ref);
                operationCount++;

                if (operationCount === batchSize) {
                    await batch.commit();
                    batch = this.db.batch();
                    operationCount = 0;
                }
            }

            if (operationCount > 0) {
                await batch.commit();
            }

            await this.db.collection('conversations').doc(this.currentGroupId).delete();

            console.log('✅ Group deleted');

            this.close();

            if (window.messagesHub) {
                window.messagesHub.loadConversations();
            }

            if (window.groupChat) {
                window.groupChat.closeGroup();
            }

        } catch (error) {
            console.error('❌ Error deleting group:', error);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.groupMembersManager = new GroupMembersManager();
    window.groupMembersManager.initialize();
});

console.log('✅ group-members-manager.js loaded (v2.2 - Preview Enhanced with Animated Badge)');