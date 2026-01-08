require('dotenv').config();
var request = require('request');
var fs = require('fs');
var path = require('path');

// Load configuration from environment variables
const TRADINGVIEW_COOKIE = process.env.TRADINGVIEW_COOKIE || '';
const TRADINGVIEW_USERNAME = process.env.TRADINGVIEW_USERNAME || 'stockcryptobots';
const DRAFT_SCRIPT_ID = process.env.TRADINGVIEW_DRAFT_SCRIPT_ID || 'USER;5369896c2e834f1283386871c9f1ceff';

// Extract the ID part after the semicolon for the URL
const scriptIdPart = DRAFT_SCRIPT_ID.includes(';') ? DRAFT_SCRIPT_ID.split(';')[1] : DRAFT_SCRIPT_ID;
const encodedScriptId = encodeURIComponent(DRAFT_SCRIPT_ID);

// Read the full PineScript code from the file
var pinescriptCode = fs.readFileSync(path.join(__dirname, 'pinescriptcode.txt'), 'utf8');

var options = {
  'method': 'POST',
  'url': `https://pine-facade.tradingview.com/pine-facade/save/next_draft/${encodedScriptId}?user_name=${TRADINGVIEW_USERNAME}&allow_create_new=false`,
  'headers': {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
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
    'Cookie': TRADINGVIEW_COOKIE
  },
  formData: {
    'source': pinescriptCode
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
