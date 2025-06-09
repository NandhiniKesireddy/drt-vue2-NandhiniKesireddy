<template>
  <v-row no-gutters>
    <v-col cols="9">
      <asset-table />
    </v-col>
    <v-col cols="3">
      <selected-assets />
    </v-col>
  </v-row>
</template>

<script>
import AssetTable from './AssetTable.vue';
import SelectedAssets from './SelectedAssets.vue';

export default {
  components: {
    AssetTable,
    SelectedAssets
  }
};
</script>
