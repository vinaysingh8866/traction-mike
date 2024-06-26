<template>
  <div class="bulk-issue-connection-count">
    <div class="counts">
      <p>{{ $t('bulkIssue.totalConnections', { count: totalConnections }) }}</p>
      <p>
        {{
          $t('bulkIssue.connectionsWithStudentId', {
            count: connectionsWithStudentId,
          })
        }}
      </p>
    </div>
    <div class="flex justify-content-between">
      <Button
        :label="$t('bulkIssue.getConnections')"
        icon="pi pi-info-circle"
        @click="loadConnections"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue
import { ref, computed } from 'vue';
// State
import { useConnectionStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useToast } from 'vue-toastification';
// PrimeVue Components
import Button from 'primevue/button';

const toast = useToast();

const { listConnections } = useConnectionStore();
const { connections } = storeToRefs(useConnectionStore());
const connectionStore = useConnectionStore();
const { loading } = storeToRefs(useConnectionStore());

const totalConnections = computed(() => connections.value.length);

const connectionsWithStudentId = computed(() => {
  return connections.value.filter((conn: any) => {
    return conn.results && conn.results.student_id;
  }).length;
});

const loadConnections = async () => {
  try {
    await connectionStore.listConnections();
  } catch (err) {
    console.error(err);
    toast.error(`Failure: ${err}`);
  }
};
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
