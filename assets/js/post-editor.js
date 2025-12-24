// /* ============================================
//    ALPHAVAULT AI - POST EDITOR
//    Éditeur de Posts avec Markdown
//    ============================================ */

// class PostEditor {
//     constructor() {
//         this.form = document.getElementById('postForm');
//         this.channelSelect = document.getElementById('channelSelect');
//         this.titleInput = document.getElementById('postTitle');
//         this.titleCounter = document.getElementById('titleCounter');
//         this.tagInput = document.getElementById('tagInput');
//         this.tagsWrapper = document.getElementById('tagsWrapper');
//         this.uploadZone = document.getElementById('uploadZone');
//         this.imageInput = document.getElementById('imageInput');
//         this.imagePreviewGrid = document.getElementById('imagePreviewGrid');
//         this.publishBtn = document.getElementById('publishBtn');
        
//         this.tags = [];
//         this.images = [];
//         this.uploadedImageUrls = [];
//         this.simplemde = null;
        
//         this.MAX_IMAGES = 5;
//         this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
//     }

//     async initialize() {
//         try {
//             console.log('✍ Initializing Post Editor...');
            
//             // Initialize Markdown Editor
//             this.initializeMarkdownEditor();
            
//             // Load channels
//             await this.loadChannels();
            
//             // Setup event listeners
//             this.setupEventListeners();
            
//             console.log('✅ Post Editor initialized');
//         } catch (error) {
//             console.error('❌ Error initializing editor:', error);
//         }
//     }

//     initializeMarkdownEditor() {
//         this.simplemde = new SimpleMDE({
//             element: document.getElementById('markdownEditor'),
//             placeholder: 'Write your analysis here...\n\nYou can use Markdown formatting:\n- **Bold** for emphasis\n- `code` for tickers or code\n- # Headings for structure\n- Links, lists, and more!',
//             spellChecker: false,
//             status: ['lines', 'words', 'cursor'],
//             toolbar: [
//                 'bold', 'italic', 'heading', '|',
//                 'quote', 'unordered-list', 'ordered-list', '|',
//                 'link', 'image', 'code', '|',
//                 'preview', 'side-by-side', 'fullscreen', '|',
//                 'guide'
//             ],
//             autofocus: false,
//             lineWrapping: true,
//             tabSize: 4
//         });

//         console.log('✅ Markdown editor initialized');
//     }

//     async loadChannels() {
//         try {
//             const channels = await window.communityService.getChannels();
            
//             channels.forEach(channel => {
//                 const option = document.createElement('option');
//                 option.value = channel.id;
//                 option.textContent = `${channel.icon} ${channel.name}`;
//                 this.channelSelect.appendChild(option);
//             });

//             console.log('✅ Channels loaded');
//         } catch (error) {
//             console.error('❌ Error loading channels:', error);
//         }
//     }

//     setupEventListeners() {
//         // Title character counter
//         this.titleInput.addEventListener('input', () => {
//             this.updateTitleCounter();
//         });

//         // Tags input
//         this.tagInput.addEventListener('keydown', (e) => {
//             if (e.key === 'Enter' && this.tagInput.value.trim()) {
//                 e.preventDefault();
//                 this.addTag(this.tagInput.value.trim());
//                 this.tagInput.value = '';
//             } else if (e.key === 'Backspace' && !this.tagInput.value && this.tags.length > 0) {
//                 this.removeTag(this.tags.length - 1);
//             }
//         });

//         // Image upload - click
//         this.uploadZone.addEventListener('click', () => {
//             this.imageInput.click();
//         });

//         // Image upload - drag & drop
//         this.uploadZone.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             this.uploadZone.classList.add('dragover');
//         });

//         this.uploadZone.addEventListener('dragleave', () => {
//             this.uploadZone.classList.remove('dragover');
//         });

//         this.uploadZone.addEventListener('drop', (e) => {
//             e.preventDefault();
//             this.uploadZone.classList.remove('dragover');
//             this.handleImageFiles(e.dataTransfer.files);
//         });

//         // Image input change
//         this.imageInput.addEventListener('change', (e) => {
//             this.handleImageFiles(e.target.files);
//         });

//         // Form submission
//         this.form.addEventListener('submit', (e) => {
//             e.preventDefault();
//             this.handleSubmit();
//         });
//     }

//     updateTitleCounter() {
//         const length = this.titleInput.value.length;
//         const max = 150;
//         this.titleCounter.textContent = `${length} / ${max}`;
        
//         if (length > max * 0.9) {
//             this.titleCounter.classList.add('warning');
//         } else {
//             this.titleCounter.classList.remove('warning');
//         }
        
//         if (length >= max) {
//             this.titleCounter.classList.add('error');
//         } else {
//             this.titleCounter.classList.remove('error');
//         }
//     }

//     addTag(tag) {
//         // Clean tag
//         tag = tag.replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
        
//         // Validate
//         if (!tag || tag.length > 30) return;
//         if (this.tags.includes(tag)) return;
//         if (this.tags.length >= 10) {
//             alert('Maximum 10 tags allowed');
//             return;
//         }

//         this.tags.push(tag);
//         this.renderTags();
//     }

//     removeTag(index) {
//         this.tags.splice(index, 1);
//         this.renderTags();
//     }

//     renderTags() {
//         // Remove existing tag items
//         this.tagsWrapper.querySelectorAll('.tag-item').forEach(el => el.remove());
        
//         // Add tag items before input
//         this.tags.forEach((tag, index) => {
//             const tagElement = document.createElement('div');
//             tagElement.className = 'tag-item';
//             tagElement.innerHTML = `
//                 <span>#${tag}</span>
//                 <i class="fas fa-times tag-remove" data-index="${index}"></i>
//             `;
            
//             tagElement.querySelector('.tag-remove').addEventListener('click', () => {
//                 this.removeTag(index);
//             });
            
//             this.tagsWrapper.insertBefore(tagElement, this.tagInput);
//         });
//     }

//     async handleImageFiles(files) {
//         const fileArray = Array.from(files);
        
//         for (const file of fileArray) {
//             // Check limit
//             if (this.images.length >= this.MAX_IMAGES) {
//                 alert(`Maximum ${this.MAX_IMAGES} images allowed`);
//                 break;
//             }

//             // Validate file type
//             if (!file.type.startsWith('image/')) {
//                 alert(`${file.name} is not an image file`);
//                 continue;
//             }

//             // Validate file size
//             if (file.size > this.MAX_IMAGE_SIZE) {
//                 alert(`${file.name} is too large (max 5MB)`);
//                 continue;
//             }

//             // Add to images array
//             this.images.push(file);
            
//             // Create preview
//             this.createImagePreview(file);
//         }
//     }

//     createImagePreview(file) {
//         const reader = new FileReader();
        
//         reader.onload = (e) => {
//             const previewItem = document.createElement('div');
//             previewItem.className = 'image-preview-item';
//             previewItem.innerHTML = `
//                 <img src="${e.target.result}" alt="Preview" class="image-preview-img">
//                 <button type="button" class="image-remove-btn">
//                     <i class="fas fa-times"></i>
//                 </button>
//             `;
            
//             previewItem.querySelector('.image-remove-btn').addEventListener('click', () => {
//                 const index = this.images.indexOf(file);
//                 if (index > -1) {
//                     this.images.splice(index, 1);
//                     previewItem.remove();
//                 }
//             });
            
//             this.imagePreviewGrid.appendChild(previewItem);
//         };
        
//         reader.readAsDataURL(file);
//     }

//     async uploadImages() {
//         if (this.images.length === 0) return [];

//         const uploadPromises = this.images.map(file => 
//             window.communityService.uploadImage(file)
//         );

//         try {
//             const urls = await Promise.all(uploadPromises);
//             console.log('✅ Images uploaded:', urls.length);
//             return urls;
//         } catch (error) {
//             console.error('❌ Error uploading images:', error);
//             throw new Error('Failed to upload images');
//         }
//     }

//     async handleSubmit() {
//         try {
//             // Validate form
//             if (!this.channelSelect.value) {
//                 alert('Please select a channel');
//                 return;
//             }

//             if (!this.titleInput.value.trim()) {
//                 alert('Please enter a title');
//                 return;
//             }

//             const content = this.simplemde.value().trim();
//             if (!content) {
//                 alert('Please enter some content');
//                 return;
//             }

//             // Show loading
//             this.setLoading(true);

//             // Upload images
//             const imageUrls = await this.uploadImages();

//             // Create post data
//             const postData = {
//                 channelId: this.channelSelect.value,
//                 title: this.titleInput.value.trim(),
//                 content: content,
//                 tags: this.tags,
//                 images: imageUrls
//             };

//             // Submit post
//             const post = await window.communityService.createPost(postData);

//             console.log('✅ Post created:', post.id);

//             // Show success message
//             this.showSuccessMessage();

//             // Redirect to post
//             setTimeout(() => {
//                 window.location.href = `post.html?id=${post.id}`;
//             }, 1500);

//         } catch (error) {
//             console.error('❌ Error creating post:', error);
//             alert('Failed to create post. Please try again.');
//             this.setLoading(false);
//         }
//     }

//     setLoading(loading) {
//         this.publishBtn.disabled = loading;
//         this.publishBtn.classList.toggle('loading', loading);
        
//         if (loading) {
//             this.publishBtn.querySelector('span').textContent = 'Publishing...';
//         } else {
//             this.publishBtn.querySelector('span').textContent = 'Publish Post';
//         }
//     }

//     showSuccessMessage() {
//         const banner = document.createElement('div');
//         banner.className = 'preview-banner';
//         banner.innerHTML = `
//             <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
//             <div>
//                 <strong>Post Published Successfully!</strong><br>
//                 <span style="font-weight: 600; opacity: 0.9;">Redirecting to your post...</span>
//             </div>
//         `;
        
//         this.form.insertBefore(banner, this.form.firstChild);
//     }
// }

// // Initialize on DOM load
// document.addEventListener('DOMContentLoaded', () => {
//     window.postEditor = new PostEditor();
//     window.postEditor.initialize();
// });

/* ============================================
   ALPHAVAULT AI - POST EDITOR
   Création de posts avec Markdown et images R2
   Version: 2.0
   ============================================ */

class PostEditor {
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
        this.publishBtn = document.getElementById('publishBtn');
        
        this.tags = [];
        this.images = []; // Fichiers locaux
        this.uploadedImageUrls = []; // URLs R2
        this.simplemde = null;
        
        this.MAX_IMAGES = 5;
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    }

    async initialize() {
        try {
            console.log('✍ Initializing Post Editor...');
            
            // Initialiser l'éditeur Markdown
            this.initializeMarkdownEditor();
            
            // Charger les channels
            await this.loadChannels();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Post Editor initialized');
        } catch (error) {
            console.error('❌ Error initializing editor:', error);
            alert('Failed to initialize editor: ' + error.message);
        }
    }

    initializeMarkdownEditor() {
        this.simplemde = new SimpleMDE({
            element: document.getElementById('markdownEditor'),
            placeholder: 'Write your analysis here...\n\nYou can use Markdown formatting:\n- **Bold** for emphasis\n- `code` for tickers or code\n- # Headings for structure\n- Links, lists, and more!',
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

            console.log('✅ Channels loaded:', channels.length);
        } catch (error) {
            console.error('❌ Error loading channels:', error);
            // Ajouter des channels par défaut en cas d'erreur
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

    setupEventListeners() {
        // Title character counter
        this.titleInput.addEventListener('input', () => {
            this.updateTitleCounter();
        });

        // Tags input
        this.tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.tagInput.value.trim()) {
                e.preventDefault();
                this.addTag(this.tagInput.value.trim());
                this.tagInput.value = '';
            } else if (e.key === 'Backspace' && !this.tagInput.value && this.tags.length > 0) {
                this.removeTag(this.tags.length - 1);
            }
        });

        // Image upload - click
        this.uploadZone.addEventListener('click', () => {
            this.imageInput.click();
        });

        // Image upload - drag & drop
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

        // Image input change
        this.imageInput.addEventListener('change', (e) => {
            this.handleImageFiles(e.target.files);
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
        // Nettoyer le tag
        tag = tag.replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
        
        // Validations
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
        // Supprimer les tags existants
        this.tagsWrapper.querySelectorAll('.tag-item').forEach(el => el.remove());
        
        // Ajouter les tags avant l'input
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
        
        for (const file of fileArray) {
            // Vérifier la limite
            if (this.images.length >= this.MAX_IMAGES) {
                alert(`Maximum ${this.MAX_IMAGES} images allowed`);
                break;
            }

            // Valider le type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                continue;
            }

            // Valider la taille
            if (file.size > this.MAX_IMAGE_SIZE) {
                alert(`${file.name} is too large (max 5MB)`);
                continue;
            }

            // Ajouter à la liste
            this.images.push(file);
            
            // Créer la preview
            this.createImagePreview(file);
        }
    }

    createImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="image-preview-img">
                <button type="button" class="image-remove-btn">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            previewItem.querySelector('.image-remove-btn').addEventListener('click', () => {
                const index = this.images.indexOf(file);
                if (index > -1) {
                    this.images.splice(index, 1);
                    previewItem.remove();
                }
            });
            
            this.imagePreviewGrid.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    }

    async uploadImages() {
        if (this.images.length === 0) return [];

        console.log(`📤 Uploading ${this.images.length} images...`);

        const uploadPromises = this.images.map(async (file, index) => {
            try {
                console.log(`📤 Uploading image ${index + 1}/${this.images.length}...`);
                const url = await window.communityService.uploadImage(file);
                console.log(`✅ Image ${index + 1} uploaded:`, url);
                return url;
            } catch (error) {
                console.error(`❌ Failed to upload image ${index + 1}:`, error);
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }
        });

        try {
            const urls = await Promise.all(uploadPromises);
            console.log('✅ All images uploaded successfully');
            return urls;
        } catch (error) {
            console.error('❌ Error uploading images:', error);
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

            // Uploader les images vers R2
            let imageUrls = [];
            if (this.images.length > 0) {
                try {
                    imageUrls = await this.uploadImages();
                } catch (error) {
                    alert('Failed to upload images: ' + error.message);
                    this.setLoading(false);
                    return;
                }
            }

            // Créer le post
            const postData = {
                channelId: this.channelSelect.value,
                title: this.titleInput.value.trim(),
                content: content,
                tags: this.tags,
                images: imageUrls
            };

            console.log('📝 Creating post...', postData);

            const post = await window.communityService.createPost(postData);

            console.log('✅ Post created:', post.id);

            // Afficher le message de succès
            this.showSuccessMessage();

            // Rediriger vers le post
            setTimeout(() => {
                window.location.href = `post.html?id=${post.id}`;
            }, 1500);

        } catch (error) {
            console.error('❌ Error creating post:', error);
            alert('Failed to create post: ' + error.message);
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.publishBtn.disabled = loading;
        this.publishBtn.classList.toggle('loading', loading);
        
        const btnText = this.publishBtn.querySelector('span');
        const btnIcon = this.publishBtn.querySelector('.fa-paper-plane');
        const spinner = this.publishBtn.querySelector('.spinner');
        
        if (loading) {
            btnText.textContent = 'Publishing...';
            btnIcon.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            btnText.textContent = 'Publish Post';
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
                <strong style="color: #10B981;">Post Published Successfully!</strong><br>
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
    window.postEditor = new PostEditor();
    window.postEditor.initialize();
});