
const visitForm =() => import('./views/visit-form.vue');
const visitList =() => import('./views/visit-list.vue');
const repairList =()=>import('./views/repair-list.vue');
const updateStatus =() => import('./views/update-status.vue');
const visitListWorkshop =() => import('./views/visit-list-workshop.vue');

const dataRoutes = [
    {path:'new',name:'new',component:visitForm, meta:{title:'New'}},
    {path:'list',name:'list',component:visitList, meta:{title:'List'}},
    {path:'list-workshop',name:'list-workshop',component:visitListWorkshop, meta:{title:'List_workshop'}},
    {path:'auto_list',name:'auto_list',component:repairList, meta:{title:'Auto_list'}},
    {path:'edit/:id',name:'edit',component:visitForm, meta:{title:'Edit'}, data:{renderMode:'client'}},
    {path:'update/:id',name:'update',component:updateStatus, meta:{title:'Update'}},
    {path: '/visit-form/:repairId?', name: 'visit-form', component: visitForm}
]

export default dataRoutes;