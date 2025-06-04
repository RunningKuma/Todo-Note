<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import InputText from 'primevue/inputtext';

const username = ref("");
const email = ref("");
const displayMessage = ref("");

const handleSubmit = () => {
  displayMessage.value = `Hello, ${username.value} (${email.value})!`;
};
</script>

<template>
  <main class="container">
    <h1>Welcome to Tauri + Vue + PrimeVue</h1>
    <div class="login-page">
      <InputText type="text" v-model="username" placeholder="Username" />
      <InputText type="text" v-model="email" placeholder="Email" />
      <Button
        label="Submit"
        severity="secondary"
        @click="handleSubmit"
      />
      <span>{{ displayMessage }}</span>
    </div>
  </main>
</template>

<style>
@import './styles/global.css';
</style>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
}

.login-page {
  width: 36em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
</style>