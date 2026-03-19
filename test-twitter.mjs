import crypto from 'crypto';

const apiKey = process.env.TWITTER_API_KEY;
const apiSecret = process.env.TWITTER_API_SECRET;
const accessToken = process.env.TWITTER_ACCESS_TOKEN;
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

console.log('API Key:', apiKey);
console.log('Access Token starts:', accessToken?.substring(0, 25));
console.log('Access Token Secret starts:', accessTokenSecret?.substring(0, 5));
console.log('Access Token length:', accessToken?.length);
console.log('Access Token Secret length:', accessTokenSecret?.length);

if (!accessToken || !accessTokenSecret || accessTokenSecret.length === 0) {
  console.log('ERROR: Missing credentials');
  process.exit(1);
}

const method = 'GET';
const url = 'https://api.twitter.com/2/users/me';
const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomBytes(16).toString('hex');

const params = {
  oauth_consumer_key: apiKey,
  oauth_nonce: nonce,
  oauth_signature_method: 'HMAC-SHA1',
  oauth_timestamp: timestamp,
  oauth_token: accessToken,
  oauth_version: '1.0',
};

const sortedParams = Object.keys(params).sort().map(k =>
  encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
).join('&');

const signatureBase = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(sortedParams);
const signingKey = encodeURIComponent(apiSecret) + '&' + encodeURIComponent(accessTokenSecret);
const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

const authHeader = 'OAuth ' + Object.entries({
  oauth_consumer_key: apiKey,
  oauth_nonce: nonce,
  oauth_signature: signature,
  oauth_signature_method: 'HMAC-SHA1',
  oauth_timestamp: timestamp,
  oauth_token: accessToken,
  oauth_version: '1.0',
}).map(([k,v]) => k + '="' + encodeURIComponent(v) + '"').join(', ');

const resp = await fetch(url, { headers: { 'Authorization': authHeader } });
const body = await resp.text();
console.log('Status:', resp.status);
console.log('Body:', body.substring(0, 800));
