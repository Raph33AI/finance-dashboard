/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN PDF EXPORTER v11.0 (html2pdf.js)
 * Version corrigée - Pagination optimale sans rogner le contenu
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

    async sendPDF() {
        try {
            console.log('Initiating PDF export...');
            
            const emails = this.getEmails();
            if (emails.length === 0) {
                this.showNotification('No recipients', 'Please enter at least one email address.', 'warning');
                return;
            }

            const subject = document.getElementById('emailSubject').value.trim();
            const message = document.getElementById('emailMessage').value.trim();
            const includeSimulator = document.getElementById('includeSimulator').checked;

            this.showProgress(0, 'Preparing document...');

            const htmlContent = this.createBusinessPlanHTML(includeSimulator);
            console.log('HTML length:', htmlContent.length, 'characters');

            this.showProgress(20, 'Generating PDF...');

            const pdfBlob = await this.generatePDFWithHtml2Pdf(htmlContent);
            console.log('PDF Blob size:', pdfBlob.size, 'bytes');
            
            if (pdfBlob.size < 5000) {
                console.warn('PDF size is suspiciously small!');
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'debug-blank-pdf.pdf';
                a.click();
                URL.revokeObjectURL(url);
                throw new Error('Generated PDF is too small (probably blank).');
            }

            this.showProgress(60, 'Converting to Base64...');
            const pdfBase64 = await this.blobToBase64(pdfBlob);

            this.showProgress(70, 'Sending to server...');

            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails, subject, message, pdfBase64 })
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
            this.showNotification('PDF Sent!', `Sent to ${emails.length} recipient(s).`, 'success');

        } catch (error) {
            console.error('PDF Error:', error);
            this.hideProgress();
            this.showNotification('Error', error.message, 'error');
        }
    }

    /**
     * GÉNÉRER PDF AVEC html2pdf.js (VERSION CORRIGÉE)
     */
    async generatePDFWithHtml2Pdf(htmlContent) {
        console.log('Creating temporary container...');
        
        // Créer un conteneur avec largeur fixe A4
        const container = document.createElement('div');
        container.id = 'pdf-temp-container';
        container.style.cssText = `
            position: fixed;
            top: -10000px;
            left: 0;
            width: 794px;
            background: white;
            z-index: -9999;
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.cssText = `
            width: 794px;
            background: white;
            margin: 0;
            padding: 0;
        `;
        
        container.appendChild(tempDiv);
        document.body.appendChild(container);

        try {
            await this.wait(300);

            console.log('Generating PDF with html2pdf.js...');

            // OPTIONS OPTIMISÉES
            const options = {
                margin: [10, 10, 10, 10],
                filename: `AlphaVault_BusinessPlan_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { 
                    type: 'jpeg', 
                    quality: 0.98 
                },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    width: 794,
                    height: 1123,
                    windowWidth: 794,
                    letterRendering: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    scrollX: 0,
                    scrollY: 0,
                    x: 0,
                    y: 0
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy']
                }
            };

            const pdfBlob = await html2pdf()
                .set(options)
                .from(tempDiv)
                .toPdf()
                .output('blob');

            console.log('PDF generated successfully:', pdfBlob.size, 'bytes');

            return pdfBlob;

        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        } finally {
            setTimeout(() => {
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
            }, 500);
        }
    }

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
     * CRÉATION DU HTML SIMPLIFIÉ (COMPATIBLE PDF)
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
        <div class="cover-page">
            <div style="text-align: center; padding: 80px 40px;">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 120px; height: 120px; margin-bottom: 30px;">
                    <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" 
                        stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="30" cy="70" r="6" fill="white"/>
                    <circle cx="50" cy="60" r="6" fill="white"/>
                    <circle cx="70" cy="45" r="6" fill="white"/>
                    <circle cx="90" cy="30" r="7" fill="white"/>
                </svg>
                
                <h1 style="font-size: 48px; font-weight: 900; margin: 0 0 16px 0; color: white;">AlphaVault AI</h1>
                <p style="font-size: 24px; font-weight: 700; margin: 0 0 30px 0; color: white; opacity: 0.95;">AI-Powered Financial Intelligence Platform</p>
                
                <div style="max-width: 550px; margin: 0 auto 40px; padding: 18px 24px; background: rgba(255,255,255,0.15); border-radius: 12px; font-size: 16px; color: white; line-height: 1.6;">
                    Empowering Individual Investors with<br>Institutional-Grade Analytics
                </div>
                
                <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid rgba(255,255,255,0.3);">
                    <table style="width: 100%; max-width: 600px; margin: 0 auto; color: white; font-size: 14px;">
                        <tr>
                            <td style="padding: 8px; text-align: left;"><strong>Document:</strong> Business Plan v3.0</td>
                            <td style="padding: 8px; text-align: right;"><strong>Date:</strong> ${today}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: left;"><strong>Market:</strong> Global - Cloud-Based</td>
                            <td style="padding: 8px; text-align: right;"><strong>Status:</strong> Confidential</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <!-- SECTION 1: EXECUTIVE SUMMARY -->
        <div class="section">
            <h2 class="section-title">Executive Summary</h2>
            
            <div class="box-highlight">
                <h3 style="margin: 0 0 12px 0; font-size: 18px;">Mission Statement</h3>
                <p style="margin: 0; font-size: 15px; line-height: 1.7;">
                    To democratize institutional-grade financial intelligence by providing individual investors 
                    with AI-powered analytics, predictive models, and real-time market insights through an 
                    accessible, affordable, and user-friendly SaaS platform.
                </p>
            </div>

            <h3 class="subsection-title">Key Highlights</h3>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell">
                        <div class="card-icon">USERS</div>
                        <div class="card-label">Target Market</div>
                        <div class="card-value">$12.5B+</div>
                        <div class="card-desc">Global retail investment analytics market (2024)</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-icon">CHART</div>
                        <div class="card-label">Revenue Model</div>
                        <div class="card-value">Freemium SaaS</div>
                        <div class="card-desc">3 tiers: Basic (Free), Pro ($10/mo), Platinum ($20/mo)</div>
                    </td>
                </tr>
                <tr>
                    <td class="grid-cell">
                        <div class="card-icon">AI</div>
                        <div class="card-label">Core Technology</div>
                        <div class="card-value">AI + ML</div>
                        <div class="card-desc">Gemini AI, predictive algorithms, real-time analytics</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-icon">ROCKET</div>
                        <div class="card-label">5-Year Goal</div>
                        <div class="card-value">100K Users</div>
                        <div class="card-desc">$12M ARR with 15% paid conversion rate</div>
                    </td>
                </tr>
            </table>

            <h3 class="subsection-title">Value Proposition</h3>
            
            <div class="value-prop">
                <div class="vp-number">1</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">Institutional-Grade Tools for Individual Investors</h4>
                    <p style="margin: 0;">Advanced M&A prediction, insider flow tracking, ML-powered trend analysis, Monte Carlo simulations, and risk parity optimization—previously only available to hedge funds and professional traders.</p>
                </div>
            </div>
            
            <div class="value-prop">
                <div class="vp-number">2</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">AI-Powered Financial Chatbot</h4>
                    <p style="margin: 0;">FinanceGPT provides instant answers to complex financial questions, generates custom analyses, and offers personalized investment recommendations 24/7.</p>
                </div>
            </div>
            
            <div class="value-prop">
                <div class="vp-number">3</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">Affordable Freemium Pricing</h4>
                    <p style="margin: 0;">Free tier provides basic analytics. Pro plan ($10/mo) unlocks advanced features. Platinum ($20/mo) includes AI chatbot and premium tools—10x cheaper than Bloomberg Terminal.</p>
                </div>
            </div>
            
            <div class="value-prop">
                <div class="vp-number">4</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">Real-Time Data & Automation</h4>
                    <p style="margin: 0;">Live market data, automated newsletters, instant alerts, and seamless integrations with Stripe, Firebase, and Cloudflare infrastructure for 99.9% uptime.</p>
                </div>
            </div>
        </div>

        <!-- SECTION 2: MARKET ANALYSIS -->
        <div class="section">
            <h2 class="section-title">Market Analysis</h2>
            
            <h3 class="subsection-title">Total Addressable Market (TAM)</h3>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell">
                        <div class="card-label">TAM</div>
                        <div class="card-value">$12.5B</div>
                        <div class="card-desc">Global Retail Investment Analytics Market</div>
                        <div class="card-growth">+18.5% CAGR (2024-2029)</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">SAM</div>
                        <div class="card-value">$3.2B</div>
                        <div class="card-desc">Serviceable Available Market</div>
                        <div class="card-growth">~25% of TAM</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">SOM</div>
                        <div class="card-value">$160M</div>
                        <div class="card-desc">Serviceable Obtainable Market</div>
                        <div class="card-growth">5% of SAM (5-year target)</div>
                    </td>
                </tr>
            </table>

            <h3 class="subsection-title">Target Customer Segments</h3>
            
            <div class="segment-box">
                <h4>Millennial/Gen Z Investors</h4>
                <table class="stat-table">
                    <tr><td>Age Range:</td><td><strong>25-40 years</strong></td></tr>
                    <tr><td>Portfolio Size:</td><td><strong>$5K - $100K</strong></td></tr>
                    <tr><td>Tech Savviness:</td><td><strong>High</strong></td></tr>
                    <tr><td>% of Market:</td><td><strong>45%</strong></td></tr>
                </table>
                <p>Digital natives seeking advanced tools to outperform traditional advisors. Comfortable with SaaS subscriptions, value AI/ML capabilities.</p>
            </div>
            
            <div class="segment-box">
                <h4>Active Day Traders</h4>
                <table class="stat-table">
                    <tr><td>Age Range:</td><td><strong>30-55 years</strong></td></tr>
                    <tr><td>Trading Frequency:</td><td><strong>Daily</strong></td></tr>
                    <tr><td>Data Needs:</td><td><strong>Real-time</strong></td></tr>
                    <tr><td>% of Market:</td><td><strong>30%</strong></td></tr>
                </table>
                <p>Require technical indicators, insider flow data, M&A predictions. Willing to pay premium for edge in market movements.</p>
            </div>
            
            <div class="segment-box">
                <h4>Long-Term Investors</h4>
                <table class="stat-table">
                    <tr><td>Age Range:</td><td><strong>35-65 years</strong></td></tr>
                    <tr><td>Investment Horizon:</td><td><strong>5-20 years</strong></td></tr>
                    <tr><td>Focus:</td><td><strong>Portfolio optimization</strong></td></tr>
                    <tr><td>% of Market:</td><td><strong>25%</strong></td></tr>
                </table>
                <p>Value Monte Carlo simulations, risk parity tools, scenario analysis for retirement planning and wealth preservation.</p>
            </div>
        </div>

        <!-- SECTION 3: BUSINESS MODEL -->
        <div class="section">
            <h2 class="section-title">Business Model</h2>
            
            <h3 class="subsection-title">Pricing Strategy</h3>
            
            <table class="pricing-table">
                <tr>
                    <td class="pricing-cell">
                        <div class="pricing-header">
                            <div class="pricing-icon">BASIC</div>
                            <h3 style="margin: 8px 0;">Basic</h3>
                            <div class="pricing-price">$0<span>/mo</span></div>
                        </div>
                        <div class="pricing-features">
                            <div>[OK] Basic stock analysis</div>
                            <div>[OK] Real-time quotes (15min delay)</div>
                            <div>[OK] Budget dashboard</div>
                            <div>[OK] News terminal (basic)</div>
                            <div class="disabled">[X] Advanced analytics</div>
                            <div class="disabled">[X] AI chatbot</div>
                        </div>
                        <div class="pricing-target"><strong>Target:</strong> 70% of users remain free</div>
                    </td>
                    <td class="pricing-cell featured">
                        <div class="pricing-badge">Most Popular</div>
                        <div class="pricing-header">
                            <div class="pricing-icon">PRO</div>
                            <h3 style="margin: 8px 0;">Pro</h3>
                            <div class="pricing-price">$10<span>/mo</span></div>
                        </div>
                        <div class="pricing-features">
                            <div>[OK] Everything in Basic</div>
                            <div>[OK] Advanced technical analysis</div>
                            <div>[OK] M&A predictor</div>
                            <div>[OK] Insider flow tracker</div>
                            <div>[OK] Monte Carlo simulation</div>
                            <div>[OK] Real-time alerts</div>
                        </div>
                        <div class="pricing-target"><strong>Target:</strong> 20% upgrade to Pro</div>
                    </td>
                    <td class="pricing-cell premium">
                        <div class="pricing-badge">Premium</div>
                        <div class="pricing-header">
                            <div class="pricing-icon">PLATINUM</div>
                            <h3 style="margin: 8px 0;">Platinum</h3>
                            <div class="pricing-price">$20<span>/mo</span></div>
                        </div>
                        <div class="pricing-features">
                            <div>[OK] Everything in Pro</div>
                            <div>[OK] AI Chatbot - Unlimited</div>
                            <div>[OK] Trend prediction (ML)</div>
                            <div>[OK] Analyst coverage reports</div>
                            <div>[OK] Custom portfolio scenarios</div>
                            <div>[OK] Priority support</div>
                        </div>
                        <div class="pricing-target"><strong>Target:</strong> 10% upgrade to Platinum</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- SECTION 4: FINANCIAL PROJECTIONS -->
        <div class="section">
            <h2 class="section-title">Financial Projections (5-Year)</h2>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell">
                        <div class="card-label">Year 5 ARR</div>
                        <div class="card-value">$12.0M</div>
                        <div class="card-growth">+285% CAGR</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Total Users (Year 5)</div>
                        <div class="card-value">100,000</div>
                        <div class="card-growth">15,000 paid subscribers</div>
                    </td>
                </tr>
                <tr>
                    <td class="grid-cell">
                        <div class="card-label">Gross Margin (Year 5)</div>
                        <div class="card-value">82%</div>
                        <div class="card-growth">SaaS economics</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">EBITDA (Year 5)</div>
                        <div class="card-value">$2.8M</div>
                        <div class="card-growth">23% margin</div>
                    </td>
                </tr>
            </table>

            <h3 class="subsection-title">5-Year Revenue Projection</h3>
            
            <table class="data-table">
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
                        <td><strong>Paid Users</strong></td>
                        <td>1,500</td>
                        <td>4,500</td>
                        <td>10,500</td>
                        <td>19,500</td>
                        <td>30,000</td>
                    </tr>
                    <tr class="highlight">
                        <td><strong>MRR</strong></td>
                        <td><strong>$21K</strong></td>
                        <td><strong>$63K</strong></td>
                        <td><strong>$147K</strong></td>
                        <td><strong>$273K</strong></td>
                        <td><strong>$420K</strong></td>
                    </tr>
                    <tr class="highlight">
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
                    <tr class="total">
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
            
            <table class="data-table">
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
                    <tr><td>Infrastructure</td><td>$12K</td><td>$30K</td><td>$60K</td><td>$100K</td><td>$150K</td></tr>
                    <tr><td>API Costs</td><td>$8K</td><td>$20K</td><td>$40K</td><td>$70K</td><td>$100K</td></tr>
                    <tr><td>Marketing & Ads</td><td>$60K</td><td>$150K</td><td>$300K</td><td>$500K</td><td>$750K</td></tr>
                    <tr><td>Salaries (Team)</td><td>$80K</td><td>$200K</td><td>$400K</td><td>$700K</td><td>$1.2M</td></tr>
                    <tr><td>Support & Operations</td><td>$10K</td><td>$25K</td><td>$50K</td><td>$80K</td><td>$120K</td></tr>
                    <tr><td>Legal & Compliance</td><td>$15K</td><td>$20K</td><td>$30K</td><td>$40K</td><td>$50K</td></tr>
                    <tr class="total">
                        <td><strong>Total Expenses</strong></td>
                        <td><strong>$185K</strong></td>
                        <td><strong>$445K</strong></td>
                        <td><strong>$880K</strong></td>
                        <td><strong>$1.49M</strong></td>
                        <td><strong>$2.37M</strong></td>
                    </tr>
                    <tr class="highlight">
                        <td><strong>EBITDA</strong></td>
                        <td><strong>$92K</strong></td>
                        <td><strong>$401K</strong></td>
                        <td><strong>$1.10M</strong></td>
                        <td><strong>$2.20M</strong></td>
                        <td><strong>$3.30M</strong></td>
                    </tr>
                    <tr class="highlight">
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
        <div class="section">
            <h2 class="section-title">Unit Economics & Key Metrics</h2>
            
            <h3 class="subsection-title">Customer Lifetime Value (LTV)</h3>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px;">Average Revenue Per User (ARPU)</h4>
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">ARPU = (60% × $10) + (40% × $20)</div>
                        <div class="card-value">$14/month</div>
                    </td>
                    <td class="grid-cell">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px;">Average Customer Lifespan</h4>
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Lifespan = 1 / 5% Monthly Churn</div>
                        <div class="card-value">20 months</div>
                    </td>
                    <td class="grid-cell highlight">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px;">Lifetime Value (LTV)</h4>
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">LTV = $14 × 20 months</div>
                        <div class="card-value">$280</div>
                    </td>
                </tr>
            </table>

            <h3 class="subsection-title">Customer Acquisition Cost (CAC)</h3>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Channel</th>
                        <th>Cost Per Acquisition</th>
                        <th>% of Acquisitions</th>
                        <th>Weighted CAC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>SEO & Content</td><td>$10</td><td>30%</td><td>$3.00</td></tr>
                    <tr><td>Paid Social</td><td>$35</td><td>25%</td><td>$8.75</td></tr>
                    <tr><td>Referral Program</td><td>$15</td><td>20%</td><td>$3.00</td></tr>
                    <tr><td>Influencer Partnerships</td><td>$25</td><td>15%</td><td>$3.75</td></tr>
                    <tr><td>Organic</td><td>$5</td><td>10%</td><td>$0.50</td></tr>
                    <tr class="total">
                        <td><strong>Blended CAC</strong></td>
                        <td colspan="2"></td>
                        <td><strong>$19.00</strong></td>
                    </tr>
                </tbody>
            </table>

            <h3 class="subsection-title">LTV:CAC Ratio Analysis</h3>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell ratio-success">
                        <div style="font-size: 16px; font-weight: 700; color: #10b981; margin-bottom: 12px;">AlphaVault AI LTV:CAC</div>
                        <div style="font-size: 42px; font-weight: 900; color: #10b981; margin: 12px 0;">14.7:1</div>
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 12px;">$280 LTV / $19 CAC</div>
                        <div style="font-size: 14px; padding: 10px; background: rgba(16,185,129,0.15); border-radius: 8px;"><strong>Excellent</strong> - Well above 3:1 benchmark</div>
                    </td>
                    <td class="grid-cell">
                        <h4 style="margin: 0 0 12px 0;">Industry Benchmarks</h4>
                        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px;">[X] Poor (&lt; 1:1) - Unsustainable</div>
                        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px;">[!] Fair (1:1 to 3:1) - Break-even</div>
                        <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px;">[OK] Good (3:1 to 5:1) - Healthy</div>
                        <div style="padding: 10px; background: rgba(255,215,0,0.15); border-radius: 8px; margin-top: 8px; font-size: 13px; font-weight: 700;">[STAR] Excellent (&gt; 5:1) - AlphaVault: 14.7:1</div>
                    </td>
                </tr>
            </table>

            <h3 class="subsection-title">Payback Period</h3>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell">
                        <h4 style="margin: 0 0 8px 0;">Calculation</h4>
                        <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">Payback = $19 / ($14 × 0.85)</div>
                        <div class="card-value">1.6 months</div>
                    </td>
                    <td class="grid-cell">
                        <h4 style="margin: 0 0 8px 0;">Industry Standard</h4>
                        <p style="margin: 8px 0; font-size: 13px;">Best-in-class SaaS: &lt; 12 months</p>
                        <p style="margin: 8px 0; font-size: 14px; font-weight: 700; color: #10b981;">AlphaVault AI: 1.6 months — Exceptional capital efficiency!</p>
                    </td>
                </tr>
            </table>
        </div>

        <!-- SECTION 6: GROWTH STRATEGY -->
        <div class="section">
            <h2 class="section-title">Growth Strategy & Roadmap</h2>
            
            <h3 class="subsection-title">18-Month Product Roadmap</h3>
            
            <div class="roadmap-item">
                <div class="roadmap-quarter">Q1</div>
                <h4>Foundation & Launch</h4>
                <ul>
                    <li>[OK] Core platform launch</li>
                    <li>[OK] Freemium model activation</li>
                    <li>[...] SEO optimization (50+ blog posts)</li>
                    <li>[...] Social media presence</li>
                    <li>[...] First 500 users milestone</li>
                </ul>
            </div>
            
            <div class="roadmap-item">
                <div class="roadmap-quarter">Q2</div>
                <h4>User Growth & Engagement</h4>
                <ul>
                    <li>[...] Paid ads campaign ($5K/month)</li>
                    <li>[...] Referral program</li>
                    <li>[...] Mobile app development start</li>
                    <li>[...] Community hub enhancements</li>
                    <li>[...] Target: 2,000 users, 10% conversion</li>
                </ul>
            </div>
            
            <div class="roadmap-item">
                <div class="roadmap-quarter">Q3</div>
                <h4>Feature Expansion</h4>
                <ul>
                    <li>[...] Mobile app beta launch</li>
                    <li>[...] Broker integrations</li>
                    <li>[...] Advanced backtesting</li>
                    <li>[...] Influencer partnerships</li>
                    <li>[...] Target: 5,000 users, 15% conversion</li>
                </ul>
            </div>
            
            <div class="roadmap-item">
                <div class="roadmap-quarter">Q4</div>
                <h4>Scale & Optimize</h4>
                <ul>
                    <li>[...] API access tier launch</li>
                    <li>[...] Enterprise features</li>
                    <li>[...] International expansion</li>
                    <li>[...] ML model improvements</li>
                    <li>[...] Target: 10,000 users, 20% conversion</li>
                </ul>
            </div>
        </div>

        <!-- SECTION 7: COMPETITIVE ANALYSIS -->
        <div class="section">
            <h2 class="section-title">Competitive Analysis</h2>
            
            <h3 class="subsection-title">Competitor Comparison</h3>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th class="us">AlphaVault AI</th>
                        <th>Bloomberg</th>
                        <th>Yahoo Finance</th>
                        <th>TradingView</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Pricing</strong></td>
                        <td class="us"><strong>$0-$20/mo</strong></td>
                        <td>$2,000+/mo</td>
                        <td>Free</td>
                        <td>$15-$60/mo</td>
                    </tr>
                    <tr>
                        <td>AI Chatbot</td>
                        <td class="us">[OK]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>M&A Prediction</td>
                        <td class="us">[OK]</td>
                        <td>[~]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>Insider Flow</td>
                        <td class="us">[OK]</td>
                        <td>[OK]</td>
                        <td>[~]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>Monte Carlo</td>
                        <td class="us">[OK]</td>
                        <td>[OK]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>ML Prediction</td>
                        <td class="us">[OK]</td>
                        <td>[~]</td>
                        <td>[X]</td>
                        <td>[~]</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="subsection-title">Competitive Advantages</h3>
            
            <div class="value-prop">
                <div class="vp-number">1</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">Price Disruption</h4>
                    <p style="margin: 0;">Bloomberg: $24,000/year | AlphaVault Platinum: $240/year (100x cheaper)</p>
                </div>
            </div>
            
            <div class="value-prop">
                <div class="vp-number">2</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">AI-First Approach</h4>
                    <p style="margin: 0;">Only platform with conversational AI for financial analysis + proprietary ML models</p>
                </div>
            </div>
            
            <div class="value-prop">
                <div class="vp-number">3</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">All-in-One Platform</h4>
                    <p style="margin: 0;">Budgeting + Analysis + Predictions + Simulations + Chatbot + Community</p>
                </div>
            </div>
            
            <div class="value-prop">
                <div class="vp-number">4</div>
                <div>
                    <h4 style="margin: 0 0 8px 0;">Community-Driven</h4>
                    <p style="margin: 0;">Network effects: platform becomes more valuable as user base grows</p>
                </div>
            </div>
        </div>

        <!-- SECTION 8: RISK ANALYSIS -->
        <div class="section">
            <h2 class="section-title">Risk Analysis & Mitigation</h2>
            
            <div class="risk-card">
                <div class="risk-severity high">High Impact</div>
                <h4>Market Risk: Prolonged Bear Market</h4>
                <p><strong>Scenario:</strong> Extended downturn reduces retail investor activity</p>
                <div class="risk-mitigation">
                    <h5>Mitigation:</h5>
                    <ul>
                        <li>Emphasize risk management tools (MORE valuable during volatility)</li>
                        <li>Add hedging strategies & recession-proof portfolios</li>
                        <li>Strong free tier keeps users engaged during downgrades</li>
                    </ul>
                </div>
                <div class="risk-prob">Probability: Medium (30%)</div>
            </div>
            
            <div class="risk-card">
                <div class="risk-severity medium">Medium Impact</div>
                <h4>Technology Risk: AI Model Accuracy</h4>
                <p><strong>Scenario:</strong> ML predictions underperform, causing user churn</p>
                <div class="risk-mitigation">
                    <h5>Mitigation:</h5>
                    <ul>
                        <li>Transparent communication: predictions are probabilistic</li>
                        <li>Monthly model retraining with latest data</li>
                        <li>Diversified offering: predictions are 1 of 30+ features</li>
                    </ul>
                </div>
                <div class="risk-prob">Probability: Medium (40%)</div>
            </div>
            
            <div class="risk-card">
                <div class="risk-severity high">High Impact</div>
                <h4>Competitive Risk: Big Tech Entry</h4>
                <p><strong>Scenario:</strong> Google/Apple launch competing platforms</p>
                <div class="risk-mitigation">
                    <h5>Mitigation:</h5>
                    <ul>
                        <li>Focus on advanced users (niche specialization)</li>
                        <li>Build community moat with network effects</li>
                        <li>Speed advantage: ship features monthly vs quarterly</li>
                        <li>Acquisition opportunity if we reach 50K+ users</li>
                    </ul>
                </div>
                <div class="risk-prob">Probability: Low-Medium (20%)</div>
            </div>
            
            <div class="risk-card">
                <div class="risk-severity medium">Medium Impact</div>
                <h4>Regulatory Risk: Financial Advice Compliance</h4>
                <p><strong>Scenario:</strong> SEC classifies AI recommendations as investment advice</p>
                <div class="risk-mitigation">
                    <h5>Mitigation:</h5>
                    <ul>
                        <li>Clear disclaimers: "Not financial advice. Educational purposes only."</li>
                        <li>Position as analytical tool, not advisory service</li>
                        <li>Work with fintech lawyers for compliance</li>
                        <li>Pivot option: B2B licensing to registered advisors</li>
                    </ul>
                </div>
                <div class="risk-prob">Probability: Low (10%)</div>
            </div>
        </div>

        ${includeSimulator ? this.createSimulatorSection() : ''}

        <!-- FOOTER -->
        <div class="footer">
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">AlphaVault AI Business Plan</div>
                <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;">Confidential - For Internal Use Only</div>
                <div style="font-size: 12px; color: #94a3b8;">Generated: ${today}</div>
            </div>
        </div>

    </body>
    </html>
        `;
    }

    /**
     * SECTION SCENARIO SIMULATOR (OPTIONNELLE)
     */
    createSimulatorSection() {
        return `
        <div class="section">
            <h2 class="section-title">Interactive Scenario Simulator</h2>
            
            <div class="box-highlight">
                <h3 style="margin: 0 0 8px 0;">How to Use</h3>
                <p style="margin: 0;">This section showcases our interactive scenario modeling capabilities. The live simulator is available on the AlphaVault AI platform with real-time calculations.</p>
            </div>

            <h3 class="subsection-title">Key Parameters</h3>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell">
                        <div class="card-label">Total Users (Year 1)</div>
                        <div class="card-value">5,000</div>
                        <div class="card-desc">Starting user base</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Conversion Rate</div>
                        <div class="card-value">30%</div>
                        <div class="card-desc">Free to Paid</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Pro Plan %</div>
                        <div class="card-value">60%</div>
                        <div class="card-desc">Of paid users</div>
                    </td>
                </tr>
                <tr>
                    <td class="grid-cell">
                        <div class="card-label">YoY Growth</div>
                        <div class="card-value">200%</div>
                        <div class="card-desc">Year-over-year</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">CAC</div>
                        <div class="card-value">$25</div>
                        <div class="card-desc">Customer acquisition cost</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Churn Rate</div>
                        <div class="card-value">5%</div>
                        <div class="card-desc">Monthly churn</div>
                    </td>
                </tr>
            </table>

            <h3 class="subsection-title">Simulation Results (Base Case)</h3>
            
            <table class="grid-table">
                <tr>
                    <td class="grid-cell">
                        <div class="card-label">Year 1 MRR</div>
                        <div class="card-value">$21,000</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Year 1 ARR</div>
                        <div class="card-value">$252,000</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Year 5 ARR</div>
                        <div class="card-value">$5.67M</div>
                    </td>
                </tr>
                <tr>
                    <td class="grid-cell">
                        <div class="card-label">LTV:CAC Ratio</div>
                        <div class="card-value">14.7:1</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Payback Period</div>
                        <div class="card-value">1.6 months</div>
                    </td>
                    <td class="grid-cell">
                        <div class="card-label">Year 5 EBITDA</div>
                        <div class="card-value">$3.30M</div>
                    </td>
                </tr>
            </table>

            <h3 class="subsection-title">Pre-Configured Scenarios</h3>
            
            <div class="scenario-card conservative">
                <h4>Conservative Growth</h4>
                <table class="stat-table">
                    <tr><td>Total Users Y1:</td><td><strong>3,000</strong></td></tr>
                    <tr><td>Conversion:</td><td><strong>20%</strong></td></tr>
                    <tr><td>Growth:</td><td><strong>150%</strong></td></tr>
                    <tr><td>CAC:</td><td><strong>$35</strong></td></tr>
                </table>
                <div class="scenario-result"><strong>Year 5 ARR:</strong> $2.8M</div>
            </div>
            
            <div class="scenario-card base">
                <h4>Base Case (Default)</h4>
                <table class="stat-table">
                    <tr><td>Total Users Y1:</td><td><strong>5,000</strong></td></tr>
                    <tr><td>Conversion:</td><td><strong>30%</strong></td></tr>
                    <tr><td>Growth:</td><td><strong>200%</strong></td></tr>
                    <tr><td>CAC:</td><td><strong>$25</strong></td></tr>
                </table>
                <div class="scenario-result"><strong>Year 5 ARR:</strong> $5.67M</div>
            </div>
            
            <div class="scenario-card aggressive">
                <h4>Aggressive Growth</h4>
                <table class="stat-table">
                    <tr><td>Total Users Y1:</td><td><strong>10,000</strong></td></tr>
                    <tr><td>Conversion:</td><td><strong>40%</strong></td></tr>
                    <tr><td>Growth:</td><td><strong>300%</strong></td></tr>
                    <tr><td>CAC:</td><td><strong>$20</strong></td></tr>
                </table>
                <div class="scenario-result"><strong>Year 5 ARR:</strong> $18.5M</div>
            </div>
        </div>
        `;
    }

    /**
     * CSS SIMPLIFIÉ ET OPTIMISÉ POUR PDF
     */
    getBusinessPlanCSS() {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 13px;
                line-height: 1.6;
                color: #1e293b;
                background: white;
                width: 794px;
                margin: 0;
                padding: 0;
            }

            /* COVER PAGE */
            .cover-page {
                min-height: 1000px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                page-break-after: always;
            }

            /* SECTIONS */
            .section {
                padding: 20px 30px;
                background: white;
                page-break-before: always;
            }

            .section-title {
                font-size: 24px;
                font-weight: 800;
                color: #1e293b;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 3px solid #667eea;
            }

            .subsection-title {
                font-size: 18px;
                font-weight: 700;
                color: #1e293b;
                margin: 20px 0 12px 0;
                padding-bottom: 6px;
                border-bottom: 2px solid #667eea;
            }

            h3, h4 {
                margin: 12px 0 8px 0;
                font-weight: 700;
                color: #1e293b;
            }

            h3 { font-size: 16px; }
            h4 { font-size: 14px; }

            p {
                margin-bottom: 10px;
                color: #1e293b;
                line-height: 1.6;
            }

            ul {
                margin: 10px 0;
                padding-left: 20px;
            }

            li {
                margin-bottom: 6px;
                line-height: 1.5;
            }

            /* BOX HIGHLIGHT */
            .box-highlight {
                background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.05));
                padding: 16px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
                margin: 16px 0;
            }

            /* GRID TABLE (REMPLACE LES GRIDS CSS) */
            .grid-table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
            }

            .grid-table td {
                padding: 0;
                vertical-align: top;
            }

            .grid-cell {
                border: 2px solid #667eea;
                border-radius: 10px;
                padding: 14px;
                background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.05));
                margin: 0 4px;
            }

            .grid-cell.highlight {
                background: linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.1));
            }

            .grid-cell.ratio-success {
                border-color: #10b981;
                background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05));
            }

            .card-icon {
                font-size: 12px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 8px;
            }

            .card-label {
                font-size: 11px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }

            .card-value {
                font-size: 22px;
                font-weight: 800;
                color: #667eea;
                margin: 6px 0;
                line-height: 1.2;
            }

            .card-desc {
                font-size: 12px;
                color: #64748b;
                margin-top: 4px;
            }

            .card-growth {
                font-size: 12px;
                color: #10b981;
                margin-top: 4px;
                font-weight: 600;
            }

            /* DATA TABLE */
            .data-table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
                font-size: 12px;
            }

            .data-table thead th {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 10px 8px;
                font-weight: 700;
                text-align: left;
                border: 1px solid rgba(255,255,255,0.2);
            }

            .data-table tbody td {
                padding: 8px;
                border: 1px solid #e2e8f0;
                color: #1e293b;
            }

            .data-table tbody tr:nth-child(even) td {
                background: #f8fafc;
            }

            .data-table tr.highlight td {
                background: rgba(102,126,234,0.15) !important;
                font-weight: 700;
                color: #667eea;
            }

            .data-table tr.total td {
                background: rgba(102,126,234,0.2) !important;
                font-weight: 800;
                color: #667eea;
            }

            .data-table th.us,
            .data-table td.us {
                background: rgba(16,185,129,0.15) !important;
                color: #10b981;
                font-weight: 700;
            }

            /* STAT TABLE (POUR SEGMENTS) */
            .stat-table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 12px;
            }

            .stat-table td {
                padding: 6px 0;
                border-bottom: 1px solid rgba(102,126,234,0.2);
            }

            .stat-table td:first-child {
                color: #64748b;
            }

            .stat-table td:last-child {
                text-align: right;
            }

            /* VALUE PROP */
            .value-prop {
                display: table;
                width: 100%;
                margin-bottom: 14px;
                padding: 12px;
                background: rgba(102,126,234,0.05);
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }

            .value-prop > div:first-child {
                display: table-cell;
                vertical-align: top;
                width: 40px;
            }

            .value-prop > div:last-child {
                display: table-cell;
                vertical-align: top;
                padding-left: 12px;
            }

            .vp-number {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                font-weight: 800;
            }

            /* SEGMENT BOX */
            .segment-box {
                border: 2px solid #667eea;
                border-radius: 10px;
                padding: 14px;
                background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.05));
                margin-bottom: 14px;
            }

            /* PRICING TABLE */
            .pricing-table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
            }

            .pricing-table td {
                padding: 0 4px;
                vertical-align: top;
            }

            .pricing-cell {
                border: 2px solid #e2e8f0;
                border-radius: 14px;
                padding: 16px;
                background: white;
                position: relative;
            }

            .pricing-cell.featured {
                border-color: #667eea;
            }

            .pricing-cell.premium {
                border-color: #764ba2;
            }

            .pricing-badge {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 4px 14px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 700;
            }

            .pricing-header {
                text-align: center;
                margin-bottom: 14px;
            }

            .pricing-icon {
                font-size: 12px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 8px;
            }

            .pricing-price {
                font-size: 36px;
                font-weight: 800;
                color: #667eea;
                margin: 10px 0;
            }

            .pricing-price span {
                font-size: 14px;
                color: #64748b;
            }

            .pricing-features {
                margin: 14px 0;
            }

            .pricing-features > div {
                padding: 6px 0;
                border-bottom: 1px solid #e2e8f0;
                font-size: 12px;
            }

            .pricing-features .disabled {
                color: #cbd5e1;
            }

            .pricing-target {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 2px solid #e2e8f0;
                font-size: 11px;
                color: #64748b;
            }

            /* ROADMAP */
            .roadmap-item {
                margin-bottom: 14px;
                padding: 12px;
                background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.05));
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }

            .roadmap-quarter {
                display: inline-block;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 5px 14px;
                border-radius: 12px;
                font-weight: 800;
                font-size: 12px;
                margin-bottom: 8px;
            }

            /* RISK CARD */
            .risk-card {
                margin-bottom: 14px;
                padding: 14px;
                border-radius: 10px;
                border-left: 4px solid #f59e0b;
                background: rgba(245,158,11,0.05);
            }

            .risk-severity {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .risk-severity.high {
                background: #ef4444;
                color: white;
            }

            .risk-severity.medium {
                background: #f59e0b;
                color: white;
            }

            .risk-severity.low {
                background: #10b981;
                color: white;
            }

            .risk-mitigation {
                margin: 10px 0;
                padding: 10px;
                background: rgba(255,255,255,0.7);
                border-radius: 8px;
            }

            .risk-mitigation h5 {
                margin-bottom: 6px;
                font-size: 13px;
                color: #667eea;
            }

            .risk-mitigation ul {
                margin: 6px 0;
                padding-left: 18px;
            }

            .risk-prob {
                margin-top: 8px;
                font-size: 11px;
                font-weight: 600;
                color: #64748b;
            }

            /* SCENARIO CARDS */
            .scenario-card {
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                padding: 14px;
                background: white;
                margin-bottom: 14px;
            }

            .scenario-card.conservative {
                border-color: #f59e0b;
                background: rgba(245,158,11,0.05);
            }

            .scenario-card.base {
                border-color: #667eea;
                background: rgba(102,126,234,0.05);
            }

            .scenario-card.aggressive {
                border-color: #10b981;
                background: rgba(16,185,129,0.05);
            }

            .scenario-result {
                margin-top: 10px;
                padding: 8px;
                background: rgba(102,126,234,0.1);
                border-radius: 6px;
                text-align: center;
                font-size: 13px;
            }

            /* FOOTER */
            .footer {
                margin-top: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 10px;
                border-top: 3px solid #667eea;
            }

            /* PRINT OPTIMIZATIONS */
            @media print {
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }
            }
        `;
    }

    /**
     * MÉTHODES UTILITAIRES
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
        
        const icon = type === 'success' ? '[OK]' : type === 'warning' ? '[!]' : '[X]';
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 30px; right: 30px; z-index: 9999999;
            background: ${bgColor}; color: white; padding: 20px 28px;
            border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            min-width: 350px; animation: slideIn 0.4s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; gap: 16px;">
                <div style="font-size: 28px;">${icon}</div>
                <div>
                    <div style="font-weight: 800; font-size: 16px; margin-bottom: 6px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.95;">${message}</div>
                </div>
            </div>
            <style>@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }</style>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.4s, transform 0.4s';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 400);
        }, 4500);
    }
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('Business Plan PDF Exporter v11.0 (Fixed Layout) initialized');
});