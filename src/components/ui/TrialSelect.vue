<template>
  <div>
    <v-expansion-panels v-model="panel">
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div class="d-flex justify-content-between">
          <div>
            {{ subject_selected?.name }} {{ session_selected ? "|" : ""  }}
            {{ session_selected?.meta['sessionName'] || session_selected?.id.split('-')[0] }} {{ trial_selected ? "|" : ""  }}
            {{ trial_selected?.name }}
          </div>
          <div v-if="selection_index > 0">
            <v-btn style="width: 30px"                   
                   title="Remove" @click.native.stop="emitTrialRemove">
                   ✖</v-btn>
          </div>
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content eager>
         <div class="mt-2"></div>
          <v-select v-model="subject_selected"
                    item-value="id"
                    item-text="name"
                    :items="loaded_subjects"
                    @change="loadSessions"
                    label="Select subject" outlined dense return-object></v-select>
          <v-select v-model="session_selected"
                    item-value="id"
                    :item-text="item => item.meta['sessionName'] ? item.meta['sessionName']+' ('+item.id+')' : item.id"
                    :items="loaded_sessions"
                    :disabled="!subject_selected"
                    @change="loadTrials"
                    label="Select session" outlined dense return-object></v-select>
          <v-select v-model="trial_selected"
                    item-value="id"
                    item-text="name"
                    :items="loaded_trials"
                    :disabled="!session_selected"
                    label="Select trial" outlined dense return-object></v-select>
<!--          <v-text-field-->
<!--            v-model="offset"-->
<!--            :rules="[rules.float]"-->
<!--            label="Offset"-->
<!--            append-outer-icon="mdi-plus"-->
<!--            prepend-icon="mdi-minus"-->
<!--            @keyup.enter="enter"-->
<!--            @click:append-outer="increment"-->
<!--            @click:prepend="decrement">-->
<!--          </v-text-field>-->
      </v-expansion-panel-content>
    </v-expansion-panel>
    </v-expansion-panels>
    <div class="mb-2"></div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import axios from 'axios'
import { apiError, apiInfo, apiWarning, clearToastMessages } from '@/util/ErrorMessage.js'
import Vue from 'vue'
import store from '@/store/store.js'

export default {
  name: "TrialSelect",
  props: ["trialSelection", "selectionIndex", "publicSessionId"],
  data() {
    return {
      selection_index: this.selectionIndex,
      uuid: this.trialSelection.uuid,
      subject_selected: this.trialSelection.subject_selected,
      session_selected: this.trialSelection.session_selected,
      trial_selected: this.trialSelection.trial_selected,
      public_session_id: this.publicSessionId,

      subject_query: "",
      subject_loading: false,
      subject_start: 0,
      loaded_subjects: [],

      session_query: "",
      session_loading: false,
      session_start: 0,
      loaded_sessions: [],

      trial_query: "",
      trial_loading: false,
      trial_start: 0,
      loaded_trials: [],

      offset: 0,
      panel: 0,
      rules: {
        float: v => !isNaN(parseFloat(v)) || 'Must be a number',
      },
    }
  },
  computed: {
    ...mapState({
      subjects: state => state.data.subjects,
      loggedIn: state => state.auth.verified
    }),
  },
  watch: {
    trial_selected: function (val) {
      this.emitTrialSelected()
    },
  },
  mounted() {
    if (this.loggedIn) {
      this.loadSubjects()
      this.loadSessions()
      this.loadTrials()
    } else {
      this.loaded_subjects.push(this.trialSelection.subject_selected)
      this.loaded_sessions.push(this.trialSelection.session_selected)
      this.loaded_trials = this.trialSelection.session_selected?.trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')
    }
  },
  methods: {

    loadSubjects() {
      console.log('loadSubjects')
      this.subject_loading = true
      let data = {
        quantity: -1
      }
      let res = axios.get('/subjects/', {params: data}).then((res) => {
        this.loaded_subjects = res.data.subjects
        if (this.subject_selected && !this.loaded_subjects.find(subject => subject.id === this.subject_selected.id)) {
          this.loaded_subjects.push(this.subject_selected)
        }
        this.subject_loading = false
      }).catch((error) => {
        this.subject_loading = false
        apiError(error)
      })
    },

    loadSessions() {
      console.log('loadSessions', this.subject_selected)
      if (this.subject_selected) {
        this.session_loading = true
        let data = {subject_id: this.subject_selected.id, skip_no_trials: 'true'}
        if (this.public_session_id) {
          data['public_session_id'] = this.public_session_id
        }
        this.loaded_trials = []
        let res = axios.post('/sessions/valid/', data).then((res) => {
            this.loaded_sessions = res.data
            this.session_loading = false
        }).catch((error) => {
            this.session_loading = false
            apiError(error)
        })
      }
    },

    loadTrials() {
      console.log('loadTrials', this.session_selected)
      if (this.session_selected) {
        this.trial_loading = true
        let res = axios.get('/sessions/'+this.session_selected.id+'/').then((res) => {
            this.loaded_trials = res.data.trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')
            this.trial_loading = false
        }).catch((error) => {
            this.trial_loading = false
            apiError(error)
        })
      }
    },
    increment () {
      this.offset = Number((parseFloat(this.offset) + 0.01).toFixed(4))
      this.emitTrialSelected()
    },
    decrement () {
      this.offset = Number((parseFloat(this.offset) - 0.01).toFixed(4))
      this.emitTrialSelected()
    },
    enter() {
      this.emitTrialSelected()
    },
    emitTrialSelected() {
      console.log('emitTrialSelected', this.uuid)
      this.$emit('trial-selected', {
          uuid: this.uuid,
          subject_selected: this.subject_selected,
          session_selected: this.session_selected,
          trial_selected: this.trial_selected,
          offset: parseFloat(this.offset),
      })
    },
    emitTrialRemove() {
      this.$emit('trial-remove', this.uuid)
    },
  }
}
</script>