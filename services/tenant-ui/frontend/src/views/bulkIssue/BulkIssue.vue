<template>
  <MainCardContent
    :title="$t('bulkIssue.bulkIssue')"
    :refresh-callback="loadTable"
  >
    <BulkIssueConnectionCount />
  </MainCardContent>
</template>

<script setup lang="ts">
// Import the BulkIssueConnectionCount component
import BulkIssueConnectionCount from '@/components/issuance/bulkIssue/BulkIssueConnectionCount.vue';

const loadTable = async () => {
  // This function can be used to trigger any additional logic needed on refresh
};
</script>
