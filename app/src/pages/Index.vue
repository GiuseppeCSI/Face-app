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
    <div class="row justify-center q-gutter-md">
      <div class="column q-gutter-md">
        <q-btn
          @click="makePdf('video1')"
          color="primary"
          glossy
          label="Generate PDF"
          :disable="generatepdfbutton"
        >
        </q-btn>
      </div>

      <div class="column q-gutter-md">
        <q-btn
          @click="download('video1')"
          color="primary"
          glossy
          label="Upload"
          :disable="uploadbutton"
        >
        </q-btn>
      </div>
    </div>
    <q-dialog v-model="pindialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            standout="bg-teal text-white"
            v-model="pin"
            label="Inserire il PIN"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Send"
            color="primary"
            @click="sendtosign()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
let RecordRTC = require('recordrtc');
var CryptoJS = require("crypto-js");
import * as SurveyVue from 'survey-vue'
import "survey-vue/survey.css";
import VideoJSRecord from '../components/VideoJSRecord.vue'
import * as QRious from 'qrious'

export default {
  name: 'PageIndex',
  components: {
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
      pindialog: false,
      video: null,
      pin: "",
      videohash: "",
      generatepdfbutton: true,
      uploadbutton: true,
      recordedBlob: null,
      base64data: null,
      pdf: null,
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
      // recorded the video so we can cache it and hash it (will also have to crypt it but for now we make it easy and not do it)
      this.videohash = this.encrypt(this.base64data).toString(CryptoJS.enc.Hex)
      this.generatepdfbutton = false
    },
    sendtosign () {
      console.log("sending to sign")
      this.uploadbutton = false

    },
    makePdf () {
      var pdfMake = require('pdfmake/build/pdfmake.js')
      if (pdfMake.vfs == undefined) {
        var pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }
      console.log(this.survey)
      console.log(this.survey.data)
      var qr = new QRious({
        background: 'white',
        backgroundAlpha: 0.8,
        foreground: 'black',
        foregroundAlpha: 0.8,
        level: 'H',
        padding: 25,
        size: 300,
        value: this.videohash
      });
      console.log("the qrcode")
      console.log(qr.toDataURL())
      var docDefinition = {
        content: [
          { text: 'Scheda anamnestica', style: 'header' },
          'Nome: ' + this.survey.data.nome || '' + 'Cognome: ' + this.survey.data.cognome || '',
          'Indirizzo: ' + this.survey.data.indirizzo || '',
          {
            style: 'tableExample',
            table: {
              body: [
                ['Anamnesi', 'Risposta'],
                ['Attualmente è malato?', this.survey.data.anamnesi.malato || ''],
                ['Ha febbre?', this.survey.data.anamnesi.febbre || ''],
                ['Ha avuto reazioni gravi dopo un vaccino?', this.survey.data.anamnesi.reazione || ''],
                ['soffre di malattie cardiache o polmonari, asma, malattie renali, diabete, anemie o altre malattie del sangue?', this.survey.data.anamnesi.malattie || ''],
                ['si trova in una condizione di compromissione del sistema immunitario? Ad esempio: cancro, leucemia, linfoma, HIV/AIDS, trapianto…', this.survey.data.anamnesi.immunitario || ''],
                ['soffre di allergie? (ad es. lattice, cibi, farmaci, componenti del vaccino?) se sì specificare', this.survey.data.anamnesi.allergie || '']

              ]
            }
          },
          'Dettaglio allergie:' + this.survey.data.allergie_dettaglio || '',
          'Firma',
          {
            image: this.survey.data.firma || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
            width: 200
          },
          'Hash della registrazione',
          {
            image: qr.toDataURL(),
            width: 300
          }
        ]
      }
      //     pdfMake.createPdf(docDefinition).download('optionalName.pdf')
      let pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBase64((data) => {
        console.log("getBase64")
        console.log(data)
        this.pdf = data
        //    alert(this.pdf);
      })
      this.pindialog = true
      //pdfDocGenerator.download('optionalName.pdf')
      // pdfDocGenerator.download('optionalName.pdf')
    },
    download (video = "video") {
      console.log(this.base64data)
      var encrypted_data = this.encrypt(this.base64data).toString(CryptoJS.enc.Hex)
      console.log("I AM ENCRYPTED DATA")
      console.log(encrypted_data)
      this.$axios.post('http://localhost:3000/consent', {
        videohash: encrypted_data,
        video: this.base64data,
        pdf: this.pdf,
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
    console.log("the props mounted")
    console.log(this.$route.query.patient)
    console.log(this.$route.hash)
    this.$axios.get("http://localhost:3000/patientdata?id=eq." + this.$route.hash.substring(1))
      .then(function (response) {
        // handle success
        console.log(response);
        console.log(response.data[0].patientdata)
        console.log(JSON.parse(response.data[0].patientdata))
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
    this.patient = JSON.parse(this.$route.query.patient)
    console.log(this.patient)
    this.survey.data = this.patient.scheda

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