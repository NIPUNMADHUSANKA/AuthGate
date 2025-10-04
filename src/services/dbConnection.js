const dbconnection = require('mysql2');

const pool = dbconnection.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port: process.env.DB_PORT,
    max:process.env.DB_POOL_SIZE || 10, // Maximum number of connections in pool,
});

pool.getConnection((err, connection)=>{
    if(err){
        console.error("Error connecting to database:", err);
    }
    else{
        console.log("Database connected successfully");
        connection.release(); // After you use a connection, you must release it back to the pool, otherwise you’ll leak connections and eventually hit DB limits.
    }
})
module.exports = pool.promise();   //This converts the pool into its promise-based API. Now you can use async/await instead of callbacks