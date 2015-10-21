var Bitex = require('./bitex')
  , env = require('dotenv').load();

// new instance of Bitex
var bitex = new Bitex(
    process.env.BROKER,
    process.env.API_KEY,
    process.env.API_PASS,
    process.env.API_SECRET
);

bitex.ws.on('open', function() {
    bitex.login();
    //bitex.subscribeMarketData(2, ['BTCBRL'], ['0', '1']);
    //bitex.subscribeSecurityStatus(['BTCBRL']);
});

bitex.ws.on('message', function(e) {
    var msg = JSON.parse(e);

    console.log(msg);

    //if (msg['MsgType'] === 'U5') {
    //    console.log(msg);
    //}
});
