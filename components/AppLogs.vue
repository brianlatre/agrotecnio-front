<script setup lang="ts">
import { useSimulationStore } from '@/stores/simulationStore';
import { computed } from 'vue';

const store = useSimulationStore();

const activityLogs = computed(() => store.logs);

const getColor = (type: string) => {
    switch (type) {
        case 'warning': return '#e85d04';
        case 'success': return '#1a4d2e';
        default: return '#1e293b';
    }
};

const getBackgroundColor = (type: string) => {
    return type === 'warning' ? 'rgba(232, 93, 4, 0.08)' : 'transparent';
};

const getTextColorClass = (type: string) => {
    return type === 'warning' ? 'text-amber-darken-2' : 'text-grey-darken-4';
}
</script>

<template>
    <div id="activity-log" class="pa-6 pt-0">
        <div 
            v-for="(log, index) in activityLogs"
            :key="index"
            class="log-item py-3 d-flex align-start"
            :class="{ 'warning': log.type === 'warning' }"
            :style="{ backgroundColor: getBackgroundColor(log.type) }"
        >
            <span class="log-icon mr-2">{{ log.icon }}</span>
            <span 
                class="log-text text-body-2"
                :class="getTextColorClass(log.type)"
                :style="{ fontWeight: log.type === 'warning' ? 600 : 500 }"
            >
                {{ log.text }}
            </span>
        </div>
    </div>
</template>

<style scoped>
#activity-log {
    flex-grow: 1;
    overflow-y: auto;
    font-family: 'Plus Jakarta Sans', monospace;
    max-height: 500px;
}

#activity-log::-webkit-scrollbar { width: 6px; }
#activity-log::-webkit-scrollbar-track { background: transparent; }
#activity-log::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 3px; }

.log-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    animation: fadeIn 0.4s ease-out;
}
.log-item:last-child {
    border-bottom: none;
}
.log-item.warning {
    border-radius: 8px;
    padding: 8px;
    margin-bottom: 5px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>