<template>
  <div class="scalar-plot">
    <div v-for="(row, row_name, row_idx) in result.metrics" :key="row_idx"
         :class="row.classes">
      <h2 class="h5 plot-caption">{{ row.label }}</h2>

      <p>value: {{row.value}}</p>
<!--      <p>ranges: {{row.ranges}}</p>-->
<!--      <p>colors: {{row.colors}}</p>-->

      <div class="scalar-plot-container d-flex">
        <div class="scalar-plot-bar scalar-plot-bar-left text-right" :style="buildBarStyles(row.colors[0])">
          <div style="position: relative;margin-top: 20px;">{{row.ranges[0]}}</div>
        </div>
        <div class="scalar-plot-bar scalar-plot-bar-middle flex-grow-1" :style="buildBarStyles(row.colors[1])"></div>
        <div class="scalar-plot-bar scalar-plot-bar-right" :style="buildBarStyles(row.colors[2])">
          <div style="position: relative;margin-top: 20px;">{{row.ranges[1]}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["trialID", 'timePosition', 'result', 'block'],
  name: "scalar-plot",
  methods: {
    buildBarStyles(color) {
      return `background: ${color};`
    }
  }
};
</script>

<style>
.scalar-plot {
  width: 200px;
  height: 100vh;
  background: white;
  color: black;
  margin-bottom: 1rem;
}

.plot-caption {
  margin: 0;
  padding: 0;
  text-align: center;
}
.scalar-plot-bar {
  height: 10px;
  min-width: 30%;
}
</style>
