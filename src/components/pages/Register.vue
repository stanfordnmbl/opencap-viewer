<template>
  
      <div id="container" class="container d-flex justify-content-center text-center">
        <div class="w-50 p-3 mx-auto">
          <h1 class="white--text text-center col-md-12">Register</h1>

            <ValidationObserver
              tag="div"
              class="d-flex flex-column"
              ref="observer"
              v-slot="{ invalid }">

              <div class="row">

                <div class="col-md-12">
                  <div class="form-outline">
                      <ValidationProvider rules="required" v-slot="{ errors }" name="Login">
                        <v-text-field
                          label="Username"
                          v-model="username"
                          class="ma-0"
                          dark
                          :error="errors.length > 0"
                          :error-messages="errors[0]"
                        />
                      </ValidationProvider>
                  </div>
                </div>

              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="form-outline">
                    <ValidationProvider
                      rules="required"
                      v-slot="{ errors }"
                      name="First name">
                      <v-text-field
                        label="First name"
                        v-model="first_name"
                        class="ma-0"
                        dark
                        :error="errors.length > 0"
                        :error-messages="errors[0]"/>
                    </ValidationProvider>
                  </div>
                </div>

                <div class="col-md-6">

                  <div class="form-outline">
                    <ValidationProvider
                      rules="required"
                      v-slot="{ errors }"
                      name="Last name">
                      <v-text-field
                        label="Last name"
                        v-model="last_name"
                        class="ma-0"
                        dark
                        :error="errors.length > 0"
                        :error-messages="errors[0]"/>
                    </ValidationProvider>

                  </div>

                </div>
              </div>

              <div class="row">
                <div class="col-md-6 d-flex align-items-center">
                  <div class="form-outline datepicker w-100">
                    <ValidationProvider
                      rules="required|email"
                      v-slot="{ errors }"
                      name="Email">
                      <v-text-field
                        label="Email (will be used for two-factor authentication)"
                        v-model="email"
                        class="ma-0"
                        dark
                        :error="errors.length > 0"
                        :error-messages="errors[0]"/>
                    </ValidationProvider>
                  </div>

                </div>
                <div class="col-md-6">
                 <vue-country-dropdown
                    ref="vcd"
                    @onSelect="onSelectCountry"
                    :preferredCountries="['US']"
                    :defaultCountry="'US'"
                    :immediateCallSelectEvent="true"
                    :enabledFlags="true"
                    :enabledCountryCode="false"
                    :showNameInput="true">
                  </vue-country-dropdown>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 pb-2">

                  <div class="form-outline">
                    <ValidationProvider
                      rules="required"
                      v-slot="{ errors }"
                      name="Institution">
                      <v-text-field
                        label="Institution"
                        v-model="institution"
                        class="ma-0"
                        dark
                        :error="errors.length > 0"
                        :error-messages="errors[0]"/>
                    </ValidationProvider>
                  </div>

                </div>
                <div class="col-md-6 pb-2">

                  <div class="form-outline">
                    <ValidationProvider
                      rules="required"
                      v-slot="{ errors }"
                      name="Profession">
                      <v-text-field
                        label="Profession"
                        v-model="profession"
                        class="ma-0"
                        dark
                        :error="errors.length > 0"
                        :error-messages="errors[0]"/>
                    </ValidationProvider>
                  </div>

                </div>
              </div>

              <div class="row">
                <div class="col-12">
                  <ValidationProvider rules="required" v-slot="{ errors }" name="Reason">
                  <v-text-field
                    label="Reason for use"
                    v-model="reason"
                    class="ma-0"
                    dark
                    :error="errors.length > 0"
                    :error-messages="errors[0]"/>
                </ValidationProvider>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 pb-2">

                  <div class="form-outline">
                    <ValidationProvider
                      rules="required|min:20"
                      v-slot="{ errors }"
                      name="Password"
                      vid="password"
                    >
                      <v-text-field
                        v-model="password"
                        label="Password (20+ characters)"
                        class="ma-0"
                        dark
                        :error="errors.length > 0"
                        :error-messages="errors[0]"
                        :append-icon="show_password ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="show_password ? 'text' : 'password'"
                        @click:append="show_password = !show_password"/>
                    </ValidationProvider>
                  </div>

                </div>
                <div class="col-md-6 pb-2">

                  <div class="form-outline">
                    <ValidationProvider
                      rules="required|confirmed:password"
                      v-slot="{ errors }"
                      name="Confirm password">
                      <v-text-field
                        v-model="confirmPassword"
                        label="Confirm password"
                        class="ma-0"
                        dark
                        :error="errors.length > 0"
                        :error-messages="errors[0]"
                        :append-icon="show_confirm_password ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="show_confirm_password ? 'text' : 'password'"
                        @click:append="show_confirm_password = !show_confirm_password"/>
                    </ValidationProvider>
                  </div>

                </div>
              </div>

              <div class="row">
                <div class="col-12">
                  <v-checkbox
                    v-model="newsletter"
                    label="Sign up to receive our newsletter"
                  ></v-checkbox>
                </div>
              </div>

              <div class="pt-2">
                <v-btn
                  type="submit"
                  class="white--text mx-0 align-self-center mb-6"
                  :disabled="(submitted && invalid) || loading"
                  @click="onRegister()"
                  >Register</v-btn
                >
              </div>
            </ValidationObserver>

            <router-link class="text-center mt-6" :to="{ name: 'Login' }"
              >Back to Login</router-link
            >
        </div>
      </div>

</template>

<script>
import { mapActions, mapState } from "vuex";
import { apiSuccess, apiError } from "@/util/ErrorMessage.js";
import VueCountryDropdown from 'vue-country-dropdown'

export default {
  name: "Register",
  components: {
    VueCountryDropdown
  },
  data() {
    return {
      loading: false,
      submitted: false,
      username: "",
      first_name: "",
      last_name: "",
      country: "",
      email: "",
      institution: "",
      profession: "",
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
            country: this.country,
            profession: this.profession
          });

          apiSuccess("New user successfully created");

          this.$router.push({ name: "Login" });
        }
      } catch (error) {
        apiError(error, "registering new user");
      }

      this.loading = false;
    },
    onSelectCountry({name, iso2, dialCode}) {
        this.country = name;
    },
  },
};
</script>

<style lang="scss">
.container {
  overflow-y: scroll;
  max-height: calc(100vh - 90px);
  -ms-overflow-style: none; // /hide in Internet Explorer.
  scrollbar-width: none; // Hide in Firefox.
}
.container::-webkit-scrollbar{
  display: none; // Hide in chrome, safari and edge.
}
button {
  width: 200px;
}

.vue-country-select .country-name {
  color: hsla(0,0%,100%,.7) !important;
}
div.dropdown.open {
  background-color: black !important;
}
.vue-country-select .country-name:hover {
  color: hsla(0,0%,100%,.7) !important;
}
.dropdown:hover {
  background-color: black !important;
}
li.dropdown-item {
  background-color: black !important;
}
li.dropdown-item:hover {
  background-color: rgb(46, 46, 46) !important;
}
li.dropdown-item > strong {
  font-weight: normal !important;
  color: hsla(0,0%,100%,.7);
}
.vue-country-select {
  width: 100%;
  border-color: hsla(0,0%,100%,.7) !important;
}
.vue-country-select:hover {
  width: 100%;
  border-color: white !important;
}
.vue-country-select:focus {
  width: 100%;
  border-color: white !important;
}
.vue-country-select:active {
  width: 100%;
  border-color: white !important;
}
li.dropdown-item > span {
  display: none;
}
</style>
