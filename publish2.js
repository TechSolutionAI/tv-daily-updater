require('dotenv').config();
var request = require('request');
var fs = require('fs');
var path = require('path');

// Load configuration from environment variables
const TRADINGVIEW_COOKIE = process.env.TRADINGVIEW_COOKIE || '';
const TRADINGVIEW_USERNAME = process.env.TRADINGVIEW_USERNAME || 'stockcryptobots';
const SCRIPT_ID = process.env.TRADINGVIEW_SCRIPT_ID_2 || 'USER;93048a846363444eb9fc928170a2d543';
const SCRIPT_VERSION = process.env.TRADINGVIEW_VERSION_2 || '0.20';

// Extract the ID part after the semicolon for the URL
const scriptIdPart = SCRIPT_ID.includes(';') ? SCRIPT_ID.split(';')[1] : SCRIPT_ID;
const encodedScriptId = encodeURIComponent('PUB;' + scriptIdPart);

var pinePath = path.join(__dirname, 'aplusdash.txt');
var pineSource = fs.readFileSync(pinePath, 'utf8');
var encodedPineSource = encodeURIComponent(pineSource);
var options = {
  'method': 'POST',
  'url': `https://pine-facade.tradingview.com/pine-facade/publish/next/${encodedScriptId}?user_name=${TRADINGVIEW_USERNAME}`,
  'headers': {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'origin': 'https://www.tradingview.com',
    'priority': 'u=1, i',
    'referer': 'https://www.tradingview.com/',
    'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    'Cookie': TRADINGVIEW_COOKIE,
  },
  body: 'source=' + encodedPineSource + '&extra=' + encodeURIComponent(JSON.stringify({
    originalScriptId: SCRIPT_ID,
    originalScriptVersion: SCRIPT_VERSION
  }))

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});