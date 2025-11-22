const history=()=> import('./views/history.vue');
const searchAutoRepair =()=>import('./views/search-auto-repair.vue')
const trackVehicle=()=>import('./views/track-vehicle.vue');
const visitRequest=()=>import('./views/visit-request.vue');
const workshopSelection=()=>import('./views/workshop-selection.vue');
const visitForm=()=>import('../../data-collection-diagnosis/presentation/views/visit-form.vue')

const autoCatalogRoutes =[
    {path:"history",name:"history",component:history},
    {path:"searchWorkshop",name:"searchWorkshop",component:searchAutoRepair},
    {path:"trackVehicle",name:"trackVehicle",component:trackVehicle},
    {path:"visitRequest",name:"visitRequest",component:visitRequest},
    {path:"workshopSelection",name:"workshopSelection",component:workshopSelection},
    {path:"schedule-visit/:id_auto_repair?",name:"visitForm",component:visitForm},

]
export default autoCatalogRoutes;