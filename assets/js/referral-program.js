/* ═══════════════════════════════════════════════════════════════
   REFERRAL PROGRAM - PAGE UI v3.0
   AlphaVault AI
   ✅ Utilise Firestore (pas de Worker)
   ═══════════════════════════════════════════════════════════════ */

let currentUser = null;
let referralData = {
    code: null,
    count: 0,
    completed: 0,
    pending: 0,
    referrals: [],
    rewardActive: false
};

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        console.log('✅ User authenticated:', user.email);
        currentUser = user;
        await loadReferralData();
    } else {
        console.warn('⚠ No user authenticated');
        window.location.href = 'login.html';
    }
});

// ═══════════════════════════════════════════════════════════════
// LOAD REFERRAL DATA
// ═══════════════════════════════════════════════════════════════

async function loadReferralData() {
    try {
        console.log('📥 Loading referral data from Firestore...');
        
        const data = await window.loadReferralStatsFirestore(currentUser.uid);
        
        console.log('✅ Referral data loaded:', data);
        
        if (!data.success) {
            throw new Error('Failed to load referral data');
        }
        
        referralData = {
            code: data.referralCode,
            count: data.totalReferrals,
            completed: data.completedReferrals,
            pending: data.pendingReferrals,
            referrals: data.referrals,
            rewardActive: data.rewardActive
        };
        
        console.log('✅ Referral data processed:', referralData);
        
        updateUI();
        
    } catch (error) {
        console.error('❌ Error loading referral data:', error);
        showError('Failed to load referral data. Please refresh the page.');
    }
}

// ═══════════════════════════════════════════════════════════════
// UPDATE UI
// ═══════════════════════════════════════════════════════════════

function updateUI() {
    console.log('🎨 Updating UI...');
    
    const totalElement = document.getElementById('totalReferrals');
    const completedElement = document.getElementById('completedReferrals');
    const pendingElement = document.getElementById('pendingReferrals');
    
    if (totalElement) totalElement.textContent = referralData.count;
    if (completedElement) completedElement.textContent = referralData.completed;
    if (pendingElement) pendingElement.textContent = referralData.pending;
    
    updateProgress(referralData.completed);
    
    const referralLink = `https://alphavault-ai.com/auth.html?ref=${referralData.code}`;
    const inputElement = document.getElementById('referralLinkInput');
    
    if (inputElement) {
        inputElement.value = referralLink;
    }
    
    displayReferralsList();
    
    console.log('✅ UI updated successfully');
}

// ═══════════════════════════════════════════════════════════════
// UPDATE PROGRESS TRACKER
// ═══════════════════════════════════════════════════════════════

function updateProgress(completedCount) {
    const steps = ['step0', 'step1', 'step2', 'step3', 'stepReward'];
    const labels = ['label1', 'label2', 'label3'];
    
    steps.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('completed', 'active');
        }
    });
    
    labels.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('completed', 'active');
        }
    });
    
    for (let i = 0; i <= completedCount && i < steps.length; i++) {
        const stepEl = document.getElementById(steps[i]);
        if (stepEl) {
            stepEl.classList.add('completed');
        }
        
        if (i > 0 && i <= 3) {
            const labelEl = document.getElementById(`label${i}`);
            if (labelEl) {
                labelEl.classList.add('completed');
            }
        }
    }
    
    if (completedCount < 3) {
        const nextStep = steps[completedCount + 1];
        const nextStepEl = document.getElementById(nextStep);
        if (nextStepEl) {
            nextStepEl.classList.add('active');
        }
        
        if (completedCount < 3) {
            const nextLabelEl = document.getElementById(`label${completedCount + 1}`);
            if (nextLabelEl) {
                nextLabelEl.classList.add('active');
            }
        }
    } else {
        const rewardEl = document.getElementById('stepReward');
        if (rewardEl) {
            rewardEl.classList.add('completed');
        }
    }
    
    const progressPercentage = (completedCount / 3) * 100;
    const progressLineEl = document.getElementById('progressLineFill');
    if (progressLineEl) {
        progressLineEl.style.width = `${progressPercentage}%`;
    }
    
    if (completedCount >= 3 && !referralData.rewardActive) {
        showRewardNotification();
    }
}

// ═══════════════════════════════════════════════════════════════
// DISPLAY REFERRALS LIST
// ═══════════════════════════════════════════════════════════════

function displayReferralsList() {
    const container = document.getElementById('referralsList');
    
    if (!container) {
        console.warn('⚠ Referrals list container not found');
        return;
    }
    
    if (referralData.referrals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">No referrals yet</p>
                <p style="font-size: 0.95rem;">Share your link to start earning rewards!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = referralData.referrals.map(ref => {
        const date = new Date(ref.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        return `
            <div class="referral-item">
                <div>
                    <div class="referral-email">${ref.email}</div>
                    <div class="referral-date">${formattedDate}</div>
                </div>
                <div class="referral-status ${ref.status === 'completed' ? 'status-completed' : 'status-pending'}">
                    ${ref.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                </div>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════
// COPY REFERRAL LINK
// ═══════════════════════════════════════════════════════════════

const copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const input = document.getElementById('referralLinkInput');
        const btn = document.getElementById('copyBtn');
        const btnText = document.getElementById('copyBtnText');
        
        if (!input || !btn || !btnText) return;
        
        try {
            await navigator.clipboard.writeText(input.value);
            
            btn.classList.add('copied');
            btnText.textContent = '✓ Copied!';
            
            setTimeout(() => {
                btn.classList.remove('copied');
                btnText.textContent = '📋 Copy';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Copy failed:', error);
            
            input.select();
            document.execCommand('copy');
            
            btn.classList.add('copied');
            btnText.textContent = '✓ Copied!';
            
            setTimeout(() => {
                btn.classList.remove('copied');
                btnText.textContent = '📋 Copy';
            }, 2000);
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// SHARE BUTTONS
// ═══════════════════════════════════════════════════════════════

const shareEmailBtn = document.getElementById('shareEmail');
if (shareEmailBtn) {
    shareEmailBtn.addEventListener('click', () => {
        const link = document.getElementById('referralLinkInput')?.value || '';
        const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Your friend';
        
        const subject = encodeURIComponent('Join me on AlphaVault AI!');
        const body = encodeURIComponent(`Hi!\n\nI've been using AlphaVault AI for my financial analysis and I think you'd love it too!\n\nSign up using my referral link and get access to premium financial tools:\n\n${link}\n\nBest,\n${userName}`);
        
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });
}

const shareWhatsAppBtn = document.getElementById('shareWhatsApp');
if (shareWhatsAppBtn) {
    shareWhatsAppBtn.addEventListener('click', () => {
        const link = document.getElementById('referralLinkInput')?.value || '';
        const text = encodeURIComponent(`🚀 Join me on AlphaVault AI!\n\nI've been using it for financial analysis and it's amazing!\n\nSign up here: ${link}`);
        
        window.open(`https://wa.me/?text=${text}`, '_blank');
    });
}

const shareTwitterBtn = document.getElementById('shareTwitter');
if (shareTwitterBtn) {
    shareTwitterBtn.addEventListener('click', () => {
        const link = document.getElementById('referralLinkInput')?.value || '';
        const text = encodeURIComponent(`🚀 Just discovered @AlphaVaultAI - the best platform for financial analysis!\n\nJoin me:`);
        
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, '_blank');
    });
}

// ═══════════════════════════════════════════════════════════════
// REWARD NOTIFICATION
// ═══════════════════════════════════════════════════════════════

async function showRewardNotification() {
    const confirmed = confirm('🎉 CONGRATULATIONS!\n\nYou\'ve successfully invited 3 friends!\n\nClaim your reward: Platinum Plan FREE for 3 months!\n\nClick OK to activate your reward now.');
    
    if (confirmed) {
        await claimReward();
    }
}

async function claimReward() {
    try {
        console.log('🎁 Claiming reward...');
        
        const result = await window.claimReferralRewardFirestore(currentUser.uid);
        
        console.log('✅ Reward claimed:', result);
        
        alert('✅ SUCCESS!\n\nYour Platinum Plan (3 months free) has been activated!\n\nEnjoy premium access to all AlphaVault AI features!');
        
        window.location.href = 'dashboard-financier.html';
        
    } catch (error) {
        console.error('❌ Error claiming reward:', error);
        alert(`❌ Error activating reward: ${error.message}\n\nPlease contact support.`);
    }
}

// ═══════════════════════════════════════════════════════════════
// ERROR DISPLAY
// ═══════════════════════════════════════════════════════════════

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.5s ease;
    `;
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 500);
    }, 5000);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ Referral Program UI loaded v3.0 (Firestore)');