var Bitex = require('./bitex')
  , env = require('dotenv').load();

var bot = new Bitex(process.env.BROKER, process.env.API_KEY, process.env.API_PASS, process.env.API_SECRET);
