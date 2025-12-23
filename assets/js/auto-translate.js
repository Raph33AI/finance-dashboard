/* ============================================
   AUTO-TRANSLATE.JS - Traduction automatique 100% dynamique
   ✅ NE CHARGE PAS PAR DÉFAUT
   ✅ Activation uniquement via Settings
   ✅ Persistance complète après activation
   ✅ Synchronisation Firebase
   ============================================ */

class AutoTranslate {
    constructor() {
        this.currentLanguage = 'en'; // Langue par défaut
        this.originalTexts = new Map(); // Cache des textes originaux
        this.translationCache = new Map(); // Cache des traductions
        this.isTranslating = false;
        this.isInitialized = false;
        this.supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'zh', 'ar', 'ru'];
        
        // API de traduction (MyMemory - gratuit, 10 000 mots/jour)
        this.translationAPI = 'https://api.mymemory.translated.net/get';
        
        console.log('🌍 AutoTranslate créé (mode: attente activation utilisateur)');
    }
    
    // ============================================
    // INITIALISATION (APPELÉE MANUELLEMENT)
    // ============================================
    
    async initialize() {
        if (this.isInitialized) {
            console.log('ℹ AutoTranslate déjà initialisé');
            return;
        }
        
        console.log('🔧 Initialisation AutoTranslate...');
        
        // Sauvegarder les textes originaux
        this.saveOriginalTexts();
        
        // Charger la langue préférée (Firebase ou localStorage)
        await this.loadLanguagePreference();
        
        // ✅ TRADUIRE UNIQUEMENT SI L'UTILISATEUR A DÉJÀ ACTIVÉ UNE LANGUE
        if (this.currentLanguage !== 'en') {
            console.log('🌍 Langue active détectée:', this.currentLanguage);
            console.log('🔄 Application de la traduction sauvegardée...');
            await this.translatePage(this.currentLanguage);
        } else {
            console.log('ℹ Aucune traduction active - page en anglais');
        }
        
        this.isInitialized = true;
        console.log('✅ AutoTranslate prêt');
    }
    
    // ============================================
    // GESTION DE LA LANGUE
    // ============================================
    
    async loadLanguagePreference() {
        try {
            // 1. Essayer de charger depuis Firebase
            if (typeof currentUserData !== 'undefined' && currentUserData && currentUserData.uid) {
                const settingsRef = firebaseDb
                    .collection('users')
                    .doc(currentUserData.uid)
                    .collection('settings')
                    .doc('preferences');
                
                const doc = await settingsRef.get();
                if (doc.exists && doc.data().language) {
                    const savedLang = doc.data().language;
                    
                    if (this.supportedLanguages.includes(savedLang)) {
                        this.currentLanguage = savedLang;
                        localStorage.setItem('alphavault_language', savedLang);
                        console.log('✅ Langue chargée depuis Firebase:', savedLang);
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠ Impossible de charger depuis Firebase:', error);
        }
        
        // 2. Fallback sur localStorage
        const savedLang = localStorage.getItem('alphavault_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
            console.log('✅ Langue chargée depuis localStorage:', savedLang);
            return;
        }
        
        // 3. Par défaut : anglais (pas de traduction)
        this.currentLanguage = 'en';
        console.log('ℹ Langue par défaut: en (aucune traduction)');
    }
    
    async changeLanguage(newLang) {
        if (!this.supportedLanguages.includes(newLang)) {
            console.error('❌ Langue non supportée:', newLang);
            return false;
        }
        
        if (this.currentLanguage === newLang) {
            console.log('ℹ Langue déjà active:', newLang);
            return true;
        }
        
        console.log('🔄 Changement de langue:', this.currentLanguage, '→', newLang);
        
        // ✅ INITIALISER SI PAS ENCORE FAIT
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const oldLang = this.currentLanguage;
        this.currentLanguage = newLang;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('alphavault_language', newLang);
        
        // Sauvegarder dans Firebase
        await this.saveLanguageToFirebase(newLang);
        
        // Traduire la page
        if (newLang === 'en') {
            // Restaurer les textes originaux
            this.restoreOriginalTexts();
        } else {
            await this.translatePage(newLang);
        }
        
        // Émettre un événement pour notifier d'autres scripts
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { oldLang, newLang } 
        }));
        
        console.log('✅ Langue changée avec succès');
        return true;
    }
    
    async saveLanguageToFirebase(language) {
        try {
            if (typeof currentUserData !== 'undefined' && currentUserData && currentUserData.uid) {
                const settingsRef = firebaseDb
                    .collection('users')
                    .doc(currentUserData.uid)
                    .collection('settings')
                    .doc('preferences');
                
                await settingsRef.set({ language }, { merge: true });
                console.log('✅ Langue sauvegardée dans Firebase:', language);
            }
        } catch (error) {
            console.warn('⚠ Impossible de sauvegarder dans Firebase:', error);
        }
    }
    
    // ============================================
    // SAUVEGARDE DES TEXTES ORIGINAUX
    // ============================================
    
    saveOriginalTexts() {
        console.log('💾 Sauvegarde des textes originaux...');
        
        // Sélectionner tous les éléments avec du texte
        const elements = document.querySelectorAll(
            'h1, h2, h3, h4, h5, h6, p, span, a, button, label, td, th, li, option, ' +
            '[data-translate], .nav-link, .settings-nav-item, .setting-info label, ' +
            '.setting-info p, .btn-back-dashboard, .user-dropdown-link, .brand-name, ' +
            '.brand-tagline, .section-title, .card-label, .card-value'
        );
        
        elements.forEach(el => {
            // Ignorer les éléments vides ou les scripts
            if (!el.textContent.trim() || el.closest('script') || el.closest('style')) {
                return;
            }
            
            // Ignorer les éléments avec uniquement des icônes
            if (el.children.length === 1 && el.children[0].tagName === 'I') {
                return;
            }
            
            // Ignorer les nombres purs
            if (/^[0-9\s\-\/\(\)$€£¥%.,]+$/.test(el.textContent.trim())) {
                return;
            }
            
            // Sauvegarder le texte original
            const originalText = this.getTextContent(el);
            if (originalText && originalText.length > 1) {
                this.originalTexts.set(el, originalText);
                
                // Ajouter un attribut data pour référence
                el.setAttribute('data-translate-id', this.generateId());
            }
        });
        
        console.log(`✅ ${this.originalTexts.size} éléments sauvegardés`);
    }
    
    restoreOriginalTexts() {
        console.log('🔄 Restauration des textes originaux...');
        
        this.originalTexts.forEach((originalText, el) => {
            if (el && el.isConnected) {
                this.setTextContent(el, originalText);
            }
        });
        
        console.log('✅ Textes originaux restaurés');
    }
    
    // ============================================
    // TRADUCTION DE LA PAGE
    // ============================================
    
    async translatePage(targetLang) {
        if (this.isTranslating) {
            console.log('⚠ Traduction déjà en cours...');
            return;
        }
        
        this.isTranslating = true;
        console.log(`🌍 Traduction de la page en ${targetLang}...`);
        
        // Afficher un indicateur de chargement
        this.showLoadingIndicator(targetLang);
        
        try {
            // Récupérer tous les textes à traduire
            const textsToTranslate = [];
            const elementsMap = [];
            
            this.originalTexts.forEach((originalText, el) => {
                if (el && el.isConnected && originalText.trim().length > 1) {
                    textsToTranslate.push(originalText);
                    elementsMap.push(el);
                }
            });
            
            console.log(`📝 ${textsToTranslate.length} textes à traduire`);
            
            // Traduire par batch pour optimiser
            const batchSize = 15; // Traduire 15 textes à la fois
            let translated = 0;
            
            for (let i = 0; i < textsToTranslate.length; i += batchSize) {
                const batch = textsToTranslate.slice(i, i + batchSize);
                const batchElements = elementsMap.slice(i, i + batchSize);
                
                const translations = await this.translateBatch(batch, targetLang);
                
                // Appliquer les traductions
                translations.forEach((translatedText, index) => {
                    const element = batchElements[index];
                    if (element && element.isConnected) {
                        this.setTextContent(element, translatedText);
                    }
                });
                
                translated += batch.length;
                console.log(`📊 Progression: ${translated}/${textsToTranslate.length}`);
                
                // Petit délai pour éviter de surcharger l'API
                if (i + batchSize < textsToTranslate.length) {
                    await this.delay(400);
                }
            }
            
            console.log('✅ Traduction terminée');
            
        } catch (error) {
            console.error('❌ Erreur lors de la traduction:', error);
            this.restoreOriginalTexts();
        } finally {
            this.isTranslating = false;
            this.hideLoadingIndicator();
        }
    }
    
    // ============================================
    // API DE TRADUCTION
    // ============================================
    
    async translateBatch(texts, targetLang) {
        const translations = [];
        
        for (const text of texts) {
            try {
                const translated = await this.translateText(text, targetLang);
                translations.push(translated);
            } catch (error) {
                console.warn('⚠ Erreur traduction:', error);
                translations.push(text); // Fallback sur texte original
            }
        }
        
        return translations;
    }
    
    async translateText(text, targetLang) {
        // Vérifier le cache
        const cacheKey = `${text}_${targetLang}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }
        
        // Ignorer les textes très courts ou les nombres
        if (text.trim().length < 2 || /^[0-9\s\-\/\(\)$€£¥%.,]+$/.test(text)) {
            return text;
        }
        
        try {
            // MyMemory Translation API (gratuit)
            const url = `${this.translationAPI}?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData) {
                const translatedText = data.responseData.translatedText;
                
                // Mettre en cache
                this.translationCache.set(cacheKey, translatedText);
                
                return translatedText;
            }
            
            // Fallback
            return text;
            
        } catch (error) {
            console.warn('⚠ Erreur API traduction:', error);
            return text;
        }
    }
    
    // ============================================
    // UTILITAIRES
    // ============================================
    
    getTextContent(element) {
        // Récupère uniquement le texte direct (pas les enfants)
        let text = '';
        
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            }
        });
        
        return text.trim();
    }
    
    setTextContent(element, text) {
        // Remplace uniquement les text nodes, préserve les balises HTML
        let textNodeFound = false;
        
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                node.textContent = text;
                textNodeFound = true;
            }
        });
        
        // Si aucun text node, créer un nouveau
        if (!textNodeFound && element.children.length === 0) {
            element.textContent = text;
        }
    }
    
    generateId() {
        return 'trans_' + Math.random().toString(36).substr(2, 9);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showLoadingIndicator(lang) {
        const langNames = {
            en: 'English',
            fr: 'Français',
            es: 'Español',
            de: 'Deutsch',
            it: 'Italiano',
            pt: 'Português',
            ja: '日本語',
            zh: '中文',
            ar: 'العربية',
            ru: 'Русский'
        };
        
        const overlay = document.createElement('div');
        overlay.id = 'translation-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.75);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                backdrop-filter: blur(8px);
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 50px 70px;
                    border-radius: 24px;
                    text-align: center;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                ">
                    <div style="
                        width: 70px;
                        height: 70px;
                        border: 6px solid rgba(255, 255, 255, 0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin: 0 auto 24px;
                    "></div>
                    <h3 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">
                        🌍 Translating to ${langNames[lang] || lang.toUpperCase()}
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0 0; font-size: 16px; font-weight: 500;">
                        Please wait a moment...
                    </p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(overlay);
    }
    
    hideLoadingIndicator() {
        const overlay = document.getElementById('translation-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => overlay.remove(), 300);
        }
    }
}

// ============================================
// INITIALISATION GLOBALE
// ============================================

let globalTranslator = null;

// ✅ CRÉER L'INSTANCE MAIS NE PAS INITIALISER AUTOMATIQUEMENT
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTranslator);
} else {
    createTranslator();
}

function createTranslator() {
    globalTranslator = new AutoTranslate();
    window.translator = globalTranslator; // Exposer globalement
    
    // ✅ INITIALISER UNIQUEMENT SI L'UTILISATEUR EST CONNECTÉ
    window.addEventListener('userDataLoaded', async function(e) {
        console.log('👤 Utilisateur connecté, vérification langue...');
        await globalTranslator.initialize();
    });
}

// Fonction helper pour changer de langue (utilisable partout)
window.changeLanguage = async function(lang) {
    if (globalTranslator) {
        return await globalTranslator.changeLanguage(lang);
    }
    console.error('❌ Translator non initialisé');
    return false;
};

console.log('✅ Auto-translate script chargé (mode: activation utilisateur uniquement)');