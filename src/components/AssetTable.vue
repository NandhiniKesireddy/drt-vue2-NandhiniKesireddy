<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="pr-5">
    <top-bar @filter-change="onFilterChange" />

    <!-- Select All & Object Count -->
    <v-row
      no-gutters
      align="center"
      class="ma-0 pa-0"
    >
      <v-col cols="10">
        <v-checkbox
          v-model="selectAll"
          label="Select All"
          hide-details
          class="ma-0 pa-0 white--text"
          style="color: white"
          @change="toggleSelectAll"
        />
      </v-col>
      <v-col
        cols="2"
        class="text-right"
      >
        <span class="white--text text-caption">
          {{ visibleItems.length }} Objects , {{filteredSatelliteItems.length}} Objects
        </span>
      </v-col>
    </v-row>

    <v-divider
      class="ma-1"
      color="grey darken-1"
    />

    <v-data-table
      :headers="headers"
      :items="filteredSatelliteItems"
      item-key="noradCatId"
      class="elevation-1 pt-3"
      height="450"
      fixed-header
      hide-default-footer
      dense
      :items-per-page="25"
    >
      <!-- Action Checkbox Slot -->
      <template #item.action="{ item }">
        <v-checkbox
          :input-value="isSelected(item.noradCatId)"
          :disabled="!isSelected(item.noradCatId) && selectedAssets.length >= 10"
          hide-details
          color="primary"
          @change="() => toggleItem(item)"
        />
      </template>

      <!-- No Data Slot -->
      <template #no-data>
        <v-alert
          :value="true"
          type="info"
          border="left"
          color="blue lighten-3"
        >
          No satellite data found
        </v-alert>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import TopBar from "./TopBar.vue";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  components: { TopBar },
  data() {
    return {
      selectAll: false,
      headers: [
        { text: "", value: "action", width: 10 },
        { text: "NORADID", value: "noradCatId" },
        { text: "Name", value: "name" },
        { text: "COSPARID", value: "intlDes" },
        { text: "Regime", value: "orbitCode" },
        { text: "Country", value: "countryCode" },
      ],
    };
  },
  computed: {
    ...mapState(["selectedAssets"]),
    ...mapGetters(["filteredSatelliteItems", "isSelected", "allSatellites"]),
    
    // Show full list initially, fallback to filtered list if filters applied
    visibleItems() {
      return this.isFilterApplied ? this.filteredSatelliteItems : this.allSatellites;
    },

    isFilterApplied() {
      return this.$store.state.filters &&
        Object.values(this.$store.state.filters).some(
          (val) => Array.isArray(val) ? val.length : val
        );
    },
  },
  watch: {
    selectedAssets() {
      const firstTen = this.visibleItems.slice(0, 10);
      const allSelected = firstTen.every(item => this.isSelected(item.noradCatId));
      this.selectAll = allSelected;
    },
  },
  mounted() {
    this.fetchSatellitesData();
  },
  methods: {
    ...mapActions([
      "fetchSatellitesData",
      "addAsset",
      "removeAsset",
      "updateFilters",
      "clearSelectedAssets", // use this in SelectedAssets.vue ClearAll button
    ]),

    onFilterChange(filters) {
      this.updateFilters(filters);
    },

    toggleItem(item) {
      if (this.isSelected(item.noradCatId)) {
        this.removeAsset(item.noradCatId);
      } else {
        this.addAsset(item);
      }
    },

    toggleSelectAll() {
      if (this.selectAll) {
        // Uncheck only the first 10 that are currently selected
        this.visibleItems.slice(0, 10).forEach((item) => {
          if (this.isSelected(item.noradCatId)) {
            this.removeAsset(item.noradCatId);
          }
        });
      } else {
        const unselected = this.visibleItems.filter(
          (item) => !this.isSelected(item.noradCatId)
        );
        const remaining = 10 - this.selectedAssets.length;
        unselected.slice(0, remaining).forEach((item) => {
          this.addAsset(item);
        });
      }
    },
  },
};
</script>

<style scoped>
.white--text {
  color: white !important;
}
</style>