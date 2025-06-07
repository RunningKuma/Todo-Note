<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import { ref } from "vue";
import { userOps } from "@/api/auth";
import LoginInput from "./components/LoginInput.vue";

const emit = defineEmits(['stepTo']);
const email = defineModel();

const loading = ref(false);

const emailErrorDisplay = ref(false);
const emailErrorMessage = ref("");

const usernameErrorDisplay = ref(false);
const usernameErrorMessage = ref("");

const pswErrorDisplay = ref(false);
const pswErrorMessage = ref("");

const username = ref("");
const password = ref("");
const confirm = ref("");

const passwordMismatch = ref(false);

const validatePassword = () => {
  passwordMismatch.value = password.value !== confirm.value;
};

const handleForm = async () => {
  if (loading.value) return;
  loading.value = true;

  emailErrorDisplay.value = false;
  emailErrorMessage.value = "";
  usernameErrorDisplay.value = false;
  usernameErrorMessage.value = "";
  pswErrorDisplay.value = false;
  pswErrorMessage.value = "";

  if (!email.value) {
    emailErrorDisplay.value = true;
    emailErrorMessage.value = "Email is required.";
    loading.value = false;
    return;
  }
  if (!username.value) {
    usernameErrorDisplay.value = true;
    usernameErrorMessage.value = "Username is required.";
    loading.value = false;
    return;
  }
  if (!password.value) {
    pswErrorDisplay.value = true;
    pswErrorMessage.value = "Password is required.";
    loading.value = false;
    return;
  }
  if (passwordMismatch.value) {
    loading.value = false;
    return;
  }

  const result = await userOps.register(email.value);
  if (result.success) {
    loading.value = false;
    emit('stepTo', 'registerDone');
  } else {
    loading.value = false;
    emailErrorDisplay.value = true;
    emailErrorMessage.value = result.message || "An error occurred. Please try again.";
  }
};
</script>

<template>
  <Card>
    <template #title>
      <Button variant="text" label="Back to login" icon="pi pi-arrow-left" size="small"
        @click="$emit('stepTo', 'login')" />
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <form @submit.prevent="handleForm" class="flex flex-col gap-4">
          <LoginInput id="email" placeholder="example@example.com" icon="pi pi-at" v-model="email"
            :errorDisplay="emailErrorDisplay" :errorMessage="emailErrorMessage" />
          <LoginInput id="username" placeholder="Username" icon="pi pi-user" v-model="username"
            :errorDisplay="usernameErrorDisplay" :errorMessage="usernameErrorMessage" />
          <LoginInput id="password" icon="pi pi-key" v-model="password" :errorDisplay="pswErrorDisplay"
            :errorMessage="pswErrorMessage" @input="validatePassword" />
          <LoginInput id="confirm" title="Confirm Password" icon="pi pi-key" v-model="confirm" type="password"
            :errorDisplay="passwordMismatch" errorMessage="Passwords do not match." @input="validatePassword" />
          <Button type="submit" label="Sign up" :loading="loading" />
        </form>
      </div>
    </template>
  </Card>
</template>

<style scoped>
</style>