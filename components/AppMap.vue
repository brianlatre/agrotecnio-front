<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LIcon, LPolyline, LTooltip } from '@vue-leaflet/vue-leaflet';
import { useSimulationStore } from '@/stores/simulationStore';
import { ref, nextTick, watch } from 'vue';
import type * as Leaflet from 'leaflet';
import type { Farm, Route } from '@/types/index';

interface LMapComponent {
  leafletObject: Leaflet.Map;
}

const store = useSimulationStore();
const mapRef = ref<LMapComponent | null>(null);

const routeColors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669'];

const baseMarkerIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const baseMarkerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

watch(
  () => store.slaughterhouse.lat,
  (newLat) => {
    if (!newLat || !mapRef.value?.leafletObject) return;

    const leafletMap = mapRef.value.leafletObject;
    const sh = store.slaughterhouse;

    nextTick(() => {
      leafletMap.invalidateSize();
      leafletMap.setView([sh.lat, sh.lng], 9);
    });
  },
  { immediate: true }
);


const getRoutePoints = (route: Route): Leaflet.LatLngTuple[] => {
    const slaughterhouseLocation = store.slaughterhouse; 
    const points: Leaflet.LatLngTuple[] = [];

    // Salida y Regreso del Matadero
    points.push([slaughterhouseLocation.lat, slaughterhouseLocation.lng]);
    route.farms.forEach(f => points.push([f.lat, f.lng]));
    points.push([slaughterhouseLocation.lat, slaughterhouseLocation.lng]);
    
    return points;
};


const getFarmMarkerClass = (farm: Farm) => {
  let statusClass = 'growing'; // Amarillo por defecto (creciendo)
  // Verde si está en el rango óptimo
  if (farm.avgWeight >= 105 && farm.avgWeight <= 118) statusClass = 'ready';
  // Gris si ya fue visitada esta semana
  if (farm.visitedThisWeek) statusClass = 'visited';
  
  return `custom-marker-farm ${statusClass}`;
};


const getRouteOptions = (index: number) => ({
  color: routeColors[index % routeColors.length],
  weight: 4,
  opacity: 0.8,
  lineCap: 'round',
  dashArray: '1, 6',
});
</script>

<template>
  <div id="map-container">
    <ClientOnly>
      <LMap
        ref="mapRef"
        :zoom="9"
        :center="[
          store.slaughterhouse.lat || 41.93,
          store.slaughterhouse.lng || 2.254
        ]"
        :use-global-leaflet="false"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        <!-- MATADERO -->
        <LMarker
          v-if="store.slaughterhouse.lat && store.slaughterhouse.lng"
          :lat-lng="[store.slaughterhouse.lat, store.slaughterhouse.lng]"
        >
          <LIcon
            :icon-url="baseMarkerIconUrl"
            :shadow-url="baseMarkerShadowUrl"
            :icon-size="[25, 41]"
            :icon-anchor="[12, 41]"
            class-name="custom-marker-slaughter"
          />
          <LTooltip>
            <b>🏭 {{ store.slaughterhouse.name || 'Matadero' }}</b><br />
            Capacidad: {{ store.slaughterhouse.capacity }} cerdos / día
          </LTooltip>
        </LMarker>

        <!-- GRANJAS -->
        <LMarker
          v-for="farm in store.farms"
          :key="farm.id"
          :lat-lng="[farm.lat, farm.lng]"
        >
          <LIcon
            :icon-url="baseMarkerIconUrl"
            :shadow-url="baseMarkerShadowUrl"
            :icon-size="[20, 32]"
            :icon-anchor="[10, 32]"
            :class-name="getFarmMarkerClass(farm)"
          />
          <LTooltip>
            <b>🐷 Granja {{ farm.id }}</b><br />
            Cerdos: {{ farm.pigs ?? '?' }}<br />
            Peso medio: {{ farm.avgWeight?.toFixed ? farm.avgWeight.toFixed(1) : farm.avgWeight }} kg<br />
            Estado: {{ farm.status || (farm.visitedThisWeek ? 'visited' : 'growing') }}
          </LTooltip>
        </LMarker>

        <!-- RUTAS DEL DÍA -->
        <LPolyline
          v-for="(route, index) in store.routes"
          :key="index"
          :lat-lngs="getRoutePoints(route)"
          :options="getRouteOptions(index)"
        />
      </LMap>
    </ClientOnly>
  </div>
</template>

<style>
#map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  filter: saturate(0.6) contrast(1.1) brightness(1.05);
}

/* MATADERO */
.custom-marker-slaughter {
  /* el PNG es el de Leaflet, aquí solo damos estilo extra si queremos */
  filter: hue-rotate(-40deg) saturate(1.4);
}

/* GRANJAS base */
.custom-marker-farm {
  /* mismo icono base, pero podemos tintarlo con filters */
    border-radius: 50%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Estados de granjas */
.custom-marker-farm.growing {
  filter: hue-rotate(80deg) saturate(1.6);
}

.custom-marker-farm.visited {
  filter: hue-rotate(190deg) saturate(1.6);
}

.custom-marker-farm.empty {
  filter: grayscale(1) brightness(0.8);
}
</style>
