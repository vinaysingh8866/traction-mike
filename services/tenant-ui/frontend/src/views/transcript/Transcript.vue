<template>
  <div class="transcript-container">
    <MainCardContent :title="$t('transcript.transcript')">
      <Accordion :multiple="true">
        <AccordionTab header="Transcript Form">
          <form class="transcript-form" @submit.prevent="submitForm">
            <div class="form-group transcript-group">
              <label for="studentID">{{ $t('transcript.studentID') }}</label>
              <div class="input-and-button">
                <InputText id="schema" v-model="schema" required />
                <Button
                  :label="$t('transcript.findTranscript')"
                  icon="pi pi-search"
                  class="search-transcript"
                  @click="findTranscript"
                />
              </div>
            </div>
            <!-- Only display this section if fetchedSchema has been set -->
            <div v-if="fetchedSchema">
              <div
                v-if="
                  fetchedSchema.schema &&
                  fetchedSchema.schema.attrNames &&
                  fetchedSchema.schema.attrNames.length > 0
                "
              >
                <h3>{{ $t('transcript.details') }}</h3>
                <div>
                  <strong>{{ $t('transcript.attributes') }}</strong>
                  <ul>
                    <li
                      v-for="attrName in fetchedSchema.schema.attrNames"
                      :key="attrName"
                    >
                      {{ attrName }}
                    </li>
                  </ul>
                </div>
              </div>
              <div v-else>
                <strong>{{ $t('transcript.attributes') }}</strong>
                {{ $t('transcript.noAttributes') }}
              </div>
            </div>

            <div class="form-actions">
              <Button
                :label="$t('transcript.clear')"
                icon="pi pi-times"
                class="button-clear"
                @click="clearForm"
              />
              <Button
                :label="$t('transcript.submit')"
                icon="pi pi-check"
                class="button-submit"
                type="submit"
              />
            </div>
          </form>
        </AccordionTab>
      </Accordion>
    </MainCardContent>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { useGovernanceStore } from '@/store/governanceStore';
import { useI18n } from 'vue-i18n';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';
import { SchemaStorageRecord, Schema } from '@/types/acapyApi/acapyInterface';

import {
  Schema as BaseSchema,
  SchemaStorageRecord as BaseSchemaStorageRecord,
} from '@/types/acapyApi/acapyInterface';

interface MySchema {
  schema_id: string;
}

// Extend the original Schema to include detailed property types
interface ExtendedSchema extends BaseSchema {
  attrNames?: string[];
}

// Extend the SchemaStorageRecord to use ExtendedSchema
interface ExtendedSchemaStorageRecord extends BaseSchemaStorageRecord {
  schema?: ExtendedSchema;
}

const { t } = useI18n();
const schema = ref('');
const fetchedSchema: Ref<ExtendedSchemaStorageRecord | null> = ref(null);
const { getStoredSchemas } = useGovernanceStore();

function submitForm() {
  console.log('Submitting:', {
    schema: schema.value,
  });
}

function clearForm() {
  schema.value = '';
  fetchedSchema.value = null; // Reset the fetchedSchema to clear displayed details
}

async function findTranscript() {
  try {
    const schemas: MySchema[] = await getStoredSchemas();
    const foundSchema = schemas?.find(
      (s: MySchema) => s.schema_id === schema.value
    );
    fetchedSchema.value = foundSchema || null;
  } catch (error) {
    console.error('Error fetching schema:', error);
    fetchedSchema.value = null;
  }
}
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

.search-transcript {
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
  .button-clear,
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
