var KiteConnect = require("kiteconnect").KiteConnect;

/******************************************/
const mongoose = require('mongoose');
const Token = mongoose.model('Token');
const Instrument = mongoose.model('Instrument');
const Future = mongoose.model('Future');
const Order = mongoose.model('Order');
require('dotenv').config();
const fs = require('fs');
/*******************************************/


var array = fs.readFileSync('verification.txt').toString().split("\n");
var api_key = process.env.API_KEY,
	secret = process.env.SECRET_KEY,
	request_token = array[0],
	access_token = array[1]

var options = {
	"api_key": api_key,
	"debug": false
};
let  kc = new KiteConnect(options); 
kc.setSessionExpiryHook(5000000);

if(!access_token) {
	kc.generateSession(request_token, secret)
		.then(function(response) {
			kc.setAccessToken(access_token);
		})
		.catch(function(err) {
			console.log(err);
		})
} else {
	kc.setAccessToken(access_token);
}

module.exports = {
	save_access_token:async function(req, res){
		
		let checkIfTokenExist = await Token.findOne({date:convertDate(new Date())});
		if(checkIfTokenExist == null){
			var url = require('url');
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			var request_token = query.request_token;
			if(typeof request_token !== "undefined"){
				kc.generateSession(request_token, secret)
				.then(function(response) {
					var fs = require('fs');
					var stream = fs.createWriteStream('verification.txt')
					stream.once('open', function(fd) {
						stream.write(request_token+"\n");
						stream.write(response.access_token+"\n");
						stream.end();
					}); 
	
						var token = new Token(); 
						token.request_token = request_token;
						token.access_token = response.access_token;
						token.date = convertDate(new Date());
						token.save();
						res.send({"result":"Login Success"});	

				})
				.catch(function(err) {
					console.log(err);
				})
			}else{
				res.send({"result":"Invalid request"});
			}
			
		}else{
			res.send({"result":"Already Exist"});
		}		
	},

	importInstruments:async function(req,res){
		await Instrument.deleteMany();
		kc.getInstruments("NFO").then(function(response) {			
			response.forEach(element => {
				let instruments = new Instrument();
				instruments.instrument_token	= element['instrument_token'];
				instruments.tradingsymbol = element['tradingsymbol'];
				instruments.name = element['name'];
				instruments.expiry = element["expiry"];
				instruments.lot_size = element["lot_size"];
				instruments.exchange = element["exchange"]; 
				instruments.instrument_type = element["instrument_type"];
				instruments.segment = element["segment"];
				instruments.last_price = element["last_price"];
				instruments.date = convertDate(new Date());
				instruments.save();
			});	
			res.send({"Result": "Imported"});
		}).catch(function(err) {
			console.log(err);
		})
	}
}

var KiteTicker = require("kiteconnect").KiteTicker;
var ticker = new KiteTicker({
	api_key: api_key,
	access_token: access_token 
});

ticker.connect();
ticker.on('ticks', onTicks);
ticker.on('connect', subscribe);


 async function subscribe() {
	var futureThisMonthSymbolBankNifty = process.env.BANKNIFTYFUTURETHISMONTH;
	var getInstrumentsToken = await Instrument.findOne({tradingsymbol:futureThisMonthSymbolBankNifty});
	var instrument_token = getInstrumentsToken.instrument_token;	
	var items = [instrument_token];
	console.log(items)	
	ticker.subscribe(items);
	ticker.setMode(ticker.modeFull, items);
}


 async function onTicks(ticks) {	
	let dataLast = await Future.findOne({date:convertDate(new Date())});
	var endTime = "10:00:00";
	var d = new Date();
	var hour = d.getHours();
	var minute = d.getMinutes(); 
	var second = d.getSeconds(); 
	var currentTime = d+":"+hour+":"+minute+":"+second;
	if(endTime < currentTime && dataLast != null){
		 let high_last_trade = dataLast.high;
		 let low_last_trade = dataLast.low;
		 let last_traded_price = ticks[0].last_price;
		 let buy_put_trade_price = low_last_trade - 10;
		 let buy_call_trade_price = high_last_trade + 10;

		 /************************************** */
		 let curr = new Date 
		 let week = []

		 for (let i = 1; i <= 7; i++) {
			 let first = curr.getDate() - curr.getDay() + i 
			 let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
			 week.push(day)
		 }

		 var get_expiry_day_date = week[3];
		 var d = new Date(get_expiry_day_date);
		 let day = d.getDay()+1;
		 var YEAR = new Date().getFullYear().toString().substr(-2);
		 var MONTH = d.getMonth()+1;
		 var DAY = ("0" + day).slice(-2)

		 /************************************** */

		 if(last_traded_price > buy_call_trade_price){
			
			var strFirstThree = String(last_traded_price).substring(0,3);	
			var buyCallSymbalName = strFirstThree+'00';		
			buyCallSymbalName = Number(buyCallSymbalName)-process.env.INTHEMONEYVALUE;
			buyCallSymbalName = "BANKNIFTY"+YEAR+MONTH+DAY+String(buyCallSymbalName)+"CE";

			let checkIfOrderAlreadyPlaced = await Order.findOne({tradingSymbal:buyCallSymbalName,date:convertDate(new Date())});
			if(checkIfOrderAlreadyPlaced == null){  
				var instruments = (["NFO:"+buyCallSymbalName]);
				await kc.getLTP(instruments).then(function(response) {
					let LTPCE = response[instruments].last_price;
					placeOrderBuyCall(buyCallSymbalName,LTPCE);
					
				}).catch(function(err) {
					console.log(err);
				})
			}

		 }else if(last_traded_price < buy_put_trade_price){

			var strFirstThree = String(last_traded_price).substring(0,3);
			var buyPutSymbalName = strFirstThree+'00';
			buyPutSymbalName = Number(buyPutSymbalName)+process.env.INTHEMONEYVALUE;;			
			var buyPutSymbalName = "BANKNIFTY"+YEAR+MONTH+DAY+String(buyPutSymbalName)+"PE";
			
			let checkIfOrderAlreadyPlaced = await Order.findOne({tradingSymbal:buyPutSymbalName,date:convertDate(new Date())});
			
			if(checkIfOrderAlreadyPlaced == null){  
				var instruments = (["NFO:"+buyPutSymbalName]);
				await kc.getLTP(instruments).then(function(response) {
					let LTPCE = response[instruments].last_price;
					placeOrderBuyPut(buyPutSymbalName,LTPCE);
					
				}).catch(function(err) {
					console.log(err);
				})
			}
		 }
	}else{
		let high_last_trade = ticks[0].last_price;
		let low_last_trade = ticks[0].last_price;

		if(dataLast != null){
			if(high_last_trade < dataLast.high){
				high_last_trade = dataLast.high;
			}
			if(low_last_trade > dataLast.low){
				low_last_trade = dataLast.low; 
			}
			await Future.deleteOne({_id:dataLast._id});
		}
		
		let future = new Future();
		future.instrument_token = ticks[0].instrument_token;
		future.high = high_last_trade;
		future.low = low_last_trade;
		future.price_10_am = ticks[0].last_price;
		future.date = convertDate(new Date());
		if(high_last_trade != null && low_last_trade != null){
			future.save();
		}		
	}		
}


async function placeOrderBuyPut(tradingsymbol,LAST_TRADED_PRICE){
	var STOPLOSS = LAST_TRADED_PRICE*.05;
	var PROFIT = LAST_TRADED_PRICE*.03;
	var STOPLOSS_PRICE = Math.round(LAST_TRADED_PRICE + STOPLOSS);
	var PROFIT_PRICE = Math.round(LAST_TRADED_PRICE - PROFIT);	
	
	kc.placeGTT({
		trigger_type: kc.GTT_TYPE_OCO,
		tradingsymbol: tradingsymbol,
		exchange: "NFO",
		trigger_values: [PROFIT_PRICE, STOPLOSS_PRICE],
		last_price: LAST_TRADED_PRICE,
		orders: [{
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: process.env.QUANTITYBANKNIFTY,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: STOPLOSS_PRICE
		}, {
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: process.env.QUANTITYBANKNIFTY,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: PROFIT_PRICE
		}]
	}).then(function (resp) {		
		let order = new Order();
		order.trigger_id = resp.trigger_id;
		order.tradingSymbal = tradingsymbol;
		order.tradePrice = LAST_TRADED_PRICE;
		order.stopLossPrice = STOPLOSS_PRICE;
		order.profitPrice = PROFIT_PRICE;
		order.date = convertDate(new Date());
		order.save();

		console.log(resp)
	}).catch(function (error) {
		console.log(error)
	})
}


async function placeOrderBuyCall(tradingsymbol,LAST_TRADED_PRICE){
	var STOPLOSS = LAST_TRADED_PRICE*.05;
	var PROFIT = LAST_TRADED_PRICE*.03;
	var STOPLOSS_PRICE = Math.round(LAST_TRADED_PRICE - STOPLOSS);
	var PROFIT_PRICE = Math.round(LAST_TRADED_PRICE + PROFIT);
	
	kc.placeGTT({
		trigger_type: kc.GTT_TYPE_OCO,
		tradingsymbol: tradingsymbol,
		exchange: "NFO",
		trigger_values: [STOPLOSS_PRICE, PROFIT_PRICE],
		last_price: LAST_TRADED_PRICE,
		orders: [{
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: process.env.QUANTITYBANKNIFTY,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: STOPLOSS_PRICE
		}, {
			transaction_type: kc.TRANSACTION_TYPE_SELL,
			quantity: process.env.QUANTITYBANKNIFTY,
			product: kc.PRODUCT_CNC,
			order_type: kc.ORDER_TYPE_LIMIT,
			price: PROFIT_PRICE
		}]
	}).then(function (resp) {
		
		let order = new Order();
		order.trigger_id = resp.trigger_id;
		order.tradingSymbal = tradingsymbol;
		order.tradePrice = LAST_TRADED_PRICE;
		order.stopLossPrice = STOPLOSS_PRICE;
		order.profitPrice = PROFIT_PRICE;
		order.date = convertDate(new Date());
		order.save();

		console.log(resp)
	}).catch(function (error) {
		console.log(error)
	})
}



function convertDate(date) {
	var yyyy = date.getFullYear().toString();
	var mm = (date.getMonth()+1).toString();
	var dd  = date.getDate().toString();
  
	var mmChars = mm.split('');
	var ddChars = dd.split('');
  
	return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
  }


  function getLTP(instruments) {
	kc.getLTP(instruments).then(function(response) {
		console.log(response);
	}).catch(function(err) {
		console.log(err);
	})
}
