
<template>
  <div class="onboarding-container">
    <MainCardContent :title="$t('onboarding.onboarding')">
      <Accordion :multiple="true">
        <AccordionTab header="Onboarding Form">
          <form @submit.prevent="submitForm" class="onboarding-form">

            <div class="form-group student-id-group">
              <label for="studentId">{{ $t('onboarding.studentId') }}</label>
              <div class="input-and-button">
                <InputText id="studentId" v-model="studentId" required />
                <Button
                  :label="$t('onboarding.idLookup')"
                  icon="pi pi-search"
                  class="button-id-lookup"
                  @click="handleIdLookUp"
                  :disabled="!studentId || loading"
                />
              </div>
              <div v-if="loading" class="center-content">
                <i class="pi pi-spin pi-spinner" style="font-size: 2em;"></i>
                <p>{{ $t('onboarding.fetching') }}</p>
              </div>
              <div v-else-if="error" class="center-content">
                <p class="text-error">{{ errMessage }}</p>
              </div>
              <div v-else-if="studentFullName" class="center-content">
                <p class="text-success">{{ $t('onboarding.found') }}</p>
              </div>
              <div v-else-if="loadingQRCode" class="center-content">
                <i class="pi pi-spin pi-spinner" style="font-size: 2em;"></i>
                <p>{{ $t('onboarding.loadingQRCode') }}</p>
              </div>
            </div>
            <div class="form-group">
              <label for="fullName">{{ $t('onboarding.fullName') }}</label>
              <InputText id="fullName" v-model="fullName" required />
            </div>
            <div class="form-actions">
              <Button
                :label="$t('onboarding.clear')"
                icon="pi pi-times"
                class="button-clear"
                :disabled="!studentId && !fullName"
                @click="clearForm"
              />
              <Button
                :label="$t('onboarding.submit')"
                icon="pi pi-check"
                class="button-submit"
                :disabled="!studentId || !fullName"
                type="submit"
              />
            </div>
          </form>

          <Dialog v-model:visible="showModal" :modal="true" :style="{ width: '50vw' }" header="QR Code">
            <QRCode :qr-content="invitation_url"/>
          </Dialog>

        </AccordionTab>
      </Accordion>
    </MainCardContent>
  </div>
</template>

<script setup lang="ts">

import { ref, onUnmounted } from 'vue';
import { io } from "socket.io-client";
import { useI18n } from 'vue-i18n';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';
import QRCode from '@/components/common/QRCode.vue'; 
import Dialog from 'primevue/dialog';
import { useStudentStore, useConnectionStore, useIssuerStore, useConfigStore } from '@/store';
import { useToast } from 'vue-toastification';
import { defineStore, storeToRefs } from 'pinia';
import websocketService from '@/services/websocketService';

const { t } = useI18n();
const studentId = ref('');
const fullName = ref('');
const loading = ref(false);
const error = ref(false);
let errMessage: string = "";
const invitation_url = ref('');
const showModal = ref(false);
const studentFullName = ref('');
const loadingQRCode = ref(false);
let response:any = null;
const { createInvitation } = useConnectionStore();
const { idLookup } = useStudentStore();
const issuerStore = useIssuerStore();
const toast = useToast();
const { config } = storeToRefs(useConfigStore());


async function issueCredential(details : any) {
  console.log('Issuing student ID...');
  try {
    const attributes = [
      { name: "Last", value: `${details.studentName.lastName}` },
      { name: "School", value: 'Cape Fear Community College' },
      { name: "Expiration", value: '20250101' },
      { name: "First", value: `${details.studentName.firstName}` },
      { name: "StudentID", value: `${studentId.value}` },
      { name: "Middle", value: `${details.studentName.middleName}` },
    ];

    const payload = {
      auto_issue: true,
      auto_remove: false,
      connection_id: `${details.connection_id}`,
      cred_def_id: 'N3qds31u5nDEM1jpGD4PMX:3:CL:100:Student-ID-Cape-Fear',
      credential_preview: {
        '@type': 'issue-credential/1.0/credential-preview',
        attributes: attributes
      },
      trace: false,
    };

    // call store method to offer credential
    await issuerStore.offerCredential(payload);
    toast.info('Credential Offer Sent');
  } catch (error) {
    toast.error(`Failure: ${error}`);
  }
}

//creation invitation aries-rfcs 0160 Connection Protocol
const submitForm = async () => {
const baseUrl =  config.value.frontend.sisProxyPath;
const socket = io(`${baseUrl}`, {
  // withCredentials: true,
  transports: ['websocket'] // Ensuring to use WebSockets
});

socket.on("connect", () => {
  console.log("Connected to the websocket server.");
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err);
});


  studentFullName.value = '';
  try {
    const result : any = await createInvitation(`${fullName.value} - ${studentId.value}`, false);
    if (result && result.invitation_url ) {
      invitation_url.value = result.invitation_url;
      console.log(`Invitation URL: ${result.invitation_url}`);
      showModal.value = true;
      websocketService.sendMessage({ event: 'invitationCreated', data: result });
    }

  socket.on("eventUpdate", async (data) => {
  console.log("Event received:", data);
  if (data.details.state === "active") { 
    showModal.value = false; 
    console.log(`Student ${data.details.alias} successfully added!`);
    console.log('Issuing student ID....')
    try {
      const attributes = [
            { name: "Last", value: `${response.studentName.lastName}` },
            { name: "School", value: 'Cape Fear Community College' },
            { name: "Expiration", value: '20250101' },
            { name: "First", value: `${response.studentName.firstName}`},
            { name: "StudentID", value: `${studentId.value}`},
            { name: "Middle", value: `${response.studentName.middleName}` },
          ];

      console.log("attributes",attributes)
    const payload = {
      auto_issue: true,
      auto_remove: false,
      connection_id: `${data.details.connection_id}`,
      cred_def_id: 'N3qds31u5nDEM1jpGD4PMX:3:CL:100:Student-ID-Cape-Fear',
      credential_preview: {
              '@type': 'issue-credential/1.0/credential-preview',
              attributes: JSON.parse(JSON.stringify(attributes))
            },
      trace: false,
    };

    // call store
    await issuerStore.offerCredential(payload);
    toast.info('Credential Offer Sent');
  } catch (error) {
    toast.error(`Failure: ${error}`);
  }


  }


  if (data.details.state === 'credential_acked'){
    console.log("Student Recieved and Accepted the Student ID credential!")
  }
});

  onUnmounted(() => {
  socket.disconnect();
});

  } catch (err: any) {
    console.error('Error during invitation creation:', err.message);
  }



};


const clearForm = () => {
  studentId.value = '';
  fullName.value = '';
  error.value = false;
  showModal.value = false;
  invitation_url.value = "";
  studentFullName.value = '';
}

const handleIdLookUp = async () => {
  error.value = false;
  fullName.value = ''
  studentFullName.value = ''
  loading.value = true;
  try {
    response = await idLookup(studentId.value);
    if (response && response.studentName) {
      fullName.value = response.studentName.fullName; 
      studentFullName.value = response.studentName.fullName;
      loading.value = false;

    } else {
      errMessage = t('onboarding.notFound');
      throw new Error(t('onboarding.notFound'));
    }
  } catch (err: any) {
    console.error('Error during ID Lookup:', err.message);
    loading.value = false;
    error.value = true;
    errMessage = err.message;
 
  } 
};

</script>

<style scoped>
.onboarding-container {
  padding: 20px;
}

.onboarding-form {
  max-width: 650px;
}

.form-group {
  margin-bottom: 20px;
}

.student-id-group .input-and-button {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.student-id-group input {
  width: 100%;
}

.button-id-lookup {
  margin-top: 8px;
  width: auto;
}

.form-group input {
  width: 100%;
}

label {
  display: block;
  margin-bottom: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.button-clear {
  margin-right: auto;
}

.button-submit {
  margin-left: auto;
}

.center-content {
  text-align: center;
  margin-top: 20px;
  padding: 10px; 
  border-radius: 5px;
}

.pi-spinner {
  font-size: 2em;
  color: #007bff; 
  margin-bottom: 10px;
}


.text-error {
  color: #dc3545; 
  background-color: #f8d7da; 
  padding: 10px;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
}

.text-success {
  color: #28a745; 
  background-color: #d4edda;
  padding: 10px;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
}

p {
  margin: 0;
  font-weight: bold;
}

@media (max-width: 768px) {
  .onboarding-form {
    max-width: 100%;
  }
  .form-group input,
  .form-actions button {
    width: 100%;
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .button-clear,
  .button-submit {
    margin-top: 10px;
  }
  .button-submit {
    margin-left: 0;
  }
  .student-id-group .input-and-button {
    align-items: stretch;
  }
  .qr-code-display {
  margin-top: 20px;
  text-align: center;
}

}
</style>
