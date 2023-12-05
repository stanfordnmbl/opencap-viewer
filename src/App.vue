<template>
  <v-app :style="{background: $vuetify.theme.themes.dark.background}">
    <v-app-bar
      app      
      dark>

      <router-link
        v-if="showLink"
        :to="{ name: 'SelectSession' }">
          <img height="59px" class="logo" src="/images/opencap-logo-dark.png"/>
        </router-link>

      <router-link
      v-else
      :to="{ name: '#' }">
        <img height="59px" class="logo" src="/images/opencap-logo-dark.png"/>
      </router-link>
      <v-spacer></v-spacer>

      <QRCodeDialog/>

      <v-btn
        href="https://github.com/stanfordnmbl/opencap-core"
        target="_blank"
        text>
        <span class="mr-2">Find on GitHub</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn
        v-if="loggedIn"
        @click="logout"
        text>
        <span class="mr-2">LOGOUT</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>


    <profile-dropdown></profile-dropdown>

    </v-app-bar>

    <v-main>      
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import QRCodeDialog from './components/ui/QRCodeDialog.vue'
import ProfileDropdown from './components/ui/ProfileDropDown.vue';

export default {
  name: 'App',
  components: {
    QRCodeDialog,
    'profile-dropdown': ProfileDropdown},
  computed: {
    ...mapState({
      loggedIn: state => state.auth.loggedIn,
      verified: state => state.auth.verified,
      sessionTime: state => state.auth.sessionTime
    }),
    showLink () {
      return this.loggedIn && this.verified && this.$route.name !== 'SelectSession'
    }
  },
  watch: {
    $route () {
      this.cancelTimer()
      this.startTimer()
    }
  },
  data () {
    return {
      logoutTimer: null
    }
  },
  created () {
    this.startTimer()
  },
  beforeDestroy () {
    this.cancelTimer()
  },
  methods: {
    ...mapActions('auth', ['logout']),
    startTimer () {
      this.logoutTimer = window.setTimeout(this.logoutTimerHandler, this.sessionTime)
    },
    cancelTimer () {
      if (this.logoutTimer) {
        window.clearTimeout(this.logoutTimer)
      }
    },
    logoutTimerHandler () {
      // redirect to login and remove all info
      this.logout()
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  user-select: none;
  margin-top: 10px;
}
</style>
