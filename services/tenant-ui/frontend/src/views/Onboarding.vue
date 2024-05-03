<template>
  <div class="onboarding-container">
    <MainCardContent :title="$t('onboarding.onboarding')">
      <Accordion :multiple="true">
        <AccordionTab header="Onboarding Form">
          <form @submit.prevent="submitForm" class="onboarding-form">
            <div class="form-group">
              <label for="studentId">{{ $t('onboarding.studentId') }}</label>
              <InputText id="studentId" v-model="studentId" required />
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
  // Add actual submission logic here
}

function clearForm() {
  studentId.value = '';
  fullName.value = '';
}
</script>

<style scoped>
.onboarding-container {
  padding: 20px; /* Adds padding around the form */
}

.onboarding-form {
  max-width: 650px; /* Increase the max-width by 30% over a typical 500px base */
}

.form-group {
  margin-bottom: 20px;
}

.form-group input {
  width: 100%; /* Ensures input fields take full width of the form group */
}

label {
  display: block;
  margin-bottom: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between; /* Positions the buttons at the edges */
}

.button-clear {
  margin-right: auto; /* Pushes the clear button to the left */
}

.button-submit {
  margin-left: auto; /* Keeps the submit button on the right */
}

/* Responsive Design Adjustments */
@media (max-width: 768px) {
  .onboarding-form {
    max-width: 100%; /* Allows the form to expand to full width on smaller screens */
  }
  .form-group input,
  .form-actions button {
    width: 100%; /* Makes buttons and inputs full width */
  }
  .form-actions {
    flex-direction: column; /* Stacks the buttons vertically on small screens */
    align-items: stretch;
  }
  .button-clear,
  .button-submit {
    margin-top: 10px;
  }
  .button-submit {
    margin-left: 0; /* Aligns the button correctly in the column layout */
  }
}
</style>
