import type { Config, Farm, Route, DailySimulationResult, LogEntry } from '@/types/index';

const CONFIG: Config = {
    maxDays: 10,
    slaughterhouse: { lat: 41.930, lng: 2.254, name: "Central Vic", capacity: 2000 },
    prices: {
        base: 1.56,
        penaltyHigh: 0.20,
        penaltyLow: 0.15,
        truckSmall: 1.15,
        truckLarge: 1.25,
        truckFixed: 2000
    },
    growthRate: 0.9
};

//Tipificación de parámetros y retorno
function generateFarms(count: number): Farm[] {
    const farms: Farm[] = [];
    
    return farms;
}

function getDistance(p1: { lat: number, lng: number }, p2: { lat: number, lng: number }): number {
    
    return 0; 
}

function updateFarmWeights(farms: Farm[], currentDay: number): void {
    const isNewWeek = (currentDay === 6);

    if (isNewWeek) {
        farms.forEach(f => f.visitedThisWeek = false);
    }
    farms.forEach(f => f.avgWeight += CONFIG.growthRate);
}

function nextDayLogic(farms: Farm[], currentDay: number): DailySimulationResult {
    const dailyLogs: LogEntry[] = [];
    let currentFarms: Farm[] = JSON.parse(JSON.stringify(farms));
    

    
    return {
        updatedFarms: currentFarms,
        dailyRevenue: 0, 
        dailyCost: 0, 
        dailyPigs: 0,
        newRoutes: [],
        newLogs: dailyLogs
    };
}

export function useSimulationLogic() {
    return {
        CONFIG,
        generateFarms,
        getDistance,
        updateFarmWeights,
        nextDayLogic
    };
}