import './styles.css'

import { createApp } from 'vue'
import App from './App.vue'
import i18n from "@/i18n.js";
import Material from '@primeuix/themes/material';
import PrimeVue from "primevue/config";
import {ConfirmationService, DialogService, SelectButton, ToastService} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";
import useIamStore from "@/iam/application/iam.store.js";

const app = createApp(App);

app.use(i18n)
    .use(PrimeVue, {theme: { preset: Material}, ripple: true})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-select-button', SelectButton)
    .use(router)
    .use(pinia);

// Load IAM session from storage if available
const iamStore = useIamStore();
iamStore.loadSessionFromStorage();

app.mount('#app');
