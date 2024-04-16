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

    // Analysis dashboards
    analysis_dashboards: [],
    analysis_dashboard: {
      data: {
        sessions: [],
        subjects: [],
        trials: [],
        results: [],
      }
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
    pose_model: 'hrnet',
    framerate: 60,
    openSimModel: 'LaiUhlrich2022',
    augmenter_model: 'v0.3',
    filter_frequency: 'default',

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
    tags: {},
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
    setAnalysisDahboardList (state, analysis_dashboards) {
      state.analysis_dashboards = analysis_dashboards;
    },
    setAnalysisDahboard (state, analysis_dashboard) {
      state.analysis_dashboard = analysis_dashboard;
    },
    setSession (state, session) {
      session.created_at = formatDate(session.created_at); 
      state.session = session;
      const sessionIds = state.sessions.map(session => session.id);
      console.log('setSession,  sessionIds= ', sessionIds)
      console.log('setSession,  session= ', session)
      if(!sessionIds.includes(session.id)){
        state.sessions.unshift(session);
        console.log('setSession,  state.sessions= ', state.sessions)
      } else {
        const index = state.sessions.findIndex(s => s.id === session.id);
        state.sessions.splice(index, 1, session);
        console.log('setSession,  HI')
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
      state.analysisFunctions = functions.map((func) => (
          {...func, trials: [], results: [],
            states: []}));
      console.log(state.analysisFunctions)
    },
    setAnalysisFunctionPending(state, data) {
      for(let i = 0; i < state.analysisFunctions.length; i++) {
        let f_id = state.analysisFunctions[i].id.toString();
        if (f_id in data) {
          Vue.set(state.analysisFunctions[i], "trials", data[f_id]);
        } else {
          Vue.set(state.analysisFunctions[i], "trials", []);
        }

      }
    },
    setAnalysisFunctionsStates(state, data) {
      for(let i = 0; i < state.analysisFunctions.length; i++) {
        let f_id = state.analysisFunctions[i].id.toString();
        if (f_id in data) {
          Vue.set(state.analysisFunctions[i], "states", data[f_id]);
        } else {
          Vue.set(state.analysisFunctions[i], "states", []);
        }

      }
    },
    setAnalysisFunctionState(state, {functionId, trialId, data}){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        console.log(["setAnalysisFunctionState", functionId, trialId, data])
        Vue.set(state.analysisFunctions[index].states, trialId, data);
      }
    },
    setAnalysisFunctionTrial(state, {functionId, trialId}){
      console.log(["setAnalysisFunctionTrial", functionId, trialId])
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        if (!analysisFunction.trials.includes(trialId)) {
          analysisFunction.trials.push(trialId);
        }
        // Vue.set(state.analysisFunctions, index, analysisFunction);
      }
      console.log(state.analysisFunctions);
    },
    removeAnalysisFunctionTrial(state, {functionId, trialId}){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        Vue.set(state.analysisFunctions[index], "trials", state.analysisFunctions[index].trials.filter(id => id !== trialId));
        if(trialId in state.analysisFunctions[index].states) {
          if(state.analysisFunctions[index].states[trialId].status === "pending") {
            Vue.delete(state.analysisFunctions[index].states, trialId);
          }
        }
      }
      console.log(state.analysisFunctions);
    },
    setAnalysisFunctionResult(state, functionId, result){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        analysisFunction.results.push(result);
        // Vue.set(state.analysisFunctions, index, analysisFunction);
      }
    },
    resetAnalysisFunctionResult(state, functionId, trialId){
      const index = state.analysisFunctions.findIndex((func) => (func.id === functionId));
      if (index >= 0) {
        const analysisFunction = state.analysisFunctions[index];
        analysisFunction.results = analysisFunction.results.filter(result => result.trial.id !== trialId);
        // Vue.set(state.analysisFunctions, index, analysisFunction);
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
    setStep4 (state, { subject, data_sharing, pose_model, openSimModel, augmenter_model, filter_frequency }) {
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
      state.filter_frequency = filter_frequency
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
      state.filter_frequency = 'default'
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
    },
    updateSubjectTags (state, tags) {
      state.subjectTags = tags;
    }
  },
  actions: {
    async loadAnalysisDashboardList({ state, commit }) {
      let res = await axios.get(`/analysis-dashboards/`)
      let result = res.data.map((dashboard) => ({id: dashboard.id, title: dashboard.title}))
      commit('setAnalysisDahboardList', result)
    },
    async loadAnalysisDashboard({ state, commit }, id) {
      const dashboardId = id || state.session.id

      let res = await axios.get(`/analysis-dashboards/${dashboardId}/`)
      let result = res.data
      res = await axios.get(`/analysis-dashboards/${dashboardId}/data/`)
      result['data'] = res.data

      commit('setAnalysisDahboard', result)

    },
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

      var res;
      try {
        res = await axios.get(`/sessions/${sessionId}/`)
        commit('setSession', res.data)
        console.log(res.data)
      } catch (e) {
        console.log(e.response.status)
        if (e.response.status === 401) {
          router.push({ name: 'Login' })
        }
      }


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
        let institutionalUse = localStorage.getItem('institutional_use')
        if (institutionalUse === '' || institutionalUse === 'patient_care' || institutionalUse === 'sports_performance_assessment' || institutionalUse === 'use_in_company') {
          router.push({name: 'License'})
        } else {
          if (state.sessions.length > 0) {
            console.log('rerouting to select session')
            router.push({ name: 'SelectSession' })
          } else {
            router.push({ name: 'Step1' })
          }
        }
      }
    },
    async loadSubjects({ state, commit }) {
      try {
        const res = await axios.get('/subjects/');
        const tagPromises = [];

        for (let i = 0; i < res.data.length; i++) {
          const tagPromise = axios.get(`/subject-tags/${res.data[i].id}/get_tags_subject/`)
            .then((tags) => {
              res.data[i].subject_tags = tags.data.map(tag => tag.tag);
              console.log(res.data[i].subject_tags);
            });

          tagPromises.push(tagPromise);
        }

        await Promise.all(tagPromises); // Wait for all tag promises to resolve
        commit('setSubjects', res.data);
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    },
    async loadAnalysisFunctions({ state, commit }){
      const response = await axios.get('/analysis-functions/');
      commit('setAnalysisFunctions', response.data);
    },
    async loadAnalysisFunctionsStates({ state, commit }){
      const response = await axios.get('/analysis-results/states/');
      commit('setAnalysisFunctionsStates', response.data);
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
    },
    async loadSubjectTags({ state, commit }) {
      console.log("LOAD2")
      const response = await fetch('/tags/subjectTags.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      const resultObject = {};

      data["subject_tags"].forEach(tag => {
          resultObject[tag.value] = tag.label;
      });

      commit("updateSubjectTags", resultObject)
      this.subjectTags = resultObject
      console.log(this.subjectTags)
    }
  }

}
