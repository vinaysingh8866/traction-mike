<template>
  <MainCardContent :title="$t('bulkIssue.bulkIssue')">
    <Panel class="mb-5" header="Connection Count">
      <BulkIssueConnectionCount />
    </Panel>
    <BulkIssueReport />
  </MainCardContent>
</template>

<script setup lang="ts">
import MainCardContent from '@/components/layout/mainCard/MainCardContent.vue';
import Panel from 'primevue/panel';
import BulkIssueConnectionCount from '@/components/issuance/bulkIssue/BulkIssueConnectionCount.vue';
import BulkIssueReport from '@/components/issuance/bulkIssue/BulkIssueReport.vue';
</script>
