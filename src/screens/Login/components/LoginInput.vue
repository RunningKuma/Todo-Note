<script setup lang="ts">
import { IconField, InputIcon, InputText, Message } from 'primevue';
// import { JSX } from 'vue/jsx-runtime';

const model = defineModel<string>();
let { id, title, placeholder, type = 'text', icon, errorDisplay, errorMessage, autofocus = false, required, onInput } = defineProps<{
  id: string;
  title?: string;
  placeholder: string;
  type?: 'text' | 'password';
  icon: string;// | JSX.Element
  errorDisplay: boolean;
  errorMessage: string;
  autofocus?: boolean;
  required?: boolean;
  onInput?: () => void;
}>();

const _title = title || id.charAt(0).toUpperCase() + id.slice(1);

</script>
<template>
  <div class="flex-auto">
    <label :for="id" class="block font-semibold mb-2">{{ _title }}</label>
    <IconField>
      <InputIcon :class="icon" v-if="typeof icon === 'string'" />
      <InputText :id="id" v-model="model" :type="type" class="w-full" :placeholder="placeholder" :autofocus="autofocus"
        :required="required" @input="onInput" />
    </IconField>
    <Message v-if="errorDisplay" size="small" severity="error" variant="simple">
      {{ errorMessage }}
    </Message>
  </div>

</template>