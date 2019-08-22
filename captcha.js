
const chrome = require('./tools/chrome');
const axios = require('axios');


const serverUrl = "http://127.0.0.1:1337"
// const serverUrl = "http://danstontourdumonde.com:4000"

chrome.captcha(true, function (err, cookies) {
   console.log(err, cookies)
   axios.post(serverUrl + '/cookies', {
      cookies
   })
      .then(response => { console.log(response) })
      .catch(error => { console.log(error) })
})




