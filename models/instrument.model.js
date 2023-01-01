const mongoose = require('mongoose');
var instrumentSchema = new mongoose.Schema({
      instrument_token:{
        type:String	
      },
      instrument_type:{
        type:String	
      },
      tradingsymbol:{
        type:String		
      },
      name:{
          type:String		
      },
      expiry:{
        type:String	
      },
      lot_size:{
        type:String
      },
      exchange:{
        type:String,
          required: true		
      },
      segment:{
        type:String		
      },
      last_price:{
        type:String		
      },
      date:{
        type:String	
      }


      
});


mongoose.model('Instrument',instrumentSchema);