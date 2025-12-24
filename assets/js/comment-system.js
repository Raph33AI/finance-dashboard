// /* ============================================
//    ALPHAVAULT AI - COMMENT SYSTEM
//    Système de Commentaires Threaded
//    ============================================ */

// class CommentSystem {
//     constructor() {
//         this.postId = null;
//         this.comments = [];
//         this.commentsList = document.getElementById('commentsList');
//         this.commentTextarea = document.getElementById('commentTextarea');
//         this.commentSubmitBtn = document.getElementById('commentSubmitBtn');
//         this.commentsCount = document.getElementById('commentsCount');
//         this.replyingTo = null;
//     }

//     async initialize(postId) {
//         try {
//             console.log('💬 Initializing Comment System...');
            
//             this.postId = postId;
            
//             // Load comments
//             await this.loadComments();
            
//             // Setup event listeners
//             this.setupEventListeners();
            
//             console.log('✅ Comment System initialized');
//         } catch (error) {
//             console.error('❌ Error initializing Comment System:', error);
//         }
//     }

//     setupEventListeners() {
//         if (this.commentSubmitBtn) {
//             this.commentSubmitBtn.addEventListener('click', () => {
//                 this.handleSubmitComment();
//             });
//         }

//         // Allow Ctrl+Enter to submit
//         if (this.commentTextarea) {
//             this.commentTextarea.addEventListener('keydown', (e) => {
//                 if (e.ctrlKey && e.key === 'Enter') {
//                     this.handleSubmitComment();
//                 }
//             });
//         }
//     }

//     async loadComments() {
//         try {
//             console.log('💬 Chargement des commentaires pour le post:', this.postId);
            
//             this.comments = await window.communityService.getComments(this.postId);
            
//             console.log('📊 Commentaires récupérés:', this.comments);
//             console.log('📊 Nombre de commentaires:', this.comments.length);
            
//             this.renderComments();
//             this.updateCommentsCount();
//         } catch (error) {
//             console.error('❌ Error loading comments:', error);
            
//             // Afficher l'erreur dans l'UI
//             if (this.commentsList) {
//                 this.commentsList.innerHTML = `
//                     <div style="text-align: center; padding: 40px; color: #ef4444;">
//                         <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 16px;"></i>
//                         <p style="font-weight: 700;">Failed to load comments</p>
//                         <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
//                     </div>
//                 `;
//             }
//         }
//     }

//     renderComments() {
//         if (!this.commentsList) {
//             console.error('❌ commentsList element not found');
//             return;
//         }

//         if (this.comments.length === 0) {
//             this.commentsList.innerHTML = `
//                 <div style="text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.5);">
//                     <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
//                     <p style="font-size: 1.1rem; font-weight: 700;">No comments yet</p>
//                     <p style="font-size: 0.95rem;">Be the first to share your thoughts!</p>
//                 </div>
//             `;
//             return;
//         }

//         const commentsHTML = this.comments.map(comment => this.renderComment(comment)).join('');
//         this.commentsList.innerHTML = commentsHTML;

//         // Add event listeners
//         this.addCommentEventListeners();
//     }

//     renderComment(comment, isReply = false) {
//         const timeAgo = this.formatTimeAgo(comment.createdAt);
//         const currentUser = firebase.auth().currentUser;
//         const hasUpvoted = currentUser && comment.upvotedBy?.includes(currentUser.uid);

//         const repliesHTML = comment.replies && comment.replies.length > 0 
//             ? comment.replies.map(reply => this.renderComment(reply, true)).join('')
//             : '';

//         // ✅ Gestion de l'avatar avec photo OU initiales
//         const authorAvatar = comment.authorPhoto || comment.authorAvatar;
        
//         const avatarHTML = authorAvatar ? `
//             <img 
//                 src="${authorAvatar}" 
//                 alt="${this.escapeHtml(comment.authorName)}" 
//                 class="comment-avatar"
//                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
//                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
//             >
//             <div class="comment-avatar-fallback" style="display: none; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem;">
//                 ${comment.authorName.charAt(0).toUpperCase()}
//             </div>
//         ` : `
//             <div class="comment-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem;">
//                 ${comment.authorName.charAt(0).toUpperCase()}
//             </div>
//         `;

//         return `
//             <div class="comment-item ${isReply ? 'reply' : ''}" data-comment-id="${comment.id}">
//                 <div class="comment-author-section">
//                     ${avatarHTML}
//                     <div class="comment-author-info">
//                         <h4>${this.escapeHtml(comment.authorName)}</h4>
//                         <p><i class="fas fa-clock"></i> ${timeAgo}</p>
//                     </div>
//                 </div>

//                 <div class="comment-content">
//                     ${this.escapeHtml(comment.content)}
//                 </div>

//                 <div class="comment-actions">
//                     <button class="comment-action-btn upvote-comment-btn ${hasUpvoted ? 'upvoted' : ''}" data-comment-id="${comment.id}">
//                         <i class="fas fa-arrow-up"></i>
//                         <span>${comment.upvotes || 0}</span>
//                     </button>
//                     <button class="comment-action-btn reply-comment-btn" data-comment-id="${comment.id}" data-author-name="${comment.authorName}">
//                         <i class="fas fa-reply"></i>
//                         <span>Reply</span>
//                     </button>
//                 </div>

//                 ${repliesHTML}
//             </div>
//         `;
//     }

//     addCommentEventListeners() {
//         // Upvote buttons
//         document.querySelectorAll('.upvote-comment-btn').forEach(btn => {
//             btn.addEventListener('click', async (e) => {
//                 const commentId = e.currentTarget.dataset.commentId;
//                 await this.handleUpvoteComment(commentId, e.currentTarget);
//             });
//         });

//         // Reply buttons
//         document.querySelectorAll('.reply-comment-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 const commentId = e.currentTarget.dataset.commentId;
//                 const authorName = e.currentTarget.dataset.authorName;
//                 this.handleReplyClick(commentId, authorName);
//             });
//         });
//     }

//     handleReplyClick(commentId, authorName) {
//         this.replyingTo = commentId;
//         this.commentTextarea.placeholder = `Replying to ${authorName}...`;
//         this.commentTextarea.focus();

//         // Add cancel reply button if not exists
//         if (!document.getElementById('cancelReplyBtn')) {
//             const cancelBtn = document.createElement('button');
//             cancelBtn.id = 'cancelReplyBtn';
//             cancelBtn.type = 'button';
//             cancelBtn.className = 'filter-btn';
//             cancelBtn.style.marginLeft = '12px';
//             cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Reply';
//             cancelBtn.addEventListener('click', () => this.cancelReply());

//             this.commentSubmitBtn.parentElement.appendChild(cancelBtn);
//         }
//     }

//     cancelReply() {
//         this.replyingTo = null;
//         this.commentTextarea.placeholder = 'Share your thoughts...';
        
//         const cancelBtn = document.getElementById('cancelReplyBtn');
//         if (cancelBtn) {
//             cancelBtn.remove();
//         }
//     }

//     async handleSubmitComment() {
//         const content = this.commentTextarea.value.trim();

//         if (!content) {
//             alert('Please enter a comment');
//             return;
//         }

//         if (content.length > 2000) {
//             alert('Comment is too long (max 2000 characters)');
//             return;
//         }

//         try {
//             this.commentSubmitBtn.disabled = true;
//             this.commentSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

//             const commentData = {
//                 postId: this.postId,
//                 content: content,
//                 parentCommentId: this.replyingTo
//             };

//             await window.communityService.createComment(commentData);

//             // Clear form
//             this.commentTextarea.value = '';
//             this.cancelReply();

//             // Reload comments
//             await this.loadComments();

//             // Update post comment count
//             const commentCountPost = document.getElementById('commentCountPost');
//             if (commentCountPost) {
//                 const currentCount = parseInt(commentCountPost.textContent) || 0;
//                 commentCountPost.textContent = currentCount + 1;
//             }

//             console.log('✅ Comment posted');

//         } catch (error) {
//             console.error('❌ Error posting comment:', error);
//             alert('Failed to post comment. Please try again.');
//         } finally {
//             this.commentSubmitBtn.disabled = false;
//             this.commentSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Comment';
//         }
//     }

//     async handleUpvoteComment(commentId, buttonElement) {
//         try {
//             await window.communityService.upvoteComment(commentId);

//             // Reload comments to get updated data
//             await this.loadComments();

//         } catch (error) {
//             console.error('❌ Error upvoting comment:', error);
//         }
//     }

//     updateCommentsCount() {
//         if (!this.commentsCount) return;

//         const totalComments = this.countTotalComments(this.comments);
//         this.commentsCount.textContent = `${totalComments} Comment${totalComments === 1 ? '' : 's'}`;
//     }

//     countTotalComments(comments) {
//         let count = comments.length;
        
//         comments.forEach(comment => {
//             if (comment.replies && comment.replies.length > 0) {
//                 count += this.countTotalComments(comment.replies);
//             }
//         });

//         return count;
//     }

//     formatTimeAgo(date) {
//         if (!date) return 'Just now';
        
//         const seconds = Math.floor((new Date() - date) / 1000);
        
//         const intervals = {
//             year: 31536000,
//             month: 2592000,
//             week: 604800,
//             day: 86400,
//             hour: 3600,
//             minute: 60
//         };
        
//         for (const [unit, secondsInUnit] of Object.entries(intervals)) {
//             const interval = Math.floor(seconds / secondsInUnit);
//             if (interval >= 1) {
//                 return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
//             }
//         }
        
//         return 'Just now';
//     }

//     escapeHtml(text) {
//         if (!text) return '';
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }
// }

// // Initialize on DOM load
// document.addEventListener('DOMContentLoaded', () => {
//     window.commentSystem = new CommentSystem();
// });

/* ============================================
   ALPHAVAULT AI - COMMENT SYSTEM
   Système de Commentaires (CORRIGÉ)
   ============================================ */

class CommentSystem {
    constructor() {
        this.postId = null;
        this.comments = [];
        this.commentsList = document.getElementById('commentsList');
        this.commentTextarea = document.getElementById('commentTextarea');
        this.commentSubmitBtn = document.getElementById('commentSubmitBtn');
        this.commentsCount = document.getElementById('commentsCount');
        this.replyingTo = null;
    }

    async initialize(postId) {
        try {
            console.log('💬 Initializing Comment System for post:', postId);
            
            this.postId = postId;
            
            // Load comments
            await this.loadComments();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Comment System initialized');
        } catch (error) {
            console.error('❌ Error initializing Comment System:', error);
        }
    }

    setupEventListeners() {
        if (this.commentSubmitBtn) {
            // ✅ CORRECTION : Remove all previous listeners
            const newBtn = this.commentSubmitBtn.cloneNode(true);
            this.commentSubmitBtn.parentNode.replaceChild(newBtn, this.commentSubmitBtn);
            this.commentSubmitBtn = newBtn;

            this.commentSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🖱 Comment submit button clicked');
                this.handleSubmitComment();
            });

            console.log('✅ Submit button listener attached');
        } else {
            console.error('❌ Comment submit button not found!');
        }

        // Allow Ctrl+Enter to submit
        if (this.commentTextarea) {
            this.commentTextarea.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSubmitComment();
                }
            });
        }
    }

    async loadComments() {
        try {
            console.log('💬 Loading comments for post:', this.postId);
            
            // ✅ CORRECTION : Utiliser getComments (pas createComment)
            this.comments = await window.communityService.getComments(this.postId);
            
            console.log('✅ Comments loaded:', this.comments.length);
            
            this.renderComments();
            this.updateCommentsCount();
        } catch (error) {
            console.error('❌ Error loading comments:', error);
            
            // Afficher l'erreur dans l'UI
            if (this.commentsList) {
                this.commentsList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 16px; color: #EF4444;"></i>
                        <p style="font-weight: 700; color: var(--text-primary);">Failed to load comments</p>
                        <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
                        <button class="filter-btn" onclick="location.reload()" style="margin-top: 16px;">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    renderComments() {
        if (!this.commentsList) {
            console.error('❌ commentsList element not found');
            return;
        }

        if (this.comments.length === 0) {
            this.commentsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">No comments yet</p>
                    <p style="font-size: 0.95rem;">Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }

        const commentsHTML = this.comments.map(comment => this.renderComment(comment)).join('');
        this.commentsList.innerHTML = commentsHTML;

        // Add event listeners
        this.addCommentEventListeners();
    }

    renderComment(comment) {
        // ✅ CORRECTION : Gérer le timestamp Firestore
        const createdAt = comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt);
        const timeAgo = this.formatTimeAgo(createdAt);
        
        const currentUser = firebase.auth().currentUser;
        const isAuthor = currentUser && comment.authorId === currentUser.uid;

        // ✅ CORRECTION : Avatar avec fallback
        const authorPhoto = comment.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}&background=3B82F6&color=fff`;

        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <!-- Avatar cliquable vers profil public -->
                <img 
                    src="${authorPhoto}" 
                    alt="${this.escapeHtml(comment.authorName)}" 
                    class="comment-avatar"
                    onclick="window.location.href='public-profile.html?id=${comment.authorId}'"
                    style="cursor: pointer; width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                
                <div class="comment-content-wrapper">
                    <div class="comment-header">
                        <!-- Nom cliquable vers profil public -->
                        <div class="comment-author" onclick="window.location.href='public-profile.html?id=${comment.authorId}'" style="cursor: pointer;">
                            ${this.escapeHtml(comment.authorName)}
                            ${this.getPlanBadge(comment.authorPlan)}
                        </div>
                        <div class="comment-date">
                            <i class="fas fa-clock"></i> ${timeAgo}
                        </div>
                    </div>

                    <div class="comment-text">
                        ${this.escapeHtml(comment.content)}
                    </div>

                    <div class="comment-actions">
                        <button class="comment-action-btn like-comment-btn ${comment.likes?.includes(currentUser?.uid) ? 'liked' : ''}" 
                                data-comment-id="${comment.id}">
                            <i class="fas fa-heart"></i>
                            <span>${comment.likes?.length || 0}</span>
                        </button>
                        
                        ${isAuthor ? `
                            <button class="comment-action-btn delete-comment-btn" data-comment-id="${comment.id}">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    addCommentEventListeners() {
        // Like buttons
        document.querySelectorAll('.like-comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const commentId = e.currentTarget.dataset.commentId;
                await this.handleLikeComment(commentId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const commentId = e.currentTarget.dataset.commentId;
                await this.handleDeleteComment(commentId);
            });
        });
    }

    async handleSubmitComment() {
        console.log('📝 handleSubmitComment called');

        const content = this.commentTextarea.value.trim();

        if (!content) {
            alert('Please enter a comment');
            return;
        }

        if (content.length > 2000) {
            alert('Comment is too long (max 2000 characters)');
            return;
        }

        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            alert('Please login to comment');
            return;
        }

        try {
            // Désactiver le bouton
            this.commentSubmitBtn.disabled = true;
            this.commentSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

            console.log('📤 Posting comment:', { postId: this.postId, content });

            // ✅ CORRECTION : Utiliser addComment (pas createComment)
            await window.communityService.addComment(this.postId, content);

            console.log('✅ Comment posted successfully');

            // Clear textarea
            this.commentTextarea.value = '';

            // Reload comments
            await this.loadComments();

            // Update post comment count
            if (window.postManager && window.postManager.post) {
                window.postManager.post.commentsCount = (window.postManager.post.commentsCount || 0) + 1;
                const statElement = document.querySelector('.post-stats .stat-item:nth-child(3)');
                if (statElement) {
                    statElement.innerHTML = `
                        <i class="fas fa-comments"></i>
                        ${window.postManager.post.commentsCount} comments
                    `;
                }
            }

        } catch (error) {
            console.error('❌ Error posting comment:', error);
            alert('Failed to post comment: ' + error.message);
        } finally {
            // Réactiver le bouton
            this.commentSubmitBtn.disabled = false;
            this.commentSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Comment';
        }
    }

    async handleLikeComment(commentId) {
        try {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                alert('Please login to like comments');
                return;
            }

            // TODO: Implémenter toggleLikeComment dans community-firebase.js
            console.log('Like comment:', commentId);

            // Reload comments
            await this.loadComments();

        } catch (error) {
            console.error('❌ Error liking comment:', error);
        }
    }

    async handleDeleteComment(commentId) {
        if (!confirm('Delete this comment?')) return;

        try {
            await window.communityService.deleteComment(commentId, this.postId);
            
            console.log('✅ Comment deleted');

            // Reload comments
            await this.loadComments();

            // Update post comment count
            if (window.postManager && window.postManager.post) {
                window.postManager.post.commentsCount = Math.max(0, (window.postManager.post.commentsCount || 0) - 1);
                const statElement = document.querySelector('.post-stats .stat-item:nth-child(3)');
                if (statElement) {
                    statElement.innerHTML = `
                        <i class="fas fa-comments"></i>
                        ${window.postManager.post.commentsCount} comments
                    `;
                }
            }

        } catch (error) {
            console.error('❌ Error deleting comment:', error);
            alert('Failed to delete comment: ' + error.message);
        }
    }

    updateCommentsCount() {
        if (!this.commentsCount) return;

        const totalComments = this.comments.length;
        this.commentsCount.textContent = `${totalComments} Comment${totalComments === 1 ? '' : 's'}`;
    }

    getPlanBadge(plan) {
        const plans = {
            'platinum': '<span class="plan-badge platinum"><i class="fas fa-crown"></i> Platinum</span>',
            'pro': '<span class="plan-badge pro"><i class="fas fa-star"></i> Pro</span>',
            'basic': '<span class="plan-badge basic">Basic</span>',
            'free': ''
        };

        return plans[plan] || '';
    }

    formatTimeAgo(date) {
        if (!date) return 'Just now';
        
        const now = new Date();
        const diffMs = now - date;
        const seconds = Math.floor(diffMs / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ✅ CORRECTION : Initialiser uniquement si sur la page post.html
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier qu'on est sur la page post.html
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (postId) {
        window.commentSystem = new CommentSystem();
        window.commentSystem.initialize(postId);
        console.log('✅ Comment System ready');
    }
});