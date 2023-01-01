const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI,(err)=>{
	if(!err){
		console.log("Database connected");
	}else{
		console.log("Database not connected"+JSON.stringify(err,undefined,2));
	}
});