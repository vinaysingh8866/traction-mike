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
                  @click="idLookup"
                />
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
                @click="clearForm"
              />
              <Button
                :label="$t('onboarding.submit')"
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
const studentId = ref('');
const fullName = ref('');

function submitForm() {
  console.log('Submitting:', { studentId: studentId.value, fullName: fullName.value });
}

function clearForm() {
  studentId.value = '';
  fullName.value = '';
}

function idLookup() {
  console.log('Looking up ID:', studentId.value);
}
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
}
</style>
