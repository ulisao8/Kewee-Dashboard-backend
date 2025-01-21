const authModel = require('../models/authModel');
const { sendResponse } = require('../utils/responseHelper');
const {authErrors} = require('../constants/error_messages')
const {authSuccess}  = require('../constants/success_messages')

module.exports = {
    async login (req,res) {
        const { email } = req.body;

        if (!email) {
            return sendResponse(res, 400, authErrors.WRONG_CREDENTIALS, false);
        }

        try {
            const userRecord = await authModel.getUserByEmail(email);
            const role = userRecord.customClaims?.role ?? "";
            let photoURL = userRecord.photoURL ?? "";

            if (role !== "admin") {
                photoURL = await authModel.getImageUrlOfItsAdmin(userRecord.email)
            }

            return sendResponse(res, 200, authSuccess.SUCCESS_LOGIN, true, { role, photoURL });
        } catch (error) {

            if (error.code === "auth/user-not-found") {
                return sendResponse(res, 404, authErrors.USER_NOT_FOUND, false);
            }

            return sendResponse(res, 500, "Error interno del servidor", false);
        }
    }
};
