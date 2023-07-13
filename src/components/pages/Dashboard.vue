<template>
  <div id="body" class="chart-page d-flex flex-column">

    <!-- Google Charts container. -->
    <div class="content-chart">
      <div id="spinner-layer" style="position: relative; width: 100%; height: 100%; display:none;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
          <div class="spinner"></div>
        </div>
        <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); text-align: center; color:black">
          <h3>Loading Chart...</h3>
        </div>
      </div>

      <LineChartGenerator
        id="chart"
        :chart-options="chartOptions"
        :chart-data="chartData"
        style="position: relative; width: 100%; height: 100%;"
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
          <div v-if="session_owned">
            <v-select v-model="session_selected" v-bind:items="sessionsIds" label="Select session" outlined dense
              v-on:change="onSessionSelected"></v-select>
          </div>
          <div v-else>
                <p>
                    This is a public session. To load your sessions, launch the dashboard from your session list.
                </p>
          </div>
          <v-select v-model="trial_selected" v-bind:items="trial_names" label="Select trial" outlined dense
            v-on:change="onTrialSelected"></v-select>

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

          <v-text-field v-model="chart_line_width" label="Line Width" outlined dense type="number" v-on:change="drawChart"></v-text-field>

          <v-select v-model="chartOptions.plugins.legend.position" v-bind:items="chart_legend_position" label="Legend Position"
            outlined dense v-on:change="placeholderFunction"></v-select>

          <v-select v-model="chartOptions.plugins.legend.align" v-bind:items="chart_legend_alignment"
            label="Legend Alignment" outlined dense v-on:change="placeholderFunction"></v-select>

          <v-select v-model="chart_color_scales_selected" v-bind:items="chart_color_scales_options"
            label="Color Scale" outlined dense v-on:change="drawChart"></v-select>

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
  PointElement)

export default {
  name: 'ChartPage',
  components: { LineChartGenerator  },
  // This function is executed once the page has been loaded.
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
    // Draw a chart. In future iterations this function should take care of compute the requested data, not only load it.
    async drawChart() {
      // Show spinner and hide chart until finished.
      document.getElementById("spinner-layer").style.display = "block";
      document.getElementById("chart").style.display = "None";

      var index = this.trial_names.indexOf(this.trial_selected);
      var id = this.trial_ids[index];

      try {
        const { data } = await axios.get(`/trials/${id}/`);

        this.trial = data

        // load JSON
        const json = data.results.filter(element => element.tag == "ik_results")

        if (json && json.length > 0) {
          let data
          const url = json[0].media

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

          // Get indexes where requested data is.
          var indexes = [this.x_quantities.indexOf(this.x_quantity_selected)];
          var i = 0;
          for (i = 0; i < this.y_quantities_selected.length; i++) {
            indexes.push(this.y_quantities.indexOf(this.y_quantities_selected[i]) + 1);
          }

          // Split file in lines.
          var lines = data.split("\n");

          // Process line by line. First obtain number of rows and number of columns.
          var nRows = 0;
          var nColumns = 0;
          i = 0;
          while (lines[i].trim() !== "endheader") {
            var splitted = lines[i].trim().split("=");
            if (splitted[0] == "nRows") {
              nRows = parseInt(splitted[1]);
            } else if (splitted[0] == "nColumns") {
              nColumns = parseInt(splitted[1]);
            }
            i++;
          }

          // Skip endHeader and possible blank lines.
          do {
            i++;
          } while (lines[i].trim() === "");

          // Get column names.
          var columnNames = []
          columnNames.push(this.x_quantity_selected);
          columnNames.push(...this.y_quantities_selected);
          i++;

          // Get name of selected color scale.
          const selectedOption = this.chart_color_scales_options.find(option => {
            return option.value === this.chart_color_scales_selected;
          });

          const selectedText = selectedOption ? selectedOption.text : "";

            // Create an empty dataset per column.
            var j = 0;
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

            // Add y quantities.
            var dataset = {};
            for(j = 0; j < this.y_quantities_selected.length; j++) {
              dataset = {};
              dataset["data"] = [];
              dataset["label"] = this.y_quantities_selected[j];
              dataset["backgroundColor"] = colors[j];
              dataset["borderColor"] = colors[j];
              dataset["borderWidth"] = this.chart_line_width;

              this.chartData.datasets.push(dataset);
            }

            // Insert value from each row
            j = 0;
            var k = 0;
            for (j = 0; j < nRows; j++) {
                var lineArray = lines[j + i].trim().split("\t");
                var row = [];
                for (k = 0; k < indexes.length; k++) {
                  if (k === 0)
                    this.chartData["labels"].push(parseFloat(lineArray[indexes[k]].trim()));
                  else
                    this.chartData.datasets[k-1]["data"].push(parseFloat(lineArray[indexes[k]].trim()));
                }
            }
        }

        // Show spinner and hide chart until finished.
        document.getElementById("spinner-layer").style.display = "None";
        document.getElementById("chart").style.display = "block";
      } catch (error) {
        apiError(error)
        this.trialLoading = false
      }


    },
    // Get trials and update trials select when a session is selected.
    onSessionSelected(sessionName) {
      // Clear previous toast messages
      clearToastMessages()

      // Get value between parentheses (session id).
      var sessionIdSelected = sessionName.match(/\((.*)\)/);
      if (sessionIdSelected !== null) {
        sessionIdSelected = sessionIdSelected.pop();

        this.$router.push({ name: 'Dashboard', params: { id: sessionIdSelected } })

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
    // Get x-quantities and y-quantities and update respective selects when a trial is selected.
    async onTrialSelected(trialName) {

      // Show spinner and hide chart until finished.
      document.getElementById("spinner-layer").style.display = "block";
      document.getElementById("chart").style.display = "None";

      // Then, when generate chart is clicked, use the available data and calculate the data of
      // the columns that are not in database.
      this.trial_selected = trialName;
      var index = this.trial_names.indexOf(this.trial_selected);
      var id = this.trial_ids[index];

      try {
        const { data } = await axios.get(`/trials/${id}/`);

        this.trial = data

        // load JSON
        const json = data.results.filter(element => element.tag == "ik_results")

        if (json && json.length > 0) {
          let data
          const url = json[0].media

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
          var i = 0;
          while (lines[i].trim() !== "endheader") {
            i++;
          }

          // Skip endHeader and possible blank lines.
          do {
            i++;
          } while (lines[i].trim() === "");

          // Get column names.
          this.x_quantities = lines[i].trim().split("\t");
          // Create copy for y_quantities and remove time.
          this.y_quantities = this.x_quantities.slice();
          this.y_quantities.shift();

          this.x_quantity_selected = this.x_quantities[0]

          this.drawChart()
        }

        // Show chart and hide spinner.
        document.getElementById("spinner-layer").style.display = "None";
        document.getElementById("chart").style.display = "block";
      } catch (error) {
        apiError(error)
        this.trialLoading = false
      }
    },
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
    onChartReady(chart, google) {
      this.chart_reference = chart;
    },
    placeholderFunction(selected) {
      console.log(selected);
    },
  },
  data() {
    return {
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
      chart_object: undefined,
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
      chart_line_width: 1,
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
            position: 'right',
            align: 'center',
            labels: {
              font: {
                size: 15
              },
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
  async mounted () {
    // Set session as current session.
    this.current_session_id = this.$route.params.id;
    // Show spinner and hide chart until finished.
    document.getElementById("spinner-layer").style.display = "block";
    document.getElementById("chart").style.display = "None";

    // If not logged in, load session from params and show trials.
      await this.loadSession(this.$route.params.id)

      var trials = this.session['trials'];
      // Filter trials by name.
      trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'neutral'  && trial.name !== 'calibration')
      if (trials.length > 0) {
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
            apiWarning("There are no trials associated to this session. Record a new trial in order to plot information.")
        }

      // Load data from this trial.
      this.onTrialSelected(this.trial_selected);

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