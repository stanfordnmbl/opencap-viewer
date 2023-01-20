<template>
  <v-layout class="login-main" ma-0 pa-3 row justify-center align-center fill-height>
    <v-flex
      xs12 sm6 md4 lg3 xl2 pa-3
      class="d-flex flex-column align-stretch">

      <h1 class="white--text text-center">E-mail verification code</h1>
      <p>
        We've just sent you a 6-digit verification code by e-mail. Please copy paste the code below to access the website. If you don't see the e-mail in your mailbox, please check the spam folder.
      </p>

      <ValidationObserver
        tag="div"
        class="d-flex flex-column"
        ref="observer"
        v-slot="{ invalid }">
        
        <ValidationProvider
          rules="required"
          v-slot="{ errors }"
          name="Verification code"
          slim>

          <v-text-field
            label="Verification code" 
            v-model="otp_token"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"/>
        </ValidationProvider>

        <v-btn
          type="submit" 
          class="white--text mx-0 align-self-center"
          :disabled="(submitted && invalid) || loading"
          @click="onLogin()">Verify</v-btn>            
      </ValidationObserver>

      <!--router-link
        class="mt-4 text-center"
        :to="{ name: 'Register' }">Don't have an account yet? Sign Up</router-link-->
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { apiError } from '@/util/ErrorMessage.js'

export default {
  name: 'Verify',
  data () {
    return {
      loading: false,
      submitted: false,
      otp_token: ''
    }
  },
  computed: {
    ...mapState({
      sessions: state => state.data.sessions
    })
  },
  methods: {
    ...mapActions('auth', ['verify']),
    ...mapActions('data', ['loadExistingSessions']),
    async onLogin () {
      this.loading = true

      try {
        this.submitted = true

        if (await this.$refs.observer.validate()) {
          await this.verify({
            otp_token: this.otp_token, 
          })

          try {
            await this.loadExistingSessions(true)           
          } catch (error) {
            apiError(error)
            this.$router.push({ name: 'Step1' })
          }
        } else {
          if (this.password) {
            this.password = ''
            this.$refs.observer.reset()
          }
        }
      } catch (error) {
        apiError(error, 'logging in')
      }

      this.loading = false
    }
  }
}
</script>

<style lang="scss">
.login-main {
  button {
    width: 200px;
  }

  a {
    text-decoration: none !important;

    &:hover {
      text-decoration: underline !important;
    }
  }
}
</style>
