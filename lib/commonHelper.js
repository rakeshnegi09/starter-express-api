'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');

class commonHelper{
    static async checkUserType(params) {
        let userData = User.findOne({_id:params});
        if(userData){
            return userData;
        }
        
    }
}

module.exports = commonHelper;
