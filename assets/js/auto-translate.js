/* ============================================
   AUTO-TRANSLATE.JS - Traduction automatique 100% dynamique
   ✅ Utilise Google Translate API (gratuit via MyMemory)
   ✅ Cache intelligent pour performances
   ✅ Synchronisation Firebase
   ✅ Traduction en temps réel de TOUTE la page
   ============================================ */

class AutoTranslate {
    constructor() {
        this.currentLanguage = 'en'; // Langue par défaut
        this.originalTexts = new Map(); // Cache des textes originaux
        this.translationCache = new Map(); // Cache des traductions
        this.isTranslating = false;
        this.supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'zh', 'ar', 'ru'];
        
        // API de traduction (MyMemory - gratuit, 10 000 mots/jour)
        this.translationAPI = 'https://api.mymemory.translated.net/get';
        
        // Alternative : LibreTranslate (auto-hébergé ou public)
        // this.translationAPI = 'https://libretranslate.de/translate';
        
        console.log('🌍 AutoTranslate initialisé');
        this.init();
    }
    
    // ============================================
    // INITIALISATION
    // ============================================
    
    async init() {
        // Charger la langue depuis Firebase ou localStorage
        await this.loadLanguagePreference();
        
        // Sauvegarder les textes originaux de la page
        this.saveOriginalTexts();
        
        // Écouter les changements de langue
        this.setupLanguageChangeListener();
        
        // Si la langue n'est pas l'anglais, traduire immédiatement
        if (this.currentLanguage !== 'en') {
            await this.translatePage(this.currentLanguage);
        }
        
        console.log('✅ AutoTranslate prêt - Langue:', this.currentLanguage);
    }
    
    // ============================================
    // GESTION DE LA LANGUE
    // ============================================
    
    async loadLanguagePreference() {
        try {
            // 1. Essayer de charger depuis Firebase
            if (typeof currentUserData !== 'undefined' && currentUserData) {
                const settingsRef = firebaseDb
                    .collection('users')
                    .doc(currentUserData.uid)
                    .collection('settings')
                    .doc('preferences');
                
                const doc = await settingsRef.get();
                if (doc.exists && doc.data().language) {
                    this.currentLanguage = doc.data().language;
                    localStorage.setItem('alphavault_language', this.currentLanguage);
                    console.log('✅ Langue chargée depuis Firebase:', this.currentLanguage);
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠ Impossible de charger la langue depuis Firebase:', error);
        }
        
        // 2. Fallback sur localStorage
        const savedLang = localStorage.getItem('alphavault_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
            console.log('✅ Langue chargée depuis localStorage:', this.currentLanguage);
            return;
        }
        
        // 3. Fallback sur langue du navigateur
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
            this.currentLanguage = browserLang;
            console.log('✅ Langue détectée depuis navigateur:', this.currentLanguage);
        }
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
        
        return true;
    }
    
    async saveLanguageToFirebase(language) {
        try {
            if (typeof currentUserData !== 'undefined' && currentUserData) {
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
            '.setting-info p, .btn-back-dashboard, .user-dropdown-link'
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
            
            // Sauvegarder le texte original
            const originalText = this.getTextContent(el);
            if (originalText && originalText.length > 0) {
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
        this.showLoadingIndicator();
        
        try {
            // Récupérer tous les textes à traduire
            const textsToTranslate = [];
            const elementsMap = [];
            
            this.originalTexts.forEach((originalText, el) => {
                if (el && el.isConnected && originalText.trim().length > 0) {
                    textsToTranslate.push(originalText);
                    elementsMap.push(el);
                }
            });
            
            console.log(`📝 ${textsToTranslate.length} textes à traduire`);
            
            // Traduire par batch pour optimiser
            const batchSize = 20; // Traduire 20 textes à la fois
            
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
                
                // Petit délai pour éviter de surcharger l'API
                if (i + batchSize < textsToTranslate.length) {
                    await this.delay(500);
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
        
        // Ignorer les textes très courts ou les icônes
        if (text.trim().length < 2 || /^[0-9\s\-\/\(\)]+$/.test(text)) {
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
    
    setupLanguageChangeListener() {
        // Écouter les changements via le select
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.addEventListener('change', async (e) => {
                const newLang = e.target.value;
                await this.changeLanguage(newLang);
            });
        }
    }
    
    showLoadingIndicator() {
        // Créer un overlay de chargement
        const overlay = document.createElement('div');
        overlay.id = 'translation-overlay';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                backdrop-filter: blur(5px);
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 60px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        border: 5px solid rgba(255, 255, 255, 0.3);
                        border-top-color: white;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <h3 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">
                        🌍 Translating...
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
                        Please wait a moment
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
            overlay.remove();
        }
    }
}

// ============================================
// INITIALISATION GLOBALE
// ============================================

let globalTranslator = null;

// Initialiser dès que le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslator);
} else {
    initTranslator();
}

function initTranslator() {
    globalTranslator = new AutoTranslate();
    window.translator = globalTranslator; // Exposer globalement
}

// Fonction helper pour changer de langue (utilisable partout)
window.changeLanguage = async function(lang) {
    if (globalTranslator) {
        return await globalTranslator.changeLanguage(lang);
    }
    console.error('❌ Translator non initialisé');
    return false;
};

console.log('✅ Auto-translate script chargé');