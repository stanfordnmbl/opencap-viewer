<template>
  <MainLayout
    column
    leftButton="Back"
    rightButton="Calibrate"
    :step="2"
    :rightDisabled="busy"
    @left="$router.push(`/${session.id}/step1`)"
    @right="onNext">

    <v-card class="step-2-1 flex-grow-1">
      <v-card-text class="d-flex align-center">
        <p>{{ n_videos_uploaded }} of {{ n_cameras_connected }} videos uploaded.</p>
      </v-card-text>
    </v-card>

    <v-card class="step-2-2 mt-4 flex-grow-1">
      <v-card-title class="justify-center">
        Place a checkerboard in the scene
      </v-card-title>

      <v-card-text class="d-flex align-center">
        <ul class="flex-grow-1">
          <li>It should be visible by all cameras (nothing in the way of cameras' view when hitting Calibrate)</li>
          <li>It should be horizontal (longer side on the floor)</li>
          <li>It should be perpendicular to the floor (not lying on the floor)</li>         
        </ul>

        <div class="image-container pa-3">
          <img src="/images/checkerboard-placement.png"/>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="step-2-2 mt-4 flex-grow-1">
      <v-card-title class="justify-center">
        Provide the checkerboard details
      </v-card-title>

      <v-card-text class="d-flex">
        <div class="d-flex flex-grow-1 align-center inputs">
          <v-text-field
            v-model="rows"
            label="Rows"
            class="mr-3"/>

          <v-text-field
            v-model="cols"
            label="Columns"
            class="mr-3"/>

          <v-text-field
            v-model="squareSize"
            label="Square size (mm)"/>
        </div>

        <div class="image-container pa-3">
          <img src="/images/checkerboard_45.png"/>
        </div>
      </v-card-text>
    </v-card>

  </MainLayout>
</template>

<script>
import axios from 'axios'
import {mapActions, mapMutations, mapState} from 'vuex'
import { apiError, apiSuccess, apiErrorRes, apiInfo} from '@/util/ErrorMessage.js'
import MainLayout from '@/layout/MainLayout'

export default {
  name: 'Step2',
  components: {
    MainLayout
  },
  data () {
    return {
      rows: 4,
      cols: 5,
      squareSize: 35,
      busy: false,
      imgs: null,
      lastPolledStatus: "",
      n_cameras_connected: 0,
      n_videos_uploaded: 0
    }
  },
  computed: {
    ...mapState({ 
      session: state => state.data.session,
      trialId: state => state.data.trialId
    })
  },
  mounted () {
      this.loadSession(this.$route.params.id)
  },
  methods: {
    ...mapMutations('data', ['setStep2', 'setStep3']),
    ...mapActions('data', ['loadSession']),
    async onNext () {
      if (this.imgs) {
        this.$router.push(`/${this.session.id}/step4`)
      } else {
        this.lastPolledStatus = "";
        // Record press
        this.busy = true
        this.setStep2({
          rows: this.rows,
          cols: this.cols,
          squareSize: this.squareSize
        })
        try {
          const resUpdate = await axios.get(`/sessions/${this.session.id}/set_metadata/`, {
            params: {
              cb_rows: this.rows,
              cb_cols: this.cols,
              cb_square: this.squareSize,
              cb_placement: "backWall"
              }
            })

          const res = await axios.get(`/sessions/${this.session.id}/record/`, {
            params: {
              name: 'calibration',
            }
          })
          this.setStep3(res.data.id)
          this.pollStatus()
        } catch (error) {
          apiError(error)
        }
      }
    },
    async pollStatus() {
      try {
        const res = await axios.get(`/sessions/${this.session.id}/calibration_img/`)
        switch (res.data.status) {
          case "done": {
            this.$toasted.clear()

            const resCalibratedCameras = await axios.get(`/sessions/${this.$route.params.id}/get_n_calibrated_cameras/`, {})

            this.n_calibrated_cameras = resCalibratedCameras.data.data

            if (this.n_calibrated_cameras < 2) {
              apiError("Only 1 camera connected to the session and 2+ cameras are required, please re-pair cameras using qr code at top of page.");
              this.busy = false
            } else {
              apiInfo(this.n_calibrated_cameras + " cameras calibrated successfully.", 5000);
              this.$router.push(`/${this.session.id}/step4`)
            }
            break;
          }
          case "error": {
            const res_trial = await axios.get(`/trials/${this.trialId}/`)
            this.$toasted.clear()
            apiErrorRes(res_trial, 'Finished with error')
            this.busy = false;

            break;

          }
          default: {
            if (
              res.data.status === "processing" &&
              res.data.status !== this.lastPolledStatus
            ) {
              const resCalibratedCameras = await axios.get(`/sessions/${this.$route.params.id}/get_n_calibrated_cameras/`, {})

              this.n_calibrated_cameras = resCalibratedCameras.data.data

              if (this.n_calibrated_cameras < 2) {
                apiError("Only 1 camera connected to the session and 2+ cameras are required, please re-pair cameras using qr code at top of page.");
                this.busy = false
              } else {
                apiInfo("Processing.");
              }
            }
            this.lastPolledStatus = res.data.status;
            window.setTimeout(this.pollStatus, 1000);
            break;
          }
        }

        // Get n_cameras_connected.
        const res_status = await axios.get(`/sessions/${this.session.id}/status/`, {})

        this.n_videos_uploaded = res_status.data.n_videos_uploaded
        this.n_cameras_connected = res_status.data.n_cameras_connected
      } catch (error) {
        apiError(error);
      }
    },
  }
}
</script>

<style lang="scss">
.step-2-1 {
  li {
    font-size: 24px;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }
}

.step-2-2 {
  .inputs {
    > * {
      flex: 0 0 150px;
    }
  }
}
</style>