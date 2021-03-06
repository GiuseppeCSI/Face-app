
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    props: true,
    children: [
      { path: '', component: () => import('pages/Index.vue'), props: true }
    ]
  },
  {
    path: '/list',
    component: () => import('layouts/MainLayout.vue'),
    props: true,
    children: [
      { path: '', component: () => import('pages/ConsentList.vue'), props: true }
    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
