<template>
  <v-container fluid>
    <v-row class="text-center">
    <v-col
      cols="2"
    >
      <v-row align="center">
        <v-col>
          <div>Session {{ session_id }}</div>
        </v-col>
      </v-row>
    </v-col>
    <v-col
      cols="8"
    >
    <div id="mocap" />
      <div>
        Use mouse to control the 3D view.
      </div>
    </v-col>
    <v-col
      cols="2"
    >
    <div id="videos" v-if="trial && state == 'ready'">
      <video v-for="res in videos"
      v-bind:key="res.id" autoplay="true"
      muted playsinline :id="res.id" :src="res.media"
      controls="true" crossorigin="anonymous"/>
    </div>
    </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as THREE from 'three'
import * as THREE_OC from '@/orbitControls'
import axios from 'axios'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

//  console.log(frames)
/*
0 Neck
1 RShoulder
2 RElbow
3 RWrist
4 LShoulder
5 LElbow
6 LWrist
7 midHip
8 RHip
9 RKnee
10 RAnkle
11 LHip
12 LKnee
13 LAnkle
14 LBigToe
15 LSmallToe
16 LHeel
17 RBigToe
18 RSmallToe
19 RHeel

20 "C7_study"

21 "R_shoulder_study"

22 "L_shoulder_study"

23 "R.ASIS_study"
24 "L.ASIS_study"
25 "R.PSIS_study"
26 "L.PSIS_study"
27 "R_knee_study"
28 "L_knee_study"
29 "R_mknee_study"
30 "L_mknee_study"
31 "R_ankle_study"
32 "L_ankle_study"
33 "R_mankle_study"
34 "L_mankle_study"
35 "R_calc_study"
36 "L_calc_study"
37 "R_toe_study"
38 "L_toe_study"
39 "R_5meta_study"
40 "L_5meta_study"
41 "R_lelbow_study"
42 "L_lelbow_study"
43 "R_melbow_study"
44 "L_melbow_study"
45 "R_lwrist_study"
46 "L_lwrist_study"
47 "R_mwrist_study"
48 "L_mwrist_study"
49 "R_thigh1_study"
50 "R_thigh2_study"
51 "R_thigh3_study"
52 "L_thigh1_study"
53 "L_thigh2_study"
54 "L_thigh3_study"
55 "R_sh1_study"
56 "R_sh2_study"
57 "R_sh3_study"
58 "L_sh1_study"
59 "L_sh2_study"
60 "L_sh3_study"
61 "RHJC_study"
62 "LHJC_study"
*/
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
  name: 'HelloWorld',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      processor: null,
      session: null,
      state: "ready",
      server_state: "ready",
      heartbeat: null,
      status_url: "/",
      bose_bones: null,
      trial: null,
      frames: [],
      videos: [],
      synced: false,
      trial_name: null,
      subject_id: null,
      subject_mass: null,
      subject_height: null,
      subject_gender: null,
      cb_square: 60,
      cb_cols: 11,
      cb_rows: 8,
      cb_placement: "backWall",
      animation_json: {},
      meshes: {},
    }
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.onResize)
  },
  computed: {
    trial_url: function(){
      if (this.trial!=null){
        return location.protocol+"//"+location.host+"/trial/"+this.trial.id+"/"
      }
      return ""
    },
    session_id: function(){
      if (this.ssesion)
        return this.session.id
      return ""
    },
    trial_details_url: function(){
      if (this.trial!=null){
        return axios.defaults.baseURL+"trials/"+this.trial.id+"/"
      }
      return ""
    }
  },
  methods: {
    loadResults: function(trial_url){
      axios.get(trial_url)
        .then(response => {
          console.log(response)
          this.synced = false
          this.trial = response.data

          this.videos = response.data.results.filter(element => element.tag == "video-sync")
          // load JSON
          let json_file = response.data.results.filter(element => element.tag == "IK-json" )[0].media
          console.log(json_file)
          return axios.get(json_file)
        })
        .then(response => {
          console.log(response.data)
          this.frames = response.data.data
          // add videos

          this.show3d()
          this.animate();

          this.state = "ready"
        })
    },
    init: function() {
    },
    setup3d: function(){
      let container = document.getElementById('mocap');
      let ratio = container.clientWidth/window.innerHeight
      this.camera = new THREE.PerspectiveCamera(45, ratio, 0.1, 125);
      this.camera.position.x = 10;
      this.camera.position.y = 5;
      
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({antialias: true});
      this.onResize();
      container.appendChild(this.renderer.domElement);
      this.controls = new THREE_OC.OrbitControls( this.camera, this.renderer.domElement );
    },
    show3d: function(){

  {
    const planeSize = 5;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    mesh.position.y = .0
    this.scene.add(mesh);
  }

  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    this.scene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    this.scene.add(light);
    this.scene.add(light.target);
  }
  let data = fetch("https://mc-mocap-video-storage.s3-us-west-2.amazonaws.com/eae549fc-2694-4dad-9ae2-f5db462a289b-dropJump.json") //https://mc-mocap-video-storage.s3.us-west-2.amazonaws.com/visualizerTransforms.json")
  .then(response => response.json())
  .then(json => {
    console.log(json)
    this.animation_json = json
    for (let body in json.bodies){
      json.bodies[body].attachedGeometries.forEach((geom) => {
        let path = 'https://mc-mocap-video-storage.s3.us-west-2.amazonaws.com/geometries/' + geom.substr(0, geom.length-4) + ".obj";
        objLoader.load(path, (root) => {
          this.meshes[body+geom] = root;
          this.scene.add(root);
        })
      })
    }
  });

//      })
    },
    syncVideos: function() {
      if (this.synced || this.trial == null || this.videos.length == 0)
        return
      let self = this;
      let vid0 = document.getElementById(this.videos[0].id)
      
      vid0.addEventListener('ended', function () {
        
        self.videos.forEach(video => {
          let vid_element = document.getElementById(video.id);
          vid_element.currentTime = 0;
          vid_element.play();
        })
      });
      this.videos.forEach(video => {
        let vid_element = document.getElementById(video.id);
        vid_element.playbackRate = 1
      })
      this.synced = true
    },
    onResize: function() {
      let container = document.getElementById('mocap');
      this.renderer.setSize(container.clientWidth, window.innerHeight);
    },
    timerCallback: function() {
      this.computeFrame();
      let self = this;
      setTimeout(function () {
          self.timerCallback();
        }, 0);
    },

    computeFrame: function() {
    },

    goToTime: function(time) {
      this.videos.forEach(video => {
        let vid_element = document.getElementById(video.id);
        vid_element.currentTime = time
      })
    },
    animate: function() {
      if (this.trial == null){
        return
      }
        requestAnimationFrame(this.animate);
        let vid0 = document.getElementById(this.videos[0].id.toString());
        if (vid0 == null || vid0 == undefined){
          return
        }

        let cframe = (Math.floor(vid0.currentTime*60)) % this.frames.length
//  cframe = cframe % 70

    let json = this.animation_json;
    for (let body in json.bodies){
      json.bodies[body].attachedGeometries.forEach((geom) => {
        this.meshes[body+geom].position.set(
          json.bodies[body].translation[cframe][0],
          json.bodies[body].translation[cframe][1],
          json.bodies[body].translation[cframe][2])
        var euler = new THREE.Euler(
          json.bodies[body].rotation[cframe][0],
          json.bodies[body].rotation[cframe][1],
          json.bodies[body].rotation[cframe][2]);
  this.meshes[body+geom].quaternion.setFromEuler(euler)
      })
    }
        

/*        for (let i = 0; i < this.pose_bones.length; i++) {
          let from = openpose_bones[i][0]
          let to = openpose_bones[i][1]

          var vfrom = new THREE.Vector3(this.frames[cframe][from*3 + a0],
            this.frames[cframe][from*3 + a1],
            this.frames[cframe][from*3 + a2]);

          var vto = new THREE.Vector3(this.frames[cframe][to*3 + a0],
            this.frames[cframe][to*3 + a1],
            this.frames[cframe][to*3 + a2]);

          var axis = new THREE.Vector3(0, 1, 0);
          let midpoint = vto.clone().add(vfrom.clone());
          this.pose_bones[i].position.copy(midpoint);

          if (openpose_bones[i][0] == 0){
//            this.pose_spheres[0].position.copy(vfrom);
          }

        }
*/

        this.renderer.render(this.scene, this.camera);
        this.syncVideos();
    }
  },
  mounted: function() {
      this.init();
      this.setup3d()

      if (this.$route.params.trial_id != null){
        let trial_id = this.$route.params.trial_id
        this.loadResults("/trials/" + trial_id + "/")
        console.log(trial_id)
      }

      window.addEventListener('resize', this.onResize)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #mocap {
    border: 2px solid #222222;
    width: 100%;
    height: 100%;
    margin: 0 auto;
  }
  #videos {
  }
  #videos video {
    width: 100%;
  }
  #cameras canvas {
    padding: 5px;
    padding-top: 10px;
  }
  #videos video {
    padding: 5px;
    padding-top: 10px;
  }
  input, option, select {
      border: 1px #ffffff solid;
      color: #ffffff;
      margin: 0.1em 0.5em;
      width: 5em;
  }
  option {
      background-color: #000000;
  }
  
</style>
