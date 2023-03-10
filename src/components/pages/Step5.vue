<template>
    <div class="step-5 d-flex">
        <div class="left d-flex flex-column pa-2">

            <ValidationObserver tag="div" class="d-flex flex-column" ref="observer" v-slot="{ invalid }">

                <ValidationProvider rules="required|alpha_dash_custom" v-slot="{ errors }" name="Trial name">

                    <v-text-field v-show="show_controls" v-model="trialName" label="Trial name" class="flex-grow-0"
                        :disabled="state !== 'ready'" dark :error="errors.length > 0" :error-messages="errors[0]" />
                </ValidationProvider>

                <v-btn v-show="show_controls" :disabled="busy || invalid" @click="changeState">
                    {{ buttonCaption }}
                </v-btn>
            </ValidationObserver>

            <div class="trials flex-grow-1">
                <div v-for="(t, index) in filteredTrials" :key="`trial-${index}`" class="my-1 trial"
                    :class="{ selected: isSelected(t) }">
                    <Status :value="t" class="mr-2" @click="loadTrial(t)" />
                </div>
            </div>

            <v-btn v-show="show_controls" class="mt-4" :disabled="busy || state !== 'ready'"
                @click="newSessionSameSetup">New session, same setup
            </v-btn>

            <v-btn v-show="show_controls" class="mt-4" :disabled="busy || state !== 'ready'" @click="newSession">New
                session
            </v-btn>

            <v-dialog v-model="dialog" width="500">
                <template v-slot:activator="{ on, attrs }">

                    <v-btn v-bind="attrs" v-on="on" v-show="show_controls" class="mt-4">Share on <v-icon
                            aria-hidden="false">
                            mdi-facebook
                        </v-icon> <v-icon aria-hidden="false">
                            mdi-twitter
                        </v-icon> <v-icon aria-hidden="false">
                            mdi-linkedin
                        </v-icon>
                    </v-btn>
                </template>

                <v-card>
                    <v-card-title class="text-h5">
                        Share on social media
                    </v-card-title>

                    <v-card-text>
                        <v-checkbox id="session-public" v-model="session.public" name="session-public"
                            label="Make session public" @change="setPublic($event)" />
                        <v-container v-show="session.public">
                            <h3 class="mb-2">Share on</h3>
                            <ShareNetwork network="facebook" class="mr-2" style="text-decoration: none;"
                                :url="sessionUrl" title="OpenCap session">
                                <v-btn><v-icon aria-hidden="false">mdi-facebook</v-icon> &nbsp;Facebook</v-btn>
                            </ShareNetwork>
                            <ShareNetwork network="twitter" class="mr-2" style="text-decoration: none;"
                                :url="sessionUrl" title="OpenCap session">
                                <v-btn><v-icon aria-hidden="false">mdi-twitter</v-icon> &nbsp;Twitter</v-btn>
                            </ShareNetwork>
                            <ShareNetwork network="linkedin" :url="sessionUrl" style="text-decoration: none;"
                                title="OpenCap session">
                                <v-btn><v-icon aria-hidden="false">mdi-linkedin</v-icon> &nbsp;LinkedIn</v-btn>
                            </ShareNetwork>

                            <v-text-field label="Alternatively, copy the session link and share on social media"
                                v-model="sessionUrl" class="mt-5" readonly></v-text-field>
                        </v-container>

                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="dialog = false">
                            Close
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>


            <v-btn class="mt-4" :disabled="downloading" @click="onDownloadData">
                <v-progress-circular v-if="downloading" indeterminate class="mr-2" color="grey" size="14" width="2" />

                Download data
            </v-btn>

            <v-btn class="mt-4" @click="$router.push({ name: 'Dashboard', params: { id: session.id } })">
                Analysis Dashboard
            </v-btn>

            <v-btn v-show="show_controls" class="mt-4" :disabled="busy || state !== 'ready'"
                :to="{ name: 'SelectSession' }">Back to session list
            </v-btn>
        </div>

        <div class="viewer flex-grow-1">
            <div v-if="trial" class="d-flex flex-column h-100">

                <div id="mocap" ref="mocap" class="flex-grow-1" />

                <div v-if="!videoControlsDisabled">
                    <v-slider :value="frame" :min="0" :max="frames.length - 1" @input="onNavigate" hide-details
                        class="mb-2" />
                </div>
            </div>

            <div v-else-if="trialLoading" class="flex-grow-1 d-flex align-center justify-center">
                <v-progress-circular indeterminate color="grey" size="30" width="4" />
            </div>
        </div>

        <div class="right d-flex flex-column">
            <div class="videos flex-grow-1 d-flex flex-column">
              <video v-for="(video, index) in videos" :key="`video-${index}`" :ref="`video-${index}`" muted
              playsinline :src="video.media" crossorigin="anonymous" @ended="onVideoEnded(index)" />
            </div>

            <SpeedControl v-model="playSpeed" />

            <VideoNavigation :playing="playing" :value="frame" :maxFrame="frames.length - 1"
                :disabled="videoControlsDisabled" @play="togglePlay(true)" @pause="togglePlay(false)"
                @input="onNavigate" class="mb-2" />
        </div>
    </div>
</template>

<script>
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'
import axios from 'axios'
import { mapState, mapMutations, mapActions } from 'vuex'
import { apiError, apiErrorRes, apiSuccess } from '@/util/ErrorMessage.js'
import Status from '@/components/ui/Status'
import * as THREE from 'three'
import * as THREE_OC from '@/orbitControls'
import VideoNavigation from '@/components/ui/VideoNavigation'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import SpeedControl from '@/components/ui/SpeedControl'

let openpose_bones = [
    [20, 21],
    [20, 22],
    [21, 43],
    [22, 44],
    [43, 47],
    [44, 48],
    [20, 25],
    [20, 26],

    //    [25, 23],
    //    [26, 24],

    [25, 29],
    [26, 30],
    [29, 33],
    [30, 34],
    [33, 37],
    [34, 38],
]

var a0 = 0;
var a1 = 1;
var a2 = 2;

const objLoader = new OBJLoader();

export default {
    name: 'Step5',
    components: {
        Status,
        VideoNavigation,
        SpeedControl
    },
    data() {
        return {
            startButtonCaptions: {
                ready: 'Start recording',
                recording: 'Stop recording',
                processing: 'Cancel trial'
            },
            busy: false,
            state: 'ready',
            submitted: false,
            trialName: '',
            statusPoll: null,
            downloading: false,
            dialog: null,

            trialInProcess: null,
            trial: null,
            videos: [],
            frames: [],
            trialLoading: false,

            // objects & arrays
            synced: false,
            camera: null,
            scene: null,
            renderer: null,
            controls: null,
            pose_spheres: [],
            pose_bones: [],
            meshes: {},
            frame: 0,
            playing: false,
            playSpeed: 1,

            show_controls: 1,

            resizeObserver: null,

            recordingStarted: null,
            recordingTimePassed: 0,
            recordingTimer: null,

            trialsPoll: null
        }
    },
    computed: {
        ...mapState({
            session: state => state.data.session,

            user_id: state => state.auth.user_id,

            // step 2 data
            rows: state => state.data.rows,
            cols: state => state.data.cols,
            squareSize: state => state.data.squareSize,

            // step 4 data
            identifier: state => state.data.identifier,
            weight: state => state.data.weight,
            height: state => state.data.height,
            gender: state => state.data.gender
        }),
        sessionUrl() {
            return "https://app.opencap.ai/session/" + this.session.id;
        },
        filteredTrials() {
            return this.session.trials.filter(trial => trial.name !== 'calibration' && !(trial.name === 'neutral' && trial.status === 'error'))
        },
        videoControlsDisabled() {
            return !this.trial || this.frames.length === 0
        },
        buttonCaption() {
            switch (this.state) {
                case 'recording': {
                    const time = moment
                        .duration(this.recordingTimePassed, 'seconds')
                        .format('*mm:ss')
                    return `${this.startButtonCaptions[this.state]} ${time}`
                }
                default: {
                    return this.startButtonCaptions[this.state]
                }
            }
        }
    },
    async mounted() {
        await this.loadSession(this.$route.params.id)
        console.log(this.user_id)
        console.log(this.session.user)
        this.show_controls = (this.user_id == this.session.user)

        this.startTrialsPoll()

        const doneTrials = this.filteredTrials.filter(trial => trial.status === 'done')

        if (doneTrials.length > 0) {
            this.loadTrial(doneTrials[0])
        }
    },
    beforeDestroy() {
        this.cancelPoll()
        this.cancelRecordTimer()
        this.cancelTrialsPoll()

        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.$refs.mocap)
        }
    },
    watch: {
        trial() {
            if (this.trial) {
                this.$nextTick(() => {
                    this.resizeObserver = new ResizeObserver(this.onResize)
                    this.resizeObserver.observe(this.$refs.mocap)
                })
            } else {
                this.resizeObserver.unobserve(this.$refs.mocap)
            }
        },
        playSpeed() {
            this.eachVideo(videoElement => {
                videoElement.playbackRate = this.playSpeed
            })
        }
    },
    methods: {
        ...mapMutations('data', [
            'setStep5',
            'clearAll',
            'setSessionId',
            'addTrial',
            'updateTrial'
        ]),
        ...mapActions('data', ['loadSession', 'initSessionSameSetup']),
        async changeState() {
            switch (this.state) {
                case 'ready': {
                    this.submitted = true

                    if (await this.$refs.observer.validate()) {
                        this.busy = true

                        try {
                            // store in vuex
                            this.setStep5(this.trialName)

                            // api
                            const res = await axios.get(`/sessions/${this.session.id}/record/`, {
                                params: {
                                    name: this.trialName
                                }
                            })

                            // add to the list
                            this.trialInProcess = res.data
                            this.addTrial(this.trialInProcess)

                            this.recordingStarted = moment()
                            this.recordingTimePassed = 0
                            this.recordingTimer = window.setTimeout(this.recordTimerHandler, 500)

                            this.state = 'recording'
                        } catch (error) {
                            apiError(error)
                        }

                        this.busy = false
                    }

                    break
                }
                case 'recording': {
                    this.cancelRecordTimer()

                    try {
                        const res = await axios.get(`/sessions/${this.session.id}/stop/`, {})

                        this.trialInProcess.status = res.data.status
                        this.state = 'processing'

                        this.startPoll()
                    } catch (error) {
                        apiError(error)
                    }

                    break
                }
                case 'processing': {
                    const res = await axios.get(`/sessions/${this.session.id}/cancel_trial/`, {})
                    this.cancelPoll()
                    this.state = 'ready'
                    break
                }
            }
        },
        recordTimerHandler() {
            this.recordingTimePassed = moment().diff(this.recordingStarted, 'seconds')

            if (this.recordingTimeLimit() < 0 || this.recordingTimePassed < this.recordingTimeLimit()) {
                this.recordingTimer = window.setTimeout(this.recordTimerHandler, 500)
            } else {
                apiSuccess('Recording finished upon reaching time limit')
                this.changeState()
            }
        },
        cancelRecordTimer() {
            if (this.recordingTimer) {
                window.clearTimeout(this.recordingTimer)
                this.recordingTimer = null
            }
        },
        async onDownloadData() {
            this.downloading = true

            try {
                //console.log(`${axios.defaults.baseURL}sessions/${this.session.id}/download/`)
                let link = document.createElement('a')
                link.setAttribute('href', `${axios.defaults.baseURL}sessions/${this.session.id}/download/`)
                link.setAttribute('download', 'mobilecap_result.zip')
                // This method works in all browsers including FireFox
                link.dispatchEvent(new MouseEvent('click'))

                window.setTimeout(() => {
                    this.downloading = false
                }, 5000)
            } catch (error) {
                apiError(error)
                this.downloading = false
            }
        },
        newSession() {
            this.clearAll()
            this.$router.push({ name: 'Step1' })
        },
        setPublic(p) {
            console.log(p)
            axios.patch(`/sessions/${this.session.id}/`, { "public": p })
        },
        async newSessionSameSetup() {
            await this.initSessionSameSetup()
            this.$router.push({ name: 'Step4' })
        },
        startPoll() {
            this.statusPoll = window.setTimeout(async () => {
                const res = await axios.get(`/sessions/${this.session.id}/status/`)

                if (res.data.status !== 'uploading') {
                    // Show error if any
                    if (res.data.status === 'error') {
                        apiErrorRes(res.data, 'Finished with error')
                    }

                    this.state = 'ready'
                } else {
                    this.startPoll()
                }
            }, 2000)
        },
        cancelPoll() {
            if (this.statusPoll) {
                window.clearTimeout(this.statusPoll)
            }
        },
        async startTrialsPoll() {
            this.trialsPoll = window.setTimeout(async () => {
                const trials = this.filteredTrials.filter(trial => trial.status === 'stopped' || trial.status === 'processing')

                if (trials.length > 0) {
                    const res = await axios.get(`/sessions/${this.session.id}/status/?ret_session=true`)

                    const updatedTrials = res.data.session.trials

                    trials.forEach(t => {
                        const updatedT = updatedTrials.find(x => x.id === t.id)

                        // Trial found and its status changed
                        if (updatedT && updatedT.status !== t.status) {
                            this.updateTrial(updatedT)
                        }
                    })
                }

                this.startTrialsPoll()
            }, 5000)
        },
        cancelTrialsPoll() {
            if (this.trialsPoll) {
                window.clearTimeout(this.trialsPoll)
                this.trialsPoll = null
            }
        },
        async loadTrial(trial) {
            console.log('loadTrial')

            if (!this.trialLoading) {
                this.frame = 0
                this.trial = null
                this.synced = false
                this.trialLoading = true

                try {
                    const { data } = await axios.get(`/trials/${trial.id}/`)

                    this.trial = data

                    // load JSON
                    const json = data.results.filter(element => element.tag == "visualizerTransforms-json")

                    if (json && json.length > 0) {
                        let data
                        const url = json[0].media

                        if (url.startsWith(axios.defaults.baseURL)) {
                            const res = await axios.get(url)
                            data = res.data
                        } else {
                            let axiosClean = axios.create()

                            const res = await axiosClean.get(url, {
                                // Deleting Authorization header, because we have one as global Axios
                                // Do not pass out user token to 3rd party sites
                                transformRequest: [(data, headers) => {
                                    delete headers.common.Authorization
                                    return data
                                }]
                            })

                            data = res.data
                        }

                        this.frames = data.time
                        this.animation_json = data
                    } else {
                        this.frames = [] //null
                    }

                    this.videos = data.results.filter(element => element.tag == "video-sync")

                    if (this.videos.length === 0) {
                        this.frame = 0
                    }

                    if (this.frames.length > 0) {
                        this.$nextTick(() => {
                            try {
                                while (this.$refs.mocap.lastChild) {
                                    this.$refs.mocap.removeChild(this.$refs.mocap.lastChild)
                                }

                                // setup3d
                                const container = this.$refs.mocap

                                let ratio = container.clientWidth / container.clientHeight
                                this.camera = new THREE.PerspectiveCamera(45, ratio, 0.1, 125)
                                this.camera.position.x = 4.5
                                this.camera.position.z = -3
                                this.camera.position.y = 3

                                this.scene = new THREE.Scene()
                                this.renderer = new THREE.WebGLRenderer({ antialias: true })
                                this.renderer.shadowMap.enabled = true;
                                this.onResize()
                                container.appendChild(this.renderer.domElement)
                                this.controls = new THREE_OC.OrbitControls(this.camera, this.renderer.domElement)

                                // show3d
                                // add the plane
                                {
                                    const planeSize = 5;

                                    const loader = new THREE.TextureLoader();
                                    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
                                    //                  const texture = loader.load('https://www.the3rdsequence.com/texturedb/download/32/texture/jpg/1024/smooth+white+tile-1024x1024.jpg')
                                    texture.wrapS = THREE.RepeatWrapping;
                                    texture.wrapT = THREE.RepeatWrapping;
                                    texture.magFilter = THREE.NearestFilter;
                                    const repeats = planeSize * 2;
                                    texture.repeat.set(repeats, repeats);

                                    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
                                    const planeMat = new THREE.MeshPhongMaterial({
                                        map: texture,
                                        side: THREE.DoubleSide,
                                    });
                                    const mesh = new THREE.Mesh(planeGeo, planeMat);
                                    mesh.rotation.x = Math.PI * -.5;
                                    mesh.position.y = .0
                                    mesh.receiveShadow = true;
                                    this.scene.add(mesh);
                                }

                                // add sun
                                {
                                    const skyColor = 0xB1E1FF;  // light blue
                                    const groundColor = 0xB97A20;  // brownish orange
                                    const intensity = 0.5
                                    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
                                    this.scene.add(light);
                                }

                                // add directional light
                                {
                                    const color = 0xFFFFFF;
                                    const intensity = 0.8;
                                    const light = new THREE.DirectionalLight(color, intensity);
                                    light.position.set(2, 3, 1.5);
                                    light.target.position.set(0, 0, 0);
                                    light.castShadow = true;
                                    light.shadow.camera.left = -10
                                    light.shadow.camera.right = 10
                                    light.shadow.camera.top = -10
                                    light.shadow.camera.bottom = 10
                                    light.shadow.camera.near = 0
                                    light.shadow.camera.far = 50
                                    light.shadow.camera.zoom = 8
                                    this.scene.add(light);
                                    this.scene.add(light.target);

                                    // const helper = new THREE.DirectionalLightHelper(light);
                                    // this.scene.add(helper);

                                    // const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
                                    // this.scene.add(cameraHelper);
                                }

                                // add bones
                                for (let body in this.animation_json.bodies) {
                                    let bd = this.animation_json.bodies[body]
                                    bd.attachedGeometries.forEach((geom) => {
                                        let path = 'https://mc-opencap-public.s3.us-west-2.amazonaws.com/geometries/' + geom.substr(0, geom.length - 4) + ".obj";
                                        objLoader.load(path, (root) => {
                                            root.castShadow = true;
                                            root.receiveShadow = true;
                                            root.traverse(function (child) {
                                                if (child instanceof THREE.Mesh) {
                                                    //                               child.receiveShadow = true;
                                                    child.castShadow = true;
                                                }
                                            });
                                            this.meshes[body + geom] = root;
                                            this.meshes[body + geom].scale.set(bd.scaleFactors[0], bd.scaleFactors[1], bd.scaleFactors[2])
                                            this.scene.add(root);
                                        })
                                    })
                                }
                            } finally {
                                this.trialLoading = false
                            }

                            this.onResize()
                            // animate

                            function delay(time) {
                                return new Promise(resolve => setTimeout(resolve, time));
                            }

                            delay(1000).then(() => {
                                this.togglePlay(true)
                            });
                        })
                    }
                } catch (error) {
                    apiError(error)
                    this.trialLoading = false
                }
            }
        },
        onResize() {
            const container = this.$refs.mocap
            if (container && this.renderer) {
                this.renderer.setSize(container.clientWidth, container.clientHeight)
            }

            if (this.renderer) {
                const canvas = this.renderer.domElement;
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
            }
        },
        animate() {
            // cancel display cycle if loading of new trial started
            if (!this.trialLoading) {
                requestAnimationFrame(this.animate)
                this.animateOneFrame()
            }
        },
        animateOneFrame() {
            let cframe

            let frames = this.frames.length
            let duration = this.vid0().duration
            if (!isNaN(this.vid0().duration)) {
                let framerate = frames / duration

                if (this.videos.length > 0) {
                    let t = 0
                    if (this.vid0()) t = this.vid0().currentTime;
                    cframe = (Math.round(t * framerate)) % this.frames.length
                    this.frame = cframe
                } else {
                    cframe = this.frame++

                    if (this.frame >= this.frames.length) {
                        this.frame = 0
                    }
                }

                // display the frame
                let json = this.animation_json;
                for (let body in json.bodies) {
                    json.bodies[body].attachedGeometries.forEach((geom) => {
                        if (this.meshes[body + geom]) {
                            this.meshes[body + geom].position.set(
                                json.bodies[body].translation[cframe][0],
                                json.bodies[body].translation[cframe][1],
                                json.bodies[body].translation[cframe][2])
                            var euler = new THREE.Euler(
                                json.bodies[body].rotation[cframe][0],
                                json.bodies[body].rotation[cframe][1],
                                json.bodies[body].rotation[cframe][2]);
                            this.meshes[body + geom].quaternion.setFromEuler(euler)
                        }
                    })
                }

                this.renderer.render(this.scene, this.camera)
                this.syncVideos()
            }
        },
        syncVideos() {
            if (this.synced || this.trial == null || this.videos.length == 0)
                return

            // will also reset all videos
            this.playSpeed = 1

            /*
            this.videos.forEach((video, index) => {
              const vid_element = this.videoElement(index)
              vid_element.playbackRate = 1
            })
            */

            this.synced = true
        },
        onVideoEnded(index) {
            if (index === 0) {
                this.videos.forEach((video, index) => {
                    const vid_element = this.videoElement(index)
                    vid_element.currentTime = 0
                    vid_element.play()
                })
            }
        },
        videoElement(index) {
            const vid = this.$refs[`video-${index}`]

            return vid
                ? vid[0]
                : null
        },
        vid0() {
            return this.videoElement(0)
        },
        isSelected(trial) {
            return this.trial && this.trial.id === trial.id
        },
        eachVideo(func) {
            this.videos.forEach((video, index) => {
                func(this.videoElement(index))
            })
        },
        togglePlay(value) {
            this.playing = value

            if (this.playing) {
                this.animate()

                this.videoElement(0).play()
                this.videoElement(1).play()

            } else {
                this.videoElement(0).pause()
                this.videoElement(1).pause()
            }
        },
        onNavigate(frame) {
            const vid0 = this.videoElement(0)
            const step = vid0.duration / this.frames.length
            const newPosition = frame * step

            this.eachVideo(videoElement => {
                videoElement.currentTime = newPosition
            })

            this.animateOneFrame()
        },
        recordingTimeLimit() {
            // Default value is 60.
            // Set -1 for no limit.
            var timelimit = 60

            // If we know the framerate, we change time limit accordingly.
            if ('meta' in this.session && 'settings' in this.session.meta && 'framerate' in this.session.meta.settings) {
                var framerate = this.session.meta.settings.framerate
                if (framerate == 60 || framerate == 120 || framerate == 240)
                    timelimit = 60 / (framerate / 60)
            }

            return timelimit
        }
    }
}
</script>

<style lang="scss">
.step-5 {
    height: calc(100vh - 64px);

    .left {
        width: 250px;

        .trials {
            overflow-y: auto;

            .trial {
                border-radius: 4px;
                padding: 2px 6px;

                &.selected {
                    background-color: #272727;
                    cursor: default;
                }
            }
        }
    }

    .viewer {
        height: 100%;

        #mocap {
            width: 100%;
            overflow: hidden;

            canvas {
                width: 100% !important;
            }
        }
    }

    .right {
        flex: 0 0 200px;
        height: 100%;

        .videos {
            overflow-y: auto;
            width: 200px;
        }
    }
}
</style>

