import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useSimulationLogic } from '@/composables/UseSimulationLogic';
import type { Farm, LogEntry, Route } from '@/types'; 


interface InitApiData {
  slaughterhouse: { id: string; lat: number; lng: number; capacity: number };
  farms: { id: string; lat: number; lng: number; pigs: number; avg_weight: number }[];
  prices: { base: number; diesel_s: number };
}

export const useSimulationStore = defineStore('simulation', () => {
  const { CONFIG, updateFarmWeights, nextDayLogic, getDistance } = useSimulationLogic();

  // Estado
  const day = ref<number>(0);
  const isRunning = ref<boolean>(false);
  const logs = ref<LogEntry[]>([]);
  const farms = ref<Farm[]>([]);
  const routes = ref<Route[]>([]);
  const isLoading = ref<boolean>(false);
  const totalCost = ref<number>(0);

 

  async function initSimulationFromApi() {
    isLoading.value = true;
    try {
      
      const data = await $fetch<InitApiData>('/api/v1/init');
      
      // 2. Mapear y tipificar los datos recibidos de la API al estado de Pinia
      farms.value = data.farms.map(f => ({
        id: f.id,
        lat: f.lat,
        lng: f.lng,
        pigs: f.pigs,
        avgWeight: f.avg_weight,
        visitedThisWeek: false
      })) as Farm[];

      
      day.value = 0;
      logs.value = [{ icon: 'ℹ️', text: 'Datos cargados, sistema listo.', type: 'info' }];
      isRunning.value = true;
      
    } catch (error) {
      console.error("Error al inicializar desde la API ($fetch):", error);
      logs.value.unshift({ icon: '❌', text: 'Error al cargar datos iniciales de la API.', type: 'warning' });
      isRunning.value = false;
    } finally {
      isLoading.value = false;
    }
  }



  return { 
    farms,
    initSimulationFromApi,
    isLoading,
    logs,
    totalCost
  };
});