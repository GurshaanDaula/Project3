require("dotenv").config();
const mysql = require("mysql2/promise");

let sslConfig = undefined;

if (process.env.DB_SSL === "true") {
    // Basic SSL setup for Aiven
    sslConfig = {
        rejectUnauthorized: true
    };

    // Optional: if you inject CA cert via env
    if (process.env.DB_CA_CERT) {
        sslConfig.ca = process.env.DB_CA_CERT;
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: sslConfig
});

module.exports = pool;
