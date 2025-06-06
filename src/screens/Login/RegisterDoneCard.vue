<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Divider from "primevue/divider";
import Skeleton from "primevue/skeleton";
import Message from "primevue/message";
import { ref } from "vue";

defineEmits(['stepTo']);

const loading = ref(false);

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
        <Message severity="success">You have successfully registered! Please log in to continue.</Message>
        <Button
          label="Back to Login Page"
          class="w-full"
          @click="$emit('stepTo', 'login')"
          :disabled="loading"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
</style>