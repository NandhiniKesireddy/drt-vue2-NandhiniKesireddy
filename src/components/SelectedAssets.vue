<template>
  <div class="pt-10">
    <div 
      class="text-h6 mb-2 font-weight-bold" 
      style="color: white;"
    >
      Selected Assets
    </div>

    <v-card
      flat
      height="550px"
      style="background: linear-gradient(to bottom, #0a3865, #000); color: white; border: 1px solid #4fc3f7;"
    >
      <v-row 
        justify="space-between" 
        align="center"
        class="pa-4"
      >
        <span style="color: #4fc3f7;">{{ selectedAssets.length }} objects selected</span>
        <div class="d-flex align-center">
          <span 
            class="mr-2" 
            style="cursor: pointer;" 
            @click="clearAssets"
          >Clear all</span>
          <v-icon 
            small 
            color="grey lighten-1" 
            style="cursor: pointer;"
            @click="clearAssets"
          >
            mdi-close
          </v-icon>
        </div>
      </v-row>

      <v-divider 
        class="my-2" 
        color="grey darken-1" 
      />

      <div
        class="pa-4"
        style="max-height: 550px; overflow-y: auto;"
      >
        <v-row
          v-for="item in selectedAssets"
          :key="item.noradCatId"
          align="center"
          style="border-bottom: 1px solid #1e2e3e;"
        >
          <v-col
            cols="3"
            class="text-left"
          >
            <span class="white--text">{{ item.noradCatId }}</span>
          </v-col>
          <v-col
            cols="7"
            class="text-center"
          >
            <span class="white--text">{{ item.name }}</span>
          </v-col>
          <v-col
            cols="2"
            class="text-right"
          >
            <v-icon
              small
              color="red lighten-2"
              style="cursor: pointer;"
              @click="removeAsset(item.noradCatId)"
            >
              mdi-close
            </v-icon>
          </v-col>
        </v-row>

        <div
          v-if="selectedAssets.length === 0"
          class="text-center grey--text mt-4"
        >
          No assets selected.
        </div>
      </div>
    </v-card>

    <v-btn
      class="mt-4"
      block
      large
      color="#00bfff"
      style="color: black; font-weight: bold;"
      @click="proceed"
    >
      PROCEED
    </v-btn>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  computed: {
    ...mapState({
      selectedAssets: state => state.selectedAssets
    })
  },
  methods: {
    ...mapMutations({
      removeAsset: 'REMOVE_ASSET',
      clearAssets: 'CLEAR_ASSETS'
    }),
    proceed() {
      localStorage.setItem('selectedAssets', JSON.stringify(this.selectedAssets));

      this.$router.push({ name: 'SelectedList' }).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          throw err;
        }
      });
    }
  },
   
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #4fc3f7;
  border-radius: 4px;
}
</style>