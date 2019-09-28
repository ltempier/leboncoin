const _ = require('lodash');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const tools = require('./index');


const lbcUrl = 'https://www.leboncoin.fr';
const lbcApiSearchUrl = 'https://api.leboncoin.fr/finder/search';
const cookiesJsonFilePath = path.join(__dirname, 'cookies.json');
const pageBlockedTitle = "You have been blocked"

const defaultQueryBody = {
   limit: 10,
   offset: 0,
   filters: {
      category: {
         id: "9" //vente immo
      },
      enums: {
         ad_type: ["offer"],
         real_estate_type: ["3"] //terrain
      },
      // keywords: {
      //    text: "NOT " + tools.generateRandomText(2000)
      // },
      ranges: {
         "square": { "min": 15000 },
         "price": { "min": 10000, "max": 150000 }
      }
   },
   sort_by: "time",
   sort_order: "desc"
};
const queryHeader = {
   // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
   'Accept-Language': '*',
   'Accept': '*/*',
   'Accept-Encoding': 'gzip, deflate, br',
   'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
   'Content-Type': 'application/json',
   'Referer': "https://www.leboncoin.fr/recherche/",
   'Origin': 'https://www.leboncoin.fr'
}

async function fetchAds(body, callback) {

   if (_.isFunction(callback)) {
      try {
         const res = await fetchAds(body)
         callback(null, res)
      } catch (e) {
         callback(e)
      }
      return
   }

   const browser = await puppeteer.launch({
      // headless: false
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
   });
   const page = await browser.newPage();

   try {
      await page.setCookie(...loadCookies())
   }
   catch (e) {
      console.log('error setCookie', e)
   }

   await page.setCookie(...loadCookies())
   await page.goto(lbcUrl, { waitUntil: 'load', timeout: 0 });

   if (await page.title() === pageBlockedTitle) {
      await browser.close();
      throw new Error('blocked')
   }

   try {
      const result = await page.evaluate(async (url, bodyStr, headers) => {
         return fetch(url, {
            "method": "POST",
            "body": bodyStr,
            "credentials": "include",
            "headers": headers
         }).then(res => {
            if (res.status === 200)
               return res.json()
            else
               throw new Error('res.status != 200')
         })
      }, lbcApiSearchUrl, tools.JsonStringifyRandom(body), queryHeader);

      saveCookies(await page.cookies()); //save cookies
      await browser.close();

      return result
   } catch (err) {
      await browser.close();
      throw err
   }
}

async function captcha(resetCookie, callback) {

   if (_.isFunction(resetCookie)) {
      callback = resetCookie
      resetCookie = false
   }

   if (_.isFunction(callback)) {
      try {
         const res = await captcha(resetCookie)
         callback(null, res)
      } catch (e) {
         callback(e)
      }
      return
   }


   const browser = await puppeteer.launch({
      headless: false,
      // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      // args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--ignoreHTTPSErrors'],
      // ignoreHTTPSErrors: true,
   });

   const page = await browser.newPage();
   await page.setViewport({ width: 1280, height: 960 });

   if (resetCookie === true) {
      console.log('reset cookies')
   } else
      await page.setCookie(...loadCookies())

   console.log('goto', lbcUrl)
   await page.goto(lbcUrl, { waitUntil: 'load', timeout: 0 });

   if (await page.title() !== pageBlockedTitle) {
      console.log('evaluate fetch')
      await page.evaluate(async (url, bodyStr, headers) => {
         return fetch(url, {
            "method": "POST",
            "body": bodyStr,
            "credentials": "include",
            "headers": headers
         }).then(res => {
            if (res.status === 200)
               return res.json()
            else
               throw new Error('res.status != 200')
         })
      }, lbcApiSearchUrl, JSON.stringify(defaultQueryBody, null), queryHeader);
   }

   let cookies = [];
   if (await page.title() === pageBlockedTitle) {
      console.log('blocked -> wait')

      await page.waitForFunction(`document.title !== "${pageBlockedTitle}" || document.getElementsByClassName("recaptcha-checkbox-checkmark").length > 0`, { timeout: 0 });

      cookies = await page.cookies()
      saveCookies(cookies); //save cookies
   } else {

      cookies = await page.cookies()
      saveCookies(cookies); //save cookies
   }

   await browser.close();
   return cookies
}


function saveCookies(cookies) {
   fs.writeFileSync(cookiesJsonFilePath, JSON.stringify(cookies, null));
}

function loadCookies() {
   if (fs.existsSync(cookiesJsonFilePath))
      return JSON.parse(fs.readFileSync(cookiesJsonFilePath))
   return []
}

module.exports = {
   lbcApiSearchUrl,
   fetchAds,
   captcha,
   saveCookies,
   loadCookies
}