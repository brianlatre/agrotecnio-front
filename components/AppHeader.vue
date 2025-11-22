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
        <span class="mr-2 text-h4">🐷</span>
        Smart Pig Logistics
      </div>
      <div class="text-caption text-medium-emphasis ml-3">
        Optimización Inteligente de Transporte
      </div>
    </div>

    <div class="d-flex align-center gap-4">
      <v-chip color="blue-grey-lighten-4" class="font-weight-bold">
        Día {{ store.day }} / {{ store.maxDays }}
      </v-chip>
      
      <v-btn 
        id="btn-simulate"
        color="#1a4d2e"
        size="large"
        rounded="xl"
        class="text-white font-weight-bold"
        :disabled="!store.isRunning"
        @click="store.nextDay"
      >
        {{ store.isRunning ? 'Simular Día' : 'Fin' }}
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