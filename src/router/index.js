import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/test-x6',
    name: '测试x6',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/testX6/TestX6Node.vue')
  },  {
    path: '/test-zzjg',
    name: '测试组织架构',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/testX6/TestZzjg.vue')
  },
  {
    path: '/testCustomNode1',
    name: '自定义节点',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/testX6/CustomNode1.vue')
  },
  {
    path: '/testLayout',
    name: '测试布局',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/testX6/TestLayout.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
