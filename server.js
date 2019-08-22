

process.env.PORT = process.env.PORT || 1337;
process.env.IP = process.env.IP || "0.0.0.0";

const express = require('express');
const bodyParser = require('body-parser');
// const axios = require('axios');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const _ = require('lodash');
const chrome = require('./tools/chrome');
const cors = require('cors')

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan(":date[iso] - :method :url :status - :response-time ms"));

app.use(express.static(path.resolve(__dirname, 'client')));

// const Datastore = require('nedb');
// const db = new Datastore({ filename: './ads.db', autoload: true });

app.get('/ads', function (req, res, next) {
   const params = {
      string: [],
      float: [],
      int: [
         {
            key: 'offset',
            default: 0
         },
         {
            key: 'areaMin',
            default: 10000
         },
         {
            key: 'priceMin',
            default: 1000
         },
         {
            key: 'priceMax',
            default: 70000
         },
         {
            key: 'limit',
            default: 300
         }
      ]
   }

   params.string.forEach((stringParam) => {
      if (req.query[stringParam.key] && req.query[stringParam.key].length >= 0)
         req.query[stringParam.key] = req.query[stringParam.key]
      else if (stringParam.default)
         req.query[stringParam.key] = stringParam.default
      else
         delete req.query[stringParam.key]
   })

   params.float.forEach((intParam) => {
      if (!isNaN((parseFloat(req.query[intParam.key]))))
         req.query[intParam.key] = parseFloat(req.query[intParam.key])
      else if (!isNaN(intParam.default))
         req.query[intParam.key] = intParam.default
      else
         delete req.query[intParam.key]
   })

   params.int.forEach((intParam) => {
      if (!isNaN((parseInt(req.query[intParam.key]))))
         req.query[intParam.key] = parseInt(req.query[intParam.key])
      else if (!isNaN(intParam.default))
         req.query[intParam.key] = intParam.default
      else
         delete req.query[intParam.key]
   })

   next()
},
   function (req, res) {
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
               "square": { "min": req.query.areaMin + _.random(-100, 100) },
               "price": { "min": req.query.priceMin + _.random(-100, 100), "max": req.query.priceMax + _.random(-100, 100) }
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

app.listen(process.env.PORT, process.env.IP, function (err) {
   if (err)
      console.error(err);
   else {
      console.log('server start on', process.env.IP + ':' + process.env.PORT)
   }
});