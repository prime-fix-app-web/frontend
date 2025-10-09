import { defineAsyncComponent } from 'vue'

// Lazy load components
const TechnicianList = () =>
    import('./presentation/views/technician-list.vue');
const TechnicianDetails = () =>
    import('./presentation/views/technician-details.vue');
const AutoRepairRegisterForm = () =>
    import('./presentation/views/auto-repair-register-form.vue');

const autoRepairRegisterRoutes = [
    // Technician routes
    {
        path: '/technicians',
        component: TechnicianList,
        name: 'technicians'
    },
    {
        path: '/technicians/new',
        component: TechnicianDetails,
        name: 'technician-new'
    },
    {
        path: '/technicians/edit/:id',
        component: TechnicianDetails,
        name: 'technician-edit'
    },

    // Auto repair registration routes
    {
        path: '/auto-repairs',
        component: AutoRepairRegisterForm,
        name: 'auto-repairs'
    },
    {
        path: '/auto-repairs/new',
        component: AutoRepairRegisterForm,
        name: 'auto-repair-new'
    },
    {
        path: '/auto-repairs/edit/:id',
        component: AutoRepairRegisterForm,
        name: 'auto-repair-edit'
    }
]

export default autoRepairRegisterRoutes // ✅ Exporta la variable correcta