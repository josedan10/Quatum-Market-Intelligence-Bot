const WebSocket = require('ws')
const readline = require('readline')

var wsBitmexURI = 'wss://www.bitmex.com/realtime'
var wsConnection = new WebSocket(wsBitmexURI)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

wsConnection.onopen = function () {
  console.log('socket connection opened properly')
  // wsConnection.send('Hello World') // send a message

  // rl.question('Please insert the command that do you want send: ', (answer) => {
  //   wsConnection.send(`"${answer}"`)
  // })

  wsConnection.send(JSON.stringify({ op: 'subscribe', 'args': ['orderBookL2_25:XBTUSD'] }))
  console.log('message sent')
}

wsConnection.onmessage = function (evt) {
  console.log('Message received = ' + evt.data)
}

wsConnection.onclose = function () {
  // websocket is closed.
  console.log('Connection closed...')
}
