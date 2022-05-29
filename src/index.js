const express = require('express');
const mongoose = require('mongoose');
const route = require('./routes/route');
const multer= require("multer");


const app = express();
app.use( multer().any())

mongoose.connect("mongodb+srv://salman-110:Salman110@cluster0.qfvxy.mongodb.net/group43dataBase")
.then(() => console.log("MongoDB Is Connected"))
.catch(err => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express App Is Running On Port ' + (process.env.PORT || 3000))
});