<template>
  
      <div id="container" class="container d-flex justify-content-center text-center">
        <div class="w-50 p-3 mx-auto">
          <h1 class="white--text text-center col-md-12">Register</h1>
            <p>
              You are currently logged in as {{username}}. Do you want to log out to register a new user?
            </p>
            <router-link tag="v-btn" class="text-center mt-6 mr-6" to="{ name: 'SelectSession' }">Go Back</router-link>
            <v-btn class="text-center mt-6" @click="logoutRegister">Logout and Register</v-btn>
        </div>
      </div>

</template>

<script>
import router from '@/router';
import { mapActions, mapState } from "vuex";
import { apiSuccess, apiError } from "@/util/ErrorMessage.js";

export default {
  name: "Register",
  computed: {
    ...mapState({
      sessions: (state) => state.data.sessions,
      username: state => state.auth.username
    }),
  },
  methods: {
    ...mapActions("auth", ["logoutNoNavigate"]),
    async logoutRegister() {
      this.logoutNoNavigate();
      this.$router.push({name: 'Register'});
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
.show-pass-icon {
  width: auto;
}
</style>
