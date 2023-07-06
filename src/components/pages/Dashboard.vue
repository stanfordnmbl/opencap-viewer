<template>
  <div id="body" class="chart-page d-flex flex-column">

    <!-- Google Charts container. -->
    <div class="content-chart">
      <GChart :type="chart_type" :data="chart_data" :options="chart_options" :resizeDebounce="500" @ready="onChartReady" style="width: 100%; height: 100%;"/>
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
                    This session belongs to another user. To explore your own sessions you should go back to your session list.
                </p>
          </div>
          
          <v-select v-model="trial_selected" v-bind:items="trial_names" label="Select trial" outlined dense
            v-on:change="onTrialSelected"></v-select>

          <v-select v-bind:items="x_quantities" label="X Quantity" outlined dense
            v-on:change="onXQuantitySelected"></v-select>

          <v-select v-bind:items="y_quantities" label="Y Quantities" multiple outlined dense
            v-on:change="onYQuantitySelected"></v-select>
        </div>
      </v-card-text>

      <div class="left d-flex flex-column pa-2">
        <v-btn class="w-100 mt-4" @click="drawChart">
          Generate Chart
        </v-btn>

        <v-btn class="w-100 mt-4" @click="onChartDownload">
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
          <v-select v-model="chart_type" v-bind:items="chart_type_options" label="Chart Type" outlined dense></v-select>

          <v-text-field v-model="chart_options.title" label="Title" outlined dense></v-text-field>

          <v-text-field v-model="chart_options.hAxis.title" label="H. Axis Title" outlined dense></v-text-field>

          <v-text-field v-model="chart_options.vAxis.title" label="V. Axis Title" outlined dense></v-text-field>

          <v-select v-model="chart_options.legend.position" v-bind:items="chart_legend_position" label="Legend Position"
            outlined dense v-on:change="placeholderFunction"></v-select>

          <v-select v-model="chart_options.legend.alignment" v-bind:items="chart_legend_alignment"
            label="Legend Alignment" outlined dense v-on:change="placeholderFunction"></v-select>

          <v-select v-model="chart_download_format_selected" v-bind:items="chart_download_format"
            label="Download Format" outlined dense v-on:change="placeholderFunction"></v-select>
        </div>
      </v-card-text>
    </v-card>


  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import axios from 'axios'
import { apiError, apiInfo, apiWarning } from '@/util/ErrorMessage.js'
import Vue from 'vue'
import VueGoogleCharts from "vue3-googl-chart"
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'
import store from '@/store/store.js'

Vue.use(VueGoogleCharts);

export default {
  name: 'ChartPage',
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

          // Proccess line by line. First obtain number of rows and number of columns.
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

          // First, add headers to chart_data, and then add information from rows.
          var rows = [];
          this.chart_data = [];
          this.chart_data.push([this.x_quantity_selected]);
          this.chart_data[0].push(...this.y_quantities_selected);
          var j = 0;
          var k = 0;
          for (j = 0; j < nRows; j++) {
            var lineArray = lines[j + i].trim().split("\t");
            var row = [];
            for (k = 0; k < indexes.length; k++) {
              row.push(parseFloat(lineArray[indexes[k]].trim()));
            }
            this.chart_data.push(row);
          }
        }

      } catch (error) {
        apiError(error)
        this.trialLoading = false
      }

    },
    // Get trials and update trials select when a sessin is selected.
    onSessionSelected(sessionName) {

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
            apiWarning("There are no dynamic trials associated with this session, thereby nothing to plot.")
        }

      }
    },
    // Get x-quantities and y-quantities and update respective selects when a trial is selected.
    async onTrialSelected(trialName) {
      // TODO In following versions, load just available columns, and show them in the select.
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

          // Proccess line by line. First obtain number of rows and number of columns.
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

        }

      } catch (error) {
        apiError(error)
        this.trialLoading = false
      }
    },
    onXQuantitySelected(xQuantitySelected) {
      this.x_quantity_selected = xQuantitySelected;
      this.chart_options.hAxis.title = xQuantitySelected;
    },
    onYQuantitySelected(yQuantitySelected) {
      this.y_quantities_selected = yQuantitySelected;
    },
    onChartDownload() {
      if (this.chart_download_format_selected === 'png') {
        // Get image URI from Google Charts object.
        var imgUri = this.chart_reference.getImageURI();

        // Open image in new window.
        window.open(imgUri);

        // Create a link element to download the image.
        var downloadLinkPng = document.createElement("a");

        // Set URI of the image.
        downloadLinkPng.href = imgUri;

        // Set name of the downloaded file.
        downloadLinkPng.download = "chart.svg";

        // Append link element, click it, and remove it.
        document.body.appendChild(downloadLinkPng);
        downloadLinkPng.click();
        document.body.removeChild(downloadLinkPng);

      } else if (this.chart_download_format_selected == 'svg') {
        // Get source of the SVG element.
        var svg = document.getElementsByTagName("svg");
        var svgData = svg[0].outerHTML;
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(svg[0]);

        // Add xml declaration to the svg object.
        var svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        var svgUri = URL.createObjectURL(svgBlob);

        // Open image in new window.
        window.open(svgUri);

        // Create a link element to download the image.
        var downloadLinkSvg = document.createElement("a");

        // Set URI of the image.
        downloadLinkSvg.href = svgUri;

        // Set name of the downloaded file.
        downloadLinkSvg.download = "chart.svg";

        // Append link element, click it, and remove it.
        document.body.appendChild(downloadLinkSvg);
        downloadLinkSvg.click();
        document.body.removeChild(downloadLinkSvg);
      } else if (this.chart_download_format_selected == 'pdf') {

        // Get SVG element.
        var svg_for_pdf = document.getElementsByTagName("svg");
        var element = svg_for_pdf[0];

        // Get dimensions of the SVG element.
        element.getBoundingClientRect()
        const width = element.width.baseVal.value
        const height = element.height.baseVal.value

        // Create a new PDF file with the required dimensions.
        const doc = new jsPDF(width > height ? 'l' : 'p', 'pt', [width, height])

        // Add SVG element to the PDF and download it.
        doc.svg(element, { width, height })
          .then(() => {
            // save the created pdf
            doc.save('chart.pdf')
          })
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
      chart_download_format: ['png', 'svg', 'pdf'],
      chart_download_format_selected: 'png',
      chart_object: undefined,
      chart_data: [['', ''],
      ['', 0]],
      chart_type: "LineChart",
      chart_type_options: ["LineChart", "ScatterChart", "AreaChart", "SteppedAreaChart", "ColumnChart"], // "BarChart", "Histogram"
      chart_legend_position: ["none", "top", "right", "bottom"],
      chart_legend_alignment: ["start", "center", "end"],
      chart_options: {
        title: "Chart Title",
        is3D: true,
        vAxis: {
          scaleType: 'decimal', // log
          title: 'v-Axis'
        },
        hAxis: {
          scaleType: 'decimal', // log
          title: 'h-Axis'
        },
        legend: {
          position: 'right',
          alignment: 'start'
        },
        explorer: {
          actions: ['dragToZoom', 'rightClickToReset'],
          axis: 'horizontal',
          keepInBounds: true,
          maxZoomIn: 4.0
        }
      },
      session_owned: false
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
          return obj.name;
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
        trials = trials.filter(trial => trial.status === 'done'&& trial.name !== 'calibration')

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
    // If not logged in, load session from params and show trials.
    if(!this.session_owned) {
      await this.loadSession(this.$route.params.id)

      var trials = this.session['trials'];
      // Filter trials by name.
      trials = trials.filter(trial => trial.status === 'done' && trial.name !== 'calibration')
      this.trial_names = [];
      trials.forEach(element => {
        this.trial_names.push(element.name);
        this.trial_ids.push(element.id)
      });
      this.trial_selected = this.trial_names[0];

      // Load data from this trial.
      this.onTrialSelected(this.trial_selected);
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
</style>
