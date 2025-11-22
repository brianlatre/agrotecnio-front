<script setup lang="ts">
import AppLogs from './AppLogs.vue';
</script>

<template>
    <v-sheet 
        class="dashboard-container d-flex flex-column pa-0"
        elevation="12"
        rounded="xl"
    >
        <!-- Sección de KPIs -->
        

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
    max-height: calc(100vh - 110px); 
    margin-top: 20px;
    margin-left: auto;
    margin-right: 2.5%;

    background-color: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.6);
}

.panel-section {
    padding: 24px;
}
</style>