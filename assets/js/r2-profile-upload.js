/* ============================================
   R2 PROFILE UPLOAD - Cloudflare R2 Storage
   Pour les photos de profil utilisateur
   ============================================ */

class R2ProfileUpload {
    constructor() {
        // ✅ URL de ton Worker Cloudflare R2
        this.workerUrl = 'https://images-api.alphavault-ai.com'; // À REMPLACER par ton URL réelle
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    }

    /**
     * Uploader une photo de profil vers Cloudflare R2
     */
    async uploadProfilePicture(file, userId) {
        try {
            // Validation
            if (!file) {
                throw new Error('No file provided');
            }

            if (!this.allowedTypes.includes(file.type)) {
                throw new Error(`Invalid file type. Allowed: ${this.allowedTypes.join(', ')}`);
            }

            if (file.size > this.maxFileSize) {
                throw new Error(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
            }

            if (!userId) {
                throw new Error('User ID is required');
            }

            console.log('📤 Uploading profile picture to R2...', {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                userId: userId
            });

            // Récupérer le token Firebase
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = await user.getIdToken();

            // Créer FormData
            const formData = new FormData();
            formData.append('image', file);
            formData.append('userId', userId);

            // Envoyer au Worker R2
            const response = await fetch(`${this.workerUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Upload failed: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('✅ Profile picture uploaded successfully:', result);

            return {
                success: true,
                imageUrl: result.imageUrl,
                fileName: result.fileName
            };

        } catch (error) {
            console.error('❌ R2 upload error:', error);
            throw error;
        }
    }

    /**
     * Supprimer une ancienne photo de profil
     */
    async deleteProfilePicture(fileName, userId) {
        try {
            if (!fileName) return;

            console.log('🗑 Deleting old profile picture:', fileName);

            const user = firebase.auth().currentUser;
            if (!user) return;

            const token = await user.getIdToken();

            const response = await fetch(`${this.workerUrl}/delete`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: fileName,
                    userId: userId
                })
            });

            if (response.ok) {
                console.log('✅ Old profile picture deleted');
            }

        } catch (error) {
            console.error('⚠ Error deleting old profile picture:', error);
            // Ne pas bloquer en cas d'erreur de suppression
        }
    }

    /**
     * Lister les photos de profil d'un utilisateur
     */
    async listProfilePictures(userId) {
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const token = await user.getIdToken();

            const response = await fetch(`${this.workerUrl}/list?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to list images: ${response.status}`);
            }

            const result = await response.json();
            return result.images || [];

        } catch (error) {
            console.error('❌ Error listing profile pictures:', error);
            return [];
        }
    }
}

// Instance globale
window.r2ProfileUpload = new R2ProfileUpload();

console.log('✅ R2 Profile Upload loaded');