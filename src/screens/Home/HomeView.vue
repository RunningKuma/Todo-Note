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



</script>

<template>
  <div :class="['container', visible ? 'ml-sidebar' : '']">
    <SideBar v-model="visible" :username="userData.username"></SideBar>
    <div class="size-full p-4">
      <DrawerTrigger v-model="visible" />
      <RouterView />


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
  place-items: center;
  gap: 0.5em;
  transition: margin 0.3s;
}
</style>