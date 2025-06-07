<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Divider from "primevue/divider";
import Skeleton from "primevue/skeleton";
import { ref } from "vue";
import { userOps } from "@/api/auth";
import router from "@/router";
import LoginInput from "./components/LoginInput.vue";

defineEmits(['stepTo']);

const email = defineModel();
const loading = ref(false);

const errorDisplay = ref(false);
const errorMessage = ref("");

const password = ref("");

const handleForm = async () => {
  if (loading.value) return;
  loading.value = true;

  errorDisplay.value = false;
  errorMessage.value = "";

  const result = await userOps.login(email.value, password.value);
  console.log(result);

  if (result.success) {
    loading.value = false;
    router.push({ name: 'home' });
  } else {
    loading.value = false;
    errorDisplay.value = true;
    errorMessage.value = result.message || "An error occurred. Please try again.";
  }
};
</script>

<template>
  <Card>
    <template #title>
      <div class="flex flex-col items-center gap-2 justify-center">
        <Skeleton class="size-32!"></Skeleton>
        <Divider />
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <form @submit.prevent="handleForm" class="flex flex-col gap-4">
          <LoginInput id="email" placeholder="example@example.com" icon="pi pi-at" v-model="email"
            :errorDisplay="errorDisplay" :errorMessage="errorMessage" />
          <LoginInput id="password" icon="pi pi-key" v-model="password" type="password" :errorDisplay="errorDisplay"
            :errorMessage="errorMessage" autofocus />
          <Button type="submit" label="Login" :loading="loading" />
        </form>
        <Button label="Sign up with email" class="w-full" severity="secondary" @click="$emit('stepTo', 'register')"
          :disabled="loading" />
      </div>
    </template>
  </Card>
</template>

<script setup>
</script>