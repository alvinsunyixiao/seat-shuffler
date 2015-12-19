var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var studentschema = new Schema({
    name:       String,
    number:     Number,
    password:   String,
});

var seatschema = new Schema({
	order:   [Number]
});

var seatrequestschema = new Schema({
  name:     String,
  pointername:  String,

});

mongoose.model('seatorder',seatschema);
mongoose.model( 'Student', studentschema );
mongoose.model('seatrequest', seatrequestschema);
mongoose.connect( 'mongodb://localhost/seatnumber' );
