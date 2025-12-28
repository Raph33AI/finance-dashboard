// /* ============================================
//    ALPHAVAULT AI - POST MANAGER
//    Affichage et gestion des posts (CORRIGÉ)
//    ============================================ */

// class PostManager {
//     constructor() {
//         this.postId = null;
//         this.post = null;
//         this.currentUser = null;
//         this.channels = []; // ✅ Stocker les channels
//         this.postContainer = document.getElementById('postDetailCard');
//         this.loadingElement = document.getElementById('postLoading');
//     }

//     async initialize() {
//         try {
//             console.log('📄 Initializing Post Manager...');

//             const urlParams = new URLSearchParams(window.location.search);
//             this.postId = urlParams.get('id');

//             if (!this.postId) {
//                 throw new Error('No post ID provided');
//             }

//             await this.waitForAuth();

//             // ✅ CORRECTION 1 : Charger les channels AVANT le post
//             await this.loadChannels();

//             await this.loadPost();

//             await window.communityService.incrementViews(this.postId);

//             this.renderPost();

//             await this.loadComments();

//             console.log('✅ Post Manager initialized');

//         } catch (error) {
//             console.error('❌ Error initializing Post Manager:', error);
//             this.showError('Failed to load post: ' + error.message);
//         }
//     }

//     async waitForAuth() {
//         return new Promise((resolve) => {
//             const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
//                 this.currentUser = user;
//                 unsubscribe();
//                 resolve();
//             });
//         });
//     }

//     // ✅ CORRECTION 2 : Charger les channels
//     async loadChannels() {
//         try {
//             this.channels = await window.communityService.getChannels();
//             console.log('📂 Channels loaded:', this.channels.length);
//         } catch (error) {
//             console.error('❌ Error loading channels:', error);
//             this.channels = []; // Fallback vide
//         }
//     }

//     async loadPost() {
//         try {
//             this.post = await window.communityService.getPost(this.postId);
//             console.log('✅ Post loaded:', this.post);
//         } catch (error) {
//             console.error('❌ Error loading post:', error);
//             throw error;
//         }
//     }

//     renderPost() {
//         if (this.loadingElement) {
//             this.loadingElement.style.display = 'none';
//         }

//         const isAuthor = this.currentUser && this.post.authorId === this.currentUser.uid;
//         const hasLiked = this.post.likes && this.post.likes.includes(this.currentUser?.uid);

//         this.postContainer.innerHTML = `
//             ${this.renderPostHeader(isAuthor)}
//             ${this.renderPostContent()}
//             ${this.renderPostImages()}
//             ${this.renderPostTags()}
//             ${this.renderPostActions(hasLiked)}
//         `;

//         this.attachEventListeners();

//         document.getElementById('commentsSection').style.display = 'block';
//     }

//     renderPostHeader(isAuthor) {
//         const channelBadge = this.getChannelBadge(this.post.channelId);
//         const planBadge = this.getPlanBadge(this.post.authorPlan);

//         return `
//             <div class="post-header">
//                 <div class="post-meta">
//                     ${channelBadge}
//                     <div class="post-author">
//                         <!-- ✅ CORRECTION : public-profile.html -->
//                         <img src="${this.post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.post.authorName) + '&background=3B82F6&color=fff'}" 
//                             alt="${this.post.authorName}" 
//                             class="author-avatar"
//                             onclick="window.location.href='public-profile.html?id=${this.post.authorId}'"
//                             style="cursor: pointer;">
//                         <div class="author-info">
//                             <div class="author-name" onclick="window.location.href='public-profile.html?id=${this.post.authorId}'" style="cursor: pointer;">
//                                 ${this.post.authorName}
//                                 ${planBadge}
//                             </div>
//                             <div class="post-date">
//                                 <i class="fas fa-clock"></i>
//                                 ${this.formatDate(this.post.createdAt)}
//                                 ${this.post.updatedAt && this.post.updatedAt.seconds !== this.post.createdAt.seconds ? '<span class="edited-badge">(edited)</span>' : ''}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 ${isAuthor ? `
//                     <div class="post-author-actions">
//                         <button class="icon-btn edit-btn" title="Edit post" data-action="edit">
//                             <i class="fas fa-edit"></i>
//                         </button>
//                         <button class="icon-btn delete-btn" title="Delete post" data-action="delete">
//                             <i class="fas fa-trash-alt"></i>
//                         </button>
//                     </div>
//                 ` : ''}
//             </div>

//             <h1 class="post-title">${this.escapeHtml(this.post.title)}</h1>

//             <div class="post-stats">
//                 <span class="stat-item">
//                     <i class="fas fa-eye"></i>
//                     ${this.post.views || 0} views
//                 </span>
//                 <span class="stat-item">
//                     <i class="fas fa-heart"></i>
//                     ${this.post.likes?.length || 0} likes
//                 </span>
//                 <span class="stat-item">
//                     <i class="fas fa-comments"></i>
//                     ${this.post.commentsCount || 0} comments
//                 </span>
//             </div>
//         `;
//     }

//     renderPostContent() {
//         const htmlContent = marked.parse(this.post.content || '');

//         return `
//             <div class="post-content">
//                 ${htmlContent}
//             </div>
//         `;
//     }

//     renderPostImages() {
//         if (!this.post.images || this.post.images.length === 0) {
//             return '';
//         }

//         const imagesHTML = this.post.images.map((imageUrl, index) => `
//             <div class="post-image-wrapper" data-image-index="${index}">
//                 <img src="${imageUrl}" alt="Post Image ${index + 1}" loading="lazy">
//             </div>
//         `).join('');

//         return `
//             <div class="post-images-grid">
//                 ${imagesHTML}
//             </div>
//         `;
//     }

//     renderPostTags() {
//         if (!this.post.tags || this.post.tags.length === 0) {
//             return '';
//         }

//         const tagsHTML = this.post.tags.map(tag => `
//             <a href="community-hub.html?tag=${encodeURIComponent(tag)}" class="post-tag">
//                 #${tag}
//             </a>
//         `).join('');

//         return `
//             <div class="post-tags">
//                 ${tagsHTML}
//             </div>
//         `;
//     }

//     renderPostActions(hasLiked) {
//         return `
//             <div class="post-actions-bar">
//                 <button class="action-btn like-btn ${hasLiked ? 'liked' : ''}" data-action="like">
//                     <i class="fas fa-heart"></i>
//                     <span class="like-count">${this.post.likes?.length || 0}</span>
//                 </button>
//                 <button class="action-btn share-btn" data-action="share">
//                     <i class="fas fa-share-alt"></i>
//                     Share
//                 </button>
//                 <button class="action-btn bookmark-btn" data-action="bookmark">
//                     <i class="fas fa-bookmark"></i>
//                     Save
//                 </button>
//             </div>
//         `;
//     }

//     attachEventListeners() {
//         const likeBtn = this.postContainer.querySelector('[data-action="like"]');
//         if (likeBtn) {
//             likeBtn.addEventListener('click', () => this.handleLike());
//         }

//         const editBtn = this.postContainer.querySelector('[data-action="edit"]');
//         if (editBtn) {
//             editBtn.addEventListener('click', () => this.handleEdit());
//         }

//         const deleteBtn = this.postContainer.querySelector('[data-action="delete"]');
//         if (deleteBtn) {
//             deleteBtn.addEventListener('click', () => this.handleDelete());
//         }

//         const shareBtn = this.postContainer.querySelector('[data-action="share"]');
//         if (shareBtn) {
//             shareBtn.addEventListener('click', () => this.handleShare());
//         }

//         const imageWrappers = this.postContainer.querySelectorAll('.post-image-wrapper');
//         imageWrappers.forEach(wrapper => {
//             wrapper.addEventListener('click', () => {
//                 const imageUrl = wrapper.querySelector('img').src;
//                 this.openImageLightbox(imageUrl);
//             });
//         });
//     }

//     async handleLike() {
//         try {
//             if (!this.currentUser) {
//                 alert('Please login to like posts');
//                 return;
//             }

//             const result = await window.communityService.toggleLike(this.postId);

//             const likeBtn = this.postContainer.querySelector('[data-action="like"]');
//             const likeCount = likeBtn.querySelector('.like-count');

//             if (result.liked) {
//                 likeBtn.classList.add('liked');
//             } else {
//                 likeBtn.classList.remove('liked');
//             }

//             likeCount.textContent = result.count;

//             this.post.likes = result.liked 
//                 ? [...(this.post.likes || []), this.currentUser.uid]
//                 : (this.post.likes || []).filter(uid => uid !== this.currentUser.uid);

//         } catch (error) {
//             console.error('❌ Error liking post:', error);
//             alert('Failed to like post');
//         }
//     }

//     handleEdit() {
//         window.location.href = `edit-post.html?id=${this.postId}`;
//     }

//     async handleDelete() {
//         if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
//             return;
//         }

//         try {
//             await window.communityService.deletePost(this.postId);
//             alert('Post deleted successfully');
//             window.location.href = 'community-hub.html';
//         } catch (error) {
//             console.error('❌ Error deleting post:', error);
//             alert('Failed to delete post: ' + error.message);
//         }
//     }

//     handleShare() {
//         const postUrl = window.location.href;
//         const postTitle = this.post.title;
//         const postDescription = this.stripMarkdown(this.post.content).substring(0, 200);

//         this.openShareModal(postUrl, postTitle, postDescription);
//     }

//     openShareModal(url, title, description) {
//         // Créer le modal s'il n'existe pas
//         let modal = document.getElementById('shareModal');
        
//         if (!modal) {
//             modal = document.createElement('div');
//             modal.id = 'shareModal';
//             modal.className = 'share-modal';
//             modal.innerHTML = `
//                 <div class="share-modal-overlay"></div>
//                 <div class="share-modal-content">
//                     <div class="share-modal-header">
//                         <h3><i class="fas fa-share-alt"></i> Share this post</h3>
//                         <button class="share-modal-close">
//                             <i class="fas fa-times"></i>
//                         </button>
//                     </div>
                    
//                     <div class="share-modal-body">
//                         <div class="share-platforms">
//                             <!-- WhatsApp -->
//                             <a href="#" class="share-platform-btn whatsapp" data-platform="whatsapp">
//                                 <div class="platform-icon">
//                                     <i class="fab fa-whatsapp"></i>
//                                 </div>
//                                 <span>WhatsApp</span>
//                             </a>

//                             <!-- Instagram -->
//                             <a href="#" class="share-platform-btn instagram" data-platform="instagram">
//                                 <div class="platform-icon">
//                                     <i class="fab fa-instagram"></i>
//                                 </div>
//                                 <span>Instagram</span>
//                             </a>

//                             <!-- X (Twitter) -->
//                             <a href="#" class="share-platform-btn twitter" data-platform="twitter">
//                                 <div class="platform-icon">
//                                     <i class="fab fa-x-twitter"></i>
//                                 </div>
//                                 <span>X</span>
//                             </a>

//                             <!-- LinkedIn -->
//                             <a href="#" class="share-platform-btn linkedin" data-platform="linkedin">
//                                 <div class="platform-icon">
//                                     <i class="fab fa-linkedin-in"></i>
//                                 </div>
//                                 <span>LinkedIn</span>
//                             </a>

//                             <!-- Facebook -->
//                             <a href="#" class="share-platform-btn facebook" data-platform="facebook">
//                                 <div class="platform-icon">
//                                     <i class="fab fa-facebook-f"></i>
//                                 </div>
//                                 <span>Facebook</span>
//                             </a>

//                             <!-- Telegram -->
//                             <a href="#" class="share-platform-btn telegram" data-platform="telegram">
//                                 <div class="platform-icon">
//                                     <i class="fab fa-telegram-plane"></i>
//                                 </div>
//                                 <span>Telegram</span>
//                             </a>

//                             <!-- Email -->
//                             <a href="#" class="share-platform-btn email" data-platform="email">
//                                 <div class="platform-icon">
//                                     <i class="fas fa-envelope"></i>
//                                 </div>
//                                 <span>Email</span>
//                             </a>
//                         </div>

//                         <div class="share-link-section">
//                             <div class="share-link-wrapper">
//                                 <input type="text" class="share-link-input" readonly value="">
//                                 <button class="share-copy-btn">
//                                     <i class="fas fa-copy"></i>
//                                     Copy
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `;
//             document.body.appendChild(modal);

//             // Event listeners
//             const overlay = modal.querySelector('.share-modal-overlay');
//             const closeBtn = modal.querySelector('.share-modal-close');
//             const copyBtn = modal.querySelector('.share-copy-btn');
            
//             overlay.addEventListener('click', () => this.closeShareModal());
//             closeBtn.addEventListener('click', () => this.closeShareModal());
//             copyBtn.addEventListener('click', () => this.copyShareLink());

//             // Escape key
//             this.escapeHandler = (e) => {
//                 if (e.key === 'Escape' && modal.classList.contains('active')) {
//                     this.closeShareModal();
//                 }
//             };
//             document.addEventListener('keydown', this.escapeHandler);
//         }

//         // Remplir le champ de lien
//         const linkInput = modal.querySelector('.share-link-input');
//         linkInput.value = url;

//         // Encoder les données
//         const encodedUrl = encodeURIComponent(url);
//         const encodedTitle = encodeURIComponent(title);
//         const encodedDescription = encodeURIComponent(description);

//         // WHATSAPP
//         const whatsappBtn = modal.querySelector('[data-platform="whatsapp"]');
//         whatsappBtn.href = `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedUrl}`;
//         whatsappBtn.target = '_blank';
//         whatsappBtn.rel = 'noopener noreferrer';

//         // INSTAGRAM
//         const instagramBtn = modal.querySelector('[data-platform="instagram"]');
//         const newInstagramBtn = instagramBtn.cloneNode(true);
//         instagramBtn.parentNode.replaceChild(newInstagramBtn, instagramBtn);
        
//         newInstagramBtn.addEventListener('click', (e) => {
//             e.preventDefault();
            
//             if (navigator.clipboard && navigator.clipboard.writeText) {
//                 navigator.clipboard.writeText(url).then(() => {
//                     const originalHTML = newInstagramBtn.innerHTML;
//                     newInstagramBtn.innerHTML = `
//                         <div class="platform-icon">
//                             <i class="fas fa-check"></i>
//                         </div>
//                         <span>Link copied!</span>
//                     `;
                    
//                     setTimeout(() => {
//                         newInstagramBtn.innerHTML = originalHTML;
//                     }, 2000);
                    
//                     setTimeout(() => {
//                         window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
//                     }, 500);
//                 }).catch(() => {
//                     alert('Link copied! Paste it in your Instagram Story or Bio.');
//                     window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
//                 });
//             } else {
//                 alert('Link copied! Paste it in your Instagram Story or Bio.');
//                 window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
//             }
//         });

//         // X (TWITTER)
//         const twitterBtn = modal.querySelector('[data-platform="twitter"]');
//         twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
//         twitterBtn.target = '_blank';
//         twitterBtn.rel = 'noopener noreferrer';

//         // LINKEDIN
//         const linkedinBtn = modal.querySelector('[data-platform="linkedin"]');
//         linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
//         linkedinBtn.target = '_blank';
//         linkedinBtn.rel = 'noopener noreferrer';

//         // FACEBOOK
//         const facebookBtn = modal.querySelector('[data-platform="facebook"]');
//         facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
//         facebookBtn.target = '_blank';
//         facebookBtn.rel = 'noopener noreferrer';

//         // TELEGRAM
//         const telegramBtn = modal.querySelector('[data-platform="telegram"]');
//         telegramBtn.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
//         telegramBtn.target = '_blank';
//         telegramBtn.rel = 'noopener noreferrer';

//         // EMAIL
//         const emailBtn = modal.querySelector('[data-platform="email"]');
//         emailBtn.href = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0ARead more: ${encodedUrl}`;

//         // ✅ AFFICHER LE MODAL - FORÇAGE iOS
//         const scrollY = window.scrollY;
        
//         // Ajouter classe modal-open sur body
//         document.body.classList.add('modal-open');
//         document.body.style.top = `-${scrollY}px`;
        
//         // Activer le modal
//         requestAnimationFrame(() => {
//             modal.classList.add('active');
//         });
        
//         // Accessibility
//         modal.setAttribute('role', 'dialog');
//         modal.setAttribute('aria-modal', 'true');
//         modal.setAttribute('aria-labelledby', 'share-modal-title');
//     }

//     closeShareModal() {
//         const modal = document.getElementById('shareModal');
        
//         if (modal && modal.classList.contains('active')) {
//             // Désactiver le modal
//             modal.classList.remove('active');
            
//             // ✅ RESTAURER LE SCROLL - FIX iOS
//             const scrollY = document.body.style.top;
            
//             // Retirer classe modal-open
//             document.body.classList.remove('modal-open');
//             document.body.style.top = '';
            
//             // Restaurer la position de scroll
//             if (scrollY) {
//                 window.scrollTo(0, parseInt(scrollY || '0') * -1);
//             }
            
//             // Retirer attributs accessibility
//             modal.removeAttribute('role');
//             modal.removeAttribute('aria-modal');
//             modal.removeAttribute('aria-labelledby');
            
//             // Nettoyer le listener Escape
//             if (this.escapeHandler) {
//                 document.removeEventListener('keydown', this.escapeHandler);
//                 this.escapeHandler = null;
//             }
//         }
//     }

//     copyShareLink() {
//         const linkInput = document.querySelector('.share-link-input');
//         const copyBtn = document.querySelector('.share-copy-btn');
        
//         if (!linkInput || !copyBtn) return;
        
//         // Méthode moderne avec Clipboard API
//         if (navigator.clipboard && navigator.clipboard.writeText) {
//             navigator.clipboard.writeText(linkInput.value)
//                 .then(() => {
//                     const originalHTML = copyBtn.innerHTML;
//                     copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
//                     copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    
//                     setTimeout(() => {
//                         copyBtn.innerHTML = originalHTML;
//                         copyBtn.style.background = '';
//                     }, 2000);
//                 })
//                 .catch(err => {
//                     console.error('Failed to copy:', err);
//                     this.copyShareLinkFallback(linkInput, copyBtn);
//                 });
//         } else {
//             this.copyShareLinkFallback(linkInput, copyBtn);
//         }
//     }

//     copyShareLinkFallback(linkInput, copyBtn) {
//         try {
//             linkInput.select();
//             linkInput.setSelectionRange(0, 99999);
            
//             const successful = document.execCommand('copy');
            
//             if (successful) {
//                 const originalHTML = copyBtn.innerHTML;
//                 copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
//                 copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
//                 setTimeout(() => {
//                     copyBtn.innerHTML = originalHTML;
//                     copyBtn.style.background = '';
//                 }, 2000);
//             } else {
//                 throw new Error('Copy command failed');
//             }
//         } catch (err) {
//             console.error('Fallback copy failed:', err);
//             alert('Please copy the link manually: ' + linkInput.value);
//         }
        
//         window.getSelection().removeAllRanges();
//     }

//     stripMarkdown(text) {
//         if (!text) return '';
//         return text
//             .replace(/[#*_~`]/g, '')
//             .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
//             .replace(/\n/g, ' ');
//     }

//     openImageLightbox(imageUrl) {
//         let lightbox = document.getElementById('imageLightbox');
        
//         if (!lightbox) {
//             lightbox = document.createElement('div');
//             lightbox.id = 'imageLightbox';
//             lightbox.className = 'image-lightbox';
//             lightbox.innerHTML = `
//                 <button class="image-lightbox-close">
//                     <i class="fas fa-times"></i>
//                 </button>
//                 <img src="" alt="Full Size Image">
//             `;
//             document.body.appendChild(lightbox);

//             lightbox.addEventListener('click', (e) => {
//                 if (e.target === lightbox || e.target.closest('.image-lightbox-close')) {
//                     this.closeImageLightbox();
//                 }
//             });

//             document.addEventListener('keydown', (e) => {
//                 if (e.key === 'Escape' && lightbox.classList.contains('active')) {
//                     this.closeImageLightbox();
//                 }
//             });
//         }

//         const img = lightbox.querySelector('img');
//         img.src = imageUrl;
//         lightbox.classList.add('active');
//         document.body.style.overflow = 'hidden';
//     }

//     closeImageLightbox() {
//         const lightbox = document.getElementById('imageLightbox');
//         if (lightbox) {
//             lightbox.classList.remove('active');
//             document.body.style.overflow = '';
//         }
//     }

//     async loadComments() {
//         try {
//             const comments = await window.communityService.getComments(this.postId);
//             this.renderComments(comments);
//         } catch (error) {
//             console.error('❌ Error loading comments:', error);
//         }
//     }

//     renderComments(comments) {
//         const commentsCount = document.getElementById('commentsCount');
//         const commentsList = document.getElementById('commentsList');

//         commentsCount.textContent = `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`;

//         if (comments.length === 0) {
//             commentsList.innerHTML = `
//                 <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
//                     <i class="fas fa-comments" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
//                     <p>No comments yet. Be the first to comment!</p>
//                 </div>
//             `;
//             return;
//         }

//         commentsList.innerHTML = comments.map(comment => this.renderComment(comment)).join('');
//     }

//     renderComment(comment) {
//         const isAuthor = this.currentUser && comment.authorId === this.currentUser.uid;
//         const planBadge = this.getPlanBadge(comment.authorPlan);

//         return `
//             <div class="comment-item" data-comment-id="${comment.id}">
//                 <!-- ✅ CORRECTION : public-profile.html -->
//                 <img src="${comment.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName) + '&background=3B82F6&color=fff'}" 
//                     alt="${comment.authorName}" 
//                     class="comment-avatar"
//                     onclick="window.location.href='public-profile.html?id=${comment.authorId}'"
//                     style="cursor: pointer;">
//                 <div class="comment-content-wrapper">
//                     <div class="comment-header">
//                         <div class="comment-author" onclick="window.location.href='public-profile.html?id=${comment.authorId}'" style="cursor: pointer;">
//                             ${comment.authorName}
//                             ${planBadge}
//                         </div>
//                         <div class="comment-date">
//                             ${this.formatDate(comment.createdAt)}
//                         </div>
//                     </div>
//                     <div class="comment-text">
//                         ${this.escapeHtml(comment.content)}
//                     </div>
//                     ${isAuthor ? `
//                         <button class="comment-delete-btn" onclick="window.postManager.deleteComment('${comment.id}')">
//                             <i class="fas fa-trash-alt"></i> Delete
//                         </button>
//                     ` : ''}
//                 </div>
//             </div>
//         `;
//     }

//     async deleteComment(commentId) {
//         if (!confirm('Delete this comment?')) return;

//         try {
//             await window.communityService.deleteComment(commentId, this.postId);
//             await this.loadComments();
            
//             this.post.commentsCount = Math.max(0, (this.post.commentsCount || 0) - 1);
//             document.querySelector('.post-stats .stat-item:nth-child(3)').innerHTML = `
//                 <i class="fas fa-comments"></i>
//                 ${this.post.commentsCount} comments
//             `;
//         } catch (error) {
//             console.error('❌ Error deleting comment:', error);
//             alert('Failed to delete comment');
//         }
//     }

//     // ✅ CORRECTION 5 : Mapping corrigé des nouveaux channels
//     getChannelBadge(channelId) {
//         // Chercher le channel dans les channels chargés
//         const channel = this.channels.find(c => c.id === channelId);

//         if (channel) {
//             return `
//                 <div class="channel-badge" style="background: linear-gradient(135deg, #3B82F615, #3B82F630); border-left: 4px solid #3B82F6;">
//                     <span>${channel.icon}</span>
//                     <span>${channel.name}</span>
//                 </div>
//             `;
//         }

//         // Fallback si channel non trouvé
//         console.warn('⚠ Channel not found:', channelId);
//         return `
//             <div class="channel-badge" style="background: linear-gradient(135deg, #6B728015, #6B728030); border-left: 4px solid #6B7280;">
//                 <span>📝</span>
//                 <span>General</span>
//             </div>
//         `;
//     }

//     getPlanBadge(plan) {
//         const plans = {
//             'platinum': '<span class="plan-badge platinum"><i class="fas fa-crown"></i> Platinum</span>',
//             'pro': '<span class="plan-badge pro"><i class="fas fa-star"></i> Pro</span>',
//             'basic': '<span class="plan-badge basic">Basic</span>',
//             'free': ''
//         };

//         return plans[plan] || '';
//     }

//     formatDate(timestamp) {
//         if (!timestamp) return 'Just now';

//         const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//         const now = new Date();
//         const diffMs = now - date;
//         const diffMins = Math.floor(diffMs / 60000);
//         const diffHours = Math.floor(diffMs / 3600000);
//         const diffDays = Math.floor(diffMs / 86400000);

//         if (diffMins < 1) return 'Just now';
//         if (diffMins < 60) return `${diffMins}m ago`;
//         if (diffHours < 24) return `${diffHours}h ago`;
//         if (diffDays < 7) return `${diffDays}d ago`;

//         return date.toLocaleDateString('en-US', { 
//             month: 'short', 
//             day: 'numeric', 
//             year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
//         });
//     }

//     escapeHtml(text) {
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }

//     showError(message) {
//         this.postContainer.innerHTML = `
//             <div style="text-align: center; padding: 60px;">
//                 <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #EF4444; margin-bottom: 24px;"></i>
//                 <h2 style="color: var(--text-primary); margin-bottom: 12px;">Error Loading Post</h2>
//                 <p style="color: var(--text-secondary);">${message}</p>
//                 <button class="filter-btn" onclick="window.location.href='community-hub.html'" style="margin-top: 24px;">
//                     <i class="fas fa-arrow-left"></i> Back to Community
//                 </button>
//             </div>
//         `;
//     }
// }

// document.addEventListener('DOMContentLoaded', () => {
//     window.postManager = new PostManager();
//     window.postManager.initialize();
// });

/* ============================================
   ALPHAVAULT AI - POST MANAGER
   Affichage et gestion des posts (CORRIGÉ)
   + PARTAGE PAR MESSAGE PRIVÉ
   ============================================ */

class PostManager {
    constructor() {
        this.postId = null;
        this.post = null;
        this.currentUser = null;
        this.channels = []; // ✅ Stocker les channels
        this.postContainer = document.getElementById('postDetailCard');
        this.loadingElement = document.getElementById('postLoading');
    }

    async initialize() {
        try {
            console.log('📄 Initializing Post Manager...');

            const urlParams = new URLSearchParams(window.location.search);
            this.postId = urlParams.get('id');

            if (!this.postId) {
                throw new Error('No post ID provided');
            }

            await this.waitForAuth();

            // ✅ CORRECTION 1 : Charger les channels AVANT le post
            await this.loadChannels();

            await this.loadPost();

            await window.communityService.incrementViews(this.postId);

            this.renderPost();

            await this.loadComments();

            console.log('✅ Post Manager initialized');

        } catch (error) {
            console.error('❌ Error initializing Post Manager:', error);
            this.showError('Failed to load post: ' + error.message);
        }
    }

    async waitForAuth() {
        return new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                this.currentUser = user;
                unsubscribe();
                resolve();
            });
        });
    }

    // ✅ CORRECTION 2 : Charger les channels
    async loadChannels() {
        try {
            this.channels = await window.communityService.getChannels();
            console.log('📂 Channels loaded:', this.channels.length);
        } catch (error) {
            console.error('❌ Error loading channels:', error);
            this.channels = []; // Fallback vide
        }
    }

    async loadPost() {
        try {
            this.post = await window.communityService.getPost(this.postId);
            console.log('✅ Post loaded:', this.post);
        } catch (error) {
            console.error('❌ Error loading post:', error);
            throw error;
        }
    }

    renderPost() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }

        const isAuthor = this.currentUser && this.post.authorId === this.currentUser.uid;
        const hasLiked = this.post.likes && this.post.likes.includes(this.currentUser?.uid);

        this.postContainer.innerHTML = `
            ${this.renderPostHeader(isAuthor)}
            ${this.renderPostContent()}
            ${this.renderPostImages()}
            ${this.renderPostTags()}
            ${this.renderPostActions(hasLiked)}
        `;

        this.attachEventListeners();

        document.getElementById('commentsSection').style.display = 'block';
    }

    renderPostHeader(isAuthor) {
        const channelBadge = this.getChannelBadge(this.post.channelId);
        const planBadge = this.getPlanBadge(this.post.authorPlan);

        return `
            <div class="post-header">
                <div class="post-meta">
                    ${channelBadge}
                    <div class="post-author">
                        <!-- ✅ CORRECTION : public-profile.html -->
                        <img src="${this.post.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.post.authorName) + '&background=3B82F6&color=fff'}" 
                            alt="${this.post.authorName}" 
                            class="author-avatar"
                            onclick="window.location.href='public-profile.html?id=${this.post.authorId}'"
                            style="cursor: pointer;">
                        <div class="author-info">
                            <div class="author-name" onclick="window.location.href='public-profile.html?id=${this.post.authorId}'" style="cursor: pointer;">
                                ${this.post.authorName}
                                ${planBadge}
                            </div>
                            <div class="post-date">
                                <i class="fas fa-clock"></i>
                                ${this.formatDate(this.post.createdAt)}
                                ${this.post.updatedAt && this.post.updatedAt.seconds !== this.post.createdAt.seconds ? '<span class="edited-badge">(edited)</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                ${isAuthor ? `
                    <div class="post-author-actions">
                        <button class="icon-btn edit-btn" title="Edit post" data-action="edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete-btn" title="Delete post" data-action="delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                ` : ''}
            </div>

            <h1 class="post-title">${this.escapeHtml(this.post.title)}</h1>

            <div class="post-stats">
                <span class="stat-item">
                    <i class="fas fa-eye"></i>
                    ${this.post.views || 0} views
                </span>
                <span class="stat-item">
                    <i class="fas fa-heart"></i>
                    ${this.post.likes?.length || 0} likes
                </span>
                <span class="stat-item">
                    <i class="fas fa-comments"></i>
                    ${this.post.commentsCount || 0} comments
                </span>
            </div>
        `;
    }

    renderPostContent() {
        const htmlContent = marked.parse(this.post.content || '');

        return `
            <div class="post-content">
                ${htmlContent}
            </div>
        `;
    }

    renderPostImages() {
        if (!this.post.images || this.post.images.length === 0) {
            return '';
        }

        const imagesHTML = this.post.images.map((imageUrl, index) => `
            <div class="post-image-wrapper" data-image-index="${index}">
                <img src="${imageUrl}" alt="Post Image ${index + 1}" loading="lazy">
            </div>
        `).join('');

        return `
            <div class="post-images-grid">
                ${imagesHTML}
            </div>
        `;
    }

    renderPostTags() {
        if (!this.post.tags || this.post.tags.length === 0) {
            return '';
        }

        const tagsHTML = this.post.tags.map(tag => `
            <a href="community-hub.html?tag=${encodeURIComponent(tag)}" class="post-tag">
                #${tag}
            </a>
        `).join('');

        return `
            <div class="post-tags">
                ${tagsHTML}
            </div>
        `;
    }

    renderPostActions(hasLiked) {
        return `
            <div class="post-actions-bar">
                <button class="action-btn like-btn ${hasLiked ? 'liked' : ''}" data-action="like">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">${this.post.likes?.length || 0}</span>
                </button>
                <button class="action-btn share-btn" data-action="share">
                    <i class="fas fa-share-alt"></i>
                    Share
                </button>
                <button class="action-btn bookmark-btn" data-action="bookmark">
                    <i class="fas fa-bookmark"></i>
                    Save
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        const likeBtn = this.postContainer.querySelector('[data-action="like"]');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.handleLike());
        }

        const editBtn = this.postContainer.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEdit());
        }

        const deleteBtn = this.postContainer.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.handleDelete());
        }

        const shareBtn = this.postContainer.querySelector('[data-action="share"]');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShare());
        }

        const imageWrappers = this.postContainer.querySelectorAll('.post-image-wrapper');
        imageWrappers.forEach(wrapper => {
            wrapper.addEventListener('click', () => {
                const imageUrl = wrapper.querySelector('img').src;
                this.openImageLightbox(imageUrl);
            });
        });
    }

    async handleLike() {
        try {
            if (!this.currentUser) {
                alert('Please login to like posts');
                return;
            }

            const result = await window.communityService.toggleLike(this.postId);

            const likeBtn = this.postContainer.querySelector('[data-action="like"]');
            const likeCount = likeBtn.querySelector('.like-count');

            if (result.liked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }

            likeCount.textContent = result.count;

            this.post.likes = result.liked 
                ? [...(this.post.likes || []), this.currentUser.uid]
                : (this.post.likes || []).filter(uid => uid !== this.currentUser.uid);

        } catch (error) {
            console.error('❌ Error liking post:', error);
            alert('Failed to like post');
        }
    }

    handleEdit() {
        window.location.href = `edit-post.html?id=${this.postId}`;
    }

    async handleDelete() {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            await window.communityService.deletePost(this.postId);
            alert('Post deleted successfully');
            window.location.href = 'community-hub.html';
        } catch (error) {
            console.error('❌ Error deleting post:', error);
            alert('Failed to delete post: ' + error.message);
        }
    }

    handleShare() {
        const postUrl = window.location.href;
        const postTitle = this.post.title;
        const postDescription = this.stripMarkdown(this.post.content).substring(0, 200);

        this.openShareModal(postUrl, postTitle, postDescription);
    }

    openShareModal(url, title, description) {
        // Créer le modal s'il n'existe pas
        let modal = document.getElementById('shareModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shareModal';
            modal.className = 'share-modal';
            modal.innerHTML = `
                <div class="share-modal-overlay"></div>
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h3><i class="fas fa-share-alt"></i> Share this post</h3>
                        <button class="share-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="share-modal-body">
                        <div class="share-platforms">
                            <!-- WhatsApp -->
                            <a href="#" class="share-platform-btn whatsapp" data-platform="whatsapp">
                                <div class="platform-icon">
                                    <i class="fab fa-whatsapp"></i>
                                </div>
                                <span>WhatsApp</span>
                            </a>

                            <!-- Instagram -->
                            <a href="#" class="share-platform-btn instagram" data-platform="instagram">
                                <div class="platform-icon">
                                    <i class="fab fa-instagram"></i>
                                </div>
                                <span>Instagram</span>
                            </a>

                            <!-- X (Twitter) -->
                            <a href="#" class="share-platform-btn twitter" data-platform="twitter">
                                <div class="platform-icon">
                                    <i class="fab fa-x-twitter"></i>
                                </div>
                                <span>X</span>
                            </a>

                            <!-- LinkedIn -->
                            <a href="#" class="share-platform-btn linkedin" data-platform="linkedin">
                                <div class="platform-icon">
                                    <i class="fab fa-linkedin-in"></i>
                                </div>
                                <span>LinkedIn</span>
                            </a>

                            <!-- Facebook -->
                            <a href="#" class="share-platform-btn facebook" data-platform="facebook">
                                <div class="platform-icon">
                                    <i class="fab fa-facebook-f"></i>
                                </div>
                                <span>Facebook</span>
                            </a>

                            <!-- Telegram -->
                            <a href="#" class="share-platform-btn telegram" data-platform="telegram">
                                <div class="platform-icon">
                                    <i class="fab fa-telegram-plane"></i>
                                </div>
                                <span>Telegram</span>
                            </a>

                            <!-- Email -->
                            <a href="#" class="share-platform-btn email" data-platform="email">
                                <div class="platform-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <span>Email</span>
                            </a>

                            <!-- ✅ NOUVEAU : Private Message -->
                            <button class="share-platform-btn private-message" onclick="event.preventDefault(); window.postManager.openShareAsMessageModal();">
                                <div class="platform-icon">
                                    <i class="fas fa-paper-plane"></i>
                                </div>
                                <span>Private Message</span>
                            </button>
                        </div>

                        <div class="share-link-section">
                            <div class="share-link-wrapper">
                                <input type="text" class="share-link-input" readonly value="">
                                <button class="share-copy-btn">
                                    <i class="fas fa-copy"></i>
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Event listeners
            const overlay = modal.querySelector('.share-modal-overlay');
            const closeBtn = modal.querySelector('.share-modal-close');
            const copyBtn = modal.querySelector('.share-copy-btn');
            
            overlay.addEventListener('click', () => this.closeShareModal());
            closeBtn.addEventListener('click', () => this.closeShareModal());
            copyBtn.addEventListener('click', () => this.copyShareLink());

            // Escape key
            this.escapeHandler = (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeShareModal();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }

        // Remplir le champ de lien
        const linkInput = modal.querySelector('.share-link-input');
        linkInput.value = url;

        // Encoder les données
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(title);
        const encodedDescription = encodeURIComponent(description);

        // WHATSAPP
        const whatsappBtn = modal.querySelector('[data-platform="whatsapp"]');
        whatsappBtn.href = `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedUrl}`;
        whatsappBtn.target = '_blank';
        whatsappBtn.rel = 'noopener noreferrer';

        // INSTAGRAM
        const instagramBtn = modal.querySelector('[data-platform="instagram"]');
        const newInstagramBtn = instagramBtn.cloneNode(true);
        instagramBtn.parentNode.replaceChild(newInstagramBtn, instagramBtn);
        
        newInstagramBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    const originalHTML = newInstagramBtn.innerHTML;
                    newInstagramBtn.innerHTML = `
                        <div class="platform-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <span>Link copied!</span>
                    `;
                    
                    setTimeout(() => {
                        newInstagramBtn.innerHTML = originalHTML;
                    }, 2000);
                    
                    setTimeout(() => {
                        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
                    }, 500);
                }).catch(() => {
                    alert('Link copied! Paste it in your Instagram Story or Bio.');
                    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
                });
            } else {
                alert('Link copied! Paste it in your Instagram Story or Bio.');
                window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
            }
        });

        // X (TWITTER)
        const twitterBtn = modal.querySelector('[data-platform="twitter"]');
        twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        twitterBtn.target = '_blank';
        twitterBtn.rel = 'noopener noreferrer';

        // LINKEDIN
        const linkedinBtn = modal.querySelector('[data-platform="linkedin"]');
        linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        linkedinBtn.target = '_blank';
        linkedinBtn.rel = 'noopener noreferrer';

        // FACEBOOK
        const facebookBtn = modal.querySelector('[data-platform="facebook"]');
        facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        facebookBtn.target = '_blank';
        facebookBtn.rel = 'noopener noreferrer';

        // TELEGRAM
        const telegramBtn = modal.querySelector('[data-platform="telegram"]');
        telegramBtn.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        telegramBtn.target = '_blank';
        telegramBtn.rel = 'noopener noreferrer';

        // EMAIL
        const emailBtn = modal.querySelector('[data-platform="email"]');
        emailBtn.href = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0ARead more: ${encodedUrl}`;

        // ✅ AFFICHER LE MODAL - FORÇAGE iOS
        const scrollY = window.scrollY;
        
        // Ajouter classe modal-open sur body
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        
        // Activer le modal
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        // Accessibility
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'share-modal-title');
    }

    closeShareModal() {
        const modal = document.getElementById('shareModal');
        
        if (modal && modal.classList.contains('active')) {
            // Désactiver le modal
            modal.classList.remove('active');
            
            // ✅ RESTAURER LE SCROLL - FIX iOS
            const scrollY = document.body.style.top;
            
            // Retirer classe modal-open
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            
            // Restaurer la position de scroll
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
            
            // Retirer attributs accessibility
            modal.removeAttribute('role');
            modal.removeAttribute('aria-modal');
            modal.removeAttribute('aria-labelledby');
            
            // Nettoyer le listener Escape
            if (this.escapeHandler) {
                document.removeEventListener('keydown', this.escapeHandler);
                this.escapeHandler = null;
            }
        }
    }

    copyShareLink() {
        const linkInput = document.querySelector('.share-link-input');
        const copyBtn = document.querySelector('.share-copy-btn');
        
        if (!linkInput || !copyBtn) return;
        
        // Méthode moderne avec Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(linkInput.value)
                .then(() => {
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                        copyBtn.style.background = '';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    this.copyShareLinkFallback(linkInput, copyBtn);
                });
        } else {
            this.copyShareLinkFallback(linkInput, copyBtn);
        }
    }

    copyShareLinkFallback(linkInput, copyBtn) {
        try {
            linkInput.select();
            linkInput.setSelectionRange(0, 99999);
            
            const successful = document.execCommand('copy');
            
            if (successful) {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.style.background = '';
                }, 2000);
            } else {
                throw new Error('Copy command failed');
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            alert('Please copy the link manually: ' + linkInput.value);
        }
        
        window.getSelection().removeAllRanges();
    }

    /* ==========================================
       💬 PARTAGE DE POST PAR MESSAGE PRIVÉ
       ========================================== */

    /**
     * Ouvrir la modal de sélection d'utilisateur pour envoyer le post
     */
    openShareAsMessageModal() {
        console.log('💬 Opening share as message modal...');

        // Fermer la modal de partage social
        this.closeShareModal();

        // Créer la modal si elle n'existe pas
        let modal = document.getElementById('shareMessageModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'shareMessageModal';
            modal.className = 'share-modal share-message-modal';
            modal.innerHTML = `
                <div class="share-modal-overlay"></div>
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h3><i class="fas fa-paper-plane"></i> Send to User</h3>
                        <button class="share-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="share-modal-body">
                        <!-- Search Bar -->
                        <div class="user-search-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                class="user-search-input" 
                                placeholder="Search users by name or email..."
                                id="shareUserSearchInput"
                            >
                        </div>

                        <!-- Users List -->
                        <div class="users-list-wrapper" id="shareUsersList">
                            <div class="loading-spinner">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Loading users...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Event listeners
            const overlay = modal.querySelector('.share-modal-overlay');
            const closeBtn = modal.querySelector('.share-modal-close');
            const searchInput = modal.querySelector('#shareUserSearchInput');
            
            overlay.addEventListener('click', () => this.closeShareMessageModal());
            closeBtn.addEventListener('click', () => this.closeShareMessageModal());

            // Search avec debounce
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchUsersForShare(e.target.value.trim());
                }, 300);
            });

            // Escape key
            this.escapeMessageHandler = (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeShareMessageModal();
                }
            };
            document.addEventListener('keydown', this.escapeMessageHandler);
        }

        // Charger la liste initiale d'utilisateurs
        this.loadUsersForShare();

        // Afficher la modal
        const scrollY = window.scrollY;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;
        
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
    }

    /**
     * Fermer la modal de sélection d'utilisateur
     */
    closeShareMessageModal() {
        const modal = document.getElementById('shareMessageModal');
        
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            
            const scrollY = document.body.style.top;
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
            
            modal.removeAttribute('role');
            modal.removeAttribute('aria-modal');
            
            if (this.escapeMessageHandler) {
                document.removeEventListener('keydown', this.escapeMessageHandler);
                this.escapeMessageHandler = null;
            }
        }
    }

    /**
     * Charger la liste des utilisateurs
     */
    async loadUsersForShare() {
        const usersList = document.getElementById('shareUsersList');
        if (!usersList) return;

        usersList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading users...</p>
            </div>
        `;

        try {
            const users = await window.communityService.getAllUsers(50);
            this.renderUsersList(users);
        } catch (error) {
            console.error('❌ Error loading users:', error);
            usersList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px;"></i>
                    <p style="font-weight: 600;">Failed to load users</p>
                </div>
            `;
        }
    }

    /**
     * Rechercher des utilisateurs (avec debounce)
     */
    async searchUsersForShare(query) {
        const usersList = document.getElementById('shareUsersList');
        if (!usersList) return;

        if (!query || query.length < 2) {
            await this.loadUsersForShare();
            return;
        }

        usersList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching...</p>
            </div>
        `;

        try {
            const users = await window.communityService.searchUsersForShare(query, 20);
            this.renderUsersList(users, query);
        } catch (error) {
            console.error('❌ Error searching users:', error);
            usersList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <p>Search failed. Please try again.</p>
                </div>
            `;
        }
    }

    /**
     * Afficher la liste des utilisateurs
     */
    renderUsersList(users, query = '') {
        const usersList = document.getElementById('shareUsersList');
        if (!usersList) return;

        if (users.length === 0) {
            const message = query 
                ? `No users found for "${this.escapeHtml(query)}"` 
                : 'No users available';
            
            usersList.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                    <i class="fas fa-user-slash" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                    <p style="font-weight: 600; font-size: 1.1rem;">${message}</p>
                </div>
            `;
            return;
        }

        const usersHTML = users.map(user => {
            const displayName = user.displayName || user.email?.split('@')[0] || 'Unknown User';
            const avatar = user.photoURL || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;
            
            const plan = user.plan || 'free';
            const planBadge = this.getPlanBadge(plan);

            return `
                <div class="user-select-item" onclick="window.postManager.sendPostAsMessage('${user.uid}', ${JSON.stringify({ displayName, photoURL: user.photoURL || '', email: user.email || '' }).replace(/"/g, '&quot;')})">
                    <div class="user-select-avatar-wrapper">
                        <img src="${avatar}" 
                             alt="${this.escapeHtml(displayName)}" 
                             class="user-select-avatar"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128'">
                    </div>
                    
                    <div class="user-select-info">
                        <div class="user-select-name">
                            ${this.escapeHtml(displayName)}
                            ${planBadge}
                        </div>
                        <div class="user-select-email">${this.escapeHtml(user.email || '')}</div>
                    </div>
                    
                    <button class="user-select-send-btn">
                        <i class="fas fa-paper-plane"></i>
                        <span>Send</span>
                    </button>
                </div>
            `;
        }).join('');

        usersList.innerHTML = `<div class="users-select-list">${usersHTML}</div>`;
    }

    /**
     * Envoyer le post à un utilisateur via message privé
     */
    async sendPostAsMessage(userId, userData) {
        try {
            console.log('📤 Sending post to user:', userId);

            // Fermer la modal de sélection
            this.closeShareMessageModal();

            // Préparer les données du post
            const postData = {
                postId: this.postId,
                title: this.post.title,
                excerpt: this.stripMarkdown(this.post.content).substring(0, 200),
                authorName: this.post.authorName,
                channelId: this.post.channelId,
                url: window.location.href
            };

            // Vérifier que le système de chat privé est chargé
            if (!window.privateChat) {
                console.error('❌ Private chat system not loaded');
                alert('Chat system is not available. Please try again later.');
                return;
            }

            // Vérifier que messagesHub est chargé
            if (!window.messagesHub) {
                console.error('❌ Messages hub not loaded');
                alert('Messaging system is not available. Please try again later.');
                return;
            }

            // Utiliser la méthode de privateChat pour envoyer le post
            await window.privateChat.sendPostAsMessage(userId, postData, userData);

            // Notification de succès
            this.showSuccessNotification(`Post shared with ${userData.displayName || 'user'}!`);

            // Optionnel : Rediriger vers la page de messages après 1.5s
            setTimeout(() => {
                const shouldRedirect = confirm('Post sent successfully! Go to messages?');
                if (shouldRedirect) {
                    // Stocker les données pour auto-ouvrir la conversation
                    sessionStorage.setItem('openChat', JSON.stringify({
                        userId: userId,
                        userData: userData,
                        timestamp: Date.now()
                    }));
                    
                    window.location.href = 'messages.html';
                }
            }, 1500);

        } catch (error) {
            console.error('❌ Error sending post as message:', error);
            alert('Failed to send post. Please try again.');
        }
    }

    /**
     * Afficher une notification de succès
     */
    showSuccessNotification(message) {
        // Créer une notification toast
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    stripMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/[#*_~`]/g, '')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/\n/g, ' ');
    }

    openImageLightbox(imageUrl) {
        let lightbox = document.getElementById('imageLightbox');
        
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'imageLightbox';
            lightbox.className = 'image-lightbox';
            lightbox.innerHTML = `
                <button class="image-lightbox-close">
                    <i class="fas fa-times"></i>
                </button>
                <img src="" alt="Full Size Image">
            `;
            document.body.appendChild(lightbox);

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.closest('.image-lightbox-close')) {
                    this.closeImageLightbox();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                    this.closeImageLightbox();
                }
            });
        }

        const img = lightbox.querySelector('img');
        img.src = imageUrl;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeImageLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async loadComments() {
        try {
            const comments = await window.communityService.getComments(this.postId);
            this.renderComments(comments);
        } catch (error) {
            console.error('❌ Error loading comments:', error);
        }
    }

    renderComments(comments) {
        const commentsCount = document.getElementById('commentsCount');
        const commentsList = document.getElementById('commentsList');

        commentsCount.textContent = `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`;

        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-comments" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = comments.map(comment => this.renderComment(comment)).join('');
    }

    renderComment(comment) {
        const isAuthor = this.currentUser && comment.authorId === this.currentUser.uid;
        const planBadge = this.getPlanBadge(comment.authorPlan);

        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <!-- ✅ CORRECTION : public-profile.html -->
                <img src="${comment.authorPhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.authorName) + '&background=3B82F6&color=fff'}" 
                    alt="${comment.authorName}" 
                    class="comment-avatar"
                    onclick="window.location.href='public-profile.html?id=${comment.authorId}'"
                    style="cursor: pointer;">
                <div class="comment-content-wrapper">
                    <div class="comment-header">
                        <div class="comment-author" onclick="window.location.href='public-profile.html?id=${comment.authorId}'" style="cursor: pointer;">
                            ${comment.authorName}
                            ${planBadge}
                        </div>
                        <div class="comment-date">
                            ${this.formatDate(comment.createdAt)}
                        </div>
                    </div>
                    <div class="comment-text">
                        ${this.escapeHtml(comment.content)}
                    </div>
                    ${isAuthor ? `
                        <button class="comment-delete-btn" onclick="window.postManager.deleteComment('${comment.id}')">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async deleteComment(commentId) {
        if (!confirm('Delete this comment?')) return;

        try {
            await window.communityService.deleteComment(commentId, this.postId);
            await this.loadComments();
            
            this.post.commentsCount = Math.max(0, (this.post.commentsCount || 0) - 1);
            document.querySelector('.post-stats .stat-item:nth-child(3)').innerHTML = `
                <i class="fas fa-comments"></i>
                ${this.post.commentsCount} comments
            `;
        } catch (error) {
            console.error('❌ Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    }

    // ✅ CORRECTION 5 : Mapping corrigé des nouveaux channels
    getChannelBadge(channelId) {
        // Chercher le channel dans les channels chargés
        const channel = this.channels.find(c => c.id === channelId);

        if (channel) {
            return `
                <div class="channel-badge" style="background: linear-gradient(135deg, #3B82F615, #3B82F630); border-left: 4px solid #3B82F6;">
                    <span>${channel.icon}</span>
                    <span>${channel.name}</span>
                </div>
            `;
        }

        // Fallback si channel non trouvé
        console.warn('⚠ Channel not found:', channelId);
        return `
            <div class="channel-badge" style="background: linear-gradient(135deg, #6B728015, #6B728030); border-left: 4px solid #6B7280;">
                <span>📝</span>
                <span>General</span>
            </div>
        `;
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

    formatDate(timestamp) {
        if (!timestamp) return 'Just now';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        this.postContainer.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #EF4444; margin-bottom: 24px;"></i>
                <h2 style="color: var(--text-primary); margin-bottom: 12px;">Error Loading Post</h2>
                <p style="color: var(--text-secondary);">${message}</p>
                <button class="filter-btn" onclick="window.location.href='community-hub.html'" style="margin-top: 24px;">
                    <i class="fas fa-arrow-left"></i> Back to Community
                </button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.postManager = new PostManager();
    window.postManager.initialize();
});