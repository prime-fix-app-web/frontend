
const visitForm =() => import('./views/visit-form.vue');
const diagnosticView =()=>import('./views/diagnostic-view.vue');
const modifyDiagnostic =()=> import('./views/modify-diagnostic.vue');
const checkDiagnostic =()=>import('./views/check-diagnostic.vue');

const dataRoutes = [
    {path:'new-visit',name:'new',component:visitForm, meta:{title:'New Visit'}},
    {path:'diagnosis-view', name:'view', component:diagnosticView, meta:{title:'Diagnostic View'}},
    {path:'check-diagnosis/:id', name: 'check', component:checkDiagnostic, meta:{title:'Check diagnostic'}},
    {path:'modify-diagnosis/edit/:id', name:'edit', component:modifyDiagnostic, meta:{title:'Edit diagnostic'}},
]

export default dataRoutes;