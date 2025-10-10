import './styles.css'

import { createApp } from 'vue'
import App from './App.vue'
import i18n from "@/i18n.js";
import Material from '@primeuix/themes/material';
import PrimeVue from "primevue/config";
import {
    Button,
    Card,
    CascadeSelect,
    ConfirmationService, DatePicker,
    DialogService,
    Dropdown, FloatLabel,
    SelectButton, Textarea,
    ToastService
} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";
import {setupAuthInterceptor} from "@/shared/infrastructure/http/interceptors/auth.interceptor.js";
import useIamStore from "@/iam/application/iam.store.js";

const app = createApp(App);

app.use(i18n)
    .use(PrimeVue, {theme: { preset: Material}, ripple: true})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-select-button', SelectButton)
    .component('pv-card', Card)
    .component('pv-button', Button)
    .component('pv-cascade', CascadeSelect)
    .component('pv-textarea', Textarea)
    .component('pv-floatlabel', FloatLabel)
    .component('pv-datepicker', DatePicker)
    .use(router)
    .use(pinia);

// Load IAM session from storage if available
const iamStore = useIamStore();
iamStore.loadSessionFromStorage();

// Setup auth interceptor with the function to get the access token from the store
setupAuthInterceptor({
    apiKey: 'simulated-api-key',
    BaseUrl: import.meta.env.VITE_API_BASE_URL,
    getAccessToken: () => iamStore.getAccessToken()
});

app.mount('#app');
