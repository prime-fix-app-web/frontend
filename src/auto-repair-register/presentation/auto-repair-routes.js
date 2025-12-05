// Lazy load components
const manageTechnician = () => import('./views/manage-technicians.vue');
const manageRequest = () => import('./views/manage-request.vue');
const manageAutoRepair = () => import('./views/manage-auto-repair.vue');
const technicianForm = () => import('./views/technician-form.vue');

const autoRepairRegisterRoutes = [
    // Technician routes
    {
        path: 'technicians',
        component: manageTechnician,
        name: 'technicians',
        meta: {title: 'Manage Technicians'}
    },
    {
        path: 'technicians/new',
        component: technicianForm,
        name: 'technician-new',
        meta: {layout: 'auto-repair-catalog', title: 'New Technician'},
        props: true
    },
    {
        path: 'technicians/edit/:id',
        component: technicianForm,
        name: 'technician-edit',
        meta: {layout: 'auto-repair-catalog', title: 'Edit Technician'},
        props: true
    },
    {
        path: 'manage-request',
        component: manageRequest,
        name: 'manage-request',
        meta: {title: 'Manage Request'}
    },
    {
        path: 'manage-auto-repair',
        component: manageAutoRepair,
        name: 'manage-auto-repair',
        meta: {title: 'Manage Auto Repair'}
    }
];

export default autoRepairRegisterRoutes;
