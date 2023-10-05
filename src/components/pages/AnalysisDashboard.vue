<template>
  <div id="body" class="chart-page d-flex flex-column">
    <div class="d-flex" v-if="show_dashboard">
        <div v-for="(column, column_name, column_idx) in dashboard.layout" :key="column_idx" :class="column.classes">
          <div v-for="block in column.widgets" :key="block._id" :class="block.classes">
            <component :is="block.component"
                       @changeTimePosition="captureTimePosition"
                       :block="block"
                       :result="result"
                       :trialID="trial_selected.id"
                       :timePosition="time_position"
            ></component>
          </div>
        </div>
    </div>

    <div id="button-left" class="pa-2 fixed-button fixed-button-to-left">
      <v-btn @click="leftMenu">
        Data
      </v-btn>
    </div>

    <v-card class="sidebar left-sidebar">
      <div class="pa-4 left-menu-close-button">
        <v-btn width="64px" @click="leftMenu">
          ✖
        </v-btn>
      </div>
      <v-card-text height="100%" v-if="dashboard.data">
        <v-toolbar-title class="text-center">Data Menu</v-toolbar-title>
        <v-subheader class="subheader-bold"></v-subheader>
        <div class="left d-flex flex-column pa-2">
          <v-card>
            <v-card-text>
              <v-select v-model="subject_selected"
                        item-value="id"
                        item-text="name"
                        :items="dashboard.data.subjects"
                        label="Select subject" outlined dense return-object></v-select>
              <v-select v-model="session_selected"
                        item-value="id"
                        item-text="id"
                        :items="filteredSessions"
                        :disabled="!subject_selected"
                        label="Select session" outlined dense return-object></v-select>
              <v-select v-model="trial_selected"
                        item-value="id"
                        item-text="name"
                        :items="filteredTrials"
                        :disabled="!session_selected"
                        label="Select trial" outlined dense return-object></v-select>

<!--              <hr>-->

<!--              {{trial_selected}}-->
<!--              {{ result }}-->


            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

  </div>

</template>

<script>
import Visualizer from '@/components/ui/Visualizer';
import { mapState, mapActions } from 'vuex'
import axios from 'axios'
import {apiWarning} from "@/util/ErrorMessage";
import { Line as LineChartGenerator } from 'vue-chartjs/legacy'
import zoomPlugin from 'chartjs-plugin-zoom';

import ScalarPlot from '@/components/ui/ScalarPlot.vue'
import LinearChart from '@/components/ui/LinearChart.vue'

import {
  Chart as ChartJS,
  Title,
  SubTitle,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement} from 'chart.js'

ChartJS.register(
  Title,
  SubTitle,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  zoomPlugin)

export default {
    name: 'AnalysisDashboard',
    components: {
        Visualizer,
        ScalarPlot,
        LinearChart,
    },
    data() {
      return {
        subject_selected: null,
        session_selected: null,
        trial_selected: null,
        y_values: [],
        selected_y_values: [],
        time_position: 0,
        result: {},
        show_dashboard: false,
      }
    },
    computed: {
      ...mapState({
        dashboard: state => state.data.analysis_dashboard,
        sessions: state => state.data.sessions,
        session: state => state.data.session,
        subjects: state => state.data.subjects,
        loggedIn: state => state.auth.verified
      }),
      filteredSessions() {
        return this.dashboard.data.sessions.filter(session => this.subject_selected && session.subject_id === this.subject_selected.id )
      },
      filteredTrials() {
        return this.dashboard.data.trials.filter(trial => this.session_selected && trial.session_id === this.session_selected.id)
      },
    },
    watch: {
      trial_selected: function (val) {
        this.loadResult()
      },
    },
    async mounted() {
        // await this.loadSession(this.$route.params.id)
        await this.loadAnalysisDashboard(this.$route.params.id)
    },
    created: function () {
      // Indicates if the current logged in user owns the session.
      this.session_owned = false

      // If the user is logged in, select session from list of sessions.
      if(this.loggedIn) {
        // If a session id has been passed as a parameter, set it as the default session.
        // this.sessionsIds.forEach(sessionId => {
        //   if (sessionId.includes(this.$route.params.id)) {
        //     this.session_selected = sessionId;
        //     this.onSessionSelected(this.session_selected);
        //     this.session_owned = true
        //   }
        // });
      }
    },
    methods: {
        ...mapActions('data', ['loadSession', 'loadAnalysisDashboard']),
        leftMenu() {
          if (document.getElementById("body").classList.contains("left-menu-closed")) {
            document.getElementById("body").classList.remove("left-menu-closed");
            document.getElementById("button-left").style.display = "None";
          } else {
            document.getElementById("body").classList.add("left-menu-closed");
            document.getElementById("button-left").style.display = "inline-block";
          }
        },
        captureTimePosition(time) {
          this.time_position = time;
        },
        getResultUrl(trial_id) {
          for(let i=0; i<this.dashboard.data.results.length; i++) {
            if (this.dashboard.data.results[i].trial_id === trial_id) {
              return this.dashboard.data.results[i].media
            }
          }
        },
        loadResult() {
          console.log("loadResult")
          console.log(this.trial_selected)
          this.result = {}
          if (this.trial_selected) {
            let url = this.getResultUrl(this.trial_selected.id)
            console.log(url)
            if (url) {
              const axiosWithoutToken = axios.create();
              delete axiosWithoutToken.defaults.headers.common['Authorization'];
              axiosWithoutToken.get(url)
                .then(response => {
                  this.result = response.data
                  this.show_dashboard = true
                })
                .catch(error => {
                  console.error(error);
                });
            }
          }
        },

        // onSessionSelected(sessionName) {
        //   console.log(sessionName)
        //   var sessionIdSelected = sessionName.match(/\((.*)\)/);
        //   if (sessionIdSelected !== null) {
        //     sessionIdSelected = sessionIdSelected.pop();
        //
        //     this.current_session_id = sessionIdSelected;
        //     var session = this.sessions.filter(function (obj) {
        //       if (obj.id === sessionIdSelected) {
        //         return obj.name;
        //       }
        //     });
        //
        //     var trials = session[0]['trials'];
        //     // Filter trials by name.
        //     trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')
        //
        //     if (trials.length > 0) {
        //       this.trial_ids = []
        //       this.trial_names = [];
        //       trials.forEach(element => {
        //         this.trial_names.push(element.name);
        //         this.trial_ids.push(element.id)
        //       });
        //       this.trial_selected = this.trial_names[0];
        //
        //       // Load data from this trial.
        //       this.onTrialSelected(this.trial_selected);
        //     } else {
        //       this.trial_names = []
        //       apiWarning("There are no dynamic trials associated with this session, thereby nothing to plot.")
        //     }
        //   }
        // },
        // onTrialSelected(trialName) {
        //   this.trial_selected = trialName;
        // }

    },
}
</script>
<style lang="scss">
#body {
  position: relative;
  display: table-cell;
  vertical-align: middle;
  width: 100%;
  height: 100%;
  background-color: black;
}

.sidebar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 300px;
  transition: transform 0.2s;
  overflow-y: scroll;
}

.left-sidebar {
  left: 0;
}

.right-sidebar {
  right: 0;
}

.content {
  height: calc(100vh - 64px);
  transition: padding-left 0.2s;
}

.left-menu-closed>.left-sidebar {
  transform: translateX(-300px);
}

.right-menu-closed>.right-sidebar {
  transform: translateX(300px);
}

.fixed-button {
  position: fixed;
  bottom: 0px;
  top: 74px;
  display: None;
}

.fixed-button-to-left {
  left: 10px;
}

.fixed-button-to-right {
  right: 10px;
}

.left-menu-close-button {
  float: right;
}

.right-menu-close-button {
  float: left;
}

.subheader-bold {
  font-weight: bold;
}

.content-chart {
  margin: auto;
  width: 60%;
  height: 80%;
  background-color: white;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #767676;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to {transform: rotate(360deg);}
}

.height-50vh {
  height: 50vh;
}
</style>
