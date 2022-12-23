<script setup lang="ts">
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';

const LIMIT = 10;

const domInputFile = ref(null);
const db:any = inject('db');
const booksList = ref([]);
const currentPageIndex = ref(0);
const maxBooks = ref(0);
const isLoading = ref(true);
const hasUser = ref(false);

const canRenderUpload = computed(() => {
  const result = !isLoading.value && (maxBooks.value == 0);
  console.log('> canRenderUpload:', result);
  return result; 
});
const canRenderNextPageButton = computed(() => currentPageIndex.value < Math.floor((maxBooks.value - 1) / LIMIT))
const loadBooks = async () => Promise.resolve()
  .then(() => isLoading.value = true)
  .then(() => db.allDocs({ limit: LIMIT, skip: currentPageIndex.value * LIMIT, include_docs: true }).then((result: any) => {
    booksList.value = result.rows;
    isLoading.value = false;
    maxBooks.value = result.total_rows;
    console.log(canRenderUpload.value, maxBooks.value, result);
  }));

const getBookIndex = (index:number) => 1 + index + currentPageIndex.value * LIMIT;

const onPageNextClick = () => {
  currentPageIndex.value++;
  loadBooks();
}

const onPagePrevClick = () => {
  currentPageIndex.value--;
  loadBooks();
}

const onUploadClick = () => {
  console.log('> onUploadClick');
  const input = (domInputFile.value! as HTMLInputElement);
  input.onchange = () => {
    const fileList = input.files as FileList;
    const selectedFile = fileList[0];
    console.log('selectedFile:', selectedFile);
    const reader = new FileReader();
    reader.onload = () => {
      const books = JSON.parse(reader.result! as string);
      console.log('selectedFile:', books);
      db.bulkDocs(books);
      reader.onload = null;
    };
    reader.readAsText(selectedFile);
    input.onchange = null;
  }
  input.click();
}

const changes = db.changes({
  since: 'now',
  live: true,
  include_docs: true
}).on('change', function(change: any) {
  console.log("> change", change);
  loadBooks();
}).on('complete', function(info: any) {
  loadBooks();
}).on('error', function (err: any) {
  console.log(err);
});

onMounted(() => {
  loadBooks();
})
onUnmounted(() => {
  changes.cancel();
})
</script>

<template>
  <div v-if="canRenderUpload">
    <input hidden ref="domInputFile" type="file" />
    <button @click="onUploadClick">Upload</button>
  </div>
  <div v-else-if="isLoading">
    Loading...
  </div>
  <div v-else>
    <h2>Books, page <span>{{ currentPageIndex + 1 }}</span></h2>
    <div style="margin: 2rem 0;">
      <button v-if="currentPageIndex > 0" @click="onPagePrevClick" style="margin-right: 1rem;">Prev</button>
      <button v-if="canRenderNextPageButton" @click="onPageNextClick">Next</button>
    </div>
    <div style="text-align: left; width: 400px;">
      <div v-for="(book, index) in booksList">{{ getBookIndex(index) }}. {{ book.doc.title }}</div>
    </div>
  </div>
</template>

<style scoped>

</style>
