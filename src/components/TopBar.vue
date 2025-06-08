<template>
  <div>
    <h2 class="text-white my-2">
      Create My Asset List
    </h2>

    <!-- Object Type Filter -->
    <v-row
      dense
      class="px-2 py-1"
      style="background: black; border-radius: 2px"
    >
      <v-btn
        v-for="item in assetTypes"
        :key="item.label"
        text
        class="white--text"
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

    <!-- Search & Filters -->
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
          @click:append="emitFilters"
          @click:clear="resetFilters"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="selectedCountry"
          :items="allCountries"
          label="Constellation"
          solo
          dense
          clearable
          @change="emitFilters"
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
          @change="emitFilters"
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
          @change="emitFilters"
        />
      </v-col>

      <v-col cols="2">
        <v-select
          v-model="selectedPurpose"
          :items="purposes"
          label="Purpose"
          solo
          dense
          clearable
          @change="emitFilters"
        />
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
      selectedConstellation: '',
      selectedObjectTypes: ['ROCKET BODY', 'DEBRIS', 'UNKNOWN', 'PAYLOAD'],
      purposes: [],
      assetTypes: [
        { label: 'All Objects', value: ['ROCKET BODY', 'DEBRIS', 'UNKNOWN', 'PAYLOAD'], icon: 'mdi-select', count: 27949 },
        { label: 'Payloads', value: ['PAYLOAD'], icon: 'mdi-satellite-variant', count: 14035 },
        { label: 'Debris', value: ['DEBRIS'], icon: 'mdi-close-octagon', count: 10588 },
        { label: 'Rocket Bodies', value: ['ROCKET BODY'], icon: 'mdi-rocket', count: 2167 },
        { label: 'Unknown', value: ['UNKNOWN'], icon: 'mdi-help-circle', count: 23456 }
      ]
    };
  },
  computed: {
        // allCountries: (state) => [...new Set(state.satellites.map(item => item.countryCode))],
        // allRegimes: (state) => [...new Set(state.satellites.map(item => item.orbitCode.replace(/[{}]/g, '')))],
    ...mapGetters(['allCountries', 'allRegimes']),
  },
  methods: {
    toggleType(typeList) {
      this.selectedObjectTypes = typeList;
      this.emitFilters();
    },
    isSelectedType(typeList) {
      // Highlight the selected asset type buttons
      if (this.selectedObjectTypes.length !== typeList.length) return false;
      return this.selectedObjectTypes.every(t => typeList.includes(t));
    },
    emitFilters() {
      this.$store.dispatch('updateFilters', {
        search: this.searchText,
        country: this.selectedCountry,
        regime: this.selectedRegime,
        purpose: this.selectedPurpose,
        objectTypes: this.selectedObjectTypes
      });
    },
    resetFilters() {
      // Reset all filters to default values
      this.searchText = '';
      this.selectedConstellation = '';
      this.selectedCountry = '';
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
</style>
