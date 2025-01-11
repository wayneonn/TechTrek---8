var mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1loveSQL!",
    database: "dbs_auth_test"
});

module.exports = db; // Export the connection
