import * as L from 'leaflet';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

// @ts-ignore
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/_nuxt/node_modules/leaflet/dist/images/marker-icon-2x.png',
    iconUrl: '/_nuxt/node_modules/leaflet/dist/images/marker-icon.png',
    shadowUrl: '/_nuxt/node_modules/leaflet/dist/images/marker-shadow.png',
});