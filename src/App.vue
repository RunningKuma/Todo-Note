<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView/>
</template>

<style>
@import './styles/global.css';
@import 'primeicons/primeicons.css';
@import "tailwindcss";
@import "tailwindcss-primeui";
@custom-variant dark (&:where(.my-app-dark, .my-app-dark *));
</style>
