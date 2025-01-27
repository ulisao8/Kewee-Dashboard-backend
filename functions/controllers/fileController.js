const fileModel = require('../models/fileModel');
const { sendResponse } = require('../utils/responseHelper');
const {fileErrors} = require('../constants/error_messages')
const {fileSuccess} = require('../constants/success_messages')
const authModel = require('../models/authModel')

module.exports = {
    async uploadFile(req, res) {
        const file = req.files[0];
        const fileName = req.body.name
        const email = req.body.email
        const {authorization} = req.headers

        if (!authorization || !fileName || !email) {
            return res.status(400).send({
                message : "Datos requeridos"
            })
        }

        if (!file) {
            return sendResponse(res, 400, fileErrors.FILE_NOT_IN_REQUEST, false);
        }

        const token = authorization.split('Bearer ')[1]
        const userAdminRecordWithToken = await authModel.getUserByToken(token)
        const userRecord = await authModel.getUserByEmail(userAdminRecordWithToken.email)

        try {
            const fileNameFormatted = fileName.replaceAll(" ", "_")
            const fileUrl = await fileModel.uploadFileToStorage(file, fileNameFormatted, userRecord.email);
            await fileModel.storePathInCollection(fileUrl, fileNameFormatted, email)

            return sendResponse(res, 200, fileSuccess.FILE_LOAD_SUCCESS, true, { fileUrl });
        } catch (error) {
            return sendResponse(res, 500, error.message, false);
        }
    },
    async getFiles(req, res) {
        try {
            const {authorization} = req.headers

            if (!authorization) {
                return res.status(400).send({
                    message : "Datos requeridos no recibidos"
                })
            }

            const token = authorization.split('Bearer ')[1]
            const userRecordWithToken = await authModel.getUserByToken(token)
            const userRecord = await authModel.getUserByEmail(userRecordWithToken.email)
            const isAdmin = userRecord.customClaims?.role ?? "";

            const data = await fileModel.getFilesFromStorage(userRecord.email,isAdmin)

            return res.status(200).send({
                data
            });
        } catch (error) {
            return res.status(500).send(fileErrors.ERROR_TO_GET_FILES);
        }
    },

    async delete(req, res) {
        try {
            const {authorization} = req.headers
            const {fileName, email} = req.body

            if (!authorization) {
                return res.status(400).send({
                    message : "Datos requeridos no recibidos"
                })
            }

            const token = authorization.split('Bearer ')[1]
            const userRecordWithToken = await authModel.getUserByToken(token)
            await fileModel.deleteFile(userRecordWithToken.email, fileName)
            await fileModel.deleteFileFromFirebase(fileName, email);

            return res.send({
                message : "Se ha eliminado correctamente el archivosss"
            })

        } catch (e) {
            return res.status(403).send({
                message : "Ha ocurrido un error al eliminar el archivo"
            })
        }
    }
};
