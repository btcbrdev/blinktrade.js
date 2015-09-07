var WebSocket = require('ws');

// Constructor
function Bitex(user, pass, second_factor) {
    var self = this
      , count = 0
      , p = 0
      , ws = new WebSocket('wss://api.blinktrade.com/trade/');

    this.user = user; //api-key
    this.pass = pass; //api-pass
    this.opt_second_factor = second_factor; //api secret
    this.fingerprint = parseInt(Math.random() * 1000000, 10); //random integer
    this.ws = ws;

    ws.on('open', function() {
        self.testRequest();
    });

    ws.on('message', function(message) {
        console.log(message);
    });
}

/**
 * Send a test request message, to test the connection
 * @param {number|string=} opt_requestId
 */
Bitex.prototype.testRequest = function(opt_requestId) {
    var self = this
      , date = new Date()
      , reqId = opt_requestId || date.getTime()
      , msg = {
        'MsgType': '1',
        'TestReqID': reqId,
        'SendTime': date.getTime(),
    };

    self.ws.send(JSON.stringify(msg));
}

/**
 * @param {Array.<string>} symbols
 * @param {string} opt_requestId. Defaults to random generated number
 * @return {number}
 */
Bitex.prototype.subscribeSecurityStatus = function(symbols, opt_requestId) {
  var self = this;
  var requestId = opt_requestId || parseInt( 1e7 * Math.random() , 10 );

  var msg = {
    'MsgType': 'e',
    'SecurityStatusReqID': requestId,
    'SubscriptionRequestType': '1',
    'Instruments': symbols
  };

  self.ws.send(JSON.stringify(msg));

  return requestId;
};

/**
 * @param {string} opt_market. Defaults to BLINK
 * @param {string} opt_requestId. Defaults to random generated number
 */
Bitex.prototype.requestSecurityList = function(opt_market, opt_requestId){
  var self = this;
  var requestId = opt_requestId || parseInt( 1e7 * Math.random() , 10 );
  var market = opt_market || "BLINK";
  var msg = {
    'MsgType': 'x',
    'SecurityReqID': requestId,
    'SecurityListRequestType': 0, // Symbol
    'Market': market,
    'SecurityRequestResult': 0
  };

  self.ws.send(JSON.stringify(msg));
};


/**
 * @param {number} brokerID
 * @param {string} username
 * @param {string} password
 * @param {string=} opt_second_factor
 * @param {number=} opt_request_id
 */
Bitex.prototype.login = function(brokerID, username, password, opt_second_factor, opt_request_id) {
    var self = this
      , reqId = opt_request_id || parseInt(Math.random() * 1000000, 10)
      , msg = {
        'MsgType': 'BE',
        'UserReqID': reqId,
        'BrokerID': brokerID,
        'Username': username,
        'Password': password,
        'FingerPrint': self.fingerprint,
        'UserReqTyp': '1'
    };

    if (typeof opt_second_factor !== 'undefined' && typeof opt_second_factor === 'number') {
        msg['SecondFactor'] = opt_second_factor;
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
