process.env.PORT = process.env.PORT || 1337;
process.env.IP = process.env.IP || "0.0.0.0";

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const _ = require('lodash');
const cors = require('cors')
const fetch = require("node-fetch");

const chrome = require('./tools/chrome');
const tools = require('./tools');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan(":date[iso] - :method :url :status - :response-time ms"));

app.use(express.static(path.resolve(__dirname, 'client')));

// const Datastore = require('nedb');
// const db = new Datastore({ filename: './ads.db', autoload: true });


app.get('/chrome', tools.paramsMiddleware, function (req, res) {
   chrome.fetchAds({
      // limit: req.query.limit,
      offset: req.query.offset,
      filters: {
         category: {
            id: "9" //vente immo
         },
         enums: {
            ad_type: ["offer"],
            real_estate_type: ["3"] //terrain
         },
         keywords: {
            // text: "NOT " + tools.generateRandomText(2000)
         },
         ranges: {
            "square": { "min": req.query.areaMin },
            "price": { "min": req.query.priceMin, "max": req.query.priceMax }
         }
      },
      sort_by: "time",
      sort_order: "desc"
   }, function (err, result) {
      if (err) {
         console.log('err:', err)
         res.status(500).send(err.message)
      }
      else
         res.status(200).json(result.ads || [])
   })
})

app.post('/cookies', cors(), function (req, res) {
   if (req.body.cookies && req.body.cookies.length) {
      chrome.saveCookies(req.body.cookies)
      res.sendStatus(200)
   } else
      res.status(500).send(`req.body.cookies: ${req.body.cookies}
      req.body.cookies.length: ${req.body.cookies ? req.body.cookies.length : '-1'}`)
})

app.get('/ads', tools.paramsMiddleware, function (req, res) {
   fetch(chrome.lbcApiSearchUrl, {
      "method": "POST",
      // "body": { "limit": 35, "limit_alu": 3, "filters": { "category": {}, "enums": { "ad_type": ["offer"] }, "location": { "locations": [{ "locationType": "region", "label": "Rhône-Alpes", "region_id": "22" }] }, "keywords": { "text": "NOT salut" }, "ranges": {} } },
      "body": tools.JsonStringifyRandom({
         limit: req.query.limit,
         offset: req.query.offset,
         filters: {
            category: {
               id: "9" //vente immo
            },
            enums: {
               ad_type: ["offer"],
               real_estate_type: ["3"] //terrain
            },
            keywords: {
               text: "NOT " + tools.generateRandomText(2000)
            },
            ranges: {
               "square": { "min": req.query.areaMin },
               "price": { "min": req.query.priceMin, "max": req.query.priceMax }
            }
         },
         sort_by: "time",
         sort_order: "desc"
      }),
      "headers": tools.headers
   })
      .then((response) => {
         return new Promise((resolve, reject) => {
            if (response.ok)
               response.json()
                  .then(resolve)
                  .catch(reject);
            else
               response.text()
                  .then(text => reject(new Error(text)));
         })
      })
      .then(function (response) {
         res.status(200).json(response);
      }).catch(function (error) {
         res.status(500).send(error.response);
      })
})

app.get('/old', tools.paramsMiddleware, function (req, res) {
   axios({
      method: 'post',
      url: 'https://api.leboncoin.fr/finder/search',
      data: {
         limit: req.query.limit,
         offset: req.query.offset,
         filters: {
            category: {
               id: "9" //vente immo
            },
            enums: {
               ad_type: ["offer"],
               real_estate_type: ["3"] //terrain
            },
            keywords: {
               text: "NOT " + tools.generateRandomText(80)
            },
            ranges: {
               "square": { "min": req.query.areaMin },
               "price": { "min": req.query.priceMin, "max": req.query.priceMax }
            }
         },
         sort_by: "time",
         sort_order: "desc"
      },
      config: {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
            'Accept-Language': '*',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'Content-Type': 'application/json',
            'Referer': "https://www.leboncoin.fr/recherche/",
            'Origin': 'https://www.leboncoin.fr'
         }
      }
   }).then(function (response) {
      res.status(200).json(response);
   }).catch(function (error) {
      res.status(500).send(error.message);
   });
})

app.listen(process.env.PORT, process.env.IP, function (err) {
   if (err)
      console.error(err);
   else {
      console.log('server start on', process.env.IP + ':' + process.env.PORT)
   }
});