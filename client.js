const { Console } = require('console')
const readline = require('readline')
const fs = require('fs')
const axios = require('axios')
const moment = require('moment')
const crypto = require('crypto')

const APIUri = process.env.APIUri || 'https://www.bitmex.com'
const APIKey = process.env.APIKey || 'ljxKl9p1otLhNLOS2DIV9tEM'
const APISecret = process.env.APISecret || 'X-uBLfYg6TXmwrDwiS9A-d-psVLHGqMfIWxsrsz-EHFRGDtB'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
// Custom simple logger
const logger = new Console({ stdout: process.stdout, stderr: errorOutput });
// use it like console

/**
 * This functions simulates the interaction of the user using a telegram bot
 * Or another interface
 *
 * 
 */
function initClient () {
  
  logger.log('Welcome to QMI beta bot test')

  mainMenu()

}

function mainMenuOptionHandler (opt) {
  switch (parseInt(opt)) {
    case 1:
      // Login
      let username
      let password

      rl.question('Insert your username: ', (answer) => {
        username = answer
        // console.log(answer)
        rl.question('Insert your password: ', (pass) => {
  
          password = pass
          var verb = 'GET',
            path = '/api/v1/user',
            expires = Math.round(new Date().getTime() / 1000) + 60, // 1 min in the future
            data = {symbol:"XBTUSD",orderQty:1,price:590,ordType:"Limit"}

          // let expires = moment().add(2, 'm').format('X')
          let hash = crypto.createHmac('sha256', APISecret).update(verb + path + expires).digest('hex');
  
          console.log(hash, expires)
  
          axios
            .get(`${APIUri + path}`, {
              headers: {
                'content-type' : 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'api-key': APIKey,
                'api-signature': hash,
                'api-expires': expires
              }
            })
            .then(response => console.log(response))
            .catch(err => console.error(err))
        })
      })

      break

    case 2:
      logger.log('Awesome, do you want see the balance report')
      break

    default:
      logger.log('Invalid option')
      break
  }
}

function mainMenu () {

  logger.log('Please indicates some action for use the bot')
  logger.log('1) Show my balance')
  logger.log('2) See the signals report')

  rl.question('Choose your action: ', (answer) => {
    mainMenuOptionHandler(answer)
  })
}

module.exports = {
  initClient
}