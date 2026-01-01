/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN PDF EXPORTER v10.0 (OPTIMIZED FOR PERFECT PDF)
 * Génère un PDF parfaitement formaté avec html2pdf.js
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
     * 📧 GÉNÉRER PDF AVEC html2pdf.js ET ENVOYER
     */
    async sendPDF() {
        try {
            console.log('🚀 Initiating PDF export...');
            
            const emails = this.getEmails();
            if (emails.length === 0) {
                this.showNotification('⚠ No recipients', 'Please enter at least one email address.', 'warning');
                return;
            }

            const subject = document.getElementById('emailSubject').value.trim();
            const message = document.getElementById('emailMessage').value.trim();
            const includeSimulator = document.getElementById('includeSimulator').checked;

            this.showProgress(0, 'Preparing document...');

            // ✅ CRÉER LE HTML
            const htmlContent = this.createBusinessPlanHTML(includeSimulator);
            console.log('📝 HTML length:', htmlContent.length, 'characters');

            this.showProgress(20, 'Generating PDF (this may take 30-60 seconds)...');

            // ✅ GÉNÉRER PDF
            const pdfBlob = await this.generatePDFWithHtml2Pdf(htmlContent);
            console.log('📦 PDF Blob size:', pdfBlob.size, 'bytes');

            this.showProgress(60, 'Converting to Base64...');

            // ✅ CONVERTIR EN BASE64
            const pdfBase64 = await this.blobToBase64(pdfBlob);
            console.log('📊 Base64 length:', pdfBase64.length, 'characters');

            this.showProgress(70, 'Sending to server...');

            // ✅ ENVOYER AU WORKER
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    emails, 
                    subject, 
                    message, 
                    pdfBase64 
                })
            });

            this.showProgress(90, 'Processing...');

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
     * 🎨 GÉNÉRER PDF AVEC html2pdf.js (VERSION OPTIMISÉE)
     */
    async generatePDFWithHtml2Pdf(htmlContent) {
        console.log('📄 Creating optimized PDF container...');
        
        // ✅ Créer un conteneur optimisé pour le PDF
        const container = document.createElement('div');
        container.id = 'pdf-render-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 210mm;
            background: white;
            z-index: 999999;
            opacity: 0;
            pointer-events: none;
            overflow: visible;
        `;
        
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = htmlContent;
        contentDiv.style.cssText = `
            width: 210mm;
            background: white;
            font-smooth: always;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        `;
        
        container.appendChild(contentDiv);
        document.body.appendChild(container);

        try {
            console.log('⏳ Rendering DOM (waiting 1 second)...');
            await this.wait(1000);

            console.log('🖨 Generating multi-page PDF...');

            // ✅ OPTIONS OPTIMISÉES POUR PDF PROFESSIONNEL
            const options = {
                margin: [15, 15, 15, 15], // Top, Right, Bottom, Left (en mm)
                filename: `AlphaVault_BusinessPlan_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { 
                    type: 'jpeg', 
                    quality: 0.98 
                },
                html2canvas: { 
                    scale: 3, // ✅ Haute résolution
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 794, // A4 width in pixels at 96 DPI
                    windowHeight: 1123, // A4 height in pixels at 96 DPI
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true,
                    precision: 16
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: '.page-break-before',
                    after: '.page-break-after',
                    avoid: [
                        '.no-break',
                        'table',
                        '.highlight-card',
                        '.segment-card',
                        '.pricing-card',
                        '.value-prop-item',
                        '.roadmap-item',
                        '.risk-card',
                        '.calc-card'
                    ]
                }
            };

            // ✅ Générer le PDF avec gestion multi-pages
            const pdf = await html2pdf()
                .set(options)
                .from(contentDiv)
                .toPdf()
                .get('pdf')
                .then((pdfObj) => {
                    const totalPages = pdfObj.internal.getNumberOfPages();
                    console.log(`📄 PDF generated with ${totalPages} pages`);
                    
                    // ✅ Ajouter numéros de page
                    for (let i = 1; i <= totalPages; i++) {
                        pdfObj.setPage(i);
                        pdfObj.setFontSize(9);
                        pdfObj.setTextColor(100, 116, 139);
                        pdfObj.text(
                            `Page ${i} of ${totalPages}`,
                            pdfObj.internal.pageSize.getWidth() / 2,
                            pdfObj.internal.pageSize.getHeight() - 8,
                            { align: 'center' }
                        );
                    }
                    
                    return pdfObj;
                })
                .output('blob');

            console.log('✅ PDF generated successfully:', pdf.size, 'bytes');
            return pdf;

        } catch (error) {
            console.error('❌ PDF Generation Error:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        } finally {
            setTimeout(() => {
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                    console.log('🧹 PDF container removed');
                }
            }, 500);
        }
    }

    /**
     * 🔄 CONVERTIR BLOB EN BASE64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
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

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    /**
     * ════════════════════════════════════════════════════════════════
     * CRÉATION DU HTML OPTIMISÉ POUR PDF
     * ════════════════════════════════════════════════════════════════
     */
    createBusinessPlanHTML(includeSimulator) {
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AlphaVault AI - Business Plan</title>
    <style>${this.getBusinessPlanCSS()}</style>
</head>
<body>

    <!-- PAGE DE GARDE -->
    <div class="cover-page page-break-after">
        <div class="cover-content">
            <div class="cover-logo">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
                    <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea"/>
                            <stop offset="100%" style="stop-color:#764ba2"/>
                        </linearGradient>
                    </defs>
                    <path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" 
                        stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>
                    <circle cx="30" cy="70" r="5" fill="white"/>
                    <circle cx="50" cy="60" r="5" fill="white"/>
                    <circle cx="70" cy="45" r="5" fill="white"/>
                    <circle cx="90" cy="30" r="6" fill="white"/>
                </svg>
            </div>
            
            <h1 class="cover-title">AlphaVault AI</h1>
            <p class="cover-subtitle">AI-Powered Financial Intelligence Platform</p>
            
            <div class="cover-tagline">
                Empowering Individual Investors with<br>Institutional-Grade Analytics
            </div>
            
            <div class="cover-meta">
                <div class="meta-row">
                    <span class="meta-label">Document:</span>
                    <span class="meta-value">Business Plan v3.0</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Date:</span>
                    <span class="meta-value">${today}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Market:</span>
                    <span class="meta-value">Global - Cloud-Based</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Confidentiality:</span>
                    <span class="meta-value">Confidential</span>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 1: EXECUTIVE SUMMARY -->
    <div class="section page-break-before">
        <h2 class="section-title">Executive Summary</h2>
        
        <div class="mission-box no-break">
            <h3 class="box-title">Mission Statement</h3>
            <p class="mission-text">
                To democratize institutional-grade financial intelligence by providing individual investors 
                with AI-powered analytics, predictive models, and real-time market insights through an 
                accessible, affordable, and user-friendly SaaS platform.
            </p>
        </div>

        <h3 class="subsection-title">Key Highlights</h3>
        
        <div class="highlights-grid">
            <div class="highlight-card no-break">
                <div class="card-icon">👥</div>
                <div class="card-label">Target Market</div>
                <div class="card-value">$12.5B+</div>
                <p class="card-desc">Global retail investment analytics market (2024)</p>
            </div>
            
            <div class="highlight-card no-break">
                <div class="card-icon">📈</div>
                <div class="card-label">Revenue Model</div>
                <div class="card-value">Freemium SaaS</div>
                <p class="card-desc">3 tiers: Basic (Free), Pro ($10/mo), Platinum ($20/mo)</p>
            </div>
            
            <div class="highlight-card no-break">
                <div class="card-icon">🧠</div>
                <div class="card-label">Core Technology</div>
                <div class="card-value">AI + ML</div>
                <p class="card-desc">Gemini AI, predictive algorithms, real-time analytics</p>
            </div>
            
            <div class="highlight-card no-break">
                <div class="card-icon">🚀</div>
                <div class="card-label">5-Year Goal</div>
                <div class="card-value">100K Users</div>
                <p class="card-desc">$12M ARR with 15% paid conversion rate</p>
            </div>
        </div>

        <h3 class="subsection-title">Value Proposition</h3>
        
        <div class="value-list">
            <div class="value-item no-break">
                <div class="value-number">1</div>
                <div class="value-content">
                    <h4>Institutional-Grade Tools for Individual Investors</h4>
                    <p>Advanced M&A prediction, insider flow tracking, ML-powered trend analysis, Monte Carlo simulations, and risk parity optimization—previously only available to hedge funds and professional traders.</p>
                </div>
            </div>
            
            <div class="value-item no-break">
                <div class="value-number">2</div>
                <div class="value-content">
                    <h4>AI-Powered Financial Chatbot</h4>
                    <p>FinanceGPT provides instant answers to complex financial questions, generates custom analyses, and offers personalized investment recommendations 24/7.</p>
                </div>
            </div>
            
            <div class="value-item no-break">
                <div class="value-number">3</div>
                <div class="value-content">
                    <h4>Affordable Freemium Pricing</h4>
                    <p>Free tier provides basic analytics. Pro plan ($10/mo) unlocks advanced features. Platinum ($20/mo) includes AI chatbot and premium tools—10x cheaper than Bloomberg Terminal.</p>
                </div>
            </div>
            
            <div class="value-item no-break">
                <div class="value-number">4</div>
                <div class="value-content">
                    <h4>Real-Time Data & Automation</h4>
                    <p>Live market data, automated newsletters, instant alerts, and seamless integrations with Stripe, Firebase, and Cloudflare infrastructure for 99.9% uptime.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- SECTION 2: MARKET ANALYSIS -->
    <div class="section page-break-before">
        <h2 class="section-title">Market Analysis</h2>
        
        <h3 class="subsection-title">Total Addressable Market (TAM)</h3>
        
        <div class="market-cards">
            <div class="market-card no-break">
                <div class="market-header">TAM</div>
                <div class="market-value">$12.5B</div>
                <p class="market-label">Global Retail Investment Analytics Market</p>
                <p class="market-growth">+18.5% CAGR (2024-2029)</p>
            </div>
            
            <div class="market-card no-break">
                <div class="market-header">SAM</div>
                <div class="market-value">$3.2B</div>
                <p class="market-label">Serviceable Available Market</p>
                <p class="market-growth">~25% of TAM</p>
            </div>
            
            <div class="market-card no-break">
                <div class="market-header">SOM</div>
                <div class="market-value">$160M</div>
                <p class="market-label">Serviceable Obtainable Market</p>
                <p class="market-growth">5% of SAM (5-year target)</p>
            </div>
        </div>

        <h3 class="subsection-title">Target Customer Segments</h3>
        
        <div class="segment-card no-break">
            <h4 class="segment-title">Millennial/Gen Z Investors</h4>
            <div class="segment-stats">
                <div class="stat-item"><span>Age Range:</span> <strong>25-40 years</strong></div>
                <div class="stat-item"><span>Portfolio Size:</span> <strong>$5K - $100K</strong></div>
                <div class="stat-item"><span>Tech Savviness:</span> <strong>High</strong></div>
                <div class="stat-item"><span>Market Share:</span> <strong>45%</strong></div>
            </div>
            <p>Digital natives seeking advanced tools to outperform traditional advisors. Comfortable with SaaS subscriptions, value AI/ML capabilities.</p>
        </div>
        
        <div class="segment-card no-break">
            <h4 class="segment-title">Active Day Traders</h4>
            <div class="segment-stats">
                <div class="stat-item"><span>Age Range:</span> <strong>30-55 years</strong></div>
                <div class="stat-item"><span>Trading Frequency:</span> <strong>Daily</strong></div>
                <div class="stat-item"><span>Data Needs:</span> <strong>Real-time</strong></div>
                <div class="stat-item"><span>Market Share:</span> <strong>30%</strong></div>
            </div>
            <p>Require technical indicators, insider flow data, M&A predictions. Willing to pay premium for edge in market movements.</p>
        </div>
        
        <div class="segment-card no-break">
            <h4 class="segment-title">Long-Term Investors</h4>
            <div class="segment-stats">
                <div class="stat-item"><span>Age Range:</span> <strong>35-65 years</strong></div>
                <div class="stat-item"><span>Investment Horizon:</span> <strong>5-20 years</strong></div>
                <div class="stat-item"><span>Focus:</span> <strong>Portfolio optimization</strong></div>
                <div class="stat-item"><span>Market Share:</span> <strong>25%</strong></div>
            </div>
            <p>Value Monte Carlo simulations, risk parity tools, scenario analysis for retirement planning and wealth preservation.</p>
        </div>
    </div>

    <!-- SECTION 3: BUSINESS MODEL -->
    <div class="section page-break-before">
        <h2 class="section-title">Business Model</h2>
        
        <h3 class="subsection-title">Pricing Strategy</h3>
        
        <div class="pricing-card no-break">
            <div class="pricing-header">
                <div class="pricing-icon">🚀</div>
                <h4>Basic</h4>
                <div class="pricing-price">$0<span>/month</span></div>
            </div>
            <div class="pricing-features">
                <div class="feature">✓ Basic stock analysis</div>
                <div class="feature">✓ Real-time quotes (delayed 15 min)</div>
                <div class="feature">✓ Budget dashboard</div>
                <div class="feature">✓ News terminal (basic)</div>
                <div class="feature disabled">✗ Advanced analytics</div>
                <div class="feature disabled">✗ AI chatbot</div>
            </div>
            <p class="pricing-target"><strong>Target:</strong> 70% of users remain free</p>
        </div>
        
        <div class="pricing-card featured no-break">
            <div class="pricing-badge">Most Popular</div>
            <div class="pricing-header">
                <div class="pricing-icon">⭐</div>
                <h4>Pro</h4>
                <div class="pricing-price">$10<span>/month</span></div>
            </div>
            <div class="pricing-features">
                <div class="feature">✓ Everything in Basic</div>
                <div class="feature">✓ Advanced technical analysis (14 indicators)</div>
                <div class="feature">✓ M&A predictor</div>
                <div class="feature">✓ Insider flow tracker</div>
                <div class="feature">✓ Monte Carlo simulation</div>
                <div class="feature">✓ Risk parity optimizer</div>
                <div class="feature">✓ Real-time alerts</div>
            </div>
            <p class="pricing-target"><strong>Target:</strong> 20% of users upgrade to Pro</p>
        </div>
        
        <div class="pricing-card premium no-break">
            <div class="pricing-badge">Premium</div>
            <div class="pricing-header">
                <div class="pricing-icon">👑</div>
                <h4>Platinum</h4>
                <div class="pricing-price">$20<span>/month</span></div>
            </div>
            <div class="pricing-features">
                <div class="feature">✓ Everything in Pro</div>
                <div class="feature">✓ AI Chatbot (FinanceGPT) - Unlimited</div>
                <div class="feature">✓ Trend prediction (ML models)</div>
                <div class="feature">✓ Analyst coverage reports</div>
                <div class="feature">✓ Custom portfolio scenarios</div>
                <div class="feature">✓ Priority support</div>
                <div class="feature">✓ API access (coming soon)</div>
            </div>
            <p class="pricing-target"><strong>Target:</strong> 10% of users upgrade to Platinum</p>
        </div>
    </div>

    <!-- SECTION 4: FINANCIAL PROJECTIONS -->
    <div class="section page-break-before">
        <h2 class="section-title">Financial Projections (5-Year)</h2>
        
        <div class="projection-summary">
            <div class="proj-card no-break">
                <div class="proj-icon">📈</div>
                <div class="proj-label">Year 5 ARR</div>
                <div class="proj-value">$12.0M</div>
                <p class="proj-desc">+285% CAGR</p>
            </div>
            
            <div class="proj-card no-break">
                <div class="proj-icon">👥</div>
                <div class="proj-label">Total Users (Year 5)</div>
                <div class="proj-value">100,000</div>
                <p class="proj-desc">15,000 paid subscribers</p>
            </div>
            
            <div class="proj-card no-break">
                <div class="proj-icon">📊</div>
                <div class="proj-label">Gross Margin (Year 5)</div>
                <div class="proj-value">82%</div>
                <p class="proj-desc">SaaS economics</p>
            </div>
            
            <div class="proj-card no-break">
                <div class="proj-icon">💰</div>
                <div class="proj-label">EBITDA (Year 5)</div>
                <div class="proj-value">$2.8M</div>
                <p class="proj-desc">23% margin</p>
            </div>
        </div>

        <h3 class="subsection-title">5-Year Revenue Projection</h3>
        
        <table class="data-table no-break">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Year 1</th>
                    <th>Year 2</th>
                    <th>Year 3</th>
                    <th>Year 4</th>
                    <th>Year 5</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Total Users</strong></td>
                    <td>5,000</td>
                    <td>15,000</td>
                    <td>35,000</td>
                    <td>65,000</td>
                    <td>100,000</td>
                </tr>
                <tr>
                    <td><strong>Free Users</strong></td>
                    <td>3,500</td>
                    <td>10,500</td>
                    <td>24,500</td>
                    <td>45,500</td>
                    <td>70,000</td>
                </tr>
                <tr>
                    <td><strong>Paid Users</strong></td>
                    <td>1,500</td>
                    <td>4,500</td>
                    <td>10,500</td>
                    <td>19,500</td>
                    <td>30,000</td>
                </tr>
                <tr class="highlight-row">
                    <td><strong>MRR</strong></td>
                    <td><strong>$21,000</strong></td>
                    <td><strong>$63,000</strong></td>
                    <td><strong>$147,000</strong></td>
                    <td><strong>$273,000</strong></td>
                    <td><strong>$420,000</strong></td>
                </tr>
                <tr class="highlight-row">
                    <td><strong>ARR</strong></td>
                    <td><strong>$252K</strong></td>
                    <td><strong>$756K</strong></td>
                    <td><strong>$1.76M</strong></td>
                    <td><strong>$3.28M</strong></td>
                    <td><strong>$5.04M</strong></td>
                </tr>
                <tr>
                    <td><strong>Affiliate Revenue</strong></td>
                    <td>$25K</td>
                    <td>$90K</td>
                    <td>$220K</td>
                    <td>$410K</td>
                    <td>$630K</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Revenue</strong></td>
                    <td><strong>$277K</strong></td>
                    <td><strong>$846K</strong></td>
                    <td><strong>$1.98M</strong></td>
                    <td><strong>$3.69M</strong></td>
                    <td><strong>$5.67M</strong></td>
                </tr>
            </tbody>
        </table>

        <h3 class="subsection-title">Expense Breakdown & P&L</h3>
        
        <table class="data-table no-break">
            <thead>
                <tr>
                    <th>Expense Category</th>
                    <th>Year 1</th>
                    <th>Year 2</th>
                    <th>Year 3</th>
                    <th>Year 4</th>
                    <th>Year 5</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Infrastructure</strong></td>
                    <td>$12K</td>
                    <td>$30K</td>
                    <td>$60K</td>
                    <td>$100K</td>
                    <td>$150K</td>
                </tr>
                <tr>
                    <td><strong>API Costs</strong></td>
                    <td>$8K</td>
                    <td>$20K</td>
                    <td>$40K</td>
                    <td>$70K</td>
                    <td>$100K</td>
                </tr>
                <tr>
                    <td><strong>Marketing & Ads</strong></td>
                    <td>$60K</td>
                    <td>$150K</td>
                    <td>$300K</td>
                    <td>$500K</td>
                    <td>$750K</td>
                </tr>
                <tr>
                    <td><strong>Salaries (Team)</strong></td>
                    <td>$80K</td>
                    <td>$200K</td>
                    <td>$400K</td>
                    <td>$700K</td>
                    <td>$1.2M</td>
                </tr>
                <tr>
                    <td><strong>Support & Operations</strong></td>
                    <td>$10K</td>
                    <td>$25K</td>
                    <td>$50K</td>
                    <td>$80K</td>
                    <td>$120K</td>
                </tr>
                <tr>
                    <td><strong>Legal & Compliance</strong></td>
                    <td>$15K</td>
                    <td>$20K</td>
                    <td>$30K</td>
                    <td>$40K</td>
                    <td>$50K</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Expenses</strong></td>
                    <td><strong>$185K</strong></td>
                    <td><strong>$445K</strong></td>
                    <td><strong>$880K</strong></td>
                    <td><strong>$1.49M</strong></td>
                    <td><strong>$2.37M</strong></td>
                </tr>
                <tr class="highlight-row">
                    <td><strong>EBITDA</strong></td>
                    <td><strong>$92K</strong></td>
                    <td><strong>$401K</strong></td>
                    <td><strong>$1.10M</strong></td>
                    <td><strong>$2.20M</strong></td>
                    <td><strong>$3.30M</strong></td>
                </tr>
                <tr class="highlight-row">
                    <td><strong>EBITDA Margin</strong></td>
                    <td><strong>33%</strong></td>
                    <td><strong>47%</strong></td>
                    <td><strong>56%</strong></td>
                    <td><strong>60%</strong></td>
                    <td><strong>58%</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- SECTION 5: UNIT ECONOMICS -->
    <div class="section page-break-before">
        <h2 class="section-title">Unit Economics & Key Metrics</h2>
        
        <h3 class="subsection-title">Customer Lifetime Value (LTV)</h3>
        
        <div class="ltv-cards">
            <div class="calc-card no-break">
                <h4>💰 Average Revenue Per User (ARPU)</h4>
                <p class="calc-formula">ARPU = (60% × $10) + (40% × $20)</p>
                <p class="calc-result"><strong>$14/month</strong></p>
            </div>
            
            <div class="calc-card no-break">
                <h4>📅 Average Customer Lifespan</h4>
                <p class="calc-formula">Lifespan = 1 / 5% Monthly Churn</p>
                <p class="calc-result"><strong>20 months</strong></p>
            </div>
            
            <div class="calc-card highlight no-break">
                <h4>📈 Lifetime Value (LTV)</h4>
                <p class="calc-formula">LTV = $14 × 20 months</p>
                <p class="calc-result"><strong>$280</strong></p>
            </div>
        </div>

        <h3 class="subsection-title">Customer Acquisition Cost (CAC)</h3>
        
        <table class="data-table no-break">
            <thead>
                <tr>
                    <th>Channel</th>
                    <th>Cost Per Acquisition</th>
                    <th>% of Acquisitions</th>
                    <th>Weighted CAC</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>SEO & Content</td>
                    <td>$10</td>
                    <td>30%</td>
                    <td>$3.00</td>
                </tr>
                <tr>
                    <td>Paid Social</td>
                    <td>$35</td>
                    <td>25%</td>
                    <td>$8.75</td>
                </tr>
                <tr>
                    <td>Referral Program</td>
                    <td>$15</td>
                    <td>20%</td>
                    <td>$3.00</td>
                </tr>
                <tr>
                    <td>Influencer Partnerships</td>
                    <td>$25</td>
                    <td>15%</td>
                    <td>$3.75</td>
                </tr>
                <tr>
                    <td>Organic</td>
                    <td>$5</td>
                    <td>10%</td>
                    <td>$0.50</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Blended CAC</strong></td>
                    <td colspan="2"></td>
                    <td><strong>$19.00</strong></td>
                </tr>
            </tbody>
        </table>

        <h3 class="subsection-title">LTV:CAC Ratio Analysis</h3>
        
        <div class="ratio-box no-break">
            <div class="ratio-header">🏆 AlphaVault AI LTV:CAC</div>
            <div class="ratio-value">14.7:1</div>
            <p class="ratio-calc">$280 LTV / $19 CAC</p>
            <p class="ratio-verdict">✅ <strong>Excellent</strong> - Well above 3:1 benchmark</p>
            
            <div class="benchmarks">
                <h4>📊 Industry Benchmarks</h4>
                <p>❌ Poor (&lt; 1:1) - Unsustainable</p>
                <p>⚠ Fair (1:1 to 3:1) - Break-even to marginal</p>
                <p>✅ Good (3:1 to 5:1) - Healthy SaaS metrics</p>
                <p class="highlight-text">⭐ Excellent (&gt; 5:1) - Highly scalable (AlphaVault: 14.7:1)</p>
            </div>
        </div>

        <h3 class="subsection-title">Payback Period</h3>
        
        <div class="payback-box no-break">
            <div class="calc-card">
                <h4>🧮 Calculation</h4>
                <p class="calc-formula">Payback = $19 / ($14 × 0.85)</p>
                <p class="calc-result"><strong>1.6 months</strong></p>
            </div>
            <div class="calc-card">
                <h4>✅ Industry Standard</h4>
                <p>Best-in-class SaaS: &lt; 12 months</p>
                <p><strong>🏆 AlphaVault AI: 1.6 months</strong> — Exceptional capital efficiency!</p>
            </div>
        </div>
    </div>

    <!-- SECTION 6: GROWTH STRATEGY -->
    <div class="section page-break-before">
        <h2 class="section-title">Growth Strategy & Roadmap</h2>
        
        <h3 class="subsection-title">18-Month Product Roadmap</h3>
        
        <div class="roadmap-item no-break">
            <div class="roadmap-quarter">Q1</div>
            <h4>Foundation & Launch</h4>
            <ul>
                <li>✅ Core platform launch</li>
                <li>✅ Freemium model activation</li>
                <li>⏳ SEO optimization (50+ blog posts)</li>
                <li>⏳ Social media presence</li>
                <li>⏳ First 500 users milestone</li>
            </ul>
        </div>
        
        <div class="roadmap-item no-break">
            <div class="roadmap-quarter">Q2</div>
            <h4>User Growth & Engagement</h4>
            <ul>
                <li>⏳ Paid ads campaign ($5K/month)</li>
                <li>⏳ Referral program</li>
                <li>⏳ Mobile app development start</li>
                <li>⏳ Community hub enhancements</li>
                <li>⏳ Target: 2,000 users, 10% conversion</li>
            </ul>
        </div>
        
        <div class="roadmap-item no-break">
            <div class="roadmap-quarter">Q3</div>
            <h4>Feature Expansion</h4>
            <ul>
                <li>⏳ Mobile app beta launch</li>
                <li>⏳ Broker integrations</li>
                <li>⏳ Advanced backtesting</li>
                <li>⏳ Influencer partnerships</li>
                <li>⏳ Target: 5,000 users, 15% conversion</li>
            </ul>
        </div>
        
        <div class="roadmap-item no-break">
            <div class="roadmap-quarter">Q4</div>
            <h4>Scale & Optimize</h4>
            <ul>
                <li>⏳ API access tier launch</li>
                <li>⏳ Enterprise features</li>
                <li>⏳ International expansion</li>
                <li>⏳ ML model improvements</li>
                <li>⏳ Target: 10,000 users, 20% conversion</li>
            </ul>
        </div>
    </div>

    <!-- SECTION 7: COMPETITIVE ANALYSIS -->
    <div class="section page-break-before">
        <h2 class="section-title">Competitive Analysis</h2>
        
        <h3 class="subsection-title">Competitor Comparison</h3>
        
        <table class="competitive-table no-break">
            <thead>
                <tr>
                    <th>Feature</th>
                    <th class="us-col">AlphaVault AI</th>
                    <th>Bloomberg</th>
                    <th>Yahoo Finance</th>
                    <th>TradingView</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Pricing</strong></td>
                    <td class="us-col"><strong>$0-$20/mo</strong></td>
                    <td>$2,000+/mo</td>
                    <td>Free</td>
                    <td>$15-$60/mo</td>
                </tr>
                <tr>
                    <td>AI Chatbot</td>
                    <td class="us-col">✅</td>
                    <td>❌</td>
                    <td>❌</td>
                    <td>❌</td>
                </tr>
                <tr>
                    <td>M&A Prediction</td>
                    <td class="us-col">✅</td>
                    <td>⚠</td>
                    <td>❌</td>
                    <td>❌</td>
                </tr>
                <tr>
                    <td>Insider Flow</td>
                    <td class="us-col">✅</td>
                    <td>✅</td>
                    <td>⚠</td>
                    <td>❌</td>
                </tr>
                <tr>
                    <td>Monte Carlo</td>
                    <td class="us-col">✅</td>
                    <td>✅</td>
                    <td>❌</td>
                    <td>❌</td>
                </tr>
                <tr>
                    <td>ML Prediction</td>
                    <td class="us-col">✅</td>
                    <td>⚠</td>
                    <td>❌</td>
                    <td>⚠</td>
                </tr>
            </tbody>
        </table>

        <h3 class="subsection-title">Competitive Advantages</h3>
        
        <div class="advantage-item no-break">
            <div class="advantage-number">1</div>
            <div class="advantage-content">
                <h4>💰 Price Disruption</h4>
                <p>Bloomberg: $24,000/year | AlphaVault Platinum: $240/year (100x cheaper)</p>
            </div>
        </div>
        
        <div class="advantage-item no-break">
            <div class="advantage-number">2</div>
            <div class="advantage-content">
                <h4>🤖 AI-First Approach</h4>
                <p>Only platform with conversational AI for financial analysis + proprietary ML models</p>
            </div>
        </div>
        
        <div class="advantage-item no-break">
            <div class="advantage-number">3</div>
            <div class="advantage-content">
                <h4>🧩 All-in-One Platform</h4>
                <p>Budgeting + Analysis + Predictions + Simulations + Chatbot + Community</p>
            </div>
        </div>
        
        <div class="advantage-item no-break">
            <div class="advantage-number">4</div>
            <div class="advantage-content">
                <h4>👥 Community-Driven</h4>
                <p>Network effects: platform becomes more valuable as user base grows</p>
            </div>
        </div>
    </div>

    <!-- SECTION 8: RISK ANALYSIS -->
    <div class="section page-break-before">
        <h2 class="section-title">Risk Analysis & Mitigation</h2>
        
        <div class="risk-card no-break">
            <div class="risk-badge high">High Impact</div>
            <h4>📉 Market Risk: Prolonged Bear Market</h4>
            <p><strong>Scenario:</strong> Extended downturn reduces retail investor activity</p>
            <div class="risk-mitigation">
                <h5>🛡 Mitigation:</h5>
                <ul>
                    <li>Emphasize risk management tools (MORE valuable during volatility)</li>
                    <li>Add hedging strategies & recession-proof portfolios</li>
                    <li>Strong free tier keeps users engaged during downgrades</li>
                </ul>
            </div>
            <p class="risk-prob">Probability: Medium (30%)</p>
        </div>
        
        <div class="risk-card no-break">
            <div class="risk-badge medium">Medium Impact</div>
            <h4>🤖 Technology Risk: AI Model Accuracy</h4>
            <p><strong>Scenario:</strong> ML predictions underperform, causing user churn</p>
            <div class="risk-mitigation">
                <h5>🛡 Mitigation:</h5>
                <ul>
                    <li>Transparent communication: predictions are probabilistic</li>
                    <li>Monthly model retraining with latest data</li>
                    <li>Diversified offering: predictions are 1 of 30+ features</li>
                </ul>
            </div>
            <p class="risk-prob">Probability: Medium (40%)</p>
        </div>
        
        <div class="risk-card no-break">
            <div class="risk-badge high">High Impact</div>
            <h4>⚔ Competitive Risk: Big Tech Entry</h4>
            <p><strong>Scenario:</strong> Google/Apple launch competing platforms</p>
            <div class="risk-mitigation">
                <h5>🛡 Mitigation:</h5>
                <ul>
                    <li>Focus on advanced users (niche specialization)</li>
                    <li>Build community moat with network effects</li>
                    <li>Speed advantage: ship features monthly vs quarterly</li>
                    <li>Acquisition opportunity if we reach 50K+ users</li>
                </ul>
            </div>
            <p class="risk-prob">Probability: Low-Medium (20%)</p>
        </div>
        
        <div class="risk-card no-break">
            <div class="risk-badge medium">Medium Impact</div>
            <h4>⚖ Regulatory Risk: Financial Advice Compliance</h4>
            <p><strong>Scenario:</strong> SEC classifies AI recommendations as investment advice</p>
            <div class="risk-mitigation">
                <h5>🛡 Mitigation:</h5>
                <ul>
                    <li>Clear disclaimers: "Not financial advice. Educational purposes only."</li>
                    <li>Position as analytical tool, not advisory service</li>
                    <li>Work with fintech lawyers for compliance</li>
                    <li>Pivot option: B2B licensing to registered advisors</li>
                </ul>
            </div>
            <p class="risk-prob">Probability: Low (10%)</p>
        </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <div class="footer-title">📊 AlphaVault AI Business Plan</div>
        <div class="footer-subtitle">Confidential - For Internal Use Only</div>
        <div class="footer-date">Generated: ${today}</div>
    </div>

</body>
</html>
        `;
    }

    /**
     * ════════════════════════════════════════════════════════════════
     * SECTION SIMULATOR (OPTIONNELLE)
     * ════════════════════════════════════════════════════════════════
     */
    createSimulatorSection() {
        return `
    <div class="section page-break-before">
        <h2 class="section-title">Interactive Scenario Simulator</h2>
        
        <div class="info-box no-break">
            <h3>ℹ How to Use</h3>
            <p>This section showcases our interactive scenario modeling capabilities. The live simulator is available on the AlphaVault AI platform with real-time calculations.</p>
        </div>

        <h3 class="subsection-title">Key Parameters</h3>
        
        <div class="param-grid">
            <div class="param-card no-break">
                <div class="param-label">👥 Total Users (Year 1)</div>
                <div class="param-value">5,000</div>
                <p class="param-desc">Starting user base</p>
            </div>
            
            <div class="param-card no-break">
                <div class="param-label">📊 Conversion Rate</div>
                <div class="param-value">30%</div>
                <p class="param-desc">Free to Paid conversion</p>
            </div>
            
            <div class="param-card no-break">
                <div class="param-label">⭐ Pro Plan %</div>
                <div class="param-value">60%</div>
                <p class="param-desc">Of paid users</p>
            </div>
            
            <div class="param-card no-break">
                <div class="param-label">📈 YoY Growth</div>
                <div class="param-value">200%</div>
                <p class="param-desc">Year-over-year</p>
            </div>
            
            <div class="param-card no-break">
                <div class="param-label">💰 CAC</div>
                <div class="param-value">$25</div>
                <p class="param-desc">Customer acquisition cost</p>
            </div>
            
            <div class="param-card no-break">
                <div class="param-label">📉 Churn Rate</div>
                <div class="param-value">5%</div>
                <p class="param-desc">Monthly churn</p>
            </div>
        </div>

        <h3 class="subsection-title">Simulation Results (Base Case)</h3>
        
        <div class="sim-results">
            <div class="sim-card no-break">
                <div class="sim-icon">💰</div>
                <div class="sim-label">Year 1 MRR</div>
                <div class="sim-value">$21,000</div>
            </div>
            
            <div class="sim-card no-break">
                <div class="sim-icon">📅</div>
                <div class="sim-label">Year 1 ARR</div>
                <div class="sim-value">$252,000</div>
            </div>
            
            <div class="sim-card no-break">
                <div class="sim-icon">🎯</div>
                <div class="sim-label">Year 5 ARR</div>
                <div class="sim-value">$5.67M</div>
            </div>
            
            <div class="sim-card no-break">
                <div class="sim-icon">📊</div>
                <div class="sim-label">LTV:CAC Ratio</div>
                <div class="sim-value">14.7:1</div>
            </div>
        </div>

        <h3 class="subsection-title">Pre-Configured Scenarios</h3>
        
        <div class="scenario-card conservative no-break">
            <div class="scenario-header">
                <span class="scenario-icon">🐢</span>
                <h4>Conservative Growth</h4>
            </div>
            <div class="scenario-params">
                <p>Total Users Y1: 3,000</p>
                <p>Conversion: 20%</p>
                <p>Growth: 150%</p>
                <p>CAC: $35</p>
            </div>
            <p class="scenario-result"><strong>Year 5 ARR:</strong> $2.8M</p>
        </div>
        
        <div class="scenario-card base no-break">
            <div class="scenario-header">
                <span class="scenario-icon">⚖</span>
                <h4>Base Case (Default)</h4>
            </div>
            <div class="scenario-params">
                <p>Total Users Y1: 5,000</p>
                <p>Conversion: 30%</p>
                <p>Growth: 200%</p>
                <p>CAC: $25</p>
            </div>
            <p class="scenario-result"><strong>Year 5 ARR:</strong> $5.67M</p>
        </div>
        
        <div class="scenario-card aggressive no-break">
            <div class="scenario-header">
                <span class="scenario-icon">🚀</span>
                <h4>Aggressive Growth</h4>
            </div>
            <div class="scenario-params">
                <p>Total Users Y1: 10,000</p>
                <p>Conversion: 40%</p>
                <p>Growth: 300%</p>
                <p>CAC: $20</p>
            </div>
            <p class="scenario-result"><strong>Year 5 ARR:</strong> $18.5M</p>
        </div>
    </div>
        `;
    }

    /**
     * ════════════════════════════════════════════════════════════════
     * CSS OPTIMISÉ POUR PDF PROFESSIONNEL
     * ════════════════════════════════════════════════════════════════
     */
    getBusinessPlanCSS() {
        return `
            /* RESET & BASE */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            body {
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #1e293b;
                background: white;
            }

            /* UTILITY CLASSES */
            .page-break-before { page-break-before: always; }
            .page-break-after { page-break-after: always; }
            .no-break { 
                page-break-inside: avoid;
                break-inside: avoid;
            }

            /* COVER PAGE */
            .cover-page {
                height: 297mm;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 60px 40px;
            }

            .cover-content {
                max-width: 600px;
            }

            .cover-logo {
                margin-bottom: 40px;
            }

            .cover-title {
                font-size: 48pt;
                font-weight: 900;
                margin-bottom: 16px;
                letter-spacing: -1px;
            }

            .cover-subtitle {
                font-size: 20pt;
                font-weight: 600;
                margin-bottom: 40px;
                opacity: 0.95;
            }

            .cover-tagline {
                background: rgba(255,255,255,0.15);
                padding: 20px 28px;
                border-radius: 12px;
                font-size: 14pt;
                line-height: 1.6;
                margin-bottom: 40px;
                border: 1px solid rgba(255,255,255,0.2);
            }

            .cover-meta {
                margin-top: 60px;
                padding-top: 30px;
                border-top: 2px solid rgba(255,255,255,0.3);
            }

            .meta-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 11pt;
            }

            .meta-label {
                opacity: 0.8;
            }

            .meta-value {
                font-weight: 700;
            }

            /* SECTIONS */
            .section {
                padding: 20mm 20mm;
            }

            .section-title {
                font-size: 20pt;
                font-weight: 800;
                color: #667eea;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 3px solid #667eea;
            }

            .subsection-title {
                font-size: 14pt;
                font-weight: 700;
                color: #1e293b;
                margin: 20px 0 12px 0;
                padding-bottom: 6px;
                border-bottom: 2px solid #e2e8f0;
            }

            h4 {
                font-size: 12pt;
                font-weight: 700;
                margin: 12px 0 8px 0;
            }

            p {
                margin-bottom: 10px;
                line-height: 1.7;
            }

            ul {
                margin: 10px 0;
                padding-left: 20px;
            }

            li {
                margin-bottom: 6px;
                line-height: 1.6;
            }

            /* BOXES */
            .mission-box,
            .info-box {
                background: #f8fafc;
                border-left: 4px solid #667eea;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }

            .box-title {
                font-size: 12pt;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 10px;
            }

            .mission-text {
                font-size: 11pt;
                line-height: 1.8;
                color: #1e293b;
            }

            /* CARDS GRID */
            .highlights-grid,
            .market-cards,
            .ltv-cards,
            .projection-summary,
            .sim-results,
            .param-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin: 16px 0;
            }

            .highlight-card,
            .market-card,
            .calc-card,
            .proj-card,
            .sim-card,
            .param-card {
                background: #f8fafc;
                border: 2px solid #667eea;
                border-radius: 10px;
                padding: 14px;
                text-align: center;
            }

            .card-icon,
            .proj-icon,
            .sim-icon {
                font-size: 24pt;
                margin-bottom: 8px;
            }

            .card-label,
            .proj-label,
            .sim-label,
            .param-label {
                font-size: 9pt;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                margin-bottom: 6px;
            }

            .card-value,
            .proj-value,
            .sim-value,
            .param-value,
            .market-value {
                font-size: 18pt;
                font-weight: 800;
                color: #667eea;
                margin: 6px 0;
            }

            .card-desc,
            .proj-desc,
            .param-desc,
            .market-label,
            .market-growth {
                font-size: 9pt;
                color: #64748b;
                line-height: 1.4;
            }

            .market-header {
                font-size: 11pt;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 8px;
            }

            /* SEGMENT CARDS */
            .segment-card {
                background: #f8fafc;
                border: 2px solid #667eea;
                border-radius: 10px;
                padding: 14px;
                margin-bottom: 12px;
            }

            .segment-title {
                font-size: 12pt;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 10px;
            }

            .segment-stats {
                margin: 10px 0;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid #e2e8f0;
                font-size: 9pt;
            }

            /* PRICING CARDS */
            .pricing-card {
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
                position: relative;
            }

            .pricing-card.featured {
                border-color: #667eea;
                background: #f8fafc;
            }

            .pricing-card.premium {
                border-color: #764ba2;
                background: #faf5ff;
            }

            .pricing-badge {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: #667eea;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 9pt;
                font-weight: 700;
            }

            .pricing-header {
                text-align: center;
                margin-bottom: 12px;
            }

            .pricing-icon {
                font-size: 28pt;
                margin-bottom: 8px;
            }

            .pricing-price {
                font-size: 28pt;
                font-weight: 800;
                color: #667eea;
                margin: 8px 0;
            }

            .pricing-price span {
                font-size: 12pt;
                color: #64748b;
            }

            .pricing-features {
                margin: 12px 0;
            }

            .feature {
                padding: 6px 0;
                border-bottom: 1px solid #e2e8f0;
                font-size: 10pt;
            }

            .feature.disabled {
                color: #cbd5e1;
            }

            .pricing-target {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 2px solid #e2e8f0;
                font-size: 9pt;
                color: #64748b;
                text-align: center;
            }

            /* TABLES */
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
                font-size: 10pt;
            }

            thead th {
                background: #667eea;
                color: white;
                padding: 10px 8px;
                font-weight: 700;
                text-align: left;
                border: 1px solid #667eea;
            }

            tbody td {
                padding: 8px;
                border: 1px solid #e2e8f0;
            }

            tbody tr:nth-child(even) {
                background: #f8fafc;
            }

            .highlight-row td {
                background: #e0e7ff !important;
                font-weight: 700;
                color: #667eea;
            }

            .total-row td {
                background: #dbeafe !important;
                font-weight: 700;
                color: #1e293b;
            }

            .competitive-table .us-col {
                background: #d1fae5 !important;
                color: #059669;
                font-weight: 700;
            }

            /* VALUE ITEMS */
            .value-list {
                margin: 16px 0;
            }

            .value-item,
            .advantage-item {
                display: flex;
                gap: 12px;
                margin-bottom: 12px;
                padding: 12px;
                background: #f8fafc;
                border-left: 4px solid #667eea;
                border-radius: 8px;
            }

            .value-number,
            .advantage-number {
                width: 36px;
                height: 36px;
                background: #667eea;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16pt;
                font-weight: 800;
                flex-shrink: 0;
            }

            .value-content h4,
            .advantage-content h4 {
                margin-bottom: 6px;
            }

            /* ROADMAP */
            .roadmap-item {
                background: #f8fafc;
                border-left: 4px solid #667eea;
                border-radius: 8px;
                padding: 14px;
                margin-bottom: 12px;
            }

            .roadmap-quarter {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 10pt;
                margin-bottom: 8px;
            }

            /* RATIO BOX */
            .ratio-box {
                background: #d1fae5;
                border: 2px solid #059669;
                border-radius: 12px;
                padding: 16px;
                margin: 16px 0;
            }

            .ratio-header {
                font-size: 12pt;
                font-weight: 700;
                color: #059669;
                margin-bottom: 10px;
                text-align: center;
            }

            .ratio-value {
                font-size: 32pt;
                font-weight: 900;
                color: #059669;
                text-align: center;
                margin: 10px 0;
            }

            .ratio-calc {
                font-size: 10pt;
                color: #64748b;
                text-align: center;
                margin-bottom: 10px;
            }

            .ratio-verdict {
                font-size: 11pt;
                padding: 10px;
                background: rgba(5,150,105,0.15);
                border-radius: 8px;
                text-align: center;
            }

            .benchmarks {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 2px solid rgba(5,150,105,0.3);
            }

            .benchmarks h4 {
                margin-bottom: 8px;
                color: #059669;
            }

            .benchmarks p {
                padding: 6px 0;
                font-size: 10pt;
                border-bottom: 1px solid #e2e8f0;
            }

            .highlight-text {
                background: rgba(255,215,0,0.2);
                padding: 8px;
                border-radius: 6px;
                font-weight: 700;
                border: none !important;
            }

            /* PAYBACK BOX */
            .payback-box {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin: 16px 0;
            }

            .calc-card.highlight {
                background: #e0e7ff;
                border-color: #667eea;
            }

            .calc-formula {
                font-size: 10pt;
                color: #64748b;
                margin: 8px 0;
                font-style: italic;
            }

            .calc-result {
                font-size: 16pt;
                font-weight: 800;
                color: #667eea;
                margin-top: 8px;
            }

            /* RISK CARDS */
            .risk-card {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 8px;
                padding: 14px;
                margin-bottom: 12px;
            }

            .risk-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 9pt;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .risk-badge.high {
                background: #ef4444;
                color: white;
            }

            .risk-badge.medium {
                background: #f59e0b;
                color: white;
            }

            .risk-mitigation {
                background: white;
                padding: 10px;
                border-radius: 6px;
                margin: 10px 0;
            }

            .risk-mitigation h5 {
                color: #667eea;
                font-size: 10pt;
                margin-bottom: 6px;
            }

            .risk-prob {
                font-size: 9pt;
                font-weight: 600;
                color: #64748b;
                margin-top: 8px;
            }

            /* SCENARIO CARDS */
            .scenario-card {
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                padding: 14px;
                margin-bottom: 12px;
            }

            .scenario-card.conservative {
                border-color: #f59e0b;
                background: #fef3c7;
            }

            .scenario-card.base {
                border-color: #667eea;
                background: #f8fafc;
            }

            .scenario-card.aggressive {
                border-color: #059669;
                background: #d1fae5;
            }

            .scenario-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }

            .scenario-icon {
                font-size: 20pt;
            }

            .scenario-params {
                margin: 10px 0;
                font-size: 9pt;
                color: #64748b;
            }

            .scenario-params p {
                padding: 4px 0;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            }

            .scenario-result {
                margin-top: 10px;
                padding: 8px;
                background: rgba(102,126,234,0.15);
                border-radius: 6px;
                font-size: 10pt;
                text-align: center;
            }

            /* FOOTER */
            .footer {
                margin-top: 40px;
                padding: 20px;
                text-align: center;
                background: #f8fafc;
                border-radius: 10px;
                border-top: 3px solid #667eea;
            }

            .footer-title {
                font-size: 12pt;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 6px;
            }

            .footer-subtitle {
                font-size: 10pt;
                color: #64748b;
                margin-bottom: 6px;
            }

            .footer-date {
                font-size: 9pt;
                color: #94a3b8;
            }

            /* PRINT OPTIMIZATION */
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .no-break {
                    page-break-inside: avoid !important;
                }
            }
        `;
    }
}

// ✅ INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('📄 ✅ Business Plan PDF Exporter v10.0 (Optimized) initialized');
});