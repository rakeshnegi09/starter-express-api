const mongoose = require('mongoose');
var futureSchema = new mongoose.Schema({
   
    instrument_token:{
		type:String,
        required: true		
	},
    high:{
		type:String,
        required: true		
	},
    low:{
        type:String,
            required: true		
    },
    price_10_am:{
        type:String,
            required: true		
        },
    date:{
        type:String,
        default:Date.now
    }    
});


mongoose.model('Future',futureSchema);