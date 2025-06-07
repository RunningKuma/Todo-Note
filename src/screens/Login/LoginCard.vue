<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Divider from "primevue/divider";
import Skeleton from "primevue/skeleton";
import { ref } from "vue";
import { userOps } from "@/api/auth";
import router from "@/router";
import LoginInput from "./components/LoginInput.vue";

defineEmits(['stepTo']);

const email = defineModel<string>();
const loading = ref(false);

const errorDisplay = ref(false);
const errorMessage = ref<{ email: string, password: string }>({ email: "", password: "" });

const password = ref("");

const handleForm = async () => {
  if (loading.value) return;
  loading.value = true;

  errorDisplay.value = false;
  errorMessage.value = { email: "", password: "" };

  //@todo fix type
  const result = await userOps.login(email.value, password.value);
  console.log(result);

  if (result.success) {
    loading.value = false;
    router.push({ name: 'home' });
  } else {
    loading.value = false;
    errorDisplay.value = true;
    errorMessage.value.password = result.message || "An error occurred. Please try again.";
  }
};
</script>

<template>
  <Card>
    <template #title>
      <Skeleton class="size-32! mx-auto"></Skeleton>
      <Divider />
    </template>
    <template #content>
      <div>
        <form @submit.prevent="handleForm" class="flex flex-col gap-4">
          <LoginInput id="email" placeholder="example@example.com" icon="pi pi-at" v-model="email"
            :errorDisplay="errorDisplay" :errorMessage="errorMessage.email" required
            @invalid="errorDisplay = true; errorMessage.email = 'Email is required.';" />
          <LoginInput id="password" icon="pi pi-key" v-model="password" type="password" :errorDisplay="errorDisplay"
            :errorMessage="errorMessage.password" autofocus required
            @invalid="errorDisplay = true; errorMessage.password = 'Password is required.';" />
          <Button type="submit" label="Login" :loading="loading" />
          <Button label="Sign up with email" class="w-full" severity="secondary" @click="$emit('stepTo', 'register')"
            :disabled="loading" />
        </form>
      </div>
    </template>
  </Card>
</template>

<script setup>
</script>