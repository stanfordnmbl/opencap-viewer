<template>
  <v-layout class="login-main" ma-0 pa-3 row justify-center align-center fill-height>
    <v-flex
      xs12 sm10 md8 lg6 xl4 pa-3
      class="d-flex flex-column align-stretch">

      <v-card>
        <v-card-text>
          <h3 class="white--text text-center">
            OpenCap is free for academic research and educational use
            (link <a href="https://www.opencap.ai/terms-conditions">Terms</a>).
            Please identify how you use / intend to use OpenCap:</h3>

          <v-radio-group v-model="institutionalUse">
            <v-radio label="Patient care" value="patient_care"></v-radio>
            <v-radio label="Sports performance assessment" value="sports_performance_assessment"></v-radio>
            <v-radio label="Use in a company or in collaboration with a company" value="use_in_company"></v-radio>
            <v-radio label="Research at an academic institution" value="research_at_academic"></v-radio>
            <v-radio label="Teaching at an academic institution" value="teaching_at_academic"></v-radio>
            <v-radio label="Other non-commercial activity" value="other_non_commercial"></v-radio>
          </v-radio-group>

          <v-alert type="info" v-if="notPermitted">
            This use is not a permitted use of OpenCap, please contact Model Health
            (<a href="mailto:info@modelhealth.io">info@modelhealth.io</a>) to purchase a license.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="submit" :disabled="institutionalUse == '' || notPermitted">Submit</v-btn>
        </v-card-actions>
      </v-card>


    </v-flex>
  </v-layout>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import { apiError } from '@/util/ErrorMessage.js'
import axios from "axios";

export default {
  name: 'License',
  data () {
    return {
      institutionalUse: '',
    }
  },
  computed: {
    notPermitted () {
      return this.institutionalUse === 'patient_care' || this.institutionalUse === 'sports_performance_assessment' || this.institutionalUse === 'use_in_company'
    },
  },
  mounted() {
    this.institutionalUse = localStorage.getItem('institutional_use')
  },
  methods: {
    submit () {
      axios.post('/set-institutional-use/', {
        institutional_use: this.institutionalUse,
      }).then((response) => {
        localStorage.setItem('institutional_use', this.institutionalUse)
        this.$router.push({name: 'Login'})
      }).catch((error) => {
        apiError(error)
      })
    },
  }
}
</script>
