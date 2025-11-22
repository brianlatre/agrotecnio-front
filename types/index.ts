export interface Config {
    maxDays: number;
    slaughterhouse: { lat: number; lng: number; name: string; capacity: number };
    prices: {
        base: number;
        penaltyHigh: number;
        penaltyLow: number;
        truckSmall: number;
        truckLarge: number;
        truckFixed: number;
    };
    growthRate: number;
}


export interface Farm {
    id: string;
    lat: number;
    lng: number;
    pigs: number;
    avgWeight: number;
    visitedThisWeek: boolean;
}


export interface LogEntry {
    icon: string;
    text: string;
    type: 'normal' | 'warning' | 'success' | 'info';
}


export interface RouteStop extends Farm {
    pigsLoaded: number;
}


export interface Route {
    farms: RouteStop[];
    totalKgs: number;
    pigs: number;
}


export interface DailySimulationResult {
    updatedFarms: Farm[];
    dailyRevenue: number;
    dailyCost: number;
    dailyPigs: number;
    newRoutes: Route[];
    newLogs: LogEntry[];
}