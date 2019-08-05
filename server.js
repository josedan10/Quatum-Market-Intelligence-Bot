const WebSocket = require('ws')
const readline = require('readline')
const fs = require('fs')
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
var SMA_10 = [] // array to save SMA_10 results

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function calculateSMA (db, period) {

  if (db.length >= period) {
    let sum = 0

    for (let SMA_i = db.length - period; SMA_i < db.length; SMA_i++) sum += db[SMA_i].close

    SMA_10.push(sum / period)
  }

  return SMA_10
}

wsConnection.onopen = function () {
  console.log('socket connection opened properly')
  // wsConnection.send('Hello World') // send a message

  // rl.question('Please insert the command that do you want send: ', (answer) => {
  //   wsConnection.send(`"${answer}"`)
  // })

  wsConnection.send(JSON.stringify({ op: 'subscribe', 'args': ['tradeBin1m:XBTUSD'] }))
  console.log('message sent')
}

wsConnection.onmessage = function (evt) {

  console.log('Message received')
  
  let responseData = JSON.parse(evt.data)

  if (responseData.action !== undefined) {
    
    switch (responseData.action) {
      case 'insert':
        let { data } = responseData
        let dataTime = moment(data[0].timestamp)
        let last = db.length ? moment(db[db.length - 1].timestamp) : null

        if (last === null || dataTime.diff(last, 'minutes') === 1) {
      
          // Diff of 4 minutes
          db.push({
            symbol: data[0].symbol,
            timestamp: data[0].timestamp,
            open: data[0].open,
            high: data[0].high,
            low: data[0].low,
            close: data[0].close,
            volume: data[0].volume
          })
      
          // Remove the first itema
          if (db.length === 100) {
            db.shift()
            // Stop the database saving in the file.
            // Test SMA
            
          }
          console.log('SMA(10):')
          console.log(calculateSMA(db, 10))
        }
        break
    }
  } else console.log('No action')

  console.log('-----------------------------------------------------------------------')
  // console.log('My database')
  console.log(`Fetched result ${db.length} / 100`)
  // console.log(db)
  console.log('-----------------------------------------------------------------------')
  console.log('\n\n')
}

wsConnection.onclose = function () {
  // websocket is closed.
  console.log('Connection closed...')
}
