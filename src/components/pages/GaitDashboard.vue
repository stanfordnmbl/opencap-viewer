<template>
  <div id="body" class="chart-page d-flex flex-column">
    <div class="d-flex">
      <div class="flex-grow-1" style="padding-left:300px;">
        <div style="height: 50vh;">
          <Visualizer :trialID="$route.params.trialID" :session="{session}"></Visualizer>
        </div>
        <div style="height: 50vh;">
          <div style="width: 300px;">
            <v-select
              v-model="selected_y_values"
              :items="y_values"
              label="Y Quantities"
              multiple outlined dense
            ></v-select>
          </div>

            <div class="content-chart">
              <div id="spinner-layer" style="position: relative; width: 100%; height: 100%; display:none;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                  <div class="spinner"></div>
                </div>
                <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); text-align: center; color:black">
                  <h3>Loading Chart</h3>
                </div>
              </div>

              <LineChartGenerator
                id="chart"
                :chart-options="chartOptions"
                :chart-data="chartData"
                style="position: relative; width: 100%; height: 100%;"
                ref="chartRef"
              />
            </div>
        </div>
      </div>
      <div class="scalar-plot">
        <div>
          <p>Scalar plot</p>
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
      <v-card-text height="100%">
        <v-toolbar-title class="text-center">Data Menu</v-toolbar-title>
        <v-subheader class="subheader-bold"></v-subheader>
        <div class="left d-flex flex-column pa-2">
          <v-card>
            <v-card-text>
              <v-select v-model="session_selected" v-bind:items="sessionsIds"
                        label="Select session" outlined dense return-object
                v-on:change="onSessionSelected"></v-select>
              <v-select v-model="trial_selected" v-bind:items="trial_names"
                        label="Select trial" outlined dense
                v-on:change="onTrialSelected"></v-select>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

  </div>


<!--  <div class="step-5 d-flex">-->
<!--    <div class="left d-flex flex-column pa-2">-->

<!--    </div>-->
<!--    <div class="viewer flex-grow-1">-->
<!--      <div>The video will be here</div>-->
<!--      <Visualizer :trialID="$route.params.trialID" :session="{session}"></Visualizer>-->
<!--      <div>The chart will be here</div>-->
<!--      <div>Scalar plot</div>-->
<!--    </div>-->
<!--  </div>-->
</template>

<script>
import Visualizer from '@/components/ui/Visualizer';
import { mapState, mapActions } from 'vuex'
import {apiWarning} from "@/util/ErrorMessage";
import { Line as LineChartGenerator } from 'vue-chartjs/legacy'
import zoomPlugin from 'chartjs-plugin-zoom';

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
    name: 'GaitDashboard',
    components: {
        Visualizer
    },
    data() {
      return {
        session_selected: null,
        trial_selected: null,
        trial_names: [],
        y_values: [],
        selected_y_values: [],
      }
    },
    computed: {
      ...mapState({
        sessions: state => state.data.sessions,
        session: state => state.data.session,
        subjects: state => state.data.subjects,
        loggedIn: state => state.auth.verified
      }),
      sessionsNames() {
        var result_sessions = this.sessions.map(function (obj) {
          // Check that there are valid trials
          var trials = obj['trials'];
          // Filter trials by name and status.
          trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'calibration')

          if (trials.length > 0) {
            return  obj.name + " (" + obj.id + ")";
          } else {
            return "";
          }
        })
        var filtered_sessions = result_sessions.filter(function (value, index, arr) {
          return value !== "";
        });
        return filtered_sessions;

      },
      sessionsIds() {
          var result_sessions = this.sessions.map(function (obj) {
            // Check that there are valid trials
            var trials = obj['trials'];
            // Filter trials by name and status.
            trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'calibration')

            if (trials.length > 0) {
              if (obj.name)
                return  obj.name + " (" + obj.id + ")";
              else
                if (obj.meta && obj.meta.subject && obj.meta.subject.id)
                    return obj.meta.subject.id + " (" + obj.id + ")";
            } else {
              return "";
            }
          })
          var filtered_sessions = result_sessions.filter(function (value, index, arr) {
            return value !== "";
          });
          return filtered_sessions;
      }
    },
    async mounted() {
        await this.loadSession(this.$route.params.id)
    },
    created: function () {
      // Indicates if the current logged in user owns the session.
      this.session_owned = false

      // If the user is logged in, select session from list of sessions.
      if(this.loggedIn) {
        // If a session id has been passed as a parameter, set it as the default session.
        this.sessionsIds.forEach(sessionId => {
          if (sessionId.includes(this.$route.params.id)) {
            this.session_selected = sessionId;
            this.onSessionSelected(this.session_selected);
            this.session_owned = true
          }
        });
      }
    },
    methods: {
        ...mapActions('data', ['loadSession']),
        leftMenu() {
          if (document.getElementById("body").classList.contains("left-menu-closed")) {
            document.getElementById("body").classList.remove("left-menu-closed");
            document.getElementById("button-left").style.display = "None";
          } else {
            document.getElementById("body").classList.add("left-menu-closed");
            document.getElementById("button-left").style.display = "inline-block";
          }
        },
        onSessionSelected(sessionName) {
          console.log(sessionName)
          var sessionIdSelected = sessionName.match(/\((.*)\)/);
          if (sessionIdSelected !== null) {
            sessionIdSelected = sessionIdSelected.pop();

            this.current_session_id = sessionIdSelected;
            var session = this.sessions.filter(function (obj) {
              if (obj.id === sessionIdSelected) {
                return obj.name;
              }
            });

            var trials = session[0]['trials'];
            // Filter trials by name.
            trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')

            if (trials.length > 0) {
              this.trial_ids = []
              this.trial_names = [];
              trials.forEach(element => {
                this.trial_names.push(element.name);
                this.trial_ids.push(element.id)
              });
              this.trial_selected = this.trial_names[0];

              // Load data from this trial.
              this.onTrialSelected(this.trial_selected);
            } else {
              this.trial_names = []
              apiWarning("There are no dynamic trials associated with this session, thereby nothing to plot.")
            }
          }
        },
        onTrialSelected(trialName) {
          this.trial_selected = trialName;
        }

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

.scalar-plot {
  width: 300px;
}
</style>
