/**
 * 📄 SEC Document Parser
 * Parse et formate les documents SEC (8-K, S-4, 10-K, etc.)
 * pour affichage dans l'interface AlphaVault AI
 */

class SECDocumentParser {
    constructor() {
        this.baseUrl = 'https://www.sec.gov/cgi-bin/viewer?action=view&cik=';
    }

    /**
     * 🔍 Parse un document SEC à partir de son URL
     * @param {string} url - URL du document SEC
     * @returns {Promise<Object>} - Données parsées
     */
    async parseDocument(url) {
        try {
            console.log('📄 Parsing SEC document:', url);
            
            const response = await fetch(url);
            const text = await response.text();
            
            // Détection du type de document
            const docType = this.detectDocumentType(text);
            
            switch (docType) {
                case '8-K':
                    return this.parse8K(text);
                case 'S-4':
                    return this.parseS4(text);
                case '10-K':
                case '10-Q':
                    return this.parse10KQ(text);
                default:
                    return this.parseGeneric(text);
            }
        } catch (error) {
            console.error('❌ Error parsing SEC document:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔎 Détecte le type de document
     */
    detectDocumentType(text) {
        if (text.includes('FORM 8-K') || text.includes('8-K')) return '8-K';
        if (text.includes('FORM S-4') || text.includes('S-4')) return 'S-4';
        if (text.includes('FORM 10-K') || text.includes('10-K')) return '10-K';
        if (text.includes('FORM 10-Q') || text.includes('10-Q')) return '10-Q';
        return 'GENERIC';
    }

    /**
     * 📋 Parse un Form 8-K
     */
    parse8K(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        // Extraction des informations clés
        const companyName = this.extractText(doc, 'dei:EntityRegistrantName') || 
                           this.extractFromPattern(text, /COMPANY CONFORMED NAME:\s*(.+)/);
        
        const cik = this.extractText(doc, 'dei:EntityCentralIndexKey') ||
                   this.extractFromPattern(text, /CENTRAL INDEX KEY:\s*(\d+)/);
        
        const filingDate = this.extractText(doc, 'dei:DocumentPeriodEndDate') ||
                          this.extractFromPattern(text, /FILED AS OF DATE:\s*(\d{8})/);
        
        // Items reportés
        const items = this.extract8KItems(text);
        
        // Contenu principal
        const mainContent = this.extractMainContent(doc);
        
        return {
            success: true,
            type: '8-K',
            data: {
                companyName,
                cik,
                filingDate: this.formatDate(filingDate),
                items,
                content: mainContent
            }
        };
    }

    /**
     * 📋 Parse un Form S-4 (Registration Statement)
     */
    parseS4(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const companyName = this.extractFromPattern(text, /COMPANY CONFORMED NAME:\s*(.+)/);
        const cik = this.extractFromPattern(text, /CENTRAL INDEX KEY:\s*(\d+)/);
        const filingDate = this.extractFromPattern(text, /FILED AS OF DATE:\s*(\d{8})/);
        
        // Informations de fusion/acquisition
        const mergerInfo = this.extractMergerInfo(text);
        
        return {
            success: true,
            type: 'S-4',
            data: {
                companyName,
                cik,
                filingDate: this.formatDate(filingDate),
                mergerInfo,
                content: this.extractMainContent(doc)
            }
        };
    }

    /**
     * 📋 Parse 10-K/10-Q
     */
    parse10KQ(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        return {
            success: true,
            type: '10-K/Q',
            data: {
                companyName: this.extractFromPattern(text, /COMPANY CONFORMED NAME:\s*(.+)/),
                cik: this.extractFromPattern(text, /CENTRAL INDEX KEY:\s*(\d+)/),
                filingDate: this.formatDate(this.extractFromPattern(text, /FILED AS OF DATE:\s*(\d{8})/)),
                content: this.extractMainContent(doc)
            }
        };
    }

    /**
     * 📋 Parse générique
     */
    parseGeneric(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        return {
            success: true,
            type: 'GENERIC',
            data: {
                content: this.extractMainContent(doc)
            }
        };
    }

    /**
     * 🔍 Extraction des Items d'un 8-K
     */
    extract8KItems(text) {
        const items = [];
        const itemPatterns = [
            { code: '1.01', name: 'Entry into a Material Definitive Agreement' },
            { code: '1.02', name: 'Termination of a Material Definitive Agreement' },
            { code: '2.01', name: 'Completion of Acquisition or Disposition of Assets' },
            { code: '2.03', name: 'Creation of a Direct Financial Obligation' },
            { code: '5.02', name: 'Departure/Election of Directors or Officers' },
            { code: '7.01', name: 'Regulation FD Disclosure' },
            { code: '8.01', name: 'Other Events' }
        ];
        
        itemPatterns.forEach(item => {
            const regex = new RegExp(`Item\\s+${item.code.replace('.', '\\.')}`, 'i');
            if (regex.test(text)) {
                items.push(item);
            }
        });
        
        return items;
    }

    /**
     * 🔍 Extraction des informations de fusion/acquisition (S-4)
     */
    extractMergerInfo(text) {
        const acquirer = this.extractFromPattern(text, /Acquirer[:\s]+(.+)/i);
        const target = this.extractFromPattern(text, /Target[:\s]+(.+)/i);
        const dealValue = this.extractFromPattern(text, /Deal Value[:\s]+\$?([\d,\.]+)/i);
        
        return {
            acquirer: acquirer || 'N/A',
            target: target || 'N/A',
            dealValue: dealValue ? `$${dealValue}` : 'N/A'
        };
    }

    /**
     * 📝 Extrait le contenu principal du document
     */
    extractMainContent(doc) {
        // Supprime les scripts, styles, et métadonnées
        const elementsToRemove = doc.querySelectorAll('script, style, meta, link');
        elementsToRemove.forEach(el => el.remove());
        
        // Extrait le body ou le document principal
        const body = doc.querySelector('body') || doc.documentElement;
        
        // Nettoie le HTML
        let html = body.innerHTML;
        
        // Limite la taille (premiers 50,000 caractères)
        if (html.length > 50000) {
            html = html.substring(0, 50000) + '\n\n<p><strong>[Document truncated - Full version available on SEC.gov]</strong></p>';
        }
        
        return html;
    }

    /**
     * 🔍 Extraction de texte via sélecteur CSS ou XPath
     */
    extractText(doc, selector) {
        const element = doc.querySelector(selector);
        return element ? element.textContent.trim() : null;
    }

    /**
     * 🔍 Extraction via regex
     */
    extractFromPattern(text, pattern) {
        const match = text.match(pattern);
        return match ? match[1].trim() : null;
    }

    /**
     * 📅 Formate une date SEC (YYYYMMDD) en format lisible
     */
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        
        // Si format YYYYMMDD
        if (/^\d{8}$/.test(dateStr)) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${month}/${day}/${year}`;
        }
        
        return dateStr;
    }

    /**
     * 🎨 Génère le HTML formaté pour affichage
     */
    generateDisplayHTML(parsedData) {
        if (!parsedData.success) {
            return `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Parsing Document</h3>
                    <p>${parsedData.error}</p>
                </div>
            `;
        }

        const { type, data } = parsedData;

        let html = `
            <div class="sec-document-container">
                <div class="sec-document-header">
                    <div class="doc-type-badge">${type}</div>
                    <h3>${data.companyName || 'SEC Filing'}</h3>
                    ${data.cik ? `<p class="doc-meta"><strong>CIK:</strong> ${data.cik}</p>` : ''}
                    ${data.filingDate ? `<p class="doc-meta"><strong>Filing Date:</strong> ${data.filingDate}</p>` : ''}
                </div>
        `;

        // Items spécifiques aux 8-K
        if (type === '8-K' && data.items && data.items.length > 0) {
            html += `
                <div class="sec-items-section">
                    <h4><i class="fas fa-list"></i> Items Reported</h4>
                    <ul class="sec-items-list">
                        ${data.items.map(item => `
                            <li><strong>Item ${item.code}:</strong> ${item.name}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // Informations de fusion (S-4)
        if (type === 'S-4' && data.mergerInfo) {
            html += `
                <div class="sec-merger-section">
                    <h4><i class="fas fa-handshake"></i> Merger Information</h4>
                    <div class="merger-grid">
                        <div class="merger-item">
                            <span class="merger-label">Acquirer:</span>
                            <span class="merger-value">${data.mergerInfo.acquirer}</span>
                        </div>
                        <div class="merger-item">
                            <span class="merger-label">Target:</span>
                            <span class="merger-value">${data.mergerInfo.target}</span>
                        </div>
                        <div class="merger-item">
                            <span class="merger-label">Deal Value:</span>
                            <span class="merger-value">${data.mergerInfo.dealValue}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Contenu principal
        html += `
                <div class="sec-document-content">
                    <h4><i class="fas fa-file-alt"></i> Document Content</h4>
                    <div class="content-body">
                        ${data.content}
                    </div>
                </div>
            </div>
        `;

        return html;
    }
}

// 🌐 Export global
window.SECDocumentParser = SECDocumentParser;