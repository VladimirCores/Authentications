<script setup lang="ts">
import { inject, ref } from "vue";
const pb:any = inject('pb');
const errors = ref<Array<string>>([]);

const inputUsername = ref(null);
const inputPassword = ref(null);

const onSendClick = async () => {
  const name = (inputUsername.value! as any).value || 'user';
  const password = (inputPassword.value! as any).value || 'password';
  console.log('> App -> onSendClick', { name, password });
  const methods = await pb.collection('users').listAuthMethods();
  console.log('> \t methods', methods);
  const userData = await pb
    .collection('users')
    .authWithPassword(name, password)
    .catch((e: any) => {
      errors.value.push(e.message as string);
      console.log('> \t error', e);
    });
  console.log('> \t userData:', userData);
}
</script>

<template>
  <h2>Welcome back</h2>
  <div v-if="errors.length">
    <small v-for="error in errors" style="color: red;">{{ error }}</small>
  </div>
  <div>
    <label for="username">Username: </label>
    <input ref="inputUsername" id="username" name="username"/>
  </div>
  <div>
    <label for="password">Password: </label>
    <input ref="inputPassword" id="password" name="password"/>
  </div>
  <button @click="onSendClick">Login</button>
  <div>
    <small><router-link :to="{ path: '/register' }">Register</router-link></small>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
