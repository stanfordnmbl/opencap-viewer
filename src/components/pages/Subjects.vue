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
                      <v-list-item link v-else>
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
                    </v-list>
                  </v-menu>
                </div>
                <div class="cursor-pointer mt-2">{{ item.name }}</div>
              </template>
            </v-data-table>


      </v-col>
      <v-col cols="4">
      </v-col>
    </v-row>
    <v-dialog v-model="edit_dialog" width="500">
      <v-form>
      <v-card>
        <v-card-title class="headline" v-if="edited_subject">Edit subject "{{ edited_subject.name }}"</v-card-title>
        <v-card-title class="headline" v-else>Add subject</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="edited_subject.name"
            label="Name"
            required
          ></v-text-field>
          <v-text-field
            v-model="edited_subject.weight"
            label="Weight (kg)"
            required
          ></v-text-field>
          <v-text-field
            v-model="edited_subject.height"
            label="Height (m)"
            required
          ></v-text-field>
          <v-text-field
            v-model="edited_subject.age"
            label="Age (y)"
            required
          ></v-text-field>
          <v-select
              v-model="edited_subject.sex_at_birth"
              item-text="text"
              item-value="value"
              label="Sex assigned at birth (Optional)"
              :items="sexesOptions"
          ></v-select>
          <v-select
              v-model="edited_subject.gender"
              item-text="text"
              item-value="value"
              label="Gender (Optional)"
              :items="gendersOptions"
          ></v-select>
          <v-text-field
            v-model="edited_subject.characteristics"
            label="Characteristics (Optional)"
          ></v-text-field>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="edit_dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="edit_dialog = false"
          >
            Submit
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
      restore_dialog: false,
      edit_dialog: false,
      show_trashed: false,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Weight', value: 'weight' },
        { text: 'Height', value: 'height' },
        { text: 'Age', value: 'age' },
        { text: 'Sex', value: 'sex_display' },
        { text: 'Gender', value: 'gender_display' },
        { text: 'Characteristics', value: 'characteristics' }
      ],
      edited_subject: {name:"", weight:"", height:"", age:"", sex_at_birth:"", gender:"", characteristics:""},
      selected: null,
      empty_subject: {name:"", weight:"", height:"", age:"", sex_at_birth:"", gender:"", characteristics:""}
    }
  },
    computed: {
    ...mapState({
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
      return Object.entries(this.sexes).map((s) => ({ text: s[0], value: s[1] }))
    },
    gendersOptions () {
      return Object.entries(this.genders).map((s) => ({ text: s[0], value: s[1] }))
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
    }
  }
}
</script>
