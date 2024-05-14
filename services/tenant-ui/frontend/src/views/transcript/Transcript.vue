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
                  :disabled="!schema || loading"
                  @click="findTranscript"
                />
              </div>
              <div v-if="loading" class="center-content">
                <i class="pi pi-spin pi-spinner" style="font-size: 2em"></i>
                <p>{{ $t('transcript.fetching') }}</p>
              </div>
              <div v-else-if="error" class="center-content">
                <p class="text-error">{{ errMessage }}</p>
              </div>
              <div v-if="fetchedSchema" class="center-content">
                <h3>{{ $t('transcript.details') }}</h3>
                <div v-if="fetchedSchema.studentCumulativeTranscript">
                  <strong>{{ $t('transcript.cumulativeTranscript') }}</strong>
                  <ul>
                    <li>
                      {{ $t('transcript.cumulativeAttemptedCredits') }}
                      {{
                        fetchedSchema.studentCumulativeTranscript[0]
                          ?.cumulativeAttemptedCredits
                      }}
                    </li>
                    <li>
                      {{ $t('transcript.cumulativeEarnedCredits') }}
                      {{
                        fetchedSchema.studentCumulativeTranscript[0]
                          ?.cumulativeEarnedCredits
                      }}
                    </li>
                    <li>
                      {{ $t('transcript.cumulativeGradePointAverage') }}
                      {{
                        fetchedSchema.studentCumulativeTranscript[0]
                          ?.cumulativeGradePointAverage
                      }}
                    </li>
                  </ul>
                </div>

                <div
                  v-if="
                    fetchedSchema.courseTranscript &&
                    fetchedSchema.courseTranscript.length > 0
                  "
                >
                  <strong>{{ $t('transcript.courseTranscript') }}</strong>
                  <ul>
                    <li
                      v-for="course in fetchedSchema.courseTranscript"
                      :key="course.courseCode"
                    >
                      {{
                        $t('transcript.courseDetails', {
                          title: course.courseTitle,
                          code: course.courseCode,
                          grade: course.finalLetterGradeEarned,
                        })
                      }}
                    </li>
                  </ul>
                </div>
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
import { useStudentStore, useConnectionStore } from '@/store';

interface ExtendedSchema {
  attrNames?: string[];
}

interface ExtendedSchemaStorageRecord {
  schema?: ExtendedSchema;
  studentCumulativeTranscript?: {
    cumulativeAttemptedCredits: number;
    cumulativeEarnedCredits: number;
    cumulativeGradePointAverage: number;
  }[];
  courseTranscript?: {
    schoolYear: number;
    term: string;
    courseTitle: string;
    courseCode: string;
    academicPeriod: number;
    earnedCredits: number;
    finalNumericGradeEarned: number;
    finalLetterGradeEarned: string;
  }[];
}

const { t } = useI18n();
const schema = ref('');
const fetchedSchema: Ref<ExtendedSchemaStorageRecord | null> = ref(null);
//const { getStoredSchemas } = useGovernanceStore();
const { getStudentInfo } = useStudentStore();
const loading = ref(false);
const error = ref(false);
let errMessage = '';

function submitForm() {
  console.log('Submitting:', {
    schema: schema.value,
  });
}

function clearForm() {
  schema.value = '';
  fetchedSchema.value = null; // Reset the fetchedSchema to clear displayed details
}

const findTranscript = async () => {
  loading.value = true;
  error.value = false;

  try {
    const studentInfo = await getStudentInfo(schema.value);
    console.log(schema.value);
    console.log(studentInfo);
    if (studentInfo) {
      fetchedSchema.value = studentInfo;
    } else {
      throw new Error(t('transcript.notFound'));
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Error fetching student info:', errorMessage);
    errMessage = errorMessage;
    error.value = true;
  } finally {
    loading.value = false;
  }
};
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
