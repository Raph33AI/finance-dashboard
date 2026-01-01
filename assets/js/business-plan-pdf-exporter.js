/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN - PDF EXPORTER v5.0 (EMAIL INTEGRATION)
 * ════════════════════════════════════════════════════════════════
 */

class BusinessPlanPDFExporter {
    constructor() {
        this.workerUrl = 'https://business-plan-pdf-worker.raphnardone.workers.dev'; // ⚠ REMPLACER
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
        // Bouton export PDF ouvre le modal
        const exportBtn = document.getElementById('exportPdfBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.openModal());
        }

        // Boutons modal
        document.getElementById('closePdfModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelPdfBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('sendPdfBtn')?.addEventListener('click', () => this.sendPDF());

        // Fermer modal en cliquant sur overlay
        document.querySelector('.pdf-modal-overlay')?.addEventListener('click', () => this.closeModal());
    }

    /**
     * 🔓 OUVRIR MODAL
     */
    openModal() {
        const modal = document.getElementById('pdfEmailModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('recipientEmails').focus();
        }
    }

    /**
     * 🔒 FERMER MODAL
     */
    closeModal() {
        const modal = document.getElementById('pdfEmailModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * 📧 ENVOYER PDF
     */
    async sendPDF() {
        try {
            // Validation
            const emails = this.getEmails();
            if (emails.length === 0) {
                this.showNotification('⚠ No recipients', 'Please enter at least one email address.', 'warning');
                return;
            }

            const subject = document.getElementById('emailSubject').value.trim();
            const message = document.getElementById('emailMessage').value.trim();
            const includeCharts = document.getElementById('includeCharts').checked;
            const includeSimulator = document.getElementById('includeSimulator').checked;

            // Afficher progression
            this.showProgress(0, 'Generating PDF content...');

            // Générer HTML du PDF
            const pdfHTML = await this.generatePDFHTML(includeSimulator, includeCharts);
            this.showProgress(40, 'Converting charts to images...');

            // Attendre conversion images
            await this.wait(1500);
            this.showProgress(60, 'Sending to server...');

            // Envoyer au Worker
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails,
                    subject,
                    message,
                    pdfHTML
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Server error');
            }

            this.showProgress(100, 'PDF sent successfully!');
            await this.wait(1000);

            this.closeModal();
            this.hideProgress();
            this.showNotification(
                '✅ PDF Sent Successfully!',
                `Business Plan sent to ${emails.length} recipient(s).`,
                'success'
            );

        } catch (error) {
            console.error('❌ PDF Send Error:', error);
            this.hideProgress();
            this.showNotification(
                '❌ PDF Send Failed',
                error.message || 'Please try again.',
                'error'
            );
        }
    }

    /**
     * 📧 EXTRAIRE EMAILS
     */
    getEmails() {
        const raw = document.getElementById('recipientEmails').value;
        const emails = raw
            .split(/[\n,;]+/)
            .map(e => e.trim())
            .filter(e => this.isValidEmail(e));
        return [...new Set(emails)]; // Dédupliquer
    }

    /**
     * ✅ VALIDER EMAIL
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * 📄 GÉNÉRER HTML PDF
     */
    async generatePDFHTML(includeSimulator, includeCharts) {
        const container = document.createElement('div');
        container.style.cssText = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;';

        // Page de garde
        container.appendChild(this.createCoverPage());

        // Sections
        const allSections = document.querySelectorAll('.bp-section');
        for (const section of allSections) {
            const sectionId = section.id;

            // ⚠ EXCLURE SCENARIO SIMULATOR si option désactivée
            if (!includeSimulator && sectionId === 'simulator') {
                console.log('⏭ Skipping Scenario Simulator section');
                continue;
            }

            const sectionTitle = this.getSectionTitle(section);
            const pdfSection = await this.createPDFSection(section, sectionTitle, includeCharts);
            container.appendChild(pdfSection);
        }

        return container.outerHTML;
    }

    /**
     * 🎨 PAGE DE GARDE
     */
    createCoverPage() {
        const cover = document.createElement('div');
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

        const logoSVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;"><path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="30" cy="70" r="5" fill="white"/><circle cx="50" cy="60" r="5" fill="white"/><circle cx="70" cy="45" r="5" fill="white"/><circle cx="90" cy="30" r="6" fill="white"/></svg>`;

        cover.innerHTML = `
            <div style="width: 120px; height: 120px; margin-bottom: 40px;">${logoSVG}</div>
            <h1 style="font-size: 56px; font-weight: 900; margin: 0 0 20px 0;">AlphaVault AI</h1>
            <p style="font-size: 28px; font-weight: 600; margin: 0 0 40px 0;">AI-Powered Financial Intelligence Platform</p>
            <p style="font-size: 20px; margin: 0 0 60px 0; max-width: 700px; line-height: 1.6;">Empowering Individual Investors with Institutional-Grade Analytics</p>
            <div style="margin-top: 80px; font-size: 16px;">
                📅 ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
                📄 Business Plan v3.0 | 🔒 Confidential
            </div>
        `;

        return cover;
    }

    /**
     * 📋 CRÉER SECTION PDF
     */
    async createPDFSection(originalSection, title, includeCharts) {
        const pdfSection = document.createElement('div');
        pdfSection.style.cssText = `
            padding: 40px 30px;
            background: white;
            color: #1e293b;
            page-break-before: always;
            min-height: 200mm;
        `;

        // En-tête
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom: 40px; border-left: 8px solid #667eea; padding-left: 24px;';
        header.innerHTML = `
            <h2 style="font-size: 36px; font-weight: 800; color: #1e293b; margin: 0;">
                ${this.extractIcon(originalSection.querySelector('.section-title'))} ${title}
            </h2>
        `;
        pdfSection.appendChild(header);

        // Contenu
        const content = await this.cloneAndStyleContent(originalSection, includeCharts);
        pdfSection.appendChild(content);

        return pdfSection;
    }

    /**
     * 🎨 CLONER CONTENU
     */
    async cloneAndStyleContent(section, includeCharts) {
        const contentDiv = document.createElement('div');
        const clone = section.cloneNode(true);

        // Supprimer éléments inutiles
        clone.querySelectorAll('.section-title, button, input, select, .nav-tabs, .bp-nav').forEach(el => el?.remove());

        // ⚠ TRAITER LES GRAPHIQUES
        if (includeCharts) {
            const chartContainers = clone.querySelectorAll('.chart-container');
            for (const container of chartContainers) {
                const canvas = container.querySelector('canvas');
                if (canvas) {
                    try {
                        const imgData = canvas.toDataURL('image/png');
                        const img = document.createElement('img');
                        img.src = imgData;
                        img.style.cssText = 'width: 100%; max-width: 800px; display: block; margin: 30px auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);';
                        container.innerHTML = '';
                        container.appendChild(img);
                    } catch (error) {
                        console.error('⚠ Chart conversion error:', error);
                        container.innerHTML = '<div style="padding: 60px; background: #f8fafc; border: 2px dashed #667eea; border-radius: 16px; text-align: center; color: #667eea; font-weight: 600;">📊 Chart: See interactive version online</div>';
                    }
                }
            }
        } else {
            clone.querySelectorAll('.chart-container').forEach(el => {
                el.innerHTML = '<div style="padding: 60px; background: #f8fafc; border: 2px dashed #667eea; border-radius: 16px; text-align: center; color: #667eea; font-weight: 600;">📊 Chart: See interactive version online</div>';
            });
        }

        this.convertIcons(clone);
        this.applyPDFStyling(clone);

        contentDiv.appendChild(clone);
        return contentDiv;
    }

    /**
     * 🎨 APPLIQUER STYLES PDF
     */
    applyPDFStyling(element) {
        element.style.color = '#1e293b';
        
        element.querySelectorAll('h3, .subsection-title').forEach(el => {
            el.style.cssText = 'font-size: 24px !important; font-weight: 700 !important; color: #1e293b !important; margin: 35px 0 20px 0 !important; padding-bottom: 10px !important; border-bottom: 3px solid #667eea !important;';
        });

        element.querySelectorAll('p').forEach(el => {
            el.style.cssText = 'color: #1e293b !important; font-size: 15px !important; line-height: 1.8 !important; margin-bottom: 16px !important;';
        });

        element.querySelectorAll('.highlight-card, .projection-card, .metric-card').forEach(card => {
            card.style.cssText = 'border: 2px solid #667eea !important; border-radius: 16px !important; padding: 24px !important; margin: 20px 0 !important; background: rgba(102, 126, 234, 0.08) !important; page-break-inside: avoid !important;';
        });

        element.querySelectorAll('table').forEach(table => {
            table.style.cssText = 'width: 100% !important; border-collapse: collapse !important; margin: 25px 0 !important; font-size: 13px !important;';
            table.querySelectorAll('thead th').forEach(th => {
                th.style.cssText = 'background: linear-gradient(135deg, #667eea, #764ba2) !important; color: white !important; padding: 14px 12px !important; font-weight: 700 !important;';
            });
            table.querySelectorAll('tbody td').forEach(td => {
                td.style.cssText = 'padding: 12px !important; border: 1px solid #e2e8f0 !important; color: #1e293b !important;';
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
            span.style.marginRight = '8px';
            icon.replaceWith(span);
        });
    }

    /**
     * 📝 UTILS
     */
    getSectionTitle(section) {
        const titleEl = section.querySelector('.section-title');
        return titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : 'Section';
    }

    extractIcon(element) {
        if (!element) return '';
        const iconEl = element.querySelector('i[class*="fa-"]');
        if (!iconEl) return '';
        for (const cls of iconEl.className.split(' ')) {
            if (this.iconMap[cls]) return this.iconMap[cls];
        }
        return '●';
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 📊 PROGRESSION
     */
    showProgress(percent, text) {
        const progressDiv = document.getElementById('pdfProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressDiv) progressDiv.style.display = 'block';
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = text;

        document.getElementById('sendPdfBtn').disabled = true;
        document.getElementById('cancelPdfBtn').disabled = true;
    }

    hideProgress() {
        const progressDiv = document.getElementById('pdfProgress');
        if (progressDiv) progressDiv.style.display = 'none';
        document.getElementById('sendPdfBtn').disabled = false;
        document.getElementById('cancelPdfBtn').disabled = false;
    }

    /**
     * 🔔 NOTIFICATIONS
     */
    showNotification(title, message, type) {
        const bgColor = type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                        type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                        'linear-gradient(135deg, #ef4444, #dc2626)';
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 30px; right: 30px; z-index: 9999999;
            background: ${bgColor}; color: white;
            padding: 24px 32px; border-radius: 20px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.4);
            min-width: 380px; max-width: 500px;
            animation: slideIn 0.5s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; gap: 20px;">
                <div style="font-size: 32px;">${type === 'success' ? '✅' : type === 'warning' ? '⚠' : '❌'}</div>
                <div>
                    <div style="font-weight: 800; font-size: 18px; margin-bottom: 8px;">${title}</div>
                    <div style="font-size: 15px; opacity: 0.95;">${message}</div>
                </div>
            </div>
            <style>@keyframes slideIn { from { transform: translateX(500px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }</style>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s, transform 0.5s';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(500px)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
}

// ✅ INIT
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('📄 ✅ Business Plan PDF Exporter v5.0 initialized');
});