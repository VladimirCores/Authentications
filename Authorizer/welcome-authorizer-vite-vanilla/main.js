import './style.css';
import { Authorizer } from '@authorizerdev/authorizer-js';
import PouchDB from 'pouchdb';

const EXTRA_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
  'Access-Control-Allow-Credentials': 'true',
};

const authorizer = new Authorizer({
  authorizerURL: 'http://localhost:8081/',
  redirectURL: window.location.origin,
  clientID: '9a8498c5-6c09-4881-82c0-ae91626515b2', // obtain your client id from authorizer dashboard
  //extraHeaders: EXTRA_HEADERS,
});

class TokenVO {
  constructor(data) {
    this.access_token = data.access_token;
    this.expired = data.expires_in;
    this.roles = data.roles;
    this.scope = data.scope;
    this.id_token = data.id_token;
    this.token_type = data.token_type;
  }
  get isValid() {
    return !!this.access_token;
  }
  get auth() {
    return { Authorization: `${this.token_type} ${this.access_token}` };
  }
}

const onLogout = function (e) {
  console.log('> onLogout: ', e);
};

window.onLogout = onLogout;

async function Authorize() {
  console.log('> Authorize: authorizer.config =', authorizer.config);
  const tokenVO = new TokenVO(
    await authorizer
      .authorize({
        response_type: 'token',
        use_refresh_token: false,
      })
      .then((data) => {
        console.log('> Authorize: authorize success =', data);
        return data;
      })
      .catch((e) => ({})),
  );
  console.log('> Authorize: authorize tokenVO =', tokenVO);
  return tokenVO;
}

function CreateBodyDOM(isTokenValid) {
  return isTokenValid
    ? `You are logged in
      <div class="card">
        <button id="btnRequestBooks" type="button">Request Books</button>
        <button id="btnLogout" type="button">Logout</button>
      </div>
    `
    : `
    <div class="card">
      <div><input id="inpEmail" type="email" placeholder="Enter email" value="vladimir.minkin@gmail.com"/></div>
      <div><input id="inpPass" type="password" placeholder="Enter password" value="123"/></div>
      <button id="btnLogin" type="button">Login</button>
    </div>
  `;
}

async function CreateHeaderDOM(tokenVO) {
  console.log('> CreateHeaderDOM -> tokenVO.auth', tokenVO.auth);
  return (
    (tokenVO &&
      (await authorizer
        .getProfile({ ...tokenVO.auth })
        .then((data) => {
          console.log(data);
          return `Welcome ${data.family_name || 'No'} ${data.given_name || 'Name'}`;
        })
        .catch((e) => 'Error retrieveing profile'))) ||
    'Authenticate required'
  );
}

async function RenderDOM(headerDOM, bodyDOM) {
  document.querySelector('#app').innerHTML = `
  <div>
    <h1>${headerDOM}</h1>
    <div>${bodyDOM}</div>
  </div>
  `;
}

function ProcessAuthorizedUser(tokenVO) {
  const btnLogout = document.getElementById('btnLogout');
  const btnRequestBooks = document.getElementById('btnRequestBooks');
  btnLogout.onclick = async (e) => {
    console.log('> btnLogout -> onClick');
    await authorizer.logout(tokenVO.auth);
  };
  btnRequestBooks.onclick = async (e) => {
    console.log('> btnRequestBooks -> onClick');
    var db = new PouchDB('http://localhost:5984/books', {
      fetch: function (url, opts) {
        opts.headers.set('X-Some-Special-Header', 'foo');
        return PouchDB.fetch(url, opts);
      },
    });
    // await authorizer.logout(tokenVO.auth);
  };
}

function ProcessUnAuthorized() {
  const btnLogin = document.getElementById('btnLogin');
  btnLogin.onclick = async (e) => {
    console.log('> btnLogin -> onClick');
    const inpEmail = document.getElementById('inpEmail');
    const inpPass = document.getElementById('inpPass');
    await authorizer.login({ email: inpEmail.value, password: inpPass.value });
  };
}

(async function () {
  console.log('> Initialize');
  const tokenVO = await Authorize();
  const isTokenValid = tokenVO.isValid;
  const domHeader = await CreateHeaderDOM(tokenVO);
  const domBody = CreateBodyDOM(isTokenValid);
  await RenderDOM(domHeader, domBody).then(() => {
    if (isTokenValid) {
      ProcessAuthorizedUser(tokenVO);
    } else {
      ProcessUnAuthorized();
    }
  });
})();
