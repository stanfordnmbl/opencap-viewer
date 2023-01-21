<template>
  <v-layout
    class="login-main"
    ma-0
    pa-3
    row
    justify-center
    align-center
    fill-height
  >
    <v-flex
      xs12
      sm6
      md4
      lg3
      xl2
      pa-3
      class="wrapper-box d-flex flex-column align-stretch scroll-y"
    >
      <h1 class="white--text text-center">Register</h1>

      <ValidationObserver
        tag="div"
        class="d-flex flex-column"
        ref="observer"
        v-slot="{ invalid }"
      >
        <ValidationProvider rules="required" v-slot="{ errors }" name="Login">
          <v-text-field
            label="Username"
            v-model="username"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>

        <ValidationProvider
          rules="required"
          v-slot="{ errors }"
          name="First name"
        >
          <v-text-field
            label="First name"
            v-model="first_name"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>

        <ValidationProvider
          rules="required"
          v-slot="{ errors }"
          name="Last name"
        >
          <v-text-field
            label="Last name"
            v-model="last_name"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>

        <ValidationProvider
          rules="required|email"
          v-slot="{ errors }"
          name="Email"
        >
          <v-text-field
            label="Email (will be used for two-factor authentication)"
            v-model="email"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>

        <ValidationProvider
          rules="required"
          v-slot="{ errors }"
          name="Institution"
        >
          <v-text-field
            label="Institution"
            v-model="institution"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>

        <ValidationProvider rules="required" v-slot="{ errors }" name="Reason">
          <v-text-field
            label="Reason for use"
            v-model="reason"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
          />
        </ValidationProvider>

        <ValidationProvider
          rules="required|min:20"
          v-slot="{ errors }"
          name="Password"
          vid="password"
        >
          <v-text-field
            v-model="password"
            label="Password (20+ characters)"
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
            :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show_password ? 'text' : 'password'"
            @click:append="show_password = !show_password"
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
            dark
            :error="errors.length > 0"
            :error-messages="errors[0]"
            :append-icon="show_confirm_password ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show_confirm_password ? 'text' : 'password'"
            @click:append="show_confirm_password = !show_confirm_password"
          />
        </ValidationProvider>

        <v-checkbox
          v-model="newsletter"
          label="Sign up to receive our newsletter"
        ></v-checkbox>

        <v-btn
          type="submit"
          class="white--text mx-0 align-self-center"
          :disabled="(submitted && invalid) || loading"
          @click="onRegister()"
          >Register</v-btn
        >
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
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      institution: "",
      reason: "",
      password: "",
      confirmPassword: "",
      newsletter: true,
      show_password: false,
      show_confirm_password: false,
    };
  },
  computed: {
    ...mapState({
      sessions: (state) => state.data.sessions,
    }),
  },
  methods: {
    ...mapActions("auth", ["register"]),
    async onRegister() {
      this.loading = true;

      try {
        this.submitted = true;

        if (await this.$refs.observer.validate()) {
          await this.register({
            username: this.username,
            email: this.email,
            password: this.password,
            institution: this.institution,
            reason: this.reason,
            first_name: this.first_name,
            last_name: this.last_name,
            newsletter: this.newsletter,
          });

          apiSuccess("New user successfully created");

          this.$router.push({ name: "Login" });
        }
      } catch (error) {
        apiError(error, "registering new user");
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.login-main {
  button {
    width: 200px;
  }
  .wrapper-box {
    max-height: calc(100vh - 90px);
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
