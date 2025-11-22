<script setup lang="ts">
import { LMap, LTileLayer, LMarker, LIcon, LPopup, LPolyline} from '@vue-leaflet/vue-leaflet';
import { useSimulationStore } from '@/stores/simulationStore';
import { ref, nextTick } from 'vue';
import type * as Leaflet from 'leaflet';

interface LMapComponent {
  leafletObject: L.Map;
}

const store = useSimulationStore();
const mapRef = ref<LMapComponent | null>(null);
const routeColors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669'];


watch(() => store.slaughterhouse.lat, (newLat) => {
    if (newLat !== 0 && mapRef.value) { 
        
        const mapComponent = mapRef.value;
        
        if (mapComponent.leafletObject) {
            
            const leafletMap = mapComponent.leafletObject;
            const sh = store.slaughterhouse;

            // nextTick asegura que el DOM ha sido actualizado y el contenedor es visible
            nextTick(() => {
                 // 1. InvalidateSize: ESTE ES EL ARREGLO DEL "A CACHOS" / "MÚLTIPLES MAPAS"
                 leafletMap.invalidateSize();

                 // 2. setView: Centra el mapa en la ubicación dinámica.
                 leafletMap.setView([sh.lat, sh.lng], 10);
            });
        }
    }
}, { immediate: true });


const getRoutePoints = (route: any) => {
    
    const slaughterhouseLocation = store.slaughterhouse; 
    
    const points: Leaflet.LatLngTuple[] = [];

    //Salida matadero
    points.push([slaughterhouseLocation.lat, slaughterhouseLocation.lng]);

    //Punto intermedio
    route.farms.forEach((f: any) => points.push([f.lat, f.lng]));

    //Regreso matadero
    points.push([slaughterhouseLocation.lat, slaughterhouseLocation.lng]);
    
    return points;
};


const getFarmMarkerClass = (farm: any) => {
  let statusClass = 'growing';
  if (farm.avgWeight >= 105 && farm.avgWeight <= 118) statusClass = 'ready';
  if (farm.visitedThisWeek) statusClass = 'visited';
  return `custom-marker-farm ${statusClass}`;
};

const getRouteOptions = (index: number) => ({
  color: routeColors[index % routeColors.length], 
  weight: 4,
  opacity: 0.8,
  lineCap: 'round',
  dashArray: '1, 6'
});
</script>

<template>
  <div id="map-container">
    <LMap ref="mapRef" :zoom="10" :center="[41.930, 2.254]" :use-global-leaflet="false">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

      <LMarker :lat-lng="[store.slaughterhouse.lat, store.slaughterhouse.lng]">
        <LIcon :icon-size="[24, 24]" class-name="custom-marker-slaughter" />
        <LPopup>
            <b>🏭 {{ store.slaughterhouse.name }}</b><br>Capacidad: {{ store.slaughterhouse.capacity }} / día
        </LPopup>
      </LMarker>

      <LMarker v-for="farm in store.farms" :key="farm.id" :lat-lng="[farm.lat, farm.lng]">
        <LIcon :icon-size="[16, 16]" :class-name="getFarmMarkerClass(farm)" />
        <LPopup>
          </LPopup>
      </LMarker>

      <LPolyline
        v-for="(route, index) in store.routes"
        :key="index"
        :lat-lngs="getRoutePoints(route)"
        :options="getRouteOptions(index)"
      />
    </LMap>
  </div>
</template>

<style>
    #map-container {
        /* Es esencial que sea absolute y ocupe el 100% de su padre (v-app) */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%; 
        z-index: 0;
        filter: saturate(0.6) contrast(1.1) brightness(1.05);
    }
</style>