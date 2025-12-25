/* ============================================
   LIKE SYSTEM v2.0 - Avec sous-collection support
   ✅ Sauvegarde dans le tableau "likes" du post
   ✅ Sauvegarde dans la sous-collection "likedPosts" de l'utilisateur
   ============================================ */

class LikeSystem {
    constructor() {
        this.currentUser = null;
        this.setupAuthListener();
    }

    setupAuthListener() {
        firebase.auth().onAuthStateChanged((user) => {
            this.currentUser = user;
            console.log('👤 Like System - User:', user ? user.email : 'Not logged in');
        });
    }

    /**
     * Toggle like sur un post
     * @param {string} postId - ID du post
     * @param {HTMLElement} likeButton - Bouton like (optionnel)
     */
    async toggleLike(postId, likeButton = null) {
        try {
            if (!this.currentUser) {
                alert('Please login to like posts');
                return;
            }

            console.log('❤ Toggling like for post:', postId);

            // Désactiver le bouton
            if (likeButton) {
                likeButton.disabled = true;
            }

            const postRef = firebase.firestore().collection('posts').doc(postId);
            const postDoc = await postRef.get();

            if (!postDoc.exists) {
                throw new Error('Post not found');
            }

            const postData = postDoc.data();
            const currentLikes = postData.likes || [];
            const isLiked = currentLikes.includes(this.currentUser.uid);

            if (isLiked) {
                // ❌ UNLIKE
                console.log('💔 Unliking post...');
                
                // 1. Retirer du tableau likes
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayRemove(this.currentUser.uid)
                });

                // 2. ✅ Supprimer de la sous-collection likedPosts
                await firebase.firestore()
                    .collection('users')
                    .doc(this.currentUser.uid)
                    .collection('likedPosts')
                    .doc(postId)
                    .delete();

                console.log('✅ Post unliked successfully');

                // Mettre à jour l'UI
                if (likeButton) {
                    this.updateLikeButton(likeButton, false, currentLikes.length - 1);
                }

                return false;

            } else {
                // ✅ LIKE
                console.log('❤ Liking post...');
                
                // 1. Ajouter au tableau likes
                await postRef.update({
                    likes: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid)
                });

                // 2. ✅ Ajouter à la sous-collection likedPosts
                await firebase.firestore()
                    .collection('users')
                    .doc(this.currentUser.uid)
                    .collection('likedPosts')
                    .doc(postId)
                    .set({
                        likedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        postId: postId,
                        postTitle: postData.title || '',
                        postAuthor: postData.authorName || '',
                        channelId: postData.channelId || ''
                    });

                console.log('✅ Post liked successfully');
                console.log('📂 Saved to:', `users/${this.currentUser.uid}/likedPosts/${postId}`);

                // Mettre à jour l'UI
                if (likeButton) {
                    this.updateLikeButton(likeButton, true, currentLikes.length + 1);
                }

                return true;
            }

        } catch (error) {
            console.error('❌ Error toggling like:', error);
            alert('Failed to update like. Please try again.');
            
            if (likeButton) {
                likeButton.disabled = false;
            }
        }
    }

    /**
     * Vérifier si l'utilisateur a liké un post
     * @param {string} postId 
     * @returns {Promise<boolean>}
     */
    async isLiked(postId) {
        if (!this.currentUser) return false;

        try {
            const postDoc = await firebase.firestore()
                .collection('posts')
                .doc(postId)
                .get();

            if (!postDoc.exists) return false;

            const likes = postDoc.data().likes || [];
            return likes.includes(this.currentUser.uid);

        } catch (error) {
            console.error('❌ Error checking like status:', error);
            return false;
        }
    }

    /**
     * Mettre à jour l'UI du bouton like
     * @param {HTMLElement} button 
     * @param {boolean} isLiked 
     * @param {number} likesCount 
     */
    updateLikeButton(button, isLiked, likesCount) {
        button.disabled = false;

        const icon = button.querySelector('i') || button;
        const countSpan = button.querySelector('.like-count') || button;

        if (isLiked) {
            button.classList.add('liked');
            icon.className = 'fas fa-heart';
            button.style.color = '#EF4444';
        } else {
            button.classList.remove('liked');
            icon.className = 'far fa-heart';
            button.style.color = '';
        }

        // Mettre à jour le compteur si présent
        if (button.querySelector('.like-count')) {
            button.querySelector('.like-count').textContent = likesCount;
        } else if (button.textContent.match(/\d+/)) {
            const currentText = button.innerHTML;
            button.innerHTML = currentText.replace(/\d+/, likesCount);
        }
    }

    /**
     * Initialiser un bouton like
     * @param {HTMLElement} button 
     * @param {string} postId 
     */
    async initializeLikeButton(button, postId) {
        if (!button) return;

        try {
            const isLiked = await this.isLiked(postId);
            
            const postDoc = await firebase.firestore()
                .collection('posts')
                .doc(postId)
                .get();

            const likesCount = postDoc.exists ? (postDoc.data().likes || []).length : 0;

            this.updateLikeButton(button, isLiked, likesCount);

            // Ajouter event listener
            button.onclick = (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleLike(postId, button);
            };

        } catch (error) {
            console.error('❌ Error initializing like button:', error);
        }
    }
}

// Initialiser le système globalement
window.likeSystem = new LikeSystem();
console.log('✅ Like System v2.0 loaded (with subcollection support)');