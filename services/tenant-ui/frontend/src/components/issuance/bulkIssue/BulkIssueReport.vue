<template>
  <div class="bulk-issue-report">
    <Accordion>
      <AccordionTab :header="$t('bulkIssue.failedToSend')">
        <DataTable
          :value="reportData"
          :sort-field="sortField"
          :sort-order="sortOrder"
          class="custom-table"
          :paginator="true"
          :rows="10"
          :rows-per-page-options="[10, 25]"
        >
          <Column
            field="date"
            header="Date"
            sortable
            :header-class="dateHeaderClass"
            @click="toggleSortOrder"
          >
          </Column>
          <Column field="student_id" header="Student ID" />
          <Column field="connection_id" header="Connection ID" />
          <Column field="full_name" header="Full Name" />
        </DataTable>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Sample data
const reportData = ref([
  {
    student_id: '0514270',
    connection_id: 'abc123',
    full_name: 'Miguel Landeros-Loa',
    date: '2023-06-26',
  },
  {
    student_id: '0514271',
    connection_id: 'def456',
    full_name: 'John Doe',
    date: '2023-06-25',
  },
  // Add more data here
]);

// Sorting
const sortField = ref('date');
const sortOrder = ref(-1); // Descending order by default

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 1 ? -1 : 1;
};

const sortIconClass = computed(() => {
  return sortOrder.value === 1
    ? 'pi pi-sort-amount-up-alt'
    : 'pi pi-sort-amount-down-alt';
});

const dateHeaderClass = 'sortable-column';
</script>
