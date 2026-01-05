/* ═══════════════════════════════════════════════════════════════
   REFERRAL PROGRAM - CLIENT SIDE
   AlphaVault AI v1.0
   ═══════════════════════════════════════════════════════════════ */

const WORKER_URL = 'https://finance-hub-api.raphnardone.workers.dev';

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
        console.log('📥 Loading referral data...');
        
        const token = await currentUser.getIdToken();
        
        const response = await fetch(`${WORKER_URL}/api/referral/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load referral data');
        }
        
        const data = await response.json();
        
        console.log('✅ Referral data loaded:', data);
        
        referralData = {
            code: data.referralCode,
            count: data.totalReferrals || 0,
            completed: data.completedReferrals || 0,
            pending: data.pendingReferrals || 0,
            referrals: data.referrals || [],
            rewardActive: data.rewardActive || false
        };
        
        updateUI();
        
    } catch (error) {
        console.error('❌ Error loading referral data:', error);
    }
}

// ═══════════════════════════════════════════════════════════════
// UPDATE UI
// ═══════════════════════════════════════════════════════════════

function updateUI() {
    // Update stats
    document.getElementById('totalReferrals').textContent = referralData.count;
    document.getElementById('completedReferrals').textContent = referralData.completed;
    document.getElementById('pendingReferrals').textContent = referralData.pending;
    
    // Update progress
    updateProgress(referralData.completed);
    
    // Update referral link
    const referralLink = `https://alphavault-ai.com/register.html?ref=${referralData.code}`;
    document.getElementById('referralLinkInput').value = referralLink;
    
    // Update referrals list
    displayReferralsList();
}

// ═══════════════════════════════════════════════════════════════
// UPDATE PROGRESS TRACKER
// ═══════════════════════════════════════════════════════════════

function updateProgress(completedCount) {
    const steps = ['step0', 'step1', 'step2', 'step3', 'stepReward'];
    const labels = ['label1', 'label2', 'label3'];
    
    // Reset all
    steps.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('completed', 'active');
    });
    
    labels.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('completed', 'active');
    });
    
    // Mark completed steps
    for (let i = 0; i <= completedCount && i < steps.length; i++) {
        document.getElementById(steps[i]).classList.add('completed');
        
        if (i > 0 && i <= 3) {
            document.getElementById(`label${i}`).classList.add('completed');
        }
    }
    
    // Mark active step
    if (completedCount < 3) {
        const nextStep = steps[completedCount + 1];
        document.getElementById(nextStep).classList.add('active');
        
        if (completedCount < 3) {
            document.getElementById(`label${completedCount + 1}`).classList.add('active');
        }
    } else {
        // Reward unlocked
        document.getElementById('stepReward').classList.add('completed');
    }
    
    // Update progress line
    const progressPercentage = (completedCount / 3) * 100;
    document.getElementById('progressLineFill').style.width = `${progressPercentage}%`;
    
    // Check if reward should be claimed
    if (completedCount >= 3 && !referralData.rewardActive) {
        showRewardNotification();
    }
}

// ═══════════════════════════════════════════════════════════════
// DISPLAY REFERRALS LIST
// ═══════════════════════════════════════════════════════════════

function displayReferralsList() {
    const container = document.getElementById('referralsList');
    
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
    
    container.innerHTML = referralData.referrals.map(ref => `
        <div class="referral-item">
            <div>
                <div class="referral-email">${ref.email}</div>
                <div class="referral-date">${new Date(ref.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
            </div>
            <div class="referral-status ${ref.status === 'completed' ? 'status-completed' : 'status-pending'}">
                ${ref.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════
// COPY REFERRAL LINK
// ═══════════════════════════════════════════════════════════════

document.getElementById('copyBtn').addEventListener('click', async () => {
    const input = document.getElementById('referralLinkInput');
    const btn = document.getElementById('copyBtn');
    const btnText = document.getElementById('copyBtnText');
    
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
        
        // Fallback
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

// ═══════════════════════════════════════════════════════════════
// SHARE BUTTONS
// ═══════════════════════════════════════════════════════════════

document.getElementById('shareEmail').addEventListener('click', () => {
    const link = document.getElementById('referralLinkInput').value;
    const subject = encodeURIComponent('Join me on AlphaVault AI!');
    const body = encodeURIComponent(`Hi!\n\nI've been using AlphaVault AI for my financial analysis and I think you'd love it too!\n\nSign up using my referral link and get access to premium financial tools:\n\n${link}\n\nBest,\n${currentUser.displayName || 'Your friend'}`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.getElementById('shareWhatsApp').addEventListener('click', () => {
    const link = document.getElementById('referralLinkInput').value;
    const text = encodeURIComponent(`🚀 Join me on AlphaVault AI!\n\nI've been using it for financial analysis and it's amazing!\n\nSign up here: ${link}`);
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
});

document.getElementById('shareTwitter').addEventListener('click', () => {
    const link = document.getElementById('referralLinkInput').value;
    const text = encodeURIComponent(`🚀 Just discovered @AlphaVaultAI - the best platform for financial analysis!\n\nJoin me:`);
    
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, '_blank');
});

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
        const token = await currentUser.getIdToken();
        
        const response = await fetch(`${WORKER_URL}/api/referral/claim-reward`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to claim reward');
        }
        
        const data = await response.json();
        
        console.log('✅ Reward claimed:', data);
        
        alert('✅ SUCCESS!\n\nYour Platinum Plan (3 months free) has been activated!\n\nEnjoy premium access to all AlphaVault AI features!');
        
        window.location.href = 'dashboard-financier.html';
        
    } catch (error) {
        console.error('❌ Error claiming reward:', error);
        alert('❌ Error activating reward. Please contact support.');
    }
}

console.log('✅ Referral Program loaded');