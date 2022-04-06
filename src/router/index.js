import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Admin from '../views/Admin.vue';
import Advertisement from '../views/Advertisement.vue';

Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    component: Home,
    name: 'home',
  },
  {
    path: '/admin',
    component: Admin,
    name: 'Admin',
  },
  {
    path: '/advertisement',
    component: Advertisement,
    name: 'Advertisement',
  },
  {
    path: '*',
    component: Home,
  },
];

const router = new VueRouter({
  mode: 'hash',
  // mode: 'history',
  base: './',
  routes,
});

export default router;
