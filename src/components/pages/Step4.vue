<template>
  <MainLayout
    leftButton="Back"
    :rightButton="rightButtonCaption"
    :step="4"
    :rightDisabled="busy || disabledNextButton"
    :rightSpinner="busy && !imgs"
    @left="$router.push('/step2')"
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
          Select Subject
        </v-card-title>
        <v-card-text>
          <v-select
              required
              v-model="subject"
              item-title="name"
              item-value="id"
              label="Subject"
              :items="subjectsMapped"
          ></v-select>
        </v-card-text>
      </v-card>

      <v-card class="mb-4">
        <v-card-title class="justify-center subject-title">
          Provide subject's details
        </v-card-title>

        <v-card-text class="d-flex flex-column align-center">
          <ValidationObserver
            tag="div"
            class="d-flex flex-column subject-details"
            ref="observer"
            v-slot="{ }"
          >
            <ValidationProvider
              rules="required"
              v-slot="{ errors }"
              name="Identifier"
            >
              <v-text-field
                v-model="identifier"
                label="Identifier"
                class="mb-3"
                @change="isAllInputsValid"
                :error="errors.length > 0"
                :error-messages="errors[0]"
              />
            </ValidationProvider>
            <div class="form-divider">
              <ValidationProvider
                rules="required"
                v-slot="{ errors }"
                name="Weight (kg)"
              >
                <v-text-field
                  v-model="weight"
                  label="Weight (kg)"
                  class="mb-3"
                  @input="isSomeInputInvalid(weightRule(weight),'weight')"
                  @change="isAllInputsValid"
                  :rules="[weightRule]"
                  :error="errors.length > 0"
                  :error-messages="errors[0]"
                />
              </ValidationProvider>

              <ValidationProvider
                rules="required"
                v-slot="{ errors }"
                name="Height (m)"
              >
                <v-text-field
                  v-model="height"
                  label="Height (m)"
                  class="mb-3"
                  @input="isSomeInputInvalid(heightRule(height),'height')"
                  @change="isAllInputsValid"
                  :rules="[heightRule]"
                  :error="errors.length > 0"
                  :error-messages="errors[0]"
                />
              </ValidationProvider>

              <v-select
                v-model="sex"
                label="Sex assigned at birth (optional)"
                :items="sexes"
              />

              <v-select
                v-model="gender"
                label="Gender (optional)"
                :items="genders"
              />
            </div>
          </ValidationObserver>
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
            videos do no have the face blurred, de-identified videos have faces
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
        <v-btn
          class="mt-4 mb-4 ml-4 mr-4"
          @click="openAdvancedSettings">
          Advanced Settings
        </v-btn>
      </div>

    </div>

    <v-card class="step-4-2 ml-4 d-flex images-box">
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
    
    
    <div id="overlay-panel" class="overlay-panel" v-on:click="closeAdvancedSettings"></div>

    <v-card id="advanced-settings-menu" class="centered-settings">
      <div class="pt-4 pr-4 text-right">
        <v-btn
          @click="closeAdvancedSettings">
                ✖
        </v-btn>
      </div>
      <div class="d-flex justify-center">
        <v-card-title class="justify-center data-title">
          Select human pose estimation model
        </v-card-title>
        <v-tooltip bottom="">
          <template v-slot:activator="{ on }">
            <v-icon v-on="on"> mdi-help-circle-outline </v-icon>
          </template>
          OpenCap supports two human pose estimation models: OpenPose and HRNet. We recommend using OpenPose for computation speed, but both models provide similar accuracy.
          OpenPose is restricted to academic or non-profit organization non-commercial research use (consult the license at https://github.com/CMU-Perceptual-Computing-Lab/openpose/blob/master/LICENSE).
          HRNet, as implemented by Open-MMLab, has a permissive Apache 2.0 license (consult the license at https://github.com/open-mmlab/mmpose/blob/master/LICENSE).
          Please ensure that you have the rights to use the model you select. The OpenCap authors deny any responsibility regarding license infringement.
        </v-tooltip>
      </div>

      <v-card-text class="d-flex flex-column align-center checkbox-wrapper">

        <v-select
            v-model="pose_model"
            label="Human pose estimation model"
            v-bind:items="pose_models"
          />

      </v-card-text>

      <div class="d-flex justify-center">
        <v-card-title class="justify-center data-title">
          Select framerate
        </v-card-title>
      </div>


      <v-card-text class="d-flex flex-column align-center checkbox-wrapper">

        <v-select
            v-model="framerate"
            label="Framerate"
            v-bind:items="framerates_available"
          />

      </v-card-text>
    </v-card>

    
  </MainLayout>
</template>

<script>
import axios from "axios";
import { mapMutations, mapState } from "vuex";
import { apiError, apiSuccess, apiErrorRes, apiInfo } from "@/util/ErrorMessage.js";
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
        weight: null,
        height: null,
        data_sharing_agreement: null,
      },
      subject: null,
      identifier: "",
      weight: 70,
      height: 1.8,
      data_sharing_0: false,
      data_sharing: "",
      sexes: [
        "Woman",
        "Man",
        "Intersex",
        "Not Listed",
        "Prefer not to respond",
        "",
      ],
      genders: [
        "Woman",
        "Man",
        "Transgender",
        "Non-binary/non-conforming",
        "Prefer not to respond",
        "",
      ],
      data_sharing_choices: [
        "Share processed data and identified videos",
        "Share processed data and de-identified videos",
        "Share processed data",
        "Share no data",
      ],
      pose_model: 'openpose',
      pose_models: [
        {"text": "OpenPose (recommended, non-commercial research use only)", "value": "openpose"},
        {"text": "HRNet", "value": "hrnet"},
      ],
      framerate: 60,
      framerates_available: [
        {"text": "60fps (max recording time: 60s, default)", "value": 60},
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
        if (!isNaN(parseFloat(v)) && v >= 0 && v <= 3.0) return true;
        return "It is unlikely that the subject is taller than 3 m, are you using the right units? Height should be in m.";
      },
      weightRule: (v) => {
        if (!v.trim()) return true;
        if (!isNaN(parseFloat(v)) && v >= 0 && v <= 200.0) return true;
        return "It is unlikely that the subject is heavier than 200 kg, are you using the right units? Weight should be in kg.";
      },
      checkboxRule: (v) => !!v || 'The subject must agree to continue!'
    };
  },
  computed: {
    ...mapState({
      subjects: (state) => state.data.subjects,
      session: (state) => state.data.session,
      trialId: (state) => state.data.trialId,
    }),
    subjectsMapped () {
      return this.subjects.map(s => ({
        id: s.id,
        name: s.name,
        age: s.age,
        characteristics: s.characteristics,
        gender: s.gender,
        // gender_display: this.genders[s.gender],
        sex_at_birth: s.sex_at_birth,
        // sex_display: this.sexes[s.sex_at_birth],
        height: s.height,
        weight: s.weight,
        created_at: s.created_at,
        trashed: s.trashed,
        trashed_at: s.trashed_at,
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
  mounted() {
    if (this.$route.query.autoRecord) {
      this.onNext();
    }
  },
  methods: {
    ...mapMutations("data", ["setStep4", "setStep3"]),
    isSomeInputInvalid(state, input) {
      setTimeout(() => {
        this.formErrors[input] = state;
      },0)
    },
    isAllInputsValid() {
      const arr = ['weight', 'height', 'data_sharing_agreement']

      const inputsInvalidFirst = arr.some(el => {
        return typeof this.formErrors[el] === 'string'
      })
      let inputsInvalidSecond;
      if(!this.identifier || !this.weight || !this.height || !this.data_sharing || !this.data_sharing_0 ) {
        inputsInvalidSecond = true
      }

      inputsInvalidFirst || inputsInvalidSecond ? this.disabledNextButton = true : this.disabledNextButton = false
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
            identifier: this.identifier,
            weight: this.weight,
            height: this.height,
            sex: this.sex,
            gender: this.gender,
            data_sharing: this.data_sharing,
            pose_model: this.pose_model,
            framerate: this.framerate
          });
          try {
            const resUpdate = await axios.get(
              `/sessions/${this.session.id}/set_metadata/`,
              {
                params: {
                  subject_id: this.identifier,
                  subject_mass: this.weight,
                  subject_height: this.height,
                  subject_sex: this.sex,
                  subject_gender: this.gender,
                  subject_data_sharing: this.data_sharing,
                  subject_pose_model: this.pose_model,
                  settings_framerate: this.framerate
                },
              }
            );

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
            break;
          }
          default: {
            if (
              res.data.status === "processing" &&
              res.data.status !== this.lastPolledStatus
            ) {
              apiInfo("Processing: the subject can relax.");
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
      document.getElementById("overlay-panel").style.display = "inline-block";
      document.getElementById("advanced-settings-menu").style.display = "inline-block";
      this.getAvailableFramerates()
    },
    closeAdvancedSettings() {
      document.getElementById("overlay-panel").style.display = "none";
      document.getElementById("advanced-settings-menu").style.display = "none";
    },
    async getAvailableFramerates() {
      const session_settings = await axios.get(`/sessions/${this.session.id}/get_session_settings/`)
      // If the session has framerates...
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
