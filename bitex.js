var WebSocket = require('ws');

/**
 * Constructor
 * @param {number} broker_id
 * @param {string} api_key
 * @param {string} api_pass
 * @param {string} opt_second_factor
 */
function Bitex(broker_id, api_key, api_pass, opt_second_factor) {
    var self = this
      , ws = new WebSocket('wss://api.blinktrade.com/trade/');

    this.broker = broker_id;
    this.api_key = api_key;
    this.api_pass = api_pass;
    this.opt_second_factor = opt_second_factor; //api secret
    this.fingerprint = parseInt(Math.random() * 1000000, 10); //random integer
    this.ws = ws;

    ws.on('open', function() {
        console.log('OPEN CONNECTION');

        self.testRequest();
    });

    ws.on('message', function(message) {
        console.log(message);
    });

    ws.on('close', function() {
        console.log('CLOSE CONNECTION');
    });
}

/**
 * Send a test request message, to test the connection
 * @param {number|string=} opt_requestId
 */
Bitex.prototype.testRequest = function(opt_requestId) {
    var self = this
      , d = new Date()
      , requestId = opt_requestId || d.getTime()
      , msg = {
        'MsgType': '1',
        'TestReqID': requestId,
        'SendTime': d.getTime(),
    };

    self.ws.send(JSON.stringify(msg));
}

/**
 * @param {Array.<string>} symbols ['BTCBRL', 'BTCVEF', ...]
 * @param {string} opt_requestId. Defaults to random generated number
 * @return {number}
 */
Bitex.prototype.subscribeSecurityStatus = function(symbols, opt_requestId) {
    var self = this
      , requestId = opt_requestId || parseInt(1e7 * Math.random() , 10)
      , msg = {
        'MsgType': 'e',
        'SecurityStatusReqID': requestId,
        'SubscriptionRequestType': '1',
        'Instruments': symbols
    };

    self.ws.send(JSON.stringify(msg));

    return requestId;
}

/**
 * @param {string} opt_market. Defaults to BLINK
 * @param {string} opt_requestId. Defaults to random generated number
 */
Bitex.prototype.requestSecurityList = function(opt_market, opt_requestId) {
    var self = this
      , requestId = opt_requestId || parseInt( 1e7 * Math.random() , 10 )
      , market = opt_market || "BLINK"
      , msg = {
        'MsgType': 'x',
        'SecurityReqID': requestId,
        'SecurityListRequestType': 0, // Symbol
        'Market': market,
        'SecurityRequestResult': 0
    };

    self.ws.send(JSON.stringify(msg));
}


/**
 * @param {number=} opt_request_id
 */
Bitex.prototype.login = function(opt_request_id) {
    var self = this
      , reqId = opt_request_id || parseInt(Math.random() * 1000000, 10)
      , msg = {
        'MsgType': 'BE',
        'UserReqID': reqId,
        'BrokerID': self.broker,
        'Username': self.api_key,
        'Password': self.api_pass,
        'FingerPrint': self.fingerprint,
        'UserReqTyp': '1'
    };

    if (typeof opt_second_factor !== 'undefined' && typeof opt_second_factor === 'number') {
        msg['SecondFactor'] = self.opt_second_factor;
    }

    self.ws.send(JSON.stringify(msg));
}

/**
 * @param {number} quota
 * @param {number} fiat
 */
Bitex.prototype.toBTC = function(quota, fiat) {
    return parseFloat((fiat / quota).toFixed(8));
}

/**
 * @param {number} quota
 * @param {number} fiat
 */
Bitex.prototype.toFiat = function(quota, btc) {
    return parseFloat((quota * btc).toFixed(2));
}

module.exports = Bitex;
