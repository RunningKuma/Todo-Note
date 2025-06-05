<script setup>
import { ref } from "vue";
import { userOps } from "@/api/auth";
import router from "@/router";
import LoginCard from "./LoginCard.vue";
import RegisterCard from "./RegisterCard.vue";
import InitialCard from "./InitialCard.vue";

if (userOps.checkAuth()){
  router.push({ name: 'home' });
}

const loginStep = ref(0);
const stepTo = (new_value) => {
  loginStep.value = new_value;
};

const email = ref("");
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-10">
    <div class="w-full max-w-md">
      <InitialCard
        v-if="loginStep === 0"
        v-model="email"
        @stepTo="stepTo"
      />
      <LoginCard
        v-else-if="loginStep === 1"
        v-model="email"
        @stepTo="stepTo"
      />
      <RegisterCard
        v-else
        v-model="email"
        @stepTo="stepTo"
      />
    </div>
  </div>
</template>

<style>
/* @import '@/styles/global.css'; */
</style>

<style scoped>
</style>