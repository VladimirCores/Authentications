export function findValuesByKey(obj, key) {
  return findValuesHelper(obj, key, []);
}

function findValuesHelper(obj, key, list) {
  if (!obj) return list;
  if (obj instanceof Array) {
    for (let i in obj) {
      list = list.concat(findValuesHelper(obj[i], key, []));
    }
    return list;
  }
  if (obj[key]) list.push(obj[key]);

  if (typeof obj == 'object') {
    let children = Object.keys(obj);
    if (children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        list = list.concat(findValuesHelper(obj[children[i]], key, []));
      }
    }
  }
  return list;
}

export async function loadJsonFromFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => resolve(JSON.parse(event.target.result));
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsText(file);
  });
}

export async function uploadFromDomInput(domInputId, filesProcessorAsyncMethod) {
  const domInputUploadFile = document.getElementById(domInputId);
  if (!domInputUploadFile) throw new Error(`No DOM element with id: ${domInputId}`);
  domInputUploadFile.addEventListener('change', async () => {
    console.log('> inpUploadFile.value', domInputUploadFile.files);
    const load = async (files) => {
      for await (const file of files) {
        console.log('> \t', file);
        const jsonData = await loadJsonFromFile(file);
        console.log('> \t content:', jsonData);
        filesProcessorAsyncMethod(jsonData);
      }
    };
    await load(domInputUploadFile.files);
  });
  domInputUploadFile.click();
}
