import { defineAsyncComponent } from 'vue'

// Lazy load components
const TechnicianList = () =>
    import('./views/technician-list.vue');
const TechnicianDetails = () =>
    import('./views/technician-details.vue');


const autoRepairRegisterRoutes = [
    // Technician routes
    {
        path: 'technicians',
        component: TechnicianList,
        name: 'technicians',
        meta: { layout: 'auto-repair-catalog' }
    },
    {
        path: '/technicians/new',
        component: TechnicianDetails,
        name: 'technician-new',
        meta: { layout: 'auto-repair-catalog' },
        props: true
    },
    {
        path: '/technicians/edit/:id',
        component: TechnicianDetails,
        name: 'technician-edit',
        meta: { layout: 'auto-repair-catalog' },
        props: true
    },


]

export default autoRepairRegisterRoutes