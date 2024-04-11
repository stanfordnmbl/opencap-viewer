<template>
    <v-dialog v-model="edit_dialog" width="500" persistent
      @click:outside="closeDialog">

      <ValidationObserver
              tag="form"
              class="d-flex flex-column"
              ref="observer"
              v-slot="{ invalid }">
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
            label="Birth year (yyyy)"
            type="number"
            hide-spin-buttons
            required
            :rules="[birthYearRule]"
            :error="formErrors.birth_year != null"
            :error-messages="formErrors.birth_year"
          ></v-text-field>
          <v-select
              ref="subjectTagsSelect"
              clearable
              multiple
              v-model="edited_subject.subject_tags"
              item-title="text"
              item-value="value"
              label="Subject Tags"
              :items="tagsOptions"
              :rules="[subjectTagsRule]"
              :error="formErrors.subject_tags != null && formErrors.subject_tags.length != 0"
              :error-messages="formErrors.subject_tags"
          ></v-select>
          <v-select
              ref="sexAtBirthSelect"
              clearable
              v-model="edited_subject.sex_at_birth"
              item-title="text"
              item-value="value"
              label="Sex assigned at birth (Optional)"
              :items="sexesOptions"
          ></v-select>
          <v-select
              ref="genderSelect"
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

          <div class="pt-0">
            <ValidationProvider :rules="{ required: {allowFalse: false}}" v-slot="{ errors }" name="Informed consent selection">
              <v-checkbox v-model="edited_subject.terms" class="mt-0 mb-0"
                          :error="errors.length > 0"
                          :error-messages="errors[0]">
                <template v-slot:label>
                  <div>I, the research Participant, have provided informed consent to the research Investigator conducting this study.
                    I have read and I agree to the
                    <v-tooltip location="bottom">
                      <template v-slot:activator="{ props }">
                        <a href="https://www.opencap.ai/terms-conditions"
                           target="_blank"
                           v-bind="props"
                           @click.stop>Terms and Conditions</a>
                      </template>
                      Opens in new window
                    </v-tooltip>
                    and
                    <v-tooltip location="bottom">
                      <template v-slot:activator="{ props }">
                        <a href="https://docs.google.com/document/d/1DBw9LVAuUwgz713037VQjsaD8sj2-AN_hzga_7kXtXI"
                           target="_blank"
                           v-bind="props"
                           @click.stop>Privacy Policy</a>
                      </template>
                    </v-tooltip>
                    of the OpenCap tool.
                  </div>
                </template>
                Opens in new window
              </v-checkbox>
            </ValidationProvider>
          </div>

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
            :disabled="invalid"
            @click="submitSubjectForm()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
      </v-form>
      </ValidationObserver>
    </v-dialog>
</template>

<script>
import axios from 'axios'
import { mapState, mapActions } from 'vuex'

export default {
    name: 'SubjectsDialog',
    data () {
        return {
            edit_dialog: false,
            edited_subject: {
                id: "",
                name:"",
                weight:"",
                height:"",
                birth_year:"",
                sex_at_birth:"",
                gender:"",
                subject_tags:null,
                characteristics:""
            },
            empty_subject: {
                id: "",
                name:"",
                weight:"",
                height:"",
                birth_year:"",
                sex_at_birth:"",
                gender:"",
                subject_tags:null,
                characteristics:""
            },
            formErrors: {
                name: null,
                weight: null,
                height: null,
                birth_year: null,
                subject_tags: null,
            },
            heightRule: (v) => {
                if (!v.trim())
                    return true;
                if (!isNaN(parseFloat(v)) && v >= .1 && v <= 3.0)
                    return true;
                if(!isNaN(parseFloat(v)) && v > 3.0)
                    return "It seems unlikely that the subject's height exceeds 3 m. Please ensure that you are using the correct units. The height should be specified in meters (m).";
                if(!isNaN(parseFloat(v)) && v < .1)
                    return "It seems unlikely that the subject's height is less than 0.1 m. Please ensure that you are using the correct units. The height should be specified in meters (m).";
            },
            weightRule: (v) => {
                if (!v.trim())
                    return true;
                if (!isNaN(parseFloat(v)) && v >= 1 && v <= 200.0)
                    return true;
                if(!isNaN(parseFloat(v)) && v > 200.0)
                    return "It seems unlikely that the subject's weight exceeds 200 kg. Please ensure that you are using the correct units. The weight should be specified in kilograms (kg).";
                if(!isNaN(parseFloat(v)) && v < 1)
                    return "It seems unlikely that the subject's weight is less than 1 kg. Please ensure that you are using the correct units. The weight should be specified in kilograms (kg).";
            },
            birthYearRule: (v) => {
                const currentYear = new Date().getFullYear();
                if (!v)
                    return true;
                if (!isNaN(parseFloat(v)) && v >= 1900 && v <= currentYear)
                    return true;
                if(!isNaN(parseFloat(v)) && v > currentYear)
                    return `The subject's birth year cannot be set in the future. Please ensure that you are using the correct units. The birth year should be earlier than the current year ${currentYear} and specified in years (yyyy) format.`;
                if(!isNaN(parseFloat(v)) && v < 1900)
                    return "It seems unlikely that the subject's birth year predates 1900. Please ensure that you are using the correct units. The birth year should be specified in years (yyyy) format.";
            },
            subjectTagsRule: (v) => {
                if (!v) return true;
                if (Array.isArray(v) && v.length > 0)
                    return true;
                if (!Array.isArray(v))
                    return "The subject tags must be contained in an array.";
                if (Array.isArray(v) && v.length == 0)
                    return "You must add at least one subject tag. For subjects with no conditions, select 'Unimpaired'.";
            }
        }
    },
    computed: {
        ...mapState({
            sessions: state => state.data.sessions,
            genders: state => state.data.genders,
            subjectTags: state => state.data.subjectTags,
            sexes: state => state.data.sexes,
        }),
        gendersOptions () {
            return Object.entries(this.genders).map((s) => ({ text: s[1], value: s[0] }))
        },
        tagsOptions () {
            return Object.entries(this.subjectTags).map((s) => ({ text: s[1], value: s[0] }))
        },
        sexesOptions () {
            return Object.entries(this.sexes).map((s) => ({ text: s[1], value: s[0] }))
        }
    },
    mounted () {
      this.loadSubjectTags()
    },
    methods: {
        ...mapActions('data', ['loadSubjects', 'loadSubjectTags']),
        closeDialog() {
          if (this.$refs.subjectTagsSelect.isMenuActive || this.$refs.sexAtBirthSelect.isMenuActive || this.$refs.genderSelect.isMenuActive)
            this.edit_dialog = true;
          else
            this.edit_dialog = false;
        },
        async cancelSubjectForm() {
            this.edit_dialog = false;
            this.edited_subject = this.empty_subject;
            this.formErrors = {
                name: null,
                weight: null,
                height: null,
                birth_year: null,
                subject_tags: null,
            }
        },
        async submitSubjectForm() {
            this.edit_dialog = false;
            this.formErrors = {
                name: null,
                weight: null,
                height: null,
                birth_year: null,
                subject_tags: null,
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
                if (res && res.data) {
                    this.clearEditedSubject();
                } else {
                    this.edit_dialog = true;
                }
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
                if (res && res.data) {
                    this.clearEditedSubject();
                } else {
                    this.edit_dialog = true;
                }
            }

            this.edited_subject = this.empty_subject;
            await this.loadSubjects();
        },
        clearEditedSubject() {
            this.edited_subject.id = "";
            this.edited_subject.name = "";
            this.edited_subject.weight = "";
            this.edited_subject.height = "";
            this.edited_subject.birth_year = "";
            this.edited_subject.sex_at_birth = "";
            this.edited_subject.gender = "";
            this.edited_subject.subject_tags = null;
            this.edited_subject.characteristics = "";
        },
        async addSubject() {
            this.edit_dialog = true;
            this.edited_subject = this.empty_subject;
            this.formErrors = {
                name: null,
                weight: null,
                height: null,
                birth_year: null,
                subject_tags: null,
            }
            console.log('add subject')
        }
    },
}
</script>