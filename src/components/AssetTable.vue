<template>
  <div class="pr-5">
    <top-bar @filter-change="onFilterChange" />

    <v-row no-gutters align="center" class="ma-0 pa-0">
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
      <v-col cols="2" class="text-right">
        <span class="white--text text-caption">
          {{ visibleItems.length }} Objects
        </span>
      </v-col>
    </v-row>

    <v-divider class="ma-1" color="grey darken-1" />

    <!-- Scrollable Wrapper -->
    <div
      ref="scrollWrapper"
      class="custom-scroll-wrapper"
      @scroll="handleScroll"
    >
      <v-data-table
        :headers="headers"
        :items="visibleItems"
        item-key="noradCatId"
        class="elevation-1 pt-3 no-internal-scroll"
        hide-default-footer
        dense
        disable-pagination
        fixed-header
      >
        <!-- Action Checkbox Slot -->
        <!-- eslint-disable-next-line vue/valid-v-slot -->
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

    <v-progress-linear
      v-if="loadingMore"
      indeterminate
      color="blue lighten-2"
      height="4"
    />
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
      itemsToShow: 50,
      loadingMore: false,
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

    isFilterApplied() {
      return this.$store.state.filters &&
        Object.values(this.$store.state.filters).some(
          (val) => Array.isArray(val) ? val.length : val
        );
    },

    visibleItems() {
      const items = this.isFilterApplied
        ? this.filteredSatelliteItems
        : this.allSatellites;
      return items.slice(0, this.itemsToShow);
    },
  },
  watch: {
    selectedAssets() {
      const firstTen = this.visibleItems.slice(0, 10);
      const allSelected = firstTen.every((item) => this.isSelected(item.noradCatId));
      this.selectAll = allSelected;
    },
    filteredSatelliteItems() {
      this.itemsToShow = 50;
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
      "clearSelectedAssets",
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
        const unselected = this.visibleItems.filter(
          (item) => !this.isSelected(item.noradCatId)
        );
        const remaining = 10 - this.selectedAssets.length;
        unselected.slice(0, remaining).forEach((item) => {
          this.addAsset(item);
        });
      } else {
        this.visibleItems.slice(0, 10).forEach((item) => {
          if (this.isSelected(item.noradCatId)) {
            this.removeAsset(item.noradCatId);
          }
        });
      }
    },

    handleScroll() {
      const wrapper = this.$refs.scrollWrapper;
      if (!wrapper) return;

      const bottomReached =
        wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 50;

      if (
        bottomReached &&
        this.itemsToShow < this.filteredSatelliteItems.length &&
        !this.loadingMore
      ) {
        this.loadingMore = true;
        setTimeout(() => {
          this.itemsToShow += 50;
          this.loadingMore = false;
        }, 300);
      }
    },
  },
};
</script>

<style scoped>
.white--text {
  color: white !important;
}

.custom-scroll-wrapper {
  max-height: 450px;
  overflow-y: auto;
}

::v-deep(.v-data-table__wrapper) {
  overflow-y: visible !important;
  max-height: unset !important;
  height: auto !important;
}
</style>
