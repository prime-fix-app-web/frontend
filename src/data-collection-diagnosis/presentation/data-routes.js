
const visitForm =() => import('./views/visit-form.vue');
const visitList =() => import('./views/visit-list.vue');
const repairList =()=>import('./views/repair-list.vue');
const completedScreen = () => import('./views/completed-screen.vue');
const updateStatus =() => import('./views/update-status.vue');

const dataRoutes = [
    {path:'new',name:'new',component:visitForm, meta:{title:'New'}},
    {path:'list',name:'list',component:visitList, meta:{title:'List'}},
    /*{path:'auto_list',name:'auto_list',component:repairList, meta:{title:'Auto_list'}},*/
    {path:'completed',name:'completed',component:completedScreen, meta:{title:'Completed'}},
    {path:'edit/:id',name:'edit',component:visitForm, meta:{title:'Edit'}, data:{renderMode:'client'}},
    {path:'update',name:'update',component:updateStatus, meta:{title:'Update'}},
]

export default dataRoutes;