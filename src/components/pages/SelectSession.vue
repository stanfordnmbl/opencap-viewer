<template>
  <div class="select-session d-flex flex-column">
    <div class="pa-2 d-flex">
      <v-btn
        @click="$router.push({ name: 'ConnectDevices' })">
        New session
      </v-btn>

      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark v-bind="attrs" v-on="on" class="ml-2">
            <span class="mr-2">Dashboards</span>
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-list>
            <v-list-item link
                @click="$router.push({ name: 'Dashboard', params: { id: '' } })">
                Kinematics
            </v-list-item>
            <v-list-item
                v-for="dashboard in analysis_dashboards"
                :key="dashboard.id"
                @click="$router.push({ name: 'AnalysisDashboard', params: { id: dashboard.id } })">
              {{ dashboard.title }}</v-list-item>
        </v-list>
      </v-menu>

      <v-btn
        class="ml-2"
        @click="$router.push({ name: 'Subjects' })">
        Subjects
      </v-btn>

      <v-btn
        class="ml-2"
        @click="$router.push({ name: 'RecycleBin' })">
        Recycle Bin
      </v-btn>

      <v-checkbox v-model="show_trashed" class="ml-2 mt-0" label="Show removed sessions"></v-checkbox>

      <v-text-field
        v-model="searchText"
        class="ml-2"
        label="Enter text"
        dense
      ></v-text-field>

      <v-btn
        class="ml-2"
        @click="handleSearch">
        Submit
      </v-btn>

    </div>

    <v-data-table        
      :headers="headers"
      :items="valid_sessions"
      :options.sync="options"
      :item-class="itemClasses"
      :loading="loading"
      :server-items-length="session_total"
      :footer-props="{
        showFirstLastPage: false,
        disableItemsPerPage: true,
        itemsPerPageOptions: [40]
      }"
      fixed-header
      single-select
      class="sessions-table mx-2 mb-4 flex-grow-1"
      @item-selected="onSelect"
      @click:row="onRowClick">
      <template v-slot:item.created_at="{ item }">
        <span>{{ item.created_at|date }}</span>
      </template>
      <template v-slot:item.id="{ item }">
        <div class="float-right">
          <v-menu
              v-model="item.isMenuOpen"
              offset-y
            >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  icon
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-menu</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item link
                @click="$router.push({ name: 'Session', params: { id: item.id }})">
                <v-list-item-title>Load</v-list-item-title>
              </v-list-item>
              <v-list-item link
                @click="$router.push({ name: 'Dashboard', params: { id: item.id } })">
                <v-list-item-title>Dashboard kinematics</v-list-item-title>
              </v-list-item>


                <v-dialog
                        v-model="rename_dialog"
                        v-click-outside="clickOutsideDialogSessionHideMenu"
                        max-width="500">
                  <template v-slot:activator="{ on }">
                    <v-list-item link v-on="{
                          ...on,
                          click: (e) => { on.click(e); item.isMenuOpen = false; rename_dialog = true; }
                        }">
                      <v-list-item-title>Rename</v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-card>
                    <v-card-text class="pt-4">
                      <v-row class="m-0">
                        <v-col cols="2">
                          <v-icon x-large color="orange">mdi-rename-box</v-icon>
                        </v-col>
                        <v-col cols="10">
                          <p class="mb-1">
                            Insert a new name for session {{item.sessionName}}:
                          </p>
                          <small class="mt-0">
                            Only alphanumeric characters and underscores are allowed.
                          </small>
                          <ValidationObserver tag="div" class="d-flex flex-column" ref="observer" v-slot="{ invalid }">
                            <ValidationProvider rules="required|alpha_dash_custom" v-slot="{ errors }" name="Session name">

                                <v-text-field v-model="sessionNewName" label="Session new name" class="flex-grow-0"
                                    dark :error="errors.length > 0" :error-messages="errors[0]" >

                                </v-text-field>
                            </ValidationProvider>

                            <v-spacer></v-spacer>

                            <v-btn class="text-right" :disabled="invalid" @click="item.isMenuOpen = false; rename_dialog = false; renameSession(item, sessionNewName);">
                                Rename Session
                            </v-btn>
                          </ValidationObserver>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-dialog>



                <v-dialog
                        v-model="remove_dialog"
                        v-click-outside="clickOutsideDialogSessionHideMenu"
                        max-width="500">
                  <template v-slot:activator="{ on }">
                    <v-list-item link v-show="!item.trashed" v-on="{
                          ...on,
                          click: (e) => { on.click(e); item.isMenuOpen = false; remove_dialog = true; }
                        }">
                      <v-list-item-title>Trash</v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-card>
                    <v-card-text class="pt-4">
                      <v-row class="m-0">
                        <v-col cols="2">
                          <v-icon x-large color="red">mdi-close-circle</v-icon>
                        </v-col>
                        <v-col cols="10">
                          <p>
                            Do you want to trash session <code>{{item.id}}</code>?
                            You will be able to restore it for 30 days. After that,
                            this session will be permanently removed.
                          </p>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="item.isMenuOpen = false; remove_dialog = false"
                      >
                        No
                      </v-btn>
                      <v-btn
                        color="red darken-1"
                        text
                        @click="item.isMenuOpen = false; remove_dialog = false; trashSession(item.id)"
                      >
                        Yes
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>


                <v-dialog
                        v-model="restore_dialog"
                        v-click-outside="clickOutsideDialogSessionHideMenu"
                        max-width="500">
                  <template v-slot:activator="{ on }">
                    <v-list-item link v-show="item.trashed" v-on="{
                          ...on,
                          click: (e) => { on.click(e); item.isMenuOpen = false; restore_dialog = true; }
                        }">
                      <v-list-item-title v-on="on">Restore</v-list-item-title>
                    </v-list-item>
                  </template>
                  <v-card>
                    <v-card-text class="pt-4">
                      <v-row class="m-0">
                        <v-col cols="2">
                          <v-icon x-large color="green">mdi-undo-variant</v-icon>
                        </v-col>
                        <v-col cols="10">
                          <p>
                            Do you want to restore session <code>{{item.id}}</code>?
                          </p>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="item.isMenuOpen = false; restore_dialog = false"
                      >
                        No
                      </v-btn>
                      <v-btn
                        color="green darken-1"
                        text
                        @click="item.isMenuOpen = false; restore_dialog = false; restoreSession(item.id)"
                      >
                        Yes
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

            </v-list>
          </v-menu>
        </div>
        <div class="mt-2">{{ item.id }}</div>
      </template>
    </v-data-table>
      
<!--    <div class="d-flex table-info-footer">-->
<!--      <v-btn-->
<!--        class="ml-2"-->
<!--        @click="onLoadAllSessions">-->
<!--        Load all sessions-->
<!--      </v-btn>-->
<!--    </div>-->
    
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { apiInfo, apiError } from '@/util/ErrorMessage.js'
import { formatDate } from '@/util/DateFormat.js'
import axios from 'axios'
import router from '@/router'
import Vue from 'vue'

export default {
  name: 'SelectSession',
  created: function () {
      this.loadAnalysisDashboardList()
  },
  mounted() {
      this.$toasted.clear()
  },
  data () {
    return {
      loading: true,
      session_start: 0,
      session_quantity: 40,
      session_total: 0,
      session_sort: [],
      session_sort_desc: [],
      valid_sessions: [],
      options: {},
      remove_dialog: false,
      rename_dialog: false,
      restore_dialog: false,
      sessionName: '',
      sessionNewName: '',
      show_trashed: false,
      searchText: '',
      headers: [
        {
          text: 'Session ID',
          align: 'start',
          sortable: false,
          value: 'id',
        },
        { text: 'Session Name', value: 'sessionName' },
        { text: 'Subject Name', value: 'name' },
        { text: 'Number of trials', align: 'center', value: 'trials_count' },
        { text: 'Date', value: 'created_at' }
      ],
      selected: null,
      delay: 300,
      clicks: 0,
      timer: null
    }
  },
  watch: {
    options: {
      handler () {
        this.session_start = (this.options.page - 1) * this.options.itemsPerPage
        this.session_sort = this.options.sortBy
        this.session_sort_desc = this.options.sortDesc
        console.log('options changed', this.options)
        this.loadValidSessions()
      },
      deep: true
    },
    show_trashed: {
      handler () {
        this.loadValidSessions()
      }
    }
  },
  computed: {
    ...mapState({
      analysis_dashboards: state => state.data.analysis_dashboards
    }),
  },
  methods: {
    ...mapActions('data', [
        'trashExistingSession',
        'restoreTrashedSession',
        'loadAnalysisDashboardList',
    ]),
    handleSearch() {
      this.loading = true;
      const params = new URLSearchParams({ text: this.searchText }).toString();
      axios.get(`/sessions/search_sessions/?${params}`).then(response => {
        const filteredSessions = response.data.filter(session => {
          // Count trials that are NOT calibration
          const nonCalibrationTrials = session.trials.filter(
            trial => trial.name.toLowerCase() !== 'calibration'
          );
          // Keep the session only if there's at least one non-calibration trial
          return nonCalibrationTrials.length > 0;
        });

        this.valid_sessions = filteredSessions;
        this.session_total = filteredSessions.length;
        this.loading = false;
      }).catch(error => {
        apiError(error)
        this.loading = false
      })
    },
    loadValidSessions () {
      this.loading = true
      let data = {
        start: this.session_start,
        quantity: this.session_quantity,
        include_trashed: this.show_trashed,
        sort: this.session_sort,
        sort_desc: this.session_sort_desc
      }
      axios.post('/sessions/valid/', data).then(response => {
        this.valid_sessions = response.data.sessions
        this.session_total = response.data.total
        this.loading = false
        if (this.session_total === 0) {
          router.push({ name: 'Step1' })
        }
      }).catch(error => {
        apiError(error)
        this.loading = false
      })
    },
    onSelect ({ item, value }) {
      this.selected = value ? item : null
    },
    onRowClick (item, params) {
      this.clicks++;
      if (this.clicks === 1) {
        this.timer = setTimeout( () => {
          params.select(!params.isSelected)
          this.clicks = 0
        }, this.delay);
      } else {
         clearTimeout(this.timer);
         this.$router.push({ name: 'Session', params: { id: item.id }})
         this.clicks = 0;
      }
    },
    itemClasses (item) {
      return item.trashed ? 'trashed' : '';
    },
    clickOutsideDialogSessionHideMenu(e) {
      if (e.target.className === 'v-overlay__scrim') {
          for(let t of this.valid_sessions) {
            t.isMenuOpen = false;
          }
      }
    },
    // async onLoadAllSessions(){
    //   try {
    //     await this.loadExistingSessions({reroute: true, quantity:-1})
    //   } catch (error) {
    //     apiError(error)
    //     this.$router.push({ name: 'ConnectDevices' })
    //   }
    // },
    async trashSession (id) {
      try {
        await axios.post(`/sessions/${id}/trash/`)
        this.loadValidSessions()
      } catch (error) {
        apiError(error)
      }
    },
    async restoreSession (id) {
      try {
        await axios.post(`/sessions/${id}/restore/`)
        this.loadValidSessions()
      } catch (error) {
        apiError(error)
      }
    },
    async renameSession(session, sessionNewName) {
      try {
        let oldName = session.sessionName;
        console.log(oldName + " will be renamed to " + sessionNewName);
        const { data } = await axios.post(`/sessions/${session.id}/rename/`, {sessionNewName});
        await this.updateSessionWithData(session, data.data);
      } catch (error) {
        apiError(error)
      }
    },
    async updateSessionWithData(session, data) {
      const index = this.sessions.findIndex(x => x.id === session.id);
      if (index >= 0) {
        Vue.set(this.sessions, index, data);
        const sessionIndex = this.sessions.findIndex(x => x.id === session.id);
        Vue.set(this.sessions, sessionIndex, data);
        data.created_at = formatDate(data.created_at);
      }
    }

  }
}
</script>

<style lang="scss">
.select-session {
  height: calc(98vh - 64px);

  .sessions-table {
    .v-data-table__wrapper {
      overflow-y: auto;
      height: calc(94vh - 128px);
      position: relative;

      table {
        thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background-color: rgb(39, 39, 39);
        }
      }
    }    
  }
  .table-info-footer {
    margin-left: auto;
  }
}

.trashed {
  color: gray;
}
</style>
