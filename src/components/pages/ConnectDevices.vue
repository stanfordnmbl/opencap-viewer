<template>
  <MainLayout
    column
    :step="1"
    :rightDisabled="loading">

    <!-- Custom right section with two buttons -->
    <template v-slot:right>
      <v-btn
        v-if="hasMonoAccess"
        class="mr-2"
        :disabled="loading"
        @click="skipToSession">
        Next to monocular
      </v-btn>
      <v-btn
        :disabled="loading"
        @click="onNext">
        Next
      </v-btn>
    </template>

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
    hasMonoAccess() {
      const allowedUsers = ['selimgilon', 'suhlrich', 'antoine'];
      const currentUser = this.username || localStorage.getItem('auth_user');
      return allowedUsers.includes(currentUser);
    },
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
      if (!this.hasMonoAccess) {
        apiError("This feature is restricted.");
        return;
      }
      clearToastMessages();
      this.setConnectDevices({
        cameras: this.cameras
      })
      this.$router.push(`/${this.session.id}/neutral`);
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
