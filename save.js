var request = require('request');
var fs = require('fs');
var path = require('path');

// Read the full PineScript code from the file
var pinescriptCode = fs.readFileSync(path.join(__dirname, 'pinescriptcode.txt'), 'utf8');

var options = {
  'method': 'POST',
  'url': 'https://pine-facade.tradingview.com/pine-facade/save/next_draft/USER%3B5369896c2e834f1283386871c9f1ceff?user_name=stockcryptobots&allow_create_new=false',
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
    'Cookie': 'cookiePrivacyPreferenceBannerProduction=notApplicable; cookiesSettings={"analytics":true,"advertising":true}; _ga=GA1.1.1893146910.1752358816; device_t=ZnFqdzowLDVCdGFBZzoz.D-7ByYw7QXwO6Wyqgbarm1Aaj3lbIFefUOr0DhaOHgA; sessionid=th37an4c9r66g6hga8jxvciiw8845jui; sessionid_sign=v3:IL91TcVrAJUw9yVSR2DwRGPj2KEVvPZp/2xU8P/8iXI=; tv_ecuid=61ba9714-8090-4b1d-9953-c1b1ca10bdf2; theme=dark; _sp_ses.cf1a=*; _ga_YVVRYGL0E0=GS2.1.s1762848522$o170$g1$t1762848756$j60$l0$h0; _sp_id.cf1a=33e81a6d-7bcd-4313-aa3f-257ec20ad5f7.1752358816.39.1762848757.1762804042.8440ef0e-dd42-47fd-bbdf-7f69940b8d9b.03856deb-c67d-44a0-b9b1-79c19f8cab78.0576313f-6ac1-4a88-8fdf-1b1b7238438c.1762848522402.27'
  },
  formData: {
    'source': pinescriptCode
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
