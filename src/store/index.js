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
      regime: "",
      purpose: "",
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
      if (state.filters.regime) {
        items = items.filter(i => i.orbitCode === state.filters.regime);
      }
      if (state.filters.search) {
        items = items.filter(i => i.name?.toLowerCase().includes(state.filters.search.toLowerCase()));
      }
      return items;
    },
//     filteredSatelliteItems: (state) => {
//   const { search, country, regime, purpose, objectTypes } = state.filters || {};

//   return state.satellites.filter((item) => {
//     const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
//     const matchCountry = !country || item.countryCode === country;
//     const matchRegime = !regime || item.orbitCode === regime;
//     const matchPurpose = !purpose || item.purpose === purpose;
//     const matchObjectType = !objectTypes || objectTypes.includes(item.objectType);
//     return matchSearch && matchCountry && matchRegime && matchPurpose && matchObjectType;
//   });
// },

// isSelected: (state) => (id) => {
//   return state.selectedAssets.some((asset) => asset.noradCatId === id);
// },

// allSatellites: (state) => state.satellites,

    allCountries(state) {
      console.log('state.satelliteItems', state.satelliteItems)
      return [...new Set(state.satelliteItems.map(item => item.countryCode))];
    },
    allRegimes(state) {
      return [...new Set(state.satelliteItems.map(item => item.orbitCode.replace(/[{}]/g, '')))];
    }
  },
  actions: {
    async fetchSatellitesData({ commit, state }) {
      const attributes = ["noradCatId", "intlDes", "name", "orbitCode", "countryCode"];
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
