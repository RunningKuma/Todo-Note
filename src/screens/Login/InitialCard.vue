<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Divider from "primevue/divider";
import Skeleton from "primevue/skeleton";
import { ref } from "vue";
import { userOps } from "@/api/auth";
import LoginInput from "./components/LoginInput.vue";

const emit = defineEmits(['stepTo']);
const email = defineModel<string>();

const loading = ref(false);
const errorDisplay = ref(false);
const errorMessage = ref("");

const handleForm = async () => {
  if (loading.value) return;
  loading.value = true;

  errorDisplay.value = false;
  errorMessage.value = "";
  const result = await userOps.getLoginOptions(email.value);
  if (result.success) {
    loading.value = false;
    emit('stepTo', 'login');
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
          <Button type="submit" label="Continue" :loading="loading" />
        </form>
        <Button label="Sign up with email" class="w-full" severity="secondary" @click="$emit('stepTo', 'register')"
          :disabled="loading" />
      </div>
    </template>
  </Card>
</template>

<style scoped>
</style>