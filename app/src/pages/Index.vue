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
      <canvas
        id="myCanvas"
        width="320"
        height="210"
        style="border:1px solid #d3d3d3;"
      >
        Your browser does not support the HTML5 canvas tag.</canvas>
    </div>
    <div class="row justify-center q-gutter-md">
      <div class="column q-gutter-md">
        <q-btn
          @click="firma()"
          color="primary"
          glossy
          label="Firma con PAD"
          :disable="signDoctor"
        >
        </q-btn>
      </div>
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


function onDetectRunning (vueref) {
  console.log("Signature SDK Service detected")
  clearTimeout(vueref.timeout);
};
//      hostaddress: "192.168.1.134",


export default {
  name: 'PageIndex',
  components: {
    VideoJSRecord
  },
  data: function () {
    //    var surveyJSON = { "locale": "it", "title": "Scheda anamnestica", "pages": [{ "name": "page1", "elements": [{ "type": "text", "name": "nome", "title": "Nome" }, { "type": "text", "name": "cognome", "title": "Cognome" }, { "type": "text", "name": "indirizzo", "title": "Indirizzo" }, { "type": "matrix", "name": "anamnesi", "columns": [{ "value": "si", "text": "Sì" }, { "value": "no", "text": "No" }, { "value": "non_so", "text": "Non so" }], "rows": [{ "value": "malato", "text": "Attualmente è malato?" }, { "value": "febbre", "text": "Ha febbre?" }, { "value": "reazione", "text": "Ha avuto reazioni gravi dopo un vaccino?" }, { "value": "malattie", "text": "soffre di malattie cardiache o polmonari, asma, malattie renali, diabete, anemie o altre malattie del sangue?" }, { "value": "immunitario", "text": "si trova in una condizione di compromissione del sistema immunitario? Ad esempio: cancro, leucemia, linfoma, HIV/AIDS, trapianto…" }, { "value": "allergie", "text": "soffre di allergie? (ad es. lattice, cibi, farmaci, componenti del vaccino?) se sì specificare" }] }, { "type": "text", "name": "allergie_dettaglio", "title": "Elenco allergie" }, { "type": "signaturepad", "name": "firma", "title": { "it": "Firma" } }] }] }
    var surveyJSON = { "locale": "it", "title": "Scheda anamnestica", "pages": [{ "name": "page1", "elements": [{ "type": "text", "name": "nome", "title": "Nome" }, { "type": "text", "name": "cognome", "title": "Cognome" }, { "type": "text", "name": "indirizzo", "title": "Indirizzo" }, { "type": "matrix", "name": "anamnesi", "columns": [{ "value": "si", "text": "Sì" }, { "value": "no", "text": "No" }, { "value": "non_so", "text": "Non so" }], "rows": [{ "value": "malato", "text": "Attualmente è malato?" }, { "value": "febbre", "text": "Ha febbre?" }, { "value": "reazione", "text": "Ha avuto reazioni gravi dopo un vaccino?" }, { "value": "malattie", "text": "soffre di malattie cardiache o polmonari, asma, malattie renali, diabete, anemie o altre malattie del sangue?" }, { "value": "immunitario", "text": "si trova in una condizione di compromissione del sistema immunitario? Ad esempio: cancro, leucemia, linfoma, HIV/AIDS, trapianto…" }, { "value": "allergie", "text": "soffre di allergie? (ad es. lattice, cibi, farmaci, componenti del vaccino?) se sì specificare" }] }, { "type": "text", "name": "allergie_dettaglio", "title": "Elenco allergie" }] }] }
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
      hostaddress: "158.102.29.31",
      videohash: "",
      generatepdfbutton: true,
      signDoctor: true,
      uploadbutton: false,
      recordedBlob: null,
      base64data: null,
      signimage: null,
      pdf: null,
      survey: model,
      patient: {},
      ctx: null,
      dynCapt: null,
      canvas: null,
      wgssSignatureSDK: null,
      timeout: null,
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
        this.base64data = this.base64data.replace(",opus", "");
        console.log(this.base64data);
        // recorded the video so we can cache it and hash it (will also have to crypt it but for now we make it easy and not do it)
        this.videohash = this.encrypt(this.base64data).toString(CryptoJS.enc.Hex)
        //  this.generatepdfbutton = false
        this.signDoctor = false
      }

    },
    timedDetect () {
      if (this.wgssSignatureSDK && this.wgssSignatureSDK.running) {
        console.log("Signature SDK Service detected")
      }
      else {
        console.log("Signature SDK Service not detected")
      }
    },

    firma () {
      if (this.wgssSignatureSDK.running) {
        if (null == this.canvas) {
          this.ctx = this.canvas.getContext("2d");
          console.log("wgssSignatureSDK running and firma called")
          console.log(this.ctx)
        }
        this.dynCapt = new this.wgssSignatureSDK.DynamicCapture((dynCaptV, status) => {
          if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
            console.log("status OK and we are good to go")
            this.sigCtl = new this.wgssSignatureSDK.SigCtl((sigCtlV, status) => {
              if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                console.log("before onSigCtlPutLicence")
                sigCtlV.PutLicence(LICENCEKEY, (sigCtlV, status) => {
                  if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                    console.log("before capture")
                    this.dynCapt.Capture(sigCtlV, "Nome e Cognime medico", "Consenso vaccino", null, null, (dynCaptV, sigObjV, status) => {
                      if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                        console.log("<br>Adding extra data")
                        sigObjV.PutExtraData("luogo vaccinazione", "via Negarville 8", (sigObjV, status) => {
                          if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                            console.log("<br>Rendering bitmap")
                            var flags = this.wgssSignatureSDK.RBFlags.RenderOutputPicture |
                              this.wgssSignatureSDK.RBFlags.RenderColor24BPP;
                            sigObjV.RenderBitmap("png", this.canvas.width, this.canvas.height, 0.7, 0x00000000, 0x00FFFFFF, flags, 0, 0, (sigObjV, bmpObj, status) => {
                              if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                                if (bmpObj.isBase64) {
                                  console.log("<br>Base64 bitmap retrieved:<br>")
                                  console.log("<br>" + bmpObj.image.src)
                                }
                                else {
                                  console.log("<br>Bitmap retrieved, rendering image...")
                                }
                                console.log(this.ctx)
                                this.ctx.drawImage(bmpObj.image, 0, 0);
                                console.log("IMAGE")
                                console.log(bmpObj)
                                this.signimage = bmpObj
                                sigObjV.GetAdditionalData(this.wgssSignatureSDK.CaptData.CaptMachineOS, (sigObjV, additionalData, status) => {
                                  if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                                    console.log("<br>Additional Data/MachineOS: " + additionalData)
                                    sigObjV.GetSigText((sigObjV, data, status) => {
                                      if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                                        console.log("<br>SigText: " + data)
                                        var vData = new this.wgssSignatureSDK.Variant();
                                        vData.type = this.wgssSignatureSDK.VariantType.VARIANT_BASE64;
                                        vData.base64 = data;
                                        sigObjV.PutSigData(vData, (sigObjV, status) => {
                                          if (this.wgssSignatureSDK.ResponseStatus.OK == status) {
                                            console.log("<br>PutSigData called")
                                            console.log(vData)
                                            console.log(sigObjV)
                                            this.generatepdfbutton = false
                                          }
                                          else {
                                            console.log("<br>error on PutSigData: " + status)
                                          }
                                        });
                                      }
                                      else {
                                        console.log("<br>error on GetSigData: " + status)
                                      }
                                    });
                                  }
                                  else {
                                    console.log("<br>error on GetAdditionalData: " + status)
                                  }
                                });
                              }
                              else {
                                console.log("<br>Signature Render Bitmap error: " + status)
                              }
                            });
                            this.sigObj = sigObjV;
                          }
                          else {
                            console.log("<br>Signature PutExtraData error: " + status)
                          }
                        });
                      }
                      else if (1 == status) {
                        console.log("<br>Signature capture cancelled by the user")
                      }
                      else {
                        console.log("<br>Signature capture error: " + status)
                      }
                    });
                  }
                  else {
                    console.log("<br>SigCtl constructor error: " + status)
                  }
                });
              }
              else {
                console.log("<br>SigCtl constructor error: " + status)
              }
            });
          }
          else {
            console.log("<br>Dynamic Capture constructor error: " + status)
            if (this.wgssSignatureSDK.ResponseStatus.INVALID_SESSION == status) {
              console.log("have to restart the session")
              //restartSession(captureSignature);
            }
          }
        });
      }

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
        size: 250,
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
          'Hash della registrazione',
          {
            image: qr.toDataURL(),
            width: 250
          },
          'Firma del medico',
          {
            image: this.signimage.image.src,
            width: 300
          }
        ]
      }
      /*
                'Firma',
          {
            image: this.survey.data.firma || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
            width: 200
          },

*/
      //     pdfMake.createPdf(docDefinition).download('optionalName.pdf')
      let pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBase64((data) => {
        console.log("getBase64")
        console.log(data)
        this.pdf = data
        //    alert(this.pdf);
      })
      //this.pindialog = true
      this.uploadbutton = false

      //pdfDocGenerator.download('optionalName.pdf')
      // pdfDocGenerator.download('optionalName.pdf')
    },
    download (video = "video") {
      console.log(this.base64data)
      var encrypted_data = this.encrypt(this.base64data).toString(CryptoJS.enc.Hex)
      console.log("I AM ENCRYPTED DATA")
      console.log(encrypted_data)
      this.$axios.post('http://' + this.hostaddress + ':3000/consent', {
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
    this.$axios.get("http://" + this.hostaddress + ":3000/patientdata?id=eq." + this.$route.hash.substring(1))
      .then((response) => {
        // handle success
        console.log(response);
        console.log(response.data[0].patientdata)
        console.log(JSON.parse(response.data[0].patientdata))

        this.survey.data = JSON.parse(response.data[0].patientdata).scheda
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
    //    this.patient = JSON.parse(this.$route.query.patient)
    console.log(this.patient)
    //    this.survey.data = this.patient.scheda
    // part for wacom
    this.timeout = this.timedDetect()
    this.wgssSignatureSDK = new WacomGSS_SignatureSDK(() => {
      console.log("Signature SDK Service detected")
      clearTimeout(this.timeout);
    }, 8000)
    console.log("x PAD")
    console.log(this.wgssSignatureSDK)
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
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