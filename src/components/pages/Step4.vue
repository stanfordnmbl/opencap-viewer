<template>
  <MainLayout
    leftButton="Back"
    :rightButton="rightButtonCaption"
    :step="4"
    :rightDisabled="busy || disabledNextButton"
    :rightSpinner="busy && !imgs"
    @left="$router.push(`/${session.id}/step2`)"
    @right="onNext"
  >
    <v-card v-if="imgs" class="step-4-1 pa-2 d-flex flex-column">
      <v-card-title class="justify-center"> Verify neutral pose </v-card-title>

      <v-card-text class="d-flex flex-grow-1 scroll-y">
        <div
          v-for="(imgCol, colIndex) in imgCols"
          :key="colIndex"
          class="d-flex flex-column"
        >
          <img
            v-for="(img, imgIndex) in imgCol"
            :key="imgIndex"
            :src="img"
            width="150"
            class="ma-1"
          />
        </div>
      </v-card-text>
    </v-card>

    <div v-else class="step-4-1 d-flex flex-column">

      <v-card class="mb-4">
        <v-card-title class="justify-center subject-title">
          Session Info
        </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="11">
                <v-autocomplete
                  ref="selectSubjectsRef"
                  required
                  v-model="subject"
                  item-text="display_name"
                  item-value="id"
                  label="Subject"
                  :items="loaded_subjects"
                  :loading="subject_loading"
                  :search-input.sync="subject_search"
                  return-object
                >
                  <template v-slot:append-item>
                    <div v-intersect="loadNextSubjectsListPage" />
                  </template>
                </v-autocomplete>

<!--                <v-select-->
<!--                    ref="selectSubjectsRef"-->
<!--                    @click="reloadSubjects"-->
<!--                    @input="isAllInputsValidSelectSubject"-->
<!--                    class="cursor-pointer"-->
<!--                    required-->
<!--                    v-model="subject"-->
<!--                    item-text="display_name"-->
<!--                    item-value="id"-->
<!--                    label="Subject"-->
<!--                    :items="subjectSelectorChoices"-->
<!--                    return-object-->
<!--                ></v-select>-->
              </v-col>
              <v-col cols="1">
                <v-btn
                  icon
                  @click="openNewSubjectPopup">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-text-field
              v-model="sessionName"
              label="Session Name (optional)"
              type="text"
              required
              :error="formErrors.name != null"
              :error-messages="formErrors.name"
            ></v-text-field>
          </v-card-text>
      </v-card>

      <v-card class="mb-4">
        <div class="d-flex justify-center">
          <v-card-title class="justify-center data-title">
            Data sharing agreement
          </v-card-title>
          <v-tooltip bottom="">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
            </template>
            The information on this page as well as videos of your movement are
            uploaded to a secure cloud server for processing. Please have the
            subject select their data sharing preferences below. Identified
            videos do not have the face blurred, de-identified videos have faces
            blurred, and processed data (e.g., joint angles) is de-identified.
            Please read our privacy terms for details.
          </v-tooltip>
        </div>

        <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
          <ValidationObserver
            tag="div"
            class="d-flex flex-column checkbox-box"
            ref="observer"
          >
            <v-checkbox
              v-model="data_sharing_0"
              @click="isAllInputsValid"
              label="The subject understands that the recorded identified videos and processed data are stored in secure PHI-compliant storage and agrees to share them with the OpenCap development team for algorithm development. We may use this data in scientific publications, but will only publicly share the data that the subject agrees to share below."
              :rules="[checkboxRule]"
              required=""
            ></v-checkbox>

            <ValidationProvider
              rules="required"
              v-slot="{ errors }"
              name="Data sharing agreement"
            >
              <v-select
                v-model="data_sharing"
                label="Please select which data the subject is willing to share publicly; we encourage the subject to share as much as they feel comfortable."
                @change="isAllInputsValid"
                :items="data_sharing_choices"
                :error="errors.length > 0"
                :error-messages="errors[0]"
              />
            </ValidationProvider>
          </ValidationObserver>
        </v-card-text>
      </v-card>
 
    <div class="d-flex justify-center">
        <template>
        <div class="text-center">
          <v-btn
            color="primary-dark"
            class="mt-4 mb-4 ml-4 mr-4"
            x-large
            @click="openAdvancedSettings"
          >
            Advanced Settings
          </v-btn>

          <v-dialog
            v-model="advancedSettingsDialog"
            scrollable
            width="700px"
            max-height="400px"
          >
            <v-card height="fit-content">
              <v-card-actions class="justify-end">
                <v-btn color="primary-dark" @click="advancedSettingsDialog = false">✖</v-btn>
              </v-card-actions>

              <v-card-title class="justify-center data-title">
                <span class="mr-2">Scaling setup</span>
                <v-tooltip bottom="" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
                  </template>
                  OpenCap uses data from the neutral pose to scale the musculoskeletal model to the anthropometry of the subject.
                  By default, OpenCap assumes that the subject is standing with an upright posture and the feet pointing forward (i.e., straight back and no bending or rotation at the hips, knees, or ankles) as shown in the example neutral pose. These assumptions are modeled in the OpenSim scaling setup.
                  If the subject cannot adopt this pose, you can select the "Any pose" scaling setup, which does not assume any specific posture but still requires all body segments to be visible by at least two cameras.
                  We recommend using the default scaling setup unless the subject cannot adopt the upright standing neutral pose.
                </v-tooltip>
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
                <v-select
                    v-model="scaling_setup"
                    label="Select scaling setup"
                    v-bind:items="scaling_setups"
                  />
              </v-card-text>

              <v-card-title class="justify-center data-title">
                <span class="mr-2">Human pose estimation model</span>
                <v-tooltip bottom="" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
                  </template>
                  OpenCap supports two human pose estimation models: OpenPose and HRNet. We recommend using OpenPose for computation speed, but both models provide similar accuracy.
                  OpenPose is restricted to academic or non-profit organization non-commercial research use (consult the license at https://github.com/CMU-Perceptual-Computing-Lab/openpose/blob/master/LICENSE).
                  HRNet, as implemented by Open-MMLab, has a permissive Apache 2.0 license (consult the license at https://github.com/open-mmlab/mmpose/blob/master/LICENSE).
                  Please ensure that you have the rights to use the model you select. The OpenCap authors deny any responsibility regarding license infringement.
                </v-tooltip>
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
                <v-select
                    v-model="pose_model"
                    label="Select human pose estimation model"
                    v-bind:items="pose_models"
                  />
              </v-card-text>
  
              <v-card-title class="justify-center data-title">
                Framerate
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
                <v-select
                    v-model="framerate"
                    label="Select framerate"
                    v-bind:items="framerates_available"
                    @change="updateFrequency"
                  />
              </v-card-text>

              <v-card-title class="justify-center data-title">
                <span class="mr-2">Musculoskeletal model</span>
                <v-tooltip bottom="" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
                  </template>
                  Full body model: Musculoskeletal model with 33 degrees of freedom from Lai et al. 2017 (https://pubmed.ncbi.nlm.nih.gov/28900782/) with modified hip abductor muscle paths from Uhlrich et al. 2022 (https://pubmed.ncbi.nlm.nih.gov/35798755/). Recommended for primarily lower extremity tasks (e.g., gait).
                  <br><br>
                  Full body model with ISB shoulder: Incorporates a 6 degree-of-freedom shoulder complex joint. It incorporates a scapulothoracic body with 3 translational degrees of freedom relative to the torso. The glenohumoral joint uses the Y-X-Y rotation sequence (elevation plane, elevation, rotation) recommended by the ISB (https://pubmed.ncbi.nlm.nih.gov/15844264/). Recommended for upper extremity tasks (e.g., pitching).
                </v-tooltip>
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
                <v-select
                    v-model="openSimModel"
                    label="Select musculoskeletal model"
                    v-bind:items="openSimModels"
                  />
              </v-card-text>

              <v-card-title class="justify-center data-title">
                <span class="mr-2">Marker augmenter model</span>
                <v-tooltip bottom="" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
                  </template>
                  OpenCap uses an LSTM model, also called marker augmenter model, to predict the 3D position of 43 anatomical markers from the 3D position of 20 video keypoints (https://www.biorxiv.org/content/10.1101/2022.07.07.499061v1). 
                  The anatomical markers are used as input to OpenSim to compute joint angles using inverse kinematics.
                  <br><br>
                  The latest model (v0.3, default) is more accurate and more robust to different activities than v0.2. We recommend using it for new studies. 
                  It was trained on 1475 hours of motion capture data and resulted in an RMSE of 4.4 +/- 0.3 deg (OpenPose) and 4.1 +/- 0.3 deg (HRnet) for joint angles across 18 degrees of freedom.
                  <br><br>                  
                  The original model (v0.2) underwent training using 708 hours of motion capture data, yielding an RMSE of 4.8 +/- 0.2 deg (OpenPose and HRNet) for joint angles across 18 degrees of freedom. 
                  <br><br>
                  The performance evaluation was conducted in comparison to marker-based motion capture using data from 10 subjects performing 4 different types of activities (walking, squatting, sit-to-stand, and drop jumps). 
                  The dataset used for training the latest model (v0.3) contains data from more subjects and from a more diverse set of tasks; model v0.3 is therefore expected to be more accurate for a wider variety of tasks and to yield more accurate results.
                  We recommend using v0.3 for new studies but warn users that we might still adjust the model in the future. 
                  If you would like to use the model that was default prior to 07-30-2023, select v0.2.
                </v-tooltip>
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
                <v-select
                    v-model="augmenter_model"
                    label="Select marker augmenter model"
                    v-bind:items="augmenter_models"
                  />
              </v-card-text>

              <v-card-title class="justify-center data-title">
                <span class="mr-2">Filter frequency</span>
                <v-tooltip bottom="" max-width="500px">
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
                  </template>
                  OpenCap uses a low-pass Butterworth filter to smooth the 2D video keypoints. The filter frequency is the cutoff frequency of the filter.
                  <br><br>                  
                  By default, OpenCap uses a filter frequency of half the framerate (if the framerate is 60fps, the filter frequency is 30Hz), except for gait activities, for which the filter frequency is 12Hz.
                  <br><br>
                  You can here enter a different filter frequency. WARNING: this filter frequency will be applied to ALL motion trials of your session. As per the Nyquist Theorem, the filter frequency should be less than half the framerate.
                  If you enter a filter frequency higher than half the framerate, we will use half the framerate as the filter frequency instead.
                  <br><br>
                  We recommend consulting the literature to find a suitable filter frequency for your specific tasks. If you are unsure, we recommend using the default filter frequency.
                </v-tooltip>
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
                <v-combobox
                :key="componentKey"
                v-model="tempFilterFrequency"
                label="Enter frequency (Hz) or choose default"
                :items="filter_frequencies"
                :allow-custom="true"
                :return-object="false"
                @change="validateAndSetFrequency"
                item-text="text"
                item-value="value"
                ></v-combobox>
              </v-card-text>
            </v-card>
          </v-dialog>
        </div>
      </template>
    </div>
    </div>

    <v-card class="step-4-2 ml-4 d-flex images-box">

      <v-card class="mb-0">
        <v-card-text style="padding-top: 5; padding-bottom: 0; font-size: 16px;">
        <p>{{ n_videos_uploaded }} of {{ n_calibrated_cameras }} videos uploaded</p>
        </v-card-text>
      </v-card>

      <v-card-title class="justify-center">
        Record neutral pose
      </v-card-title>
      <v-card-text class="d-flex justify-center align-center">
        <div class="d-flex flex-column mr-4">
          <ul>
            <li>
              The subject should adopt the example neutral pose
              <ul>
                <li class="space-above-small">Upright standing posture with feet pointing forward</li>
                <li class="space-above-small">Straight back and no bending or rotation at the hips, knees, or ankles</li>
              </ul>
            </li>
            <li class="space-above-small">The subject should stand still</li>
            <li class="space-above-small">
              The subject should be visible by all cameras 
              <ul>
                <li class="space-above-small">Nothing in the way
                  of cameras view when hitting Record</li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="d-flex flex-column align-center ">
          <span class="sub-header" style="font-size: 18px;">Example neutral pose</span>
          <ExampleImage
            image="/images/step-4/big_good_triangle.jpg"
            :width="256"
            :height="341"
            good
          />
        </div>
      </v-card-text>
      <v-card-title class="justify-center" style="font-size: 18px; word-break: keep-all;">
        If the subject cannot adopt the example neutral pose, select "Any pose" scaling setup under Advanced Settings
      </v-card-title>

    </v-card>
  
    <DialogComponent
      ref="dialogRef"
    />

  </MainLayout>
</template>

<script>
import axios from "axios";
import { mapMutations, mapActions, mapState } from "vuex";
import { apiError, apiSuccess, apiErrorRes, apiWarning, apiInfo, clearToastMessages } from "@/util/ErrorMessage.js";
import MainLayout from "@/layout/MainLayout";
import ExampleImage from "@/components/ui/ExampleImage";
import DialogComponent from '@/components/ui/SubjectDialog.vue'

export default {
  name: "Step4",
  components: {
    MainLayout,
    ExampleImage,
    DialogComponent
  },
  data() {
    return {
      formErrors: {
        name: null,
        weight: null,
        height: null,
        birth_year: null,
        data_sharing_agreement: null,
        subject_tags: null,
      },
      advancedSettingsDialog: false,
      selected: null,

      subject_search: "",
      subject_loading: false,
      subject_start: 0,
      loaded_subjects: [],

      sessionName: "",
      subject: null,
      identifier: "",
      weight: 70,
      height: 1.8,
      data_sharing_0: false,
      birth_year: "",
      data_sharing: "",
      sex: "",
      gender: "",
      data_sharing_choices: [
        "Share processed data and identified videos",
        "Share processed data and de-identified videos",
        "Share processed data",
        "Share no data",
      ],
      scaling_setup: 'upright_standing_pose',
      scaling_setups: [
        {"text": "Upright standing pose (recommended, default)", "value": "upright_standing_pose"},
        {"text": "Any pose (in beta, feedback welcome)", "value": "any_pose"},
      ],
      pose_model: 'hrnet',
      pose_models: [
        {"text": "HRNet (recommended, default)", "value": "hrnet"},
        {"text": "OpenPose (non-commercial research use only)", "value": "openpose"},
      ],
      framerate: 60,
      framerates_available: [
        {"text": "60fps (max recording time: 60s, default)", "value": 60},
      ],
      openSimModel: 'LaiUhlrich2022',
      openSimModels: [
        {"text": "Full body model (default)", "value": "LaiUhlrich2022"},
        {"text": "Full body model with ISB shoulder (in beta, feedback welcome)", "value": "LaiUhlrich2022_shoulder"},
      ],
      augmenter_model: 'v0.3',
      augmenter_models: [        
        {"text": "v0.3 (default)", "value": "v0.3"},
        {"text": "v0.2 (old model, default until 07-30-2023)", "value": "v0.2"},
      ],
      filter_frequency: 'default',
      filter_frequencies: [        
        {"text": "12Hz for gait, half the framerate otherwise (default)", "value": "default"},
      ],
      busy: false,
      disabledNextButton: true,
      imgs: null,
      lastPolledStatus: "",
      buttonCaptions: {
        recording: "Recording",
        uploading: "Processing",
        done: "Confirm",
        error: "Re-record",
        stopped: "Processing",
      },
      checkboxRule: (v) => !!v || 'The subject must agree to continue!',

      n_calibrated_cameras: 0,
      n_cameras_connected: 0,
      n_videos_uploaded: 0,

      tempFilterFrequency: 'default', // Temporary input holder
      componentKey: 0,
    };
  },
  computed: {
    ...mapState({
      // subjects: (state) => state.data.subjects,
      session: (state) => state.data.session,
      trialId: (state) => state.data.trialId,
      genders: state => state.data.genders,
      sexes: state => state.data.sexes,
    }),
    subjectSelectorChoices() {
      return this.subjectsMapped;
    },
    subjectsMapped () {
      return this.subjects.map(s => ({
        id: s.id,
        display_name: `${s.name} (${s.weight} Kg, ${s.height} m, ${s.birth_year})`,
        name: s.name,
        birth_year: s.birth_year,
        subject_tags: s.subject_tags,
        characteristics: s.characteristics,
        gender: s.gender,
        gender_display: this.genders[s.gender],
        sex_at_birth: s.sex_at_birth,
        sex_display: this.sexes[s.sex_at_birth],
        height: s.height,
        weight: s.weight,
        created_at: s.created_at,
        trashed: s.trashed,
        trashed_at: s.trashed_at
      })).filter(s => this.show_trashed || !s.trashed)
    },
    rightButtonCaption() {
      return this.imgs
        ? "Confirm"
        : this.busy
        ? this.lastPolledStatus
          ? this.buttonCaptions[this.lastPolledStatus]
          : "Record"
        : "Record";
    },
    imgCols() {
      let res = [];
      let iRes = null;
      let i = 0;
      for (let i = 0; i < this.imgs.length; i++) {
        if (i % 2 == 0) {
          iRes = [this.imgs[i]];
        } else {
          iRes.push(this.imgs[i]);
          res.push(iRes);
          iRes = null;
        }
      }
      if (iRes) {
        res.push(iRes);
      }
      return res;
    },
    smallWidth() {
      return 140;
    },
    smallHeight() {
      return this.smallWidth * 1.33;
    },
    errorsConsole() {
      return this.errors;
    },
  },
  async mounted() {
    apiInfo("You can now record a neutral pose different than the upright standing pose (e.g., sitting). Select 'Any pose' 'Advanced Settings'.", 8000);
    this.loadSession(this.$route.params.id)
    // this.loadSubjects()
    if (this.$route.query.autoRecord) {
      this.onNext();
    }

    const res = await axios.get(`/sessions/${this.$route.params.id}/get_n_calibrated_cameras/`, {})

    this.n_calibrated_cameras = res.data.data
  },
  watch: {
    subjects(new_val, old_val) {
      // If no subjects, do nothing.
      if (old_val.length === 0 & new_val.length === 0) {
          return
      // If loading first time and there are subjects, select first.
      } if (old_val.length === 0 & new_val.length !== 0) {
          this.subject = new_val[0]
      // If there are more subjects now than before, that means a new one has been created. Select it.
      } else if (old_val.length < new_val.length) {
          const serializedArr1 = new Set(old_val.map(item => JSON.stringify(item)));

          // Find the index by comparing serialized objects
          this.subject = new_val[new_val.findIndex(item => !serializedArr1.has(JSON.stringify(item)))];
      // Else, do nothing.
      } else return

    },
    subject_search (val) {
      this.subject_start = 0;
      this.loadSubjectsList()
    }
  },
  methods: {
    ...mapMutations("data", ["setStep4", "setStep3"]),
    ...mapActions("data", ["loadSubjects", "loadSession"]),
    isSomeInputInvalid(state, input) {
      setTimeout(() => {
        this.formErrors[input] = state;
      },0)
    },
    loadSubjectsList (append_result = false) {
      console.log('loading subjects:', this.subject_search)

      this.subject_loading = true
      let data = {
        search: this.subject_search,
        start: this.subject_start,
        quantity: 40,
        simple: 'true'
      }
      let res = axios.get('/subjects/', {params: data}).then((res) => {
        if (append_result) {
          this.loaded_subjects = [...this.loaded_subjects, ...res.data.subjects]
        } else {
          this.loaded_subjects = res.data.subjects
        }
        // this.subject_loading = false
        this.subject_loading = false
      }).catch((error) => {
        this.subject_loading = false
        apiError(error)
      })

    },
    loadNextSubjectsListPage (isIntersecting) {
      if (isIntersecting) {
        this.subject_start += 40
        this.loadSubjectsList(true)
      }
    },
    reloadSubjects() {
      console.log('reloading subjects')
      // this.loadSubjects()
    },
    openNewSubjectPopup() {
        this.$refs.dialogRef.edit_dialog = true
    },
    isAllInputsValidSelectSubject() {
        this.formErrors = {
            name: null,
            weight: null,
            height: null,
            birth_year: null,
            subject_tags: null,
        }

        let inputsInvalidSecond;
        if(!this.subject || !this.data_sharing || !this.data_sharing_0 ) {
            inputsInvalidSecond = true
        }

        inputsInvalidSecond ? this.disabledNextButton = true : this.disabledNextButton = false
    },
    isAllInputsValid() {
        this.formErrors = {
            name: null,
            weight: null,
            height: null,
            birth_year: null,
            subject_tags: null,
        }

        let inputsInvalidSecond;
        if(this.subject === null || this.subject.id === 'new' || !this.subject || !this.data_sharing || !this.data_sharing_0 ) {
            inputsInvalidSecond = true
        }

        inputsInvalidSecond ? this.disabledNextButton = true : this.disabledNextButton = false
    },
    async onNext() {
      if (this.imgs) {
        // Confirm
        this.$router.push({
          name: "Session",
          params: {
            id: this.session.id,
          },
        });
      } else {
        if (await this.$refs.observer.validate()) {
          this.lastPolledStatus = "";
          // Record press
          this.busy = true;
          this.setStep4({
              subject: this.subject,
            // identifier: this.identifier,
            // weight: this.weight,
            // height: this.height,
            // sex: this.sex,
            // gender: this.gender,
            data_sharing: this.data_sharing,
            scaling_setup: this.scaling_setup,
            pose_model: this.pose_model,
            framerate: this.framerate,
            openSimModel: this.openSimModel,
            augmenter_model: this.augmenter_model,
            filter_frequency: this.filter_frequency,
          });
          try {
            const resUpdate = await axios.get(
              `/sessions/${this.session.id}/set_metadata/`,
              {
                params: {
                  // subject_id: this.identifier,
                  // subject_mass: this.weight,
                  // subject_height: this.height,
                  // subject_sex: this.sex,
                  // subject_gender: this.gender,
                  settings_data_sharing: this.data_sharing,
                  settings_scaling_setup: this.scaling_setup,
                  settings_pose_model: this.pose_model,
                  settings_framerate: this.framerate,
                  settings_session_name: this.sessionName,
                  settings_openSimModel: this.openSimModel,
                  settings_augmenter_model: this.augmenter_model,
                  settings_filter_frequency: this.filter_frequency,            
                },
              }
            );

            const resSubject = await axios.get(
                `/sessions/${this.session.id}/set_subject/`,
                {
                    params: {
                        subject_id: this.subject.id,
                    }
                }
            )
            const res = await axios.get(
              `/sessions/${this.session.id}/record/`,
              {
                params: {
                  name: "neutral",
                  subject_id: this.identifier,
                  subject_mass: this.weight,
                  subject_height: this.height,
                  subject_sex: this.sex,
                  subject_gender: this.gender,
                  subject_data_sharing: this.data_sharing,
                  subject_pose_model: this.pose_model,
                },
              }
            );
            this.setStep3(res.data.id); // sets trialID
            this.pollStatus();
          } catch (error) {
            apiError(error);
          }
        }
      }
    },
    async pollStatus() {
      try {
        //const res = await axios.get(`/sessions/1966df9a-0a60-4365-9404-43e53750b784/neutral_img/`)
        const res = await axios.get(
          `/sessions/${this.session.id}/neutral_img/`
        );
        // test
        /*
        this.imgs = [
          '/images/neutral_pose.png',
          '/images/neutral_pose.png',
          '/images/neutral_pose.png',
          '/images/neutral_pose.png',
          '/images/neutral_pose.png',
          //'/images/neutral_pose.png'
        ]
        this.busy = false
        */
        switch (res.data.status) {
          case "done": {
            this.$toasted.clear()
            this.$router.push({
              name: "Session",
              params: {
                id: this.session.id,
              },
            });
            //this.imgs = res.data.img
            //this.busy = false
            break;
          }
          case "error": {
            const resTrial = await axios.get(`/trials/${this.trialId}/`);
            this.$toasted.clear();
            apiErrorRes(resTrial, "Error in processing neutral pose");
            this.busy = false;

            const resStatus = await axios.get(`/sessions/${this.$route.params.id}/status/`, {})

            this.n_cameras_connected = resStatus.data.n_cameras_connected
            this.n_videos_uploaded = resStatus.data.n_videos_uploaded

            const resCalibratedCameras = await axios.get(`/sessions/${this.$route.params.id}/get_n_calibrated_cameras/`, {})

            this.n_calibrated_cameras = resCalibratedCameras.data.data

            if (this.n_videos_uploaded !== this.n_calibrated_cameras) {
              const num_missing_cameras = this.n_calibrated_cameras - this.n_videos_uploaded
              apiError(this.n_calibrated_cameras + " devices expected and " + this.n_videos_uploaded + " videos were uploaded. Please reconnect the missing " + num_missing_cameras + " devices to the session using the QR code at the top of the screen.");
            }

            break;
          }
          default: {
            const resStatus = await axios.get(`/sessions/${this.$route.params.id}/status/`, {})

            this.n_videos_uploaded = resStatus.data.n_videos_uploaded

            if (
              res.data.status === "processing" &&
              res.data.status !== this.lastPolledStatus
            ) {
              apiInfo("Processing: the subject can relax.", 5000);
            }
            this.lastPolledStatus = res.data.status;
            window.setTimeout(this.pollStatus, 1000);
            break;
          }
        }
      } catch (error) {
        apiError(error);
      }
    },
    openAdvancedSettings() {
      this.advancedSettingsDialog = true;
      this.getAvailableFramerates()
    },
    async getAvailableFramerates() {
      const session_settings = await axios.get(`/sessions/${this.session.id}/get_session_settings/`)
      // If the session has framerates.
      if('data' in session_settings && 'framerates' in session_settings.data) {
        this.framerates_available = []
        // Push them to available framerates
        session_settings.data.framerates.forEach(element => {
          if(element == 60) {
            this.framerates_available.push({"text": "60fps (max recording time: 60s, default)", "value": 60})
          } else if(element == 120) {
            this.framerates_available.push({"text": "120fps (max recording time: 30s)", "value": 120})
          } else if(element == 240) {
            this.framerates_available.push({"text": "240fps (max recording time: 15s)", "value": 240})
          }
        });
      }
      // If not, or we did not recognize them (different to 60, 120 or 240), set 60 as default.
      if(this.framerates_available.length == 0) {
        this.framerates_available.push({"text": "60fps (max recording time: 60s, default)", "value": 60})
      }
    },
    updateFrequency() {
      const maxAllowedFrequency = this.framerate / 2;
      if (this.filter_frequency > maxAllowedFrequency) {
        this.filter_frequency = maxAllowedFrequency
        this.tempFilterFrequency = maxAllowedFrequency
        apiWarning("Too large filter frequency. Using half the framerate (" + maxAllowedFrequency + "Hz) instead.");
      }
    },
    validateAndSetFrequency() {
      const maxAllowedFrequency = this.framerate / 2;

      if (this.tempFilterFrequency === 'default') {
        this.filter_frequency = 'default';
      } else {
        const inputFrequency = parseFloat(this.tempFilterFrequency);
        if (!isNaN(inputFrequency) && inputFrequency > 0) {
          if (inputFrequency > maxAllowedFrequency) {
            this.filter_frequency = `${maxAllowedFrequency}`;
            apiWarning("Too large filter frequency. Using half the framerate (" + maxAllowedFrequency + "Hz) instead.");
          } else {
            this.filter_frequency = `${inputFrequency}`;
          }
        } else {
          apiWarning("Invalid filter frequency. Using default.");
          this.filter_frequency = 'default';
        }
      }
      this.tempFilterFrequency = this.filter_frequency;
      this.componentKey += 1;
    },
  },
};
</script>

<style lang="scss">
.step-4-1 {
  flex: 0 0 50%;
  li {
    font-size: 16px;
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
}
.step-4-2 {
  flex-grow: 1;
  h1 {
    line-height: 1.15;
  }
}

.subject-details {
  min-width: 100%;
  &>span>div {
    padding-top: 0;
  }
}

.form-divider {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
}

//.subject-title {
//  padding-bottom: 0;
//}

.images-box {
  display: flex;
  flex-direction: column;
  height: fit-content;

  ul {
    font-size: 16px;
  }
}

//.checkbox-wrapper {
//  padding-top: 0;
//}

.checkbox-box > div {
  margin-top: 0;
}

.centered-settings {
    position: fixed;
    width: 50%;
    text-align: center;
    top: 25%;
    left: 50%;
    padding: 20px;
    transform: translate(-50%, 0);
    display: none;
}

.overlay-panel {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0.6;
    display: none;
}

.space-above-small {
  margin-top: 15px; /* Adjust the value as needed */
}

.space-above-large {
  margin-top: 20px; /* Adjust the value as needed */
  font-size: 20px;  /* Adjust the font size as needed */
  font-weight: bold;
}

//.data-title {
//  padding-bottom: 7px;
//}
</style>
