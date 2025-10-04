const express = require('express');
const dbconnection = require('./services/dbConnection');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


module.exports = app;


