import * as leaflet from 'leaflet';

declare global {

  namespace L {
    export type Map = leaflet.Map;
  }

}

export {};