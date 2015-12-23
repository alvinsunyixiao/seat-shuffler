var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var mongoose = require( 'mongoose' );
var schedule = require('node-schedule');
var Student     = mongoose.model( 'Student' );
var seatorder = mongoose.model('seatorder');
var seatrequest = mongoose.model('seatrequest');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = 6;
rule.minute = 0;
rule.hour = 8;

function GetRandomNum(Min,Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return(Min + Math.round(Rand * Range));
}

var myEvent = schedule.scheduleJob(rule,function(){
  seatorder.findOne(function(err, seatod){
    var od = seatod.order;
    var myArr = new Array(39);
    for (var i=0;i<39;i++) {
      myArr[i] = i+1;
    }
    for (var i=0;i<2000;i++) {
      var as = GetRandomNum(0,38);
      var bs = GetRandomNum(0,38);
      var temp = myArr[as];
      myArr[as] = myArr[bs];
      myArr[bs] = temp;
    }
    seatod.remove();
    new seatorder({order: myArr}).save();
    seatrequest.find(function(err,seatreq){
      for (i in seatreq) {
        seatreq[i].remove();
      }
    });
  });
});

router.get('/',function(req,res){
  seatorder.findOne(function(err, seatod){
    if (!req.session.loginmark) {
      res.redirect('../');
      return;
    }
    var dt = new Date();
  	var day = dt.getDay();
  	var hour = dt.getHours();
  	var minute = dt.getMinutes();
  	minute = minute + hour*60;
    if (day==3 || day==4 || day==5 || (day==6 && minute<478)) {
  		res.redirect('/normalview');
  		return;
  	}
    var od = seatod.order;
    var namelist = new Array(39);
    var student = new Array(39);
    var highlights = new Array(39);
    var names = new Array(39);
    Student.find(function(err, stds){
      for (var i=0;i<39;i++) {
        for (j in stds) {
          if (od[i]==stds[j].number) {
            namelist[i]=stds[j].name;
            student[i]=stds[j];
          }
          if (stds[j].number==i+1) {
            names[i] = stds[j].name;
          }
        }
      }

        //console.log(namelist[i]);
      seatrequest.find({
        name: req.session.studentname
      },function(err,strs){
        for (var i=0;i<39;i++) {
          highlights[i] = "";
          for (j in strs) {
            if (strs[j].pointername==namelist[i]) {
              highlights[i] = "color: #41A009;border:3px solid;border-color: #B7830E;border-radius: 10px";
              //console.log(i+" "+highlights[i]);
              break;
            }
            else {
              continue;
            }
          }
        }
        seatrequest.find({
          pointername: req.session.studentname
        },function(err,seatrs){
          for (var i=0;i<39;i++) {
            for (j in seatrs) {
              if (seatrs[j].name==namelist[i]) {
                highlights[i] = "border:3px dotted;border-color: red";
                break;
              }
              else {
                continue;
              }
            }
          }
          res.render('home',{
            names:names,
            highlights: highlights,
            student: student,
            namelist: namelist,
            seatorder: seatod.order,
            title: "座位",
            tag: req.session.studentnumber,
            nametag: req.session.studentname
          },function(err, html){
            res.send(html);
          });
        });
      });
    });
  });
});

router.post('/logout',function(req, res){
  req.session.destroy();
  res.redirect('../');
});

router.post('/password',function(req,res){
  if (!req.session.loginmark) {
    res.redirect('../');
    return;
  }
  res.render('passwordchange',{
    title: "Change Password",
    msg: "",
    stl: "visibility: hidden"
  });
});

router.get('/change/:namestr',function(req,res){
  if (!req.session.loginmark) {
    res.redirect('../');
    return;
  }
  var dt = new Date();
  var day = dt.getDay();
  var hour = dt.getHours();
  var minute = dt.getMinutes();
  minute = minute + hour*60;
  if (day==3 || day==4 || day==5 || (day==6 && minute<478)) {
		res.redirect('/normalview');
		return;
	}
  seatorder.findOne(function(err,seatod){
    var namestring = req.params.namestr;
    seatrequest.findOne({
      name: req.session.studentname,
      pointername: namestring
    },function(err, str){
      seatrequest.findOne({
        name: namestring,
        pointername: req.session.studentname
      },function(err,opstr){
        Student.find(function(err,stds){
          seatorder.findOne(function(err,seatod){
            if (!str) {
              if (!opstr){
                new seatrequest({
                  name: req.session.studentname,
                  pointername: namestring
                }).save();
                res.redirect('/home');
              }
              else {
                var od = seatod.order;
                var me=0,you=0;
                for (i in stds) {
                  if (stds[i].name==req.session.studentname) {
                    me = stds[i].number;
                  }
                  if (stds[i].name==namestring) {
                    you = stds[i].number;
                  }
                }
                for (i in od) {
                  if (od[i]==me) {
                    od[i] = you;
                    continue;
                  }
                  if (od[i]==you) {
                    od[i] = me;
                    continue;
                  }
                }
                opstr.remove();
                seatod.remove();
                new seatorder({
                  order: od
                }).save(function(err, stod){
                  seatrequest.find({name: namestring},function(err,seatrqs){
                    for (i in seatrqs) {
                      seatrqs[i].remove();
                    }
                    res.redirect('/home');
                  });
                });
              }
            }
            else {
              str.remove()
              res.redirect('/home');
            }
          });
        });
      });
    });
  });
});

router.post('/submitpassword',function(req,res){
  var oldpassword = req.body.oldpass;
  var newpassword = req.body.newpass;
  var newpasswordcf = req.body.newpasscf;
  Student.findOne({name: req.session.studentname},function(err,std){
    if (!req.session.loginmark) {
      res.redirect('../');
      return;
    }
    if (std.password != req.body.oldpass) {
      console.log(req.body);
      res.render('passwordchange',{
        title: "Change Password",
        msg: "旧密码错误",
        stl: "visibility: visible"
      });
      return;
    }
    else if (req.body.newpass != req.body.newpasscf){
      res.render('passwordchange',{
        title: "Change Password",
        msg: "两次新密码输入必须相同",
        stl: "visibility: visible"
      });
      return;
    }
    else {
      std.password = newpassword;
      std.save();
      req.session.destroy();
      res.redirect('/');
    }
  });
});

module.exports = router;
