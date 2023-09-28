<template>
  <div class="scalar-plot">
    <div v-for="(row, row_name, row_idx) in result.metrics" :key="row_idx" :class="row.classes">
      <h2 class="h5 plot-caption">{{ row.label }}</h2>

      <p>value: {{row.value}}</p>
      <p>ranges: {{row.ranges}}</p>
      <p>colors: {{row.colors}}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["trialID", 'timePosition', 'result', 'block'],
  name: "scalar-plot",
};
</script>

<style>
.scalar-plot {
  width: 200px;
  height: 200px;
  background: white;
  color: black;
  margin-bottom: 1rem;
}

.plot-caption {
  margin: 0;
  padding: 0;
  text-align: center;
}
</style>
