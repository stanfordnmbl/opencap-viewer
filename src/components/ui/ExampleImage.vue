<template>
  <div class="example-image d-flex flex-column">
    <div
      class="image"
      :style="getStyle">

      <div class="fade">
        <IconButton :role="good ? 'check' : 'cross'"/>
      </div>
    </div>
  </div>
</template>

<script>
import IconButton from './IconButton.vue'

export default {
  name: 'ExampleImage',
  components: {
    IconButton
  },
  props: {
    good: {
      type: Boolean,
      default: false
    },
    image: String,
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 200
    }
  },
  computed: {
    getStyle () {
      return {
        'background-image': `url(${this.image})`,
        width: `${this.width}px`,
        height: `${this.height}px`,
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.example-image {
  overflow: hidden;
  
  .image {
    position: relative;
    height: 200px;
    width: 200px;
    background-size: cover;
    background-position: center;

    .fade {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      div {
        position: absolute;
        right: 0;
        bottom: 0;
      }
    }
  }
}
</style>
