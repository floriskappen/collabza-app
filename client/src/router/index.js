import Vue from "vue";
import VueRouter from "vue-router";
import Loading from '../views/Loading.vue'
import Main from '../views/Main.vue'
import Navigator from '../components/TopMenu.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "main",
    component: Navigator,
    children: [
      {
        path: "/:roomID",
        name: "app",
        component: Main
      },
      {
        path: '/',
        name: 'loading',
        component: Loading
      }
    ]
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
