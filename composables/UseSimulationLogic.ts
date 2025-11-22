import type { Farm, Route, DailySimulationResult, LogEntry } from '@/types/index';

//Tipificación de parámetros y retorno
function generateFarms(count: number): Farm[] {
    const farms: Farm[] = [];
    
    return farms;
}

function getDistance(p1: { lat: number, lng: number }, p2: { lat: number, lng: number }): number {
    
    return 0; 
}

function updateFarmWeights(farms: Farm[], currentDay: number, growthRate: number): void {
    const isNewWeek = (currentDay === 6);

    if (isNewWeek) {
        farms.forEach(f => f.visitedThisWeek = false);
    }
    farms.forEach(f => f.avgWeight += growthRate);
}

function nextDayLogic(farms: Farm[], currentDay: number, config: any): DailySimulationResult {
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
        generateFarms,
        getDistance,
        updateFarmWeights,
        nextDayLogic
    };
}