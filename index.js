const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 8000

// DB vars
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
const connectionString = process.env.DATABASE_URL || 'postgres://ktbpmcuwirkaoq:39a0add99d89e8a04017792d4e6c3b380a76e72fbed1e35ba614d84cd2042743@ec2-54-159-175-113.compute-1.amazonaws.com:5432/dfr9jk71r6c4fu?ssl=true';
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString, ssl: true});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  // Get views
  .set('views', path.join(__dirname, 'views'))
  // Set view engine
  .set('view engine', 'ejs')
  // Home
  .get('/', (req, res) => res.render('home', { title: "Home"}))
  // Get dashboard view
  .get('/dashboard', (req, res) => res.render('dashboard', { title: "Dashboard"}))
  // Get make Requests view
  .get('/make-request', (req, res) => res.render('make-request', { title: "Make A Request"}))
  // Get account view
  .get('/account', (req, res) => res.render('account', { title: "My Account"}))
  // Get account info
  .get('/get-account-info', getAccountInfo)
  // Get requests view
  .get('/view-requests', (req, res) => res.render('view-requests', { title: "Requests"}))
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
