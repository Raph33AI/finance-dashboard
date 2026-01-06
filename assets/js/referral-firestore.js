/* ═══════════════════════════════════════════════════════════════
   REFERRAL PROGRAM - FIRESTORE CLIENT v1.0
   AlphaVault AI
   ✅ 100% Firestore (pas de Worker)
   ✅ Tracking automatique signup + payment
   ✅ Récompense Platinum 3 mois pour 3 parrainages
   ═══════════════════════════════════════════════════════════════ */

const REFERRAL_CONFIG = {
    codePrefix: 'ALPHA-',
    rewardThreshold: 3,
    rewardPlan: 'platinum',
    rewardDurationDays: 90
};

// ═══════════════════════════════════════════════════════════════
// GÉNÉRATION DU CODE DE PARRAINAGE
// ═══════════════════════════════════════════════════════════════

function generateReferralCode(userId) {
    const hash = userId.substring(0, 6).toUpperCase();
    return `${REFERRAL_CONFIG.codePrefix}${hash}`;
}

// ═══════════════════════════════════════════════════════════════
// INITIALISER LE DOCUMENT REFERRAL
// ═══════════════════════════════════════════════════════════════

async function initializeReferralDocument(userId) {
    try {
        console.log('🎁 Initializing referral document for:', userId);
        
        const referralCode = generateReferralCode(userId);
        const referralRef = firebase.firestore().collection('referrals').doc(userId);
        
        const doc = await referralRef.get();
        
        if (!doc.exists) {
            console.log('📝 Creating new referral document...');
            
            await referralRef.set({
                userId: userId,
                referralCode: referralCode,
                totalReferrals: 0,
                completedReferrals: 0,
                pendingReferrals: 0,
                rewardActive: false,
                rewardGrantedAt: null,
                rewardExpiresAt: null,
                referrals: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Referral document created:', referralCode);
        } else {
            console.log('✅ Referral document already exists:', referralCode);
        }
        
        return referralCode;
        
    } catch (error) {
        console.error('❌ Error initializing referral document:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// ✅ TRACKING SIGNUP (Appelé après création compte)
// ═══════════════════════════════════════════════════════════════

async function trackReferralSignupFirestore(newUser) {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎁 TRACKING REFERRAL SIGNUP (Firestore)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const referralCode = sessionStorage.getItem('referralCode') || 
                            localStorage.getItem('referralCode');
        
        if (!referralCode) {
            console.log('ℹ No referral code found - skipping tracking');
            return;
        }
        
        console.log('🎁 Referral code detected:', referralCode);
        console.log('👤 New user:', newUser.email);
        console.log('🆔 User ID:', newUser.uid);
        
        // Trouver le referrer par code
        const referralsSnapshot = await firebase.firestore()
            .collection('referrals')
            .where('referralCode', '==', referralCode)
            .limit(1)
            .get();
        
        if (referralsSnapshot.empty) {
            console.warn('⚠ Referral code not found in Firestore:', referralCode);
            sessionStorage.removeItem('referralCode');
            localStorage.removeItem('referralCode');
            return;
        }
        
        const referrerDoc = referralsSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        const referrerData = referrerDoc.data();
        
        console.log('✅ Referrer found:', referrerId);
        
        // Vérifier duplicatas
        const isDuplicate = referrerData.referrals.some(
            r => r.userId === newUser.uid || r.email === newUser.email
        );
        
        if (isDuplicate) {
            console.log('ℹ User already tracked as referral');
            return;
        }
        
        // Ajouter le nouveau filleul
        const newReferral = {
            userId: newUser.uid,
            email: newUser.email,
            status: 'pending',
            plan: 'basic',
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        await referrerDoc.ref.update({
            referrals: firebase.firestore.FieldValue.arrayUnion(newReferral),
            totalReferrals: firebase.firestore.FieldValue.increment(1),
            pendingReferrals: firebase.firestore.FieldValue.increment(1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Referral tracked successfully in Firestore');
        console.log('📊 Referrer total referrals:', referrerData.totalReferrals + 1);
        
        // Nettoyer les codes stockés
        sessionStorage.removeItem('referralCode');
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referralCodeTimestamp');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('❌ Error tracking referral signup:', error);
    }
}

// ═══════════════════════════════════════════════════════════════
// ✅ COMPLÉTION PARRAINAGE (Plan payant ou Basic)
// ═══════════════════════════════════════════════════════════════

async function completeReferralFirestore(userId, plan = 'basic') {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ COMPLETING REFERRAL (Firestore)');
        console.log('   User ID:', userId);
        console.log('   Plan:', plan);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Trouver tous les documents referrals
        const allReferrals = await firebase.firestore()
            .collection('referrals')
            .get();
        
        let referralCompleted = false;
        
        for (const doc of allReferrals.docs) {
            const referrerData = doc.data();
            
            // Chercher le filleul dans la liste
            const referralIndex = referrerData.referrals.findIndex(
                r => r.userId === userId && r.status === 'pending'
            );
            
            if (referralIndex !== -1) {
                console.log('🎯 Found pending referral in:', doc.id);
                
                // Mettre à jour le referral
                const updatedReferrals = [...referrerData.referrals];
                updatedReferrals[referralIndex] = {
                    ...updatedReferrals[referralIndex],
                    status: 'completed',
                    plan: plan,
                    completedAt: new Date().toISOString()
                };
                
                const completedCount = updatedReferrals.filter(r => r.status === 'completed').length;
                const pendingCount = updatedReferrals.filter(r => r.status === 'pending').length;
                
                await doc.ref.update({
                    referrals: updatedReferrals,
                    completedReferrals: completedCount,
                    pendingReferrals: pendingCount,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log('✅ Referral completed successfully');
                console.log('📊 Referrer completed referrals:', completedCount);
                
                // Vérifier si éligible à la récompense
                if (completedCount >= REFERRAL_CONFIG.rewardThreshold && !referrerData.rewardActive) {
                    console.log('🎁 Referrer is eligible for reward!');
                    await grantReferralReward(doc.id);
                }
                
                referralCompleted = true;
                break;
            }
        }
        
        if (!referralCompleted) {
            console.log('ℹ No pending referral found for user:', userId);
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('❌ Error completing referral:', error);
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎁 ACCORDER LA RÉCOMPENSE AUTOMATIQUEMENT
// ═══════════════════════════════════════════════════════════════

async function grantReferralReward(referrerId) {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎁 GRANTING REFERRAL REWARD');
        console.log('   Referrer ID:', referrerId);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFERRAL_CONFIG.rewardDurationDays);
        
        // Mettre à jour le document referral
        await firebase.firestore().collection('referrals').doc(referrerId).update({
            rewardActive: true,
            rewardGrantedAt: new Date().toISOString(),
            rewardExpiresAt: expiresAt.toISOString(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Mettre à jour le plan utilisateur
        await firebase.firestore().collection('users').doc(referrerId).update({
            plan: REFERRAL_CONFIG.rewardPlan,
            subscriptionStatus: 'active_referral',
            referralRewardActive: true,
            referralRewardExpiresAt: expiresAt.toISOString(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Reward granted successfully');
        console.log('💎 Plan:', REFERRAL_CONFIG.rewardPlan);
        console.log('📅 Expires:', expiresAt.toISOString());
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
    } catch (error) {
        console.error('❌ Error granting reward:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// 📊 CHARGER LES STATISTIQUES (Pour la page referral-program.html)
// ═══════════════════════════════════════════════════════════════

async function loadReferralStatsFirestore(userId) {
    try {
        console.log('📊 Loading referral stats from Firestore...');
        
        const referralDoc = await firebase.firestore()
            .collection('referrals')
            .doc(userId)
            .get();
        
        if (!referralDoc.exists) {
            console.log('ℹ No referral document found - initializing...');
            const code = await initializeReferralDocument(userId);
            
            return {
                success: true,
                referralCode: code,
                totalReferrals: 0,
                completedReferrals: 0,
                pendingReferrals: 0,
                referrals: [],
                rewardActive: false
            };
        }
        
        const data = referralDoc.data();
        
        console.log('✅ Referral stats loaded:', data);
        
        return {
            success: true,
            referralCode: data.referralCode,
            totalReferrals: data.totalReferrals || 0,
            completedReferrals: data.completedReferrals || 0,
            pendingReferrals: data.pendingReferrals || 0,
            referrals: data.referrals || [],
            rewardActive: data.rewardActive || false
        };
        
    } catch (error) {
        console.error('❌ Error loading referral stats:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎁 RÉCLAMER LA RÉCOMPENSE MANUELLEMENT
// ═══════════════════════════════════════════════════════════════

async function claimReferralRewardFirestore(userId) {
    try {
        console.log('🎁 Claiming referral reward...');
        
        const referralDoc = await firebase.firestore()
            .collection('referrals')
            .doc(userId)
            .get();
        
        if (!referralDoc.exists) {
            throw new Error('Referral document not found');
        }
        
        const data = referralDoc.data();
        
        if (data.completedReferrals < REFERRAL_CONFIG.rewardThreshold) {
            throw new Error(`You need ${REFERRAL_CONFIG.rewardThreshold} completed referrals. You have ${data.completedReferrals}.`);
        }
        
        if (data.rewardActive) {
            throw new Error('Reward already claimed');
        }
        
        await grantReferralReward(userId);
        
        console.log('✅ Reward claimed successfully!');
        
        return {
            success: true,
            message: 'Platinum plan (3 months free) activated!',
            expiresAt: new Date(Date.now() + REFERRAL_CONFIG.rewardDurationDays * 24 * 60 * 60 * 1000).toISOString()
        };
        
    } catch (error) {
        console.error('❌ Error claiming reward:', error);
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT DES FONCTIONS
// ═══════════════════════════════════════════════════════════════

window.trackReferralSignupFirestore = trackReferralSignupFirestore;
window.completeReferralFirestore = completeReferralFirestore;
window.loadReferralStatsFirestore = loadReferralStatsFirestore;
window.claimReferralRewardFirestore = claimReferralRewardFirestore;
window.initializeReferralDocument = initializeReferralDocument;

console.log('✅ Referral Firestore system loaded v1.0');