<template>
  <MainLayout
    column
    :step="1"
    :fixedHeight="false"
    :rightDisabled="loading">

    <!-- Custom right section with two buttons -->
    <template v-slot:right>
      <div class="d-none"><!-- Hiding default right buttons positioning --></div>
    </template>

    <div class="connect-devices-wrapper">
      <v-card class="connect-devices-card">
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
        </v-card-text>
      </v-card>
      
      <!-- Custom navigation buttons positioned below the card -->
      <div class="custom-navigation d-flex justify-end mt-4">
        <v-btn
          class="mr-2 large-nav-btn"
          :disabled="loading"
          min-width="250"
          @click="skipToSession">
          Next, with 1 camera
        </v-btn>
        <v-btn
          class="large-nav-btn"
          :disabled="loading"
          min-width="250"
          @click="onNext">
          Next, with 2+ cameras
        </v-btn>
      </div>
    </div>
  </MainLayout>
</template>

<script>
import { mapMutations, mapActions, mapState } from 'vuex'
import { apiInfo, clearToastMessages, apiError } from "@/util/ErrorMessage.js";
import MainLayout from '@/layout/MainLayout'

export default {
  name: 'ConnectDevices',
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
    apiInfo("The iOS app is now available on the App Store. Please upgrade.", 20000, {text : "Go to App Store", onClick : () => {window.open("https://apps.apple.com/us/app/opencap/id1630513242", "_blank");}});
    if (this.$route.params && this.$route.params.id) {
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
      session: state => state.data.session,
      username: state => state.auth.username,
    }),
  },
  methods: {
    ...mapMutations('data', ['clearAll', 'setConnectDevices']),
    ...mapActions('data', ['initSession', 'loadSession']),
    onNext () {
      clearToastMessages();
      this.setConnectDevices({
        cameras: this.cameras
      })
      this.$router.push(`/${this.session.id}/calibration`)
    },
    skipToSession() {
      clearToastMessages();
      this.setConnectDevices({
        cameras: this.cameras
      })
      this.$router.push({ path: `/${this.session.id}/neutral`, query: { isMono: 'true' } });
    }
  }
}
</script>

<style lang="scss" scoped>
.connect-devices-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.connect-devices-card {
  flex: 1;
  overflow-y: auto;
}

.step-1 {
  width: 100%;

  .qr-container {
    width: 200px;
    height: 200px;
    overflow: hidden;
  }
}

.cameras {
  width: 120px;
}

.custom-navigation {
  width: 100%;
  margin-top: 16px;
  padding-bottom: 16px;
  position: sticky;
  bottom: 0;
}
</style>
