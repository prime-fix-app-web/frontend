const history = () => import('./views/history.vue');
const searchAutoRepair = () => import('./views/search-auto-repair.vue');
const visitRequest = () => import('./views/visit-request.vue');
const workshopSelection = () => import('./views/workshop-selection.vue');
const visitForm = () => import('../../data-collection-diagnosis/presentation/views/visit-form.vue');

const autoCatalogRoutes = [
    {path: "history", name: "history", component: history, meta: {title: 'History'}},
    {path: "searchWorkshop", name: "searchWorkshop", component: searchAutoRepair, meta: {title: 'Search Workshop'}},
    {path: "visitRequest", name: "visitRequest", component: visitRequest, meta: {title: 'Visit Request'}},
    {path: "workshopSelection", name: "workshopSelection", component: workshopSelection, meta: {title: 'Workshop Selection'}},
    {path: "schedule-visit/:id_auto_repair?", name: "visitForm", component: visitForm, meta: {title: 'Schedule Visit'}},
];

export default autoCatalogRoutes;