const admin = require('firebase-admin');
const path = require('path');
const { Readable } = require('stream');
const {FILE_COLLECTION, USER_COLLECTION} = require("../constants/collection_constants");
const {ONLY_PDF_ALLOWED, ERROR_ON_LOAD_FILE, USER_NOT_FOUND} = require('../constants/error_messages')

module.exports = {
    async uploadFileToStorage (file, fileName, adminEmail) {
        const storage = admin.storage().bucket();
        const originalName = file.originalname;
        const extension = path.extname(originalName);

        if (file.mimetype !== 'application/pdf' || extension !== '.pdf') {
            throw new Error(ONLY_PDF_ALLOWED);
        }
        const fileStream = Readable.from(file.buffer);
        const fileUpload = storage.file(`${adminEmail}/${fileName}`);
        const writeStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            }
        });

        return new Promise((resolve, reject) => {
            fileStream.pipe(writeStream)
                .on('error', err => reject(err))
                .on('finish', async () => {
                    try {
                        await fileUpload.makePublic();
                        const fileUrl = `https://storage.googleapis.com/${storage.name}/${fileUpload.name}`;
                        resolve(fileUrl);
                    } catch (e) {
                        reject(new Error(ERROR_ON_LOAD_FILE));
                    }
                });
        });
    },

    async getFilesFromStorage (email, isAdmin){
        let snapshot = await admin.firestore()
            .collection(USER_COLLECTION)
            .doc(email)
            .get();

        if (isAdmin) {
            let files = []

            const snapshot = await admin.firestore()
                .collection(USER_COLLECTION)
                .where('admin', '==', email)
                .get()

            if (snapshot.empty) {
                return false
            }

            const docsData = snapshot.docs.map(doc => doc.data())

            for (const doc of docsData) {
                const docFiles = doc.files ?? []

                for (const file of docFiles) {
                    files.push({
                        ...file,
                        "email" : doc.email
                    })
                }
            }

            return files
        }

        if (!snapshot.exists || !snapshot.data().files || !snapshot.data().files.length) {
            return false
        }

        return snapshot.data().files
    },

    async deleteFile(prefix, fileName) {
        try {
            await admin.storage().bucket()
                .file(prefix + "/" + fileName)
                .delete();

            return true
        } catch (e) {
            return false
        }
    },

    async deleteFileFromFirebase (fileName, email) {
        try {
            const snapshot = await admin.firestore()
                .collection(USER_COLLECTION)
                .doc(email)

            const docRef = await snapshot.get()
            if (!docRef.exists) {
                return false
            }

            const data = docRef.data();
            const arrayFiles = data["files"] || [];
            const updatedArray = arrayFiles.filter(item => item["name"] !== fileName);

            await snapshot.update({ ["files"]: updatedArray });
        } catch (e) {
            return false
        }
    },

    async storePathInCollection (path, fileName, email) {

        const collectionRef = admin.firestore().collection(USER_COLLECTION);
        const snapshot = await collectionRef.doc(email).get()

        if (!snapshot.exists) {
            throw new Error(USER_NOT_FOUND);
        }

        let files = snapshot.data().files || [];
        const fileAlreadyExists = files.some(file => file.name === fileName)

        if (!fileAlreadyExists) {
            files = [...files, {path, name: fileName}];
            await snapshot.ref.update({files});
        } else if (!files.length) {
            await collectionRef.doc(email).update({
                files: [{path, name: fileName}],
            });
        }
    }
}