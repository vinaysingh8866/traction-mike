<template>
  <div class="bulk-issue-connection-count">
    <pre>{{ successful }}</pre>
    <div class="counts">
      <p>
        {{ $t('bulkIssue.totalConnections', { count: connections.length }) }}
      </p>
      <p>
        {{ $t('bulkIssue.connectionsWithStudentId', { count: metaDataCount }) }}
      </p>
      <p>
        <Button label="send offer" icon="pi pi-send" @click="checkTranscript" />
      </p>
    </div>
    <pre>{{ failed }}</pre>
  </div>
</template>
<script setup lang="ts">
// Vue
import { onMounted, ref } from 'vue';
// State
import { useConnectionStore, useIssuerStore } from '@/store';
import { storeToRefs } from 'pinia';
// PrimeVue Components
import Button from 'primevue/button';
import useGetItem from '@/composables/useGetItem';
import { API_PATH } from '@/helpers/constants';
const { connections } = storeToRefs(useConnectionStore());
const connectionStore = useConnectionStore();
// Get Metadata
const metaStudentInfo = ref<any[]>([]);
const metaDataCount = ref(0);
const fetchMetadata = async (connection_id: string) => {
  const { item, fetchItem } = useGetItem(
    API_PATH.CONNECTIONS_METADATA(connection_id)
  );
  await fetchItem();
  if (item.value?.results?.student_id) {
    metaDataCount.value++;
    metaStudentInfo.value.push({
      first_name: item.value.results.first_name,
      last_name: item.value.results.last_name,
      student_id: item.value.results.student_id,
      connection_id,
    });
  }
};
// Get Send Transcript
import { useStudentStore } from '@/store';
import { useSisApi } from '@/store/sisApi';
import { useToast } from 'vue-toastification';
const transcriptContent = ref();
const { getStudentInfo } = useStudentStore();
const getTranscript = async (studentInfo: any) => {
  transcriptContent.value = await getStudentInfo(studentInfo.student_id);
  // There is a transcript but it's empty
  if (transcriptContent.value?.courseTranscript?.length === 0) {
    transcriptContent.value = false;
  }
  await createPayload(studentInfo);
  await handleSubmit(payload.value);
};
const checkTranscript = () => {
  if (metaStudentInfo.value) {
    metaStudentInfo.value.map((studentInfo: any, index: number) => {
      getTranscript(studentInfo);
    });
  } else {
    console.log('There are no connections with metadata!');
  }
};
// Create payload
const payload = ref();
const sisApi = useSisApi();
const credentialDefinitionId = ref();
const createPayload = async (studentInfo: any) => {
  const GPA =
    transcriptContent.value?.studentCumulativeTranscript[0]?.cumulativeGradePointAverage?.toString() ??
    '';
  payload.value = {
    auto_issue: true,
    auto_remove: false,
    connection_id: studentInfo.connection_id,
    cred_def_id: credentialDefinitionId.value,
    credential_preview: {
      '@type': 'issue-credential/1.0/credential-preview',
      attributes: [
        {
          name: 'Last',
          value: studentInfo?.last_name,
        },
        {
          name: 'First',
          value: studentInfo?.first_name,
        },
        {
          name: 'Expiration',
          value: '20250101',
        },
        {
          name: 'StudentID',
          value: studentInfo?.student_id,
        },
        {
          name: 'Middle',
          value: '',
        },
        {
          name: 'Transcript',
          value: JSON.stringify(transcriptContent.value?.courseTranscript),
        },
        {
          name: 'School',
          value: 'Cape Fear Community College',
        },
        {
          name: 'GPA',
          value: GPA,
        },
      ],
    },
    trace: false,
  };
};
// Submit
const issuerStore = useIssuerStore();
const toast = useToast();
const successful = ref<string[]>([]);
const failed = ref<string[]>([]);
// Submit function
const handleSubmit = async (payload: any) => {
  try {
    await issuerStore.offerCredential(payload);
    // toast.info('Transcript Sent');
    successful.value.push(payload.connection_id);
  } catch (error) {
    // toast.error(`Failure: ${error}`);
    failed.value.push(payload.connection_id);
  }
};
onMounted(async () => {
  credentialDefinitionId.value = (
    await sisApi.getHttp(`metadata/transcript-credential-definition-id`)
  ).data?.transcriptCredentialDefinitionId;
  await connectionStore.listConnections().catch((err) => {
    console.error(`Failure: ${err}`);
  });
  const fetchAllMetadata = connections.value.map((connection: any) => {
    fetchMetadata(connection?.connection_id);
  });
  await Promise.all(fetchAllMetadata);
});
</script>
<style scoped>
.bulk-issue-connection-count {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.counts {
  margin-bottom: 1rem;
  text-align: center;
}
</style>
