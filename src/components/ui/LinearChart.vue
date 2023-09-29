<template>
  <div class="linear-chart">
      <div style="width: 300px;">
        <v-select
          v-model="y_selected"
          @change="drawChart"
          :items="result.y_axis"
          label="Y Quantities"
          multiple outlined dense
        ></v-select>
      </div>
    <div>{{timePosition}}</div>

    <div class="content-chart">
<!--      <div id="spinner-layer" style="position: relative; width: 100%; height: 100%; display:none;">-->
<!--        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">-->
<!--          <div class="spinner"></div>-->
<!--        </div>-->
<!--        <div style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); text-align: center; color:black">-->
<!--          <h3>Loading Chart</h3>-->
<!--        </div>-->
<!--      </div>-->

      <LineChartGenerator
        id="chart"
        :chart-options="chartOptions"
        :chart-data="chartData"
        style="position: relative; width: 100%; height: 100%;"
        ref="chartRef"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import chroma from 'chroma-js';
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
import IconTooltip from "@/components/ui/IconTooltip.vue";

// const VerticalLinePlugin = {
//      id: 'verticalLinePlugin',
//      afterDraw (chart, args, options) {
//           const ctx = chart.ctx
//           ctx.save()
//
//           const yAxis = chart.scales['y-axis-0']
//           const xAxis = chart.scales['x-axis-0']
//        console.log(chart.scales)
//           const x = xAxis.getPixelForValue(2)
//
//        console.log(x)
//
//
//           ctx.beginPath()
//           ctx.moveTo(yAxis.top, x)
//           ctx.lineTo(yAxis.bottom, x)
//           ctx.lineWidth = 2
//           ctx.strokeStyle = "green"
//           ctx.stroke()
//           ctx.restore()
//      }
// }

ChartJS.register(
  Title,
  SubTitle,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  zoomPlugin,
    // VerticalLinePlugin
)

export default {
  props: ["trialID", 'timePosition', 'result', 'block', 'timeStart', 'timeEnd'],
  name: "linear-chart",
  components: {
    LineChartGenerator,
  },
  data() {
    return {
      y_selected: null,
      chartOptions: {
        annotation: {
        annotations: [
          {
            type: "line",
            mode: "vertical",
            scaleID: "x-axis-0",
            value: 2,
            borderColor: "red",
            label: {
              content: "TIME",
              enabled: true,
              position: "top"
            }
          }
        ]
      },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time (s)',
              font: {
                size: 20
              },
            },
            type: 'linear',
          },
          y: {
            title: {
              display: true,
              text: 'Values',
              font: {
                size: 20
              },
            },
            type: 'linear',
          },
        },
      },
      chartData: {
        datasets: [{
          label: 'Empty',
          data: [],
        }]
      },
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

    }
  },
  methods: {
    drawChart() {
      // Show spinner and hide chart until finished.
      // document.getElementById("spinner-layer").style.display = "block";
      // document.getElementById("chart").style.display = "None";

      this.chartData.labels = []
      this.chartData.datasets = []

      let timeStart = parseFloat(this.timeStart);
      let timeEnd = parseFloat(this.timeEnd);

      // Add y quantities.
      console.log(this.y_selected)
      var dataset = {};
      for(let i=0; i < this.y_selected.length; i++) {
        console.log(this.y_selected[i])
        dataset = {};
        dataset["label"] = this.y_selected[i];
        dataset["data"] = [];
        this.chartData.datasets.push(dataset);
      }

      var labels = [];
      for(let j=0; j < this.result.datasets.length; j++) {
        if(this.result.datasets[j][this.result.x_axis] >= timeStart && this.result.datasets[j][this.result.x_axis] <= timeEnd) {
          labels.push(this.result.datasets[j][this.result.x_axis]);
          for(let i=0; i < this.y_selected.length; i++) {
            this.chartData.datasets[i].data.push(this.result.datasets[j][this.y_selected[i]]);
          }
        }
      }
      this.chartData["labels"] = labels;

      console.log(this.chartData)
      // Show spinner and hide chart until finished.
      // document.getElementById("spinner-layer").style.display = "None";
      // document.getElementById("chart").style.display = "block";


    }
  }
};
</script>

<style>

</style>
