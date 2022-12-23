<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
const db:any = inject('db');
db.info().then(function (info: any) {
  console.log(info);
  pageMax.value = Math.ceil(info?.doc_count / 10);
  return info;
});

const books = ref([])
const page = ref(0);
const pageMax = ref(0);
const canRenderNext = computed(() => page.value < pageMax.value)

const fetchBooksOnPage = async (page:number) => await db.allDocs({ limit: 10, skip: page, include_docs: true, })
  .then((listDocument: any) => listDocument.rows)

const loadBooks = async () => books.value = await fetchBooksOnPage(page.value);

const onPrevPageClick = () => {
  page.value--;
  loadBooks();
}
const onNextPageClick = () => {
  page.value++;
  loadBooks();
}

onMounted(async () => {
  await loadBooks();
})

</script>

<template>
  <div>
    <h1>Page: {{ page }} / {{ pageMax }}</h1>
    <button v-if="page > 0" @click="onPrevPageClick">prev</button>
    <button v-if="canRenderNext" @click="onNextPageClick">next</button>
    <hr/>
    <div v-for="row in books" :key="row.id" style="text-align: left;">{{ row.doc.title }}</div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
