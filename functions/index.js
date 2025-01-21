const functions = require("firebase-functions");
const express = require('express')
const fileParser = require('express-multipart-file-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/filesRoutes')
const userRoutes = require('./routes/userRoutes')
const { initializeApp } = require('firebase-admin/app');

initializeApp();

const app = express()

app.use(fileParser)
app.use(cors({origin: true}))
app.use(bodyParser.urlencoded({extended: true}))

app.use('/auth', authRoutes)
app.use('/files', fileRoutes)
app.use('/users', userRoutes)

exports.api = functions.https.onRequest(app)