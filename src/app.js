require('dotenv').config({ path: './src/config/.env' });
const express = require('express');
// Initialize DB connection (pool) on startup
require('./services/dbConnection');
const userrouter = require('./routes/user.routes');
const { errorHandler } = require('./utils/error');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize routes
app.use(userrouter)

// Error handling should be last
app.use(errorHandler);


module.exports = app;


