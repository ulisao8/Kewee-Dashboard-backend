const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.post('/upload', fileController.uploadFile);
router.get('/', fileController.getFiles)
router.post('/delete', fileController.delete)

module.exports = router;