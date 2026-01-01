/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN - PDF EXPORTER v2.0 (CORRECTED)
 * ════════════════════════════════════════════════════════════════
 */

class BusinessPlanPDFExporter {
    constructor() {
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
            this.showLoader();

            // Créer le contenu PDF complet
            const pdfContent = this.createFullPDFContent();
            
            // Ajouter au DOM
            document.body.appendChild(pdfContent);

            // Attendre le rendu
            await this.wait(1000);

            // Options PDF optimisées
            const opt = {
                margin: 10,
                filename: `AlphaVault_AI_Business_Plan_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 1200,
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css'],
                    before: '.pdf-page-break',
                    after: '.pdf-page-break-after'
                }
            };

            // Générer le PDF
            await html2pdf().set(opt).from(pdfContent).save();

            // Nettoyer
            pdfContent.remove();
            this.hideLoader();
            this.showSuccess();

        } catch (error) {
            console.error('PDF Error:', error);
            this.hideLoader();
            this.showError();
        }
    }

    /**
     * 📄 CRÉER CONTENU PDF COMPLET
     */
    createFullPDFContent() {
        const container = document.createElement('div');
        container.id = 'pdf-export-container';
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 210mm;
            background: white;
            color: #1e293b;
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
        `;

        // ✅ PAGE DE GARDE
        container.appendChild(this.createCoverPage());

        // ✅ TOUTES LES SECTIONS
        const sections = [
            'executive',
            'market',
            'business-model',
            'financials',
            'simulator',
            'unit-economics',
            'growth',
            'competitive',
            'risks'
        ];

        sections.forEach(sectionId => {
            const originalSection = document.getElementById(sectionId);
            if (originalSection) {
                container.appendChild(this.createPDFSection(originalSection, sectionId));
            }
        });

        return container;
    }

    /**
     * 🎨 PAGE DE GARDE
     */
    createCoverPage() {
        const cover = document.createElement('div');
        cover.className = 'pdf-page-break-after';
        cover.style.cssText = `
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
        `;
        cover.innerHTML = `
            <div style="width: 100px; height: 100px; margin-bottom: 30px;">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                    <path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" 
                        stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
                    <circle cx="30" cy="70" r="4" fill="white"/>
                    <circle cx="50" cy="60" r="4" fill="white"/>
                    <circle cx="70" cy="45" r="4" fill="white"/>
                    <circle cx="90" cy="30" r="5" fill="white"/>
                </svg>
            </div>
            <h1 style="font-size: 48px; font-weight: 900; margin-bottom: 16px;">AlphaVault AI</h1>
            <p style="font-size: 24px; font-weight: 600; margin-bottom: 30px;">AI-Powered Financial Intelligence Platform</p>
            <p style="font-size: 18px; opacity: 0.95; max-width: 600px; margin-bottom: 50px;">
                Empowering Individual Investors with Institutional-Grade Analytics
            </p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; font-size: 14px; margin-top: 60px;">
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
    createPDFSection(originalSection, sectionId) {
        const sectionWrapper = document.createElement('div');
        sectionWrapper.className = 'pdf-page-break';
        sectionWrapper.style.cssText = `
            padding: 30px;
            background: white;
            color: #1e293b;
            page-break-before: always;
        `;

        // Titre de la section
        const title = originalSection.querySelector('.section-title');
        if (title) {
            const pdfTitle = document.createElement('h2');
            pdfTitle.style.cssText = `
                font-size: 32px;
                font-weight: 800;
                color: #667eea;
                margin-bottom: 30px;
                border-left: 6px solid #667eea;
                padding-left: 20px;
            `;
            pdfTitle.innerHTML = title.innerHTML;
            sectionWrapper.appendChild(pdfTitle);
        }

        // Contenu de la section
        const content = this.extractSectionContent(originalSection);
        sectionWrapper.appendChild(content);

        return sectionWrapper;
    }

    /**
     * 📦 EXTRAIRE CONTENU DE SECTION
     */
    extractSectionContent(section) {
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'color: #1e293b; background: white;';

        // Cloner le contenu
        const clone = section.cloneNode(true);

        // Supprimer éléments inutiles
        clone.querySelectorAll('.section-title, button, input, select, .nav-tabs').forEach(el => el.remove());

        // Forcer les styles
        this.applyPDFStyles(clone);

        contentDiv.appendChild(clone);
        return contentDiv;
    }

    /**
     * 🎨 APPLIQUER STYLES PDF
     */
    applyPDFStyles(element) {
        // Texte principal
        element.style.color = '#1e293b';
        element.style.background = 'white';

        // Tous les enfants
        element.querySelectorAll('*').forEach(el => {
            el.style.color = '#1e293b';
            el.style.background = 'transparent';
            
            // Titres
            if (el.classList.contains('subsection-title')) {
                el.style.cssText += `
                    font-size: 22px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-top: 30px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 8px;
                `;
            }

            // Cartes
            if (el.classList.contains('highlight-card') || 
                el.classList.contains('value-prop-item') ||
                el.classList.contains('trend-card')) {
                el.style.cssText += `
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 15px 0;
                    background: #f8fafc !important;
                    page-break-inside: avoid;
                `;
            }

            // Tableaux
            if (el.tagName === 'TABLE') {
                el.style.cssText += `
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 13px;
                    page-break-inside: avoid;
                `;
                
                // En-têtes de tableau
                el.querySelectorAll('thead th').forEach(th => {
                    th.style.cssText = `
                        background: #667eea !important;
                        color: white !important;
                        padding: 10px;
                        border: 1px solid white;
                        font-weight: 700;
                    `;
                });

                // Cellules de tableau
                el.querySelectorAll('tbody td').forEach(td => {
                    td.style.cssText = `
                        padding: 10px;
                        border: 1px solid #e2e8f0;
                        color: #1e293b !important;
                        background: white !important;
                    `;
                });

                // Lignes alternées
                el.querySelectorAll('tbody tr:nth-child(even)').forEach(tr => {
                    tr.style.background = '#f8fafc !important';
                });
            }

            // Canvas (graphiques)
            if (el.tagName === 'CANVAS') {
                el.style.cssText += `
                    max-width: 100%;
                    height: auto !important;
                    page-break-inside: avoid;
                `;
            }

            // Conteneurs de graphiques
            if (el.classList.contains('chart-container')) {
                el.style.cssText += `
                    margin: 30px 0;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white !important;
                    page-break-inside: avoid;
                `;
            }
        });
    }

    /**
     * ⏳ UTILITAIRE WAIT
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🔄 LOADER
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'pdf-loader';
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.85); z-index: 99999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        `;
        loader.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.2); 
                    border-top-color: #667eea; border-radius: 50%; 
                    animation: spin 1s linear infinite; margin: 0 auto 24px;"></div>
                <h3 style="font-size: 24px; font-weight: 700; color: white; margin-bottom: 12px;">
                    📄 Generating PDF...
                </h3>
                <p style="font-size: 16px; color: rgba(255,255,255,0.8);">
                    Exporting all sections with charts and tables
                </p>
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

    hideLoader() {
        const loader = document.getElementById('pdf-loader');
        if (loader) loader.remove();
        const pdfContainer = document.getElementById('pdf-export-container');
        if (pdfContainer) pdfContainer.remove();
    }

    showSuccess() {
        this.showNotification('✅ PDF Generated!', 'Your Business Plan has been downloaded successfully.', 'success');
    }

    showError() {
        this.showNotification('❌ Error', 'PDF generation failed. Please try again.', 'error');
    }

    showNotification(title, message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 24px; right: 24px; z-index: 100000;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white; padding: 20px 28px; border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif; min-width: 320px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="font-size: 28px;">${type === 'success' ? '✅' : '❌'}</div>
                <div>
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.4s ease';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// ✅ INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('📄 Business Plan PDF Exporter v2.0 initialized');
});