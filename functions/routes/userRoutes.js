const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController')

router.post('/create', userController.createUser)
router.get('/myUsers', userController.getUsersByAdmin)
router.post('/claims', userController.setUserClaims)
router.post('/photoURL', userController.setUserPhotoUrl)
router.get('/admin', userController.getAllUserFromAdmin);
router.post('/delete', userController.deleteUser)

module.exports = router