<!-- eslint-disable vue/valid-v-slot -->
<!-- eslint-disable vue/v-slot-style -->
<template>
  <v-container>
    <h2 class="white--text mb-4">
      Selected Assets
    </h2>

    <v-data-table
      :headers="headers"
      :items="selectedAssets"
      class="elevation-1"
      dense
      hide-default-footer
      style="background-color: rgb(85 131 177); color: white;"
    >
      <template v-slot:item.noradCatId="{ item }">
        <span>{{ item.noradCatId }}</span>
      </template>

      <template v-slot:item.name="{ item }">
        <span>{{ item.name }}</span>
      </template>
    </v-data-table>

    <div
      v-if="selectedAssets.length === 0"
      class="grey--text text-center mt-4"
    >
      No selected assets found.
    </div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'NORAD Catalog ID', value: 'noradCatId' }
      ],
      selectedAssets: []
    };
  },
  mounted() {
    const saved = localStorage.getItem('selectedAssets');
    this.selectedAssets = saved ? JSON.parse(saved) : [];
  }
};
</script>

<style scoped>
.v-data-table th {
  color: #4fc3f7;
}
</style>
