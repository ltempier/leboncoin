

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

const chrome = require('./tools/chrome');
const tools = require('./tools');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan(":date[iso] - :method :url :status - :response-time ms"));

app.use(express.static(path.resolve(__dirname, 'client')));

// const Datastore = require('nedb');
// const db = new Datastore({ filename: './ads.db', autoload: true });

app.get('/ads', tools.paramsMiddleware, function (req, res) {
   chrome.fetchAds({
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
         keywords: {},
         ranges: {
            "square": { "min": req.query.areaMin },
            "price": { "min": req.query.priceMin, "max": req.query.priceMax }
         }
      },
      sort_by: "time",
      sort_order: "desc"
   }, function (err, result) {
      if (err)
         res.status(500).send(err.message)
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
            keywords: {},
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
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
            "Content-Type": "text/plain;charset=UTF-8"
         }
      }
   }).then(function (response) {
      res.status(200).json(response);
   }).catch(function (error) {
      res.status(500).json(error.response);

      // const url = new URL(error.response.data.url)
      // const html = `
      // <html>
      // <head>
      //    <title>You have been blocked</title>
      //    <meta name="viewport" content="width=device-width, initial-scale=1.0">
      // </head>
      // <body style="margin:0">
      //    <script>var dd = { 'cid': '${url.searchParams.get('initialCid')}', 'hsh': '${url.searchParams.get('hash')}', 't': '${url.searchParams.get('t')}' }</script>
      //    <script src="https://ct.datado.me/c.js"></script>
      //    <iframe
      //       src="${url.toString()}"
      //       width="100%" height="100%" style="height:100vh;" frameborder="0" border="0" scrolling="yes"></iframe>
      // </body>
      // </html>
      // `
      // res.send(html);
   });
})


app.listen(process.env.PORT, process.env.IP, function (err) {
   if (err)
      console.error(err);
   else {
      console.log('server start on', process.env.IP + ':' + process.env.PORT)
   }
});