import Vue from "vue";
import VueRouter from "vue-router";
import Loading from '../views/Loading.vue'
import Main from '../views/Main.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "loading",
    component: Loading
  },
  {
    path: "/:roomID",
    name: "app",
    component: Main
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
