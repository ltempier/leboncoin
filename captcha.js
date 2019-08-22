
const chrome = require('./tools/chrome');
const axios = require('axios');

// const serverUrl = "http://127.0.0.1:1337"
// const serverUrl = "http://0.0.0.0:4000"
const serverUrl = "http://danstontourdumonde.com:4000"


chrome.captcha(true, function (err, cookies) {
   if (cookies && cookies.length) {
      axios.post(serverUrl + '/cookies', { cookies })
         .then(response => {
            console.log('DONE new cookies:', cookies)
         })
         .catch(error => {
            console.log('error', error.message)
         })
   } else {
      console.log('WARNING NO COOKIES TO POST')
   }
})




