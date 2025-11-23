<template>
  <v-sheet 
    class="d-flex justify-space-between align-center pa-4"
    elevation="4"
    rounded="xl"
    :style="{ 
        'max-width': '1200px', 
        'width': '95%', 
        'margin-top': '10px' 
    }"
  >
    <div class="d-flex align-center">
      <div class="text-h5 font-weight-bold" :style="{ color: '#1a4d2e' }">
        <!-- <span class="mr-2 text-h4">🐷</span> -->
        <span class="mr-2 text-h4"><v-icon color="pink">mdi-pig</v-icon></span>
        Smart Pig Logistics
      </div>
      <div class="text-caption text-medium-emphasis ml-3">
        Optimización Inteligente de Transporte
      </div>
    </div>

    <div class="d-flex align-center">
      <v-btn icon color="grey-darken-2" variant="text" size="large">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </div>
  </v-sheet>
</template>

<script setup>
import { useSimulationStore } from '~/stores/simulationStore'
const store = useSimulationStore()
</script>


<style scoped>
.v-sheet {
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
}
</style>