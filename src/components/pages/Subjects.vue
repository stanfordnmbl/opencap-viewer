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
        @click="addSubject()">
        New Subject
      </v-btn>

      <v-checkbox v-model="show_trashed" class="ml-2 mt-0" label="Show removed subjects"></v-checkbox>
    </div>
    </div>

    <v-row>
      <v-col cols="8">

            <v-data-table
              :headers="headers"
              :items="subjectsMapped"
              :item-class="itemClasses"
              height="80vh"
              disable-pagination
              fixed-header
              hide-default-footer
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
                      <v-list-item link v-if="!item.trashed">
                        <v-list-item-title
                          @click="item.isMenuOpen = false; editSubject(item)"
                          >Edit</v-list-item-title>
                      </v-list-item>
                      <v-list-item link v-if="!item.trashed">
                        <v-dialog
                                v-model="remove_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Trash</v-list-item-title>
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
                      </v-list-item>
                      <v-list-item link v-if="item.trashed">
                        <v-dialog
                                v-model="restore_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Restore</v-list-item-title>
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
                      </v-list-item>
                      <v-list-item link v-if="item.trashed">
                        <v-dialog
                                v-model="remove_permanently_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Delete permanently</v-list-item-title>
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
                      </v-list-item>
                      <v-list-item link v-if="!item.trashed & isSyncDownloadAllowed">
                        <v-dialog
                                v-model="download_dialog"
                                v-click-outside="clickOutsideDialogSubjectHideMenu"
                                max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Download data (old)</v-list-item-title>
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
                      </v-list-item>
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
              :items="selectedSessions"
              :item-class="itemClasses"
              height="80vh"
              disable-pagination
              hide-default-footer
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
    <v-dialog v-model="edit_dialog" width="500">
      <v-form>
      <v-card>
        <v-card-title class="headline" v-if="edited_subject.id">Edit subject "{{ edited_subject.name }}"</v-card-title>
        <v-card-title class="headline" v-else>Create new subject</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="edited_subject.name"
            label="Name"
            required
            :error="formErrors.name != null"
            :error-messages="formErrors.name"
          ></v-text-field>

          <v-text-field
            v-model="edited_subject.weight"
            label="Weight (kg)"
            type="number"
            hide-spin-buttons
            required
            :rules="[weightRule]"
            :error="formErrors.weight != null"
            :error-messages="formErrors.weight"
          ></v-text-field>

          <v-text-field
            v-model="edited_subject.height"
            label="Height (m)"
            type="number"
            hide-spin-buttons
            required
            :rules="[heightRule]"
            :error="formErrors.height != null"
            :error-messages="formErrors.height"
          ></v-text-field>
          <v-text-field
            v-model="edited_subject.birth_year"
            label="Birth year (y)"
            type="number"
            hide-spin-buttons
            required
            :rules="[birthYearRule]"
            :error="formErrors.birth_year != null"
            :error-messages="formErrors.birth_year"
          ></v-text-field>
          <v-select
              clearable
              v-model="edited_subject.sex_at_birth"
              item-title="text"
              item-value="value"
              label="Sex assigned at birth (Optional)"
              :items="sexesOptions"
          ></v-select>
          <v-select
              clearable
              v-model="edited_subject.gender"
              item-title="text"
              item-value="value"
              label="Gender (Optional)"
              :items="gendersOptions"
          ></v-select>
          <v-textarea
            v-model="edited_subject.characteristics"
            label="Characteristics (Optional)"
            rows=3
          ></v-textarea>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="cancelSubjectForm()"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="submitSubjectForm()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
import Vue from 'vue'
import { mapActions, mapState } from 'vuex'
import axios from 'axios'
import { apiInfo, apiError } from '@/util/ErrorMessage.js'

export default {
  name: 'Subjects',
  created: function () {},
  data () {
    return {
      remove_dialog: false,
      remove_permanently_dialog: false,
      restore_dialog: false,
      download_dialog: false,
      edit_dialog: false,
      show_trashed: false,
      downloading: false,
      isArchiveInProgress: false,
      isArchiveDone: false,
      showArchiveDialog: false,
      archiveUrl: "#",
      delay: 300,
      clicks: 0,
      timer: null,
      formErrors: {
          weight: null,
          height: null,
          birth_year: null
      },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Weight', value: 'weight' },
        { text: 'Height', value: 'height' },
        { text: 'Birth year', value: 'birth_year' },
        { text: 'Sex', value: 'sex_display' },
        { text: 'Gender', value: 'gender_display' },
        { text: 'Characteristics', value: 'characteristics' }
      ],
      sessionHeaders: [
        { text: 'Session ID', value: 'id' },
        { text: 'Session Name', value: 'sessionName' },
        { text: 'Trials', value: 'trials.length' },
        { text: 'Date', value: 'created_at' },
      ],
      edited_subject: {id: "", name:"", weight:"", height:"", birth_year:"", sex_at_birth:"", gender:"", characteristics:""},
      selected: null,
      empty_subject: {id: "", name:"", weight:"", height:"", birth_year:"", sex_at_birth:"", gender:"", characteristics:""},
      heightRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= .1 && v <= 3.0) return true;
        if(!isNaN(parseFloat(v)) && v > 3.0) return "It is unlikely that the height of subject is higher than 3 m. Are you using the right units? Height should be in m.";
        if(!isNaN(parseFloat(v)) && v < .1) return "It is unlikely that the subject is shorter than .1 m. Are you using the right units? Height should be in m.";
      },
      weightRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= 1 && v <= 200.0) return true;
        if(!isNaN(parseFloat(v)) && v > 200.0) return "It is unlikely that the weight of subject is higher than 200 kg. Are you using the right units? Weight should be in kg.";
        if(!isNaN(parseFloat(v)) && v < 1) return "It is unlikely that the weight of subject is lower than 1 kg. Are you using the right units? Weight should be in kg.";
      },
      birthYearRule: (v) => {
        const currentYear = new Date().getFullYear();
        if (!v) return true;
        if (!isNaN(parseFloat(v)) && v >= 1900 && v <= currentYear) return true;
        if(!isNaN(parseFloat(v)) && v > currentYear) return `It is unlikely that the birth year of subject is set to the future. Are you using the right units? Birth year should be less than ${currentYear}.`;
        if(!isNaN(parseFloat(v)) && v < 1900) return "It is unlikely that the age of the subject is higher than 100 years. Are you using the right units? Birth year should be in years.";
      }

    }
  },
    computed: {
    ...mapState({
      sessions: state => state.data.sessions,
      subjects: state => state.data.subjects,
      genders: state => state.data.genders,
      sexes: state => state.data.sexes,
      isSyncDownloadAllowed: state => state.data.isSyncDownloadAllowed
    }),
    subjectsMapped () {
      return this.subjects.map(s => ({
        id: s.id,
        name: s.name,
        birth_year: s.birth_year,
        characteristics: s.characteristics,
        gender: s.gender,
        gender_display: this.genders[s.gender],
        sex_at_birth: s.sex_at_birth,
        sex_display: this.sexes[s.sex_at_birth],
        height: s.height,
        weight: s.weight,
        // trashed_trials_count: String(s.trials.filter(t => t.trashed).length),
        // trials: s.trials,
        created_at: s.created_at,
        trashed: s.trashed,
        trashed_at: s.trashed_at,
        isMenuOpen: false
      })).filter(s => this.show_trashed || !s.trashed)
    },
    sexesOptions () {
      return Object.entries(this.sexes).map((s) => ({ text: s[1], value: s[0] }))
    },
    gendersOptions () {
      return Object.entries(this.genders).map((s) => ({ text: s[1], value: s[0] }))
    },
    selectedSessions () {
      return this.sessions.map(s => ({
        id: s.id,
        sessionName: s.meta["sessionName"] ? s.meta["sessionName"] : "",
        name: s.name,
        trials_count: String(s.trials.length),
        trashed_trials_count: String(s.trials.filter(t => t.trashed).length),
        trials: s.trials,
        created_at: s.created_at,
        trashed: s.trashed,
        trashed_at: s.trashed_at,
        isMenuOpen: false,
        subject: s.subject
      })).filter((s => s.trashed || s.trashed_trials_count > 0) && (s => s.subject === this.selected.id))
    }
  },
  mounted () {
    this.loadSubjects()
  },
  watch:{
    showArchiveDialog(newShowArchiveDialog, oldShowArchiveDialog){
      if(!newShowArchiveDialog){
        this.isArchiveDone = false;
        this.isArchiveInProgress = false;
        this.archiveUrl = "#";
      }
    }
  },
  methods: {
    ...mapActions('data', [
        'loadExistingSessions', 'loadSubjects',
        'trashExistingSubject', 'restoreTrashedSubject']),
    onSelect ({ item, value }) {
      if (item && value) {
          this.loadExistingSessions({reroute: false, quantity: -1, subject_id: item.id})
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
          for(let t of this.subjectsMapped) {
            t.isMenuOpen = false;
          }
      }
    },
    async addSubject() {
      this.edit_dialog = true;
      this.edited_subject = this.empty_subject;
      this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null
      }
      console.log('add subject')
    },
    async editSubject(subject) {
      this.edit_dialog = true;
      this.edited_subject = subject;
      this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null
      }
      console.log('edit subject', subject)
    },
    async cancelSubjectForm() {
      this.edit_dialog = false;
      this.edited_subject = this.empty_subject;
      this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null
      }
    },
    async submitSubjectForm() {
      this.edit_dialog = false;
      this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null
      }

      if(this.edited_subject.id) {
        const res = await axios.put('/subjects/' + this.edited_subject.id + '/', this.edited_subject)
            .catch(error => {
              if(error.response.status === 400) {
                for (const [key, value] of Object.entries(error.response.data)) {
                  this.formErrors[key] = value
                }
                this.edit_dialog = true;
              }
            })
        console.log('update subject', res.data)
      } else {
        const res = await axios.post('/subjects/', this.edited_subject)
            .catch(error => {
              if(error.response.status === 400) {
                for (const [key, value] of Object.entries(error.response.data)) {
                  this.formErrors[key] = value
                }
                this.edit_dialog = true;
              }
            })
        console.log('submit subject', res.data)
      }

      this.edited_subject = this.empty_subject;
      this.loadSubjects()
    },
    async trashSubject (id) {
      try {
        await this.trashExistingSubject(id)
      } catch (error) {
        apiError(error)
      }
    },
    async restoreSubject (id) {
      try {
        await this.restoreTrashedSubject(id)
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
