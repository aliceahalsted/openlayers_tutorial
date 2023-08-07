import './style.css';
import {Map, View} from 'ol';
import Overlay from 'ol/Overlay.js';
import olms from 'ol-mapbox-style';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Fill, Stroke, Style} from 'ol/style.js';
import colormap from 'colormap';
import {defaults as defaultControls} from 'ol/control.js';

//Elements that make up the popup.
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

//Create an overlay
const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

//Close click handler for overlay
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};


const ramp = colormap({
  colormap: 'viridis',
  nshades: 55,
});

function getColor(feature) {
  const index = feature.get('OBJECTID');
  return ramp[index];
}


const biodiversityLayer = 
  new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: '/Biodiversity_Hotspots_Simplify.geojson',
      attributions: '| Data from Conservation International | Map by Alicea Halsted'
    }),
    style: function (feature) {
      if(feature.get('Type')==='outer limit'){
        return new Style({
          fill: new Fill({
            color: 'rgba(222, 222, 222, 0.2)',
          }),
          stroke: new Stroke({
            color: '#2d434f',
          }),
        });
      } else {
        return new Style({
          fill: new Fill({
            color: getColor(feature),
          }),
          stroke: new Stroke({
            color: 'rgba(255,255,255,0.8)',
          }),
        });
      }
    }
  });


biodiversityLayer.setOpacity(0.6);


const map = new Map({
  target: 'map',
  overlays: [overlay],
  controls: defaultControls({attribution: true}),
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});


olms(map, 'https://api.maptiler.com/maps/topo-v2/style.json?key=DLckSLv83ZgukKmN2KvV').then(function(map){
  map.addLayer(biodiversityLayer)
});


//Add a click handler to the map to render the popup.
map.on('singleclick', function (event) {
  const coordinate = event.coordinate;
  const features = map.getFeaturesAtPixel(event.pixel);
  let name = null;
  if(features[0].getProperties().NAME !== undefined){
    name = features[0].getProperties().NAME
  } else {
    return;
  }
  content.innerHTML = `<p>${name}</p>`;
  overlay.setPosition(coordinate);
});

const basemapSelector = document.getElementById('basemap-selector');

const update = () => {
  const selection = basemapSelector.value;
  map.removeLayer(biodiversityLayer)
  if(selection === 'satellite'){
    olms(map, 'https://api.maptiler.com/maps/hybrid/style.json?key=DLckSLv83ZgukKmN2KvV').then(function(map){
      map.addLayer(biodiversityLayer)
    });
  } else if (selection === 'topo'){
    olms(map, 'https://api.maptiler.com/maps/topo-v2/style.json?key=DLckSLv83ZgukKmN2KvV').then(function(map){
      map.addLayer(biodiversityLayer)
    });
  }
}
basemapSelector.addEventListener('change', update);