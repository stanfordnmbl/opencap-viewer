<template>
  <div class="scalar-plot">
    <h2 class="h5 plot-caption">Scalar plot</h2>

    <p>trialID: {{trialID}}</p>
    <p>Lorem ipsum dolor sit amet...</p>
  </div>
</template>

<script>
export default {
  props: ["trialID"],
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
