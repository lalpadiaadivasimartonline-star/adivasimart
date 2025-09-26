const mySql = require("mysql2");

const pool = mySql.createPool({
  host: process.env.DB_HOST || "srv1401.hstgr.io",
  user: process.env.DB_USER || "u813762469_lalpadia",
  password: process.env.DB_PASSWORD || "Badal@25102000",
  database: process.env.DB_NAME || "u813762469_Lalpadia",
  port: process.env.DB_PORT || 3306,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  connectionLimit: 10,
});

// const pool = mySql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "Nonha@0605",
//   database: "lalpadia",
// });

module.exports = pool.promise();
