<template>
  <div>
    <h2 class="text-white my-2">
      Create My Asset List
    </h2>

    <v-row
      dense
      class="px-2 py-1"
      style="background: black; border-radius: 2px"
    >
      <v-btn
        v-for="item in assetTypes"
        :key="item.label"
        :text="!isSelectedType(item.value)"
        :outlined="isSelectedType(item.value)"
        color="white"
        class="ma-1"
        @click="toggleType(item.value)"
      >
        <v-icon
          left
          small
        >
          {{ item.icon }}
        </v-icon>
        {{ item.label }} ({{ item.count }})
      </v-btn>
    </v-row>

    <v-row
      dense
      class="mt-3 px-2"
    >
      <v-col cols="4">
        <v-text-field
          v-model="searchText"
          append-icon="mdi-magnify"
          label="Search by Name"
          solo 
          dense 
          clearable
          @keyup.enter="emitFilters"
          @click:append="applyFilters()"
          @click:clear="resetFilters"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="selectedConstellation"
          :items="allObjectTypes"
          label="Constellation"
          solo 
          dense 
          clearable
          multiple
          @click="applyFilters()"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="selectedCountry"
          :items="allCountries"
          label="Country"
          solo 
          dense 
          clearable
          @click="applyFilters()"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="selectedRegime"
          :items="allRegimes"
          label="Regime"
          solo 
          dense 
          clearable
          @click="applyFilters()"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="selectedPurpose"
          :items="satellitePurposes"
          label="Purpose"
          solo 
          dense 
          clearable
          @click="applyFilters()"
        />
      </v-col>
    </v-row>
    <v-row style="margin-top:-10px">
      <v-col cols="8" />
      <v-col cols="2">
        <v-btn
          block
          color="primary"
          class="white--text mt-2"
          @click="applyFilters"
        >
          Apply Filters
        </v-btn>
      </v-col>

      <v-col cols="2">
        <v-btn
          block
          color="error"
          class="white--text mt-2"
          @click="resetFilters"
        >
          Clear All
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      searchText: '',
      selectedCountry: '',
      selectedRegime: '',
      selectedPurpose: '',
      selectedConstellation: [],
      selectedObjectTypes: ['ROCKET BODY', 'DEBRIS', 'UNKNOWN', 'PAYLOAD'],
      satellitePurposes: [
      "All",
      "Communications",
      "Earth Observation",
      "Navigation",
      "Meteorology",
      "Scientific Research",
      "Technology Demonstration",
      "Reconnaissance",
      "Surveillance",
      "Signals Intelligence (SIGINT)",
      "Infrared Imaging",
      "Radar Imaging",
      "Astronomy",
      "Space Science",
      "Geodesy",
      "Calibration",
      "Early Warning",
      "Amateur Radio",
      "Broadcasting",
      "Environmental Monitoring",
      "Military Test",
      "CubeSat / Experimental",
      "Education",
      "Space Exploration",
      "Interplanetary Mission",
      "Unknown"
    ],
    };
  },
  computed: {
    ...mapGetters(['allCountries', 'allRegimes', 'assetTypeCounts', 'allObjectTypes']),
    assetTypes() {
      return [
        { label: 'All Objects', value: ['ROCKET BODY', 'DEBRIS', 'UNKNOWN', 'PAYLOAD'], icon: 'mdi-select', count: this.assetTypeCounts.ALL },
        { label: 'Payloads', value: ['PAYLOAD'], icon: 'mdi-satellite-variant', count: this.assetTypeCounts.PAYLOAD },
        { label: 'Debris', value: ['DEBRIS'], icon: 'mdi-close-octagon', count: this.assetTypeCounts.DEBRIS },
        { label: 'Rocket Bodies', value: ['ROCKET BODY'], icon: 'mdi-rocket', count: this.assetTypeCounts['ROCKET BODY'] },
        { label: 'Unknown', value: ['UNKNOWN'], icon: 'mdi-help-circle', count: this.assetTypeCounts.UNKNOWN }
      ];
    }
  },
   mounted() {
    this.$store.dispatch('fetchSatellitesData');
  },
  methods: {
    toggleType(typeList) {
      this.selectedObjectTypes = typeList;
      this.emitFilters();
    },
    applyFilters() {
      this.emitFilters();
    },
    isSelectedType(typeList) {
      return (
        this.selectedObjectTypes.length === typeList.length &&
        this.selectedObjectTypes.every(t => typeList.includes(t))
      );
    },
    emitFilters() {
      this.$store.dispatch('updateFilters', {
        search: this.searchText,
        country: this.selectedCountry,
        constellation: this.selectedConstellation,
        regime: this.selectedRegime,
        purpose: this.selectedPurpose,
        objectTypes: this.selectedObjectTypes
      });
    },
    resetFilters() {
      this.searchText = '';
      this.selectedCountry = '';
      this.selectedConstellation = [];
      this.selectedRegime = '';
      this.selectedPurpose = '';
      this.selectedObjectTypes = ['ROCKET BODY', 'DEBRIS', 'UNKNOWN', 'PAYLOAD'];
      this.emitFilters();
    }
  }
};
</script>

<style scoped>
h2 {
  color: white;
}

.v-btn {
  transition: 0.2s;
}
.v-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>