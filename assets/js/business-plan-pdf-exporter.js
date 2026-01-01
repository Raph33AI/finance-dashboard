/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN - PDF EXPORTER v4.0 (CANVAS-SAFE)
 * ════════════════════════════════════════════════════════════════
 */

class BusinessPlanPDFExporter {
    constructor() {
        this.iconMap = {
            'fa-briefcase': '💼', 'fa-chart-area': '📊', 'fa-puzzle-piece': '🧩',
            'fa-dollar-sign': '💰', 'fa-sliders-h': '🎚', 'fa-calculator': '🧮',
            'fa-rocket': '🚀', 'fa-chess': '♟', 'fa-exclamation-triangle': '⚠',
            'fa-users': '👥', 'fa-chart-line': '📈', 'fa-brain': '🧠',
            'fa-bullseye': '🎯', 'fa-globe-americas': '🌎', 'fa-tags': '🏷',
            'fa-funnel-dollar': '💸', 'fa-table': '📋', 'fa-road': '🛣',
            'fa-medal': '🏅', 'fa-shield-alt': '🛡', 'fa-check-circle': '✅',
            'fa-times-circle': '❌', 'fa-check': '✓', 'fa-trophy': '🏆'
        };
        this.init();
    }

    init() {
        const exportBtn = document.getElementById('exportPdfBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }
    }

    /**
     * 🎯 EXPORT PDF PRINCIPAL
     */
    async exportToPDF() {
        try {
            console.log('📄 Initiating PDF export...');
            this.showLoader();

            // Créer le contenu PDF
            const pdfContent = await this.createPDFContent();

            // Options PDF optimisées
            const options = {
                margin: [12, 12, 15, 12],
                filename: `AlphaVault_BusinessPlan_${this.getFormattedDate()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 1200,
                    ignoreElements: (element) => {
                        // Ignorer les canvas pour éviter les erreurs
                        return element.tagName === 'CANVAS';
                    }
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                },
                pagebreak: {
                    mode: ['avoid-all', 'css'],
                    before: '.pdf-section-break'
                }
            };

            // Générer le PDF
            await html2pdf().set(options).from(pdfContent).save();

            this.cleanup();
            this.showSuccess();

        } catch (error) {
            console.error('❌ PDF Export Error:', error);
            this.cleanup();
            this.showError(error.message);
        }
    }

    /**
     * 📄 CRÉER CONTENU PDF
     */
    async createPDFContent() {
        const container = document.createElement('div');
        container.id = 'pdf-export-container';
        
        // Position visible mais hors écran
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 210mm;
            background: white;
            visibility: hidden;
            z-index: -9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        `;

        // Page de garde
        container.appendChild(this.createCoverPage());

        // Toutes les sections
        const allSections = document.querySelectorAll('.bp-section');
        console.log(`📊 Found ${allSections.length} sections to export`);

        allSections.forEach((section, index) => {
            const sectionTitle = this.getSectionTitle(section);
            console.log(`📄 Exporting section ${index + 1}: ${sectionTitle}`);
            
            const pdfSection = this.createPDFSection(section, sectionTitle, index + 1);
            container.appendChild(pdfSection);
        });

        // Ajouter au DOM
        document.body.appendChild(container);

        // Attendre le rendu (important pour les styles)
        await this.wait(2000);

        return container;
    }

    /**
     * 🎨 PAGE DE GARDE
     */
    createCoverPage() {
        const cover = document.createElement('div');
        cover.className = 'pdf-section-break';
        cover.style.cssText = `
            min-height: 297mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 80px 40px;
            page-break-after: always;
        `;

        const logoSVG = `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" 
                    stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>
                <circle cx="30" cy="70" r="5" fill="white"/>
                <circle cx="50" cy="60" r="5" fill="white"/>
                <circle cx="70" cy="45" r="5" fill="white"/>
                <circle cx="90" cy="30" r="6" fill="white"/>
            </svg>
        `;

        cover.innerHTML = `
            <div style="width: 120px; height: 120px; margin-bottom: 40px;">
                ${logoSVG}
            </div>
            <h1 style="font-size: 56px; font-weight: 900; margin: 0 0 20px 0; color: white;">
                AlphaVault AI
            </h1>
            <p style="font-size: 28px; font-weight: 600; margin: 0 0 40px 0; opacity: 0.95;">
                AI-Powered Financial Intelligence Platform
            </p>
            <p style="font-size: 20px; margin: 0 0 60px 0; opacity: 0.9; max-width: 700px; line-height: 1.6;">
                Empowering Individual Investors with Institutional-Grade Analytics
            </p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 80px; font-size: 16px;">
                <div>📅 ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div>📄 Business Plan v3.0</div>
                <div>🔒 Confidential</div>
                <div>🌐 Global Market</div>
            </div>
        `;

        return cover;
    }

    /**
     * 📋 CRÉER SECTION PDF
     */
    createPDFSection(originalSection, title, sectionNumber) {
        const pdfSection = document.createElement('div');
        pdfSection.className = 'pdf-section-break';
        pdfSection.style.cssText = `
            padding: 40px 30px;
            background: white;
            color: #1e293b;
            page-break-before: always;
            min-height: 200mm;
        `;

        // En-tête de section
        const titleIcon = this.extractIcon(originalSection.querySelector('.section-title'));
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom: 40px; border-left: 8px solid #667eea; padding-left: 24px;';
        header.innerHTML = `
            <div style="font-size: 14px; font-weight: 600; color: #667eea; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                Section ${sectionNumber}
            </div>
            <h2 style="font-size: 36px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2;">
                ${titleIcon} ${title}
            </h2>
        `;
        pdfSection.appendChild(header);

        // Contenu
        const content = this.cloneAndStyleContent(originalSection);
        pdfSection.appendChild(content);

        return pdfSection;
    }

    /**
     * 🎨 CLONER ET STYLER CONTENU
     */
    cloneAndStyleContent(section) {
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'color: #1e293b; line-height: 1.7;';

        const clone = section.cloneNode(true);

        // Supprimer éléments inutiles
        clone.querySelectorAll('.section-title, button, input, select, .nav-tabs, .bp-nav, canvas, .chart-container').forEach(el => {
            if (el && el.parentNode) {
                // Remplacer les graphiques par un placeholder
                if (el.classList.contains('chart-container')) {
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                        padding: 60px 40px;
                        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
                        border: 2px dashed #667eea;
                        border-radius: 16px;
                        text-align: center;
                        color: #667eea;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 30px 0;
                    `;
                    placeholder.innerHTML = '📊 Chart: See interactive version at alphavault-ai.com/admin-business-plan';
                    el.replaceWith(placeholder);
                } else {
                    el.remove();
                }
            }
        });

        // Convertir icônes
        this.convertIcons(clone);

        // Appliquer styles PDF
        this.applyPDFStyling(clone);

        contentDiv.appendChild(clone);
        return contentDiv;
    }

    /**
     * 🎨 APPLIQUER STYLES PDF
     */
    applyPDFStyling(element) {
        element.style.color = '#1e293b';
        element.style.background = 'white';

        // Sous-titres
        element.querySelectorAll('.subsection-title, h3').forEach(el => {
            el.style.cssText = `
                font-size: 24px !important;
                font-weight: 700 !important;
                color: #1e293b !important;
                margin: 35px 0 20px 0 !important;
                padding-bottom: 10px !important;
                border-bottom: 3px solid #667eea !important;
                background: transparent !important;
            `;
        });

        // Paragraphes
        element.querySelectorAll('p').forEach(el => {
            el.style.cssText = `
                color: #1e293b !important;
                font-size: 15px !important;
                line-height: 1.8 !important;
                margin-bottom: 16px !important;
                background: transparent !important;
            `;
        });

        // Cards
        element.querySelectorAll('.highlight-card, .projection-card, .metric-card, .advantage-card, .trend-card, .value-prop-item').forEach(card => {
            card.style.cssText = `
                border: 2px solid #667eea !important;
                border-radius: 16px !important;
                padding: 24px !important;
                margin: 20px 0 !important;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08)) !important;
                page-break-inside: avoid !important;
            `;
        });

        // Valeurs
        element.querySelectorAll('.highlight-value, .metric-value, .proj-value, .result-value').forEach(val => {
            val.style.cssText = `
                font-size: 32px !important;
                font-weight: 800 !important;
                color: #667eea !important;
                margin: 8px 0 !important;
                background: transparent !important;
            `;
        });

        // Tableaux
        element.querySelectorAll('table').forEach(table => {
            table.style.cssText = `
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 25px 0 !important;
                font-size: 13px !important;
                background: white !important;
                page-break-inside: avoid !important;
            `;

            table.querySelectorAll('thead th').forEach(th => {
                th.style.cssText = `
                    background: linear-gradient(135deg, #667eea, #764ba2) !important;
                    color: white !important;
                    padding: 14px 12px !important;
                    font-weight: 700 !important;
                    border: 1px solid white !important;
                `;
            });

            table.querySelectorAll('tbody td').forEach(td => {
                td.style.cssText = `
                    padding: 12px !important;
                    border: 1px solid #e2e8f0 !important;
                    color: #1e293b !important;
                    background: white !important;
                `;
            });

            table.querySelectorAll('tbody tr:nth-child(even) td').forEach(td => {
                td.style.background = '#f8fafc !important';
            });

            table.querySelectorAll('tr.highlight td, tr.total-row td').forEach(td => {
                td.style.cssText += `
                    background: rgba(102, 126, 234, 0.1) !important;
                    font-weight: 700 !important;
                    color: #667eea !important;
                `;
            });
        });

        // Listes
        element.querySelectorAll('ul, ol').forEach(list => {
            list.style.cssText = `
                color: #1e293b !important;
                padding-left: 28px !important;
                margin: 16px 0 !important;
                background: transparent !important;
            `;
            
            list.querySelectorAll('li').forEach(li => {
                li.style.cssText = `
                    color: #1e293b !important;
                    margin-bottom: 10px !important;
                    line-height: 1.7 !important;
                    background: transparent !important;
                `;
            });
        });
    }

    /**
     * 🔄 CONVERTIR ICÔNES
     */
    convertIcons(element) {
        element.querySelectorAll('i[class*="fa-"]').forEach(icon => {
            const classes = icon.className.split(' ');
            let emoji = '●';
            
            for (const cls of classes) {
                if (this.iconMap[cls]) {
                    emoji = this.iconMap[cls];
                    break;
                }
            }
            
            const span = document.createElement('span');
            span.textContent = emoji;
            span.style.cssText = 'font-size: 1.2em; margin-right: 8px;';
            icon.replaceWith(span);
        });
    }

    /**
     * 🎯 EXTRAIRE ICÔNE
     */
    extractIcon(element) {
        if (!element) return '';
        const iconEl = element.querySelector('i[class*="fa-"]');
        if (!iconEl) return '';
        
        const classes = iconEl.className.split(' ');
        for (const cls of classes) {
            if (this.iconMap[cls]) return this.iconMap[cls];
        }
        return '●';
    }

    /**
     * 📝 OBTENIR TITRE SECTION
     */
    getSectionTitle(section) {
        const titleEl = section.querySelector('.section-title');
        if (!titleEl) return 'Section';
        return titleEl.textContent.trim().replace(/\s+/g, ' ');
    }

    /**
     * 📅 DATE FORMATÉE
     */
    getFormattedDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    /**
     * ⏳ WAIT
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🧹 NETTOYER
     */
    cleanup() {
        const loader = document.getElementById('pdf-loader');
        if (loader) loader.remove();
        
        const pdfContent = document.getElementById('pdf-export-container');
        if (pdfContent) pdfContent.remove();
    }

    /**
     * 🔄 LOADER
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'pdf-loader';
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.95); z-index: 999999;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px);
        `;
        loader.innerHTML = `
            <div style="text-align: center; background: white; padding: 50px 60px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.4);">
                <div style="width: 70px; height: 70px; border: 5px solid #e2e8f0; border-top-color: #667eea; 
                    border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 30px;"></div>
                <h3 style="font-size: 26px; font-weight: 800; color: #1e293b; margin: 0 0 12px 0;">
                    📄 Generating Professional PDF...
                </h3>
                <p style="font-size: 16px; color: #64748b; margin: 0;">
                    Exporting all sections with premium formatting
                </p>
                <div style="margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); 
                    border-radius: 12px; font-size: 14px; color: #667eea; font-weight: 600;">
                    ⏱ Please wait 10-15 seconds...
                </div>
            </div>
            <style>
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }
            </style>
        `;
        document.body.appendChild(loader);
    }

    /**
     * ✅ SUCCÈS
     */
    showSuccess() {
        this.showNotification(
            '✅ PDF Generated Successfully!',
            'Your Business Plan has been downloaded. Charts are replaced with placeholders - view interactive version online.',
            'success'
        );
    }

    /**
     * ❌ ERREUR
     */
    showError(message) {
        this.showNotification(
            '❌ PDF Generation Failed',
            message || 'Please try again or check the console.',
            'error'
        );
    }

    /**
     * 🔔 NOTIFICATION
     */
    showNotification(title, message, type) {
        const notification = document.createElement('div');
        const bgColor = type === 'success' 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'linear-gradient(135deg, #ef4444, #dc2626)';
        
        notification.style.cssText = `
            position: fixed; top: 30px; right: 30px; z-index: 1000000;
            background: ${bgColor};
            color: white; padding: 24px 32px; border-radius: 20px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.4);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            min-width: 380px; max-width: 500px;
            animation: slideIn 0.5s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 20px;">
                <div style="font-size: 32px;">${type === 'success' ? '✅' : '❌'}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 18px; margin-bottom: 8px;">${title}</div>
                    <div style="font-size: 15px; opacity: 0.95; line-height: 1.5;">${message}</div>
                </div>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(500px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(500px)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
}

// ✅ INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('📄 ✅ Business Plan PDF Exporter v4.0 CANVAS-SAFE initialized');
});