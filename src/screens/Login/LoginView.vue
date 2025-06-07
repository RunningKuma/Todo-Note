<script setup lang="ts">
import { ref } from "vue";
import { userOps } from "@/api/auth";
import router from "@/router";
import LoginCard from "./LoginCard.vue";
import RegisterCard from "./RegisterCard.vue";
import InitialCard from "./InitialCard.vue";
import RegisterDoneCard from "./RegisterDoneCard.vue";

type LoginType = "initial" | "login" | "register" | "registerDone";

if (userOps.checkAuth()){
  router.push({ name: 'home' });
}

const loginStep = ref<LoginType>("initial");
const stepTo = (new_value: LoginType) => {
  loginStep.value = new_value;
};

const email = ref("");
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-10">
    <InitialCard v-if="loginStep === 'initial'" v-model="email" @stepTo="stepTo" />
    <LoginCard v-else-if="loginStep === 'login'" v-model="email" @stepTo="stepTo" />
    <RegisterCard v-else-if="loginStep === 'register'" v-model="email" @stepTo="stepTo" />
    <RegisterDoneCard v-else-if="loginStep === 'registerDone'" @stepTo="stepTo" />
  </div>
</template>

<style scoped>
</style>