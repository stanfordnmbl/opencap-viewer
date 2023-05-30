<template>
  <MainLayout
    leftButton="Back"
    rightButton="Confirm"
    fixedHeight
    :step="3"
    :rightDisabled="nextDisabled"
    @left="onBack"
    @right="onNext">

    <v-card class="step-3-1 d-flex flex-column">
      <v-card-text class="d-flex flex-column w-100 flex-grow-1">
        <span class="sub-header text-center">Verify camera calibration</span>
        <span class="text-center mb-2">Press <IconButton role="check" inline/> to accept or <IconButton role="cross" inline/> to reject each camera's calibration image.</span>

        <div
          v-if="images.length > 0"
          style="overflow-y: auto"
          class="calibration-image-container pa-3 d-flex flex-wrap flex-grow-1">
          
          <ApproveImage
            v-for="(el, index) in images"
            :value="results[index]"
            :key="`img${index}`"
            :images="el"            
            class="w-50"
            @cancel="onBack(true)"
            @check="$set(results, index, $event)"/>
        </div>        

        <div
          v-else
          class="flex-grow-1 d-flex align-center justify-center">
          <v-progress-circular            
            indeterminate 
            color="grey" 
            size="32" 
            width="5"/>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="step-3-2 ml-4">
      <v-card-text class="d-flex align-center flex-column">
        <span class="sub-header">Well calibrated checkerboards</span>

        <div class="d-flex justify-content-evenly w-100">
          <ExampleImage image="/images/calibration-example/top_left.jpg" good/>
          <ExampleImage image="/images/calibration-example/top_right.jpg" good/>
        </div>

        <span class="mt-3 image-note">Black-to-black corners have light blue dots on them</span>
        <span class="mt-2 mb-3 image-note">The dark blue axis is pointing <b>into the board</b></span>

        <span class="sub-header">Incorrectly calibrated checkerboard</span>

        <div class="d-flex justify-content-evenly w-100">
          <div class="d-flex flex-column align-center">
            <ExampleImage image="/images/calibration-example/bottom_left.jpg"/>
            <span class="mt-2 image-note">Blue axis out of the board</span>
          </div>

          <div class="d-flex flex-column align-center">
            <ExampleImage image="/images/calibration-example/bottom_middle.jpg"/>
            <span class="mt-2 image-note">Blue axis out of the board</span>
          </div>

          <div class="d-flex flex-column align-center">
            <ExampleImage image="/images/calibration-example/bottom_right.jpg"/>
            <span class="mt-2 image-note">Light blue dots not on corners</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </MainLayout>
</template>

<script>
import axios from 'axios'
import { apiError, apiErrorRes } from '@/util/ErrorMessage.js'
import {mapActions, mapState} from 'vuex'
import MainLayout from '@/layout/MainLayout'
import ApproveImage from '@/components/ui/ApproveImage'
import ExampleImage from '@/components/ui/ExampleImage'
import IconButton from '@/components/ui/IconButton'

export default {
  name: 'Step3',
  components: {
    MainLayout,
    ApproveImage,
    ExampleImage,
    IconButton
  },
  data () {
    return {
      img: [],
      timeout: null,

      //
      images: [],
      results: []
    }
  },
  computed: {
    ...mapState({
      session: state => state.data.session,
      trialId: state => state.data.trialId
    }),
    nextDisabled () {
      return this.results.length > 0 && this.results.some(item => item === false)
    }
  },
  async mounted () {
    this.startPoll()
    this.loadSession(this.$route.params.id)
  },
  methods: {
    ...mapActions('data', ['loadSession']),
    startPoll () {
      this.statusPoll = window.setTimeout(async () => {
        const res = await axios.get(`/sessions/${this.session.id}/calibration_img/`)

        if (res.data.status === 'done' || res.data.status === 'error') {
          // Show error if any
          if (res.data.status === 'error') {
            const res_trial = await axios.get(`/trials/${this.trialId}/`)
            apiErrorRes(res_trial, 'Finished with error')
          }
    
          console.log(res)
          // process result
          const size = res.data.img.length / 2
          let intermediary = Array.from(Array(size), () => ['', ''])    

          res.data.img.forEach(item => {
            const start = item.indexOf('_')
            const alt = item.indexOf('_', start+1)
            if (alt > 0) {
              let num = Number(item.slice(alt+4,alt+5))
              intermediary[num][1] = item
            } else {
              let num = Number(item.slice(start+4,start+5))
              intermediary[num][0] = item
            }
          })
          this.results = Array(size).fill(false)
          this.images = intermediary   
        } else {
          this.startPoll()
        }
      }, 500)
    },
    async onNext () {
      const data = this.results.reduce((acc, value, index) => {
        acc[`Cam${index}`] = value
        return acc
      }, {})

      try {
        await axios.post(`/sessions/${this.session.id}/calibration/`, data)
        this.$router.push(`/${this.session.id}/step4`)
      } catch (error) {
        apiError(error)
      }
    },
    onBack (message = false) {
      if (message) {
        apiError('You rejected two images from the same camera, which means the calibration has failed for this camera. You will now be redirected to the calibration step. Please visit opencap.ai/best-practices and opencap.ai/troubleshooting for tips on calibration. Make sure the checkerboard is <5m from each camera.')
      }

      this.$router.push(`/${this.session.id}/step2`)
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/scss/padded-vscroll-mixin.scss";

.step-3-1 {
  flex: 0 0 50%;
  height: 100%;

  .v-card__text {
    overflow-y: auto;
  }

  .calibration-image-container {
    overflow: auto;
    @include padded-vscroll-bar();

    background-color: white;
    border-radius: 8px;
   
      div:nth-child(odd) > .image {        
        //background-position: right;
      }

      div:nth-child(even) > .image {
        //background-position: left;
      }
    
  }
}

.step-3-2 {
  flex-grow: 1;
  height: 100%;

  .image-note {
    font-size: 16px;
  }
}
</style>
