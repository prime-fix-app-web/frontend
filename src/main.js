import './styles.css'

import { createApp } from 'vue'
import App from './App.vue'
import i18n from "@/i18n.js";
import Material from '@primeuix/themes/material';
import PrimeVue from "primevue/config";
import {ConfirmationService, DialogService, SelectButton, ToastService} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";


createApp(App)
    .use(i18n)
    .use(PrimeVue, {theme: { preset: Material}, ripple: true})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-select-button', SelectButton)
    .use(router)
    .use(pinia)
    .mount('#app')
