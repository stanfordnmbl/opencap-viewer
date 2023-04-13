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
              disable-pagination
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
                          >Edit...</v-list-item-title>
                      </v-list-item>
                      <v-list-item link v-if="!item.trashed">
                        <v-dialog v-model="remove_dialog" max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Remove...</v-list-item-title>
                          </template>
                          <v-card>
                            <v-card-text class="pt-4">
                              <v-row class="m-0">
                                <v-col cols="2">
                                  <v-icon x-large color="red">mdi-close-circle</v-icon>
                                </v-col>
                                <v-col cols="10">
                                  <p>
                                    Do you want to remove subject <code>{{item.name}}</code>?
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
                        <v-dialog v-model="restore_dialog" max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Restore...</v-list-item-title>
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
                        <v-dialog v-model="remove_permanently_dialog" max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Remove permanently...</v-list-item-title>
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
                      <v-list-item link v-if="!item.trashed">
                        <v-dialog v-model="download_dialog" max-width="500">
                          <template v-slot:activator="{ on }">
                            <v-list-item-title v-on="on">Download data...</v-list-item-title>
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
                            <v-card-actions>
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
                                @click="item.isMenuOpen = false; download_dialog = false;downloadSubjectData(item.id)"
                              >
                                Download
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </v-dialog>
                      </v-list-item>

                    </v-list>
                  </v-menu>
                </div>
                <div class="cursor-pointer mt-2">{{ item.name }}</div>
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
                    Session ID
                  </th>
                  <th class="text-left">
                    Trials
                  </th>
                  <th class="text-left">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="session in selectedSessions" :key="session.id">
                  <td>{{ session.id }}</td>
                  <td>{{ session.trials.length }}</td>
                  <td>{{ session.created_at }}</td>
                </tr>
                <tr v-if="selectedSessions.length === 0">
                  <td colspan="3" class="v-data-table__empty-wrapper text-center">No related sessions</td>
                </tr>
              </tbody>
            </template>
        </v-simple-table>
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
          ></v-text-field>

          <v-text-field
            v-model="edited_subject.weight"
            label="Weight (kg)"
            type="number"
            hide-spin-buttons
            required
            :rules="[weightRule]"
          ></v-text-field>

          <v-text-field
            v-model="edited_subject.height"
            label="Height (m)"
            type="number"
            hide-spin-buttons
            required
            :rules="[heightRule]"
          ></v-text-field>
          <v-text-field
            v-model="edited_subject.age"
            label="Age (y)"
            type="number"
            hide-spin-buttons
            required
            :rules="[ageRule]"
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
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Weight', value: 'weight' },
        { text: 'Height', value: 'height' },
        { text: 'Age', value: 'age' },
        { text: 'Sex', value: 'sex_display' },
        { text: 'Gender', value: 'gender_display' },
        { text: 'Characteristics', value: 'characteristics' }
      ],
      edited_subject: {id: "", name:"", weight:"", height:"", age:"", sex_at_birth:"", gender:"", characteristics:""},
      selected: null,
      empty_subject: {id: "", name:"", weight:"", height:"", age:"", sex_at_birth:"", gender:"", characteristics:""},
      heightRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= 1.3 && v <= 3.0) return true;
        if(!isNaN(parseFloat(v)) && v > 3.0) return "It is unlikely that the height of subject is higher than 3 m. Are you using the right units? Height should be in m.";
        if(!isNaN(parseFloat(v)) && v < 1.3) return "It is unlikely that the subject is shorter than 1.3 m. Are you using the right units? Height should be in m.";
      },
      weightRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= 3 && v <= 200.0) return true;
        if(!isNaN(parseFloat(v)) && v > 200.0) return "It is unlikely that the weight of subject is higher than 200 kg. Are you using the right units? Weight should be in kg.";
        if(!isNaN(parseFloat(v)) && v < 3) return "It is unlikely that the weight of subject is lower than 3 kg. Are you using the right units? Weight should be in kg.";
      },
      ageRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= 5 && v <= 100) return true;
        if(!isNaN(parseFloat(v)) && v > 100) return "It is unlikely that the age of subject is higher than 100 years. Are you using the right units? Age should be in years.";
        if(!isNaN(parseFloat(v)) && v < 5) return "It is unlikely that the age of subject is lower than 5 years. Are you using the right units? Age should be in years.";
      }

    }
  },
    computed: {
    ...mapState({
      sessions: state => state.data.sessions,
      subjects: state => state.data.subjects,
      genders: state => state.data.genders,
      sexes: state => state.data.sexes,
    }),
    subjectsMapped () {
      return this.subjects.map(s => ({
        id: s.id,
        name: s.name,
        age: s.age,
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
      return this.sessions.filter(s => s.subject === this.selected.id)
    }
  },
  methods: {
    ...mapActions('data', [
        'loadExistingSessions', 'loadSubjects',
        'trashExistingSubject', 'restoreTrashedSubject']),
    onSelect ({ item, value }) {
      this.selected = value ? item : null
    },
    onRowClick (item, params) {
      params.select(!params.isSelected)
    },
    itemClasses (item) {
      return item.trashed ? 'trashed' : '';
    },
    async addSubject() {
      this.edit_dialog = true;
      this.edited_subject = this.empty_subject;
      console.log('add subject')
    },
    async editSubject(subject) {
      this.edit_dialog = true;
      this.edited_subject = subject;
      console.log('edit subject', subject)
    },
    async cancelSubjectForm() {
      this.edit_dialog = false;
      this.edited_subject = this.empty_subject;
    },
    async submitSubjectForm() {
      this.edit_dialog = false;

      if(this.edited_subject.id) {
        const res = await axios.put('/subjects/' + this.edited_subject.id + '/', this.edited_subject)
        console.log('update subject', res.data)
      } else {
        const res = await axios.post('/subjects/', this.edited_subject)
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
