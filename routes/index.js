var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Student     = mongoose.model( 'Student' );
var seatorder = mongoose.model('seatorder');


router.get('/', function(req, res) {
	if (req.session.loginmark == true) {
		res.redirect('/home');
		return;
	}
	res.render('index',{noUser: "visibility: hidden"});
});
router.post('/login',function(req,res){

	var stdname = req.body.name;
	var stdpass = req.body.pass;
	Student.findOne({name: stdname},function(err, student){
		if (!student) {
			res.render('index',{
				noUser: "visibility: visible"
			});
			return;
		}
		else if (stdpass != student.password) {
			res.render('index',{noUser: "visibility: visible"});
			return;
		}
		else if (stdpass == student.password) {
			req.session.loginmark = true;
			req.session.studentname = stdname;
			req.session.studentnumber = student.number
			res.redirect('/home');
		}
	});
});


// remove todo item by its id
module.exports = router;
