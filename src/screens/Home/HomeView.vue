<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import {  userOps } from "@/api/auth";
import router from "@/router";

// const username = ref("");
// const email = ref("");
const displayMessage = ref("");
const userData  = userOps.getUserData();

const handleLogout = () => {
  userOps.logout();
  router.push({name: 'auth'});
};

</script>

<template>
  <!-- <div class="container"> -->
    <h1>Welcome to Tauri + Vue + PrimeVue</h1>
    <h2 >You are login as {{ userData?.username }}</h2>
    <div class="login-page">
      <Button
        label="Logout"
        severity="secondary"
        @click="handleLogout"
      />
      <span>{{ displayMessage }}</span>
    </div>
  <!-- </div> -->
</template>

<style>
/* @import './styles/global.css'; */
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