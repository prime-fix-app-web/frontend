import TrackVehicle from "@/auto-repair-catalog/presentation/views/track-vehicle.vue";

const trackVehicle = () => import('./views/track-vehicle.vue');
const notificationView = () => import('./views/notification-view.vue');
const manageVehicles =() => import('./views/manage-vehicles.vue');

/**
 * Routes for the Maintenance Tracking module
 * @type {Array<import('vue-router').RouteRecordRaw>}
 */
const trackingRoutes =[
    {path:'track-vehicle', name:'track-vehicle',component:trackVehicle() , meta:{title:'Track Vehicle'}},
    {path:'manage-vehicles', name:'manage-vehicles',component:manageVehicles(), meta:{title:'Manage Vehicles'}},
    {path:'notification-view', name:'notification-view',component: notificationView() , meta:{title:'Notification View'}},
];

export default trackingRoutes;