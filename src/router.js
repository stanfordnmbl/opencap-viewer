import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store/store.js'

import Login from '@/components/pages/Login'
import Verify from '@/components/pages/Verify'
import Register from '@/components/pages/Register'
import ConnectDevices from '@/components/pages/ConnectDevices'
import Calibration from '@/components/pages/Calibration'
import Step3 from '@/components/pages/Step3'
import Neutral from '@/components/pages/Neutral'
import Session from '@/components/pages/Session'
import SelectSession from '@/components/pages/SelectSession'
import HelloWorld from '@/components/HelloWorld'
import Dashboard from '@/components/pages/Dashboard'
import AnalysisDashboard from '@/components/pages/AnalysisDashboard'
import ResetPassword from '@/components/pages/ResetPassword'
import NewPassword from '@/components/pages/NewPassword'
import RecycleBin from "@/components/pages/RecycleBin.vue";
import Subjects from "@/components/pages/Subjects.vue";
import ProfilePage from '@/components/pages/ProfilePage'

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
      path: '/:id/connect-devices',
      name: 'ConnectDevicesForId',
      component: ConnectDevices
    },
    {
      path: '/connect-devices',
      name: 'ConnectDevices',
      component: ConnectDevices
    },
    {
      path: '/:id/calibration',
      name: 'Calibration',
      component: Calibration
    },
    {
      path: '/:id/step3',
      name: 'Step3',
      component: Step3
    },
    {
      path: '/:id/neutral',
      name: 'Neutral',
      component: Neutral
    },
    {
      path: '/session/:id',
      name: 'Session',
      component: Session
    },
    {
      path: '/dashboard/:id',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/analysis-dashboard/:id/',
      name: 'AnalysisDashboard',
      component: AnalysisDashboard
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
    },
    {
      path: '/profile/:username/',
      name: 'ProfilePage',
      component: ProfilePage
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
  'AnalysisDashboard',
  'ProfilePage'
  
]

const routesRequireSession = [
  'ConnectDevicesForId',
  'Calibration',
  'Step3',
  'Neutral'
]

const acceptedRoutes = [
  'Login',
  'Verify',
  'Register',
  'SelectSession',
  'ConnectDevices',
  'ConnectDevicesForId',
  'Calibration',
  'Step3',
  'Neutral',
  'Session',
  'Dashboard',
  'AnalysisDashboard',
  'ResetPassword',
  'NewPassword',
  'RecycleBin',
  'Subjects',
  'ProfilePage'
]

router.beforeEach((to, from, next) => {
  //If the user has log in.
  if (store.state.auth.loggedIn) {
    // If the user has verified their identity.
    if(store.state.auth.verified) {
      // If there are no sessions and the next route requires at least one, go to ConnectDevices to create a session.
      if (!store.state.data.session && routesRequireSession.includes(to.name)) {
        next({ name: 'ConnectDevices' })
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
