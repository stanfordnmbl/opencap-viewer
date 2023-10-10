<template>
  <div class="scalar-wrapper">
    <div v-for="(row, row_name, row_idx) in result.metrics" :key="row_idx"
         :class="row.classes">
      <h2 class="h5 plot-caption">{{ row.label }}</h2>

      <div class="scalar-plot-container d-flex" style="margin-top: 45px;margin-bottom: 55px;">
        <div class="scalar-plot-bar scalar-plot-bar-left text-right" :style="buildBarStyles(row.colors[0])">
          <div style="position: relative;margin-top: 20px;">{{row.min_limit}}</div>
        </div>
        <div class="scalar-plot-bar scalar-plot-bar-middle flex-grow-1" :style="buildBarStyles(row.colors[1])">
          <div :style="buildValueStyles(row.value, row.min_limit, row.max_limit)">
            <div style="width:100px;text-align: center;margin-left: -50px;">{{row.value}}</div>
            <div style="border: 1px solid #ffffff;width:4px;height: 30px;background: #ffffff;"></div>
          </div>
        </div>
        <div class="scalar-plot-bar scalar-plot-bar-right" :style="buildBarStyles(row.colors[2])">
          <div style="position: relative;margin-top: 20px;">{{row.max_limit}}</div>
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
    },
    buildValueStyles(value, min, max) {
      let percent = (value - min) / (max - min) * 100;
      return `position: relative;margin-top: -33px;margin-left:${percent}%;`
    },
    calculatedMinLimit(minLimit, value) {
      return Math.min(minLimit, 0.95 * value);
    },
    calculatedMaxLimit(maxLimit, value) {
      return Math.max(maxLimit, 1.05 * value);
    },
  }
};
</script>

<style>
.plot-caption {
  font-size: 16px;
}

.scalar-wrapper {
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.scalar-plot {
  width: 300px;
  height: 100vh;
  background: black;
  color: white;
  margin-bottom: 1rem;
  overflow-y: auto;
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
