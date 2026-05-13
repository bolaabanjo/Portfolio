const readline = require('readline');
const querystring = require('querystring');
const crypto = require('crypto');

const CLIENT_ID = '8272a59fdbff4502b483cb4bbcafcf37';
const CLIENT_SECRET = 'd98ff011eb7a4de984ae5e8f12befaef';
// Use the URL the user already set in the dashboard
const REDIRECT_URI = 'https://bolabanjo.xyz/api/spotify/callback';

const generateRandomString = (length) => {
  return crypto.randomBytes(60).toString('hex').slice(0, length);
};

const state = generateRandomString(16);
const scope = 'user-read-currently-playing user-read-recently-played';

const authQueryParameters = querystring.stringify({
  response_type: 'code',
  client_id: CLIENT_ID,
  scope: scope,
  redirect_uri: REDIRECT_URI,
  state: state
});

const loginUrl = `https://accounts.spotify.com/authorize?${authQueryParameters}`;

console.log('\n🎧 Spotify Authorization\n');
console.log('1. Click this link to log in and authorize the app:');
console.log(`\n   ${loginUrl}\n`);
console.log('2. After you authorize, you will be redirected to your website (it might be a 404 page, that is fine!).');
console.log('3. Copy the ENTIRE URL from your browser\'s address bar and paste it below.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Paste the full redirected URL here: ', (pastedUrl) => {
  rl.close();
  
  let code = null;
  try {
    const urlObj = new URL(pastedUrl.trim());
    code = urlObj.searchParams.get('code');
  } catch (e) {
    // maybe they just pasted the code?
    if (!pastedUrl.includes('http')) {
      code = pastedUrl.trim();
    }
  }

  if (!code) {
    console.error('\n❌ Could not find the "code" parameter in the URL. Please try again.');
    process.exit(1);
  }

  console.log('\nFetching refresh token...');

  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: querystring.stringify({
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  };

  fetch('https://accounts.spotify.com/api/token', authOptions)
    .then(response => response.json())
    .then(data => {
      if (data.refresh_token) {
        console.log('\n✅ SUCCESS! Here is your Refresh Token:\n');
        console.log('--------------------------------------------------');
        console.log(data.refresh_token);
        console.log('--------------------------------------------------\n');
        console.log('Copy this refresh token and add it to your .env.local file as SPOTIFY_REFRESH_TOKEN.');
      } else {
        console.error('\n❌ Failed to get refresh token:', data);
      }
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
    });
});
