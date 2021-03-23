<template>
  <q-page class="">
    <div class="row justify-center q-gutter-md">
      <div class="column q-gutter-md">
        Nome: {{ patient.nome }}<br />
        Codice Fiscale: {{patient.cf}}
      </div>
    </div>
    <div class="row justify-center">
      <div class="column q-gutter-md">
        <div id="surveyContainer">
          <survey :survey="survey"></survey>
        </div>
      </div>
    </div>
    <div class="row justify-center">
      <VideoJSRecord v-on:recordeddata="manageRecording" />
    </div>
    <div class="row justify-center">

      <div class="column">
        <q-btn
          @click="download('video1')"
          label="Upload"
        >
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
let RecordRTC = require('recordrtc');
var CryptoJS = require("crypto-js");
import * as SurveyVue from 'survey-vue'
import "survey-vue/survey.css";
import VideoJSRecord from '../components/VideoJSRecord.vue'

export default {
  name: 'PageIndex',
  name: 'Video', components: {
    VideoJSRecord
  },
  data: function () {
    var surveyJSON = { "locale": "it", "title": "Scheda anamnestica", "pages": [{ "name": "page1", "elements": [{ "type": "text", "name": "nome", "title": "Nome" }, { "type": "text", "name": "cognome", "title": "Cognome" }, { "type": "text", "name": "indirizzo", "title": "Indirizzo" }, { "type": "matrix", "name": "anamnesi", "columns": [{ "value": "si", "text": "Sì" }, { "value": "no", "text": "No" }, { "value": "non_so", "text": "Non so" }], "rows": [{ "value": "malato", "text": "Attualmente è malato?" }, { "value": "febbre", "text": "Ha febbre?" }, { "value": "reazione", "text": "Ha avuto reazioni gravi dopo un vaccino?" }, { "value": "malattie", "text": "soffre di malattie cardiache o polmonari, asma, malattie renali, diabete, anemie o altre malattie del sangue?" }, { "value": "immunitario", "text": "si trova in una condizione di compromissione del sistema immunitario? Ad esempio: cancro, leucemia, linfoma, HIV/AIDS, trapianto…" }, { "value": "allergie", "text": "soffre di allergie? (ad es. lattice, cibi, farmaci, componenti del vaccino?) se sì specificare" }] }, { "type": "text", "name": "allergie_dettaglio", "title": "Elenco allergie" }, { "type": "signaturepad", "name": "firma", "title": { "it": "Firma" } }] }] }
    var model = new SurveyVue.Model(surveyJSON)
    console.log("SURVEY")
    console.log(model)
    model
      .onComplete
      .add(function (result) {
        console.log("result of SURVEY")
        console.log(result)
        console.log(result.data)
      });
    return {
      poster: "/static/video-camera.png",
      recordRTC: null,
      video: null,
      recordedBlob: null,
      base64data: null,
      survey: model,
      patient: {},
      videoModel: ""
    }
  },
  methods: {
    manageRecording (blob) {
      console.log("received manageRecording")
      console.log(blob)
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        this.base64data = reader.result;
        console.log(this.base64data);
      }
    },
    /*
    successCallback (stream) {
      console.log(stream)
      console.log("in successCallback")
      console.log(this)
      var options = {
        mimeType: 'video/webm\;codecs=vp9', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 128000,
        timeSlice: 2000,
        bitsPerSecond: 128000 // if this line is provided, skip above two
      };
      this.stream = stream;
      this.video = this.$refs.video;


      this.recordRTC = RecordRTC(stream, options);
      this.recordRTC.startRecording();
      this.video.src = window.URL.createObjectURL(stream);
      //     this.video.muted = true;
      //     this.video.volume = 0;
      //this.video.srcObject = stream
      this.recordRTC.camera = stream
      //this.toggleControls();
    },
    errorCallback () {
      //handle error here
    },
    processVideo (audioVideoWebMURL) {
      //let video = this.$refs.video;
      //     let recordRTC = this.recordRTC;
      this.video.src = audioVideoWebMURL;
      //this.toggleControls();
      this.recordedBlob = this.recordRTC.getBlob();
      var reader = new FileReader();
      reader.readAsDataURL(this.recordedBlob);
      reader.onloadend = () => {
        this.base64data = reader.result;
        console.log(this.base64data);
      }
      var file = new File([this.recordRTC.getBlob()], "test.webm", {
        type: 'video/webm\;codecs=vp9'
      });

      //    invokeSaveAsDialog(file, file.name);
      //     this.recordRTC.getDataURL(function (dataURL) { });
    },
    startRecording (video = "video") {
      this.poster = "";
      let mediaConstraints = {
        video: {
          mandatory: {
            minWidth: 700,
            minHeight: 720
          }
        }, audio: true
      };
      navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then(this.successCallback.bind(this), this.errorCallback.bind(this));
    },
    stopRecording (video = "video") {
      this.poster = "";
      // this.recordRTC = this.recordRTC;
      this.recordRTC.stopRecording(this.processVideo.bind(this));
      let stream = this.stream;
      //      this.video.src = window.URL.createObjectURL(this.recordRTC.getBlob());

      stream.getAudioTracks().forEach(track => track.stop());
      stream.getVideoTracks().forEach(track => track.stop());
      //      this.recordRTC.camera.stop();

    },
    */
    download (video = "video") {
      console.log(this.base64data)
      var encrypted_data = this.encrypt(this.base64data).toString(CryptoJS.enc.Hex)
      console.log("I AM ENCRYPTED DATA")
      console.log(encrypted_data)
      this.$axios.post('http://localhost:3000/consent', {
        videohash: encrypted_data,
        video: this.base64data,
        codicefiscale: "GPPLCU69E10L219M"
      });
      console.log(this.recordedBlob)
      console.log(this.recordRTC)
      //    this.recordRTC.save('video.webm');
    },
    encrypt (docPicture) {
      console.log(CryptoJS)
      /*const algorithm = 'aes-192-cbc';
      const password = 'password';
      // First, we'll generate the key. The key length is dependent on the algorithm.
      const key = CryptoJS.scryptSync(password, 'salt', 24) 
      const iv = Buffer.alloc(16, 0);
      const cipher = CryptoJS.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(docPicture, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      console.log(encrypted);
      docPicture=encrypted
      return docPicture*/
      return CryptoJS.SHA512(docPicture);
    }
  },
  computed: {
  },
  mounted: function () {
    /*
    this.video = this.$refs.video;
    this.video.muted = false;
    this.video.controls = true;
    this.video.autoplay = false;
    */
    console.log("the props mounted")
    console.log(this.$route.query.patient)
    this.patient = JSON.parse(this.$route.query.patient)
    console.log(this.patient)
  },
  created: function () {
    console.log("the props")
    console.log(this.$route.query.patient.cf)
  }
}
</script>

<style scoped>
.video {
  box-shadow: 1px 6px 10px 2px rgba(35, 35, 35, 0.62);
  height: 400px;
  max-height: 800px;
  object-fit: none;
}
</style>