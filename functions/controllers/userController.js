const userModel = require('../models/userModel')
const authModel = require('../models/authModel')
const {SUCCESS_UPDATE, SUCCESS_CREATE, SUCCESS_GET} = require('../constants/success_messages')
const { GENERIC_ERROR, USERS_NOT_FOUND } = require('../constants/error_messages')

module.exports = {
    async createUser(req, res) {
        const { email, password, name } = req.body;
        const {authorization} = req.headers

        if (!email || !password || !name || typeof authorization === "undefined") {
            return res.status(400).send({ error: "Faltan campos requeridos." });
        }

        const token = authorization.split('Bearer ')[1]

        try {
            const userAdmin = await authModel.getUserByToken(token)
            const userAdminWithPhoto = await authModel.getUserByEmail(userAdmin.email)
            const userRecord = await userModel.createUserAuth(email, password, name, userAdminWithPhoto.photoURL);

            await userModel.saveUserToFirestore(userRecord.email, {
                admin : userAdmin.email,
                email,
                name
            });

            return res.status(201).send({
                message: SUCCESS_CREATE,
                userId: userRecord.uid,
            });
        } catch (error) {
            return res.status(200).send({ error: error.message });
        }
    },

    async setUserClaims(req, res) {
        
        try {
            const {claims, email} = req.body

            if (!email) {
                return res.status(400).send({ error: "Faltan campos requeridos." });
            }

            const userAdmin = await authModel.getUserByEmail(email)

            await userModel.setUserClaims(userAdmin.uid, claims)

            return res.status(201).send({
                message: SUCCESS_UPDATE,
                userId: userAdmin.uid,
            });
        } catch (e) {
            return res.status(200).send({ error: e.message });
        }
    },

    async setUserPhotoUrl(req,res) {

        try {
            const {photoURL, email} = req.body

            if (!photoURL || !email) {
                return res.status(400).send({ error: "Faltan campos requeridos." });
            }

            const userAdmin = await authModel.getUserByEmail(email)
            await authModel.updatePhotoURL(userAdmin.uid, photoURL)

            return res.status(201).send({
                message: SUCCESS_UPDATE,
                userId: userAdmin.uid,
            });
        } catch (e) {
            return res.status(200).send({ error: e.message });
        }
    },

    async getUsersByAdmin(req, res) {

        try {
            const {authorization} = req.headers
            const {name} = req.query

            if (!authorization || !name) {
                return res.status(400).send({
                    message : "Datos requeridos no recibidos"
                })
            }

            const token = authorization.split('Bearer ')[1]
            const userRecord = await authModel.getUserByToken(token)
            const usersSnapshot = await userModel.getUsersFromAdmin(userRecord.email, name)

            if (!usersSnapshot) {
                return res.status(400).send({
                    message:USERS_NOT_FOUND,
                    userRequest: {
                        email : userRecord.email
                    },
                    name
                });
            }

            const users = usersSnapshot.map(userSnapshot => {
                return {
                    "email" : userSnapshot.id,
                    ...userSnapshot
                }
            })

            return res.status(200).send({
                message: SUCCESS_GET,
                data: users,
            });
        } catch (e) {
            return res.status(200).send({
                message: GENERIC_ERROR
            });
        }
    }
};