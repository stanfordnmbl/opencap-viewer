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
          <v-select
              @click="reloadSubjects"
              @change="isAllInputsValid"
              class="cursor-pointer"
              required
              v-model="subject"
              item-text="display_name"
              item-value="id"
              label="Subject"
              :items="subjectSelectorChoices"
              return-object
          ></v-select>
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
            v-slot="{ }"
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
                <span class="mr-2">Select human pose estimation model</span>
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
                    label="Human pose estimation model"
                    v-bind:items="pose_models"
                  />
              </v-card-text>
  
              <v-card-title class="justify-center data-title">
                Select framerate
              </v-card-title>
              <v-card-text class="d-flex flex-column align-center checkbox-wrapper">
                <v-select
                    v-model="framerate"
                    label="Framerate"
                    v-bind:items="framerates_available"
                  />
              </v-card-text>

              <v-card-title class="justify-center data-title">
                <span class="mr-2">Select musculoskeletal model</span>
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
                    label="Musculoskeletal model"
                    v-bind:items="openSimModels"
                  />
              </v-card-text>

              <v-card-title class="justify-center data-title">
                <span class="mr-2">Select marker augmenter model</span>
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
                    label="Marker augmenter model"
                    v-bind:items="augmenter_models"
                  />
              </v-card-text>
            </v-card>
          </v-dialog>
        </div>
      </template>
    </div>
    </div>

    <v-card class="step-4-2 ml-4 d-flex images-box">

      <v-card class="mb-0">
        <v-card-text style="padding-top: 0; padding-bottom: 0">
        <p>
        <p>{{ n_videos_uploaded }} of {{ n_calibrated_cameras }} videos uploaded.</p>
        </v-card-text>
      </v-card>


        <v-card-title class="justify-center">
          Record a neutral pose
        </v-card-title>

        <v-card-text class="d-flex flex-column align-center">
          <ul>
            <li>The subject should adopt the example neutral pose</li>
            <li>The subject should stand still</li>
            <li>
              The subject should be visible by all cameras (nothing in the way
              of cameras view when hitting Record)
            </li>
          </ul>
        </v-card-text>
      <v-card-text class="d-flex justify-center">
        <div class="d-flex flex-column">
          <div class="d-flex flex-column align-center">
            <span class="sub-header">Example neutral pose</span>

            <ExampleImage
              image="/images/step-4/big_good_triangle.jpg"
              :width="256"
              :height="341"
              good
            />
          </div>

          <div class="d-flex mt-4">
            <ExampleImage
              class="mr-3"
              image="/images/step-4/bottom_1st_left_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />

            <ExampleImage
              image="/images/step-4/bottom_1st_right_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />
          </div>
        </div>

        <div class="d-flex flex-column ml-4">
          <div class="d-flex mb-3">
            <ExampleImage
              class="mr-3"
              image="/images/step-4/top_left_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />

            <ExampleImage
              image="/images/step-4/top_right_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />
          </div>

          <div class="d-flex mb-3">
            <ExampleImage
              class="mr-3"
              image="/images/step-4/middle_left_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />

            <ExampleImage
              image="/images/step-4/middle_right_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />
          </div>

          <div class="d-flex">
            <ExampleImage
              class="mr-3"
              image="/images/step-4/bottom_2nd_left_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />

            <ExampleImage
              image="/images/step-4/bottom_2nd_right_bad.jpg"
              :width="smallWidth"
              :height="smallHeight"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
  
    <v-dialog v-model="new_subject_dialog" width="500">
      <ValidationObserver
        tag="form"
        class="d-flex flex-column"
        ref="subject_observer"
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
    
  </MainLayout>
</template>

<script>
import axios from "axios";
import { mapMutations, mapActions, mapState } from "vuex";
import { apiError, apiSuccess, apiErrorRes, apiInfo, clearToastMessages } from "@/util/ErrorMessage.js";
import MainLayout from "@/layout/MainLayout";
import ExampleImage from "@/components/ui/ExampleImage";

export default {
  name: "Step4",
  components: {
    MainLayout,
    ExampleImage,
  },
  data() {
    return {
      formErrors: {
        name: null,
        weight: null,
        height: null,
        birth_year: null,
        data_sharing_agreement: null,
      },
      advancedSettingsDialog: false,
      new_subject_dialog: false,
      edited_subject: {id: "", name:"", weight:"", height:"", birth_year:"", sex_at_birth:"", gender:"", characteristics:""},
      selected: null,
      empty_subject: {id: "", name:"", weight:"", height:"", birth_year:"", sex_at_birth:"", gender:"", characteristics:""},

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
      pose_model: 'openpose',
      pose_models: [
        {"text": "OpenPose (recommended, non-commercial research use only, default)", "value": "openpose"},
        {"text": "HRNet", "value": "hrnet"},
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
      heightRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= .1 && v <= 3.0) return true;
        if(!isNaN(parseFloat(v)) && v > 3.0) return "It seems unlikely that the subject's height exceeds 3 m. Please ensure that you are using the correct units. The height should be specified in meters (m).";
        if(!isNaN(parseFloat(v)) && v < .1) return "It seems unlikely that the subject's height is less than 0.1 m. Please ensure that you are using the correct units. The height should be specified in meters (m).";
      },
      weightRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= 1 && v <= 200.0) return true;
        if(!isNaN(parseFloat(v)) && v > 200.0) return "It seems unlikely that the subject's weight exceeds 200 kg. Please ensure that you are using the correct units. The weight should be specified in kilograms (kg).";
        if(!isNaN(parseFloat(v)) && v < 1) return "It seems unlikely that the subject's weight is less than 1 kg. Please ensure that you are using the correct units. The weight should be specified in kilograms (kg).";
      },
      birthYearRule: (v) => {
        const currentYear = new Date().getFullYear();
        if (!v) return true;
        if (!isNaN(parseFloat(v)) && v >= 1900 && v <= currentYear) return true;
        if(!isNaN(parseFloat(v)) && v > currentYear) return `The subject's birth year cannot be set in the future. Please ensure that you are using the correct units. The birth year should be earlier than the current year ${currentYear} and specified in years (yyyy) format.`;
        if(!isNaN(parseFloat(v)) && v < 1900) return "It seems unlikely that the subject's birth year predates 1900. Please ensure that you are using the correct units. The birth year should be specified in years (yyyy) format.";
      },
      checkboxRule: (v) => !!v || 'The subject must agree to continue!',

      n_calibrated_cameras: 0,
      n_cameras_connected: 0,
      n_videos_uploaded: 0
    };
  },
  computed: {
    ...mapState({
      subjects: (state) => state.data.subjects,
      session: (state) => state.data.session,
      trialId: (state) => state.data.trialId,
      genders: state => state.data.genders,
      sexes: state => state.data.sexes,
    }),
    subjectSelectorChoices() {
      return [{'id':'new', 'display_name': 'New subject'}].concat(this.subjectsMapped);
    },
    subjectsMapped () {
      return this.subjects.map(s => ({
        id: s.id,
        display_name: `${s.name} (${s.weight} Kg, ${s.height} m, ${s.birth_year})`,
        name: s.name,
        birth_year: s.birth_year,
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
    sexesOptions () {
      return Object.entries(this.sexes).map((s) => ({ text: s[1], value: s[0] }))
    },
    gendersOptions () {
      return Object.entries(this.genders).map((s) => ({ text: s[1], value: s[0] }))
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
    apiInfo("The default marker augmenter model was upgraded (from v0.2 to v0.3). The new model (v0.3) should be more accurate and more robust to different activities. If you would like to use the model that was default prior to 07-30-2023, select v0.2 under 'Marker augmenter model' under 'Advanced Settings'.", 5000);
    this.loadSession(this.$route.params.id)
    this.loadSubjects()
    if (this.$route.query.autoRecord) {
      this.onNext();
    }

    const res = await axios.get(`/sessions/${this.$route.params.id}/get_n_calibrated_cameras/`, {})

    this.n_calibrated_cameras = res.data.data
  },
  methods: {
    ...mapMutations("data", ["setStep4", "setStep3"]),
    ...mapActions("data", ["loadSubjects", "loadSession"]),
    isSomeInputInvalid(state, input) {
      setTimeout(() => {
        this.formErrors[input] = state;
      },0)
    },
    reloadSubjects() {
      console.log('reloading subjects')
      this.loadSubjects()
    },
    isAllInputsValid() {
        console.log(this.subject)
      this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null
      }
      if(this.subject != null && this.subject.id === 'new') {
        this.new_subject_dialog = true
        console.log("!!!")
        return
      }

      const arr = ['subject', 'data_sharing_agreement']

      let inputsInvalidFirst = true;
      // const inputsInvalidFirst = arr.some(el => {
      //   return typeof this.formErrors[el] === 'string'
      // })
      let inputsInvalidSecond;
      if(!this.subject || !this.data_sharing || !this.data_sharing_0 ) {
        inputsInvalidSecond = true
      }

      console.log(this.subject, this.data_sharing, this.data_sharing_0)
      console.log(!this.subject || !this.data_sharing || !this.data_sharing_0)

      inputsInvalidSecond ? this.disabledNextButton = true : this.disabledNextButton = false
      // inputsInvalidFirst || inputsInvalidSecond ? this.disabledNextButton = true : this.disabledNextButton = false
      // console.log('inputsInvalidFirst', inputsInvalidFirst)
        console.log(this.disabledNextButton)
    },
    async onNext() {
      console.log("STEP4: onNext")
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
            pose_model: this.pose_model,
            framerate: this.framerate,
            openSimModel: this.openSimModel,
            augmenter_model: this.augmenter_model,
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
                  settings_pose_model: this.pose_model,
                  settings_framerate: this.framerate,
                  settings_session_name: this.sessionName,
                  settings_openSimModel: this.openSimModel,
                  settings_augmenter_model: this.augmenter_model,                
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
    async cancelSubjectForm() {
      this.new_subject_dialog = false;
      this.edited_subject = this.empty_subject;
      this.subject = null;
      this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null
      }
    },
    async submitSubjectForm() {
      this.new_subject_dialog = false;
      this.formErrors = {
          name: null,
          weight: null,
          height: null,
          birth_year: null
      }
      console.log(this.edited_subject)

      let res = null;
      if(this.edited_subject.id) {
        res = await axios.put('/subjects/' + this.edited_subject.id + '/', this.edited_subject)
          .catch(error => {
              if(error.response.status === 400) {
                for (const [key, value] of Object.entries(error.response.data)) {
                  this.formErrors[key] = value
                }
                this.new_subject_dialog = true;
              }
            })
        // console.log('update subject', res.data)
      } else {
        res = await axios.post('/subjects/', this.edited_subject)
          .catch(error => {
              if(error.response.status === 400) {
                for (const [key, value] of Object.entries(error.response.data)) {
                  this.formErrors[key] = value
                }
                this.new_subject_dialog = true;
              }
            })
        // console.log('submit subject', res.data)
      }

      if (res) {
        this.edited_subject = this.empty_subject;
        await this.loadSubjects()
        // console.log(res.data)
        for(let i = 0; i < this.subjects.length; i++) {
            console.log(this.subjects[i].id, '==', res.data.id)
          if(this.subjects[i].id == res.data.id) {
            this.subject = this.subjects[i]
            break;
          }
        }

      }
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
    }
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

//.data-title {
//  padding-bottom: 7px;
//}
</style>
