import './style.css';
import { Authorizer } from '@authorizerdev/authorizer-js';
import TokenVO from './entities/vos/token_vo.js';
import HeaderVO from './entities/vos/header_vo.js';

const DB_URL_BOOKS = 'http://localhost:5984/books';
const BOOKS_PER_PAGE = 30;

const authorizer = new Authorizer({
  authorizerURL: 'http://localhost:8081/',
  redirectURL: window.location.origin,
  clientID: '9a8498c5-6c09-4881-82c0-ae91626515b2', // obtain your client id from authorizer dashboard
});

const onLogout = function (e) {
  console.log('> onLogout: ', e);
};

window.onLogout = onLogout;

async function Authorize() {
  // console.log('> Authorize: authorizer.config =', authorizer.config);
  const tokenVO = new TokenVO(
    await authorizer
      .authorize({ response_type: 'token', use_refresh_token: false })
      .then((data) => {
        // console.log('> Authorize: authorize success =', data);
        return data;
      })
      .catch((e) => ({})),
  );
  // console.log('> Authorize: authorize tokenVO =', tokenVO);
  return tokenVO;
}

async function CreateBodyDOM(tokenVO) {
  if (tokenVO.isValid) {
    const headers = new HeaderVO(tokenVO).forCouchDB;
    const dbBooksInfoResponse = await fetch(DB_URL_BOOKS, { method: 'GET', headers });
    const dbBooksInfoData = await dbBooksInfoResponse.json();
    const numberOfBooks = dbBooksInfoData.doc_count;
    const numberOfPages = Math.ceil(numberOfBooks / BOOKS_PER_PAGE);
    console.log('> books info:', { numberOfBooks, numberOfPages });
    return `<b>You are logged in.</b>
      <div>Number of books: ${numberOfBooks}</div>
      <small>pages: ${numberOfPages}</small>
      <div class="card">
        <button id="btnRequestBooks" type="button">Request Books</button>
        <button id="btnUploadBooks" type="button">Upload Books</button>
        <button id="btnLogout" type="button">Logout</button>
      </div>
      <div id="booksList"></div>
    `;
  } else
    return `
    <div class="card">
      <div><input id="inpEmail" type="email" placeholder="Enter email" value="vladimir.minkin@gmail.com"/></div>
      <div><input id="inpPass" type="password" placeholder="Enter password" value="123"/></div>
      <button id="btnLogin" type="button">Login</button>
    </div>
  `;
}

async function CreateHeaderDOM(tokenVO) {
  // console.log('> CreateHeaderDOM -> tokenVO.auth', tokenVO.auth);
  return (
    (tokenVO &&
      (await authorizer
        .getProfile({ ...tokenVO.auth })
        .then((data) => {
          // console.log(data);
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
    fetch(`${DB_URL_BOOKS}/_find`, {
      method: 'POST',
      headers: new HeaderVO(tokenVO).forCouchDB,
      body: JSON.stringify({
        limit: BOOKS_PER_PAGE,
        offset: 0,
      }),
    }).then(async (response) => {
      const data = await response.json();
      console.log('> data ->', data);
      // const domBooksList = document.getElementById('booksList');
      // domBooksList.append();
    });
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
  const domBody = await CreateBodyDOM(tokenVO);
  await RenderDOM(domHeader, domBody).then(() => {
    if (isTokenValid) {
      ProcessAuthorizedUser(tokenVO);
    } else {
      ProcessUnAuthorized();
    }
  });
})();
