/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN PDF EXPORTER v8.0 (SERVER-SIDE GENERATION)
 * Envoie uniquement la requête au Worker - Génération PDF côté serveur
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
     * 📧 ENVOYER REQUÊTE AU WORKER
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
            const includeSimulator = document.getElementById('includeSimulator').checked;

            this.showProgress(0, 'Sending request to server...');

            // ✅ ENVOYER AU WORKER (le Worker génère le PDF)
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    emails, 
                    subject, 
                    message, 
                    includeSimulator 
                })
            });

            this.showProgress(50, 'Generating PDF on server...');

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
}

// ✅ INIT
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('📄 ✅ Business Plan PDF Exporter v8.0 (Server-Side) initialized');
});