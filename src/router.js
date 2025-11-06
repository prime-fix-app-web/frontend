import {createRouter, createWebHistory} from "vue-router";
import iamRoutes from "@/iam/presentation/iam-routes.js";
import {roleGuard} from "@/shared/infrastructure/guards/auth.guard.js";
import dataRoutes from "@/data-collection-diagnosis/presentation/data-routes.js";
import paymentServiceRoutes from "@/payment-service/presentation/payment-service-routes.js";
import autoCatalogRoutes from "@/auto-repair-catalog/presentation/auto-repair-catalog-routes.js";
import dashboardOwner from "@/shared/presentation/views/dashboard-owner.vue";
import DashboardWorkshop from "@/shared/presentation/views/dashboard-workshop.vue";
import trackingRoutes from "@/maintenance-tracking/presentation/maintenance-tracking.routes.js";

const layoutOwner = () => import("./shared/presentation/components/layout-owner.vue");
const layoutWorkshop = () => import("./shared/presentation/components/layout-workshop.vue");
const homeOwner = () => import("./shared/presentation/views/home-owner.vue");
const homeWorkshop = () => import("./shared/presentation/views/home-workshop.vue");
const pageNotFound = () => import("./shared/presentation/views/page-not-found.vue");

const trackVehicle = () => import("./maintenance-tracking/presentation/views/track-vehicle.vue");
const notificationView = () => import("./maintenance-tracking/presentation/views/notification-view.vue");

const VEHICLE_OWNER_ROLE_ID = "R001";
const WORKSHOP_ROLE_ID = "R002";

const routes = [
    {
        path: '/iam',
        name: 'iam',
        children: iamRoutes,
    },
    {
        path: '/layout-vehicle-owner',
        name: 'layout-owner',
        component: layoutOwner,
        beforeEnter: roleGuard([VEHICLE_OWNER_ROLE_ID]),
        redirect: '/layout-vehicle-owner/dashboard-owner',
        children: [
            {
                path: 'home-owner',
                name: 'home-auto-repair-catalog',
                component: homeOwner,
                meta: { title: 'Home Owner'}
            },
            {
                path:'dashboard-owner',
                name: 'dashboard-owner',
                component: dashboardOwner,
                meta:{title: 'Dashboard Owner'}
            },
            {
                path: 'track-vehicle',
                name: 'track-vehicle',
                component: trackVehicle,
                meta: { title: 'Track Vehicle' }
            },
            {
                path: 'notification-view',
                name: 'notification-view',
                component: notificationView,
                meta: { title: 'Notifications' }
            },
            {
              path:'auto-repair-catalog',
              name: 'auto-repair-catalog',
              children: autoCatalogRoutes,
            },
            {
                path:'visit',
                name: 'visit',
                children: dataRoutes,
            },
            {
                path: 'payment-service',
                name: 'payment-service',
                children: paymentServiceRoutes,
            },
            {
                path:'maintenance-tracking',
                name: 'maintenance-tracking',
                children: trackingRoutes
            }
        ]
    },
    {
        path: '/layout-workshop',
        name: 'layout-workshop',
        component: layoutWorkshop,
        beforeEnter: roleGuard([WORKSHOP_ROLE_ID]),
        redirect: '/layout-workshop/home-workshop',
        children: [
            {
                path: 'home-workshop',
                name: 'home-workshop',
                component: homeWorkshop,
                meta: { title: 'Home Workshop' }
            },
            {
                path:'dashboard-workshop',
                name: 'dashboard-workshop',
                component: DashboardWorkshop,
                meta:{title: 'Dashboard Workshop'}
            },
            {
                path:'visit',
                name: 'visit',
                children: dataRoutes,
            },
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