const history=()=> import('./views/history.vue');
const searchWorkshop=()=>import('./views/search-workshop.vue');
const trackVehicle=()=>import('./views/track-vehicle.vue');
const visitRequest=()=>import('./views/visit-request.vue');
const workshopSelection=()=>import('./views/workshop-selection.vue');

const autoCatalogRoutes =[
    {path:"history",name:"history",component:history},
    {path:"searchWorkshop",name:"searchWorkshop",component:searchWorkshop},
    {path:"trackVehicle",name:"trackVehicle",component:trackVehicle},
    {path:"visitRequest",name:"visitRequest",component:visitRequest},
    {path:"workshopSelection",name:"workshopSelection",component:workshopSelection},

]
export default autoCatalogRoutes;