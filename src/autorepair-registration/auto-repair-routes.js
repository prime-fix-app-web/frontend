import { defineAsyncComponent } from 'vue'

// Lazy load components
const TechnicianList = () =>
    import('./presentation/views/technician-list.vue');
const TechnicianDetails = () =>
    import('./presentation/views/technician-details.vue');


const autoRepairRegisterRoutes = [
    // Technician routes
    {
        path: 'technicians',
        component: TechnicianList,
        name: 'technicians',
        meta: { layout: 'owner' }
    },
    {
        path: '/technicians/new',
        component: TechnicianDetails,
        name: 'technician-new',
        meta: { layout: 'owner' },
        props: true
    },
    {
        path: '/technicians/edit/:id',
        component: TechnicianDetails,
        name: 'technician-edit',
        meta: { layout: 'owner' },
        props: true
    },


]

export default autoRepairRegisterRoutes