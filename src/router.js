import {createRouter, createWebHistory} from "vue-router";
import iamRoutes from "@/iam/presentation/iam-routes.js";
import autoRepairRegisterRoutes from "@/autorepair-registration/auto-repair-routes.js";



const layoutOwner = () => import("./shared/presentation/components/layout-owner.vue");
const layoutWorkshop = () => import("./shared/presentation/components/layout-workshop.vue");
const homeOwner = () => import("./shared/presentation/views/home-owner.vue");
const homeWorkshop = () => import("./shared/presentation/views/home-workshop.vue");
const pageNotFound = () => import("./shared/presentation/views/page-not-found.vue");


const routes = [

    {
        path: '/autoRepairs',
        name: 'autoRepairs',
        children: autoRepairRegisterRoutes,

    },
    {
        path: '/iam',
        name: 'iam',
        children: iamRoutes,
    },

    {
        path: '/layout-owner',
        name: 'layout-owner',
        component: layoutOwner,
        children: [
            {
                path: 'home-owner',
                name: 'home-owner',
                component: homeOwner,
                meta: { title: 'Home Owner' }
            },
            {
                path: '/autoRepairs',
                name: 'autoRepairs',
                children: autoRepairRegisterRoutes,

            },
            {
                path: '',
                redirect: '/layout-owner/home-owner'
            },

        ]
    },
    {
        path: '/layout-workshop',
        name: 'layout-workshop',
        component: layoutWorkshop,
        children: [
            {
                path: 'home-workshop',
                name: 'home-workshop',
                component: homeWorkshop,
                meta: { title: 'Home Workshop' }
            },

            {
                path: '',
                redirect: '/layout-workshop/home-workshop'
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

