<script setup lang="ts">
import { onMounted } from 'vue';
import { useSimulationStore } from '@/stores/simulationStore';

const store = useSimulationStore();

onMounted(() => {
  store.initSimulationFromApi(); 
});
</script>


<template>
    <v-app>
        <div v-if="store.isLoading" class="loading-overlay">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <div class="mt-3">Cargando datos de simulación...</div>
        </div>

        <template v-else>
            <ClientOnly>
                <AppMap />
            </ClientOnly>
            <v-container fluid class="fill-height pa-5 d-flex flex-column" style="pointer-events: none; z-index: 10;">
                <AppHeader class="mx-auto" style="pointer-events: auto; max-width: 1200px; width: 95%;" />
            </v-container>
        </template>
        
    </v-app>
</template>