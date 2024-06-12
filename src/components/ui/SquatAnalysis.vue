<template>
  <div class="squat-analysis-wrapper">
    <div v-for="(row, row_idx) in sortedInfoText"
         :key="row_idx"
         :class="row.classes">
      <div class="info-label">{{ row.label }}</div>
      <div class="info-text">{{ row.text }}</div>
    </div>
    <div v-for="(row, row_idx) in sortedMetrics"
         :key="row_idx"
         :class="row.classes">
      <div class="label-text">{{ row.label }}</div>
      <div class="scalar-text">{{ row.value }} &plusmn; {{ row.std }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["trialID", 'timePosition', 'result', 'block'],
  name: "squat-analysis",
  computed: {
    sortedMetrics() {
      return Object.keys(this.result.metrics).sort().map((x) => this.result.metrics[x]);
    },
    sortedInfoText() {
      return Object.keys(this.result.info_text).sort().map((x) => this.result.info_text[x]);
    }
  }
};
</script>

<style>
.info-label {
  font-size: 16px;
  text-align: center;
  font-weight: bold;
}

.info-text {
  font-size: 28px;
  text-align: center;
  margin-bottom: 3rem;
}

.label-text {
  font-size: 16px;
  text-align: center;
  font-weight: bold;
}

.scalar-text {
  font-size: 32px;
  text-align: center;
  margin-bottom: 3rem;
}

.squat-analysis-wrapper {
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.squat-analysis {
  width: 250px;
  height: 100vh;
  background: black;
  color: white;
  margin-bottom: 1rem;
  overflow-y: auto;
}

</style>
