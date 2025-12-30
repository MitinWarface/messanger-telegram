import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';

// Import styles
import './assets/css/tailwind.css';

// Create Vue app
const app = createApp(App);

// Create Pinia store
const pinia = createPinia();
app.use(pinia);

// Create and use router
app.use(router);

// Create and use i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      // English translations
    },
    ru: {
      // Russian translations
    }
  }
});
app.use(i18n);

// Mount app
app.mount('#app');