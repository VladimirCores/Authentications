<script setup lang="ts">
import { inject, ref } from "vue";
const pb:any = inject('pb');
const errors = ref<Array<string>>([]);

const inputUsername = ref(null);
const inputPassword = ref(null);
const inputConfirm = ref(null);

const onSendClick = async () => {
  const name = (inputUsername.value! as any).value || 'user';
  const password = (inputPassword.value! as any).value || 'password';
  const confirm = (inputConfirm.value! as any).value || 'password';
  console.log('> App -> onSendClick', { name, password });
  const methods = await pb.collection('users').listAuthMethods();
  console.log('> \t methods', methods);
  const userData = await pb
    .collection('users')
    .create({
      username: name,
      password: password,
      passwordConfirm: confirm,
    })
    .catch((e: any) => {
      errors.value.push(e.message as string);
      console.log('> \t error', e);
    });
  console.log('> \t userData:', userData);
}
</script>

<template>
  <h2>New user</h2>
  <div v-if="errors.length">
    <small v-for="error in errors" style="color: red;">{{ error }}</small>
  </div>
  <div>
    <label for="username">Username: </label>
    <input ref="inputUsername" id="username"/>
  </div>
  <div>
    <label for="password">Password: </label>
    <input ref="inputPassword" id="password"/>
  </div>
  <div>
    <label for="confirm">Confirm: </label>
    <input ref="inputConfirm" id="confirm"/>
  </div>
  <button @click="onSendClick">Register</button>
  <div>
    <small><router-link :to="{ path: '/login' }">Login</router-link></small>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
