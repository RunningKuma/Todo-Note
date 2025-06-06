<script setup>
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Card from "primevue/card";
import Message from "primevue/message";
import { ref } from "vue";
import { userOps } from "@/api/auth";

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
      <Button
        variant="text"
        label="Back to login"
        icon="pi pi-arrow-left"
        size="small"
        @click="$emit('stepTo', 'login')"
      />
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
              v-if="emailErrorDisplay"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ emailErrorMessage }}
            </Message>
          </div>
          <div class="flex-auto">
            <label for="username" class="block font-semibold mb-2">Username</label>
            <IconField>
              <InputIcon class="pi pi-user" />
              <InputText
                v-model="username"
                type="text"
                class="w-full"
                placeholder=""
              />
            </IconField>
            <Message
              v-if="usernameErrorDisplay"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ usernameErrorMessage }}
            </Message>
          </div>
          <div class="flex-auto">
            <label for="password" class="block font-semibold mb-2">Password</label>
            <IconField>
              <InputIcon class="pi pi-key" />
              <InputText
                v-model="password"
                type="password"
                class="w-full"
                placeholder=""
                @input="validatePassword"
              />
            </IconField>
            <Message
              v-if="pswErrorDisplay"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ pswErrorMessage }}
            </Message>
          </div>
          <div class="flex-auto">
            <label for="confirm" class="block font-semibold mb-2">Confirm Password</label>
            <IconField>
              <InputIcon class="pi pi-key" />
              <InputText
                v-model="confirm"
                type="password"
                class="w-full"
                placeholder=""
                @input="validatePassword"
                :invalid="passwordMismatch"
              />
            </IconField>
            <Message
              v-if="passwordMismatch"
              size="small"
              severity="error"
              variant="simple"
            >
              Passwords do not match.
            </Message>
          </div>
          <Button
            type="submit"
            label="Sign up"
            :loading="loading"
          />
        </form>
      </div>
    </template>
  </Card>
</template>

<style scoped>
</style>