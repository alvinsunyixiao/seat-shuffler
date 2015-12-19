var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Student     = mongoose.model( 'Student' );
var seatorder = mongoose.model('seatorder');





module.exports = router
