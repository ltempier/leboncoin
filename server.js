

process.env.PORT = process.env.PORT || 1337;
process.env.IP = process.env.IP || "0.0.0.0";


const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const Datastore = require('nedb');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, 'client')));

app.get('/ads', function (req, res) {
   let offset = 0
   try { offset = parseInt(req.query.offset) }
   catch (e) { }

   axios({
      method: 'post',
      url: 'https://api.leboncoin.fr/finder/search',
      data: {
         limit: 300,
         offset: offset,
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
               "square": { "min": 10000 },
               "price": { "min": 1000, "max": 60000 }
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
      res.status(200).json(response.data.ads || [])
   }).catch(function (error) {
      console.log('error', error);
      res.status(500).json(ads)
   });
})

// const db = new Datastore({ filename: './infos.db', autoload: true })
// app.get('/infos', function (req, res) {
//    db.find({}, function (err, infos) {
//       if (err)
//          res.status(500).send(err.message)
//       else
//          res.status(200).json(infos)
//    })
// })
// app.post('/infos/:id', function (req, res) {
//    const info = {
//       id: req.params.id,
//       ...req.body
//    }
//    database.pixels.update({ id: info.id }, info, { upsert: true }, function (err) {
//       if (err)
//          res.status(500).send(err.message)
//       else
//          res.status(200).json(info)
//    })
// })

app.listen(process.env.PORT, process.env.IP, function (err) {
   if (err)
      console.error(err);
   else {
      console.log('server start on', process.env.IP + ':' + process.env.PORT)
   }
});