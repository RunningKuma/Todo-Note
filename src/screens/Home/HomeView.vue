<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import { userOps } from "@/api/auth";
import router from "@/router";
import DrawerTrigger from "./SideBar/DrawerTrigger.vue";
import SideBar from "./SideBar/SideBar.vue";

const displayMessage = ref("");
const userData = userOps.getUserData();

const visible = ref(true);

const handleLogout = () => {
  userOps.logout();
  router.push({name: 'auth'});
};

</script>

<template>
  <div :class="['container', visible ? 'ml-sidebar' : '']">
    <h1>Welcome to Tauri + Vue + PrimeVue</h1>
    <h2>You are login as {{ userData?.username }}</h2>
    <SideBar v-model="visible" :username="userData.username"></SideBar>
    <div>
      <Button class="block" label="Logout" severity="secondary" @click="handleLogout" />
      <span>{{ displayMessage }}</span>
      <DrawerTrigger v-model="visible" />


    </div>
  </div>
</template>

<style>
/* @import './styles/global.css'; */
</style>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: center;
  place-items: center;
  gap: 0.5em;
  transition: margin 0.3s;
}
</style>