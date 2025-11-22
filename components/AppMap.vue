<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LIcon, LPopup, LPolyline } from '@vue-leaflet/vue-leaflet';
import { useSimulationStore } from '@/stores/simulationStore';
import { ref, nextTick, watch } from 'vue';
import type * as Leaflet from 'leaflet';

interface LMapComponent {
  leafletObject: Leaflet.Map;
}

const store = useSimulationStore();
const mapRef = ref<LMapComponent | null>(null);

const routeColors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669'];

// Iconos por defecto de Leaflet (desde CDN)
const baseMarkerIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const baseMarkerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

/**
 * Recentrar mapa cuando tengamos coordenadas del matadero
 */
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

/**
 * Convierte la ruta en puntos Leaflet.
 * Si el backend manda route.path = [[lat, lon], ...] lo usamos directo.
 * Si no, reconstruimos a partir de route.farms como fallback.
 */
const getRoutePoints = (route: any): Leaflet.LatLngTuple[] => {
  if (Array.isArray(route.path) && route.path.length > 0) {
    return route.path.map(([lat, lng]: [number, number]) => [lat, lng]);
  }

  if (Array.isArray(route.farms)) {
    const sh = store.slaughterhouse;
    const pts: Leaflet.LatLngTuple[] = [];
    pts.push([sh.lat, sh.lng]);
    route.farms.forEach((f: any) => pts.push([f.lat, f.lng]));
    pts.push([sh.lat, sh.lng]);
    return pts;
  }

  return [];
};

/**
 * Clase CSS según estado de la granja
 */
const getFarmMarkerClass = (farm: any) => {
  let statusClass = 'growing';

  if (farm.status === 'visited' || farm.visitedThisWeek) {
    statusClass = 'visited';
  }

  if (farm.status === 'empty' || farm.pigs === 0) {
    statusClass = 'empty';
  }

  return `custom-marker-farm ${statusClass}`;
};

/**
 * Estilo visual de cada ruta
 */
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
          <LPopup>
            <b>🏭 {{ store.slaughterhouse.name || 'Matadero' }}</b><br />
            Capacidad: {{ store.slaughterhouse.capacity }} cerdos / día
          </LPopup>
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
          <LPopup>
            <b>🐷 Granja {{ farm.id }}</b><br />
            Cerdos: {{ farm.pigs ?? '?' }}<br />
            Peso medio: {{ farm.avgWeight?.toFixed ? farm.avgWeight.toFixed(1) : farm.avgWeight }} kg<br />
            Estado: {{ farm.status || (farm.visitedThisWeek ? 'visited' : 'growing') }}
          </LPopup>
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
  /* o inset: 0; */
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
}

/* Estados de granjas */
.custom-marker-farm.growing {
  filter: hue-rotate(80deg) saturate(1.6);   /* verde-ish */
}

.custom-marker-farm.visited {
  filter: hue-rotate(190deg) saturate(1.6);  /* azul-ish */
}

.custom-marker-farm.empty {
  filter: grayscale(1) brightness(0.8);      /* gris */
}
</style>
