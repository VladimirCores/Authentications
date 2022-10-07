import 'carbon-web-components/es/components/input/index.js';
import 'carbon-web-components/es/components/tile/index.js';
import 'carbon-web-components/es/components/button/index.js';
import 'carbon-web-components/es/components/loading/index.js';

import PocketBase from 'pocketbase';

import templateLogin from './templates/login';
import templateBooks from './templates/books';
import templateBook from './templates/book';

import { findValuesByKey, loadJsonFromFile } from './utils/utils.js';

const client = new PocketBase('http://127.0.0.1:8989');

function RenderDOM(headerDOM, bodyDOM = '') {
  document.querySelector('#app').innerHTML = `
  <div>
    <h1>${headerDOM}</h1>
    <div>${bodyDOM}</div>
  </div>
  `;
}

(async () => {
  const authMethods = await client.users.listAuthMethods();
  console.log('> client.authStore?.isValid', client.authStore?.isValid);
  const isUserValid = client.authStore?.isValid;
  const user = isUserValid
    ? await client.users.getOne(client.authStore.model.id).catch(() => {
        client.authStore.clear();
      })
    : null;

  client.authStore.onChange((token, model) => {
    console.log('> client.authStore.onChange:', token, model);
  });

  if (!user) {
    RenderDOM('PocketBase', templateLogin);
    console.log('> Possible Auth Methods:', { ...authMethods });

    const inpEmail = document.getElementById('inpEmail');
    const inpPass = document.getElementById('inpPass');
    const btnSubmit = document.getElementById('btnSubmit');

    inpEmail.value = 'vladimir.minkin@gmail.com';
    inpPass.value = '12345678';
    btnSubmit.onclick = async () => {
      const user = await client.users
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
        });
      console.log('> User created:', user);
      if (user) {
        const authData = await client.users.authViaEmail(inpEmail.value, inpPass.value);
        console.log({ ...authData });
        window.location.replace('/');
      }
    };
  } else {
    // await client.users.delete(client.authStore.token);
    RenderDOM('PocketBase', templateBooks(user.email));
    const preloaderShowHide = (visibility = false) => {
      const preloaderBooks = document.getElementById('preloaderBooks');
      if (!visibility) {
        preloaderBooks.setAttribute('inactive', 'true');
        preloaderBooks.style.display = 'none';
      } else {
        preloaderBooks.removeAttribute('inactive');
        preloaderBooks.style.display = 'block';
      }
    };
    const booksContainer = document.getElementById('booksContainer');
    const btnAddBooks = document.getElementById('btnAddBooks');
    preloaderShowHide(true);
    const collection = await client.collections.getOne('books');
    console.log('> collection -> books', collection);
    await client.records
      .getList('books', 1, 30, {
        sort: 'added',
      })
      .then((data) => {
        console.log('> data loaded:', data);
        booksContainer.innerHTML = `${booksContainer.innerHTML}${data.items
          .map((item) => {
            return templateBook(item);
          })
          .join('')}`;
      });
    preloaderShowHide(false);
    btnAddBooks.addEventListener('click', () => {
      console.log('> btnAddBooks -> click');
      const inpUploadFile = document.getElementById('inpUploadFile');
      preloaderShowHide(true);
      inpUploadFile.addEventListener('change', async () => {
        console.log('> inpUploadFile.value', inpUploadFile.files);
        const loadBooks = async (files) => {
          for (const file of files) {
            console.log('> \t', file);
            const booksJSON = await loadJsonFromFile(file);
            if (Array.isArray(booksJSON)) {
              for await (const data of booksJSON) {
                if (data.id) {
                  data.index = `${data.id}`;
                  delete data.id;
                  // data.id = `${Date.now().toString(32).slice(0, 15)}`;
                }
                data.added = new Date();
                console.log('> upload book:', data);
                await client.records.create('books', data).catch((e) => {
                  console.log('> error upload the book:', e);
                });
              }
            }
            console.log('> \t content:', booksJSON);
          }
        };
        await loadBooks(inpUploadFile.files);
        preloaderShowHide(false);
      });
      inpUploadFile.click();
    });
  }
})();
