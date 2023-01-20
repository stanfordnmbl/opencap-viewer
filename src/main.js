import axios from 'axios'
import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from '@/router'
import store from '@/store/store.js'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/scss/main.scss'

import registerFilters from './util/Filters';
registerFilters(Vue)

// vee-validate 3
import { ValidationProvider, ValidationObserver, extend } from "vee-validate";
import { required, confirmed, min, email } from "vee-validate/dist/rules";

import VueSocialSharing from 'vue-social-sharing'

Vue.use(VueSocialSharing);

// Add rules
extend('required', required)
extend('confirmed', confirmed)
extend('min', min)
extend('email', email)
// Custom rule
extend('no_spaces', {
  validate (value, args) {
    return value.indexOf(' ') < 0
  },
  message: 'Spaces not allowed'
})

Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);

import Toasted from 'vue-toasted'
Vue.use(Toasted, { 
  position: 'bottom-center', 
  duration: 10000,
  className: 'vue-toasted',
  // Show all toasts with Close button
  action : {
    text : 'Close',
    onClick : (e, toastObject) => {
        toastObject.goAway(0)
    }
  }
})

Vue.config.productionTip = false

axios.defaults.baseURL = process.env.VUE_APP_API_SERVER //"https://api.opencap.ai/"
// axios.defaults.baseURL = "http://34.219.192.107/"

store.dispatch('auth/checkToken').then(() => {
  new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
  }).$mount('#app')  
})

