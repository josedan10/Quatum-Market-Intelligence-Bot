const WebSocket = require('ws')

var wsBitmexURI = 'wss://www.bitmex.com/realtime'
var wsConnection = new WebSocket(wsBitmexURI)

wsConnection.onopen = function () {
  console.log('socket connection opened properly')
  wsConnection.send('Hello World') // send a message
  console.log('message sent')
}

wsConnection.onmessage = function (evt) {
  console.log('Message received = ' + evt.data)
}

wsConnection.onclose = function () {
  // websocket is closed.
  console.log('Connection closed...')
}
