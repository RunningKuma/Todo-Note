<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import InputText from 'primevue/inputtext';
import { userOps } from "@/api/auth";
import router from "@/router";

const username = ref("");
const email = ref("");
const displayMessage = ref("");

const handleSubmit = (event) => {
  //@todo implement real submit logic
  event.preventDefault();
  userOps.login()
  router.push({ name: 'home' });
  displayMessage.value = `Hello, ${username.value} (${email.value})!`;
};

if(userOps.checkAuth()){
  router.push({ name: 'home' });
}
</script>

<template>
  <!-- <div class="container"> -->
    <h1>Login</h1>
    <div>
      <!--@todo use primevue Form instead  -->
      <form class="login-page" :onsubmit="handleSubmit">
        <InputText name="username" type="text" v-model="username" placeholder="Username" />
        <InputText name="email" type="text" v-model="email" placeholder="Email" />
        <Button
        label="Submit"
        severity="secondary"
        type="submit"
        />
      </form>
      <span>{{ displayMessage }}</span>
    </div>
  <!-- </div> -->
</template>

<style>
/* @import '@/styles/global.css'; */
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