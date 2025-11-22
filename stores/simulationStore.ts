import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSimulationLogic } from '@/composables/UseSimulationLogic';
import type { Farm, LogEntry, Route } from '@/types'; 

interface InitApiData {
  slaughterhouse: { id: string; lat: number; lng: number; capacity: number };
  farms: { id: string; lat: number; lng: number; pigs: number; avg_weight: number }[];
  prices: { base: number; diesel_s: number };
}

const MAX_DAYS = 10;
const GROWTH_RATE = 0.9;
const PENALTY_HIGH = 0.20;
const PENALTY_LOW = 0.15;
const TRUCK_LARGE_PRICE = 1.25;
const TRUCK_FIXED_COST = 2000;

export const useSimulationStore = defineStore('simulation', () => {
  const { updateFarmWeights, nextDayLogic, getDistance } = useSimulationLogic();

  // Estado
  const day = ref<number>(0);
  const isRunning = ref<boolean>(false);
  const logs = ref<LogEntry[]>([]);
  const farms = ref<Farm[]>([]);
  const routes = ref<Route[]>([]);
  const isLoading = ref<boolean>(false); 

  // Matadero + precios iniciales
  const slaughterhouse = ref<InitApiData['slaughterhouse'] & { name: string }>({
    id: 'S0',
    lat: 0,
    lng: 0,
    capacity: 0,
    name: 'Cargando...',
  });

  const prices = ref<InitApiData['prices']>({
    base: 0,
    diesel_s: 0,
  });

  const fullConfig = computed(() => ({
    maxDays: MAX_DAYS,
    growthRate: GROWTH_RATE,
    penaltyHigh: PENALTY_HIGH,
    penaltyLow: PENALTY_LOW,
    truckLargePrice: TRUCK_LARGE_PRICE,
    truckFixedCost: TRUCK_FIXED_COST,
    slaughterhouse: slaughterhouse.value,
    prices: prices.value,
  }));

  async function initSimulationFromApi() {
    isLoading.value = true;
    try {
      // 1) Pedimos datos al backend
      const data = await $fetch<InitApiData>('/api/v1/init');

      // 2) Mapear granjas
      farms.value = data.farms.map((f) => ({
        id: f.id,
        lat: f.lat,
        lng: f.lng,
        pigs: f.pigs,
        avgWeight: f.avg_weight,
        visitedThisWeek: false,
      })) as Farm[];

      // 3) Matadero
      slaughterhouse.value = {
        id: data.slaughterhouse.id,
        lat: data.slaughterhouse.lat,
        lng: data.slaughterhouse.lng,
        capacity: data.slaughterhouse.capacity,
        name: 'Matadero principal', // o cambia si luego viene un nombre desde la API
      };

      // 4) Precios
      prices.value = {
        base: data.prices.base,
        diesel_s: data.prices.diesel_s,
      };

      // 5) Reset de simulación local
      day.value = 0;
      routes.value = [];
      logs.value = [
        { icon: 'ℹ️', text: 'Datos cargados, sistema listo.', type: 'info' },
      ];
      isRunning.value = true;
    } catch (error) {
      console.error('Error al inicializar desde la API ($fetch):', error);
      logs.value.unshift({
        icon: '❌',
        text: 'Error al cargar datos iniciales de la API.',
        type: 'warning',
      });
      isRunning.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  function nextDay() {
    if (day.value >= MAX_DAYS) {
      // podrías meter log de “límite alcanzado”
      return;
    }

    day.value++;
    const currentConfig = fullConfig.value;

    // 1) Actualizar pesos
    updateFarmWeights(farms.value, day.value, GROWTH_RATE);

    // 2) Lógica de rutas local (usa farms, config, etc.)
    const result = nextDayLogic(farms.value, day.value, currentConfig);

    // Si nextDayLogic devuelve rutas/logs/etc., aquí las podrías asignar:
    // routes.value = result.routes;
    // logs.value.unshift(...result.logs);
  }

  return {
    day,
    isRunning,
    isLoading,
    logs,
    farms,
    routes,
    slaughterhouse,
    prices,
    fullConfig,
    initSimulationFromApi,
    nextDay,
  };
});
