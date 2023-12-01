import router from '@/router'
import axios from 'axios'
import Vue from "vue";

export default {
  namespaced: true,
  state: {
    loggedIn: false,
    verified: false,
    username: '',
    user_id: '',
    sessionTime: 1000 * 60 * 60 * 12,
    remember_device_flag: false,
    skip_forcing_otp: false
  },
  mutations: {
    setLoggedIn (state, { loggedIn, username, user_id}) {
      state.loggedIn = loggedIn
      state.username = username
      state.user_id = user_id
    },
    setVerified (state, {verified}) {
      state.verified = verified
    },
    setRememberDeviceFlag (state, {flag}) {
      state.remember_device_flag = flag
    },
    setSkipForcingOTP (state, {value}) {
      state.skip_forcing_otp = value
    }
  },
  actions: {
    async checkToken ({ commit, dispatch }) {
      const token = localStorage.getItem('auth_token')
      const date = new Date(localStorage.getItem('valid_till'))
      const verified = localStorage.getItem('auth_verified')

      commit('setVerified', {
        verified: verified
      })

      if (verified && token && new Date() < date) {        
        axios.defaults.headers.common['Authorization'] = 'Token ' + token
          commit('setLoggedIn', {
              loggedIn: true,
              username: localStorage.getItem('auth_user'),
              user_id: localStorage.getItem('auth_user_id'),
          })
        await dispatch('data/loadExistingSessions', {reroute: false, quantity: 20}, { root: true })
        await dispatch('data/loadSubjects', null, { root: true })
      }
    },
    async login ({ state, commit }, { username, password }) {
      let res = await axios.post('/login/', {
        username,
        password
      })

      const date = new Date()
      date.setTime(date.getTime() + state.sessionTime)

      console.log(res.data)  

      localStorage.setItem('valid_till', date.toJSON())
      localStorage.setItem('auth_token', res.data.token)
      localStorage.setItem('auth_user', username)
      localStorage.setItem('auth_user_id', res.data.user_id)
      commit('setSkipForcingOTP', { value: res.data.otp_challenge_sent })

      axios.defaults.headers.common['Authorization'] = `Token ${res.data.token}`

      commit('setLoggedIn', {
        loggedIn: true,
        username: username,
        user_id: res.data.user_id,
      })
    },
    async set_verify ({ state, commit }) {
      commit('setVerified', { verified: true })
      localStorage.setItem('auth_verified', true)
    },
    async set_skip_forcing_otp ({ state, commit }, value) {
        commit('setSkipForcingOTP', { value: value })
    },
    async verify ({ state, commit }, { otp_token, remember_device }) {
      console.log('verify:state.remember_device_flag', state.remember_device_flag, remember_device)
      let data = {
        otp_token,
      }
      if (state.remember_device_flag && remember_device) {
        data.remember_device = true
      }
      let res = await axios.post('/verify/', data)

      commit('setVerified', {
        verified: true
      })

      const token = localStorage.getItem('auth_token')
      const username = localStorage.getItem('auth_user')
      localStorage.setItem('auth_verified', true)
      if (state.remember_device_flag && remember_device) {
        localStorage.setItem('remember_device_timestamp', Date.now())
      }
    },
    async setRememberDeviceFlag ({ state, commit }, flag) {
        commit('setRememberDeviceFlag', {flag: flag})
    },
    logout ({ commit }) {
      commit('setLoggedIn', {
        loggedIn: false,
        username: '',
        user_id: null,
      })

      commit('setVerified', {
        verified: false
      })

      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('auth_verified')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_user_id')
      localStorage.removeItem('valid_till')

      router.push({ name: 'Login' })
    },
    logoutNoNavigate ({ commit }) {
      commit('setLoggedIn', {
        loggedIn: false,
        username: '',
        user_id: null,
      })

      commit('setVerified', {
        verified: false
      })

      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('auth_verified')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_user_id')
      localStorage.removeItem('valid_till')
    },
    async register ({ commit }, data) {
      await axios.post('/register/', data)
    },
    async reset({commit }, {email}) {
      var host = window.location.protocol + "//" + window.location.host;
      return await axios.post('/reset-password/', {email, host})
    },
    async new_password({ commit }, data) {
      return await axios.post('/new-password/', data)
    }
  }
}
