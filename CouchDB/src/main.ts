import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const db = new PouchDB('http://localhost:5984/books');
const app = createApp(App);
app.provide(/* key */ 'db', /* value */ db)
app.mount('#app')


