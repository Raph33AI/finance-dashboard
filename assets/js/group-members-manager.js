/* ============================================
   GROUP-MEMBERS-MANAGER.JS v1.0
   👥 Gestion des membres du groupe
   ✅ Ajouter/retirer des membres
   ✅ Promouvoir/rétrograder admin
   ✅ Modifier infos du groupe
   ============================================ */

class GroupMembersManager {
    constructor() {
        this.currentUser = null;
        this.currentGroupId = null;
        this.currentGroup = null;
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    }

    initialize() {
        console.log('👥 Initializing Group Members Manager...');
        
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

        try {
            // Charger les données du groupe
            const groupDoc = await this.db.collection('conversations').doc(groupId).get();
            
            if (!groupDoc.exists) {
                alert('Group not found');
                return;
            }

            this.currentGroup = groupDoc.data();

            // Vérifier si l'utilisateur est admin
            if (!this.currentGroup.admins.includes(this.currentUser.uid)) {
                alert('Only admins can access group settings');
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
            alert('Failed to load group settings');
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
    }

    /* ==========================================
       🎨 RENDU DU MODAL
       ========================================== */
    
    renderModal() {
        let modalHTML = `
            <div id="groupMembersModal" class="modal-overlay" style="display: none;">
                <div class="modal-container" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-users-cog"></i> Group Settings</h2>
                        <button class="modal-close" onclick="window.groupMembersManager.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        
                        <!-- Group Info -->
                        <div class="group-settings-section">
                            <h3 class="section-title">Group Information</h3>
                            
                            <div class="group-info-display">
                                <img src="${this.currentGroup.photoURL || 'https://ui-avatars.com/api/?name=Group&background=667eea&color=fff'}" 
                                     alt="Group" 
                                     class="group-settings-avatar">
                                <div class="group-info-text">
                                    <div class="group-settings-name">${this.escapeHtml(this.currentGroup.name)}</div>
                                    <div class="group-settings-desc">${this.escapeHtml(this.currentGroup.description || 'No description')}</div>
                                    <div class="group-settings-meta">${this.currentGroup.participants.length} members</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Members List -->
                        <div class="group-settings-section">
                            <h3 class="section-title">
                                Members (${this.currentGroup.participants.length})
                            </h3>
                            
                            <div class="group-members-list">
                                ${this.renderMembersList()}
                            </div>
                        </div>
                        
                        <!-- Add Member Button -->
                        <div class="group-settings-section">
                            <button class="btn-secondary" onclick="window.groupMembersManager.openAddMember()" style="width: 100%;">
                                <i class="fas fa-user-plus"></i> Add Member
                            </button>
                        </div>
                        
                        <!-- Danger Zone -->
                        <div class="group-settings-section danger-zone">
                            <h3 class="section-title">Danger Zone</h3>
                            <button class="btn-danger" onclick="window.groupMembersManager.deleteGroup()" style="width: 100%;">
                                <i class="fas fa-trash-alt"></i> Delete Group
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        `;

        // Injecter le modal dans le body si pas déjà présent
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
                <div class="group-member-item">
                    <img src="${avatar}" alt="${this.escapeHtml(displayName)}" class="member-item-avatar">
                    
                    <div class="member-item-info">
                        <div class="member-item-name">
                            ${this.escapeHtml(displayName)}
                            ${isCreator ? '<span class="member-badge creator">Creator</span>' : ''}
                            ${isAdmin && !isCreator ? '<span class="member-badge admin">Admin</span>' : ''}
                            ${isSelf ? '<span class="member-badge self">You</span>' : ''}
                        </div>
                        <div class="member-item-email">${this.escapeHtml(userData.email || '')}</div>
                    </div>
                    
                    ${!isCreator && !isSelf ? `
                        <div class="member-item-actions">
                            ${!isAdmin ? `
                                <button class="member-action-btn" onclick="window.groupMembersManager.makeAdmin('${userId}')" title="Make admin">
                                    <i class="fas fa-user-shield"></i>
                                </button>
                            ` : `
                                <button class="member-action-btn" onclick="window.groupMembersManager.removeAdmin('${userId}')" title="Remove admin">
                                    <i class="fas fa-user-minus"></i>
                                </button>
                            `}
                            
                            <button class="member-action-btn danger" onclick="window.groupMembersManager.removeMember('${userId}')" title="Remove from group">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
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
            await this.open(this.currentGroupId); // Recharger

        } catch (error) {
            console.error('❌ Error promoting user:', error);
            alert('Failed to promote user');
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
            alert('Failed to remove admin');
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
            alert('Failed to remove member');
        }
    }

    openAddMember() {
        alert('Feature coming soon: Add member functionality');
        // TODO: Implémenter modal de recherche et ajout de membre
    }

    /* ==========================================
       🗑 SUPPRESSION DU GROUPE
       ========================================== */
    
    async deleteGroup() {
        const confirmText = `⚠ WARNING ⚠\n\nAre you sure you want to permanently delete "${this.currentGroup.name}"?\n\n• All messages will be deleted\n• All members will be removed\n• This action cannot be undone\n\nPress OK to confirm deletion.`;
        
        if (!confirm(confirmText)) return;

        try {
            console.log('🗑 Deleting group:', this.currentGroupId);

            // Supprimer tous les messages
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

            // Supprimer le groupe
            await this.db.collection('conversations').doc(this.currentGroupId).delete();

            console.log('✅ Group deleted');

            this.close();

            if (window.messagesHub) {
                window.messagesHub.loadConversations();
            }

            if (window.groupChat) {
                window.groupChat.closeGroup();
            }

            alert('✅ Group deleted successfully');

        } catch (error) {
            console.error('❌ Error deleting group:', error);
            alert('Failed to delete group');
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

console.log('✅ group-members-manager.js loaded (v1.0)');