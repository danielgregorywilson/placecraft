<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="q-mx-lg" id="page">
        <div id="page-title" class="text-h4 q-my-lg text-center">PlaceCraft: Reimagining streets</div>
        <div class="row justify-around">
          <div id="map"></div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
  #page {
    max-width: 1200px;
  }

  #map {
    width: 900px;
    height: 500px;
  }

  .all-toggle {
    border-bottom: 1px solid black;
  }

  // New Stop Form
  #addStopForm {
    background-color: lightgray;
    padding: 10px 30px 30px 30px
  }

  #new-stop-state {
    min-width: 29px;
  }

  #new-stop-meal-type {
    min-width: 56px;
  }

  #new-stop-route {
    min-width: 56px;
  }

  .star-marker {
    background-image: url('../../assets/star.png');
    background-size: cover;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
  }

  @media print {
    @page { size: landscape; }

    #page-title {
      margin-top: 10px;
    }
  }


</style>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Feature, GeoJsonProperties, Geometry } from 'GeoJSON'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Mapbox
const accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN
let map = {} as mapboxgl.Map
let center: mapboxgl.LngLatLike = [-123.04749121079517, 44.06123949198414]
let zoom = 11

import CurrentImg from 'src/assets/locations/broadway-high-current.jpeg'

function createMap() {
  try {
    map = new mapboxgl.Map({
      accessToken: accessToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom
    })

    map.addControl(new mapboxgl.NavigationControl())
    map.addControl(new mapboxgl.FullscreenControl())

    map.on('load', () => {
      addLocationToMap()
    })

    // When panning the map, update the center coordinates
    map.on('dragend', () => {
      const mapCenter = map.getCenter()
      center = [mapCenter.lng, mapCenter.lat]
    })

  } catch (err) {
    console.log('Error rendering map:', err)
  }
}

function addLocationToMap() {
  // Create an array of locations for the map.
  let locations = [] as Feature<Geometry, GeoJsonProperties>[]
  locations.push({
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': [-123.088157, 44.049893]
    },
    'properties': {
      'description':
        `<div class="row"><a href="/location/1">View this place</a></div><div class="row"><img href="/location/1" src="${CurrentImg}" style="width: 100px;"/></div>`,
      'icon': 'theatre'
    }
  })

  // Add the addresses as a map source.
  map.addSource('places', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': locations,
    }
  })

  // Add the addresses as a layer on the map.
  map.addLayer({
    'id': 'places',
    'type': 'circle',
    'source': 'places',
    'paint': {
      'circle-radius': 6,
      'circle-color': 'red'
    },
    'filter': ['==', '$type', 'Point']
  })

  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'places', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'places', () => {
    map.getCanvas().style.cursor = '';
  });

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'places', (e) => {
  // Copy coordinates array.
  const coordinates = e.features[0].geometry.coordinates.slice();
  const description = e.features[0].properties.description;

  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map);
  });
}

function initializeComponent() {
  createMap() // TODO: When redrawing the map, there is a warning about the map already existing.
}


// lifecycle hooks
onMounted(() => {
  initializeComponent()
})
</script>

