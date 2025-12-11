var request = require('request');
var fs = require('fs');
var path = require('path');

var pinePath = path.join(__dirname, 'pinescriptcode.txt');
var pineSource = fs.readFileSync(pinePath, 'utf8');
var encodedPineSource = encodeURIComponent(pineSource);
var options = {
  'method': 'POST',
  'url': 'https://pine-facade.tradingview.com/pine-facade/publish/next/PUB%3Bd07048cd1bc440a9a05d7544eddaa260?user_name=stockcryptobots',
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
    'Cookie': 'cookiePrivacyPreferenceBannerProduction=notApplicable; cookiesSettings={"analytics":true,"advertising":true}; _ga=GA1.1.1893146910.1752358816; device_t=ZnFqdzowLDVCdGFBZzoz.D-7ByYw7QXwO6Wyqgbarm1Aaj3lbIFefUOr0DhaOHgA; sessionid=th37an4c9r66g6hga8jxvciiw8845jui; sessionid_sign=v3:IL91TcVrAJUw9yVSR2DwRGPj2KEVvPZp/2xU8P/8iXI=; tv_ecuid=61ba9714-8090-4b1d-9953-c1b1ca10bdf2; theme=dark; _sp_ses.cf1a=*; _sp_id.cf1a=33e81a6d-7bcd-4313-aa3f-257ec20ad5f7.1752358816.39.1762849506.1762804042.8440ef0e-dd42-47fd-bbdf-7f69940b8d9b.03856deb-c67d-44a0-b9b1-79c19f8cab78.0576313f-6ac1-4a88-8fdf-1b1b7238438c.1762848522402.73; _ga_YVVRYGL0E0=GS2.1.s1762848522$o170$g1$t1762849575$j60$l0$h0'
  },
  body: 'source=' + encodedPineSource + '&extra=%7B%22originalScriptId%22%3A%22USER%3B5369896c2e834f1283386871c9f1ceff%22%2C%22originalScriptVersion%22%3A%221.0%22%7D'

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log('Status:', response.statusCode);
  console.log(response.body);

  // Parse and show the result
  try {
    const result = JSON.parse(response.body);
    console.log('Success?', result.success);
    console.log('Version:', result.version);
    console.log('Script ID:', result.pineId || result.publishedstudyscript_id);
  } catch (e) {
    console.log('Could not parse response');
  }
});
