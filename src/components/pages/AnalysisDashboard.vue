<template>
  <div id="body" class="chart-page d-flex flex-column">
    <div class="dashboard-body d-flex" v-if="show_dashboard">
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

            </v-card-text>

            <div class="left d-flex flex-column pa-2">
              <div v-if="loggedIn" class="left d-flex flex-column">

                  <v-dialog v-model="dialog" width="500">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn small class="mt-4 w-100" v-bind="attrs" v-on="on" v-show="loggedIn && trial_selected">Share analysis publicly</v-btn>
                    </template>

                    <v-card>
                        <v-card-title class="text-h5">
                            Share analysis publicly
                        </v-card-title>

                        <v-card-text>
                          <div v-if="!session_selected?.public">
                            <v-alert color="error" icon="$error">To make your analysis public, you need to make your session public</v-alert>

                            <v-btn color="primary" text @click="setSessionPublic">Make session public</v-btn>
                          </div>

                            <v-container v-if="session_selected?.public">
                                <h3 class="mb-2">Share on</h3>
                                <ShareNetwork network="facebook" class="mr-2" style="text-decoration: none;"
                                    :url="dashboardUrl" title="OpenCap session">
                                    <v-btn><v-icon aria-hidden="false">mdi-facebook</v-icon> &nbsp;Facebook</v-btn>
                                </ShareNetwork>
                                <ShareNetwork network="twitter" class="mr-2" style="text-decoration: none;"
                                    :url="dashboardUrl" title="OpenCap session">
                                    <v-btn><v-icon aria-hidden="false">mdi-twitter</v-icon> &nbsp;Twitter</v-btn>
                                </ShareNetwork>
                                <ShareNetwork network="linkedin" :url="dashboardUrl" style="text-decoration: none;"
                                    title="OpenCap session">
                                    <v-btn><v-icon aria-hidden="false">mdi-linkedin</v-icon> &nbsp;LinkedIn</v-btn>
                                </ShareNetwork>

                                <v-text-field label="Alternatively, copy this link"
                                    v-model="dashboardUrl" class="mt-5" readonly></v-text-field>
                            </v-container>

                        </v-card-text>

                        <v-divider></v-divider>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="dialog = false">
                                Close
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>


                <v-btn class="w-100 mt-4" :to="{ name: 'SelectSession' }">Back to session list
                </v-btn>

              </div>
            </div>

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
import ScalarValue from '@/components/ui/ScalarValue.vue'
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
        ScalarValue,
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
        dialog: null,

        share_subject_id: null,
        share_token: null,
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
      dashboardUrl() {
        return location.origin + "/analysis-dashboard/" + this.dashboard.id +
            '?trialId=' + this.trial_selected?.id +
            '&subjectId=' + this.subject_selected?.id +
            '&shareToken=' + this.subject_selected?.share_token;
      },

    },
    watch: {
      trial_selected: function (val) {
        this.show_dashboard = false
        this.y_values = []
        this.selected_y_values = []
        this.time_position = 0
        this.result = {}

        this.loadResult()
        if (this.share_subject_id && this.share_token) {
          history.pushState("", "", location.origin + location.pathname + `?trialId=${val.id}&subjectId=${this.share_subject_id}&shareToken=${this.share_token}`);
        } else {
          history.pushState("", "", location.origin + location.pathname + '?trialId=' + val.id);
        }
      },
    },
    async mounted() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString)
        this.share_subject_id = urlParams.get('subjectId')
        this.share_token = urlParams.get('shareToken')

        await this.loadAnalysisDashboard({id:this.$route.params.id, subject_id:this.share_subject_id, share_token:this.share_token})
        let given_trial_id = this.$route.query.trialId
        if (given_trial_id) {
          let trial_selected = this.dashboard.data.trials.filter(trial => trial.id === given_trial_id)[0]
          let session_selected = this.dashboard.data.sessions.filter(session => session.id === trial_selected.session_id)[0]
          let subject_selected = this.dashboard.data.subjects.filter(subject => subject.id === session_selected.subject_id)[0]
          this.subject_selected = subject_selected
          this.session_selected = session_selected
          this.trial_selected = trial_selected
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
       setSessionPublic() {
          axios.patch(`/sessions/${this.session_selected.id}/`, {"public": true}).then(response => {
            this.session_selected.public = true
          }).catch(error => {
            console.error(error);
          });
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

.dashboard-body {
  margin-left: 320px;
  margin-right: 10px;
}
</style>
