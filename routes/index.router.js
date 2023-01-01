const express = require("express");
const router = express.Router();
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink)
const ctrlUser = require('../controllers/user.controllers');
const mongoose = require('mongoose');

router.get('/',ctrlUser.save_access_token);
router.get('/import',ctrlUser.importInstruments);
module.exports = router;