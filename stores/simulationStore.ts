import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Farm, LogEntry, Route, RouteStop } from '@/types/index';

// --- 1. Interfaces que coinciden con TU JSON ---
interface FarmMetadata { lat: number; lon: number; }

interface TruckOperation {
    truck_id: number;
    route: string[]; // Ej: ["Farm_29_Gurb", "Farm_41_Calldetenes"]
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

// Estructura completa de la respuesta de tu API
interface FullApiData {
    slaughterhouse: { id: string; lat: number; lng: number; capacity: number };
    farms: { id: string; lat: number; lng: number; pigs: number; avg_weight: number }[];
    prices: { base: number; diesel_s: number };
    simulation: {
        daily_logs: DailyLog[];
        metadata: {
            slaughterhouse: { lat: number; lon: number };
            farms: Record<string, FarmMetadata>; // Diccionario para buscar coords rápido
        };
    };
}

export const useSimulationStore = defineStore('simulation', () => {
    // --- Estado ---
    const day = ref(0);
    const isRunning = ref(false);
    const isLoading = ref(false);
    
    // Datos Visuales para la UI
    const slaughterhouse = ref({ id: 'S1', name: 'Matadero Central', lat: 0, lng: 0, capacity: 0 });
    const farms = ref<Farm[]>([]);   // Puntos en el mapa
    const routes = ref<Route[]>([]); // Líneas de camiones (se actualiza cada día)
    const logs = ref<LogEntry[]>([]);
    
    // KPIs
    const totalRevenue = ref(0);
    const totalCost = ref(0); // Se puede calcular si el JSON trae costes diarios
    const pigsProcessed = ref(0);
    const dailyTrucksUsed = ref(0);

    // 📦 ALMACÉN DE DATOS DE LA API (La "película" completa)
    const farmLocations = ref<Record<string, FarmMetadata>>({});
    const dailyLogsData = ref<DailyLog[]>([]);

    // --- Acciones ---

    // 1. Carga Inicial desde la API
    async function initSimulationFromApi() {
        isLoading.value = true;
        try {
            // 🚀 LLAMADA REAL A LA API
            // Asegúrate de que este endpoint devuelve el JSON completo que mostraste
            const data = await $fetch<FullApiData>('/api/v1/init');

            // A. Configurar Matadero y Granjas Iniciales (Puntos estáticos)
            slaughterhouse.value = { 
                ...data.slaughterhouse, 
                name: "Central Vic" 
            };
            
            farms.value = data.farms.map(f => ({
                id: f.id,
                lat: f.lat,
                lng: f.lng,
                pigs: f.pigs,
                avgWeight: f.avg_weight,
                visitedThisWeek: false
            }));

            // B. Guardar la Simulación y Metadatos para reproducirla luego
            farmLocations.value = data.simulation.metadata.farms;
            dailyLogsData.value = data.simulation.daily_logs;

            // Reset UI
            day.value = 0;
            routes.value = [];
            logs.value = [{ icon: 'ℹ️', text: 'Datos de simulación cargados correctamente.', type: 'info' }];
            isRunning.value = true;

        } catch (error) {
            console.error("Error API:", error);
            addLog("Error al conectar con la API de simulación.", "warning");
        } finally {
            isLoading.value = false;
        }
    }

    // 2. Avanzar Día (Reproducir lo que dijo la API)
    function nextDay() {
        // Verificamos si quedan días en el array de logs
        if (day.value >= dailyLogsData.value.length) {
            isRunning.value = false;
            addLog('🏁 Simulación finalizada.', 'info');
            return;
        }

        // Obtenemos los datos YA CALCULADOS por el backend para este día
        const currentLog = dailyLogsData.value[day.value];
        
        // Actualizamos el contador de día (usamos el del log para sincronizar)
        day.value = currentLog.day;

        // 🚚 GENERAR RUTAS PARA EL MAPA
        // Transformamos los strings ["Farm_X", "Farm_Y"] en coordenadas usando los metadatos
        const todaysRoutes: Route[] = currentLog.trucks_ops.map(op => {
            
            // Mapeamos cada parada de la ruta
            const stops: RouteStop[] = op.route.map(farmName => {
                // Buscamos las coordenadas en el diccionario de metadatos que guardamos
                const coords = farmLocations.value[farmName];
                
                // Si no hay coords (raro), usamos el matadero como fallback
                const lat = coords ? coords.lat : slaughterhouse.value.lat;
                const lon = coords ? coords.lon : slaughterhouse.value.lng;

                return {
                    id: farmName, 
                    lat: lat,
                    lng: lon,
                    pigs: 0,
                    avgWeight: 0,
                    visitedThisWeek: true,
                    pigsLoaded: 0 
                };
            });

            return {
                farms: stops, // AppMap usa esto para pintar la polilínea
                totalKgs: 0,
                pigs: op.pigs_delivered
            };
        });

        // Al actualizar esto, AppMap repintará las líneas automáticamente
        routes.value = todaysRoutes;
        
        // Actualizar KPIs con datos reales del backend
        dailyTrucksUsed.value = currentLog.trucks_ops.length;
        totalRevenue.value += currentLog.daily_profit;
        pigsProcessed.value += currentLog.total_processed;

        // Logs visuales
        addLog(`🚛 Día ${day.value}: ${currentLog.trucks_ops.length} rutas. Beneficio: ${Math.round(currentLog.daily_profit).toLocaleString('es-ES')}€`, 'success');
        
        // (Opcional) Logs detallados por camión
        // currentLog.trucks_ops.forEach(op => {
        //     addLog(`- Camión ${op.truck_id}: ${op.pigs_delivered} cerdos. Ruta: ${op.route.length} paradas.`, 'normal');
        // });
    }

    function addLog(text: string, type: LogEntry['type'] = 'normal') {
        logs.value.unshift({ icon: '🔹', text, type });
    }
    
    // Getters
    const netProfit = computed(() => totalRevenue.value - totalCost.value);
    const maxDays = computed(() => dailyLogsData.value.length);

    return {
        day, isRunning, isLoading, logs, farms, routes, 
        slaughterhouse, totalRevenue, totalCost, pigsProcessed, netProfit, maxDays, dailyTrucksUsed,
        initSimulationFromApi, nextDay
    };
});