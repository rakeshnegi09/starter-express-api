const mongoose = require('mongoose');
var tokenSchema = new mongoose.Schema({
     access_token:{
		type:String,
        required: true		
	},
    request_token:{
		type:String,
        required: true		
	},
    date:{
      type:String,
        required: true		
    }
});


mongoose.model('Token',tokenSchema);