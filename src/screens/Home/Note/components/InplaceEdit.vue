<script setup lang="ts">
import { join } from 'path';
import { Button, DatePicker, Inplace, InputText } from 'primevue';
import { computed, ref } from 'vue';

// const {readonly} = defineProps<{
//   readonly?: boolean;
// }>();
const value = defineModel<Date | string | string[]>({
  default: '',
})
const type = typeof value.value === 'string' ? 'string' :
  value.value instanceof Date ? 'date' : 'array';

const displayValue = computed(() => type === 'date' ? value.toLocaleString() :
  type === 'array' ? (value.value as string[]).join(', ') : value)
const _editingValue = ref<Date | string>(
  type === 'array' ? (value.value as string[]).join(', ') : value.value as Date | string
);
// _editingValue.value = type === 'array' ? (value.value as string[]).join(', ') : value.value as Date | string

function handleEditConfirm() {
  // @todo fail to update Date and array
  if (type === 'array') {
    value.value = (_editingValue.value as string).split(/，,/g).map(item => item.trim()).filter(item => item);
    console.log((_editingValue.value as string).split(/，,/g).map(item => item.trim()).filter(item => item))
  } else {
    value.value = _editingValue.value!;
    console.table([value.value, _editingValue.value]);
  }
}
function handleCancel() {
  _editingValue.value = type === 'array' ? (value.value as string[]).join(', ') : value.value as Date | string;
}
</script>
<template>
  <Inplace>
    <template #display>
      <span class="text-secondary">{{ displayValue }}</span>
    </template>
    <template #content="{ closeCallback }">
      <InputText v-if="type === 'string'" v-model="_editingValue as string" size="small" class="" autofocus />
      <InputText v-else-if="type === 'array'" v-model="_editingValue as string" size="small" class="" autofocus />
      <DatePicker v-else-if="type === 'date'" show-time v-model="_editingValue as Date" size="small" class=""
        autofocus />
      <span v-else>Error: Invalid type</span>
      <Button class="ml-1" icon="pi pi-times" size="small" severity="danger"
        @click="() => { handleCancel(); closeCallback() }" />
      <Button class="ml-1" icon="pi pi-check" size="small" severity="success"
        @click="() => { handleEditConfirm(); closeCallback() }" />
    </template>
  </Inplace>
</template>