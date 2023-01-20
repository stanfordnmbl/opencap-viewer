<template>
  <div
    class="main-layout d-flex flex-column pa-4"
    :class="{ 'fixed-height': fixedHeight }">

    <div
      class="content-wrapper flex-grow-1 d-flex"
      :class="{ 'flex-column': column }">
      <slot/>
    </div>

    <div class="navigation d-flex justify-space-between align-center mt-5 w-100">
      <div class="slot">
        <v-btn
          v-if="leftButton"
          @click="$emit('left')">
          {{ leftButton}}
        </v-btn>

        <slot
          v-else
          name="left"/>
      </div>

      <div class="slot d-flex justify-end">
        <v-btn
          v-if="rightButton"
          :disabled="rightDisabled || rightSpinner"
          @click="$emit('right')">

          <v-progress-circular
            v-if="rightSpinner"
            indeterminate
            class="mr-2" 
            color="grey" 
            size="14" 
            width="2"/>
          {{ rightButton }}
        </v-btn>

        <slot
          v-else
          name="right"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
      routes: [
        { title: 'Step 1', path: '/step1' },
        { title: 'Step 2', path: '/step2' },
        { title: 'Step 3', path: '/step3' },
        { title: 'Step 4', path: '/step4' },
        { title: 'Step 5', path: '/step5' }
      ]
    }
  },
  props: {
    leftButton: {
      type: String,
      default: ''
    },
    rightButton: {
      type: String,
      default: ''
    },
    rightDisabled: {
      type: Boolean,
      default: false
    },
    rightSpinner: {
      type: Boolean,
      default: false
    },
    column: {
      type: Boolean,
      default: false
    },
    step: Number,
    fixedHeight: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    page: {
      get () {
        return this.step
      },
      set (value) {
        if (this.step !== value) {
          this.$router.push({ name: `Step${value}` })
        }
      }
    }
  },
  methods: {
    current (index) {
      return this.routes[index] === this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: calc(100vh - 64px);

  &.fixed-height {
    height: calc(100vh - 64px);
    max-height: calc(100vh - 64px);
  }

  .content-wrapper {
    overflow-x: hidden;
  }

  .navigation {
    .slot {
      width: 150px;
    }
  }
}
</style>
