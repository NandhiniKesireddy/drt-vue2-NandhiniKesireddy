import Vue from 'vue';
import Vuex from 'vuex';
import { fetchSatellites } from '../api/satellites';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    selectedAssets: [],
    satelliteItems: [],
    filters: {
      objectTypes: ["ROCKET BODY", "DEBRIS", "UNKNOWN", "PAYLOAD"],
      search: "",
      country: "",
      purpose: "",
      constellation: [],
      regime: [],
    },
  },
  mutations: {
    SET_ITEMS(state, items) {
      state.satelliteItems = items;
    },
    SET_FILTERS(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    ADD_ASSET(state, asset) {
      const exists = state.selectedAssets.some(a => a.noradCatId === asset.noradCatId);
      if (!exists && state.selectedAssets.length < 10) {
        state.selectedAssets.push(asset);
      }
    },
    REMOVE_ASSET(state, noradCatId) {
      state.selectedAssets = state.selectedAssets.filter(a => a.noradCatId !== noradCatId);
    },
    CLEAR_ASSETS(state) {
      state.selectedAssets = [];
    },
  },
  getters: {
    selectedCount(state) {
      return state.selectedAssets.length;
    },
    isSelected: (state) => (noradCatId) => {
      return state.selectedAssets.some(a => a.noradCatId === noradCatId);
    },
    filteredSatelliteItems(state) {
      let items = state.satelliteItems;
      console.log('items', items);
      if (state.filters.country) {
        items = items.filter(i => i.countryCode === state.filters.country);
      }
      if (Array.isArray(state.filters.regime) && state.filters.regime.length > 0) {
        items = items.filter(i => {
          const cleanedOrbit = i.orbitCode?.replace(/[{}]/g, ''); // Remove { and }
          return state.filters.regime.includes(cleanedOrbit);
        });
      }
      if (Array.isArray(state.filters.constellation) && state.filters.constellation.length > 0) {
        items = items.filter(i => state.filters.constellation.includes(i.objectType));
      }
      if (state.filters.search) {
        items = items.filter(i => i.name?.toLowerCase().includes(state.filters.search.toLowerCase()));
      }
      return items;
    },
    allObjectTypes(state) {
      return [...new Set(state.satelliteItems.map(item => item.objectType))];
    },
    allCountries(state) {
      console.log('state.satelliteItems', state.satelliteItems)
      return [...new Set(state.satelliteItems.map(item => item.countryCode))];
    },
    allRegimes(state) {
      return [...new Set(state.satelliteItems.map(item => item.orbitCode.replace(/[{}]/g, '')))];
    },
    assetTypeCounts: (state) => {
      const counts = {
        PAYLOAD: 0,
        'ROCKET BODY': 0,
        DEBRIS: 0,
        UNKNOWN: 0,
      };
      state.satelliteItems.forEach(item => {
        const type = item.objectType?.toUpperCase();
        if (counts[type] !== undefined) counts[type]++;
      });
      return {
        PAYLOAD: counts.PAYLOAD,
        'ROCKET BODY': counts['ROCKET BODY'],
        DEBRIS: counts.DEBRIS,
        UNKNOWN: counts.UNKNOWN,
        ALL: Object.values(counts).reduce((a, b) => a + b, 0)
      };
    }
  },
  actions: {
    async fetchSatellitesData({ commit, state }) {
      const attributes = ["noradCatId", "intlDes", "name", "launchDate", "decayDate", "objectType", "launchSiteCode", "orbitCode", "countryCode"];
      try {
        const res = await fetchSatellites(state.filters.objectTypes, attributes);
        const result = Array.isArray(res.data.data) ? res.data.data : [];
        commit("SET_ITEMS", result);
      } catch (error) {
        console.error("Error fetching satellites:", error);
      }
    },
    updateFilters({ commit, dispatch }, filters) {
      commit("SET_FILTERS", filters);
      dispatch("fetchSatellitesData");
    },
    addAsset({ commit, state }, asset) {
      if (!state.selectedAssets.some(a => a.noradCatId === asset.noradCatId) && state.selectedAssets.length < 10) {
        commit('ADD_ASSET', asset);
      }
    },
    removeAsset({ commit }, noradCatId) {
      commit('REMOVE_ASSET', noradCatId);
    },
    clearAllAssets({ commit }) {
      commit('CLEAR_ASSETS');
    },
  },
});
