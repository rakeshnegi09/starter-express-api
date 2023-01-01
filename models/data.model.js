const mongoose = require('mongoose');
var dataSchema = new mongoose.Schema({
    id:{
		type:String,
        required: true		
	},
    value:{
		type:String,
        required: true		
	},
  last_trade_time:{
  type:String,
      required: true		
}
});


mongoose.model('Data',dataSchema);