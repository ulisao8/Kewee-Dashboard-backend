const admin = require("firebase-admin");
const {USER_COLLECTION} = require("../constants/collection_constants");
const {CLAIMS_ERROR, CREATE_USER_ERROR, FIRESTORE_USER_ERROR} = require('../constants/error_messages')

module.exports = {
    async createUserAuth(email, password, name, photoURL) {
        try {
            return await admin.auth().createUser({
                email,
                password,
                displayName: name,
                photoURL
            });
        } catch (error) {
            throw new Error(`${CREATE_USER_ERROR} ${error.message}`);
        }
    },

    async setUserClaims(uid, claims = {}) {
        try {
            return await admin.auth().setCustomUserClaims(uid,claims)
        } catch (error) {
            throw new Error(`${CLAIMS_ERROR} ${uid}`);
        }
    },

    async saveUserToFirestore(email, userData) {
        try {
            const db = admin.firestore();
            await db.collection(USER_COLLECTION).doc(email).set({
                ...userData
            });
        } catch (error) {
            throw new Error(`${FIRESTORE_USER_ERROR} ${error.message}`);
        }
    },

    async getUsersFromAdmin(email, name) {
        try {
            const db = admin.firestore()
            const usersSnapshot = await db
                .collection(USER_COLLECTION)
                .where('admin', '==', email)
                .get()

            if (usersSnapshot.empty) {
                return false
            }

            let users = []

            for (const doc of usersSnapshot.docs) {
                const data = doc.data();
                const nameInDoc = data.name || "";

                if (nameInDoc.toLowerCase().includes(name.toLowerCase())) {
                    users.push(data);
                }
            }

            if (!users.length) {
                return false
            }

            return users
        } catch (e) {
            return false
        }
    },

    async getAllUsersFromAdmin(email) {
        try {
            const db = admin.firestore()
            const usersSnapshot = await db
                .collection(USER_COLLECTION)
                .where('admin', '==', email)
                .get()

            if (usersSnapshot.empty) {
                return false
            }

            let users = []

            for (const doc of usersSnapshot.docs) {
                const data = doc.data();
                users.push(data);
            }

            if (!users.length) {
                return false
            }

            return users
        } catch (e) {

        }
    },

    async deleteUserFromCollection(uid) {

        return await admin.firestore().collection(USER_COLLECTION)
            .doc(uid)
            .delete()
    }
};
