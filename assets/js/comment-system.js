/* ============================================
   ALPHAVAULT AI - COMMENT SYSTEM
   Système de Commentaires Threaded
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
            console.log('💬 Initializing Comment System...');
            
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
            this.commentSubmitBtn.addEventListener('click', () => {
                this.handleSubmitComment();
            });
        }

        // Allow Ctrl+Enter to submit
        if (this.commentTextarea) {
            this.commentTextarea.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    this.handleSubmitComment();
                }
            });
        }
    }

    async loadComments() {
        try {
            console.log('💬 Chargement des commentaires pour le post:', this.postId);
            
            this.comments = await window.communityService.getComments(this.postId);
            
            console.log('📊 Commentaires récupérés:', this.comments);
            console.log('📊 Nombre de commentaires:', this.comments.length);
            
            this.renderComments();
            this.updateCommentsCount();
        } catch (error) {
            console.error('❌ Error loading comments:', error);
            
            // Afficher l'erreur dans l'UI
            if (this.commentsList) {
                this.commentsList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 16px;"></i>
                        <p style="font-weight: 700;">Failed to load comments</p>
                        <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
                    </div>
                `;
            }
        }
    }

    renderComment(comment, isReply = false) {
        const timeAgo = this.formatTimeAgo(comment.createdAt);
        const currentUser = firebase.auth().currentUser;
        const hasUpvoted = currentUser && comment.upvotedBy?.includes(currentUser.uid);

        const repliesHTML = comment.replies && comment.replies.length > 0 
            ? comment.replies.map(reply => this.renderComment(reply, true)).join('')
            : '';

        // ✅ Gestion de l'avatar avec photo OU initiales
        const authorAvatar = comment.authorPhoto || comment.authorAvatar;
        
        const avatarHTML = authorAvatar ? `
            <img 
                src="${authorAvatar}" 
                alt="${this.escapeHtml(comment.authorName)}" 
                class="comment-avatar"
                style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >
            <div class="comment-avatar-fallback" style="display: none; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: none; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem;">
                ${comment.authorName.charAt(0).toUpperCase()}
            </div>
        ` : `
            <div class="comment-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem;">
                ${comment.authorName.charAt(0).toUpperCase()}
            </div>
        `;

        return `
            <div class="comment-item ${isReply ? 'reply' : ''}" data-comment-id="${comment.id}">
                <div class="comment-author-section">
                    ${avatarHTML}
                    <div class="comment-author-info">
                        <h4>${this.escapeHtml(comment.authorName)}</h4>
                        <p><i class="fas fa-clock"></i> ${timeAgo}</p>
                    </div>
                </div>

                <div class="comment-content">
                    ${this.escapeHtml(comment.content)}
                </div>

                <div class="comment-actions">
                    <button class="comment-action-btn upvote-comment-btn ${hasUpvoted ? 'upvoted' : ''}" data-comment-id="${comment.id}">
                        <i class="fas fa-arrow-up"></i>
                        <span>${comment.upvotes || 0}</span>
                    </button>
                    <button class="comment-action-btn reply-comment-btn" data-comment-id="${comment.id}" data-author-name="${comment.authorName}">
                        <i class="fas fa-reply"></i>
                        <span>Reply</span>
                    </button>
                </div>

                ${repliesHTML}
            </div>
        `;
    }

    renderComment(comment, isReply = false) {
        const timeAgo = this.formatTimeAgo(comment.createdAt);
        const currentUser = firebase.auth().currentUser;
        const hasUpvoted = currentUser && comment.upvotedBy?.includes(currentUser.uid);

        const repliesHTML = comment.replies && comment.replies.length > 0 
            ? comment.replies.map(reply => this.renderComment(reply, true)).join('')
            : '';

        return `
            <div class="comment-item ${isReply ? 'reply' : ''}" data-comment-id="${comment.id}">
                <div class="comment-author-section">
                    ${comment.authorAvatar || comment.authorPhoto ? `
                        <img 
                            src="${comment.authorAvatar || comment.authorPhoto}" 
                            alt="${comment.authorName}" 
                            class="comment-avatar"
                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                        >
                        <div class="comment-avatar" style="display: none; width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem;">
                            ${comment.authorName.charAt(0).toUpperCase()}
                        </div>
                    ` : `
                        <div class="comment-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 1.2rem;">
                            ${comment.authorName.charAt(0).toUpperCase()}
                        </div>
                    `}
                    <div class="comment-author-info">
                        <h4>${this.escapeHtml(comment.authorName)}</h4>
                        <p><i class="fas fa-clock"></i> ${timeAgo}</p>
                    </div>
                </div>

                <div class="comment-content">
                    ${this.escapeHtml(comment.content)}
                </div>

                <div class="comment-actions">
                    <button class="comment-action-btn upvote-comment-btn ${hasUpvoted ? 'upvoted' : ''}" data-comment-id="${comment.id}">
                        <i class="fas fa-arrow-up"></i>
                        <span>${comment.upvotes || 0}</span>
                    </button>
                    <button class="comment-action-btn reply-comment-btn" data-comment-id="${comment.id}" data-author-name="${comment.authorName}">
                        <i class="fas fa-reply"></i>
                        <span>Reply</span>
                    </button>
                </div>

                ${repliesHTML}
            </div>
        `;
    }

    addCommentEventListeners() {
        // Upvote buttons
        document.querySelectorAll('.upvote-comment-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const commentId = e.currentTarget.dataset.commentId;
                await this.handleUpvoteComment(commentId, e.currentTarget);
            });
        });

        // Reply buttons
        document.querySelectorAll('.reply-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.currentTarget.dataset.commentId;
                const authorName = e.currentTarget.dataset.authorName;
                this.handleReplyClick(commentId, authorName);
            });
        });
    }

    handleReplyClick(commentId, authorName) {
        this.replyingTo = commentId;
        this.commentTextarea.placeholder = `Replying to ${authorName}...`;
        this.commentTextarea.focus();

        // Add cancel reply button if not exists
        if (!document.getElementById('cancelReplyBtn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancelReplyBtn';
            cancelBtn.type = 'button';
            cancelBtn.className = 'filter-btn';
            cancelBtn.style.marginLeft = '12px';
            cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Reply';
            cancelBtn.addEventListener('click', () => this.cancelReply());

            this.commentSubmitBtn.parentElement.appendChild(cancelBtn);
        }
    }

    cancelReply() {
        this.replyingTo = null;
        this.commentTextarea.placeholder = 'Share your thoughts...';
        
        const cancelBtn = document.getElementById('cancelReplyBtn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }

    async handleSubmitComment() {
        const content = this.commentTextarea.value.trim();

        if (!content) {
            alert('Please enter a comment');
            return;
        }

        if (content.length > 2000) {
            alert('Comment is too long (max 2000 characters)');
            return;
        }

        try {
            this.commentSubmitBtn.disabled = true;
            this.commentSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

            const commentData = {
                postId: this.postId,
                content: content,
                parentCommentId: this.replyingTo
            };

            await window.communityService.createComment(commentData);

            // Clear form
            this.commentTextarea.value = '';
            this.cancelReply();

            // Reload comments
            await this.loadComments();

            // Update post comment count
            const commentCountPost = document.getElementById('commentCountPost');
            if (commentCountPost) {
                const currentCount = parseInt(commentCountPost.textContent) || 0;
                commentCountPost.textContent = currentCount + 1;
            }

            console.log('✅ Comment posted');

        } catch (error) {
            console.error('❌ Error posting comment:', error);
            alert('Failed to post comment. Please try again.');
        } finally {
            this.commentSubmitBtn.disabled = false;
            this.commentSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Comment';
        }
    }

    async handleUpvoteComment(commentId, buttonElement) {
        try {
            await window.communityService.upvoteComment(commentId);

            // Reload comments to get updated data
            await this.loadComments();

        } catch (error) {
            console.error('❌ Error upvoting comment:', error);
        }
    }

    updateCommentsCount() {
        if (!this.commentsCount) return;

        const totalComments = this.countTotalComments(this.comments);
        this.commentsCount.textContent = `${totalComments} Comment${totalComments === 1 ? '' : 's'}`;
    }

    countTotalComments(comments) {
        let count = comments.length;
        
        comments.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                count += this.countTotalComments(comment.replies);
            }
        });

        return count;
    }

    formatTimeAgo(date) {
        if (!date) return 'Just now';
        
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
            }
        }
        
        return 'Just now';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.commentSystem = new CommentSystem();
});