const express = require('express')
const router = express.Router();
// Account model
const account = require('../models/account-model')


// Sign up page
router.get('/home/create-account', (req, res) => res.render('create-account', { title: "Create Account"}))
// Verify employee info
router.post('/home/create-account/verify', account.verifyEmployee)
// Verify employee info
router.post('/home/create-account/submit', account.createAccount)
// Login
router.post('/home/login', account.verifyLogin)


// EXPORT
module.exports = router;