import router from '@/router'
import axios from 'axios'

export default {
  namespaced: true,
  state: {
    loggedIn: false,
    verified: false,
    username: '',
    user_id: '',
    sessionTime: 1000 * 60 * 60 * 12
  },
  mutations: {
    setLoggedIn (state, { loggedIn, username, user_id}) {
      state.loggedIn = loggedIn
      state.username = username
      state.user_id = user_id
    },
    setVerified (state, {verified}) {
      state.verified = verified
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
    async login ({ state, commit }, { username, password, remember_device }) {
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

      axios.defaults.headers.common['Authorization'] = `Token ${res.data.token}`

      commit('setLoggedIn', {
        loggedIn: true,
        username: username,
        user_id: res.data.user_id,
      })
    },
    async verify_without_otp ({ state, commit }) {
      let res = await axios.post('/verify/', {
        'no_otp': true
      })
      commit('setVerified', { verified: true })
      localStorage.setItem('auth_verified', true)
    },
    async verify ({ state, commit }, { otp_token }) {
      let res = await axios.post('/verify/', {
        otp_token
      })

      commit('setVerified', {
        verified: true
      })

      const token = localStorage.getItem('auth_token')
      const username = localStorage.getItem('auth_user')
      localStorage.setItem('auth_verified', true)
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
