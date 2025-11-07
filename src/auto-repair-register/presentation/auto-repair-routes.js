import { defineAsyncComponent } from 'vue'

// Lazy load components
const technicianList = () => import('./views/technician-list.vue');
const technicianDetails = () => import('./views/technician-form.vue');
const manageTechnician =() => import('./views/manage-technicians.vue')
const manageRequest =() => import('./views/manage-request.vue')
const manageAutoRepair =() => import('./views/manage-auto-repair.vue')
const technicianForm =() =>import('./views/technician-form.vue')

const autoRepairRegisterRoutes = [
    // Technician routes
    {
        path: 'technicians',
        component: manageTechnician,
        name: 'technicians',
    },
    {
        path: 'technicians/new',
        component: technicianForm,
        name: 'technician-new',
        meta: { layout: 'auto-repair-catalog' },
        props: true
    },
    {
        path: 'technicians/edit/:id',
        component: technicianDetails,
        name: 'technician-edit',
        meta: { layout: 'auto-repair-catalog' },
        props: true
    },
    {
        path:'manage-request',
        component: manageRequest,
        name: 'manage-request'
    },
    {
        path:'manage-auto-repair',
        component: manageAutoRepair,
        name: 'manage-auto-repair'
    }
]

export default autoRepairRegisterRoutes