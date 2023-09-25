<template>
  <div class="scalar-plot">
    <h2 class="h5 plot-caption">{{block.headline}}</h2>

    <ul>
      <li v-for="(value, key) in values" :key="key">
        {{key}}: {{value}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    block: Object,
    values: Object
  },
  name: "scalar-plot"
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
