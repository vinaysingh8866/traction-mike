<template>
  <div class="transcript-container">
    <MainCardContent :title="$t('transcript.transcript')">
      <Accordion :multiple="true">
        <AccordionTab header="Transcript Form">
          <form class="transcript-form" @submit.prevent="submitForm">
            <div class="form-group schema-group">
              <label for="schema">{{ $t('transcript.schema') }}</label>
              <div class="input-and-button">
                <InputText id="schema" v-model="schema" required />
                <Button
                  :label="$t('transcript.schemaLookup')"
                  icon="pi pi-search"
                  class="schema-lookup"
                  @click="schemaLookup"
                />
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';

const { t } = useI18n();
const schema = ref('');

function submitForm() {
  console.log('Submitting:', {
    schema: schema.value,
  });
}

function clearForm() {
  schema.value = '';
}

function schemaLookup() {
  console.log('Looking up Schema:', schema.value);
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

.schema-group .input-and-button {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.schema-group input {
  width: 100%;
}

.schema-lookup {
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
  .schema-group .input-and-button {
    align-items: stretch;
  }
}
</style>
