// /* ============================================
//    ALPHAVAULT AI - FOLLOW SYSTEM
//    Système d'Abonnements entre Utilisateurs
//    ============================================ */

// class FollowSystem {
//     constructor() {
//         this.db = firebase.firestore();
//         this.auth = firebase.auth();
//         this.followsCollection = this.db.collection('user_follows');
//     }

//     /**
//      * Suivre un utilisateur
//      */
//     async followUser(targetUserId) {
//         const currentUser = this.auth.currentUser;
//         if (!currentUser) throw new Error('User not authenticated');
//         if (currentUser.uid === targetUserId) throw new Error('Cannot follow yourself');

//         const followDoc = {
//             followerId: currentUser.uid,
//             followedId: targetUserId,
//             createdAt: firebase.firestore.FieldValue.serverTimestamp()
//         };

//         const followId = `${currentUser.uid}_${targetUserId}`;

//         await this.followsCollection.doc(followId).set(followDoc);

//         // Incrémenter les compteurs
//         const batch = this.db.batch();

//         batch.update(this.db.collection('users').doc(currentUser.uid), {
//             followingCount: firebase.firestore.FieldValue.increment(1)
//         });

//         batch.update(this.db.collection('users').doc(targetUserId), {
//             followersCount: firebase.firestore.FieldValue.increment(1)
//         });

//         await batch.commit();

//         console.log('✅ User followed:', targetUserId);
//     }

//     /**
//      * Ne plus suivre un utilisateur
//      */
//     async unfollowUser(targetUserId) {
//         const currentUser = this.auth.currentUser;
//         if (!currentUser) throw new Error('User not authenticated');

//         const followId = `${currentUser.uid}_${targetUserId}`;

//         await this.followsCollection.doc(followId).delete();

//         // Décrémenter les compteurs
//         const batch = this.db.batch();

//         batch.update(this.db.collection('users').doc(currentUser.uid), {
//             followingCount: firebase.firestore.FieldValue.increment(-1)
//         });

//         batch.update(this.db.collection('users').doc(targetUserId), {
//             followersCount: firebase.firestore.FieldValue.increment(-1)
//         });

//         await batch.commit();

//         console.log('✅ User unfollowed:', targetUserId);
//     }

//     /**
//      * Vérifier si l'utilisateur suit quelqu'un
//      */
//     async isFollowing(targetUserId) {
//         const currentUser = this.auth.currentUser;
//         if (!currentUser) return false;

//         const followId = `${currentUser.uid}_${targetUserId}`;
//         const doc = await this.followsCollection.doc(followId).get();

//         return doc.exists;
//     }

//     /**
//      * Récupérer les abonnés d'un utilisateur
//      */
//     async getFollowers(userId) {
//         const snapshot = await this.followsCollection
//             .where('followedId', '==', userId)
//             .get();

//         const followerIds = snapshot.docs.map(doc => doc.data().followerId);

//         if (followerIds.length === 0) return [];

//         // Récupérer les données des abonnés
//         const followers = [];
//         for (const followerId of followerIds) {
//             const userDoc = await this.db.collection('users').doc(followerId).get();
//             if (userDoc.exists) {
//                 followers.push({ uid: followerId, ...userDoc.data() });
//             }
//         }

//         return followers;
//     }

//     /**
//      * Récupérer les abonnements d'un utilisateur
//      */
//     async getFollowing(userId) {
//         const snapshot = await this.followsCollection
//             .where('followerId', '==', userId)
//             .get();

//         const followingIds = snapshot.docs.map(doc => doc.data().followedId);

//         if (followingIds.length === 0) return [];

//         // Récupérer les données des utilisateurs suivis
//         const following = [];
//         for (const followedId of followingIds) {
//             const userDoc = await this.db.collection('users').doc(followedId).get();
//             if (userDoc.exists) {
//                 following.push({ uid: followedId, ...userDoc.data() });
//             }
//         }

//         return following;
//     }

//     /**
//      * Récupérer les posts des utilisateurs suivis
//      */
//     async getFollowingPosts(limit = 20) {
//         const currentUser = this.auth.currentUser;
//         if (!currentUser) return [];

//         // Récupérer les IDs des utilisateurs suivis
//         const followingSnapshot = await this.followsCollection
//             .where('followerId', '==', currentUser.uid)
//             .get();

//         const followingIds = followingSnapshot.docs.map(doc => doc.data().followedId);

//         if (followingIds.length === 0) return [];

//         // ✅ Firestore 'in' limite à 10 éléments, donc on divise si nécessaire
//         const chunks = [];
//         for (let i = 0; i < followingIds.length; i += 10) {
//             chunks.push(followingIds.slice(i, i + 10));
//         }

//         // Récupérer les posts pour chaque chunk
//         const allPosts = [];
        
//         for (const chunk of chunks) {
//             const postsSnapshot = await this.db.collection('community_posts')
//                 .where('authorId', 'in', chunk)
//                 .orderBy('createdAt', 'desc')
//                 .limit(limit)
//                 .get();

//             const posts = postsSnapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//                 createdAt: doc.data().createdAt?.toDate()
//             }));

//             allPosts.push(...posts);
//         }

//         // Trier tous les posts par date et limiter au total
//         return allPosts
//             .sort((a, b) => b.createdAt - a.createdAt)
//             .slice(0, limit);
//     }
// }

// // Instance globale
// window.followSystem = new FollowSystem();

/* ============================================
   FOLLOW-SYSTEM.JS - Système d'abonnement v3.0
   ✅ Compatible avec profile.js et public-profile.js
   ✅ Utilise les sous-collections following/followers
   ============================================ */

class FollowSystem {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
    }

    /**
     * Suivre un utilisateur
     */
    async followUser(targetUserId) {
        const currentUser = this.auth.currentUser;
        
        if (!currentUser) {
            throw new Error('User not authenticated');
        }
        
        if (currentUser.uid === targetUserId) {
            throw new Error('Cannot follow yourself');
        }

        try {
            const batch = this.db.batch();
            
            // ✅ 1. Ajouter dans la sous-collection "following" de l'utilisateur actuel
            const followingRef = this.db
                .collection('users')
                .doc(currentUser.uid)
                .collection('following')
                .doc(targetUserId);
            
            batch.set(followingRef, {
                followedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // ✅ 2. Ajouter dans la sous-collection "followers" de l'utilisateur cible
            const followerRef = this.db
                .collection('users')
                .doc(targetUserId)
                .collection('followers')
                .doc(currentUser.uid);
            
            batch.set(followerRef, {
                followedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // ✅ 3. Incrémenter followingCount de l'utilisateur actuel
            const currentUserRef = this.db.collection('users').doc(currentUser.uid);
            batch.update(currentUserRef, {
                followingCount: firebase.firestore.FieldValue.increment(1)
            });
            
            // ✅ 4. Incrémenter followersCount de l'utilisateur cible
            const targetUserRef = this.db.collection('users').doc(targetUserId);
            batch.update(targetUserRef, {
                followersCount: firebase.firestore.FieldValue.increment(1)
            });
            
            await batch.commit();
            
            console.log('✅ User followed:', targetUserId);
            
        } catch (error) {
            console.error('❌ Erreur lors du follow:', error);
            throw error;
        }
    }

    /**
     * Ne plus suivre un utilisateur
     */
    async unfollowUser(targetUserId) {
        const currentUser = this.auth.currentUser;
        
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            const batch = this.db.batch();
            
            // ✅ 1. Supprimer de la sous-collection "following"
            const followingRef = this.db
                .collection('users')
                .doc(currentUser.uid)
                .collection('following')
                .doc(targetUserId);
            
            batch.delete(followingRef);
            
            // ✅ 2. Supprimer de la sous-collection "followers"
            const followerRef = this.db
                .collection('users')
                .doc(targetUserId)
                .collection('followers')
                .doc(currentUser.uid);
            
            batch.delete(followerRef);
            
            // ✅ 3. Décrémenter followingCount
            const currentUserRef = this.db.collection('users').doc(currentUser.uid);
            batch.update(currentUserRef, {
                followingCount: firebase.firestore.FieldValue.increment(-1)
            });
            
            // ✅ 4. Décrémenter followersCount
            const targetUserRef = this.db.collection('users').doc(targetUserId);
            batch.update(targetUserRef, {
                followersCount: firebase.firestore.FieldValue.increment(-1)
            });
            
            await batch.commit();
            
            console.log('✅ User unfollowed:', targetUserId);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'unfollow:', error);
            throw error;
        }
    }

    /**
     * Vérifier si l'utilisateur suit quelqu'un
     */
    async isFollowing(targetUserId) {
        const currentUser = this.auth.currentUser;
        
        if (!currentUser) return false;

        try {
            const followDoc = await this.db
                .collection('users')
                .doc(currentUser.uid)
                .collection('following')
                .doc(targetUserId)
                .get();
            
            return followDoc.exists;
        } catch (error) {
            console.error('❌ Erreur isFollowing:', error);
            return false;
        }
    }

    /**
     * Récupérer les abonnés d'un utilisateur
     */
    async getFollowers(userId) {
        try {
            const followersSnapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('followers')
                .orderBy('followedAt', 'desc')
                .get();

            if (followersSnapshot.empty) return [];

            // Charger les données de chaque follower
            const followers = await Promise.all(
                followersSnapshot.docs.map(async (doc) => {
                    const followerId = doc.id;
                    const userDoc = await this.db
                        .collection('users')
                        .doc(followerId)
                        .get();
                    
                    if (!userDoc.exists) return null;
                    
                    return {
                        uid: followerId,
                        ...userDoc.data(),
                        followedAt: doc.data().followedAt
                    };
                })
            );

            return followers.filter(f => f !== null);
        } catch (error) {
            console.error('❌ Erreur getFollowers:', error);
            return [];
        }
    }

    /**
     * Récupérer les abonnements d'un utilisateur
     */
    async getFollowing(userId) {
        try {
            const followingSnapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('following')
                .orderBy('followedAt', 'desc')
                .get();

            if (followingSnapshot.empty) return [];

            // Charger les données de chaque utilisateur suivi
            const following = await Promise.all(
                followingSnapshot.docs.map(async (doc) => {
                    const followedUserId = doc.id;
                    const userDoc = await this.db
                        .collection('users')
                        .doc(followedUserId)
                        .get();
                    
                    if (!userDoc.exists) return null;
                    
                    return {
                        uid: followedUserId,
                        ...userDoc.data(),
                        followedAt: doc.data().followedAt
                    };
                })
            );

            return following.filter(f => f !== null);
        } catch (error) {
            console.error('❌ Erreur getFollowing:', error);
            return [];
        }
    }

    /**
     * Récupérer les posts des utilisateurs suivis
     */
    async getFollowingPosts(limit = 20) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return [];

        try {
            // Récupérer les IDs des utilisateurs suivis
            const followingSnapshot = await this.db
                .collection('users')
                .doc(currentUser.uid)
                .collection('following')
                .get();

            if (followingSnapshot.empty) return [];

            const followingIds = followingSnapshot.docs.map(doc => doc.id);

            // Firestore 'in' limite à 10 éléments
            const chunks = [];
            for (let i = 0; i < followingIds.length; i += 10) {
                chunks.push(followingIds.slice(i, i + 10));
            }

            // Récupérer les posts pour chaque chunk
            const allPosts = [];
            
            for (const chunk of chunks) {
                const postsSnapshot = await this.db
                    .collection('community_posts')
                    .where('authorId', 'in', chunk)
                    .orderBy('createdAt', 'desc')
                    .limit(limit)
                    .get();

                const posts = postsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate()
                }));

                allPosts.push(...posts);
            }

            // Trier tous les posts par date et limiter au total
            return allPosts
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, limit);
        } catch (error) {
            console.error('❌ Erreur getFollowingPosts:', error);
            return [];
        }
    }
}

// ✅ Instance globale
window.followSystem = new FollowSystem();

console.log('✅ Follow System chargé (v3.0 - sous-collections)');