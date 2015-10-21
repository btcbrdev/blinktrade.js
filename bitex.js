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

    self.broker = broker_id;
    self.api_key = api_key;
    self.api_pass = api_pass;
    self.opt_second_factor = opt_second_factor; //api secret
    self.fingerprint = parseInt(Math.random() * 1000000, 10); //random integer
    self.ws = ws;

    ws.on('open', function() {
        console.log('OPEN CONNECTION');
    });

    ws.on('message', function(e) {});

    ws.on('close', function() {
        console.log('CLOSE CONNECTION');
    });
}

/**
 * Send a test request message, to test the connection
 * @param {number} opt_requestId
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
 * Request a list of closed orders
 * @param {number=} opt_requestId. Defaults to random generated number
 * @param {number=} opt_page. Defaults to 0
 * @param {number=} opt_limit. Defaults to 100
 * @param {Array.<string>=} opt_filter.
 * @return {number}
 */
Bitex.prototype.requestOrderList = function(opt_requestId, opt_page, opt_limit, opt_filter){
    var self = this
      , reqId = opt_requestId || parseInt( 1e7 * Math.random() , 10 )
      , page = opt_page || 0
      , limit = opt_limit || 10
      , msg = {
        'MsgType': 'U4',
        'OrdersReqID': reqId,
        'Page': page,
        'PageSize': limit,
        'Filter': ["has_leaves_qty eq 1"]
    };

    if (typeof opt_filter !== 'undefined') {
        msg['Filter'] = opt_filter;
    }

    self.ws.send(JSON.stringify(msg));

    return reqId;
}


/**
 * @param {number=} opt_clientID
 * @param {number} opt_request_id
 */
Bitex.prototype.requestBalances = function(opt_clientID, opt_request_id) {
    var self = this;
  var reqId = opt_request_id || parseInt(Math.random() * 1000000, 10);
  var msg = {
    'MsgType': 'U2',
    'BalanceReqID': reqId
  };

  if (typeof opt_clientID !== 'undefined' && typeof opt_clientID === 'number') {
    msg['ClientID'] = opt_clientID;
  }

    self.ws.send(JSON.stringify(msg));
}

/**
 * @param {number} market_depth
 * @param {Array.<string>} symbols
 * @param {Array.<string>} entries
 * @param {string} opt_requestId. Defaults to random generated number
 * @return {number}
 */
Bitex.prototype.subscribeMarketData = function(market_depth, symbols, entries, opt_requestId ){
  var self = this;
  var requestId = opt_requestId || parseInt( 1e7 * Math.random() , 10 );

  var msg = {
    'MsgType': 'V',
    'MDReqID': requestId,
    'SubscriptionRequestType': '1',
    'MarketDepth': market_depth,
    'MDUpdateType': '1',   // Incremental refresh
    'MDEntryTypes': entries,
    'Instruments': symbols
  };

  self.ws.send(JSON.stringify(msg));

  return requestId;
};


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
