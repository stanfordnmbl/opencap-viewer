<template>
  <div class="approve-image d-flex flex-column mb-1">
    <div
      class="image"
      :style="getStyle">

      <div
        v-if="value !== false"
        class="fade">
        <v-btn @click="$emit('check', false)">UNDO</v-btn>
      </div>
    </div>

    <div class="buttons mt-1 d-flex justify-center">
      <template v-if="value === false">
        <IconButton
          role="check"
          class="mr-1"
          @click="onCheck()"/>

        <IconButton
          role="cross"
          @click="onCancel()"/>
      </template>
    </div>
  </div>
</template>

<script>
import IconButton from './IconButton.vue'

export default {
  name: 'ApproveImage',
  components: {
    IconButton
  },
  props: {
    value: [Boolean, Number],
    images: Array
  },
  data () {
    return {
      image: this.value === false ? 0 : this.value
    }
  },
  computed: {
    getStyle () {
      return {
        'background-image': `url(${this.images[this.image]})`
      }
    }
  },
  methods: {
    onCheck () {
      this.$emit('check', this.image)
    },
    onCancel () {
      if (this.image === 0) {
        this.image = 1
      } else {
        this.$emit('cancel')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.approve-image {
  overflow: hidden;
  
  .image {
    position: relative;
    height: 200px;
    background-size: stretch;
    background-position: center;

    .fade {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, .2);

      button {
        right: 0;
        bottom: 0;
      }
    }
  }

  .buttons {
    height: 24px;
  }
}
</style>
