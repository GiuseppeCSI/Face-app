<template>
  <q-page class="flex flex-center">
    <div class="videoRec text-xs-center">
      <input
        type="hidden"
        ref="video_h"
        name="video"
        v-model="videoModel"
      />
      <video
        ref="video"
        class="video"
        :poster="poster"
        controls
      ></video>
      <div class="video-controllers"></div>
      <q-btn
        @click="startRecording('video1')"
        label="record"
      >
      </q-btn>
      <q-btn
        @click="stopRecording('video1')"
        label="stop"
      >
      </q-btn>
      <q-btn
        @click="download('video1')"
        label="download"
      >
      </q-btn>
    </div>
    </div>
    </div>
  </q-page>
</template>

<script>
let RecordRTC = require('recordrtc');

export default {
  name: 'PageIndex',
  name: 'Video',
  props: [''],
  data: function () {
    return {
      poster: "/static/video-camera.png",
      recordRTC: null,
      video: null,
      recordedBlob: null,
      base64data: null,
      videoModel: ""
    }
  },
  methods: {
    successCallback (stream) {
      var options = {
        mimeType: 'video/webm\;codecs=vp9', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 128000,
        timeSlice: 2000,
        bitsPerSecond: 128000 // if this line is provided, skip above two
      };
      this.stream = stream;
      this.recordRTC = RecordRTC(stream, options);
      this.recordRTC.startRecording();
      this.video = this.$refs.video;
      this.video.src = window.URL.createObjectURL(stream);
      //video.srcObject = stream
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
      this.recordRTC.getDataURL(function (dataURL) { });
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
      stream.getAudioTracks().forEach(track => track.stop());
      stream.getVideoTracks().forEach(track => track.stop());
    },
    download (video = "video") {
      console.log(this.base64data)
      this.$axios.post('http://localhost:3000/consent', {
        video: this.base64data
      });
      console.log(this.recordedBlob)
      console.log(this.recordRTC)
      //    this.recordRTC.save('video.webm');
    }
  },
  computed: {
  },
  mounted: function () {
    this.video = this.$refs.video;
    this.video.muted = false;
    this.video.controls = true;
    this.video.autoplay = false;
  },
  created: function () {

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