/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN - PDF EXPORTER v1.0
 * Ultra-Professional PDF Export System
 * ════════════════════════════════════════════════════════════════
 */

class BusinessPlanPDFExporter {
    constructor() {
        this.pdfOptions = {
            margin: [15, 15, 20, 15], // top, left, bottom, right (mm)
            filename: `AlphaVault_AI_Business_Plan_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.pdf-section, .force-page-break',
                avoid: '.avoid-break, .pdf-card, .pdf-table, .pdf-chart-container'
            }
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
     * 🎯 FONCTION PRINCIPALE D'EXPORT
     */
    async exportToPDF() {
        try {
            // Afficher loader
            this.showLoader();

            // Préparer le contenu
            const pdfContent = await this.preparePDFContent();

            // Générer le PDF
            await html2pdf()
                .set(this.pdfOptions)
                .from(pdfContent)
                .save()
                .then(() => {
                    this.hideLoader();
                    this.showSuccess();
                })
                .catch((error) => {
                    console.error('PDF Generation Error:', error);
                    this.hideLoader();
                    this.showError();
                });

        } catch (error) {
            console.error('PDF Export Error:', error);
            this.hideLoader();
            this.showError();
        }
    }

    /**
     * 📄 PRÉPARER LE CONTENU PDF
     */
    async preparePDFContent() {
        // Créer container PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-container';
        pdfContainer.style.cssText = 'position: absolute; left: -99999px; top: 0; width: 210mm;';

        // 1⃣ PAGE DE GARDE
        pdfContainer.appendChild(this.createCoverPage());

        // 2⃣ TABLE DES MATIÈRES
        pdfContainer.appendChild(this.createTableOfContents());

        // 3⃣ TOUTES LES SECTIONS
        const sections = document.querySelectorAll('.bp-section');
        for (const section of sections) {
            pdfContainer.appendChild(await this.createPDFSection(section));
        }

        // Ajouter au DOM temporairement
        document.body.appendChild(pdfContainer);

        // Attendre le rendu des graphiques
        await this.waitForCharts();

        return pdfContainer;
    }

    /**
     * 🎨 CRÉER PAGE DE GARDE
     */
    createCoverPage() {
        const cover = document.createElement('div');
        cover.className = 'pdf-cover force-page-break';
        cover.innerHTML = `
            <div class="pdf-cover-logo">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                    <defs>
                        <linearGradient id="pdfLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" 
                        stroke="url(#pdfLogoGrad)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="30" cy="70" r="4" fill="white"/>
                    <circle cx="50" cy="60" r="4" fill="white"/>
                    <circle cx="70" cy="45" r="4" fill="white"/>
                    <circle cx="90" cy="30" r="5" fill="white"/>
                    <path d="M 85 35 L 90 30 L 85 25" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
                </svg>
            </div>
            <h1 class="pdf-cover-title">AlphaVault AI</h1>
            <p class="pdf-cover-subtitle">AI-Powered Financial Intelligence Platform</p>
            <p class="pdf-cover-tagline">Empowering Individual Investors with Institutional-Grade Analytics</p>
            <div class="pdf-cover-meta">
                <div class="pdf-cover-meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="pdf-cover-meta-item">
                    <i class="fas fa-file-alt"></i>
                    <span>Business Plan v3.0</span>
                </div>
                <div class="pdf-cover-meta-item">
                    <i class="fas fa-lock"></i>
                    <span>Confidential</span>
                </div>
                <div class="pdf-cover-meta-item">
                    <i class="fas fa-globe"></i>
                    <span>Global Market</span>
                </div>
            </div>
        `;
        return cover;
    }

    /**
     * 📑 CRÉER TABLE DES MATIÈRES
     */
    createTableOfContents() {
        const toc = document.createElement('div');
        toc.className = 'pdf-toc force-page-break';

        const sections = [
            { number: '1', title: 'Executive Summary', page: '3' },
            { number: '2', title: 'Market Analysis', page: '7' },
            { number: '3', title: 'Business Model', page: '11' },
            { number: '4', title: 'Financial Projections', page: '15' },
            { number: '5', title: 'Scenario Simulator', page: '20' },
            { number: '6', title: 'Unit Economics', page: '24' },
            { number: '7', title: 'Growth Strategy', page: '28' },
            { number: '8', title: 'Competitive Analysis', page: '32' },
            { number: '9', title: 'Risk Analysis', page: '36' }
        ];

        let tocHTML = '<h2 class="pdf-toc-title"><i class="fas fa-list"></i> Table of Contents</h2>';
        
        sections.forEach(section => {
            tocHTML += `
                <div class="pdf-toc-item">
                    <span class="pdf-toc-item-number">${section.number}.</span>
                    <span class="pdf-toc-item-title">${section.title}</span>
                    <span class="pdf-toc-item-page">Page ${section.page}</span>
                </div>
            `;
        });

        toc.innerHTML = tocHTML;
        return toc;
    }

    /**
     * 📋 CRÉER SECTION PDF
     */
    async createPDFSection(originalSection) {
        const pdfSection = document.createElement('div');
        pdfSection.className = 'pdf-section';

        // Cloner le contenu
        const sectionClone = originalSection.cloneNode(true);

        // Nettoyer les éléments inutiles
        this.cleanSectionForPDF(sectionClone);

        // Convertir les éléments en format PDF-friendly
        this.convertToPDFFormat(sectionClone);

        pdfSection.appendChild(sectionClone);

        return pdfSection;
    }

    /**
     * 🧹 NETTOYER SECTION POUR PDF
     */
    cleanSectionForPDF(section) {
        // Supprimer boutons interactifs
        section.querySelectorAll('button:not(.scenario-card button)').forEach(btn => btn.remove());

        // Supprimer inputs
        section.querySelectorAll('input, select').forEach(input => {
            const value = input.value || input.getAttribute('value') || 'N/A';
            const span = document.createElement('span');
            span.textContent = value;
            span.style.cssText = 'font-weight: 600; color: #667eea;';
            input.replaceWith(span);
        });

        // Supprimer éléments cachés
        section.querySelectorAll('.hide-in-pdf, .nav-tabs').forEach(el => el.remove());
    }

    /**
     * 🎨 CONVERTIR AU FORMAT PDF
     */
    convertToPDFFormat(section) {
        // Tables
        section.querySelectorAll('table').forEach(table => {
            table.classList.add('pdf-table', 'avoid-break');
        });

        // Cards
        section.querySelectorAll('.highlight-card, .value-prop-item, .trend-card').forEach(card => {
            card.classList.add('pdf-card', 'avoid-break');
        });

        // Charts
        section.querySelectorAll('.chart-container').forEach(chart => {
            chart.classList.add('pdf-chart-container', 'avoid-break');
        });

        // Sections
        section.querySelectorAll('.section-title').forEach(title => {
            title.classList.add('pdf-section-title');
        });

        section.querySelectorAll('.subsection-title').forEach(title => {
            title.classList.add('pdf-subsection-title');
        });
    }

    /**
     * ⏳ ATTENDRE RENDU DES GRAPHIQUES
     */
    waitForCharts() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), 2000); // 2 secondes pour le rendu
        });
    }

    /**
     * 🔄 AFFICHER LOADER
     */
    showLoader() {
        const loader = document.createElement('div');
        loader.id = 'pdf-loader';
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8); z-index: 99999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: white; font-family: 'Inter', sans-serif;
        `;
        loader.innerHTML = `
            <div style="text-align: center;">
                <div style="width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px;"></div>
                <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Generating PDF...</h3>
                <p style="font-size: 16px; color: rgba(255,255,255,0.8);">Please wait while we prepare your Business Plan document</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
        document.body.appendChild(loader);
    }

    /**
     * ✅ CACHER LOADER
     */
    hideLoader() {
        const loader = document.getElementById('pdf-loader');
        if (loader) loader.remove();

        // Nettoyer le container PDF temporaire
        document.querySelectorAll('.pdf-container').forEach(el => el.remove());
    }

    /**
     * ✅ AFFICHER SUCCÈS
     */
    showSuccess() {
        this.showNotification('✅ PDF Generated Successfully!', 'Your Business Plan has been downloaded.', 'success');
    }

    /**
     * ❌ AFFICHER ERREUR
     */
    showError() {
        this.showNotification('❌ PDF Generation Failed', 'Please try again or contact support.', 'error');
    }

    /**
     * 🔔 NOTIFICATION SYSTÈME
     */
    showNotification(title, message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 24px; right: 24px; z-index: 100000;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            color: white; padding: 20px 28px; border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            font-family: 'Inter', sans-serif; min-width: 320px;
            animation: slideIn 0.4s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="font-size: 28px;">${type === 'success' ? '✅' : '❌'}</div>
                <div>
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
                </div>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.4s ease reverse';
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// ✅ INITIALISATION AUTOMATIQUE
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('📄 Business Plan PDF Exporter initialized');
});