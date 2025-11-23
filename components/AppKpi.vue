<script setup lang="ts">
import { useSimulationStore } from '@/stores/simulationStore';

const store = useSimulationStore();

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-ES', { 
        style: 'currency', 
        currency: 'EUR', 
        maximumFractionDigits: 0,
        minimumFractionDigits: 0 
    });
};

const totalCostDisplay = computed(() => {
    return formatCurrency(store.totalCost); 
});

</script>

<template>
    <div class="panel-section">
        <h3 class="text-uppercase text-caption font-weight-bold text-grey-darken-1 mb-3">Indicadores Clave</h3>
        <div class="kpi-grid">
            
            <!-- Beneficio Neto -->
            <v-card class="kpi-card" elevation="0">
                <div class="kpi-value text-h6 font-weight-bold" :style="{ color: '#1a4d2e' }">
                    {{ formatCurrency(store.netProfit) }}
                </div>
                <div class="kpi-label text-caption text-grey-darken-1">Beneficio Neto</div>
            </v-card>

            <!-- Cerdos Recogidos -->
            <v-card class="kpi-card" elevation="0">
                <div class="kpi-value text-h6 font-weight-bold" :style="{ color: '#1a4d2e' }">
                    {{ store.pigsProcessed}}
                </div>
                <div class="kpi-label text-caption text-grey-darken-1">Cerdos Recogidos</div>
            </v-card>

            <!-- Flota Activa (Diaria) -->
            <v-card class="kpi-card" elevation="0">
                <div class="kpi-value text-h6 font-weight-bold" :style="{ color: '#1a4d2e' }">
                    {{ store.dailyTrucksUsed}}
                </div>
                <div class="kpi-label text-caption text-grey-darken-1">Flota Activa (Día)</div>
            </v-card>

            <!-- Costes Operacionales (Total Acumulado) -->
            <v-card class="kpi-card" elevation="0">
                <div class="kpi-value text-subtitle-1 font-weight-bold text-grey-darken-1">
                    {{ totalCostDisplay }}
                </div>
                
                <div class="kpi-label text-caption text-grey-darken-1">Coste Total Op.</div> 
            </v-card>
        </div>
    </div>
</template>

<style scoped>

.kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
.kpi-card {
    /* Fondo ligeramente diferente al del dashboard */
    background: rgba(255, 255, 255, 0.6) !important;
    border-radius: 16px;
    padding: 15px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.8);
}
.kpi-value { line-height: 1.2; }
.kpi-label { margin-top: 5px; }
</style>