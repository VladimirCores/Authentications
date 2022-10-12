const AUTH_URL = 'http://localhost:8080/oauth/v2/';
const AUTH_REDIRECT = 'http://127.0.0.1:5173/';
const AUTH_ID = '182863739480010755@welcome';
const AUTH_CODE = 'Z2VuZXJhdGUgYSByYW5kb20gc3RyaW5n';

async function Authorize() {
  const url = `${AUTH_URL}authorize`;
  const query = new URLSearchParams({
    redirect_uri: AUTH_REDIRECT,
    client_id: AUTH_ID,
    response_type: 'code',
    scope: 'openid profile email',
    code_challenge: AUTH_CODE,
    code_challenge_method: 'S256'
  });
  await fetch(`${url}?${query.toString()}`, {
    method: 'GET',
    // mode: 'no-cors',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/json' },
  }).then((response) => {
    console.log('> Authorize -> response: ', response);
    if (!response.redirected) {
      window.location.assign(response.url)
      window.open(response.url);
    }
  }).catch(function (err) {
    console.log('> Authorize -> error: ', err);
  });
}

async function Tokenize(code) {
  console.log('> Tokenize -> code =', code)
  await fetch(`${AUTH_URL}token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    mode: 'no-cors',
    body: JSON.stringify({
      code,
      grant_type: 'authorization_code',
      redirect_uri: AUTH_REDIRECT,
      client_id: AUTH_ID,
      // code_verifier: AUTH_CODE,
      code_verifier: 'generate a random string',
    })
  }).then((response) => {
    console.log('> Tokenize -> response: ', response);
  }).catch(function (err) {
    console.log('> Tokenize -> error: ', err);
  });
}

const LOCAL_ACCESS_TOKEN = 'access_token';

(async () => {
  const hasToken = LOCAL_ACCESS_TOKEN in localStorage;
  console.log('> hasToken:', hasToken)

  if (!hasToken) {
    const params = new URLSearchParams(window.location.search);
    const hasCode = params.has('code');
    console.log('> hasCode:', hasCode)
    if (!hasCode) {
      await Authorize();
    } else {
      const code = params.get('code');
      await Tokenize(code);
    }
  } else {
    document.getElementById('app')
      .innerHTML = 'User Authorized';
  }
})()

