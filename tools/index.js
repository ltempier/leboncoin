
const _ = require('lodash');



function JsonStringifyRandom(obj, shuffleArray) {

   function valueStringify(value, _i) {

      if (_i > 10000)
         throw new Error('circular reference')
      if (_.isArray(value))
         return arrayStringify(value, (_i || 0) + 1)
      else if (_.isString(value))
         return `"${value}"`
      else if (_.isObject(value))
         return `${JsonStringifyRandom(value, shuffleArray)}`
      else
         return `${value.toString()}`
   }

   function arrayStringify(array, _i) {
      if (!_.isArray(array))
         return "[]"
      if (shuffleArray !== false)
         array = _.shuffle(array)
      return `[${array.map((value) => valueStringify(value, _i)).join(',')}]`
   }

   let str = [];
   _.shuffle(_.keys(obj)).forEach((key) => {
      const value = obj[key]
      str.push(`"${key}":${valueStringify(value)}`)
   })
   return `{${str.join(',')}}`
}


module.exports = {
   paramsMiddleware: function (req, res, next) {
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
               default: 10000,
               random: 100
            },
            {
               key: 'priceMin',
               default: 1000,
               random: 100
            },
            {
               key: 'priceMax',
               default: 70000,
               random: 100
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
      });

      params.int.forEach((intParam) => {
         if (!isNaN((parseInt(req.query[intParam.key]))))
            req.query[intParam.key] = parseInt(req.query[intParam.key])
         else if (!isNaN(intParam.default))
            req.query[intParam.key] = intParam.default
         else
            delete req.query[intParam.key]
      });


      ([...params.float, ...params.int]).forEach((intParam) => {
         if (req.query[intParam.key] && !isNaN(intParam.random))
            req.query[intParam.key] += _.random(-intParam.random, intParam.random)
      })

      next()
   },

   JsonStringifyRandom: JsonStringifyRandom,
   queryHeader: {
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