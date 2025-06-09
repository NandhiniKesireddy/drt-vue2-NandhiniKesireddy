import Vue from 'vue';
import VueRouter from 'vue-router';
import MainPage from '../components/MainPage.vue';
import SelectedList from '../components/SelectedList.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage
  },
  {
    path: '/selected-list',
    name: 'SelectedList',
    component: SelectedList
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
