// Lazy-loaded components
const paymentSummary = () => import('./views/payment-summary.vue');
const paymentSelect = () => import('./views/payment-select.vue');
const paymentForm = () => import('./views/payment-form.vue');
const paymentDone = () => import('./views/payment-done.vue');
const ratingPrompt = () => import('./views/rating-prompt.vue');
const ratingForm = () => import('./views/rating-form.vue');
const ratingDone = () => import('./views/rating-done.vue');

const publishingRoutes = [
    {   path: 'payment',                name: 'payment-summary',           component: paymentSummary, meta: {title: 'Payment'}},
    {   path: 'payment/select',         name: 'payment-selection',         component: paymentSelect, meta: {title: 'Selection'}},
    {   path: 'payment/select/form',    name: 'payment-selection-form',    component: paymentForm, meta: {title: 'Payment Form'}},
    {   path: 'payment/done',           name: 'payment-done',              component: paymentDone, meta: {title: 'Payment Done'}},
    {   path: 'rating',                 name: 'rating-prompt',             component: ratingPrompt, meta: {title: 'Rating'}},
    {   path: 'rating/form',            name: 'rating-form',               component: ratingForm, meta: {title: 'Rating Form'}},
    {   path: 'rating/done',            name: 'rating-done',               component: ratingDone, meta: {title: 'Rating Done'}},
];

export default publishingRoutes;