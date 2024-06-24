<script setup lang="ts">
import { ref } from 'vue';
import { Button, Column, DataTable, Dialog } from '@/lib/primevue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Props
type Props = {
  results: Array<Object>;
  resource: any;
  resourceType: string;
};

const props = withDefaults(defineProps<Props>(), {
  results: undefined
});

const modelValue = defineModel<boolean>({ default: false });

// Exports DataTable results
const batchResults = ref();

const exportCSV = () => {
  batchResults.value.exportCSV();
};
</script>
<template>
  <Dialog
    v-model:visible="modelValue"
    header="Results"
    :modal="true"
  >
    <DataTable
      ref="batchResults"
      :export-filename="`${resourceType === 'object' ? resource.name.replace(/\.[^/.]+$/, '') : resource.bucketName}_bulk_results`"
      :value="props.results"
      class="p-datatable-striped"
    >
      <div class="action-buttons">
        <Button
          v-tooltip.bottom="'Save results'"
          aria-label="Save results"
          class="p-button p-button-text"
          @click="exportCSV()"
        >
          <font-awesome-icon icon="fas fa-download" />
        </Button>
      </div>
      <Column
        field="email"
        header="Email"
      />
      <Column
        field="description"
        header="Result"
      >
        <template #body="{ data }">
          <span>
            <span class="m-1">
              <font-awesome-icon
                v-if="data.status === 1"
                icon="fa-circle-check"
                class="icon-success"
              />
              <font-awesome-icon
                v-else-if="data.status === 0"
                icon="fa-circle-minus"
                class="icon-noaction"
              />
              <font-awesome-icon
                v-else
                icon="fa-circle-xmark"
                class="icon-error"
              />
            </span>
            {{ data.description }}
          </span>
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<style scoped lang="scss">
.icon-success {
  color: $bcbox-success;
}
.icon-error {
  color: $bcbox-error;
}
.icon-noaction {
  color: $bcbox-noaction;
}
</style>
