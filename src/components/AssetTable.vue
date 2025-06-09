<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="pr-5 pt-3">
    <top-bar @filter-change="onFilterChange" />
    <v-snackbar
      v-model="showAlert"
      top
      right
      color="red darken-2"
      timeout="3000"
    >
      You can select a maximum of 10 assets only.
    </v-snackbar>

    <v-row no-gutters align="center" class="ma-0 pa-0">
      <v-col cols="2" style="color: white !important">
        <v-checkbox
          v-model="selectAll"
          hide-details
          class="ma-0 pa-0 text-caption"
          color="white"
          @change="toggleSelectAll"
        >
          <template #label>
            <span class="white--text">Select All</span>
          </template>
        </v-checkbox>
      </v-col>
      <v-col cols="8" />
      <v-col cols="2" class="text-right">
        <span class="white--text text-caption">
          {{ visibleItems.length }} Objects
        </span>
      </v-col>
    </v-row>

    <v-divider class="ma-1" color="grey darken-1" />

    <v-skeleton-loader
      v-if="isLoading"
      type="table"
      height="300px"
      class="mx-2 my-4"
    />

    <div
      v-show="!isLoading"
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
        <template #item.action="{ item }">
          <v-checkbox
            :input-value="isSelected(item.noradCatId)"
            :disabled="!isSelected(item.noradCatId) && selectedAssets.length >= 10"
            hide-details
            color="primary"
            @change="() => handleSelect(item)"
          />
        </template>

        <template #item.typeIcon="{ item }">
          <v-icon :color="getObjectTypeColor(item.objectType)" small>
            {{ getObjectTypeIcon(item.objectType) }}
          </v-icon>
        </template>

        <template #item.orbitCode="{ item }">
          {{ formatOrbitCode(item.orbitCode) }}
        </template>

        <template #no-data>
          <v-alert :value="true" type="info" border="left" color="blue lighten-3">
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
      isLoading: true,
      showAlert: false,
      selectAll: false,
      itemsToShow: 50,
      loadingMore: false,
      headers: [
        { text: '', value: 'action', width: 10, sortable: false },
        { text: 'NORADID', value: 'noradCatId', sortable: true },
        { text: 'Name', value: 'name', sortable: true },
        { text: 'OrbitCode', value: 'orbitCode', sortable: false },
        { text: 'ObjectType', value: 'objectType', sortable: false, width: 80 },
        { text: 'Country', value: 'countryCode', sortable: true },
        { text: 'Launch Date', value: 'launchDate', sortable: true },
        { text: 'Type', value: 'typeIcon', sortable: false, width: 80 },
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
    this.fetchSatellitesData().then(() => {
      this.isLoading = false;
    });
  },
  methods: {
    ...mapActions([
      "fetchSatellitesData",
      "addAsset",
      "removeAsset",
      "updateFilters",
      "clearSelectedAssets",
    ]),

    formatOrbitCode(value) {
      return value ? value.replace(/[{}]/g, '') : '';
    },

    onFilterChange(filters) {
      this.updateFilters(filters);
    },

    handleSelect(item) {
      if (this.isSelected(item.noradCatId)) {
        this.removeAsset(item.noradCatId);
      } else {
        if (this.selectedAssets.length >= 10) {
          this.showAlert = true;
          return;
        }
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

    getObjectTypeIcon(type) {
      switch (type?.toUpperCase()) {
        case 'PAYLOAD':
          return 'mdi-satellite-variant';
        case 'DEBRIS':
          return 'mdi-close-octagon';
        case 'ROCKET BODY':
          return 'mdi-rocket';
        case 'UNKNOWN':
          return 'mdi-help-circle';
        default:
          return 'mdi-help-circle-outline';
      }
    },
    getObjectTypeColor(type) {
      switch (type?.toUpperCase()) {
        case 'PAYLOAD':
          return 'blue';
        case 'DEBRIS':
          return 'red';
        case 'ROCKET BODY':
          return 'green';
        case 'UNKNOWN':
          return 'grey';
        default:
          return 'grey';
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