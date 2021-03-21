const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 8000

// DB vars
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
const connectionString = process.env.DATABASE_URL || 'postgres://ktbpmcuwirkaoq:39a0add99d89e8a04017792d4e6c3b380a76e72fbed1e35ba614d84cd2042743@ec2-54-159-175-113.compute-1.amazonaws.com:5432/dfr9jk71r6c4fu?ssl=true';
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString, ssl: true});

// // init app
// const app = express();

// // static files
// app.use(express.static(path.join(__dirname, 'public')));
// // body parser
// app.use(express.urlencoded({ extended: true }));
// // set view engine
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');


express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // routes
  .get('/', (req, res) => res.render('home', { title: "Home"}))
  .get('/dashboard', (req, res) => res.render('dashboard', { title: "Dashboard"}))
  .get('/requests', (req, res) => res.render('requests', { title: "Requests"}))
  .get('/view-requests', getRequests)
  .get('/account', (req, res) => res.render('account', { title: "Accounts"}))
  // post requests
  .post('/result', (req, res) => {
      console.log("Received a request for the results page");
      var param = {rate : calculateRate(req.body.weight, req.body.type)};
      res.render('result', param)
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

function getRequests(req, res) {
    console.log("Received request for account info")
    var sql = "SELECT * FROM employee";
    queryDB(sql, (err, result) => {
        if (err || result == null || result.length != 1) {
			res.status(500).json({success: false, data: err});
		} else {
            // var result = { message: "Hi" }
			// res.status(200).json(result);
            //res.render('view-request', result[0]);
            res.send(result[0]);
		}
    });
}

function queryDB(sql, callback) {
    pool.query(sql, (err, res) => {
        if (err) { 
            console.log("Error in query: ", err);
            callback(err, null);
        }
        console.log("Result: ");
        console.log(JSON.stringify(res.rows));
        callback(null, res.rows);
    });
    
}



// let likesContainer = document.getElementById("likes-displayed");
// fetch("http://www.example.com/books/1", {
//   method: "PATCH",
//   headers: {
//       "Content-Type" : "application/json"
//     },
//   body: JSON.stringify(
//     {
//       "likes": 5
//     }
//   )
// })
// .then(response => response.json())
// .then(json => {
//   likesContainer.innerText = `${json.likes} likes`;
// });



// fetch('/view-requests').then((response) => {
//     return response.json();
// }).then(data => {

// }).catch((err) => {

// });