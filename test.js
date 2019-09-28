
const axios = require('axios');
const chrome = require('./tools/chrome');
const tools = require('./tools');
const async = require('async');
const fetch = require("node-fetch");
const HttpsProxyAgent = require('https-proxy-agent');

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

const header = {
   'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
   'Accept-Language': '*',
   'Accept': '*/*',
   'Accept-Encoding': 'gzip, deflate, br',
   'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
   'Content-Type': 'application/json',
   'Referer': "https://www.leboncoin.fr/recherche/",
   'Origin': 'https://www.leboncoin.fr'
}


/**************************************************************
TEST TOR Proxy
***************************************************************/

// axios({
//    method: 'post',
//    url: 'https://api.leboncoin.fr/finder/search',
//    data: body,
//    config: {
//       headers: header
//    },
//    // proxy: {
//    //    host: "51.15.143.226",
//    //    port: 8118
//    // },
//    timeout: 10000
// }).then(function (response) {
//    console.log('response.data', response.data)
// }).catch(function (error) {
//    console.log('error', error.message)
// });


/**************************************************************
TEST check fetch proxy
***************************************************************/

// fetch('https://ipinfo.io/ip', { "agent": new HttpsProxyAgent('http://163.172.131.115:1990') })
//    .then(r => r.text())
//    .then(r => console.log(r))
//    .catch(function (error) {
//       console.log(error)
//    })

/**************************************************************
TEST fetch + JsonStringifyRandom
***************************************************************/

// (function () {
//    fetch(chrome.lbcApiSearchUrl, {
//       "method": "POST",
//       "body": tools.JsonStringifyRandom(body),
//       "headers": header
//    }).then(response => response.json())
//       .then(function (response) {
//          console.log("response",response)
//       }).catch(function (error) {
//          console.log("error",error)
//       });
// })();

/**************************************************************
TEST require('leboncoin-api')
***************************************************************/

// (function () {
//    const leboncoin = require('leboncoin-api');

//    leboncoin.Search.prototype.setOffset = function (offset) {
//       if (parseInt(offset) == offset)
//          this.offset = offset;
//       return this;
//    };

//    leboncoin.Search.prototype._getBodyParams = leboncoin.Search.prototype.getBodyParams;

//    leboncoin.Search.prototype.getBodyParams = function () {
//       return {
//          ...this._getBodyParams(),
//          "offset": this.offset
//       }
//    };

//    let search = new leboncoin.Search()
//       .setOffset(0) //offset
//       .setLimit(100)
//       .setCategory("ventes_immobilieres")
//       .setSort({ sort_by: "time", sort_order: "desc" })
//       .addSearchExtra("square", { min: 20000 })
//       .addSearchExtra("price", { min: 1000, max: 70000 })
//       .addSearchExtra('ad_type', ["offer"])
//       .addSearchExtra('real_estate_type', ["3"]);

//    let bodyParams = search.getBodyParams()
//    console.log('bodyParams', bodyParams)

//    search.run().then(function (data) {
//       console.log(data.page); // the current page
//       console.log(data.pages); // the number of pages
//       console.log(data.nbResult); // the number of results for this search
//       console.log(data.results); // the array of results
//    }, function (err) {
//       console.error('err', err);
//    });
// })()


/**************************************************************
TEST FN tools.JsonStringifyRandom(body)
***************************************************************/

// try {
//    const bodyStr = tools.JsonStringifyRandom(body)
//    const body2 = JSON.parse(bodyStr)
// }
// catch (e) {
//    console.log('e', e)
// }

/**************************************************************
SET cookies
***************************************************************/

// axios.post('http://danstontourdumonde.com:4000/cookies', {
//    cookies: [{
//       name: "datadome",
//       value: '7.86Vu_dR07uD94iUrGsrontUz2T76SEMzdJz99WMToZ0osVh.4cxXO5BhW3sdOB7hCl_OwBHB0D-gqb2PE57wYx-F~Aqu1oTChyahxrKE',
//       domain: ".leboncoin.fr"
//    }]
// })
//    .then(response => { console.log(response.status == 200 ? "OK" : response) })
//    .catch(error => { console.log("error", error) })


/**************************************************************
TEST FN chrome.fetchAds(body) with callback
***************************************************************/

// chrome.fetchAds(body, function (err, result) {
//    console.log(err, result)
// })

/**************************************************************
TEST FN chrome.fetchAds(body) await
***************************************************************/

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


/**************************************************************
TEST with PROXY from require('proxy-sources');
***************************************************************/

// (async function () {
// const ProxyList = require('proxy-sources');
//    const proxies = await ProxyList();
//    let i = 0;
//    async.eachSeries(proxies.list, (proxy, next) => {
//       console.log(`- try with proxy ${proxy} (${i++}/${proxies.list.length})`)
//       proxy = proxy.split(':')
//       axios({
//          method: 'post',
//          url: 'https://api.leboncoin.fr/finder/search',
//          data: body,
//          // method: 'get',
//          // url: 'http://www.likecool.com/',
//          config: {
//             headers:header
//          },
//          proxy: {
//             host: proxy[0],
//             port: parseInt(proxy[1])
//          },
//          timeout: 10000
//       }).then(function (response) {
//          console.log('response.data', response.data)
//          if (response.status === 200 && response.data)
//             return next(response.data)
//          next()
//       }).catch(function (error) {
//          console.log('error', error.message)
//          next()
//       });
//    }, function (result) {
//       console.log('result', result)
//    })
// })();


/**************************************************************
TEST with PROXY from require('proxy-lists')
***************************************************************/

// (function () {
//    const ProxyLists = require('proxy-lists');
//    ProxyLists.getProxies({
//       // browser: {
//       //    headless: false,
//       //    slowMo: 0,
//       //    timeout: 10000,
//       // },
//       countries: ['fr'],
//       sourceOptions: {
//          bitproxies: { apiKey: 'Ycr3vZDMUoPAAWoeQhO0zsvaBGwLPfsp' }
//       }
//    })
//       .on('data', function (proxies) {
//          let i = 0;
//          async.eachLimit(proxies, 10, (proxy, next) => {
//             console.log(`- try with proxy ${proxy.ipAddress}:${proxy.port} (${i++}/${proxies.length})`)
//             axios({
//                method: 'post',
//                url: 'https://api.leboncoin.fr/finder/search',
//                data: body,
//                // method: 'get',
//                // url: 'http://www.likecool.com/',
//                config: {
//                   headers: header
//                },
//                proxy: {
//                   host: proxy.ipAddress,
//                   port: proxy.port
//                },
//                timeout: 10000
//             }).then(function (response) {
//                console.log('response.data', response.data)
//                if (response.status === 200 && response.data)
//                   return next(response.data)
//                next()
//             }).catch(function (error) {
//                console.log('error', error.message)
//                next()
//             });
//          }, function (result) {
//             console.log('result', result)
//          })
//       })
//       .on('error', function (error) {
//          console.log('error!', error);
//       })
// })()