/* ============================================
   AUTO-TRANSLATE.JS - Traduction automatique GLOBALE
   ✅ Pré-traduit TOUTES les pages en arrière-plan
   ✅ Changement de langue = traduction de tout le site
   ✅ Navigation instantanée après première traduction
   ✅ IndexedDB pour stockage illimité
   ============================================ */

class AutoTranslate {
    constructor() {
        this.currentLanguage = 'en';
        this.originalTexts = new Map();
        this.translationCache = new Map();
        this.isTranslating = false;
        this.isInitialized = false;
        this.supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt'];
        
        // API de traduction
        this.translationAPI = 'https://api.mymemory.translated.net/get';
        
        // ✅ LISTE DE TOUTES TES PAGES
        this.allPages = [
            'index.html',
            'dashboard-financier.html',
            'investment-analytics.html',
            'real-estate-tax-simulator.html',
            'monte-carlo.html',
            'portfolio-optimizer.html',
            'risk-parity.html',
            'scenario-analysis.html',
            'advanced-analysis.html',
            'trend-prediction.html',
            'forex-converter.html',
            'ipo-intelligence.html',
            'insider-flow-tracker.html',
            'ma-predictor.html',
            'chatbot-fullpage.html',
            'economic-dashboard.html',
            'inflation-calculator.html',
            'interest-rate-tracker.html',
            'recession-indicator.html',
            'news-terminal.html',
            'market-sentiment.html',
            'trending-topics.html',
            'settings.html',
            'user-profile.html',
            'help.html',
            'admin-analytics.html'
        ];
        
        this.pageId = this.getPageIdentifier();
        this.db = null;
        
        console.log('🌍 AutoTranslate initialisé - Page:', this.pageId);
        this.initIndexedDB();
    }
    
    // ============================================
    // INDEXEDDB POUR STOCKAGE ILLIMITÉ
    // ============================================
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('AlphaVaultTranslations', 1);
            
            request.onerror = () => {
                console.error('❌ Erreur IndexedDB');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB prêt');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('translations')) {
                    const store = db.createObjectStore('translations', { keyPath: 'id' });
                    store.createIndex('lang', 'lang', { unique: false });
                    store.createIndex('page', 'page', { unique: false });
                    console.log('✅ Store IndexedDB créé');
                }
            };
        });
    }
    
    async saveToIndexedDB(lang, page, translations) {
        if (!this.db) {
            await this.initIndexedDB();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['translations'], 'readwrite');
            const store = transaction.objectStore('translations');
            
            const data = {
                id: `${page}_${lang}`,
                lang: lang,
                page: page,
                translations: translations,
                timestamp: new Date().toISOString()
            };
            
            const request = store.put(data);
            
            request.onsuccess = () => {
                console.log(`✅ Sauvegardé IndexedDB: ${page} (${lang})`);
                resolve();
            };
            
            request.onerror = () => {
                console.error('❌ Erreur sauvegarde IndexedDB');
                reject(request.error);
            };
        });
    }
    
    async loadFromIndexedDB(lang, page) {
        if (!this.db) {
            await this.initIndexedDB();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['translations'], 'readonly');
            const store = transaction.objectStore('translations');
            const request = store.get(`${page}_${lang}`);
            
            request.onsuccess = () => {
                if (request.result) {
                    console.log(`✅ Chargé depuis IndexedDB: ${page} (${lang})`);
                    resolve(request.result.translations);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => {
                console.error('❌ Erreur lecture IndexedDB');
                resolve(null);
            };
        });
    }
    
    async deleteLanguageFromIndexedDB(lang) {
        if (!this.db) return;
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['translations'], 'readwrite');
            const store = transaction.objectStore('translations');
            const index = store.index('lang');
            const request = index.openCursor(IDBKeyRange.only(lang));
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    console.log(`✅ Langue ${lang} supprimée d'IndexedDB`);
                    resolve();
                }
            };
        });
    }
    
    // ============================================
    // INITIALISATION
    // ============================================
    
    getPageIdentifier() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }
    
    async initialize() {
        if (this.isInitialized) {
            console.log('ℹ Déjà initialisé');
            return;
        }
        
        console.log('🔧 Initialisation...');
        
        this.saveOriginalTexts();
        await this.loadLanguagePreference();
        
        if (this.currentLanguage !== 'en') {
            console.log('🌍 Langue active:', this.currentLanguage);
            
            const cached = await this.loadFromIndexedDB(this.currentLanguage, this.pageId);
            
            if (cached) {
                console.log('⚡ Application cache instantané...');
                this.applyTranslationsFromCache(cached);
            } else {
                console.log('🔄 Pas de cache, traduction API...');
                await this.translateCurrentPage(this.currentLanguage);
            }
        }
        
        this.isInitialized = true;
        console.log('✅ Prêt');
    }
    
    // ============================================
    // GESTION DE LA LANGUE
    // ============================================
    
    async loadLanguagePreference() {
        try {
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
                        console.log('✅ Langue Firebase:', savedLang);
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠ Erreur Firebase:', error);
        }
        
        const savedLang = localStorage.getItem('alphavault_language');
        if (savedLang && this.supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
            console.log('✅ Langue localStorage:', savedLang);
            return;
        }
        
        this.currentLanguage = 'en';
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
        
        console.log('🔄 Changement:', this.currentLanguage, '→', newLang);
        
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const oldLang = this.currentLanguage;
        this.currentLanguage = newLang;
        
        localStorage.setItem('alphavault_language', newLang);
        await this.saveLanguageToFirebase(newLang);
        
        if (newLang === 'en') {
            this.restoreOriginalTexts();
            
            // ✅ SUPPRIMER LES ANCIENNES TRADUCTIONS
            if (oldLang !== 'en') {
                await this.deleteLanguageFromIndexedDB(oldLang);
            }
        } else {
            // ✅ TRADUIRE LA PAGE ACTUELLE D'ABORD
            const cached = await this.loadFromIndexedDB(newLang, this.pageId);
            
            if (cached) {
                console.log('⚡ Application cache instantané page actuelle...');
                this.applyTranslationsFromCache(cached);
            } else {
                console.log('🔄 Traduction page actuelle...');
                await this.translateCurrentPage(newLang);
            }
            
            // ✅ PUIS LANCER LA PRÉ-TRADUCTION DE TOUTES LES AUTRES PAGES
            this.preTranslateAllPages(newLang);
        }
        
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { oldLang, newLang } 
        }));
        
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
                console.log('✅ Langue Firebase sauvegardée');
            }
        } catch (error) {
            console.warn('⚠ Erreur Firebase:', error);
        }
    }
    
    // ============================================
    // ✨ PRÉ-TRADUCTION DE TOUTES LES PAGES
    // ============================================
    
    async preTranslateAllPages(lang) {
        console.log('🌍 DÉBUT PRÉ-TRADUCTION DE TOUTES LES PAGES en', lang);
        
        // Afficher indicateur de progression
        this.showGlobalTranslationProgress(lang);
        
        const pagesToTranslate = this.allPages.filter(page => page !== this.pageId);
        let completed = 0;
        
        for (const page of pagesToTranslate) {
            try {
                // Vérifier si déjà en cache
                const cached = await this.loadFromIndexedDB(lang, page);
                
                if (cached) {
                    console.log(`⚡ ${page} déjà en cache`);
                    completed++;
                    this.updateGlobalProgress(completed, pagesToTranslate.length);
                    continue;
                }
                
                console.log(`🔄 Traduction de ${page}...`);
                
                // Charger le HTML de la page
                const html = await this.fetchPageHTML(page);
                
                if (!html) {
                    console.warn(`⚠ Impossible de charger ${page}`);
                    completed++;
                    continue;
                }
                
                // Extraire les textes
                const texts = this.extractTextsFromHTML(html, page);
                
                if (texts.length === 0) {
                    console.warn(`⚠ Aucun texte trouvé dans ${page}`);
                    completed++;
                    continue;
                }
                
                // Traduire
                const translations = await this.translateTexts(texts, lang);
                
                // Sauvegarder
                await this.saveToIndexedDB(lang, page, translations);
                
                completed++;
                this.updateGlobalProgress(completed, pagesToTranslate.length);
                
                console.log(`✅ ${page} traduit et mis en cache (${completed}/${pagesToTranslate.length})`);
                
                // Petit délai pour éviter de surcharger l'API
                await this.delay(500);
                
            } catch (error) {
                console.error(`❌ Erreur traduction ${page}:`, error);
                completed++;
                this.updateGlobalProgress(completed, pagesToTranslate.length);
            }
        }
        
        this.hideGlobalTranslationProgress();
        console.log('🎉 PRÉ-TRADUCTION TERMINÉE !');
        
        // Notification utilisateur
        this.showCompletionToast(lang, pagesToTranslate.length);
    }
    
    async fetchPageHTML(page) {
        try {
            const response = await fetch(page);
            if (!response.ok) return null;
            return await response.text();
        } catch (error) {
            console.error(`Erreur fetch ${page}:`, error);
            return null;
        }
    }
    
    extractTextsFromHTML(html, pageName) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const elements = doc.querySelectorAll(
            'h1, h2, h3, h4, h5, h6, p, span, a, button, label, td, th, li, option'
        );
        
        const texts = [];
        
        elements.forEach((el, index) => {
            const text = this.getTextContent(el);
            
            if (text && text.length > 1 && !/^[0-9\s\-\/\(\)$€£¥%.,]+$/.test(text)) {
                texts.push({
                    id: `${pageName}_${index}`,
                    text: text,
                    selector: this.generateSelector(el)
                });
            }
        });
        
        return texts;
    }
    
    generateSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) return `.${element.className.split(' ')[0]}`;
        return element.tagName.toLowerCase();
    }
    
    async translateTexts(texts, lang) {
        const translations = [];
        const batchSize = 20;
        
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            
            for (const item of batch) {
                const translated = await this.translateText(item.text, lang);
                translations.push({
                    id: item.id,
                    selector: item.selector,
                    original: item.text,
                    translated: translated
                });
            }
            
            if (i + batchSize < texts.length) {
                await this.delay(300);
            }
        }
        
        return translations;
    }
    
    // ============================================
    // TRADUCTION PAGE ACTUELLE
    // ============================================
    
    saveOriginalTexts() {
        const elements = document.querySelectorAll(
            'h1, h2, h3, h4, h5, h6, p, span, a, button, label, td, th, li, option, ' +
            '.nav-link, .settings-nav-item, .brand-name, .brand-tagline'
        );
        
        elements.forEach((el, index) => {
            if (!el.textContent.trim() || el.closest('script') || el.closest('style')) return;
            if (el.children.length === 1 && el.children[0].tagName === 'I') return;
            if (/^[0-9\s\-\/\(\)$€£¥%.,]+$/.test(el.textContent.trim())) return;
            
            const originalText = this.getTextContent(el);
            if (originalText && originalText.length > 1) {
                this.originalTexts.set(el, originalText);
                el.setAttribute('data-translate-id', `current_${index}`);
            }
        });
        
        console.log(`💾 ${this.originalTexts.size} éléments sauvegardés`);
    }
    
    restoreOriginalTexts() {
        this.originalTexts.forEach((originalText, el) => {
            if (el && el.isConnected) {
                this.setTextContent(el, originalText);
            }
        });
    }
    
    async translateCurrentPage(lang) {
        this.showLoadingIndicator(lang);
        
        try {
            const textsToTranslate = [];
            const elementsMap = [];
            
            this.originalTexts.forEach((originalText, el) => {
                if (el && el.isConnected && originalText.trim().length > 1) {
                    textsToTranslate.push({
                        text: originalText,
                        id: el.getAttribute('data-translate-id')
                    });
                    elementsMap.push(el);
                }
            });
            
            const translationsForCache = [];
            const batchSize = 15;
            
            for (let i = 0; i < textsToTranslate.length; i += batchSize) {
                const batch = textsToTranslate.slice(i, i + batchSize);
                const batchElements = elementsMap.slice(i, i + batchSize);
                
                for (let j = 0; j < batch.length; j++) {
                    const item = batch[j];
                    const element = batchElements[j];
                    
                    const translated = await this.translateText(item.text, lang);
                    
                    if (element && element.isConnected) {
                        this.setTextContent(element, translated);
                        
                        translationsForCache.push({
                            id: item.id,
                            original: item.text,
                            translated: translated
                        });
                    }
                }
                
                if (i + batchSize < textsToTranslate.length) {
                    await this.delay(300);
                }
            }
            
            await this.saveToIndexedDB(lang, this.pageId, translationsForCache);
            
        } catch (error) {
            console.error('❌ Erreur:', error);
        } finally {
            this.hideLoadingIndicator();
        }
    }
    
    applyTranslationsFromCache(translations) {
        let applied = 0;
        
        translations.forEach(item => {
            const element = document.querySelector(`[data-translate-id="${item.id}"]`);
            
            if (element && element.isConnected) {
                this.setTextContent(element, item.translated);
                applied++;
            }
        });
        
        console.log(`✅ ${applied}/${translations.length} traductions appliquées`);
    }
    
    // ============================================
    // API
    // ============================================
    
    async translateText(text, lang) {
        const cacheKey = `${text}_${lang}`;
        if (this.translationCache.has(cacheKey)) {
            return this.translationCache.get(cacheKey);
        }
        
        if (text.trim().length < 2 || /^[0-9\s\-\/\(\)$€£¥%.,]+$/.test(text)) {
            return text;
        }
        
        try {
            const url = `${this.translationAPI}?q=${encodeURIComponent(text)}&langpair=en|${lang}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData) {
                const translated = data.responseData.translatedText;
                this.translationCache.set(cacheKey, translated);
                return translated;
            }
            
            return text;
        } catch (error) {
            return text;
        }
    }
    
    // ============================================
    // UTILITAIRES
    // ============================================
    
    getTextContent(element) {
        let text = '';
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            }
        });
        return text.trim();
    }
    
    setTextContent(element, text) {
        let found = false;
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                node.textContent = text;
                found = true;
            }
        });
        if (!found && element.children.length === 0) {
            element.textContent = text;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ============================================
    // UI - INDICATEURS
    // ============================================
    
    showLoadingIndicator(lang) {
        const langNames = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português' };
        const overlay = document.createElement('div');
        overlay.id = 'translation-overlay';
        overlay.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 999999; backdrop-filter: blur(10px);">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 70px; border-radius: 24px; text-align: center; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);">
                    <div style="width: 70px; height: 70px; border: 6px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 24px;"></div>
                    <h3 style="color: white; margin: 0; font-size: 28px; font-weight: 900;">🌍 Translating...</h3>
                    <p style="color: rgba(255, 255, 255, 0.95); margin: 12px 0 0; font-size: 16px;">to ${langNames[lang]}</p>
                </div>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(overlay);
    }
    
    hideLoadingIndicator() {
        const overlay = document.getElementById('translation-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => overlay.remove(), 300);
        }
    }
    
    showGlobalTranslationProgress(lang) {
        const langNames = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português' };
        
        const toast = document.createElement('div');
        toast.id = 'global-translation-toast';
        toast.innerHTML = `
            <div style="position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 32px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); z-index: 999998; min-width: 350px;">
                <h4 style="color: white; margin: 0 0 12px 0; font-size: 18px; font-weight: 800;">🌍 Pre-translating all pages...</h4>
                <p style="color: rgba(255, 255, 255, 0.95); margin: 0 0 16px 0; font-size: 14px;">to ${langNames[lang]}</p>
                <div style="background: rgba(255, 255, 255, 0.2); border-radius: 8px; height: 8px; overflow: hidden;">
                    <div id="global-progress-bar" style="background: white; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                </div>
                <p id="global-progress-text" style="color: white; margin: 12px 0 0 0; font-size: 13px; font-weight: 600;">0 / 0 pages</p>
            </div>
        `;
        document.body.appendChild(toast);
    }
    
    updateGlobalProgress(completed, total) {
        const progressBar = document.getElementById('global-progress-bar');
        const progressText = document.getElementById('global-progress-text');
        
        if (progressBar && progressText) {
            const percent = Math.round((completed / total) * 100);
            progressBar.style.width = percent + '%';
            progressText.textContent = `${completed} / ${total} pages`;
        }
    }
    
    hideGlobalTranslationProgress() {
        const toast = document.getElementById('global-translation-toast');
        if (toast) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }
    }
    
    showCompletionToast(lang, count) {
        const langNames = { en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português' };
        
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div style="position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px 32px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); z-index: 999998;">
                <h4 style="color: white; margin: 0; font-size: 18px; font-weight: 800;">✅ Translation complete!</h4>
                <p style="color: rgba(255, 255, 255, 0.95); margin: 8px 0 0 0; font-size: 14px;">${count} pages translated to ${langNames[lang]}</p>
                <p style="color: rgba(255, 255, 255, 0.95); margin: 4px 0 0 0; font-size: 13px;">Navigation will now be instant ⚡</p>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }
}

// ============================================
// INITIALISATION
// ============================================

let globalTranslator = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTranslator);
} else {
    createTranslator();
}

function createTranslator() {
    globalTranslator = new AutoTranslate();
    window.translator = globalTranslator;
    
    window.addEventListener('userDataLoaded', async function(e) {
        await globalTranslator.initialize();
    });
}

window.changeLanguage = async function(lang) {
    if (globalTranslator) {
        return await globalTranslator.changeLanguage(lang);
    }
    return false;
};

console.log('✅ Auto-translate GLOBAL chargé');