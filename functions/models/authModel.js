const admin = require('firebase-admin');
const {error} = require("firebase-functions/logger");
const {USER_COLLECTION} = require("../constants/collection_constants");

module.exports = {
    async getUserByEmail(email) {
        try {
            return await admin.auth().getUserByEmail(email);
        } catch (error) {
            throw error;
        }
    },
    async getUserByToken(token) {
        try {
            return await admin.auth().verifyIdToken(token)
        } catch (e) {
            throw error
        }
    },
    async updatePhotoURL(uid, photoURL) {
        try {
            return await admin.auth().updateUser(uid, {
                photoURL
            })
        } catch (e) {
            throw error
        }
    },
    async getImageUrlOfItsAdmin(email) {
        const snapshot = await admin.firestore()
            .collection(USER_COLLECTION)
            .doc(email)
            .get()

        if (!snapshot.exists) {
            return ""
        }

        const adminRef = snapshot.data().admin
        const userAdmin = await this.getUserByEmail(adminRef)

        return userAdmin.photoURL
    },
    async deleteUser(uid) {
        try {
            return await admin.auth().deleteUser(uid)
        } catch (e) {
            return false
        }
    }
};