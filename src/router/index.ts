import {createRouter, createWebHistory} from 'vue-router'
import {useShareStore} from "@/store/modules/share.ts";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "Index",
      path: "/",
      meta: {title: "首页"},
      component: () => import("@/views/index.vue"),
    },
    {
      name: "Home",
      path: "/home",
      meta: {title: "首页"},
      component: () => import("@/views/index.vue"),
    },
    {
      name: "FaceDesign",
      path: "/face-design",
      meta: {title: "捏脸专区"},
      component: () => import("@/views/face-design.vue"),
    },
    {
      name: "FaceUpload",
      path: "/face-upload",
      meta: {title: "捏脸上传"},
      component: () => import("@/views/face-upload.vue"),
    },

  ],
})

router.beforeEach((to, _from, next) => {
  console.log("router =========== request url:", to.path)
  if (to.path === '/wechat/callback') {
    alert("path====" + to.path)
    const query = to.query
    const shareStore = useShareStore()
    shareStore.code = String(query.code ?? '')
    shareStore.state = String(query.state ?? '')
    console.log("router ===========  code:", shareStore.code)
    next('/')
    return
  }
  next()
})

export default router
