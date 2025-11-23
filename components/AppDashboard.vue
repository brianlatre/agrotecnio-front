<script setup lang="ts">
import AppKpi from './AppKpi.vue';
import AppLogs from './AppLogs.vue';
import { useSimulationStore } from '~/stores/simulationStore'
const store = useSimulationStore()
</script>

<template>
    <v-sheet 
        class="dashboard-container d-flex flex-column pa-0"
        elevation="12"
        rounded="xl">
         <div class="d-flex justify-space-between align-center px-6 pt-5 pb-3">
            <v-chip 
                color="blue-grey-lighten-4" 
                class="font-weight-bold text-grey-darken-2" 
                size="large"
            >
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
                style="box-shadow: 0 4px 15px rgba(26, 77, 46, 0.3);"
            >
                {{ store.isRunning ? 'Simular Día' : 'Fin' }}
            </v-btn>
        </div>
    </v-sheet>

    <v-sheet 
        class="dashboard-container d-flex flex-column pa-0"
        elevation="12"
        rounded="xl"
    >
        <!-- Sección de KPIs -->
        <AppKpi />

        <!-- Divisor -->
        <v-divider class="mx-6" />

        <!-- Título del Log -->
        <div class="panel-section pb-2">
            <h3 class="text-uppercase text-caption font-weight-bold text-grey-darken-1 mb-1">Timeline de Operaciones</h3>
        </div>

        <AppLogs />

    </v-sheet>
</template>

<style scoped>

.dashboard-container {
    width: 380px;
    max-height: 475px;
    margin-top: 20px;
    margin-left: auto; 
    margin-right: 2.5%; 
    z-index: 1000;
    background-color: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.6);
}

.panel-section {
    padding: 24px;
}
</style>