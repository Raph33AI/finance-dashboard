/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN PDF EXPORTER v7.0 (FULL HTML CONTENT)
 * Génère un PDF professionnel avec tout le contenu HTML + styles inline
 * ════════════════════════════════════════════════════════════════
 */

class BusinessPlanPDFExporter {
    constructor() {
        this.workerUrl = 'https://business-plan-pdf-worker.raphnardone.workers.dev';
        this.init();
    }

    init() {
        const exportBtn = document.getElementById('exportPdfBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.openModal());
        }

        document.getElementById('closePdfModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelPdfBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('sendPdfBtn')?.addEventListener('click', () => this.sendPDF());
        document.querySelector('.pdf-modal-overlay')?.addEventListener('click', () => this.closeModal());
    }

    openModal() {
        const modal = document.getElementById('pdfEmailModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('recipientEmails').focus();
        }
    }

    closeModal() {
        const modal = document.getElementById('pdfEmailModal');
        if (modal) modal.classList.remove('active');
    }

    /**
     * 📧 ENVOYER PDF
     */
    async sendPDF() {
        try {
            const emails = this.getEmails();
            if (emails.length === 0) {
                this.showNotification('⚠ No recipients', 'Please enter at least one email address.', 'warning');
                return;
            }

            const subject = document.getElementById('emailSubject').value.trim();
            const message = document.getElementById('emailMessage').value.trim();
            const includeCharts = document.getElementById('includeCharts').checked;
            const includeSimulator = document.getElementById('includeSimulator').checked;

            this.showProgress(0, 'Generating PDF with full content...');

            // ✅ GÉNÉRER PDF CÔTÉ CLIENT
            const pdfBlob = await this.generatePDFClientSide(includeSimulator, includeCharts);
            this.showProgress(70, 'Converting to base64...');

            const pdfBase64 = await this.blobToBase64(pdfBlob);
            this.showProgress(80, 'Sending email...');

            // Envoyer au Worker
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails, subject, message, pdfBase64 })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Server error');
            }

            this.showProgress(100, 'PDF sent!');
            await this.wait(1000);

            this.closeModal();
            this.hideProgress();
            this.showNotification('✅ PDF Sent!', `Sent to ${emails.length} recipient(s).`, 'success');

        } catch (error) {
            console.error('❌ PDF Error:', error);
            this.hideProgress();
            this.showNotification('❌ Error', error.message, 'error');
        }
    }

    /**
     * 📄 GÉNÉRER PDF CLIENT-SIDE
     */
    async generatePDFClientSide(includeSimulator, includeCharts) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('📄 Generating PDF with full HTML content...');

                // Créer le contenu complet
                const pdfHTML = await this.createFullPDFHTML(includeSimulator, includeCharts);

                // Options html2pdf
                const options = {
                    margin: [10, 10, 10, 10],
                    filename: `AlphaVault_BusinessPlan_${this.getFormattedDate()}.pdf`,
                    image: { type: 'jpeg', quality: 0.95 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: 'portrait'
                    },
                    pagebreak: { 
                        mode: ['avoid-all', 'css'],
                        before: '.pdf-page-break'
                    }
                };

                // Générer PDF
                const worker = html2pdf().set(options).from(pdfHTML);
                const pdfBlob = await worker.outputPdf('blob');

                this.cleanup();
                console.log(`✅ PDF generated (${(pdfBlob.size / 1024).toFixed(2)} KB)`);
                resolve(pdfBlob);

            } catch (error) {
                this.cleanup();
                reject(error);
            }
        });
    }

    /**
     * 📄 CRÉER HTML COMPLET DU PDF
     */
    async createFullPDFHTML(includeSimulator, includeCharts) {
        const wrapper = document.createElement('div');
        wrapper.id = 'pdf-full-content';
        wrapper.style.cssText = this.getBaseStyles();

        // PAGE DE GARDE
        wrapper.appendChild(this.createProfessionalCoverPage());

        // CONTENU DES SECTIONS
        const sections = document.querySelectorAll('.bp-section');
        
        for (const section of sections) {
            const sectionId = section.id;

            // ⚠ SKIP SIMULATOR SI NON DEMANDÉ
            if (!includeSimulator && sectionId === 'simulator') {
                console.log('⏭ Skipping Scenario Simulator');
                continue;
            }

            const pdfSection = await this.cloneSection(section, includeCharts);
            wrapper.appendChild(pdfSection);
        }

        // Ajouter au DOM temporairement
        wrapper.style.position = 'fixed';
        wrapper.style.top = '0';
        wrapper.style.left = '-9999px';
        wrapper.style.width = '210mm';
        wrapper.style.backgroundColor = 'white';
        document.body.appendChild(wrapper);

        await this.wait(1500);

        return wrapper;
    }

    /**
     * 🎨 PAGE DE GARDE PROFESSIONNELLE
     */
    createProfessionalCoverPage() {
        const cover = document.createElement('div');
        cover.className = 'pdf-page-break';
        cover.innerHTML = `
            <div style="min-height: 280mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 40px; page-break-after: always;">
                
                <!-- Logo SVG -->
                <div style="width: 140px; height: 140px; margin-bottom: 50px; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                        <path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" 
                            stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="30" cy="70" r="6" fill="white"/>
                        <circle cx="50" cy="60" r="6" fill="white"/>
                        <circle cx="70" cy="45" r="6" fill="white"/>
                        <circle cx="90" cy="30" r="7" fill="white"/>
                    </svg>
                </div>

                <!-- Titre -->
                <h1 style="font-size: 64px; font-weight: 900; margin: 0 0 24px 0; letter-spacing: -1px; line-height: 1.1; text-shadow: 0 4px 16px rgba(0,0,0,0.3);">
                    AlphaVault AI
                </h1>

                <!-- Sous-titre -->
                <p style="font-size: 32px; font-weight: 700; margin: 0 0 50px 0; opacity: 0.95; line-height: 1.3;">
                    AI-Powered Financial<br>Intelligence Platform
                </p>

                <!-- Description -->
                <div style="max-width: 600px; margin: 0 auto 60px; padding: 24px 32px; background: rgba(255,255,255,0.15); border-radius: 16px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                    <p style="font-size: 20px; line-height: 1.6; margin: 0; font-weight: 500;">
                        Empowering Individual Investors with<br>Institutional-Grade Analytics
                    </p>
                </div>

                <!-- Métadonnées -->
                <div style="margin-top: 80px; padding-top: 40px; border-top: 2px solid rgba(255,255,255,0.3); width: 100%; max-width: 700px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; font-size: 17px; font-weight: 600;">
                        <div style="text-align: left;">
                            <div style="opacity: 0.8; font-size: 14px; margin-bottom: 6px;">Document</div>
                            <div>📄 Business Plan v3.0</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="opacity: 0.8; font-size: 14px; margin-bottom: 6px;">Date</div>
                            <div>📅 ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <div style="text-align: left;">
                            <div style="opacity: 0.8; font-size: 14px; margin-bottom: 6px;">Market</div>
                            <div>🌐 Global - Cloud-Based</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="opacity: 0.8; font-size: 14px; margin-bottom: 6px;">Confidentiality</div>
                            <div>🔒 Confidential</div>
                        </div>
                    </div>
                </div>

            </div>
        `;
        return cover;
    }

    /**
     * 📋 CLONER UNE SECTION AVEC STYLES INLINE
     */
    async cloneSection(originalSection, includeCharts) {
        const section = document.createElement('div');
        section.className = 'pdf-page-break';
        section.style.cssText = 'padding: 30px 25px; background: white; color: #1e293b; page-break-before: always; min-height: 250mm;';

        // Titre de section
        const titleEl = originalSection.querySelector('.section-title');
        if (titleEl) {
            const title = document.createElement('div');
            title.style.cssText = 'margin-bottom: 35px; padding-bottom: 16px; border-bottom: 4px solid #667eea;';
            title.innerHTML = `
                <h2 style="font-size: 32px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2;">
                    ${this.getIconEmoji(titleEl)} ${titleEl.textContent.trim().replace(/[💼📊🧩💰🎚🧮🚀♟⚠]/g, '')}
                </h2>
            `;
            section.appendChild(title);
        }

        // Cloner le contenu
        const content = await this.cloneContentWithStyles(originalSection, includeCharts);
        section.appendChild(content);

        return section;
    }

    /**
     * 🎨 CLONER CONTENU AVEC STYLES INLINE
     */
    async cloneContentWithStyles(originalSection, includeCharts) {
        const contentDiv = document.createElement('div');
        const clone = originalSection.cloneNode(true);

        // Supprimer éléments inutiles
        clone.querySelectorAll('.section-title, .nav-tabs, button, input, select, textarea').forEach(el => el?.remove());

        // ✅ TRAITER LES GRAPHIQUES
        if (includeCharts) {
            const chartContainers = clone.querySelectorAll('.chart-container');
            for (const container of chartContainers) {
                const canvas = container.querySelector('canvas');
                if (canvas) {
                    try {
                        const imgData = canvas.toDataURL('image/png', 1.0);
                        container.innerHTML = `
                            <div style="margin: 30px 0; text-align: center; page-break-inside: avoid;">
                                <img src="${imgData}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                            </div>
                        `;
                    } catch (error) {
                        console.error('⚠ Chart error:', error);
                        container.innerHTML = `
                            <div style="padding: 50px; background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1)); border: 2px dashed #667eea; border-radius: 16px; text-align: center; color: #667eea; font-weight: 600; margin: 30px 0;">
                                📊 Chart: See interactive version online
                            </div>
                        `;
                    }
                }
            }
        } else {
            clone.querySelectorAll('.chart-container').forEach(el => {
                el.innerHTML = `
                    <div style="padding: 50px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; text-align: center; color: #64748b; font-weight: 600; margin: 30px 0;">
                        📊 Chart excluded from PDF
                    </div>
                `;
            });
        }

        // Appliquer styles inline
        this.applyInlineStyles(clone);

        contentDiv.appendChild(clone);
        return contentDiv;
    }

    /**
     * 🎨 APPLIQUER STYLES INLINE ULTRA-PRO
     */
    applyInlineStyles(element) {
        // H3, Subsection Titles
        element.querySelectorAll('h3, .subsection-title').forEach(el => {
            el.style.cssText = 'font-size: 24px; font-weight: 700; color: #1e293b; margin: 35px 0 20px 0; padding-bottom: 10px; border-bottom: 3px solid #667eea; page-break-after: avoid;';
        });

        // H4
        element.querySelectorAll('h4').forEach(el => {
            el.style.cssText = 'font-size: 18px; font-weight: 700; color: #1e293b; margin: 24px 0 12px 0;';
        });

        // Paragraphes
        element.querySelectorAll('p').forEach(el => {
            el.style.cssText = 'color: #1e293b; font-size: 15px; line-height: 1.8; margin: 0 0 16px 0;';
        });

        // Cards (highlight, projection, metric, etc.)
        element.querySelectorAll('.highlight-card, .projection-card, .metric-card, .advantage-card, .trend-card, .segment-card, .pricing-card, .value-prop-item, .channel-card, .retention-card, .moat-card, .risk-card').forEach(card => {
            card.style.cssText = 'border: 2px solid #667eea; border-radius: 16px; padding: 24px; margin: 20px 0; background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.05)); page-break-inside: avoid; box-shadow: 0 4px 12px rgba(0,0,0,0.08);';
        });

        // Valeurs (grandes métriques)
        element.querySelectorAll('.highlight-value, .metric-value, .proj-value, .result-value, .ratio-value').forEach(val => {
            val.style.cssText = 'font-size: 32px; font-weight: 800; color: #667eea; margin: 8px 0; line-height: 1.2;';
        });

        // Labels
        element.querySelectorAll('.highlight-label, .metric-label, .proj-label, .result-label').forEach(label => {
            label.style.cssText = 'font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;';
        });

        // Tableaux
        element.querySelectorAll('table').forEach(table => {
            table.style.cssText = 'width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 13px; page-break-inside: avoid; background: white;';
            
            table.querySelectorAll('thead th').forEach(th => {
                th.style.cssText = 'background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 12px; font-weight: 700; text-align: left; border: 1px solid rgba(255,255,255,0.2);';
            });

            table.querySelectorAll('tbody td').forEach(td => {
                td.style.cssText = 'padding: 12px; border: 1px solid #e2e8f0; color: #1e293b;';
            });

            table.querySelectorAll('tbody tr:nth-child(even) td').forEach(td => {
                td.style.background = '#f8fafc';
            });

            table.querySelectorAll('tr.highlight td, tr.total-row td').forEach(td => {
                td.style.cssText += 'background: rgba(102,126,234,0.15); font-weight: 700; color: #667eea;';
            });
        });

        // Listes
        element.querySelectorAll('ul, ol').forEach(list => {
            list.style.cssText = 'margin: 16px 0; padding-left: 28px; color: #1e293b;';
            list.querySelectorAll('li').forEach(li => {
                li.style.cssText = 'margin-bottom: 10px; line-height: 1.7; color: #1e293b;';
            });
        });

        // Grids
        element.querySelectorAll('.highlights-grid, .segments-grid, .pricing-tiers, .advantages-grid, .trends-grid, .metrics-dashboard, .moats-grid').forEach(grid => {
            grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;';
        });

        // Info cards
        element.querySelectorAll('.info-card, .mission-statement').forEach(card => {
            card.style.cssText = 'background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.05)); padding: 28px; border-radius: 16px; border-left: 6px solid #667eea; margin: 30px 0;';
        });

        // Icônes FA → Emojis
        this.convertIconsToEmojis(element);
    }

    /**
     * 🔄 CONVERTIR ICÔNES EN EMOJIS
     */
    convertIconsToEmojis(element) {
        const iconMap = {
            'fa-briefcase': '💼', 'fa-chart-area': '📊', 'fa-puzzle-piece': '🧩',
            'fa-dollar-sign': '💰', 'fa-sliders-h': '🎚', 'fa-calculator': '🧮',
            'fa-rocket': '🚀', 'fa-chess': '♟', 'fa-exclamation-triangle': '⚠',
            'fa-users': '👥', 'fa-chart-line': '📈', 'fa-brain': '🧠',
            'fa-bullseye': '🎯', 'fa-globe-americas': '🌎', 'fa-tags': '🏷',
            'fa-check': '✅', 'fa-times': '❌', 'fa-check-circle': '✓',
            'fa-lightbulb': '💡', 'fa-trophy': '🏆', 'fa-shield-alt': '🛡',
            'fa-bolt': '⚡', 'fa-mobile-alt': '📱', 'fa-expand-arrows-alt': '↔',
            'fa-bell': '🔔', 'fa-newspaper': '📰', 'fa-graduation-cap': '🎓'
        };

        element.querySelectorAll('i[class*="fa-"]').forEach(icon => {
            const classes = icon.className.split(' ');
            let emoji = '●';
            for (const cls of classes) {
                if (iconMap[cls]) {
                    emoji = iconMap[cls];
                    break;
                }
            }
            const span = document.createElement('span');
            span.textContent = emoji + ' ';
            span.style.marginRight = '6px';
            icon.replaceWith(span);
        });
    }

    /**
     * 🎯 EXTRAIRE EMOJI D'ICÔNE
     */
    getIconEmoji(element) {
        const iconMap = {
            'fa-briefcase': '💼', 'fa-chart-area': '📊', 'fa-puzzle-piece': '🧩',
            'fa-dollar-sign': '💰', 'fa-sliders-h': '🎚', 'fa-calculator': '🧮',
            'fa-rocket': '🚀', 'fa-chess': '♟', 'fa-exclamation-triangle': '⚠'
        };
        const iconEl = element?.querySelector('i[class*="fa-"]');
        if (!iconEl) return '';
        for (const cls of iconEl.className.split(' ')) {
            if (iconMap[cls]) return iconMap[cls];
        }
        return '';
    }

    /**
     * 🎨 STYLES DE BASE
     */
    getBaseStyles() {
        return `
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            background: white;
            color: #1e293b;
            line-height: 1.6;
            font-size: 15px;
        `;
    }

    /**
     * 🧹 NETTOYER
     */
    cleanup() {
        const pdfContent = document.getElementById('pdf-full-content');
        if (pdfContent) pdfContent.remove();
    }

    /**
     * 🔧 UTILS
     */
    getEmails() {
        const raw = document.getElementById('recipientEmails').value;
        const emails = raw.split(/[\n,;]+/).map(e => e.trim()).filter(e => this.isValidEmail(e));
        return [...new Set(emails)];
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    getFormattedDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

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

    showNotification(title, message, type) {
        const bgColor = type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                        type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                        'linear-gradient(135deg, #ef4444, #dc2626)';
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 30px; right: 30px; z-index: 9999999;
            background: ${bgColor}; color: white; padding: 24px 32px;
            border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.4);
            min-width: 380px; animation: slideIn 0.5s ease;
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
    console.log('📄 ✅ Business Plan PDF Exporter v7.0 (Full HTML) initialized');
});