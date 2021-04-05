const express = require('express')
const router = express.Router();
// Account model
const account = require('../models/account-model')


// Get account view
router.get('/dashboard/account', (req, res) => {
    // If user is not logged in, redirect to home for login
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('home', param);
    } else {
        // if logged in, deliver view
        res.render('account', { title: "My Account", userId: req.session.userId})
    }
})
// Get account info
router.get('/get-account-info/:id', account.getAccountInfo)
// Logout
router.get('/account/logout', account.handleLogout)


// EXPORT
module.exports = router;