<template>
  <v-app :style="{background: $vuetify.theme.themes.dark.background}">
    <v-app-bar
      app      
      dark>

      <router-link
        v-if="showLink"
        :to="{ name: 'SelectSession' }"
        class="logo-link">OpenCap</router-link>
      <h1
        v-else
        class="logo">OpenCap</h1>
      <v-spacer></v-spacer>

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
    </v-app-bar>

    <v-main>      
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'App',
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
.logo-link {
  font-size: 32px;
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
}

.logo {
  user-select: none;
}
</style>
