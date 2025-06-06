<script setup>
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Card from "primevue/card";
import Divider from "primevue/divider";
import Skeleton from "primevue/skeleton";
import Message from "primevue/message";
import { ref } from "vue";
import { userOps } from "@/api/auth";

const emit = defineEmits(['stepTo']);
const email = defineModel();

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
        <Skeleton width="8rem" height="8rem"></Skeleton>
        <Divider />
      </div>
    </template>
    <template #content>
      <div class="flex flex-col gap-4">
        <form
          @submit.prevent="handleForm"
          class="flex flex-col gap-4"
        >
          <div class="flex-auto">
            <label for="email" class="block font-semibold mb-2">Email</label>
            <IconField>
              <InputIcon class="pi pi-at" />
              <InputText
                v-model="email"
                type="text"
                class="w-full"
                placeholder="example@example.com"
              />
            </IconField>
            <Message
              v-if="errorDisplay"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ errorMessage }}
            </Message>
          </div>
          <Button
            type="submit"
            label="Continue"
            :loading="loading"
          />
        </form>
        <Button
          label="Sign up with email"
          class="w-full"
          severity="secondary"
          @click="$emit('stepTo', 'register')"
          :disabled="loading"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
</style>