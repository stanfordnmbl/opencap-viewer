<template>
  <div class="profile-dropdown mr-4" @click="toggleDropdown">
    <img :src="profileImage" alt="Profile" class="profile-image" />
    <transition name="fade">
      <div v-if="isDropdownOpen" class="dropdown-content">
        <ul>
          <router-link
            class="dropdown-element"
            tag="li"
            :to="{ name: 'SelectSession' }">
            <li>Signed in as: {{username}}</li>
          </router-link>
        </ul>
        <hr>
        <ul>
          <router-link
            class="dropdown-element"
            tag="li"
            :to="{ name: 'ProfilePage', params: { username: this.username } }">
              <i class="mdi mdi-account inline-icon"></i>
              Your Profile
          </router-link>
          <router-link
            class="dropdown-element"
            tag="li"
            :to="{ name: 'SelectSession' }">
              <i class="mdi mdi-magnify inline-icon"></i>
              Your Sessions
          </router-link>
        </ul>
        <hr>
        <ul>
          <a target="_blank" href="https://simtk.org/plugins/phpBB/indexPhpbb.php?group_id=2385&pluginname=phpBB">
            <li>
                  <i class="mdi mdi-forum inline-icon"></i>
                  Forum
            </li>
          </a>
          <a target="_blank" href="https://github.com/stanfordnmbl/opencap-core">
            <li>
                  <i class="mdi mdi-forum inline-icon"></i>
                  Find on GitHub
            </li>
          </a>
          <a target="_blank" href="https://www.opencap.ai/best-practices">
            <li>
                <i class="mdi mdi-help inline-icon"></i>
                Help
            </li>
          </a>
          <a target="_blank" href="https://mobilize.stanford.edu/wp-content/uploads/2022/12/OpenCap-QA-Final.pdf">
            <li>
                <i class="mdi mdi-frequently-asked-questions inline-icon"></i>
                FAQ
            </li>
          </a>
          <a target="_blank" href="https://www.opencap.ai/terms-conditions">
            <li>
                  <i class="mdi mdi-file-document-edit inline-icon"></i>
                  Terms of Service
            </li>
          </a>
          <a target="_blank" href="https://docs.google.com/document/d/1DBw9LVAuUwgz713037VQjsaD8sj2-AN_hzga_7kXtXI/edit">
            <li>
                <i class="mdi mdi-eye inline-icon"></i>
                Data Privacy
            </li>
          </a>
          <a target="_blank" href="https://github.com/stanfordnmbl/opencap-viewer/issues">
            <li>
                <i class="mdi mdi-bug inline-icon"></i>
                Bug Report
            </li>
          </a>
        </ul>
        <hr>
        <ul>
          <li @click="logoutAction">
                <i class="mdi mdi-logout inline-icon"></i>
                Logout
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapActions('auth', ['logout']),
    ...mapState({
      username: state => state.auth.username
    }),
  },
  data() {
    return {
      isDropdownOpen: false,
      profileImage: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg',
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    showHelp() {
      // Add your help logic here
      console.log('Help clicked');
    },
    logoutAction() {
      this.logout();
    }
  },
};
</script>

<style scoped>
.profile-dropdown {
  position: relative;
  cursor: pointer;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.dropdown-content {
  position: absolute;
  top: 50px; /* Adjust the top position according to your layout */
  right: 0;
  background-color: #111111;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 8px;
  z-index: 1;
  width: auto;
  min-width: 25em;
}

ul {
  list-style-type: none;
  padding: 0 !important;
  margin: 0;
}

li {
  padding: 8px;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
}

a {
  text-decoration: none;
}

li:hover, a:hover{
  background-color: #444444;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.profile-image:hover {
  border: 2px solid #444444; /* Change color to your desired highlight color */
}

.inline-icon {
   vertical-align: bottom;
   margin-right: 0.5em;
}
</style>
