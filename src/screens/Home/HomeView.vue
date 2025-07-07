<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import { userOps } from "@/api/auth/auth";
import router from "@/router";
import DrawerTrigger from "./SideBar/DrawerTrigger.vue";
import SideBar from "./SideBar/SideBar.vue";
import PageHeader from "@/components/PageHeader.vue";
import { Toast } from "primevue";

const displayMessage = ref("");
const userData = await userOps.getUserData();

const visible = ref(true);

</script>

<template>
  <div :class="['container', visible ? 'ml-sidebar' : '']">
    <SideBar v-model="visible" :username="userData?.info.username"></SideBar>
    <div class="size-full p-4">
      <!-- <DrawerTrigger v-model="visible" /> -->
      <RouterView v-model="visible" />

    </div>
  </div>
  <Toast />
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