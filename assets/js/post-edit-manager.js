/* ============================================
   ALPHAVAULT AI - POST EDIT MANAGER
   Édition de posts existants
   Version: 2.0
   ============================================ */

class PostEditManager {
    constructor() {
        this.form = document.getElementById('postForm');
        this.channelSelect = document.getElementById('channelSelect');
        this.titleInput = document.getElementById('postTitle');
        this.titleCounter = document.getElementById('titleCounter');
        this.tagInput = document.getElementById('tagInput');
        this.tagsWrapper = document.getElementById('tagsWrapper');
        this.uploadZone = document.getElementById('uploadZone');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreviewGrid = document.getElementById('imagePreviewGrid');
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.loadingState = document.getElementById('loadingState');
        this.editorCard = document.getElementById('editorCard');
        
        this.tags = [];
        this.existingImages = []; // URLs R2 existantes
        this.newImages = []; // Nouveaux fichiers à uploader
        this.imagesToDelete = []; // URLs à supprimer
        this.simplemde = null;
        this.postId = null;
        this.originalPost = null;
        
        this.MAX_IMAGES = 5;
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    }

    async initialize() {
        try {
            console.log('✏ Initializing Post Edit Manager...');
            
            // Récupérer l'ID du post
            const urlParams = new URLSearchParams(window.location.search);
            this.postId = urlParams.get('id');
            
            if (!this.postId) {
                throw new Error('No post ID provided');
            }

            // Charger le post
            await this.loadPost();
            
            // Initialiser l'éditeur Markdown
            this.initializeMarkdownEditor();
            
            // Charger les channels
            await this.loadChannels();
            
            // Remplir le formulaire
            this.populateForm();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Afficher l'éditeur
            this.loadingState.style.display = 'none';
            this.editorCard.style.display = 'block';
            
            console.log('✅ Post Edit Manager initialized');
        } catch (error) {
            console.error('❌ Error initializing editor:', error);
            alert('Failed to load post: ' + error.message);
            window.location.href = 'community-hub.html';
        }
    }

    async loadPost() {
        try {
            this.originalPost = await window.communityService.getPost(this.postId);
            
            // Vérifier que l'utilisateur est l'auteur
            const currentUser = firebase.auth().currentUser;
            if (currentUser.uid !== this.originalPost.authorId) {
                throw new Error('You are not authorized to edit this post');
            }
            
            console.log('✅ Post loaded:', this.originalPost);
        } catch (error) {
            console.error('❌ Error loading post:', error);
            throw error;
        }
    }

    initializeMarkdownEditor() {
        this.simplemde = new SimpleMDE({
            element: document.getElementById('markdownEditor'),
            placeholder: 'Write your analysis here...',
            spellChecker: false,
            status: ['lines', 'words', 'cursor'],
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', 'code', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ],
            autofocus: false,
            lineWrapping: true,
            tabSize: 4
        });

        console.log('✅ Markdown editor initialized');
    }

    async loadChannels() {
        try {
            const channels = await window.communityService.getChannels();
            
            channels.forEach(channel => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.textContent = `${channel.icon} ${channel.name}`;
                this.channelSelect.appendChild(option);
            });

            console.log('✅ Channels loaded');
        } catch (error) {
            console.error('❌ Error loading channels:', error);
            this.addDefaultChannels();
        }
    }

    addDefaultChannels() {
        const defaultChannels = [
            { id: 'market-analysis', icon: '📊', name: 'Market Analysis' },
            { id: 'stock-picks', icon: '🎯', name: 'Stock Picks' },
            { id: 'trading-strategies', icon: '📈', name: 'Trading Strategies' },
            { id: 'crypto', icon: '₿', name: 'Crypto' },
            { id: 'portfolio-review', icon: '💼', name: 'Portfolio Review' },
            { id: 'education', icon: '📚', name: 'Education' }
        ];

        defaultChannels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = `${channel.icon} ${channel.name}`;
            this.channelSelect.appendChild(option);
        });
    }

    populateForm() {
        // Channel
        this.channelSelect.value = this.originalPost.channelId;
        
        // Title
        this.titleInput.value = this.originalPost.title;
        this.updateTitleCounter();
        
        // Content
        this.simplemde.value(this.originalPost.content || '');
        
        // Tags
        this.tags = [...(this.originalPost.tags || [])];
        this.renderTags();
        
        // Images
        this.existingImages = [...(this.originalPost.images || [])];
        this.renderExistingImages();
    }

    renderExistingImages() {
        this.existingImages.forEach((imageUrl, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.dataset.existingIndex = index;
            previewItem.innerHTML = `
                <img src="${imageUrl}" alt="Existing Image" class="image-preview-img">
                <button type="button" class="image-remove-btn" title="Remove image">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            previewItem.querySelector('.image-remove-btn').addEventListener('click', () => {
                // Marquer l'image pour suppression
                this.imagesToDelete.push(imageUrl);
                this.existingImages.splice(index, 1);
                previewItem.remove();
                
                console.log('🗑 Image marked for deletion:', imageUrl);
            });
            
            this.imagePreviewGrid.appendChild(previewItem);
        });
    }

    setupEventListeners() {
        // Title counter
        this.titleInput.addEventListener('input', () => {
            this.updateTitleCounter();
        });

        // Tags
        this.tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.tagInput.value.trim()) {
                e.preventDefault();
                this.addTag(this.tagInput.value.trim());
                this.tagInput.value = '';
            } else if (e.key === 'Backspace' && !this.tagInput.value && this.tags.length > 0) {
                this.removeTag(this.tags.length - 1);
            }
        });

        // Image upload
        this.uploadZone.addEventListener('click', () => {
            this.imageInput.click();
        });

        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('dragover');
        });

        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('dragover');
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('dragover');
            this.handleImageFiles(e.dataTransfer.files);
        });

        this.imageInput.addEventListener('change', (e) => {
            this.handleImageFiles(e.target.files);
        });

        // Cancel button
        this.cancelBtn.addEventListener('click', () => {
            if (confirm('Discard changes and return to post?')) {
                window.location.href = `post.html?id=${this.postId}`;
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    updateTitleCounter() {
        const length = this.titleInput.value.length;
        const max = 150;
        this.titleCounter.textContent = `${length} / ${max}`;
        
        if (length > max * 0.9) {
            this.titleCounter.classList.add('warning');
        } else {
            this.titleCounter.classList.remove('warning');
        }
        
        if (length >= max) {
            this.titleCounter.classList.add('error');
        } else {
            this.titleCounter.classList.remove('error');
        }
    }

    addTag(tag) {
        tag = tag.replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
        
        if (!tag || tag.length > 30) return;
        if (this.tags.includes(tag)) return;
        if (this.tags.length >= 10) {
            alert('Maximum 10 tags allowed');
            return;
        }

        this.tags.push(tag);
        this.renderTags();
    }

    removeTag(index) {
        this.tags.splice(index, 1);
        this.renderTags();
    }

    renderTags() {
        this.tagsWrapper.querySelectorAll('.tag-item').forEach(el => el.remove());
        
        this.tags.forEach((tag, index) => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                <span>#${tag}</span>
                <i class="fas fa-times tag-remove" data-index="${index}"></i>
            `;
            
            tagElement.querySelector('.tag-remove').addEventListener('click', () => {
                this.removeTag(index);
            });
            
            this.tagsWrapper.insertBefore(tagElement, this.tagInput);
        });
    }

    async handleImageFiles(files) {
        const fileArray = Array.from(files);
        const currentTotal = this.existingImages.length + this.newImages.length;
        
        for (const file of fileArray) {
            if (currentTotal + this.newImages.length >= this.MAX_IMAGES) {
                alert(`Maximum ${this.MAX_IMAGES} images allowed`);
                break;
            }

            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                continue;
            }

            if (file.size > this.MAX_IMAGE_SIZE) {
                alert(`${file.name} is too large (max 5MB)`);
                continue;
            }

            this.newImages.push(file);
            this.createImagePreview(file);
        }
    }

    createImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item new-image';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="New Image" class="image-preview-img">
                <button type="button" class="image-remove-btn" title="Remove image">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-badge">NEW</div>
            `;
            
            previewItem.querySelector('.image-remove-btn').addEventListener('click', () => {
                const index = this.newImages.indexOf(file);
                if (index > -1) {
                    this.newImages.splice(index, 1);
                    previewItem.remove();
                }
            });
            
            this.imagePreviewGrid.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    }

    async uploadNewImages() {
        if (this.newImages.length === 0) return [];

        console.log(`📤 Uploading ${this.newImages.length} new images...`);

        const uploadPromises = this.newImages.map(async (file, index) => {
            try {
                console.log(`📤 Uploading new image ${index + 1}/${this.newImages.length}...`);
                const url = await window.communityService.uploadImage(file);
                console.log(`✅ New image ${index + 1} uploaded:`, url);
                return url;
            } catch (error) {
                console.error(`❌ Failed to upload new image ${index + 1}:`, error);
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }
        });

        try {
            const urls = await Promise.all(uploadPromises);
            console.log('✅ All new images uploaded');
            return urls;
        } catch (error) {
            console.error('❌ Error uploading new images:', error);
            throw error;
        }
    }

    async handleSubmit() {
        try {
            // Validations
            if (!this.channelSelect.value) {
                alert('Please select a channel');
                return;
            }

            if (!this.titleInput.value.trim()) {
                alert('Please enter a title');
                return;
            }

            const content = this.simplemde.value().trim();
            if (!content) {
                alert('Please enter some content');
                return;
            }

            // Afficher le loading
            this.setLoading(true);

            // Uploader les nouvelles images
            let newImageUrls = [];
            if (this.newImages.length > 0) {
                try {
                    newImageUrls = await this.uploadNewImages();
                } catch (error) {
                    alert('Failed to upload new images: ' + error.message);
                    this.setLoading(false);
                    return;
                }
            }

            // Construire le tableau final d'images
            const finalImages = [...this.existingImages, ...newImageUrls];

            // Préparer les données de mise à jour
            const updateData = {
                channelId: this.channelSelect.value,
                title: this.titleInput.value.trim(),
                content: content,
                tags: this.tags,
                images: finalImages,
                imagesToDelete: this.imagesToDelete // Pour supprimer du R2
            };

            console.log('💾 Updating post...', updateData);

            // Mettre à jour le post
            await window.communityService.updatePost(this.postId, updateData);

            console.log('✅ Post updated');

            // Afficher le message de succès
            this.showSuccessMessage();

            // Rediriger vers le post
            setTimeout(() => {
                window.location.href = `post.html?id=${this.postId}`;
            }, 1500);

        } catch (error) {
            console.error('❌ Error updating post:', error);
            alert('Failed to update post: ' + error.message);
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.saveBtn.disabled = loading;
        this.saveBtn.classList.toggle('loading', loading);
        
        const btnText = this.saveBtn.querySelector('span');
        const btnIcon = this.saveBtn.querySelector('.fa-save');
        const spinner = this.saveBtn.querySelector('.spinner');
        
        if (loading) {
            btnText.textContent = 'Saving...';
            btnIcon.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            btnText.textContent = 'Save Changes';
            btnIcon.style.display = 'inline-block';
            spinner.style.display = 'none';
        }
    }

    showSuccessMessage() {
        const banner = document.createElement('div');
        banner.className = 'success-banner';
        banner.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 1.5rem; color: #10B981;"></i>
            <div>
                <strong style="color: #10B981;">Post Updated Successfully!</strong><br>
                <span style="font-weight: 600; opacity: 0.9;">Redirecting to your post...</span>
            </div>
        `;
        banner.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: white;
            padding: 20px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(banner);
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.postEditManager = new PostEditManager();
    window.postEditManager.initialize();
});