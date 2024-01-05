<template>
  <div class="d-flex flex-column">
    <div class="pa-2 d-flex">
      <div class="container">


        <div v-if="userExist">


        <div v-if="!editing_profile" class="row">
          <div class="col-lg-4">
            <v-card class="d-flex align-center justify-center pb-4">
              <v-row align="center" justify="center">
                <v-col align="center" justify="center">
                  <v-img
                    max-width="50%"
                    src="/images/Default_pfp.svg"
                    alt="Profile Picture"
                    class="rounded-circle img-fluid mt-4">
                  </v-img>
                  <button @click="handleShareProfileClick">
                    <v-card-title align="center" justify="center" class="justify-center pb-0">
                      {{ username_param }} <i class="mdi mdi-share ml-1 me-1 vertical-middle"></i>
                    </v-card-title>
                  </button>
                  <v-card-text class="pa-1">
                    {{institution}}
                  </v-card-text>
                  <v-card-text class="pa-1">
                    <a :href="'mailto:' + email" target="_blank" class="link-primary mb-1" rel="noreferrer">
                      <p class="mb-1">
                        <i class="mdi mdi-email-box me-1 vertical-middle"></i>
                          Contact
                      </p>
                    </a>
                  </v-card-text>
                  <v-btn v-if="editable" class="my-4" @click="handleEditProfile">
                    Edit Profile
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </div>

          <div class="col-lg-8">
            <v-card class="d-flex align-center justify-center">
              <v-card-text>

                <v-row>
                  <v-col class="col-lg-4">
                    <strong>
                      <i class="mdi mdi-account me-1 vertical-middle"></i>
                      Full Name
                    </strong>
                  </v-col>
                  <v-col class="col-lg-8">{{ first_name }} {{ last_name }} </v-col>
                </v-row>

                <v-row v-if="profession">
                  <v-col class="col-lg-4">
                    <strong>
                      <i class="mdi mdi-briefcase me-1 vertical-middle"></i>
                      Profession
                    </strong>
                  </v-col>
                  <v-col class="col-lg-8">{{ profession }} </v-col>
                </v-row>

                <v-row v-if="website">
                  <v-col class="col-lg-4">
                    <strong>
                      <i class="mdi mdi-web me-1 vertical-middle"></i>
                      Personal Website
                    </strong>
                  </v-col>
                  <v-col class="col-lg-8">
                    <a :href="website" target="_blank">
                      {{ website }}
                    </a>
                  </v-col>
                </v-row>

                <v-row v-if="reason_of_use">
                  <v-col class="col-lg-4">
                    <strong>
                      <i class="mdi mdi-information me-1 vertical-middle"></i>
                      Reason of use
                    </strong>
                  </v-col>
                  <v-col class="col-lg-8">{{ reason_of_use }} </v-col>
                </v-row>

                <v-row v-if="country">
                  <v-col class="col-lg-4">
                    <strong>
                      <i class="mdi mdi-flag me-1 vertical-middle"></i>
                      Country
                    </strong>
                  </v-col>
                  <v-col class="col-lg-8">{{ country }} </v-col>
                </v-row>

              </v-card-text>
            </v-card>
          </div>
        </div>

        <div v-else class="row">
          <div class="col-lg-12">
            <h1 class="white--text text-center col-md-12">Editing Profile</h1>

              <ValidationObserver
                tag="div"
                class="d-flex flex-column"
                ref="observer"
                v-slot="{  }">

                  <div class="row">
                    <div class="col-md-12">
                      <div class="form-outline">
                        <ValidationProvider rules="required" v-slot="{ errors }" name="Edit">
                          <v-text-field
                            label="Username"
                            v-model="username"
                            class="ma-0"
                            dark
                            v-bind:readonly="true"
                            v-bind:disabled="true"
                            :error="errors.length > 0"
                            :error-messages="errors[0]"/>
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
                            v-bind:readonly="true"
                            v-bind:disabled="true"
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
                        v-bind:defaultCountry="countryCode"
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
                          v-model="reason_of_use"
                          class="ma-0"
                          dark
                          :error="errors.length > 0"
                          :error-messages="errors[0]"/>
                      </ValidationProvider>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider v-slot="{ errors }" name="Website">
                        <v-text-field
                          label="Website"
                          v-model="website"
                          class="ma-0"
                          dark
                          :error="errors.length > 0"
                          :error-messages="errors[0]"/>
                      </ValidationProvider>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">
                      <v-checkbox
                        v-model="newsletter"
                        label="Sign up to receive our newsletter">
                      </v-checkbox>
                    </div>
                  </div>

                  <div class="pt-2">
                    <v-btn
                      type="submit"
                      class="white--text mx-0 align-self-center mb-6"
                      :disabled="loading"
                      @click="onChangeProfile()">
                        Save Changes
                    </v-btn>
                  </div>
                </ValidationObserver>

                <router-link class="text-center mt-6" @click.native="handleDiscard" :to="{ name: 'ProfilePage' }">
                  Discard Changes
                </router-link>

          </div>
        </div>


        </div>
        <div v-else>
          The user "{{username_param}}" does not exist.
        </div>



      </div>
    </div>
  </div>
</template>

<script>
import VueCountryDropdown from 'vue-country-dropdown'
import allCountries from "@/util/allCountries.js"
import { mapState, mapActions } from 'vuex'
import axios from 'axios'
import { apiSuccess, apiError } from "@/util/ErrorMessage.js";
import { copyProfileUrlToClipboard } from "@/util/CopyUrlToClipboard.js";

export default {
  components: {
    VueCountryDropdown
  },
  computed: {
    ...mapState({
      username: state => state.auth.username
    }),
  },
  data() {
    return {
      institution: '',
      profession: '',
      fullName: '',
      personalWebsite: '',
      first_name: '',
      last_name: '',
      email: '',
      country: '',
      reason_of_use: '',
      website: '',
      newsletter: '',
      editing_profile: false,
      loading: false,
      countryCode: '',
      editable: false,
      userExist: true,
      username_param: '',
    };
  },
  methods: {
    ...mapActions("auth", ["updateProfile"]),
    handleShareProfileClick() {
      copyProfileUrlToClipboard(this.username_param);
    },
    handleEditProfile() {
      this.editing_profile = true;
    },
    handleDiscard() {
      this.editing_profile = false;
    },
    async fetchData (username) {
      // Get username from url
      this.username_param = username

      // If username from url is authenticated user, editable, if not, not editable.
      if (this.username_param !== this.username) {
        this.editable = false;
        this.editing_profile = false;
      } else {
        this.editable = true
      }

      try {
        let res = await axios.post('/get_user_info/', {
          username: this.username_param
        })
        this.institution = res.data.institution;
        this.profession = res.data.profession;
        this.personalWebsite = res.data.personalWebsite;
        this.first_name = res.data.first_name;
        this.last_name = res.data.last_name;
        this.email = res.data.email;
        this.country = res.data.country;
        this.reason_of_use = res.data.reason;
        this.website = res.data.website;
        this.newsletter = res.data.newsletter;
        let countryFound = allCountries.find(country => country.name === this.country)
        if(countryFound)
          this.countryCode = countryFound['iso2'];
      } catch (error) {
        if (error.response.status === 404) {
        console.log(error)
          this.userExist = false;
          apiError("The user \"" + this.username_param + "\" does not exist.")
        }
      }
    },
    async onChangeProfile() {
      this.loading = true;

      try {
        if (await this.$refs.observer.validate()) {
          await this.updateProfile({
            username: this.username,
            first_name: this.first_name,
            last_name: this.last_name,
            country: this.country,
            institution: this.institution,
            profession: this.profession,
            reason: this.reason_of_use,
            website: this.website,
            newsletter: this.newsletter,
          });

          apiSuccess("Profile updated.");

          this.editing_profile = false;
          this.loading = false;
        }
      } catch (error) {
        apiError(error, "updating profile.");
      }

      this.loading = false;
    },
    onSelectCountry({name, iso2, dialCode}) {
        this.country = name;
        this.countryCode = allCountries.find(country => country.name === this.country)['iso2'];
    },
  },
  watch: {
    '$route.params': {
        handler(newValue) {
            const { username } = newValue

            this.fetchData(username)
        },
        immediate: true,
    }
}
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>
