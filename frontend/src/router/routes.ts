import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'map', component: () => import('pages/MapPage.vue') },
      { path: 'turnstile', name: 'turnstile', component: () => import('pages/TurnstilePage.vue') },
      { path: 'new', name: 'new', component: () => import('pages/NewLocationPage.vue') },
      { path: 'location/1', component: () => import('pages/LocationPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
