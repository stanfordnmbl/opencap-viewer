import Vue from 'vue'
import Vuex from 'vuex'

import auth from '@/store/auth'
import data from '@/store/data'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    data
  }
})
