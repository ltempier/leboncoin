const _ = require('lodash');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


const lbcUrl = 'https://www.leboncoin.fr';
const lbcApiSearchUrl = 'https://api.leboncoin.fr/finder/search';
const cookiesJsonFilePath = path.join(__dirname, 'cookies.json');
const pageBlockedTitle = "You have been blocked"

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
      const result = await page.evaluate(async (url, bodyStr) => {
         return fetch(url, {
            "method": "POST",
            "body": bodyStr,
            "credentials": "include"
         }).then(res => res.json())
      }, lbcApiSearchUrl, JSON.stringify(body, null));

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
         const res = await captcha(body)
         callback(null, res)
      } catch (e) {
         callback(e)
      }
      return
   }


   const browser = await puppeteer.launch({
      headless: false
   });

   const page = await browser.newPage();
   if (resetCookie === true) {
      console.log('reset cookies')
   } else
      await page.setCookie(...loadCookies())
   await page.goto(lbcUrl);

   let cookies = [];
   if (await page.title() === pageBlockedTitle) {
      await page.waitForFunction(`document.title !== "${pageBlockedTitle}"`, { timeout: 0 });
      cookies = await page.cookies()
      saveCookies(cookies); //save cookies
   }

   await browser.close();
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
   fetchAds,
   captcha,
   saveCookies
}