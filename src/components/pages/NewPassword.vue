<template>
    <v-layout class="login-main" ma-0 pa-3 row justify-center align-center fill-height>
      <v-flex
        xs12 sm6 md4 lg3 xl2 pa-3
        class="wrapper-box d-flex flex-column align-stretch scroll-y">
  
        <h1 class="white--text text-center">New Password</h1>
     
        <span 
        class="text-center mt-2">Please, insert a new password.</span>
      
        <ValidationObserver
        tag="div"
        class="d-flex flex-column"
        ref="observer"
        v-slot="{ invalid }">
        
        <ValidationProvider
          rules="required|min:20"
          v-slot="{ errors }"
          name="Password"
          vid="password"
        >
          <v-text-field
            v-model="password"
            label="Password (20+ characters)"
            type="password"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>

        <ValidationProvider
          rules="required|confirmed:password"
          v-slot="{ errors }"
          name="Confirm password"
        >
          <v-text-field
            v-model="confirmPassword"
            label="Confirm password"
            type="password"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>
        <v-btn
          type="submit" 
          class="white--text mx-0 align-self-center"
          :disabled="(submitted && invalid) || loading"
          @click="onNewPassword()">Submit</v-btn>            
      </ValidationObserver>

        <router-link class="mt-4 text-center" :to="{ name: 'Login' }"
          >Back to Login</router-link
        >
        
      </v-flex>
    </v-layout>
  </template>


<script>
import { mapActions, mapState } from "vuex";
import { apiSuccess, apiError } from "@/util/ErrorMessage.js";

export default {
  name: "Register",
  data() {
    return {
      loading: false,
      submitted: false,
      password: "",
      confirmPassword: ""
    };
  },
  methods: {
    ...mapActions("auth", ["new_password"]),
    async onNewPassword() {
      this.loading = true;

      this.submitted = true;

      if (await this.$refs.observer.validate()) {

        var parts = window.location.pathname.split('/');
        var token = ""
        if(window.location.pathname.endsWith("/")){
          parts.pop()
          token = parts.pop()
        } else {
          token = parts.pop()
        }

        var response = await this.new_password({
          token: token,
          password: this.password
        });

        if (response.data.message == "Success") {
          apiSuccess("Password changed successfully.");
          this.$router.push({ name: 'Login'})
        } else {
          apiError(response.data.message);
          this.$router.push({ name: 'ResetPassword'})
        }

      }

      this.loading = false;
    },
  },
}
</script>

<style lang="scss">


</style>