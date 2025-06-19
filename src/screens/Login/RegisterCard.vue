<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import { ref } from "vue";
import { userOps } from "@/api/auth/auth";
import LoginInput from "./components/LoginInput.vue";

const emit = defineEmits(['stepTo']);
const email = defineModel<string>();

const loading = ref(false);

const errorDisplay = ref({ email: false, username: false, password: false });
const errorMessage = ref({ email: "", username: "", password: "" });

const signupData = ref({
  username: "", password: "", confirm: ""
});

const passwordMismatch = ref(false);

const validatePassword = () => {
  passwordMismatch.value = signupData.value.password !== signupData.value.confirm;
};

const handleForm = async () => {
  if (loading.value) return;
  loading.value = true;

  errorDisplay.value = { email: false, username: false, password: false };
  errorMessage.value = { email: "", username: "", password: "" };

  if (passwordMismatch.value) {
    loading.value = false;
    return;
  }

  const result = await userOps.register(email.value, signupData.value.username, signupData.value.password);
  if (result.success) {
    loading.value = false;
    emit('stepTo', 'registerDone');
  } else {
    loading.value = false;
    errorDisplay.value.email = true;
    errorMessage.value.email = result.message || "An error occurred. Please try again.";
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
      <div>
        <form @submit.prevent="handleForm" class="flex flex-col gap-4">
          <LoginInput id="email" placeholder="example@example.com" icon="pi pi-at" v-model="email"
            :errorDisplay="errorDisplay.email" :errorMessage="errorMessage.email" required
            @invalid="errorDisplay.email = true; errorMessage.email = 'Email is required.';" />
          <LoginInput id="username" placeholder="Username" icon="pi pi-user" v-model="signupData.username"
            :errorDisplay="errorDisplay.username" :errorMessage="errorMessage.username" required
            @invalid="errorDisplay.username = true; errorMessage.username = 'Username is required.';" />
          <LoginInput id="password" icon="pi pi-key" v-model="signupData.password" :errorDisplay="errorDisplay.password"
            :errorMessage="errorMessage.password" required
            @invalid="errorDisplay.password = true; errorMessage.password = 'Password is required.';"
            @input="validatePassword" />
          <LoginInput id="confirm" title="Confirm Password" icon="pi pi-key" v-model="signupData.confirm"
            type="password" :errorDisplay="passwordMismatch" errorMessage="Passwords do not match." required
            @invalid="passwordMismatch = true;" @input="validatePassword" />
          <Button type="submit" label="Sign up" :loading="loading" />
        </form>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>