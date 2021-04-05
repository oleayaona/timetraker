const express = require('express')
const path = require('path')

// Session module
const session = require('express-session');

const PORT = process.env.PORT || 8000

// Routes
const homeRoutes = require('./routes/home_routes');
const accountRoutes = require('./routes/account_routes');
const dashboardRoutes = require('./routes/dashboard_routes');

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(session({
    name: 'server-session-cookie-id',
    secret: 'timetrak',
    saveUninitialized: true,
    resave: true
  }))
  // Get views
  .set('views', path.join(__dirname, 'views'))
  // Set view engine
  .set('view engine', 'ejs')
  /*-------------*/
  /*   ROUTES    */
  /* ------------*/
  // Home
  .get('/', (req, res) => {
      // If user is not logged in, redirect to home for login
      if (typeof req.session.userId === 'undefined') {
        res.render('home', {title: "Home"});
      } else {
        // For ejs output
        res.locals.first_name = req.session.userName;
        // if logged in, go to dashboard 
        res.render('dashboard', { title: "Dashboard"})
      }
  })
  // Home routes
  .use(homeRoutes)
  // Account routes
  .use(accountRoutes)
  // Dashboard routes
  .use(dashboardRoutes)

  // Handle 404
  .use(function(req, res) {
    // If user is not logged in, don't display nav
    if (typeof req.session.userId === 'undefined') {
        res.render('404', {title: '404: File Not Found'});
    } else {
        // pass userId from session
        res.render('404', {title: '404: File Not Found', userId: req.session.userId});
    }
    
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
