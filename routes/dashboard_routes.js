const express = require('express')
const router = express.Router();

// Requests model
const request = require('../models/request-model')

// Get dashboard view
router.get('/dashboard', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('home', param);
    } else {
        // if logged in, go to dashboard 
        res.render('dashboard', { title: "Dashboard", userId: req.session.userId, userName: req.session.userName})
    }  
})
// Get make requests view
router.get('/dashboard/make-request', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('home', param);
    } else {
        // if logged in, send user to page
        res.render('make-request', { title: "Make A Request", userId: req.session.userId})
    }  
})
// Get requests view
router.get('/dashboard/requests', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('home', param);
    } else {
        // if logged in, send user to page
        res.render('requests', { title: "Requests", userId: req.session.userId})
    }
})

// Get requests from db
router.get('/get-requests/:id', request.getRequests)
// Submit request
router.post('/submit-request', request.submitRequest)
// Delete request
router.delete('/delete-request/:id', request.deleteRequest)


// EXPORT
module.exports = router;