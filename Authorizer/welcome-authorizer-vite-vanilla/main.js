import './style.css';
import { Authorizer } from '@authorizerdev/authorizer-js';
import TokenVO from './entities/vos/token_vo.js';
import HeaderVO from './entities/vos/header_vo.js';
import { uploadFromDomInput } from './utils.js';

const DB_URL_BOOKS = 'http://localhost:5984/books';
const BOOKS_PER_PAGE = 30;

const authorizer = new Authorizer({
  authorizerURL: 'http://localhost:8081/',
  redirectURL: window.location.origin,
  clientID: '9a8498c5-6c09-4881-82c0-ae91626515b2', // obtain your client id from authorizer dashboard
});

const fetchBooksView = (tokenVO, view, method = 'GET', reduce = false) => {
  const headers = new HeaderVO(tokenVO).forCouchDB;
  return fetch(`${DB_URL_BOOKS}/_design/all/_view/${view}${reduce ? '?reduce=true' : ''}`, {
    method,
    headers,
  });
};

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
    const dbBooksInfoResponse = await fetchBooksView(tokenVO, 'amount', 'GET', true);
    const dbBooksInfoData = await dbBooksInfoResponse.json();
    console.log('> books info:', dbBooksInfoData);
    const numberOfBooks = dbBooksInfoData.rows[0].value;
    const numberOfPages = Math.ceil(numberOfBooks / BOOKS_PER_PAGE);
    return `<b>You are logged in.</b>
      <div>Number of books: ${numberOfBooks}</div>
      <small>pages: ${numberOfPages} (${BOOKS_PER_PAGE} per page)</small>
      <div class="card">
        <input id='inpUploadFile' type='file' accept="application/json" hidden/>
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
  const btnUploadBooks = document.getElementById('btnUploadBooks');
  const btnRequestBooks = document.getElementById('btnRequestBooks');

  let offset = 0;

  btnLogout.onclick = async (e) => {
    console.log('> btnLogout -> onClick');
    await authorizer.logout(tokenVO.auth);
    window.location = '/';
  };

  btnRequestBooks.onclick = async (e) => {
    console.log('> btnRequestBooks -> onClick');
    const query = new URLSearchParams();
    query.set('limit', BOOKS_PER_PAGE);
    query.set('skip', offset);
    fetchBooksView(tokenVO, `list?${query}`).then(async (response) => {
      const data = await response.json();
      const rows = data.rows;
      const total = data.total_rows;
      offset += BOOKS_PER_PAGE;
      if (total < offset) btnRequestBooks.disabled = true;
      console.log('> data ->', data);
      const booksList = `<ul>${rows
        .map((book) => `<li style="text-align: left;">${book.value.title}</li>`)
        .join('')}</ul>`;
      const domBooksList = document.getElementById('booksList');
      domBooksList.innerHTML = `${domBooksList.innerHTML}<b>Page: ${Math.floor(
        offset / BOOKS_PER_PAGE,
      )}</b>${booksList}<hr>`;
    });
  };

  btnUploadBooks.onclick = async (e) => {
    uploadFromDomInput('inpUploadFile', async (files) => {
      fetch(`${DB_URL_BOOKS}/_bulk_docs`, {
        method: 'POST',
        headers: new HeaderVO(tokenVO).forCouchDB,
        body: JSON.stringify({ docs: files }),
      }).then(async (response) => {
        const data = await response.json();
        console.log('> data ->', data);
      });
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
