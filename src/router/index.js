import Vue from 'vue';
import VueRouter from 'vue-router';
import Admin from '../views/Admin.vue';
import Advertisement from '../views/Advertisement.vue';

Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    component: Advertisement,
    name: 'Advertisement',
  },
  {
    path: '/admin',
    component: Admin,
    name: 'Admin',
  },
  {
    path: '*',
    component: Advertisement,
  },
];

const router = new VueRouter({
  mode: 'hash',
  // mode: 'history',
  base: './',
  routes,
});

export default router;
