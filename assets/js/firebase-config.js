// ============================================
// ✅ FONCTION PRINCIPALE : CHARGER ET SYNCHRONISER LES DONNÉES
// ============================================

/**
 * Charger les données utilisateur depuis Firestore
 * Créer le document s'il n'existe pas
 * Synchroniser avec Firebase Auth
 * ✅ GESTION INTELLIGENTE DE LA PHOTO (Google vs R2)
 * ✅ TRACKING DU PARRAINAGE POUR NOUVEAUX COMPTES
 */
async function loadAndSyncUserData(user) {
    try {
        console.log('📥 Chargement des données Firestore pour:', user.uid);
        
        // Référence au document utilisateur
        const userDocRef = db.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get();
        
        let userData;
        let isNewUser = false;
        
        if (userDoc.exists) {
            // ✅ DOCUMENT EXISTE - Le charger
            console.log('✅ Document utilisateur trouvé');
            
            const firestoreData = userDoc.data();
            
            userData = {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                photoURL: firestoreData.photoURL || user.photoURL,
                displayName: firestoreData.displayName || user.displayName,
                ...firestoreData
            };
            
            // ✅ LOGIQUE DE SYNCHRONISATION DE LA PHOTO
            const updateData = {
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                email: user.email,
                emailVerified: user.emailVerified
            };
            
            const hasR2Photo = firestoreData.photoURL && 
                              (firestoreData.photoURL.includes('workers.dev') || 
                               firestoreData.photoURL.includes('r2.dev'));
            
            const hasGooglePhoto = user.photoURL && 
                                  user.photoURL.includes('googleusercontent.com');
            
            if (!hasR2Photo && hasGooglePhoto) {
                updateData.photoURL = user.photoURL;
                userData.photoURL = user.photoURL;
            } else if (!hasR2Photo && !firestoreData.photoURL) {
                const fallbackPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=256`;
                updateData.photoURL = fallbackPhoto;
                userData.photoURL = fallbackPhoto;
            }
            
            // Mettre à jour Firestore
            await userDocRef.update(updateData);
            
            console.log('✅ Document mis à jour (lastLoginAt + photo sync)');
            
        } else {
            // ❌ DOCUMENT N'EXISTE PAS - Le créer
            console.warn('⚠ Document utilisateur inexistant');
            console.log('🆕 Création du document utilisateur...');
            
            isNewUser = true;
            
            let initialPhotoURL;
            
            if (user.photoURL && user.photoURL.includes('googleusercontent.com')) {
                initialPhotoURL = user.photoURL;
            } else if (user.photoURL) {
                initialPhotoURL = user.photoURL;
            } else {
                initialPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=667eea&color=fff&size=256`;
            }
            
            const newUserData = {
                email: user.email,
                emailVerified: user.emailVerified,
                photoURL: initialPhotoURL,
                displayName: user.displayName || user.email.split('@')[0],
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                bio: '',
                company: '',
                phone: '',
                plan: 'basic',
                subscriptionStatus: 'inactive',
                weeklyNewsletter: true,
                newsletterSubscribedAt: new Date().toISOString(),
                followersCount: 0,
                followingCount: 0,
                reputation: 0,
                postCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await userDocRef.set(newUserData);
            
            console.log('✅ Document utilisateur créé avec succès');
            
            userData = {
                uid: user.uid,
                ...newUserData
            };
            
            // ═══════════════════════════════════════════════════════════════
            // ✅✅✅ TRACKING DU PARRAINAGE (NOUVEAU COMPTE)
            // ═══════════════════════════════════════════════════════════════
            
            console.log('🎁 Nouveau compte créé - Vérification du parrainage...');
            
            try {
                if (typeof window.trackReferralSignupFirestore === 'function') {
                    await window.trackReferralSignupFirestore(user);
                    console.log('✅ Tracking du parrainage effectué');
                } else {
                    console.warn('⚠ trackReferralSignupFirestore non disponible - sera appelé plus tard');
                    
                    // Stocker un flag pour retenter plus tard
                    sessionStorage.setItem('pendingReferralTracking', 'true');
                }
            } catch (trackingError) {
                console.error('⚠ Erreur tracking parrainage (non-bloquant):', trackingError.message);
                
                // Stocker un flag pour retenter plus tard
                sessionStorage.setItem('pendingReferralTracking', 'true');
            }
            
            // ✅ INSCRIPTION AUTOMATIQUE À LA NEWSLETTER
            console.log('📧 Inscription automatique à la newsletter pour nouveau compte...');
            const subscribed = await subscribeToNewsletter(
                user.email, 
                user.displayName || user.email.split('@')[0]
            );
            
            if (subscribed) {
                console.log('🎉 Nouvel utilisateur créé et inscrit à la newsletter !');
            } else {
                console.warn('⚠ Compte créé mais erreur lors de l\'inscription newsletter');
            }
        }
        
        // Stocker les données globalement
        window.currentUserData = userData;
        
        // Stocker dans localStorage
        localStorage.setItem('financepro_user', JSON.stringify(userData));
        
        // Mettre à jour l'interface utilisateur
        updateGlobalUserInterface(userData);
        
        // ✅ DÉCLENCHER L'ÉVÉNEMENT POUR LES AUTRES SCRIPTS
        window.dispatchEvent(new CustomEvent('userDataLoaded', { 
            detail: userData 
        }));
        
        window.dispatchEvent(new CustomEvent('userAuthenticated', { 
            detail: userData 
        }));
        
        console.log('✅ Données utilisateur chargées et synchronisées');
        
        if (isNewUser) {
            console.log('🎉 Processus de création de compte terminé !');
        }
        
        // ═══════════════════════════════════════════════════════════════
        // ✅ RETRY TRACKING SI PENDING (pour les cas où le script n'était pas chargé)
        // ═══════════════════════════════════════════════════════════════
        
        const pendingTracking = sessionStorage.getItem('pendingReferralTracking');
        if (pendingTracking === 'true') {
            console.log('🔄 Retry tracking du parrainage en attente...');
            
            try {
                if (typeof window.trackReferralSignupFirestore === 'function') {
                    await window.trackReferralSignupFirestore(user);
                    console.log('✅ Retry tracking réussi');
                    sessionStorage.removeItem('pendingReferralTracking');
                } else {
                    console.warn('⚠ trackReferralSignupFirestore toujours non disponible');
                }
            } catch (retryError) {
                console.error('⚠ Erreur retry tracking:', retryError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        
        // Créer des données minimales depuis Auth uniquement
        const minimalUserData = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=667eea&color=fff&size=256`,
            displayName: user.displayName || user.email.split('@')[0],
            firstName: '',
            lastName: '',
            plan: 'basic',
            subscriptionStatus: 'inactive',
            weeklyNewsletter: false
        };
        
        window.currentUserData = minimalUserData;
        localStorage.setItem('financepro_user', JSON.stringify(minimalUserData));
        
        updateGlobalUserInterface(minimalUserData);
        
        window.dispatchEvent(new CustomEvent('userDataLoaded', { 
            detail: minimalUserData 
        }));
        
        console.warn('⚠ Données minimales chargées depuis Firebase Auth uniquement');
    }
}