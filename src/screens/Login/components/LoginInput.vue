<script setup lang="ts">
import { IconField, InputIcon, InputText, Message } from 'primevue';
// import { JSX } from 'vue/jsx-runtime';

const model = defineModel<string>();

const emit = defineEmits<{
  (e: 'input'): void;
  (e: 'invalid'): void;
}>();
let { id, title, placeholder, type = 'text', icon, pattern, errorDisplay, errorMessage, autofocus = false, required } = defineProps<{
  id: string;
  title?: string;
  placeholder?: string;
  type?: 'text' | 'password';
  icon: string;// | JSX.Element
  pattern?: string;
  errorDisplay: boolean;
  errorMessage: string;
  autofocus?: boolean;
  required?: boolean;
}>();

const _title = title || id.charAt(0).toUpperCase() + id.slice(1);



</script>
<template>
  <div class="flex-auto">
    <label :for="id" class="block font-semibold mb-2">{{ _title }}</label>
    <IconField>
      <InputIcon :class="icon" v-if="typeof icon === 'string'" />
      <InputText :id="id" v-model="model" :type="type" class="w-full" :placeholder="placeholder" :autofocus="autofocus"
        :pattern="pattern" :required="required" @input="emit('input')" @invalid.prevent="emit('invalid')" />
    </IconField>
    <Message v-if="errorDisplay" size="small" severity="error" variant="simple">
      {{ errorMessage }}
    </Message>
  </div>

</template>