// Model for Requests

// For form sanitation
const sanitizer = require('sanitize')();

// Require DB model
const db = require('../models/db-model');

// Gets all requests of user from db
function getRequests(req, res) {
    // Sanitize id
    var id = sanitizer.value(req.params.id, 'int');
    console.log("Received request for all requests")
    var sql = `
            SELECT * 
            FROM request
            WHERE employee_id = ${id};
    `;
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
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
    // Sanitize inputs
    var date = sanitizer.value(req.body.date, 'str');
    var hour = sanitizer.value(req.body.hour, 'int');
    var min = sanitizer.value(req.body.min, 'int');
    var time = sanitizer.value(req.body.time, 'str');
    var type = sanitizer.value(req.body.type, 'str');
    var id = sanitizer.value(req.body.userId, 'int');

    var sql = `
        INSERT INTO request (
            req_date,
            req_time_entry,
            req_time_type,
            req_type,
            employee_id
        )  VALUES (
            '${date}',
            '${hour}:${min}:00',
            '${time}',
            '${type}',
            '${id}'
        ) RETURNING id`;
    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null || result.length != 1) {
            console.log("Error submitting request to db", err)
            // Go back to view
			res.render('make-request', { title: "Make A Request", userId: req.session.userId, message: "An error has occurred. Please try again later."})
		} else {
            console.log("Successfully submitted request");
            var param = {result: result, title: "Success! Request submitted", message: "Request submitted.", userId: req.session.userId};
            res.render('success', param);
            // res.send(result);
		}
    });
}

// Delete a req on the db
function deleteRequest(req, res) {
    // Sanitize id
    var id = sanitizer.value(req.params.id, 'int');
    console.log("Received request to delete request with ID: " + id)
    var sql = `
            DELETE FROM request
            WHERE id = ${id}
            RETURNING id;
    `;
    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null || result.length == 0) {
            console.log("Query error!");
			res.status(500).json({success: false, data: err});
		} else {
            console.log("Successfully deleted request");
            res.json(result);
		}
    });
}


// EXPORT
module.exports = {
    getRequests,
    submitRequest,
    deleteRequest
};
