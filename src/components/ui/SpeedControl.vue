<template>
  <div class="speed-control d-flex justify-center">
    <div
      v-for="(s, index) in speeds"
      :key="index"
      class="speed"
      :class="{ selected: s.value === value }"
      @click="$emit('input', s.value)">
      {{ s.name }}
    </div>
  </div>  
</template>

<script>
export default {
  name: 'SpeedControl',
  props: {
    value: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      speeds: [
        { name: '0.1x', value: .1 },
        { name: '0.25x', value: .25 },
        { name: '0.5x', value: .5 },
        { name: '0.75x', value: .75 },
        { name: '1x', value: 1 },
        { name: '2x', value: 2 }
      ]
    }
  },
}
</script>

<style lang="scss">
.speed-control {
  .speed {
    font-size: 12px;
    padding: 2px 4px;
    border-radius: 2px;
    cursor: pointer;

    &.selected {
      background-color: white;
      color: black;
      cursor: default;
    }
  }
}
</style>
