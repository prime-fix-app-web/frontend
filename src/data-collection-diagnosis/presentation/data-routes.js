const visitForm = () => import('./views/visit-form.vue');
const diagnosticView = () => import('./views/diagnostic-view.vue');
const modifyDiagnostic = () => import('./views/modify-diagnostic.vue');
const checkDiagnostic = () => import('./views/check-diagnostic.vue');

const dataRoutes = [
    {path: 'new-visit', name: 'new-visit', component: visitForm, meta: {title: 'New Visit'}},
    {path: 'diagnosis-view', name: 'diagnosis-view', component: diagnosticView, meta: {title: 'Diagnostic View'}},
    {path: 'check-diagnosis/:id', name: 'check-diagnosis', component: checkDiagnostic, meta: {title: 'Check Diagnostic'}},
    {path: 'modify-diagnosis/edit/:id', name: 'modify-diagnosis', component: modifyDiagnostic, meta: {title: 'Edit Diagnostic'}},
];

export default dataRoutes;