import Vue from 'vue';
import Vuex from 'vuex';
import { fetchSatellites } from '../api/satellites';

Vue.use(Vuex);

function resolvePurpose(name = "", country = "") {
 name = typeof name === "string" ? name.toUpperCase() : "";
  country = typeof country === "string" ? country.toUpperCase() : "";

  const checks = [
    { keys: ["COMM", "TEL"], result: "Communications" },
    { keys: ["OBS", "LANDSAT"], result: "Earth Observation" },
    { keys: ["GPS", "NAV", "GLONASS"], result: "Navigation" },
    { keys: ["METEOR", "WEATHER", "FENGYUN"], result: "Meteorology" },
    { keys: ["TEST", "AGENA", "DEMO"], result: "Technology Demonstration" },
    { keys: ["RECON", "DSP", "NROL"], result: "Reconnaissance" },
    { keys: ["SURV", "RADAR", "LOOKOUT"], result: "Surveillance" },
    { keys: ["SIGINT", "ELINT"], result: "Signals Intelligence (SIGINT)" },
    { keys: ["INFRARED", "IMAGER"], result: "Infrared Imaging" },
    { keys: ["SAR"], result: "Radar Imaging" },
    { keys: ["ASTRO", "HUBBLE"], result: "Astronomy" },
    { keys: ["SCIENCE", "SOLAR"], result: "Space Science" },
    { keys: ["GEO", "GEOID"], result: "Geodesy" },
    { keys: ["CALIB"], result: "Calibration" },
    { keys: ["WARN"], result: "Early Warning" },
    { keys: ["HAM", "AMSAT"], result: "Amateur Radio" },
    { keys: ["TV", "BROADCAST"], result: "Broadcasting" },
    { keys: ["ENV", "POLLUTION"], result: "Environmental Monitoring" },
    { keys: ["MIL", "NROL"], result: "Military Test" },
    { keys: ["CUBESAT", "NANO"], result: "CubeSat / Experimental" },
    { keys: ["EDU", "STUDENT"], result: "Education" },
    { keys: ["MARS", "VOYAGER"], result: "Interplanetary Mission" },
    { keys: ["EXPLORER"], result: "Space Exploration" },
  ];

  for (const { keys, result } of checks) {
    if (keys.some(key => name.includes(key))) {
      return result;
    }
  }

  // Country-based check
  if (["RU", "CN"].includes(country)) return "Military Test";

  return "Unknown";
}


export default new Vuex.Store({
  state: {
    selectedAssets: [],
    allSatelliteItems: [],
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
    SET_INITIAL_ITEMS(state, items) {
      console.log('allsatelliteItems', items);
      state.allSatelliteItems = items;
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
      if (state.filters.purpose && state.filters.purpose !== 'All') {
  items = items
    .map(item => {
      return {
        ...item,
        _purpose: resolvePurpose(item)
      };
    })
    .filter(i => i._purpose === state.filters.purpose);
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
      state.allSatelliteItems.forEach(item => {
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
        const [initialData, filteredData] = await Promise.all([
          fetchSatellites(undefined, attributes),
          fetchSatellites(state.filters.objectTypes, attributes)
        ]);

        commit("SET_INITIAL_ITEMS", Array.isArray(initialData.data.data) ? initialData.data.data : []);
        commit("SET_ITEMS", Array.isArray(filteredData.data.data) ? filteredData.data.data : []);

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
