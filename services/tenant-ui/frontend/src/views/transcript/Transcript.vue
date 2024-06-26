<template>
  <div class="transcript-container">
    <MainCardContent :title="$t('transcript.transcript')">
      <Accordion :multiple="true">
        <AccordionTab header="Transcript Form">
          <form
            class="transcript-form"
            @submit.prevent="handleSubmit(!v$.$invalid)"
          >
            <!-- Connection -->
            <div class="field mt-5">
              <label
                for="selectedConnection"
                :class="{
                  'p-error': v$.selectedConnection.$invalid && submitted,
                }"
                >{{ $t('common.connectionName') }}
                <ProgressSpinner v-if="connectionLoading" />
              </label>
              <div class="flex align-items-center">
                <AutoComplete
                  id="selectedConnection"
                  v-model="v$.selectedConnection.$model"
                  class="w-full"
                  :disabled="connectionLoading"
                  :suggestions="connectionsList"
                  :dropdown="true"
                  option-label="label"
                  force-selection
                  @complete="searchConnections($event)"
                />
                <span v-if="metaDataLoading" class="ml-2">
                  <i class="pi pi-spin pi-spinner" style="font-size: 1.2em" />
                </span>
              </div>

              <small
                v-if="v$.selectedConnection.$invalid && submitted"
                class="p-error"
                >{{ v$.selectedConnection.required.$message }}</small
              >
              <div v-if="!isMetaData" class="field">
                <span class="p-error"> {{ $t('transcript.noMetaData') }}</span>
                <label for="studentID" class="mt-2">{{
                  $t('transcript.studentID')
                }}</label>
                <InputText
                  id="studentID"
                  v-model="v$.studentID.$model"
                  required
                  @input="transcriptContent = ''"
                />
                <Button
                  :label="$t('transcript.findTranscript')"
                  icon="pi pi-search"
                  class="ml-2"
                  :disabled="!v$.studentID.$model || transcriptLoading"
                  @click="getTranscript(v$.studentID.$model)"
                />
                <span v-if="transcriptLoading" class="ml-2">
                  <i class="pi pi-spin pi-spinner" style="font-size: 1.2em" />
                </span>
                <div v-if="transcriptContent === false" class="p-error">
                  {{ $t('transcript.noTranscript') }}
                </div>
              </div>

              <div v-if="transcriptContent" class="pt-4 transcriptContent">
                <vue-json-pretty :data="transcriptContent" />
              </div>

              <Button
                type="submit"
                label="Send Transcript"
                icon="pi pi-check"
                class="mt-5"
                :disabled="
                  connectionLoading || transcriptLoading || !transcriptContent
                "
                :loading="connectionLoading"
              />
            </div>
          </form>
        </AccordionTab>
      </Accordion>
    </MainCardContent>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useStudentStore, useConnectionStore, useIssuerStore } from '@/store';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import AutoComplete from 'primevue/autocomplete';
import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import useGetItem from '@/composables/useGetItem';
import { API_PATH } from '@/helpers/constants';
import { useToast } from 'vue-toastification';
import VueJsonPretty from 'vue-json-pretty';

const { getStudentInfo, idLookup } = useStudentStore();

const toast = useToast();

// Metadata
const metadataMap = ref();
const isMetaData = ref(true);
const metaDataLoading = ref(false);

// Form and Validation
const connectionsList = ref();
const formFields = reactive({
  selectedConnection: undefined as any,
  studentID: '',
});
const rules = {
  selectedConnection: { required },
  studentID: {
    required: isMetaData.value ? false : required,
  },
};
const v$ = useVuelidate(rules, formFields);
// State
const connectionStore = useConnectionStore();
const { connectionsDropdown, loading: connectionLoading } =
  storeToRefs(useConnectionStore());

const searchConnections = (event: any) => {
  if (!event.query.trim().length) {
    connectionsList.value = [...(connectionsDropdown as any).value];
  } else {
    connectionsList.value = (connectionsDropdown.value as any).filter(
      (connection: any) => {
        return connection.label
          .toLowerCase()
          .includes(event.query.toLowerCase());
      }
    );
  }
};

// Get Metadata
const fetchMetadata = async (connection_id: string) => {
  metaDataLoading.value = true;
  const { item, fetchItem } = useGetItem(
    API_PATH.CONNECTIONS_METADATA(connection_id)
  );
  await fetchItem();
  if (item.value?.results.student_id) {
    metadataMap.value = item.value;
    await getTranscript(metadataMap.value.results.student_id);
    await createPayload();
  } else {
    isMetaData.value = false;
  }
  metaDataLoading.value = false;
};

// Transcript
const transcriptLoading = ref(false);
const transcriptContent = ref();
// Get transcript
const getTranscript = async (student_id: string) => {
  transcriptLoading.value = true;
  (await getStudentInfo(student_id))
    ? (transcriptContent.value = await getStudentInfo(student_id))
    : (transcriptContent.value = false);
  if (isMetaData.value === false && transcriptContent.value) {
    const studentInfo = await idLookup(student_id);
    if (studentInfo) {
      metadataMap.value = {
        results: {
          last_name: studentInfo.studentIdCred?.lastName,
          first_name: studentInfo.studentIdCred?.firstName,
          student_id: studentInfo.studentIdCred?.studentsId,
        },
      };
      await createPayload();
    }
  }
  transcriptLoading.value = false;
};

// Payload
const payload = ref();
// Create payload
const createPayload = async () => {
  payload.value = {
    auto_issue: true,
    auto_remove: false,
    connection_id: formFields.selectedConnection.value,
    // TODO: Replace hardcoded credential ID with a dynamic value
    cred_def_id: 'GQWv1LhEnphyZDWW1x8Tpg:3:CL:99:studentTranscript',
    credential_preview: {
      '@type': 'issue-credential/1.0/credential-preview',
      attributes: [
        {
          name: 'Last',
          value: metadataMap.value.results.last_name,
        },
        {
          name: 'First',
          value: metadataMap.value.results.first_name,
        },
        {
          name: 'Expiration',
          value: '20250101',
        },
        {
          name: 'StudentID',
          value: metadataMap.value.results.student_id,
        },
        {
          name: 'Middle',
          value: '',
        },
        {
          name: 'Transcript',
          value: JSON.stringify(transcriptContent.value),
        },
        {
          name: 'School',
          value: 'Cape Fear Community College',
        },
        {
          name: 'GPA',
          value: '',
        },
      ],
    },
    trace: false,
  };
};

// Submit
const issuerStore = useIssuerStore();
const submitted = ref(false);
// Submit function
const handleSubmit = async (isFormValid: boolean) => {
  submitted.value = true;
  if (!isFormValid) {
    return;
  }
  try {
    await issuerStore.offerCredential(payload.value);
    toast.info('Transcript Sent');
  } catch (error) {
    toast.error(`Failure: ${error}`);
  } finally {
    submitted.value = false;
    // Reset values
    transcriptLoading.value = false;
    transcriptContent.value = '';
    isMetaData.value = true;
    payload.value = {};
    // Clear dropdown and reset form fields
    formFields.selectedConnection = undefined;
    connectionsList.value = [];
    formFields.studentID = '';
  }
};

watch(
  () => formFields.selectedConnection,
  () => {
    if (formFields.selectedConnection) {
      // Reset values
      transcriptLoading.value = false;
      transcriptContent.value = '';
      isMetaData.value = true;
      payload.value = {};
      fetchMetadata(formFields.selectedConnection.value);
    }
  },
  { deep: true }
);

onMounted(async () => {
  connectionStore.listConnections().catch((err) => {
    console.error(`Failure: ${err}`);
  });
});
</script>

<style scoped>
.transcript-container {
  padding: 20px;
}

.transcript-form {
  max-width: 650px;
}

.form-group {
  margin-bottom: 20px;
}

.transcript-group .input-and-button {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.transcript-group input {
  width: 100%;
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

.button-submit {
  margin-left: auto;
}

:deep(.transcriptContent .vjs-tree-node) {
  line-height: 14px !important;
}
:deep(.transcriptContent .vjs-tree-node) {
  font-size: 12px !important;
}

@media (max-width: 768px) {
  .transcript-form {
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
  .button-submit {
    margin-top: 10px;
  }
  .button-submit {
    margin-left: 0;
  }
  .transcript-group .input-and-button {
    align-items: stretch;
  }
}
</style>
