import 'carbon-web-components/es/components/input/index.js';
import 'carbon-web-components/es/components/tile/index.js';
import 'carbon-web-components/es/components/button/index.js';
import 'carbon-web-components/es/components/loading/index.js';
import 'carbon-web-components/es/components/checkbox/index.js';

import PocketBase from 'pocketbase';

import templateLogin from './templates/login';
import templateBooks from './templates/books';
import templateBook from './templates/book';

import { findValuesByKey, uploadFromDomInput } from './utils/utils.js';

const client = new PocketBase('http://127.0.0.1:8989');
const BOOKS_PER_PAGE = 30;

function RenderDOM(headerDOM, bodyDOM = '') {
  document.querySelector('#app').innerHTML = `
  <div>
    <h1>${headerDOM}</h1>
    <div>${bodyDOM}</div>
  </div>
  `;
}

const preloaderShowHide = (visibility = false, domId = 'preloaderBooks') => {
  const preloaderBooks = document.getElementById(domId);
  if (!visibility) {
    preloaderBooks.setAttribute('inactive', 'true');
    preloaderBooks.style.display = 'none';
  } else {
    preloaderBooks.removeAttribute('inactive');
    preloaderBooks.style.display = 'block';
  }
};

function RenderLoginView(authMethods) {
  RenderDOM('PocketBase', templateLogin);
  console.log('> Possible Auth Methods:', { ...authMethods });

  const inpEmail = document.getElementById('inpEmail');
  const inpPass = document.getElementById('inpPass');
  const btnSubmit = document.getElementById('btnSubmit');
  const chbSignup = document.getElementById('chbSignup');

  inpEmail.value = 'vladimirminkin@gmail.com';
  inpPass.value = '12345678';

  btnSubmit.onclick = async () => {
    console.log(`> chbSignup.value = ${chbSignup.checked}`);

    const user = chbSignup.checked
      ? await client.users
          .create({
            email: inpEmail.value,
            password: inpPass.value,
            passwordConfirm: inpPass.value,
          })
          .then((response) => {
            console.log('> Create response:', response);
            return response;
          })
          .catch((e) => {
            const messages = findValuesByKey(e.data, 'message').join(' ');
            document.getElementById('inpEmailMessage').innerText = messages;
            inpEmail.setAttribute('invalid', 'true');
            console.log({ messages: messages });
          })
      : await client.users.authViaEmail(inpEmail.value, inpPass.value);
    console.log('> User created:', user);
    if (user) {
      await RenderBooksView(user);
    }
  };
}

async function RenderBooksView(user) {
  console.log('> RenderBooksView:', user);
  RenderDOM('PocketBase', templateBooks(user.email));

  const booksContainer = document.getElementById('booksContainer');
  const btnAddBooks = document.getElementById('btnAddBooks');

  const appendBooksListToContainer = (dataList, container) => {
    const booksList = dataList.map((item) => templateBook(item)).join('');
    container.innerHTML = `${booksContainer.innerHTML}${booksList}`;
  };

  preloaderShowHide(true);
  await client.records.getList('books', 1, BOOKS_PER_PAGE, { sort: 'added' }).then((data) => {
    console.log('> data loaded:', data);
    appendBooksListToContainer(data.items, booksContainer);
  });
  preloaderShowHide(false);

  btnAddBooks.addEventListener('click', async () => {
    console.log('> btnAddBooks -> click');
    preloaderShowHide(true);
    await uploadFromDomInput('inpUploadFile', async (jsonData) => {
      if (Array.isArray(jsonData)) {
        for await (const data of jsonData) {
          if (data.id) {
            data.index = `${data.id}`;
            delete data.id;
          }
          data.added = new Date();
          console.log('> upload book:', data);
          await client.records.create('books', data).catch((e) => {
            console.log('> error upload the book:', e);
          });
        }
        appendBooksListToContainer(jsonData, booksContainer);
      }
    });
    preloaderShowHide(false);
  });
}

(async () => {
  const authMethods = await client.users.listAuthMethods();
  console.log('> client.authStore?.isValid', client.authStore?.isValid, client.authStore?.model);
  const isUserValid = client.authStore?.isValid;
  const user = isUserValid
    ? await client.users
        .getOne(client.authStore.model.id)
        .then(async () => await client.users.refresh())
        .then((response) => response.user)
        .catch(() => client.authStore.clear())
    : null;

  client.authStore.onChange((token, model) => {
    console.log('> client.authStore.onChange:', token, model);
  });

  if (!user) RenderLoginView(authMethods);
  else await RenderBooksView(user);
})();
