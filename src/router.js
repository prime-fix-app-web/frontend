import {createRouter, createWebHistory} from "vue-router";
import iamRoutes from "@/iam/presentation/iam-routes.js";
import {authGuard} from "@/shared/infrastructure/guards/auth.guard.js";

const layoutOwner = () => import("./shared/presentation/components/layout-owner.vue");
const layoutWorkshop = () => import("./shared/presentation/components/layout-workshop.vue");
const homeOwner = () => import("./shared/presentation/views/home-owner.vue");
const homeWorkshop = () => import("./shared/presentation/views/home-workshop.vue");
const pageNotFound = () => import("./shared/presentation/views/page-not-found.vue");

// Owner views (bounded context: owner)
const ownerSearchWorkshop = () => import("@/owner/presentation/views/search-workshop.vue");
const ownerWorkshopSelection = () => import("@/owner/presentation/views/workshop-selection.vue");
const ownerProfile = () => import("@/owner/presentation/views/profile.vue");
const ownerVehicles = () => import("@/owner/presentation/views/vehicles.vue");
const ownerHistory = () => import("@/owner/presentation/views/history.vue");
const ownerSettings = () => import("@/owner/presentation/views/settings.vue");
const ownerTrackVehicle = () => import("@/owner/presentation/views/track-vehicle.vue");
const ownerNotificationView = () => import("@/owner/presentation/views/notification-view.vue");
const ownerVisitRequest = () => import("@/owner/presentation/views/visit-request.vue");

const routes = [
    {
        path: '/iam',
        name: 'iam',
        children: iamRoutes,
    },
    {
        path: '/layout-owner',
        name: 'layout-owner',
        component: layoutOwner,
        beforeEnter: authGuard,
        redirect: '/layout-owner/home-owner',
        children: [
            {
                path: 'home-owner',
                name: 'home-owner',
                // Redirect to search-workshop to match sidebar and design
                redirect: { name: 'owner-search-workshop' },
                component: homeOwner,
                meta: { title: 'Home Owner' }
            },
            {
                path: 'profile',
                name: 'owner-profile',
                component: ownerProfile,
                meta: { title: 'Perfil' }
            },
            {
                path: 'vehicles',
                name: 'owner-vehicles',
                component: ownerVehicles,
                meta: { title: 'Coches' }
            },
            {
                path: 'search-workshop',
                name: 'owner-search-workshop',
                component: ownerSearchWorkshop,
                meta: { title: 'Buscar taller' }
            },
            {
                path: 'workshop-selection',
                name: 'owner-workshop-selection',
                component: ownerWorkshopSelection,
                meta: { title: 'Selección de taller' },
                beforeEnter: (to, from, next) => {
                    const hasFilters = !!to.query.department && !!to.query.district;
                    if (!hasFilters) return next({ name: 'owner-search-workshop' });
                    next();
                }
            },
            {
                path: 'visit-request/:id',
                name: 'owner-visit-request',
                component: ownerVisitRequest,
                meta: { title: 'Solicitar visita' },
                beforeEnter: (to, from, next) => {
                    if (!to.params.id) return next({ name: 'owner-search-workshop' });
                    next();
                }
            },
            {
                path: 'history',
                name: 'owner-history',
                component: ownerHistory,
                meta: { title: 'Historial' }
            },
            {
                path: 'settings',
                name: 'owner-settings',
                component: ownerSettings,
                meta: { title: 'Configuración' }
            },
            {
                path: 'maintenance-tracking',
                name: 'owner-maintenance-tracking',
                redirect: { name: 'owner-track-vehicle' },
                children: [
                    {
                        path: 'track-vehicle',
                        name: 'owner-track-vehicle',
                        component: ownerTrackVehicle,
                        meta: { title: 'Seguir estado' }
                    },
                    {
                        path: 'notification-view',
                        name: 'owner-notification-view',
                        component: ownerNotificationView,
                        meta: { title: 'Notificaciones' }
                    }
                ]
            }
        ]
    },
    {
        path: '/layout-workshop',
        name: 'layout-workshop',
        component: layoutWorkshop,
        beforeEnter: authGuard,
        redirect: '/layout-workshop/home-workshop',
        children: [
            {
                path: 'home-workshop',
                name: 'home-workshop',
                component: homeWorkshop,
                meta: { title: 'Home Workshop' }
            }
        ]
    },
    {
        path: '/',
        redirect: '/iam/login'
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: pageNotFound,
        meta: { title: 'Not Found' }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.fullPath} to ${to.fullPath}`);
    let baseTitle = 'Prime Fix';
    document.title = `${baseTitle} - ${to.meta['title']}`;
    next();
})

export default router;