
var http = require('http');
var fs = require('fs');

require('dotenv').config();
require('./config/config');
require('./models/db');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const rtsIndex = require('./routes/index.router');
const passport = require('passport');
const paginate = require('express-paginate');

var app = express();

app.use(paginate.middleware(10, 50));
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.json({ limit: '50mb' }))
app.use((err, req,res,next)=>{
	if(err.name === 'validationError'){
		var valErrors = [];
		Object.keys(err.errors).forEach(key=>valErrors.push(err.errors[key].message));
		res.status(422).send(valErrors);
	}	
});
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin: *');
	res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, noauth ,Authorization,X-Auth-Token");
	next();
 }); 

 require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	console.log('addr: ' + add);
	 
var http = require('http');
var fs = require('fs');

require('dotenv').config();
require('./config/config');
require('./models/db');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const rtsIndex = require('./routes/index.router');
const passport = require('passport');
const paginate = require('express-paginate');

var app = express();

app.use(paginate.middleware(10, 50));
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use(bodyParser.json({ limit: '50mb' }))
app.use((err, req,res,next)=>{
	if(err.name === 'validationError'){
		var valErrors = [];
		Object.keys(err.errors).forEach(key=>valErrors.push(err.errors[key].message));
		res.status(422).send(valErrors);
	}	
});
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin: *');
	res.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, noauth ,Authorization,X-Auth-Token");
	next();
 }); 

 require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	console.log('addr: ' + add);
	console.log(process.env);
  })

 app.use('/',rtsIndex); 
 app.listen(process.env.PORT,()=>console.log(`server started at port: ${process.env.PORT}`));

//https.createServer(https_options, app).listen(`${process.env.PORT}`,'0.0.0.0');

 //module.exports = app;

  })

 app.use('/',rtsIndex); 
 app.listen(process.env.PORT,()=>console.log(`server started at port: ${process.env.PORT}`));

//https.createServer(https_options, app).listen(`${process.env.PORT}`,'0.0.0.0');

 //module.exports = app;
