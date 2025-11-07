import Login from "@/iam/presentation/views/login.vue";

const forgotPassword = () => import('./views/forgot-password.vue');
const paymentView = () => import('./views/payment-view.vue');
const planOwner = () => import('./views/plan-owner.vue');
const planWorkshop = () => import('./views/plan-workshop.vue');
const registerOwner = () => import('./views/register-owner.vue');
const registerWorkshop = () => import('./views/register-workshop.vue');
const userRole = () => import('./views/user-role.vue');

const iamRoutes = [
    {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { title: 'Login' }
    },
    {
        path: 'payment-view',
        name: 'payment-view',
        component: paymentView,
        meta: { title: 'Payment View' }
    },
    {
        path: 'plan-auto-repair-catalog',
        name: 'plan-owner',
        component: planOwner,
        meta: { title: 'Plan Owner' }
    },
    {
        path: 'plan-workshop',
        name: 'plan-workshop',
        component: planWorkshop,
        meta: { title: 'Plan Workshop' }
    },
    {
      path: 'forgot-password',
      name: 'forgot-password',
      component: forgotPassword,
      meta: { title: 'Forgot Password' }
    },
    {
        path: 'register-auto-repair-catalog',
        name: 'register-owner',
        component: registerOwner,
        meta: { title: 'Register Owner' }
    },
    {
        path: 'register-workshop',
        name: 'register-workshop',
        component: registerWorkshop,
        meta: { title: 'Register Workshop' }
    },
    {
        path: 'user-role',
        name: 'user-role',
        component: userRole,
        meta: { title: 'User Role' }
    },
];

export default iamRoutes;