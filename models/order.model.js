const mongoose = require('mongoose');
var orderSchema = new mongoose.Schema({
   
    trigger_id:{
		type:String,
        required: true		
	},
    tradingSymbal:{
		type:String,
        required: true		
	},
    tradePrice:{
        type:String,
            required: true		
    },
    stopLossPrice:{
        type:String,
            required: true		
        },
    profitPrice:{
        type:String,
            required: true		
        },
    date:{
        type:String,
        default:Date.now
    }    
});


mongoose.model('Order',orderSchema);