const _ = require('lodash');


const puppeteerExtra = require("puppeteer-extra")
const pluginStealth = require("puppeteer-extra-plugin-stealth")
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')

puppeteerExtra.use(pluginStealth())
// puppeteerExtra.use(
//    RecaptchaPlugin({
//       provider: { id: '2captcha', token: 'XXXXXXX' },
//       visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
//    })
// )
// const puppeteer = require('puppeteer');
const puppeteer = puppeteerExtra

const fs = require('fs');
const path = require('path');
const tools = require('./index');


const lbcUrl = 'https://www.leboncoin.fr';
const lbcApiSearchUrl = 'https://api.leboncoin.fr/finder/search';
const cookiesJsonFilePath = path.join(__dirname, 'cookies.json');
const pageBlockedTitle = "You have been blocked"

const defaultQueryBody = {
   limit: 100,
   offset: 0,
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

   const browser = await l({
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

   await page.goto(lbcUrl, { waitUntil: 'load', timeout: 0 });


   try {
      if (await page.title() === pageBlockedTitle) {
         throw new Error('blocked')
      }

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
      }, lbcApiSearchUrl, JSON.stringify(body, null), queryHeader);

      //saveCookies(await page.cookies()); //save cookies

      return result

   } catch (err) {
      throw err
   }
   
   finally {
      await page.close();
      await browser.close();
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

   const browser = await require("puppeteer").launch({
      headless: false,
      // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      // args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--ignoreHTTPSErrors'],
      // ignoreHTTPSErrors: true,
   });

   const page = await browser.newPage();

   await page.setViewport({ width: 1280, height: 960 });

   if (resetCookie === true) {
      await page.setCookie()
      // await page._client.send('Network.clearBrowserCookies');
      console.log('reset cookies')
   } else
      await page.setCookie(...loadCookies())


   let gotoIdx = 0
   // do {
   console.log('goto', lbcUrl, gotoIdx++)
   await page.goto(lbcUrl, {
      timeout: 0,
      waitUntil: 'networkidle0'
   });

   // if (await page.title() !== pageBlockedTitle) {
   //    const res = await page.evaluate(async (url, bodyStr, headers) => {
   //       return fetch(url, {
   //          "method": "POST",
   //          "body": bodyStr,
   //          "credentials": "include",
   //          "headers": headers
   //       }).then(res => {
   //          if (res.status === 200)
   //             return res.json()
   //          else
   //             throw new Error('res.status != 200')
   //       })
   //    }, lbcApiSearchUrl, JSON.stringify(defaultQueryBody, null), queryHeader);
   //    console.log('evaluate fetch', res.ads ? res.ads.length : 'no ads')
   // }

   // } while (await page.title() !== pageBlockedTitle && gotoIdx < 3)

   let cookies = [];
   if (await page.title() === pageBlockedTitle) {
      console.log('blocked -> wait')
      await page.waitForFunction(`document.title !== "${pageBlockedTitle}" || document.getElementsByClassName("recaptcha-checkbox-checkmark").length > 0`, { timeout: 0 });
   }

   cookies = await page.cookies()
   // saveCookies(cookies); //save cookies

   await browser.close();

   return cookies

   async function wait(timeout) {
      timeout = timeout || 1000
      console.log('wait', timeout, 'ms')
      return new Promise((resolve) => {
         setTimeout(resolve, timeout)
      })
   }
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