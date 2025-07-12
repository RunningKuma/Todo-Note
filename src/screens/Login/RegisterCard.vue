<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import { ref, onUnmounted } from "vue";
import { userOps } from "@/api/auth/auth";
import LoginInput from "./components/LoginInput.vue";
import { IconField, InputGroup, InputGroupAddon, InputIcon, InputText, Message } from "primevue";
import { useToastHelper } from "@/api/utils/toast";

const emit = defineEmits(['stepTo']);
const email = defineModel<string>();

const code = ref<string>()

const loading = ref(false);
const codeSending = ref(false);
const countdown = ref(0);
const countdownTimer = ref<number | null>(null);

const toast = useToastHelper()

const errorDisplay = ref({ email: false, username: false, password: false, code: false });
const errorMessage = ref({ email: "", username: "", password: "", code: "" });

// 开始倒计时
function startCountdown() {
  countdown.value = 60;
  countdownTimer.value = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value!);
      countdownTimer.value = null;
    }
  }, 1000);
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});

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

  errorDisplay.value = { email: false, username: false, password: false, code: false };
  errorMessage.value = { email: "", username: "", password: "", code: "" };

  if (passwordMismatch.value) {
    loading.value = false;
    return;
  }

  const result = await userOps.register(email.value!, signupData.value.username, signupData.value.password, code.value!);
  if (result.success) {
    loading.value = false;
    emit('stepTo', 'registerDone');
  } else {
    loading.value = false;
    errorDisplay.value.email = true;
    errorMessage.value.email = result.message || "An error occurred. Please try again.";
  }
};
function sendCode() {
  // 如果正在倒计时，不允许再次发送
  if (countdown.value > 0) {
    return;
  }

  if (!email.value) {
    errorDisplay.value.code = true;
    errorMessage.value.code = "请先填写邮箱";
    return;
  }

  codeSending.value = true;
  userOps.sendCode(email.value).then(res => {
    if (!res?.success) {
      errorDisplay.value.code = true;
      errorMessage.value.code = res.message ?? '未知错误';
      console.error(res.message);
    } else {
      toast.success("验证码发送成功，请在 5 分钟内使用。");
      // 发送成功后开始倒计时
      startCountdown();
    }
  }).finally(() => {
    codeSending.value = false;
  });
}
</script>

<template>
  <Card class="shadow-2xl!">
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
          <!-- 懒包装了😄<LoginInput id="code" title="Verification Code" icon="pi pi-key" v-model="code"
            :errorDisplay="errorDisplay.code" :errorMessage="errorMessage.code" required
            @invalid="errorDisplay.code = true; errorMessage.code = 'Verification Code is required.';" /> -->
          <div class="flex-auto">
            <label for="id" class="block font-semibold mb-2">Verification Code</label>
            <InputGroup>
              <!-- <IconField> -->
              <InputGroupAddon>
                <i class="pi pi-key" />
              </InputGroupAddon>
              <InputText id="id" v-model="code" type="text" class="w-full" required
                @invalid.prevent="errorDisplay.code = true; errorMessage.code = 'Verification Code is required.';" />
              <InputGroupAddon>
                <Button :label="countdown > 0 ? `重试(${countdown}s)` : '发送'" severity="secondary" @click="sendCode"
                  :disabled="countdown > 0" :loading="codeSending" />
              </InputGroupAddon>
              <!-- </IconField> -->
            </InputGroup>
            <Message v-if="errorDisplay.code" size="small" severity="error" variant="simple">
              {{ errorMessage.code }}
            </Message>
          </div>

          <LoginInput id="username" icon="pi pi-user" v-model="signupData.username"
            :errorDisplay="errorDisplay.username" :errorMessage="errorMessage.username" required
            @invalid="errorDisplay.username = true; errorMessage.username = 'Username is required.';" />
          <LoginInput id="password" icon="pi pi-key" v-model="signupData.password" :errorDisplay="errorDisplay.password"
            :errorMessage="errorMessage.password" required type="password"
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