const mysql = require("mysql2");

require("dotenv").config();



const poolConfig = {

    host: process.env.DB_HOST || "localhost",

    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "traveltours",

    waitForConnections: true,

    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,

    queueLimit: 0,

    enableKeepAlive: true,

    keepAliveInitialDelay: 0

};



const isRemoteHost = poolConfig.host && !poolConfig.host.includes("localhost") && !poolConfig.host.includes("127.0.0.1");
if (process.env.DB_SSL === "true" || process.env.DB_SSL === "require" || isRemoteHost) {

    poolConfig.ssl = { rejectUnauthorized: false };

}



const pool = mysql.createPool(poolConfig);



pool.getConnection((err, connection) => {

    if (err) {

        console.error("❌ Database Connection Warning:", err.message);

    } else {

        console.log("✅ Database Pool Connected Successfully");

        connection.release();

    }

});



module.exports = pool;
