<template>
  <div>
    <div class="d-flex flex-column">
      <div class="pa-2 d-flex justify-content-between">
        <v-btn
          width="16em"
          @click="$router.push({ name: 'SelectSession' })">
          Go back to sessions list
        </v-btn>
        <v-btn
          @click="empty_bin_dialog = true">
          Empty Recycle Bin
        </v-btn>
      </div>
    </div>

    <v-row>
      <v-col cols="8">

            <v-data-table
              :headers="headers"
              :items="trashed_sessions"
              :options.sync="session_options"
              :loading="session_loading"
              :server-items-length="session_total"
              :footer-props="{
                showFirstLastPage: false,
                disableItemsPerPage: true,
                itemsPerPageOptions: [40]
              }"
              height="80vh"
              single-select
              class="sessions-table mx-2 mb-4 flex-grow-1"
              @item-selected="onSelect"
              @click:row="onRowClick">
              <template v-slot:item.id="{ item }">
                <div class="float-right">
                  <v-menu
                      v-model="item.isMenuOpen"
                      offset-y
                      v-if="item.trashed"
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

                        <v-dialog
                                v-model="restore_session_dialog"
                                v-click-outside="clickOutsideDialogSessionHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item link v-on="on">
                              <v-list-item-title>Restore</v-list-item-title>
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
                                @click="item.isMenuOpen = false; restore_session_dialog = false"
                              >
                                No
                              </v-btn>
                              <v-btn
                                color="green darken-1"
                                text
                                @click="item.isMenuOpen = false; restore_session_dialog = false; restoreSession(item.id)"
                              >
                                Yes
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>


                        <v-dialog
                                v-model="remove_permanently_session_dialog"
                                v-click-outside="clickOutsideDialogSessionHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item link v-on="on">
                              <v-list-item-title>Delete permanently</v-list-item-title>
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
                                    Do you want to <strong>permanently</strong> remove session
                                    <code>{{item.id}}</code>?
                                  </p>
                                </v-col>
                              </v-row>
                            </v-card-text>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn
                                color="blue darken-1"
                                text
                                @click="item.isMenuOpen = false; remove_permanently_session_dialog = false"
                              >
                                No
                              </v-btn>
                              <v-btn
                                color="red darken-1"
                                text
                                @click="item.isMenuOpen = false; remove_permanently_session_dialog = false; permanentRemoveSession(item.id)"
                              >
                                Yes
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>

                    </v-list>
                  </v-menu>
                </div>
                <div class="cursor-pointer mt-2">{{ item.id }}</div>
              </template>
            </v-data-table>

      </v-col>
      <v-col cols="4">

        <v-simple-table
            v-if="selected"
            class="mx-2">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">
                    Trial name
                  </th>
                  <th class="text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="trial in trialsMapped"
                  :key="trial.id"
                >
                  <td>
                    <div class="float-right">
                      <v-menu
                          v-model="trial.isMenuOpen"
                          offset-y
                          v-if="trial.trashed"
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


                            <v-dialog
                                    v-model="restore_trial_dialog"
                                    v-click-outside="clickOutsideDialogTrialHideMenu"
                                    max-width="500">
                              <template v-slot:activator="{ on }">
                                <v-list-item link v-on="on">
                                  <v-list-item-title>Restore</v-list-item-title>
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
                                        Do you want to restore trial {{trial.name}}?
                                      </p>
                                    </v-col>
                                  </v-row>
                                </v-card-text>
                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="trial.isMenuOpen = false; restore_trial_dialog = false"
                                  >
                                    No
                                  </v-btn>
                                  <v-btn
                                    color="green darken-1"
                                    text
                                    @click="trial.isMenuOpen = false; restore_trial_dialog = false; restoreTrial(trial)"
                                  >
                                    Yes
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>


                            <v-dialog
                                    v-model="remove_permanently_trial_dialog"
                                    v-click-outside="clickOutsideDialogTrialHideMenu"
                                    max-width="500">
                              <template v-slot:activator="{ on }">
                                <v-list-item link v-on="on">
                                  <v-list-item-title>Delete permanently</v-list-item-title>
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
                                        Do you want to <strong>permanently</strong> remove
                                        trial {{trial.name}}?
                                      </p>
                                    </v-col>
                                  </v-row>
                                </v-card-text>
                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="trial.isMenuOpen = false; remove_permanently_trial_dialog = false"
                                  >
                                    No
                                  </v-btn>
                                  <v-btn
                                    color="red darken-1"
                                    text
                                    @click="trial.isMenuOpen = false; remove_permanently_trial_dialog = false; permanentRemoveTrial(trial)"
                                  >
                                    Yes
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>

                        </v-list>
                      </v-menu>
                    </div>

                    <div class="mt-2">{{ trial.name }}</div>
                  </td>
                  <td>{{ trial.status }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>


      </v-col>
    </v-row>

    <v-dialog v-model="empty_bin_dialog" max-width="500">
      <v-card>
        <v-card-text class="pt-4">
          <v-row class="m-0">
            <v-col cols="2">
              <v-icon x-large color="red">mdi-close-circle</v-icon>
            </v-col>
            <v-col cols="10">
              <p>
                Do you want to <strong>permanently</strong> empty the Recycle Bin?
              </p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="empty_bin_dialog = false"
          >
            No
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            @click="empty_bin_dialog = false; emptyBin()"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

</div>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapState } from 'vuex'
import axios from 'axios'
import { apiInfo, apiError } from '@/util/ErrorMessage.js'

export default {
  name: 'RecycleBin',
  data () {
    return {
      session_loading: true,
      session_start: 0,
      session_quantity: 40,
      session_total: 0,
      trashed_sessions: [],
      session_options: {},

      trial_loading: true,
      trial_start: 0,
      trial_quantity: 40,
      trial_total: 0,
      trashed_trials: [],
      trial_options: {},

      restore_session_dialog: false,
      remove_session_dialog: false,
      remove_permanently_session_dialog: false,
      restore_trial_dialog: false,
      remove_trial_dialog: false,
      remove_permanently_trial_dialog: false,
      empty_bin_dialog: false,
      headers: [
        {
          text: 'ID',
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
    }
  },
  watch: {
    session_options: {
      handler: function (val) {
        this.session_start = (this.session_options.page - 1) * 40;
        this.loadTrashedSessions()
      },
      deep: true
    }
  },
  computed: {
    // ...mapState({
    //   // sessions: state => state.data.sessions
    // }),
    // sessionsMapped () {
    //   return this.sessions.map(s => ({
    //     id: s.id,
    //     sessionName: s.meta["sessionName"] ? s.meta["sessionName"] : "",
    //     name: s.name,
    //     trials_count: s.trials_count, // String(s.trials.length),
    //     // trashed_trials_count: String(s.trials.filter(t => t.trashed).length),
    //     trashed_trials_count: s.trashed_trials_count,
    //     trials: s.trials,
    //     created_at: s.created_at,
    //     trashed: s.trashed,
    //     trashed_at: s.trashed_at,
    //     isMenuOpen: false
    //   })).filter(s => s.trashed || s.trashed_trials_count > 0)
    // },
    trialsMapped () {
        return this.selected.trials.filter(t => t.trashed || this.selected.trashed).map(t => ({...t, isMenuOpen: false}))
    }
  },
  methods: {
    ...mapActions('data', [
      // 'loadExistingSessions',
      'loadSession',
      'permanentRemoveExistingSession',
      'trashExistingSession', 'restoreTrashedSession']),

    loadTrashedSessions() {
      this.session_loading = true
      let data = {
        start: this.subject_start,
        quantity: 40,
        only_trashed: true
      }
      let res = axios.post('/sessions/valid/', data).then(response => {
        this.trashed_sessions = response.data.sessions
        this.session_total = response.data.total
        this.session_loading = false
      }).catch(error => {
        apiError(error)
        this.session_loading = false
      })
    },
    onSelect({item, value}) {
      if (value) {
        axios.get(`/sessions/${item.id}/`).then((res) => {
          console.log(res)
          this.selected = res.data
        })
      } else {
        this.selected = null
      }
    },
    onRowClick(item, params) {
      params.select(!params.isSelected);
    },
    clickOutsideDialogSessionHideMenu(e) {
      if (e.target.className === 'v-overlay__scrim') {
          for(let t of this.sessionsMapped) {
            t.isMenuOpen = false;
          }
      }
    },
    clickOutsideDialogTrialHideMenu(e) {
      if (e.target.className === 'v-overlay__scrim') {
          for(let t of this.trialsMapped) {
            t.isMenuOpen = false;
          }
      }
    },
    async permanentRemoveSession(id) {
      try {
        await this.permanentRemoveExistingSession(id);
        this.selected = null;
      } catch (error) {
        apiError(error)
      }
    },
    async restoreSession(id) {
      try {
        await this.restoreTrashedSession(id)
      } catch (error) {
        apiError(error)
      }
    },
    async updateTrialWithData(trial, data) {
        const index = this.selected.trials.findIndex(x => x.id === trial.id)
        if (index >= 0) {
            Vue.set(this.selected.trials, index, data);
            const session_index = this.sessions.findIndex(x => x.id === trial.session);
            const idx = this.sessions[session_index].trials.findIndex(x => x.id === trial.id)
            Vue.set(this.sessions[session_index].trials, idx, data);
        }
    },
    async permanentRemoveTrial(trial) {
      try {
        if(this.selected) {
          const index = this.selected.trials.findIndex(x => x.id === trial.id)
          const res = await axios.post(`/trials/${trial.id}/permanent_remove/`);
          this.selected.trials.splice(index, 1);
        } else {
          const session_index = this.sessions.findIndex(x => x.id === trial.session);
          const index = this.sessions[session_index].trials.findIndex(x => x.id === trial.id)
          const res = await axios.post(`/trials/${trial.id}/permanent_remove/`);
          this.sessions[session_index].trials.splice(index, 1);
        }
      } catch (error) {
        apiError(error)
      }
    },
    async restoreTrial(trial) {
      try {
        const { data } = await axios.post(`/trials/${trial.id}/restore/`);
        await this.updateTrialWithData(trial, data);
      } catch (error) {
        apiError(error)
      }
    },
    async emptyBin() {
      let trials = [];
      let sessions_ids = [];

      this.sessionsMapped.forEach(s => {
        if (s.trashed) {
          sessions_ids.push(s.id)
        } else {
          s.trials.forEach(t => {
            if (t.trashed) {
              trials.push(t)
            }
          })
        }
      })

      for await (const t of trials) {
        await this.permanentRemoveTrial(t)
      }
      for await (const id of sessions_ids) {
        await this.permanentRemoveSession(id)
      }

    }
  }
}
</script>
