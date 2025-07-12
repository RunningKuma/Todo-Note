<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import { userOps } from "@/api/auth/auth";
import router from "@/router";
import DrawerTrigger from "./SideBar/DrawerTrigger.vue";
import SideBar from "./SideBar/SideBar.vue";
import PageHeader from "@/components/PageHeader.vue";
import { Toast } from "primevue";
import { UserData } from "@/api/types/user";

const userData = ref<UserData>();
userOps.getUserData().then((data) => {
  userData.value = data;
}).catch((error) => {
  console.error("Failed to fetch user data:", error);
});

const visible = ref(true);

</script>

<template>
  <div :class="['main-container', visible ? 'ml-sidebar' : '']">
    <SideBar v-model="visible" :username="userData?.info.username" :email="userData?.info.email"></SideBar>
    <div class="p-4">
      <!-- <DrawerTrigger v-model="visible" /> -->
      <RouterView v-model="visible" />
    </div>
  </div>
</template>

<style>
/* @import './styles/global.css'; */
</style>

<style scoped>
.main-container {
  width: 100%;
  height: 100vh;
  position: relative;
  /* display: flex;
  flex-direction: column;
  place-items: center; */
  gap: 0.5em;
  transition: margin 0.3s, width 0.3s;
}

.main-container.ml-sidebar {
  width: calc(100% - var(--spacing-sidebar));
}
</style>