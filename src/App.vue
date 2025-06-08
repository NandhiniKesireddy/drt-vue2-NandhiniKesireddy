<template>
  <v-app>
    <v-container
      fluid
      style="background: linear-gradient(to right, rgb(10, 56, 101), rgb(50, 100, 150)); height: 100vh;"
    >
      <v-row no-gutters>
        <v-col cols="9">
          <asset-table />
        </v-col>
        <v-col cols="3">
          <selected-assets />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import AssetTable from './components/AssetTable.vue';
import SelectedAssets from './components/SelectedAssets.vue';

export default {
  components: {
    AssetTable,
    SelectedAssets
  }
};
</script>
