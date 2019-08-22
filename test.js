
const axios = require('axios');
const chrome = require('./tools/chrome');

const body = {
   limit: 100,
   offset: 0,
   filters: {
      category: {
         id: "9"
      },
      enums: {
         ad_type: ["offer"],
         real_estate_type: ["3"]
      },
      keywords: {},
      ranges: {
         "square": { "min": 20000 },
         "price": { "min": 1000, "max": 70000 }
      }
   },
   sort_by: "time",
   sort_order: "desc"
};



axios.post('http://127.0.0.1:1337/cookies', {
   cookies: ["salut"]
})
   .then(response => { console.log(response) })
   .catch(error => { console.log(error) })


// chrome.fetchAds(body, function (err, result) {
//    console.log(err, result)
// })



// (async function test() {
//    try {
//       const result = await chrome.fetchAds(body)
//       console.log('result', result)
//    }
//    catch (err) {
//       console.log('err', err)
//       if (err.message === 'blocked')
//          chrome.captcha()
//    }
// })()


