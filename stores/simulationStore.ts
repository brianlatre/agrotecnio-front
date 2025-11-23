import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Farm, LogEntry, Route, RouteStop } from '@/types/index';

// --- Interfaces del JSON de API ---
interface FarmMetadata { lat: number; lon: number; }

interface TruckOperation {
    truck_id: number;
    route: string[]; 
    trip_duration_hours: number;
    distance_km: number;
    pigs_delivered: number;
    trip_cost: number; 
    revenue: number;
    penalty: number;
    profit: number;
    load_pct: number;
}

interface DailyLog {
    day: number;
    trucks_ops: TruckOperation[];
    total_processed: number;
    daily_profit: number;
}

interface FullApiData {
    slaughterhouse: { id: string; lat: number; lng: number; capacity: number };
    farms: { id: string; lat: number; lng: number; pigs: number; avg_weight: number }[];
    prices: { base: number; diesel_s: number };
    simulation: {
        daily_logs: DailyLog[];
        metadata: {
            slaughterhouse: { lat: number; lon: number };
            farms: Record<string, FarmMetadata>;
        };
    };
}

export const useSimulationStore = defineStore('simulation', () => {
    const day = ref(0);
    const isRunning = ref(false);
    const isLoading = ref(false);
    
    const slaughterhouse = ref({ id: 'S1', name: 'Matadero Central', lat: 0, lng: 0, capacity: 0 });
    const farms = ref<Farm[]>([]);
    const routes = ref<Route[]>([]);
    const logs = ref<LogEntry[]>([]);
    
    const totalRevenue = ref(0);
    const totalCost = ref(0);
    const totalPenalties = ref(0);
    const pigsProcessed = ref(0);
    const dailyTrucksUsed = ref(0);

    const farmLocations = ref<Record<string, FarmMetadata>>({});
    const dailyLogsData = ref<DailyLog[]>([]);

    // --- Acciones ---

    async function initSimulationFromApi() {
        isLoading.value = true;
        try {
            const data = await $fetch<FullApiData>('/api/v1/init');

            slaughterhouse.value = { 
                ...data.slaughterhouse, 
                name: "Central Vic" 
            };
            
            // Mapeo inicial
            farms.value = data.farms.map(f => ({
                id: f.id, // "F1"
                lat: f.lat,
                lng: f.lng,
                pigs: f.pigs,
                avgWeight: f.avg_weight,
                visitedThisWeek: false
            }));

            farmLocations.value = data.simulation.metadata.farms;
            dailyLogsData.value = data.simulation.daily_logs;

            // Resetear valores
            day.value = 0;
            totalCost.value = 0;
            totalRevenue.value = 0;
            totalPenalties.value = 0;
            pigsProcessed.value = 0;
            routes.value = [];
            logs.value = [{ icon: 'ℹ️', text: 'Datos cargados correctamente.', type: 'info' }];
            isRunning.value = true;

        } catch (error) {
            console.error("Error API:", error);
            addLog("Error al conectar con la API.", "warning");
        } finally {
            isLoading.value = false;
        }
    }

    function nextDay() {
        if (day.value >= dailyLogsData.value.length) {
            isRunning.value = false;
            addLog('🏁 Simulación finalizada.', 'info');
            return;
        }

        const currentLog = dailyLogsData.value[day.value];
        day.value = currentLog.day;

        // 1. Actualizar Totales Financieros
        const dailyCost = currentLog.trucks_ops.reduce((acc, op) => acc + op.trip_cost, 0);
        const dailyRevenue = currentLog.trucks_ops.reduce((acc, op) => acc + op.revenue, 0);
        const dailyPenalty = currentLog.trucks_ops.reduce((acc, op) => acc + op.penalty, 0);

        totalCost.value += dailyCost;
        totalRevenue.value += dailyRevenue;
        totalPenalties.value += dailyPenalty;
        
        // 2. Generación de Rutas y Cálculo de Carga por Granja
        const todaysRoutes: Route[] = currentLog.trucks_ops.map(op => {
            
            // Calculamos cerdos por parada (estimación equitativa si hay >1 parada)
            const pigsPerStop = Math.round(op.pigs_delivered / op.route.length);

            const stops: RouteStop[] = op.route.map(farmName => {
                const coords = farmLocations.value[farmName];
                
                // Matching ID: "Farm_1_Manlleu" -> "1" -> "F1"
                const farmNumber = farmName.split('_')[1]; 
                const farmId = `F${farmNumber}`; 
                const farmState = farms.value.find(f => f.id === farmId);
                
                const lat = coords ? coords.lat : slaughterhouse.value.lat;
                const lon = coords ? coords.lon : slaughterhouse.value.lng;

                return {
                    id: farmName,
                    lat: lat,
                    lng: lon,
                    // Usamos el estado actual para que el mapa refleje el momento
                    pigs: farmState?.pigs || 0,
                    avgWeight: farmState?.avgWeight || 110,
                    visitedThisWeek: true,
                    pigsLoaded: pigsPerStop // Guardamos cuánto se lleva de esta parada
                };
            });

            return {
                farms: stops,
                totalKgs: 0,
                pigs: op.pigs_delivered
            };
        });

        routes.value = todaysRoutes;
        
        // 3. 💡 ACTUALIZACIÓN DEL ESTADO DE LAS GRANJAS (DINÁMICA)
        farms.value.forEach(farm => {
            // A. Simular crecimiento diario de peso (0.9 kg/día)
            farm.avgWeight += 0.9;

            // B. Restar cerdos si la granja fue visitada hoy
            todaysRoutes.forEach(route => {
                route.farms.forEach(stop => {
                    // Matching inverso: stop.id "Farm_1_..." vs farm.id "F1"
                    const stopNum = stop.id.split('_')[1];
                    const farmNum = farm.id.replace('F', '');
                    
                    if (stopNum === farmNum) {
                        farm.visitedThisWeek = true;
                        farm.pigs -= stop.pigsLoaded;
                        if (farm.pigs < 0) farm.pigs = 0; // Evitar negativos
                    }
                });
            });

            // C. Reset semanal (opcional, lógica de negocio)
            if (day.value % 7 === 0) farm.visitedThisWeek = false;
        });

        // Actualizar contadores globales
        dailyTrucksUsed.value = currentLog.trucks_ops.length;
        pigsProcessed.value += currentLog.total_processed;

        const netDaily = dailyRevenue - dailyCost - dailyPenalty;
        addLog(`🚛 Día ${day.value}: ${currentLog.trucks_ops.length} rutas. Neto: ${Math.round(netDaily).toLocaleString('es-ES')}€`, 'success');
    }

    function addLog(text: string, type: LogEntry['type'] = 'normal') {
        logs.value.unshift({ icon: '🔹', text, type });
    }
    
    const netProfit = computed(() => totalRevenue.value - totalCost.value - totalPenalties.value);
    const maxDays = computed(() => dailyLogsData.value.length);

    return {
        day, isRunning, isLoading, logs, farms, routes, 
        slaughterhouse, totalRevenue, totalCost, totalPenalties, pigsProcessed, netProfit, maxDays, dailyTrucksUsed,
        initSimulationFromApi, nextDay
    };
});