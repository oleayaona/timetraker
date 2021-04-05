// Main model for db interactions

// DB vars
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
const connectionString = process.env.DATABASE_URL || 'postgres://ktbpmcuwirkaoq:39a0add99d89e8a04017792d4e6c3b380a76e72fbed1e35ba614d84cd2042743@ec2-54-159-175-113.compute-1.amazonaws.com:5432/dfr9jk71r6c4fu?ssl=true';
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString, ssl: true});


// Handles db queries
function queryDB(sql, callback) {
    pool.query(sql, (err, res) => {
        if (err || res == null || res.length == 0) { 
            console.log("Error in query: ", err);
            callback(err, null);
        } else {
            console.log("Got results from db!");
            console.log("Query result:");
            console.log(JSON.stringify(res.rows));
            callback(null, res.rows);
        }
    });
    
}

// Export
module.exports = {
    queryDB
}