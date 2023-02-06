import axios from 'axios'
import router from '@/router'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    // existing sessions
    sessions: [],

    // init
    session: {
      trials: []
    },

    // step 1
    cameras: 2,
    // step 2
    rows: 4,
    cols: 5,
    squareSize: 35,
    // step 3
    trialId: '',

    // step 4
    identifier: '',
    weight: 70,
    height: 1.80,
    sex: 'woman',
    gender: 'woman',
    data_sharing: '',
    pose_model: 'openpose',
    framerate: 60,

    // step 5
    trialName: ''
  },
  mutations: {
    setSession (state, session) {
      state.session = session
    },
    setSessionId (state, id) {
      state.session = {
        id
      }
    },
    setExistingSessions (state, sessions) {
      state.sessions = sessions
    },
    setStep1 (state, { cameras }) {
      state.cameras = cameras
    },
    setStep2 (state, { rows, cols, squareSize }) {
      state.rows = rows
      state.cols = cols
      state.squareSize = squareSize
    },
    setStep3 (state, trialId) {
      state.trialId = trialId
    },
    setStep4 (state, { identifier, weight, height, sex, gender, data_sharing, pose_model }) {
      state.identifier = identifier
      state.weight = weight
      state.height = height
      state.sex = sex
      state.gender = gender
      state.data_sharing = data_sharing
      state.pose_model = pose_model
    },
    setStep5 (state, { trialName }) {
      state.trialName = trialName
    },
    clearAll (state) {
      // session
      state.session = null
      // step 1
      state.cameras = 2
      // step 2
      state.rows = 4
      state.cols = 5
      state.squareSize = 35
      // step 4
      state.identifier = ''
      state.weight = 70
      state.height = 1.80
      state.sex = 'woman'
      state.gender = 'woman'
      state.data_sharing = ''
      state.pose_model = 'openpose'
      // step 5
      state.trialName = ''       
    },
    addTrial (state, trial) {
      state.session.trials.push(trial)
    },
    updateTrial (state, trial) {
      const index = state.session.trials.findIndex(t => t.id === trial.id)

      if (index >= 0) {
        Vue.set(state.session.trials, index, trial)
      }
    },
    updateSession (state, session) {
      const index = state.sessions.findIndex(t => t.id === session.id);
      // console.log(state.sessions);
      // console.log(index);
      if (index >= 0) {
        Vue.set(state.sessions, index, session);
      }
    }
  },
  actions: {
    async initSession ({ state, commit }) {
      const res = await axios.get('/sessions/new/')      
      commit('setSession', res.data[0])
    },
    async initSessionSameSetup ({ state, commit }) {
      const res = await axios.get(`/sessions/${state.session.id}/new_subject/`)      
      commit('setSession', res.data[0])
    },
    async loadSession ({ state, commit }, id) {
      const sessionId = id || state.session.id

      const res = await axios.get(`/sessions/${sessionId}/`)
      commit('setSession', res.data)
    },
    // async trashExistingTrial ({ state, commit }, trial) {
    //   const sessionId = id || state.session.id
    //
    //   const res = await axios.post(`/sessions/${sessionId}/trash/`)
    //   commit('updateSession', res.data)
    // },

    async trashExistingSession ({ state, commit }, id) {
      const sessionId = id || state.session.id

      const res = await axios.post(`/sessions/${sessionId}/trash/`)
      commit('updateSession', res.data)
    },
    async restoreTrashedSession ({ state, commit }, id) {
      const sessionId = id || state.session.id

      const res = await axios.post(`/sessions/${sessionId}/restore/`)
      commit('updateSession', res.data)
    },
    async loadExistingSessions ({ state, commit }, {reroute, quantity = -1}) {
      console.log(quantity)
      const res = await axios.post('/sessions/valid/', {
        quantity: quantity
      })

      commit('setExistingSessions', res.data)

      if (reroute) {
        if (state.sessions.length > 0) {
          router.push({ name: 'SelectSession' })
        } else {
          router.push({ name: 'Step1' })
        }  
      }
    }
  }
}
