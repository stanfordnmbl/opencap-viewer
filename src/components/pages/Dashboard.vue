<template>
  <div id="body" class="chart-page d-flex flex-column">

    <!-- Google Charts container. -->
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

    <!-- Left floating button. -->
    <div id="button-left" class="pa-2 fixed-button fixed-button-to-left">
      <v-btn @click="leftMenu">
        Data
      </v-btn>
    </div>

    <!-- Right floating button. -->
    <div id="button-right" class="pa-2 fixed-button fixed-button-to-right">
      <v-btn @click="rightMenu">
        Options
      </v-btn>
    </div>

    <!-- Left sidebar. -->
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
          <div class="pb-4">
          <div v-for="(trial_selection, idx) in selected_trials" :key="trial_selection.uuid">
            <TrialSelect :trialSelection="trial_selection"
                         :selectionIndex="idx"
                         :publicSessionId="public_session_id"
                         @trial-selected="captureTrialSelection"
                         @trial-remove="removeTrialSelection"></TrialSelect>

          </div>
<!--          <v-btn class="w-100" @click="addTrialSelection">Add trial</v-btn>-->
          </div>
<!--          <hr>-->

<!--          <div v-if="session_owned">-->
<!--            <v-select v-model="session_selected" v-bind:items="sessionsIds" label="Select session" outlined dense-->
<!--              v-on:change="onSessionSelected"></v-select>-->
<!--          </div>-->
<!--          <div v-else>-->
<!--                <p>-->
<!--                    This is a public session. To load your sessions, launch the dashboard from your session list.-->
<!--                </p>-->
<!--          </div>-->
<!--          <v-select v-model="trial_selected" v-bind:items="trial_names" label="Select trial" outlined dense-->
<!--            v-on:change="onTrialSelected"></v-select>-->

          <v-select v-bind:items="x_quantities" v-model="x_quantity_selected" label="X Quantity" outlined dense
            v-on:change="onXQuantitySelected"></v-select>

          <v-select v-bind:items="y_quantities" label="Y Quantities" multiple outlined dense
            v-on:change="onYQuantitySelected"></v-select>
        </div>
      </v-card-text>

      <div class="left d-flex flex-column pa-2">

        <v-btn class="w-100" @click="onChartDownload">
          Download Chart
        </v-btn>

        <v-btn class="w-100 mt-4" @click="$router.push({ name: 'Session', params: { id: current_session_id } })">
          Go to Visualizer
        </v-btn>

        <div v-if="loggedIn" class="left d-flex flex-column">
          <v-btn class="w-100 mt-4" :to="{ name: 'SelectSession' }">Back to session list
          </v-btn>
        </div>
      </div>

    </v-card>

    <!-- Right sidebar. -->
    <v-card class="sidebar right-sidebar">
      <div class="pa-4 right-menu-close-button">
        <v-btn width="64px" @click="rightMenu">
          ✖
        </v-btn>
      </div>
      <v-card-text>

        <v-toolbar-title class="text-center">Options Menu</v-toolbar-title>

        <v-subheader class="subheader-bold"></v-subheader>

        <div class="left d-flex flex-column pa-2">
          <v-text-field v-model="chartOptions.plugins.title.text" label="Title" outlined dense></v-text-field>

          <v-text-field v-model="chartOptions.plugins.subtitle.text" label="Subtitle" outlined dense></v-text-field>

          <v-text-field v-model="chartOptions.scales.x.title.text" label="H. Axis Title" outlined dense></v-text-field>

          <v-text-field v-model="chartOptions.scales.y.title.text" label="V. Axis Title" outlined dense></v-text-field>

          <v-text-field v-model="chart_line_width" label="Line Width" outlined dense type="number" @input="drawChart"></v-text-field>

          <v-select v-model="chart_point_style" v-bind:items="chart_point_style_options" label="Point Style"
            outlined dense v-on:change="drawChart"></v-select>

          <v-text-field v-model="chart_point_radius" label="Point Size" outlined dense type="number" @input="drawChart"></v-text-field>

          <v-select v-model="chartOptions.plugins.legend.position" v-bind:items="chart_legend_position" label="Legend Position"
            outlined dense v-on:change="placeholderFunction"></v-select>

          <v-select v-model="chartOptions.plugins.legend.align" v-bind:items="chart_legend_alignment"
            label="Legend Alignment" outlined dense v-on:change="placeholderFunction"></v-select>

          <v-select v-model="chart_color_scales_selected" v-bind:items="chart_color_scales_options"
            label="Color Scale" outlined dense v-on:change="drawChart"></v-select>

          <v-btn class="w-100" @click="onResetZoom">
            Reset Zoom
          </v-btn>

          <icon-tooltip
            tooltip-text="
                Zoom instructions:</br>
                 - <b>Zoom</b>: Click and Drag over a zone.</br>
                 - <b>Move</b>: CTRL + Click and move mouse.</br>
                 - <b>Zoom on X</b>: Mouse wheel on X axis.</br>
                 - <b>Zoom on Y</b>: Mouse wheel on Y axis.</br>
            "
            iconClass="fas fa-question-circle"
            >
          </icon-tooltip>


        </div>

      </v-card-text>
    </v-card>


  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import axios from 'axios'
import { apiError, apiInfo, apiWarning, clearToastMessages } from '@/util/ErrorMessage.js'
import Vue from 'vue'
import store from '@/store/store.js'
import chroma from 'chroma-js';
import { Line as LineChartGenerator } from 'vue-chartjs/legacy'
import zoomPlugin from 'chartjs-plugin-zoom';
import IconTooltip from '@/components/ui/IconTooltip.vue';
import TrialSelect from '@/components/ui/TrialSelect.vue';

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
  name: 'ChartPage',
  components: {
    LineChartGenerator,
    IconTooltip,
    TrialSelect,
   },
  // This function is executed once the page has been loaded.
  created: function () {
      // Indicates if the current logged in user owns the session.
      this.session_owned = false

      // If the user is logged in, select session from list of sessions.
      // if(this.loggedIn) {
      //   // If a session id has been passed as a parameter, set it as the default session.
      //   this.sessionsIds.forEach(sessionId => {
      //     if (sessionId.includes(this.$route.params.id)) {
      //       this.session_selected = sessionId;
      //       this.onSessionSelected(this.session_selected);
      //       this.session_owned = true
      //     }
      //   });
      // }

  },
  methods: {
    ...mapActions('data', ['loadSession', 'loadSubjects', 'loadExistingSessions']),
    // Open and close left menu.
    leftMenu() {
      if (document.getElementById("body").classList.contains("left-menu-closed")) {
        document.getElementById("body").classList.remove("left-menu-closed");
        document.getElementById("button-left").style.display = "None";
      } else {
        document.getElementById("body").classList.add("left-menu-closed");
        document.getElementById("button-left").style.display = "inline-block";
      }
    },
    // Open and close right menu.
    rightMenu() {
      if (document.getElementById("body").classList.contains("right-menu-closed")) {
        document.getElementById("body").classList.remove("right-menu-closed");
        document.getElementById("button-right").style.display = "None";
      } else {
        document.getElementById("body").classList.add("right-menu-closed");
        document.getElementById("button-right").style.display = "inline-block";
      }
    },

    onResetZoom() {
        const chart = this.$refs.chartRef.getCurrentChart();
        if (chart) {
          chart.resetZoom();
        }
    },
    // Get trials and update trials select when a session is selected.
    // async onSessionSelected(sessionName) {
    //   console.log('onSessionSelected', sessionName)
    //   // Clear previous toast messages
    //   clearToastMessages()
    //
    //   // Get value between parentheses (session id).
    //   var sessionIdSelected = sessionName.match(/\((.*)\)/);
    //   if (sessionIdSelected !== null) {
    //     sessionIdSelected = sessionIdSelected.pop();
    //
    //     this.$router.push({ name: 'Dashboard', params: { id: sessionIdSelected } }).catch(err => {})
    //
    //     this.current_session_id = sessionIdSelected;
    //
    //     await this.loadSubjects()
    //     await this.loadSession(this.$route.params.id)
    //     console.log('this.session=', this.session)
    //     // console.log(this.selected_trials[0])
    //     let subject = null
    //     if (this.session.subject) {
    //       for(let i = 0; i < this.subjects.length; i++) {
    //         if (this.subjects[i].id === this.session.subject) {
    //           subject = this.subjects[i]
    //           break
    //         }
    //       }
    //     }
    //
    //     this.selected_trials.push({
    //       uuid: this.generateUUID(),
    //       subject_selected: subject,
    //       session_selected: this.session,
    //       trial_selected: this.session.trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')[0],
    //       offset: 0,
    //     })
    //
    //   }
    // },
    onXQuantitySelected(xQuantitySelected) {
      this.x_quantity_selected = xQuantitySelected;
      this.chartOptions.scales.x.title.text = xQuantitySelected;
      this.drawChart();
    },
    onYQuantitySelected(yQuantitySelected) {
      this.y_quantities_selected = yQuantitySelected;
      this.drawChart();
    },
    onChartDownload() {
      if (this.chart_download_format_selected === 'png') {
          const canvas = document.getElementById("chart").getElementsByTagName('canvas')[0];
          const downloadLink = document.createElement('a');
          downloadLink.setAttribute('download', 'chart.png');
          canvas.toBlob(function(blob) {
          const url = URL.createObjectURL(blob);
          downloadLink.setAttribute('href', url);
          downloadLink.click();
          URL.revokeObjectURL(url);
        }, 'image/png', 1);
      }

    },

    placeholderFunction(selected) {
      console.log(selected);
    },
    addTrialSelection() {
      if (!this.loggedIn && this.selected_trials.length > 0) {
        this.selected_trials.push({
          uuid: this.generateUUID(),
          subject_selected: this.selected_trials[0].subject_selected,
          session_selected: this.selected_trials[0].session_selected,
          // trial_selected: this.selected_trials[0].session_selected.trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')[0],
          trial_selected: null,
        })
      } else {
        this.selected_trials.push({
          uuid: this.generateUUID(),
          subject_selected: this.selected_trials.length > 0 ? this.selected_trials[0].subject_selected : null,
          // subject_selected : null,
          session_selected: null,
          trial_selected: null,
        })
      }
    },
    removeTrialSelection(uuid) {
      this.selected_trials = this.selected_trials.filter(trial => trial.uuid !== uuid)
      this.loadTrialResults()
    },
    captureTrialSelection(trial_selection) {
      for (let i = 0; i < this.selected_trials.length; i++) {
        if (this.selected_trials[i].uuid === trial_selection.uuid) {
          Vue.set(this.selected_trials, i, trial_selection)
          break
        }
      }
      this.loadTrialResults()
    },
    async loadTrialResults() {
      // Show spinner and hide chart until finished.
      document.getElementById("spinner-layer").style.display = "block";
      document.getElementById("chart").style.display = "None";

      for (let i=0; i < this.selected_trials.length; i++) {
        // let trial_id = this.selected_trials[i].trial_selected.id
        if (this.selected_trials[i].trial_selected === null) { continue}
        let ik_results = this.selected_trials[i].trial_selected.results.filter(element => element.tag == "ik_results")

        if (ik_results && ik_results.length > 0) {
          let data
          const url = ik_results[0].media

          if (url.startsWith(axios.defaults.baseURL)) {
            const res = await axios.get(url)
            data = res.data
          } else {
            let axiosClean = axios.create()

            const res = await axiosClean.get(url, {
              // Deleting Authorization header, because we have one as global Axios
              // Do not pass out user token to 3rd party sites
              transformRequest: [(data, headers) => {
                delete headers.common.Authorization
                return data
              }]
            })

            data = res.data
          }

          // Split file in lines.
          var lines = data.split("\n");

          // Process line by line. First obtain number of rows and number of columns.
          let k = 0;
          while (lines[k].trim() !== "endheader") {
            k++;
          }

          // Skip endHeader and possible blank lines.
          do {
            k++;
          } while (lines[k].trim() === "");

          // Get column names.
          this.x_quantities = lines[k].trim().split("\t");
          // Create copy for y_quantities and remove time.
          this.y_quantities = this.x_quantities.slice();
          this.y_quantities.shift();
          this.x_quantity_selected = this.x_quantities[0]
        }

      }

      await this.drawChart()

      // Show chart and hide spinner.
      document.getElementById("spinner-layer").style.display = "None";
      document.getElementById("chart").style.display = "block";
    },
    async drawChart() {
      // Show spinner and hide chart until finished.
      document.getElementById("spinner-layer").style.display = "block";
      document.getElementById("chart").style.display = "None";

      // Get name of selected color scale.
      const selectedOption = this.chart_color_scales_options.find(option => {
        return option.value === this.chart_color_scales_selected;
      });

      const selectedText = selectedOption ? selectedOption.text : "";

      // Create an empty dataset per column.
      let j = 0;
      this.chartData.labels = []
      this.chartData.datasets = []
      var colors = chroma.scale("Viridis").correctLightness().gamma(2).cache(false).colors(this.y_quantities_selected.length);
      if (selectedText == "Spectral" || selectedText == "Rainbow" || selectedText == "Red-Yellow-Blue" || selectedText == "Yellow-Green-Blue")
          colors = chroma.scale(this.chart_color_scales_selected).colors(this.y_quantities_selected.length);
      else if (selectedText == "Yellow-Green")
          colors = chroma.scale(this.chart_color_scales_selected).correctLightness().colors(this.y_quantities_selected.length);
      else if (selectedText == "Red-Green" || selectedText == "Red-Blue" || selectedText == "Green-Blue")
          colors = chroma.scale(this.chart_color_scales_selected).gamma(0.75).cache(false).colors(this.y_quantities_selected.length);
      else
          colors = chroma.scale(this.chart_color_scales_selected).correctLightness().gamma(2).cache(false).colors(this.y_quantities_selected.length);

      let dashed_line_styles = [
          [], [5, 5], [10, 10],
          [20, 5],
          [15, 3, 3, 3],
          [20, 3, 3, 3, 3, 3, 3, 3],
          [12, 3, 3],
      ]

      for (let i=0; i < this.selected_trials.length; i++) {
        if (!this.selected_trials[i].trial_selected) {
          // Show chart and hide spinner.
          document.getElementById("spinner-layer").style.display = "None";
          document.getElementById("chart").style.display = "block";
          return
        }

        // let trial_id = this.selected_trials[i].trial_selected.id
        let ik_results = this.selected_trials[i].trial_selected.results.filter(element => element.tag == "ik_results")

        if (ik_results && ik_results.length > 0) {
          let data
          const url = ik_results[0].media

          if (url.startsWith(axios.defaults.baseURL)) {
            const res = await axios.get(url)
            data = res.data
          } else {
            let axiosClean = axios.create()

            const res = await axiosClean.get(url, {
              // Deleting Authorization header, because we have one as global Axios
              // Do not pass out user token to 3rd party sites
              transformRequest: [(data, headers) => {
                delete headers.common.Authorization
                return data
              }]
            })

            data = res.data
          }

          // Split file in lines.
          let lines = data.split("\n");

          // Process line by line. First obtain number of rows and number of columns.
          let nRows = 0;
          let nColumns = 0;
          let k = 0;
          while (lines[k].trim() !== "endheader") {
            let splitted = lines[k].trim().split("=");
            if (splitted[0] == "nRows") {
              nRows = parseInt(splitted[1]);
            } else if (splitted[0] == "nColumns") {
              nColumns = parseInt(splitted[1]);
            }
            k++;
          }

          // Skip endHeader and possible blank lines.
          do {
            k++;
          } while (lines[k].trim() === "");

          // Get column names.
          let columnNames = []
          columnNames.push(this.x_quantity_selected);
          columnNames.push(...this.y_quantities_selected);
          k++;

          let dataset = {}
          let start_index = this.chartData.datasets.length
          for(j = 0; j < this.y_quantities_selected.length; j++) {
            dataset = {};
            dataset["data"] = [];
            let session_name = this.selected_trials[i].session_selected.meta['sessionName']
            if ( session_name === null || session_name === undefined ) {
              session_name = this.selected_trials[i].session_selected.id.split('-')[0]
            } else {
              session_name = session_name + ' (' + this.selected_trials[i].session_selected.id.split('-')[0] + ')'
            }

            dataset["label"] = "" +
              this.selected_trials[i].subject_selected.name +
              " : " + session_name +
              " : " + this.selected_trials[i].trial_selected.name +
              " : " + this.y_quantities_selected[j];
            dataset["backgroundColor"] = colors[j];
            dataset["borderColor"] = colors[j];
            dataset["borderWidth"] = this.chart_line_width;
            dataset["borderDash"] = dashed_line_styles[i];
            // Handle "none" option to remove points
            dataset["pointStyle"] = this.chart_point_style;
            if (this.chart_point_style === "none") {
              dataset["pointRadius"] = 0;
            } else {
              dataset["pointRadius"] = this.chart_point_radius;
            }

            this.chartData.datasets.push(dataset);
          }

          // Get indexes where requested data is.
          let indexes = [this.x_quantities.indexOf(this.x_quantity_selected)];
          var n = 0;
          for (n = 0; n < this.y_quantities_selected.length; n++) {
            indexes.push(this.y_quantities.indexOf(this.y_quantities_selected[n]) + 1);
          }

          // Insert value from each row
          j = 0;
          let m = 0;
          for (j = 0; j < nRows; j++) {
              var lineArray = lines[j + k].trim().split("\t");
              // var row = [];
              for (m = 0; m < indexes.length; m++) {
                if (m > 0) {
                  this.chartData.datasets[start_index+m-1]["data"].push(
                      {
                        x: parseFloat(lineArray[indexes[0]].trim()) + this.selected_trials[i].offset,
                        y: parseFloat(lineArray[indexes[m]].trim())
                      }
                  );
                }
              }
          }


        }

      }

      // Show chart and hide spinner.
      document.getElementById("spinner-layer").style.display = "None";
      document.getElementById("chart").style.display = "block";

    },
    generateUUID() {
      return "10000000-1000-4000-8000-100000000000".replace(
          /[018]/g,
          c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    },
  },
  data() {
    return {
      selected_trials: [],


      subject_selected: "",

      public_session_id: "",
      current_session_id: "",
      session_selected: "",
      trial_selected: "",
      trial_names: [],
      trial_ids: [],
      y_quantities: [],
      y_quantities_selected: [],
      y_data: [],
      x_quantities: [],
      x_quantity_selected: [],
      x_data: [],
      placeholder: [],
      chart_download_format_selected: 'png',
      chart_color_scales_selected: "Viridis",
      chart_color_scales_options: [
        { text: 'Viridis (recommended)', value: 'Viridis' },
        { text: 'Hot', value: ['black', 'red', 'yellow'] },
        { text: 'Yellow-Blue', value: ['yellow', 'blue'] },
        { text: 'Yellow-Green', value: ['yellow', 'green'] },
        { text: 'Grays', value: ['lightgrey', 'black'] },
        { text: 'Blues', value: ['#add8e6', '#191970'] },
      ],
      chart_legend_position: ["top", "right", "bottom", "left", "chartArea"],
      chart_legend_alignment: ["start", "center", "end"],
      chartData: {
        datasets: [{
          label: 'Empty',
          data: [],
        }]
      },
      chart_line_width: 5,
      chart_point_style_options: ["none", "circle", "cross", "crossRot", "dash", "line", "rect", "rectRounded", "rectRot", "star", "triangle"],
      chart_point_style: 'none',
      chart_point_radius: 12,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'X axis title',
              font: {
                size: 20
              },
            },
            type: 'linear',
          },
          y: {
            title: {
              display: true,
              text: 'Y axis title',
              font: {
                size: 20
              },
            },
            type: 'linear',
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Chart',
            font: {
              size: 35
            },
          },
          subtitle: {
            display: true,
            text: 'Subtitle',
            font: {
              size: 15
            },
            padding: {
              top: 10,
              bottom: 35
            }
          },
          legend: {
            position: 'bottom',
            align: 'center',
            labels: {
              font: {
                size: 15
              },
            }
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy',
              modifierKey: 'ctrl',
            },
            zoom: {
              mode: 'xy',
              overScaleMode: 'xy',
              drag: {
                enabled: true,
              },
              wheel: {
                enabled: true,
              }
            }
          }
        },
      }
    }
  },
  computed: {
    ...mapState({
      sessions: state => state.data.sessions,
      session: state => state.data.session,
      subjects: state => state.data.subjects,
      loggedIn: state => state.auth.verified,
      user_id: state => state.auth.user_id,
    }),

    // sessionsNames() {
    //   var result_sessions = this.sessions.map(function (obj) {
    //     // Check that there are valid trials
    //     var trials = obj['trials'];
    //     // Filter trials by name and status.
    //     trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')
    //
    //     if (trials.length > 0) {
    //       return  obj.name + " (" + obj.id + ")";
    //     } else {
    //       return "";
    //     }
    //   })
    //   var filtered_sessions = result_sessions.filter(function (value, index, arr) {
    //     return value !== "";
    //   });
    //   return filtered_sessions;
    //
    // },
    // sessionsIds() {
    //   var result_sessions = this.sessions.map(function (obj) {
    //     // Check that there are valid trials
    //     var trials = obj['trials'];
    //     // Filter trials by name and status.
    //     trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')
    //
    //     if (trials.length > 0) {
    //       if (obj.name)
    //         return  obj.name + " (" + obj.id + ")";
    //       else
    //         if (obj.meta && obj.meta.subject && obj.meta.subject.id)
    //             return obj.meta.subject.id + " (" + obj.id + ")";
    //     } else {
    //       return "";
    //     }
    //   })
    //   var filtered_sessions = result_sessions.filter(function (value, index, arr) {
    //     return value !== "";
    //   });
    //   return filtered_sessions;
    // }
  },
  async mounted () {
    // Set session as current session.
    this.current_session_id = this.$route.params.id;

    // If not logged in, load session from params and show trials.
    await this.loadSubjects({session_id: this.current_session_id})
    await this.loadSession(this.current_session_id)
    if (this.current_session_id && this.session?.public) {
      this.public_session_id = this.current_session_id
    }

    if (this.current_session_id && this.selected_trials.length === 0) {
        let subject = this.subjects.filter(subject => subject.id === this.session.subject)[0]
        this.selected_trials.push({
          uuid: this.generateUUID(),
          subject_selected: subject,
          session_selected: this.session,
          trial_selected: this.session.trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral' && trial.name !== 'calibration')[0],
          offset: 0,
        })
    }
    if (!this.current_session_id && this.selected_trials.length == 0) {
      this.selected_trials.push({
        uuid: this.generateUUID(),
        subject_selected: null,
        session_selected: null,
        trial_selected: null,
        offset: 0,
      })
    }

    await this.loadTrialResults()
    if (this.loggedIn && this.sessions.length <= 1) {
      await this.loadExistingSessions({reroute: false, update_sessions: true})
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
  background-color: white;
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
</style>