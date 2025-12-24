/* ============================================
   ALPHAVAULT AI - FOLLOW SYSTEM
   Système d'Abonnements entre Utilisateurs
   ============================================ */

class FollowSystem {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.followsCollection = this.db.collection('user_follows');
    }

    /**
     * Suivre un utilisateur
     */
    async followUser(targetUserId) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('User not authenticated');
        if (currentUser.uid === targetUserId) throw new Error('Cannot follow yourself');

        const followDoc = {
            followerId: currentUser.uid,
            followedId: targetUserId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const followId = `${currentUser.uid}_${targetUserId}`;

        await this.followsCollection.doc(followId).set(followDoc);

        // Incrémenter les compteurs
        const batch = this.db.batch();

        batch.update(this.db.collection('users').doc(currentUser.uid), {
            followingCount: firebase.firestore.FieldValue.increment(1)
        });

        batch.update(this.db.collection('users').doc(targetUserId), {
            followersCount: firebase.firestore.FieldValue.increment(1)
        });

        await batch.commit();

        console.log('✅ User followed:', targetUserId);
    }

    /**
     * Ne plus suivre un utilisateur
     */
    async unfollowUser(targetUserId) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) throw new Error('User not authenticated');

        const followId = `${currentUser.uid}_${targetUserId}`;

        await this.followsCollection.doc(followId).delete();

        // Décrémenter les compteurs
        const batch = this.db.batch();

        batch.update(this.db.collection('users').doc(currentUser.uid), {
            followingCount: firebase.firestore.FieldValue.increment(-1)
        });

        batch.update(this.db.collection('users').doc(targetUserId), {
            followersCount: firebase.firestore.FieldValue.increment(-1)
        });

        await batch.commit();

        console.log('✅ User unfollowed:', targetUserId);
    }

    /**
     * Vérifier si l'utilisateur suit quelqu'un
     */
    async isFollowing(targetUserId) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return false;

        const followId = `${currentUser.uid}_${targetUserId}`;
        const doc = await this.followsCollection.doc(followId).get();

        return doc.exists;
    }

    /**
     * Récupérer les abonnés d'un utilisateur
     */
    async getFollowers(userId) {
        const snapshot = await this.followsCollection
            .where('followedId', '==', userId)
            .get();

        const followerIds = snapshot.docs.map(doc => doc.data().followerId);

        if (followerIds.length === 0) return [];

        // Récupérer les données des abonnés
        const followers = [];
        for (const followerId of followerIds) {
            const userDoc = await this.db.collection('users').doc(followerId).get();
            if (userDoc.exists) {
                followers.push({ uid: followerId, ...userDoc.data() });
            }
        }

        return followers;
    }

    /**
     * Récupérer les abonnements d'un utilisateur
     */
    async getFollowing(userId) {
        const snapshot = await this.followsCollection
            .where('followerId', '==', userId)
            .get();

        const followingIds = snapshot.docs.map(doc => doc.data().followedId);

        if (followingIds.length === 0) return [];

        // Récupérer les données des utilisateurs suivis
        const following = [];
        for (const followedId of followingIds) {
            const userDoc = await this.db.collection('users').doc(followedId).get();
            if (userDoc.exists) {
                following.push({ uid: followedId, ...userDoc.data() });
            }
        }

        return following;
    }

    /**
     * Récupérer les posts des utilisateurs suivis
     */
    async getFollowingPosts(limit = 20) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return [];

        // Récupérer les IDs des utilisateurs suivis
        const followingSnapshot = await this.followsCollection
            .where('followerId', '==', currentUser.uid)
            .get();

        const followingIds = followingSnapshot.docs.map(doc => doc.data().followedId);

        if (followingIds.length === 0) return [];

        // Récupérer les posts (max 10 utilisateurs à la fois pour Firestore 'in')
        const postsSnapshot = await this.db.collection('community_posts')
            .where('authorId', 'in', followingIds.slice(0, 10))
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        }));
    }
}

// Instance globale
window.followSystem = new FollowSystem();