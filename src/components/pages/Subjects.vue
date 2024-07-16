<template>
  <div>
    <div class="d-flex flex-column">
    <div class="pa-2 d-flex">
      <v-btn
        width="16em"
        @click="$router.push({ name: 'SelectSession' })">
        Go back to sessions list
      </v-btn>
      <v-btn class="ml-2"
        @click="$refs.dialogRef.addSubject()">
        New Subject
      </v-btn>

      <v-checkbox v-model="show_trashed" class="ml-2 mt-0" label="Show removed subjects"></v-checkbox>
    </div>
    </div>

    <v-row>
      <v-col cols="8">

            <v-data-table
              :headers="headers"
              :items="valid_subjects"
              :options.sync="options"
              :item-class="itemClasses"
              :loading="loading"
              :server-items-length="subject_total"
              :footer-props="{
                showFirstLastPage: false,
                disableItemsPerPage: true,
                itemsPerPageOptions: [40]
              }"
              height="80vh"
              fixed-header
              single-select
              class="subjects-table mx-2 mb-4 flex-grow-1"
              @item-selected="onSelect"
              @click:row="onRowClick">
              <template v-slot:item.name="{ item }">
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
                      <v-list-item link v-if="!item.trashed" @click="item.isMenuOpen = false; editSubject(item)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>

                        <v-dialog
                                v-model="remove_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item link v-if="!item.trashed" v-on="on">
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
                                    Do you want to trash subject <code>{{item.name}}</code>?
                                    You will be able to restore it for 30 days. After that,
                                    this subject will be permanently removed.
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
                                @click="item.isMenuOpen = false; remove_dialog = false; trashSubject(item.id)"
                              >
                                Yes
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>


                        <v-dialog
                                v-model="restore_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item link v-if="item.trashed" v-on="on">
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
                                    Do you want to restore subject <code>{{item.name}}</code>?
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
                                @click="item.isMenuOpen = false; restore_dialog = false; restoreSubject(item.id)"
                              >
                                Yes
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>


                        <v-dialog
                                v-model="remove_permanently_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item link v-if="item.trashed" v-on="on">
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
                                    Do you want to <strong>permanently</strong>
                                      remove subject <code>{{item.name}}</code>?
                                  </p>
                                </v-col>
                              </v-row>
                            </v-card-text>
                            <v-card-actions>
                              <v-spacer></v-spacer>
                              <v-btn
                                color="blue darken-1"
                                text
                                @click="item.isMenuOpen = false; remove_permanently_dialog = false"
                              >
                                No
                              </v-btn>
                              <v-btn
                                color="red darken-1"
                                text
                                @click="item.isMenuOpen = false; remove_permanently_dialog = false; permanentRemoveSubject(item.id)"
                              >
                                Yes
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>


                        <v-dialog
                                v-model="download_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item link v-if="!item.trashed & isSyncDownloadAllowed" v-on="on">
                              <v-list-item-title>Download data (old)</v-list-item-title>
                            </v-list-item>
                          </template>
                          <v-card>
                            <v-card-text class="pt-4">
                              <v-row class="m-0">
                                <v-col cols="2">
                                  <v-icon x-large color="green">mdi-download</v-icon>
                                </v-col>
                                <v-col cols="10">
                                  <p>
                                    Do you want to download all data associated to the
                                    subject <code>{{item.name}}</code>? (This includes every session
                                    and trial associated to it, and can take several minutes).
                                  </p>
                                </v-col>
                              </v-row>
                            </v-card-text>
                            <v-card-actions class="d-flex justify-center">
                              <v-spacer></v-spacer>
                              <v-btn
                                color="blue darken-1"
                                text
                                @click="item.isMenuOpen = false; download_dialog = false"
                              >
                                Cancel
                              </v-btn>
                              <v-btn
                                color="green darken-1"
                                text
                                :disabled="downloading"
                                @click="item.isMenuOpen = false; download_dialog = false; downloadSubjectData(item.id)"
                              >
                                Download
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>

                      <!-- Download archive -->
                      <!--
                      <v-list-item link v-if="!item.trashed">
                        <v-dialog
                                v-model="showArchiveDialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Download data</v-list-item-title>
                          </template>
                          <v-card>
                            <v-card-text class="pt-4">
                              <v-row class="m-0">
                                <v-col cols="2">
                                  <v-icon x-large color="green">mdi-download</v-icon>
                                </v-col>
                                <v-col cols="10">
                                  <p v-if="isArchiveInProgress & !isArchiveDone">
                                    <v-progress-circular  indeterminate class="mr-2" color="grey" size="14" width="2" />
                                    Download in progress
                                  </p>
                                  <p v-if="!(isArchiveInProgress || isArchiveDone)">
                                    Do you want to download all the data from subject <code>{{item.name}}</code>?
                                    (This can take several minutes).
                                  </p>
                                  <p v-if="isArchiveDone">
                                    The archive has been successfully generated. Click on data.zip to download.
                                  </p>
                                </v-col>
                              </v-row>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="item.isMenuOpen = false;showArchiveDialog = false;"
                                >
                                    Cancel
                                </v-btn>
                                
                                <v-btn 
                                    v-if="isArchiveDone"
                                    :href="archiveUrl"
                                    download="data.zip"
                                >
                                    data.zip
                                </v-btn>
                                <v-btn
                                    v-else
                                    color="green darken-1"
                                    text
                                    :disabled="isArchiveInProgress"
                                    @click="downloadSubjectArchive(item.id)"
                                >
                                    Download
                                </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-list-item>
                      -->
                    </v-list>
                  </v-menu>
                </div>
                <div class="cursor-pointer mt-2">{{ item.name }}</div>
              </template>
            </v-data-table>


      </v-col>
      <v-col cols="4">

            <v-data-table
              v-if="selected"
              :headers="sessionHeaders"
              :items="valid_sessions"
              :options.sync="session_options"
              :item-class="itemClasses"
              :loading="session_loading"
              :server-items-length="session_total"
              :footer-props="{
                showFirstLastPage: false,
                disableItemsPerPage: true,
                itemsPerPageOptions: [40]
              }"
              fixed-header
              height="80vh"
              single-select
              class="mx-2"
              @click:row="onRowSessionClick">
            <template v-slot:default>
                <tr>
                  <th class="text-left">
                    Session ID
                  </th>
                  <th class="text-left">
                    Session Name
                  </th>
                  <th class="text-left">
                    Trials
                  </th>
                  <th class="text-left">
                    Date
                  </th>
                </tr>
            </template>
        </v-data-table>
      </v-col>
    </v-row>

    <DialogComponent
      ref="dialogRef"
      @subject-updated="submitEditSubject"
      @subject-added="loadValidSubjects"
    />

  </div>
</template>
<script>
import Vue from 'vue'
import { mapActions, mapState } from 'vuex'
import axios from 'axios'
import { apiInfo, apiError } from '@/util/ErrorMessage.js'
import DialogComponent from '@/components/ui/SubjectDialog.vue'


export default {
  components: {
    DialogComponent
  },
  name: 'Subjects',
  created: function () {},
  data () {
    return {
      loading: true,
      subject_start: 0,
      subject_quantity: 40,
      subject_total: 0,
      valid_subjects: [],
      options: {},
      subject_sort: [],
      subject_sort_desc: [],


      remove_dialog: false,
      remove_permanently_dialog: false,
      restore_dialog: false,
      download_dialog: false,
      show_trashed: false,
      downloading: false,
      isArchiveInProgress: false,
      isArchiveDone: false,
      showArchiveDialog: false,
      archiveUrl: "#",
      delay: 300,
      clicks: 0,
      timer: null,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Weight', value: 'weight' },
        { text: 'Height', value: 'height' },
        { text: 'Birth year', value: 'birth_year' },
        { text: 'Sex', value: 'sex_display' },
        { text: 'Gender', value: 'gender_display' },
        { text: 'Subject Tags', value: 'subject_tags', sortable: false},
        { text: 'Characteristics', value: 'characteristics', sortable: false}
      ],

      session_loading: true,
      session_start: 0,
      session_quantity: 40,
      session_total: 0,
      valid_sessions: [],
      session_options: {},

      sessionHeaders: [
        { text: 'Session ID', value: 'id' },
        { text: 'Session Name', value: 'sessionName' },
        { text: 'Trials', value: 'trials_count' },
        { text: 'Date', value: 'created_at' },
      ],
      selected: null,
    }
  },
    computed: {
    ...mapState({
      genders: state => state.data.genders,
      sexes: state => state.data.sexes,
      isSyncDownloadAllowed: state => state.data.isSyncDownloadAllowed
    }),
  },
  watch:{
    showArchiveDialog(newShowArchiveDialog, oldShowArchiveDialog){
      if(!newShowArchiveDialog){
        this.isArchiveDone = false;
        this.isArchiveInProgress = false;
        this.archiveUrl = "#";
      }
    },
    options: {
      handler () {
        this.subject_start = (this.options.page - 1) * this.options.itemsPerPage
        this.subject_sort = this.options.sortBy
        this.subject_sort_desc = this.options.sortDesc
        this.loadValidSubjects()
        console.log("OPTIONS", this.options)
      },
      deep: true
    },
    show_trashed: {
      handler () {
        this.loadValidSubjects()
      },
      deep: true
    },
  },
  methods: {
    ...mapActions('data', ['trashExistingSubject', 'restoreTrashedSubject']),
    loadValidSubjects() {
      this.loading = true
      let data = {
        start: this.subject_start,
        quantity: this.subject_quantity,
        include_trashed: this.show_trashed,
        sort: this.subject_sort,
        sort_desc: this.subject_sort_desc
      }
      let res = axios.get('/subjects/', {
        params: data
      }).then(response => {
        this.valid_subjects = response.data.subjects
        this.subject_total = response.data.total
        this.loading = false
      }).catch(error => {
        apiError(error)
        this.loading = false
      })
    },
    onSelect ({ item, value }) {
      if (item && value) {
        this.loadSubjectSessions(item.id)
          // this.loadExistingSessions({reroute: false, quantity: -1, subject_id: item.id})
      }
      this.selected = value ? item : null
    },
    onRowSessionClick (item, params) {
      console.log("LOG: " + item.id)
      this.clicks++;
      if (this.clicks === 1) {
        this.timer = setTimeout( () => {
          this.clicks = 0
        }, this.delay);
      } else {
         clearTimeout(this.timer);
         this.$router.push({ name: 'Session', params: { id: item.id }})
         this.clicks = 0;
      }
    },
    onRowClick (item, params) {
      params.select(!params.isSelected)
    },
    itemClasses (item) {
      return item.trashed ? 'trashed' : '';
    },
    clickOutsideDialogSubjectHideMenu(e) {
      if (e.target.className === 'v-overlay__scrim') {
          for(let t of this.valid_subjects) {
            t.isMenuOpen = false;
          }
      }
    },
    async editSubject(subject) {
      this.$refs.dialogRef.edit_dialog = true;
      this.$refs.dialogRef.edited_subject = JSON.parse(JSON.stringify(subject));  // A trick to deep copy
      this.$refs.dialogRef.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null,
          subject_tags: null,
      }
      console.log('edit subject', subject)
    },
    submitEditSubject (data) {
      console.log('submitEditSubject', data)
      this.loadValidSubjects()
    },
    async trashSubject (id) {
      try {
        await this.trashExistingSubject(id)
        this.loadValidSubjects()
      } catch (error) {
        apiError(error)
      }
    },
    async restoreSubject (id) {
      try {
        await this.restoreTrashedSubject(id)
        this.loadValidSubjects()
      } catch (error) {
        apiError(error)
      }
    },
    async downloadSubjectData (id) {
        this.downloading = true
        try {
            let link = document.createElement('a')
            link.setAttribute('href', `${axios.defaults.baseURL}/subjects/${id}/download/`)
            link.setAttribute('download', `subject_results_${id}.zip`)
            // This method works in all browsers including FireFox
            // console.log(link)
            link.dispatchEvent(new MouseEvent('click'))

            window.setTimeout(() => {
                this.downloading = false
            }, 5000)
        } catch (error) {
            apiError(error)
            this.downloading = false
        }
    },
    async downloadSubjectArchive(id){
      this.downloading = true;
      this.isArchiveInProgress = true;
      this.isArchiveDone = false;
      let state = this;
      const startArchiveDownloadUrl = new URL(`/subjects/${id}/async-download/`, axios.defaults.baseURL);
      await axios.get(startArchiveDownloadUrl).then(
        async function pollArchiveOnReady(data){
            const taskID = data.data.task_id;
            const downloadArchiveOnReadyURL = new URL(`/logs/${taskID}/on-ready/`, axios.defaults.baseURL);
            const response = await axios.get(downloadArchiveOnReadyURL);
            if(response.status === 202){
                setTimeout(function(){pollArchiveOnReady(data);}, 1000);
            }
            if(response.status === 200){
                clearTimeout(pollArchiveOnReady);
                state.archiveUrl = response.data.url;
                state.isArchiveInProgress = false;
                state.isArchiveDone = true;
            }
      });
    },
    async permanentRemoveSubject (id) {
      try {
        await axios.post('/subjects/' + id + '/permanent_remove/')
        this.loadSubjects()
      } catch (error) {
        apiError(error)
      }
    }
  }
}
</script>

<style lang="scss">
.trashed {
  color: gray;
}
</style>
