<template>
  <div>
    <form @submit.prevent="handleSubmit(!v$.$invalid)">
      <!-- Connection -->
      <div class="field">
        <label
          for="selectedConnection"
          :class="{ 'p-error': v$.selectedConnection.$invalid && submitted }"
        >
          {{ t('verify.connection') }}
          <ProgressSpinner v-if="connectionsLoading" />
        </label>

        <AutoComplete
          id="selectedConnection"
          v-model="v$.selectedConnection.$model"
          class="w-full"
          :disabled="connectionsLoading"
          :suggestions="filteredConnections"
          :dropdown="true"
          option-label="label"
          force-selection
          @complete="searchConnections($event)"
        />
        <small
          v-if="v$.selectedConnection.$invalid && submitted"
          class="p-error"
          >{{ v$.selectedConnection.required.$message }}</small
        >
      </div>
      <!-- Schema -->
      <div class="field">
        <label
          for="schema"
          :class="{ 'p-error': !formFields.schema_id && submitted }"
          >{{ t('issue.schema') }}</label
        >
        <Dropdown
          id="schema_id"
          v-model="formFields.schema_id"
          :options="storedSchemas"
          option-value="schema_id"
          option-label="schema_id"
          class="w-full"
          :placeholder="t('configuration.credentialDefinitions.selectSchema')"
          @change="selectedAttrNames = selectedSchema?.schema.attrNames"
        />
        <small v-if="!formFields.schema_id && submitted" class="p-error">{{
          v$.selectedConnection.required.$message
        }}</small>
      </div>
      <div
        v-for="attrName of selectedSchema?.schema.attrNames"
        :key="attrName"
        class="flex align-items-center mb-2"
      >
        <Checkbox
          v-model="selectedAttrNames"
          :input-id="attrName"
          name="category"
          :value="attrName"
        />
        <label :for="attrName" class="ml-2"> {{ attrName }}</label>
      </div>
      <div v-if="!selectedAttrNames?.length && selectedSchema" class="p-error">
        {{ t('verifier.noAttrChecked') }}
      </div>

      <!-- Comment -->
      <div class="field">
        <label for="comment">
          {{ t('verify.comment') }}
        </label>
        <Textarea
          id="comment"
          v-model="v$.comment.$model"
          class="w-full"
          :auto-resize="true"
          rows="1"
        />
      </div>

      <Button
        type="submit"
        :label="t('common.submit')"
        class="w-full"
        :disabled="loading"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
// Types
import {
  IndyProofRequest,
  V10PresentationSendRequestRequest,
} from '@/types/acapyApi/acapyInterface';
import { SchemaStorageRecord } from '@/types';
// Vue
import { computed, onMounted, reactive, ref } from 'vue';
// PrimeVue / Validation / etc
import AutoComplete from 'primevue/autocomplete';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import { required } from '@vuelidate/validators';
import { useVuelidate } from '@vuelidate/core';
import { useToast } from 'vue-toastification';
// State
import { storeToRefs } from 'pinia';
import {
  useConnectionStore,
  useGovernanceStore,
  useVerifierStore,
} from '@/store';
import { useI18n } from 'vue-i18n';
// PrimeVue
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';

const toast = useToast();
const { t } = useI18n();

// Store values
const { loading } = storeToRefs(useVerifierStore());
const { loading: connectionsLoading, connectionsDropdown } =
  storeToRefs(useConnectionStore());
const verifierStore = useVerifierStore();

// Schema values
const governanceStore = useGovernanceStore();
const { storedSchemas } = storeToRefs(useGovernanceStore());
const selectedAttrNames = ref<string[] | undefined>([]);
const selectedSchema = computed(() =>
  storedSchemas
    ? storedSchemas.value.find(
        (schema: SchemaStorageRecord) =>
          schema.schema_id === formFields.schema_id
      )
    : undefined
);

// Props
const props = defineProps<{
  existingPresReq?: IndyProofRequest;
}>();

const emit = defineEmits(['closed', 'success']);

// The default placeholder JSON to start with for this form
// (or supplied by parent component)
const proofRequestJson = computed(() => {
  return props.existingPresReq
    ? props.existingPresReq
    : ({
        name: 'proof-request',
        nonce: '1234567890',
        version: '1.0',
        requested_attributes: {
          studentInfo: {
            names: selectedAttrNames.value,
            restrictions: [
              {
                schema_name: selectedSchema.value?.schema.name,
              },
            ],
          },
        },
        requested_predicates: {},
      } as IndyProofRequest);
});

// Autocomplete setup
// These can maybe be generalized into a util function (for all dropdown searches)
const searchConnections = (event: any) => {
  if (!event.query.trim().length) {
    filteredConnections.value = [...(connectionsDropdown as any).value];
  } else {
    filteredConnections.value = (connectionsDropdown.value as any).filter(
      (connection: any) => {
        return connection.label
          .toLowerCase()
          .includes(event.query.toLowerCase());
      }
    );
  }
};

// Form Fields
const filteredConnections = ref();
const formFields = reactive({
  autoVerify: false,
  comment: '',
  // This is not good typescript but need an object with fields
  // in a dropdown that displays a string that can be blank. TODO
  selectedConnection: undefined as any,
  schema_id: '' as string,
});
const rules = {
  autoVerify: {},
  comment: {},
  selectedConnection: { required },
  schema_id: { required },
};
const v$ = useVuelidate(rules, formFields);

// Form submission
const submitted = ref(false);
const handleSubmit = async (isFormValid: boolean) => {
  submitted.value = true;
  if (!isFormValid || !selectedAttrNames.value?.length) {
    return;
  }
  try {
    // The json control changes to a string for some reason after editing...
    const proofRequest: IndyProofRequest =
      typeof proofRequestJson.value === 'string'
        ? JSON.parse(proofRequestJson.value)
        : proofRequestJson.value;
    // Set up the body with the fields from the form
    const payload: V10PresentationSendRequestRequest = {
      connection_id: formFields.selectedConnection.value,
      auto_verify: false,
      comment: formFields.comment,
      trace: false,
      proof_request: proofRequest,
    };
    await verifierStore.sendPresentationRequest(payload);
    toast.info('Request Sent');
    emit('success');
    // close up on success
    emit('closed');
  } catch (error) {
    toast.error(`Failure: ${error}`);
  } finally {
    submitted.value = false;
  }
};
// Lifecycle hooks
onMounted(async () => {
  try {
    await governanceStore.listStoredSchemas();
    // Wait til schemas are loaded so the getter can map together the schemas to creds
  } catch (err) {
    console.error(err);
    toast.error(`Failure: ${err}`);
  }
});
</script>
