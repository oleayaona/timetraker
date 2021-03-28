const express = require('express')
const path = require('path')
// For form sanitation
const sanitizer = require('sanitize')();
// Password hasher
const bcrypt = require('bcrypt');
const saltRounds = 10;

const PORT = process.env.PORT || 8000

// DB vars
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
const connectionString = process.env.DATABASE_URL || 'postgres://ktbpmcuwirkaoq:39a0add99d89e8a04017792d4e6c3b380a76e72fbed1e35ba614d84cd2042743@ec2-54-159-175-113.compute-1.amazonaws.com:5432/dfr9jk71r6c4fu?ssl=true';
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString, ssl: true});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  // Get views
  .set('views', path.join(__dirname, 'views'))
  // Set view engine
  .set('view engine', 'ejs')
  // Home
  .get('/', (req, res) => res.render('home', { title: "Home"}))
  // Sign up page
  .get('/home/create-account', (req, res) => res.render('create-account', { title: "Create Account"}))
  // Verify employee info
  .post('/home/create-account/verify', verifyEmployee)
  // Verify employee info
  .post('/home/create-account/submit', createAccount)
  // Login
  .post('/home/login', verifyLogin)
  // Get dashboard view
  .get('/dashboard', (req, res) => res.render('dashboard', { title: "Dashboard"}))
  // Get make Requests view
  .get('/make-request', (req, res) => res.render('make-request', { title: "Make A Request"}))
  // Get account view
  .get('/account', (req, res) => res.render('account', { title: "My Account"}))
  // Get account info
  .get('/get-account-info', getAccountInfo)
  // Get requests view
  .get('/requests', (req, res) => res.render('requests', { title: "Requests"}))
  // Get requests view
  .get('/get-requests', getRequests)
  // Submit request
  .post('/submit-request', submitRequest)
//   .post('/submit-request', (req, res) => {
//     console.log("Submitting request...");
//     var param = {rate : calculateRate(req.body.weight, req.body.type)};
//     res.render('result', param)
//   })
  // Handle 404
  .use(function(req, res) {
    res.status(400);
    res.render('404', {title: '404: File Not Found'});
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


// GET
// Gets account info from db
function getAccountInfo(req, res) {
    console.log("Received request for account info")
    var sql = "SELECT * FROM employee";
    queryDB(sql, (err, result) => {
        if (err || result == null || result.length != 1) {
			res.status(500).json({success: false, data: err});
		} else {
            // res.render('view-request', result[0]);
            res.send(result[0]);
		}
    });
}

// GET
// Gets all requests from db
function getRequests(req, res) {
    console.log("Received request for all requests")
    var sql = "SELECT * FROM request";
    queryDB(sql, (err, result) => {
        if (err || result == null || result.length == 0) {
            console.log("Query error!");
			res.status(500).json({success: false, data: err});
		} else {
            res.json(result);
		}
    });
}

// POST
// Submits a request to db
function submitRequest(req, res) {
    // With hardcoded employee ID for now
    var sql = `
        INSERT INTO request (
            req_date,
            req_time_entry,
            req_time_type,
            req_type,
            employee_id
        )  VALUES (
            '${req.body.date}',
            '${req.body.hour}:${req.body.min}:00',
            '${req.body.time}',
            '${req.body.type}',
            1
        ) RETURNING id`;
    console.log("Now executing SQL: " + sql);
    queryDB(sql, (err, result) => {
        if (err || result == null || result.length != 1) {
            console.log("Error submitting request to db", err)
			res.status(500).json({success: false, data: err});
		} else {
            console.log("Successfully submitted request");
            var param = {result: result, title: "Success! Request submitted"};
            res.render('success', param);
            // res.send(result);
		}
    });
}

// Verify login
function verifyLogin(req, res) {
    var email = sanitizer.value(req.body.email, 'email');
    var password = sanitizer.value(req.body.password, /(?=.{8,})(?=.*[a-zA-Z]).*$/);
    var emailExists = checkEmail(email)

    if (!emailExists) {
        var param = {message: "Invalid email or password. Please try again.", title: "Home | Login"};
        res.render('home', param);
    } else {
        var userData = getUserInfo(email, (err, res) => {
            if (err) {
                var param = {message: "Server error :( Can't login. Please try again later", title: "Home | Login"};
                res.render('home', param);
            } else {
                // verify password
                bcrypt.compare(password, res[0].password, function(err, result) {
                    if (err) {
                        var param = {message: "Invalid email or password. Please try again.", title: "Home | Login"};
                        res.render('home', param);
                    } else {
                        res.render('dashboard', {title: "Dashboard"});
                    }
                });
            }
        });
        
    }

}

// Check if email exists in db
function checkEmail(email){
    var sql = `SELECT * FROM employee WHERE emp_email = ${email} RETURNING id`;
    console.log("Now executing SQL: " + sql);
    queryDB(sql, (err, result) => {
        if (err || result == null || result.length == 0) {
            // no matching email- unsuccessful
			return false;
		} else {
            // success
            return true;
		}
    });
}

// GET
// Gets user info from db
function getUserInfo(email, callback) {
    console.log("Retrieving user info for login verification...")
    var sql = `SELECT * FROM public.user WHERE email = '${email}'`;
    queryDB(sql, (err, result) => {
        if (err || result == null || result.length != 1) {
			console.log("Error getting user info: ", err);
            callback(err, null); 
		} else {
            console.log("User info query result: ");
            console.log(JSON.stringify(res.rows));
            callback(null, res.rows);
		}
    });
}


// POST
// Verify if employee email and ID are in db
function verifyEmployee(req, res) {
    console.log("Verifying employee...")
    // Sanitize
    var emp_email = sanitizer.value(req.body.emp_email, 'email');
    var id = sanitizer.value(req.body.id, 'int');
    var sql = `
        SELECT * 
        FROM employee
        WHERE emp_email = '${emp_email}' AND id = ${id}`;
    console.log("Now executing SQL: " + sql);
    queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error verifying employee info in db", err)
			res.status(500).json({success: false, data: err});
		} else {
            console.log("Email and ID verified!");
            console.log(result);
            res.send(result);
		}
    });
}

// Create account in db
function createAccount(req, res) {
    // Check password agains regex
    var password = sanitizer.value(req.body.password, /(?=.{8,})(?=.*[a-zA-Z]).*$/)
    var hashed = '';
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            console.log("Error while hashing", err)
        } else {
            hashed = hash;
        }
    });
    var sql = `
        INSERT INTO public.user (
            email,
            password,
            employee_id
        )
        VALUES (
            'email.com',
            'passwordhashed',
            '3555'
        )
        RETURNING id`;
    console.log("Now executing SQL: " + sql);
    queryDB(sql, (err, result) => {
        if (err || result == null || result.length == 0) {
            console.log("Error creating account", err)
			res.status(500).json({success: false, data: err});
		} else {
            console.log("Successfully created account!");
            console.log("Now adding user_id to employee...");
            console.log(result);
            // update employee info with user_id
            addUserId(result, req.body.id, (err, result) => {
                console.log("Returned from db successful update.");
                res.render('dashboard', {title: "Dashboard"});
            })
		}
    });
}


// POST
// Update employee info with user account ID
function addUserId(result, emp_id, callback) {
    var sql = `
        UPDATE employee
        SET user_id = ${result[0].id}
        WHERE id = ${emp_id}`;
    console.log("Now executing SQL: " + sql);
    queryDB(sql, (err, res) => {
        if (err) {
            console.log("Error adding user_id", err)
            res.status(500).json({success: false, data: err});
        } else {
            console.log("Successfully added user_id");
            callback(null, res.rows);
        }
    })
}


// Handles db queries
function queryDB(sql, callback) {
    pool.query(sql, (err, res) => {
        if (err) { 
            console.log("Error in query: ", err);
            callback(err, null);
        } else {
            console.log("Query result: ");
            console.log(JSON.stringify(res.rows));
            callback(null, res.rows);
        }
    });
    
}
