var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var mongoose = require( 'mongoose' );
var schedule = require('node-schedule');
var Student     = mongoose.model( 'Student' );
var seatorder = mongoose.model('seatorder');
var seatrequest = mongoose.model('seatrequest');


router.get('/',function(req,res){
  var dt = new Date();
  var day = dt.getDay();
  var hour = dt.getHours();
  var minute = dt.getMinutes();
  if (day==6 && minute>=58 && hour==7){
    res.redirect('/home');
    return;
  }
  seatorder.findOne(function(err, seatod){
    var od = seatod.order;
    var namelist = new Array(39);
    Student.find(function(err,stds){
      for (var i=0;i<39;i++) {
        for (j in stds) {
          if (stds[j].number == od[i]) {
            namelist[i] = stds[j].name;
            break;
          }
        }
      }
      res.render('normalview',{
        namelist: namelist
      });
    });
  });
});


module.exports = router;
