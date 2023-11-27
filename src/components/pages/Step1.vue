<template>
  <MainLayout
    rightButton="Next"
    column
    :step="1"
    :rightDisabled="loading"
    @right="onNext">

    <v-card class="flex-grow-1 d-flex flex-column justify-center">
      <v-card-text class="d-flex flex-column align-center">

        <div class="d-flex step-1 align-center flex-wrap">
          <div class="d-flex flex-column flex-grow-1 justify-space-between my-1">
            <h1 class="my-4">1. Open the OpenCap app on your phone</h1>
            <h1 class="my-4">2. Scan the QR code</h1>
            <h1 class="my-4">3. Mount your phone vertically or horizontally (unlock portrait orientation) on a tripod</h1>
            <h1 class="my-4">4. Position the tripod and camera to capture the volume of interest</h1>
            <h1 class="my-4">5. Repeat 1-4 for all phones you want to connect</h1>
            <h1 class="my-4">6. Have the person practice the activity and verify that they are fully in view of at least 2 cameras</h1>
          </div>

          <div class="image-container qr-container d-flex align-center justify-center my-1">
            <v-progress-circular
              v-if="loading"
              indeterminate 
              color="grey" 
              size="32" 
              width="5"/>

            <img
              v-else
              class="w-100 h-100"
              :src="session.qrcode">
          </div>
        </div>

        <!--div class="cameras d-flex align-center justify-center mt-5">
          <v-text-field
            v-model="cameras"
            label="Connected cameras"
            class="cameras"/>
        </div-->
      </v-card-text>
    </v-card>
  </MainLayout>
</template>

<script>
import { mapMutations, mapActions, mapState } from 'vuex'
import { apiInfo } from "@/util/ErrorMessage.js";
import MainLayout from '@/layout/MainLayout'

export default {
  name: 'Step1',
  components: {
    MainLayout
  },
  data () {
    return {
      loading: true,
      cameras: 2
    }
  },
  async mounted () {
    apiInfo("We're experiencing issues with devices running on iOS 17.x. We're working on a fix. Please use devices running on iOS 16.x for now");
    if (this.$router.params != undefined) {
        await this.loadSession(this.$route.params.id)
    } else {
      try {
        this.clearAll()
        await this.initSession()
      } finally {
        this.loading = false
      }
    }
  },
  computed: {
    ...mapState({ 
      session: state => state.data.session
    })
  },
  methods: {
    ...mapMutations('data', ['clearAll', 'setStep1']),
    ...mapActions('data', ['initSession']),
    onNext () {
      this.setStep1({
        cameras: this.cameras
      })
      
      this.$router.push(`/${this.session.id}/step2`)
    }
  }
}
</script>

<style lang="scss" scoped>
.step-1 {
  width:100%;

  .qr-container {
    width: 200px;
    height: 200px;
    overflow: hidden;
  }
}

.cameras {
  width: 120px;
}
</style>
