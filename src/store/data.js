import axios from 'axios'
import router from '@/router'
import Vue from 'vue'
import { formatDate } from '@/util/DateFormat.js'

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
    openSimModel: 'LaiUhlrich2022',
    augmenter_model: 'v0.3',

    // step 5
    trialName: '',
    analysisFunctions: [],

    subjects: [],
    sexes: {
      // "": "",
      "woman": "Woman",
      "man": "Man",
      "intersect": "Intersex",
      "not-listed": "Not Listed",
      "prefer-not-respond": "Prefer not to respond"
    },
    genders: {
      // "": "",
      "woman": "Woman",
      "man": "Man",
      "transgender": "Transgender",
      "non-binary": "Non-Binary/Non-Conforming",
      "prefer-not-respond": "Prefer not to respond",
    },
    isSyncDownloadAllowed: JSON.parse(localStorage.getItem("isSyncDownloadAllowed")),
    analysis: {}
  },
  mutations: {
    setAnalysis(state, trial, analysisData){
      state.analysis[trial.id] = {
        isInvokeInProgress: analysisData.isInvokeInProgress,
        isInvokeDone: analysisData.isInvokeDone,
        functionId: analysisData.functionId,
        result: analysisData.result
      }
    },
    setSession (state, session) {
      session.created_at = formatDate(session.created_at); 
      state.session = session;
      const sessionIds = state.sessions.map(session => session.id);
      if(!sessionIds.includes(session.id)){
        state.sessions.unshift(session);
      }
    },
    setSessionId (state, id) {

      state.session = {
        id
      }
    },
    setExistingSessions (state, sessions) {

      // Dates to human readable format.
      let i = 0
      for (i = 0; i < sessions.length; i++) {
        sessions[i].created_at = formatDate(sessions[i].created_at);
      }

      state.sessions = sessions

    },
    updateExistingSessions (state, sessions) {
      let old_session_ids = state.sessions.map(s => s.id);

      for(let i = 0; i < sessions.length; i++) {
        sessions[i].created_at = formatDate(sessions[i].created_at)
        if(old_session_ids.includes(sessions[i].id)) {
          let index = old_session_ids.indexOf(sessions[i].id);
          state.sessions.splice(index, 1, sessions[i]);
        } else {
          state.sessions.push(sessions[i]);
        }
      }
    },
    setSubjects (state, subjects) {
      for (let i = 0; i < subjects.length; i++) {
        subjects[i].created_at = formatDate(subjects[i].created_at);
      }
      state.subjects = subjects
      console.log(state.subjects)
    },
    setAnalysisFunctions(state, functions){
      state.analysisFunctions = functions.map((func) => ({...func, trials: [], results: []}));
      console.log(state.analysisFunctions)
    },
    setAnalysisFunctionPending(state, data) {
      for(let i = 0; i < state.analysisFunctions.length; i++) {
        let f_id = state.analysisFunctions[i].id.toString();
        if (f_id in data) {
          state.analysisFunctions[i].trials = data[f_id];
        } else {
          state.analysisFunctions[i].trials = [];
        }

      }
    },
    setAnalysisFunctionTrial(state, functionId, trialId){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        analysisFunction.trials.push(trialId);
        Vue.set(state.analysisFunctions, index, analysisFunction);
      }
    },
    removeAnalysisFunctionTrial(state, functionId, trialId){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        analysisFunction.trials = analysisFunction.trials.filter(id => id !== trialId);
        Vue.set(state.analysisFunctions, index, analysisFunction);
      }
    },
    setAnalysisFunctionResult(state, functionId, result){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        analysisFunction.results.push(result);
        Vue.set(state.analysisFunctions, index, analysisFunction);
      }
    },
    resetAnalysisFunctionResult(state, functionId, trialId){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        analysisFunction.results = analysisFunction.results.filter(result => result.trial.id !== trialId);
        Vue.set(state.analysisFunctions, index, analysisFunction);
      }
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
    setStep4 (state, { subject, data_sharing, pose_model, openSimModel, augmenter_model }) {
      // state.identifier = identifier
      // state.weight = weight
      // state.height = height
      // state.sex = sex
      // state.gender = gender
      state.subject = subject
      state.data_sharing = data_sharing
      state.pose_model = pose_model
      state.openSimModel = openSimModel
      state.augmenter_model = augmenter_model
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
      state.openSimModel = 'LaiUhlrich2022'
      state.augmenter_model = 'v0.3'
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

      if (index >= 0) {
        Vue.set(state.sessions, index, session);
      }
    },
    updateSubject (state, subject) {
      const index = state.subjects.findIndex(t => t.id === subject.id);

      if (index >= 0) {
        Vue.set(state.subjects, index, subject);
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

    async permanentRemoveExistingSession ({ state, commit }, id) {
      const sessionId = id || state.session.id
      const index = state.sessions.findIndex(t => t.id === sessionId);
      const res = await axios.post(`/sessions/${sessionId}/permanent_remove/`)
      state.sessions.splice(index, 1);
    },
    async trashExistingSession ({ state, commit }, id) {
      const sessionId = id || state.session.id

      const res = await axios.post(`/sessions/${sessionId}/trash/`)

      res.data.created_at = formatDate(res.data.created_at);

      commit('updateSession', res.data)
    },
    async restoreTrashedSession ({ state, commit }, id) {
      const sessionId = id || state.session.id

      const res = await axios.post(`/sessions/${sessionId}/restore/`)

      // Dates to human readable format.
      res.data.created_at = formatDate(res.data.created_at);

      commit('updateSession', res.data)
    },
    async loadExistingSessions ({ state, commit }, {reroute, quantity = -1, subject_id = null}) {
      console.log(quantity)
      let update_sessions = false;
      let data = {
        quantity: quantity
      }
      if (subject_id) {
        data.subject_id = subject_id
        update_sessions = true;
      }

      const res = await axios.post('/sessions/valid/', data)
      if (update_sessions) {
        commit('updateExistingSessions', res.data)
      } else {
        commit('setExistingSessions', res.data)
      }

      if (reroute) {
        if (state.sessions.length > 0) {
          console.log('rerouting to select session')
          router.push({ name: 'SelectSession' })
        } else {
          router.push({ name: 'Step1' })
        }  
      }
    },
    async loadSubjects ({ state, commit }) {
      const res = await axios.get('/subjects/')
      commit('setSubjects', res.data)
    },
    async loadAnalysisFunctions({ state, commit }){
      const response = await axios.get('/analysis-functions/');
      commit('setAnalysisFunctions', response.data);
    },
    async loadAnalysisFunctionsPending({ state, commit }){
      const response = await axios.get('/analysis-results/pending/');
      commit('setAnalysisFunctionPending', response.data);
    },
    async trashExistingSubject ({ state, commit }, id) {
      const subjectId = id

      const res = await axios.post(`/subjects/${subjectId}/trash/`)

      res.data.created_at = formatDate(res.data.created_at);

      commit('updateSubject', res.data)
    },
    async restoreTrashedSubject ({ state, commit }, id) {
      const subjectId = id

      const res = await axios.post(`/subjects/${subjectId}/restore/`)

      res.data.created_at = formatDate(res.data.created_at);

      commit('updateSubject', res.data)
    }

  }
}
