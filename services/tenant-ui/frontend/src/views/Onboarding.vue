
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
                <p class="text-error">{{ $t('onboarding.notFound') }}</p>
              </div>
              <div v-else-if="successMessage" class="center-content">
                <p class="text-success">{{ $t('onboarding.found') }}</p>
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
        </AccordionTab>
      </Accordion>
    </MainCardContent>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStudentStore } from '@/store/studentStore';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

import Dialog from 'primevue/dialog';

import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';

const loading = ref(false);
const error = ref(false);
let errMessage = null;
let successMessage = null;
const dialogVisible = ref(false);
const { t } = useI18n();
const studentId = ref('');
const fullName = ref('');

const { idLookup } = useStudentStore();

const submitForm = () => {
  console.log('Submitting:', { studentId: studentId.value, fullName: fullName.value });
}

const clearForm = () => {
  studentId.value = '';
  fullName.value = '';
  error.value = false
  successMessage = null
}

const handleIdLookUp = async () => {
  loading.value = true;
  dialogVisible.value = true;
  try {
    const result = await idLookup(studentId.value);
    if (result && result.studentName) {
      fullName.value = result.studentName.fullName; 
      successMessage = result.studentName.fullName;
      loading.value = false;
      dialogVisible.value = false;
    } else {
      error.value = t('onboarding.notFound');
      throw new Error(t('onboarding.notFound'));
    }
  } catch (err) {
    console.error('Error during ID Lookup:', err.message);
    loading.value = false;
    error.value = true;
    errMessage = err.message;
    dialogVisible.value = false; 
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
}
</style>
