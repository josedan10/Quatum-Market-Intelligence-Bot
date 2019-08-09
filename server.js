const WebSocket = require('ws')
const moment = require('moment')

var wsBitmexURI = 'wss://www.bitmex.com/realtime'
var wsConnection = new WebSocket(wsBitmexURI)

/* 
  Object example

  {
    timestamp: DateTime,
    symbol: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
  }

*/

var db = [] // array of 100 items of 4hrs intervals
var tempResult = null // temp results to construct 4hrs data
var SMA_10 = [] // array to save SMA_10 results
var SMA_40 = [] // array to save SMA_40 results

global.SIGNAL = 0 // buy = 1, sell = -1

function checkSignals () {
  // Starts studying the signals

  if (SMA_40[1] > SMA_10[1] && SMA_40[0] <= SMA_10[0]) {
    // console.log('Long trade buy signal')
    SIGNAL = 1
  }

  if (SMA_40[1] <= SMA_10[1] && SMA_40[0] > SMA_10[0]) {
    // console.log('Close long trade sell signal')
    SIGNAL = -1
  }
}

function updateDB (evt) {
  // console.log('Message received')
  
  let responseData = JSON.parse(evt.data)

  if (responseData.action !== undefined) {
    
    switch (responseData.action) {
      case 'insert':
        let { data } = responseData
        let dataTime = moment(data[0].timestamp)
        let last = db.length ? moment(db[db.length - 1].timestamp) : null

        if (!tempResult) {
          tempResult = {
            symbol: data[0].symbol,
            timestamp: data[0].timestamp,
            open: data[0].open,
            high: data[0].high,
            low: data[0].low,
            close: data[0].close,
            volume: data[0].volume
          }
        } else {
          // Compare high and low price
          if (data[0].high > tempResult.high) tempResult.high = data[0].high
          if (data[0].low < tempResult.low) tempResult.low = data[0].low
        }

        if (last === null || dataTime.diff(last, 'minutes') === 4) {
      
          // Diff of 4 minutes
          tempResult.timestamp = data[0].timestamp
          tempResult.close = data[0].close
          db.unshift(tempResult)
      
          // Remove the first item
          if (db.length === 101) {
            db.pop()
            // Stop the database saving in the file.
            // Test SMA
            
          }

          // console.log('SMA(5):')
          SMA_10 = calculateSMA(db, 5, SMA_10)
          // console.log(SMA_10)

          // console.log('SMA(40):')
          SMA_40 = calculateSMA(db, 40, SMA_40)
          // console.log(SMA_40)

          if (SMA_40.length >= 2) {
            checkSignals()
          }
        }
        break
    }
  } else console.log('No action')

  // console.log('-----------------------------------------------------------------------')
  // console.log('My database')
  // console.log(`Fetched result ${db.length} / 100`)
  // console.log(db)
  // console.log('-----------------------------------------------------------------------')
  // console.log('\n\n')

  // Check signals
}

function calculateSMA (db, period, SMAArray) {

  if (db.length >= period) {
    let sum = 0

    for (let SMA_i = db.length - period; SMA_i < db.length; SMA_i++) sum += db[SMA_i].close

    SMAArray.push(sum / period)
  }

  return SMAArray
}

wsConnection.onopen = function () {
  console.log('socket connection opened properly')
  // wsConnection.send('Hello World') // send a message

  // rl.question('Please insert the command that do you want send: ', (answer) => {
  //   wsConnection.send(`"${answer}"`)
  // })

  wsConnection.send(JSON.stringify({ op: 'subscribe', 'args': ['tradeBin1m:XBTUSD'] }))
}

wsConnection.onmessage = function (evt) {
  updateDB(evt)
}

wsConnection.onclose = function () {
  // websocket is closed.
  console.log('Connection closed...')
}
