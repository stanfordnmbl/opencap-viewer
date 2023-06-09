import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store/store.js'

import Login from '@/components/pages/Login'
import Verify from '@/components/pages/Verify'
import Register from '@/components/pages/Register'
import Step1 from '@/components/pages/Step1'
import Step2 from '@/components/pages/Step2'
import Step3 from '@/components/pages/Step3'
import Step4 from '@/components/pages/Step4'
import Step5 from '@/components/pages/Step5'
import SelectSession from '@/components/pages/SelectSession'
import HelloWorld from '@/components/HelloWorld'
import Dashboard from '@/components/pages/Dashboard'
import ResetPassword from '@/components/pages/ResetPassword'
import NewPassword from '@/components/pages/NewPassword'
import RecycleBin from "@/components/pages/RecycleBin.vue";
import Subjects from "@/components/pages/Subjects.vue";

Vue.use(Router)

var router = new Router({
  mode: "history",
  base: "/",  
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/verify',
      name: 'Verify',
      component: Verify
    },
    {
      path: '/register-nmbl',
      name: 'Register',
      component: Register
    },
    {
      path: '/sessions',
      alias: '/',
      name: 'SelectSession',
      component: SelectSession
    },
    {
      path: '/:id/step1',
      name: 'Step1ForId',
      component: Step1
    },
    {
      path: '/step1',
      name: 'Step1',
      component: Step1
    },
    {
      path: '/:id/step2',
      name: 'Step2',
      component: Step2
    },
    {
      path: '/:id/step3',
      name: 'Step3',
      component: Step3
    },
    {
      path: '/:id/step4',
      name: 'Step4',
      component: Step4
    },
    {
      path: '/session/:id',
      name: 'Session',
      component: Step5
    },
    {
      path: '/dashboard/:id',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPassword
    },
    {
      path: '/new-password/:token',
      name: 'NewPassword',
      component: NewPassword
    },
    {
      path: '/recycle-bin',
      name: 'RecycleBin',
      component: RecycleBin
    },
    {
      path: '/subjects',
      name: 'Subjects',
      component: Subjects
    }
  ]
})

const routesWithOutAuth = [
  'Login',
  'Register',
  'Session',
  'ResetPassword',
  'NewPassword',
  'Dashboard',
  // 'Step4'
  
]

const routesRequireSession = [
  'Step1ForId',
  'Step2',
  'Step3',
  'Step4'
]

const acceptedRoutes = [
  'Login',
  'Verify',
  'Register',
  'SelectSession',
  'Step1',
  'Step1ForId',
  'Step2',
  'Step3',
  'Step4',
  'Session',
  'Dashboard',
  'ResetPassword',
  'NewPassword',
  'RecycleBin',
  'Subjects'
]

router.beforeEach((to, from, next) => {
  //If the user has log in.
  if (store.state.auth.loggedIn) {
    // If the user has verified their identity.
    if(store.state.auth.verified) {
      // If there are no sessions and the next route requires at least one, go to step1 to create a session.
      if (!store.state.data.session && routesRequireSession.includes(to.name)) {
        next({ name: 'Step1' })
      // If there are sessions, and the next route exist, go to it.
      } else if (acceptedRoutes.includes(to.name)) {
        next()
      // If the route does not exist, go to SelectSession by default.
      } else {
        next({ name: 'SelectSession' })
      }
    // If the user has not verified their identity and is trying to access to a page that is not Verify.
    } else if (!store.state.auth.verified && to.name !== "Verify") {
      next({ name: 'Login' })
    // If the user has not verified their identity and is trying to access to verify, allow.
    } else {
      next()
    }
  } else {
    if (routesWithOutAuth.includes(to.name)) {
      next()
    } else {
      next({ name: 'Login' })
    }
  }
})

export default router
