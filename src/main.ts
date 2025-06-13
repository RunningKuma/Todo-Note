import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';
import { definePreset } from "@primeuix/themes";

const app = createApp(App);

const AuraPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '{orange.500}',
      600: '{orange.600}',
      700: '{orange.700}',
      800: '{orange.800}',
      900: '{orange.900}',
      950: '{orange.950}'
    },
    colorScheme: {
      light: {
        root: {
          background: '{amber.100}',
          color: '{surface.700}'
        },
        subtitle: {
          color: '{surface.500}'
        }
      },
      dark: {
        root: {
          background: '{surface.900}',
          color: '{surface.0}'
        },
        subtitle: {
          color: '{surface.400}'
        }
      }
    }
  }
});

app.use(PrimeVue, {
  theme: {
    preset: AuraPreset,
    options: {
      darkModeSelector: '.my-app-dark',
    }
  }
})
  .use(ToastService)
  .use(router)
  .mount("#app");
