<template>
  <q-page padding>
    <q-scroll-area style="height: 200px; max-width: 300px;">
      <div>
        <vuetable
          ref="vuetable"
          api-url="http://158.102.29.31:3000/consent"
          :fields="fields"
          data-path=""
          pagination-path=""
          :transform="transformData"
          :query-params="makeQueryParams"
        >
          <template
            slot="actions"
            scope="props"
          >
            <div class="table-button-container">
              <q-btn
                class="btn btn-warning btn-sm"
                color="primary"
                icon="movie"
                glossy
                @click="editRow(props.rowData)"
              >
              </q-btn>&nbsp;&nbsp;
              <q-btn
                class="btn btn-warning btn-sm"
                color="primary"
                glossy
                icon="picture_as_pdf"
                @click="downloadPDF(props.rowData)"
              >
              </q-btn>
            </div>
          </template>
        </vuetable>
      </div>
    </q-scroll-area>
    <q-dialog v-model="alert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <video-player
            :options="videoOptions"
            ref="videoPlayer"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="OK"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import Vuetable from 'vuetable-2'
import VideoJSRecord from '../components/VideoJSRecord.vue'
import VideoPlayer from "../components/VideoPlayer.vue";
//158.102.29.31
//192.168.1.134
var URL = window.URL || window.webkitURL;
var video = document.getElementsByTagName('video')[0];

export default {
  // name: 'PageName',
  components: {
    Vuetable, VideoJSRecord, VideoPlayer
  },
  computed: {
    myplayer () {
      return this.$refs.videoPlayer
    }
  },
  methods: {
    transformData (data) {
      console.log("transformData")
      console.log(data)
      /*
      var transformed = {}

      transformed.pagination = {
        total: data.total,
        per_page: data.per_page,
        current_page: data.current_page,
        last_page: data.last_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
        from: data.from,
        to: data.to
      }

      transformed.mydata = []

      for (var i=0; i < data.length; i++) {
        transformed.mydata.push({
          id: data[i].id,
          fullname: data[i].name,
          email: data[i].email
        })
      }
      */
      return data
    },
    async editRow (rowData) {
      //alert("You clicked edit on" + JSON.stringify(rowData))

      this.currentData = rowData
      console.log("aperto video")
      console.log(rowData)
      const base64Response = await fetch(rowData.video);
      console.log(base64Response)
      const blob = await base64Response.blob();
      console.log(blob)
      this.currentVideo = blob
      var URL = window.URL || window.webkitURL;

      this.videoOptions.sources = [
        {
          src:
            URL.createObjectURL(new Blob([blob], { type: "video/x-matroska;codecs=avc1,opus" })),
          type: blob.type
        }
      ]
      //   console.log(this.myplayer)
      this.alert = true
      //      this.myplayer.player.src({ type: blob.type, src: blob })
      //      this.myplayer.player.load()
      //    this.myplayer.recordedData = blob
      //      this.myplayer.player.play()
      /*
      var URL = window.URL || window.webkitURL;
      var video = document.getElementsByTagName('video')[0];
      video.src = URL.createObjectURL(new Blob([blob]));
      console.log(video)
      video.play()
      */

      const downloadLink = document.createElement("a");
      const fileName = "video.webm";
      console.log(rowData)
      downloadLink.href = rowData.video;
      downloadLink.download = fileName;
      downloadLink.click();
    },
    downloadPDF (rowData) {
      //  const linkSource = `data:application/pdf;base64,${pdf}`;
      const downloadLink = document.createElement("a");
      const fileName = "vct_illustration.pdf";
      console.log(rowData)
      downloadLink.href = 'data:application/pdf;base64,' + rowData.pdf;
      downloadLink.download = fileName;
      downloadLink.click();
    },
    makeQueryParams (sortOrder, currentPage, perPage) {
      return {}
    }
  },
  data () {
    return {
      alert: false,
      currentData: null,
      currentVideo: null,
      videoOptions: {
        autoplay: true,
        controls: true
      },
      fields: [
        {
          name: "id",
          title: 'ID',
          width: "10%"
        },
        {
          name: "codicefiscale",
          title: 'Codice Fiscale',
          width: "20%"
        },
        {
          name: "ragistrationdate",
          title: 'Data di registrazione',
          width: "25%",
          formatter: (value) => {
            return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
            /*
            return value
            return (value === null)
              ? ''
              : moment(value, 'YYYY-MM-DD').format('MMM Do, YYYY')
              */
          }
        },
        {
          name: "actions",
          title: 'Actions',
          titleClass: "center aligned",
          dataClass: "center aligned",
          width: "15%",
        }
      ]
    }
  }
}
</script>
