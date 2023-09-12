<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="q-mx-lg" id="page">
        <div id="page-title" class="text-h4 q-my-lg text-center">Meals on Wheels Delivery Routes</div>
        <div class="row justify-around">
          <div class="q-mr-lg" id="map-controls">
            <div class="q-pa-md row">
              <div class="col">
                <q-checkbox v-model="allHot" label="All Hot" @update:model-value="toggleAllHot" class="all-toggle"></q-checkbox>
                <q-option-group
                  :options="hotRouteOptions"
                  type="checkbox"
                  v-model="selectedHotRoutes"
                  @update:model-value="updateMapVisibility"
                />
              </div>
              <div class="col">
                <q-checkbox v-model="allCold" label="All Cold" @update:model-value="toggleAllCold" class="all-toggle"></q-checkbox>
                <q-option-group
                  :options="coldRouteOptions"
                  type="checkbox"
                  v-model="selectedColdRoutes"
                  @update:model-value="updateMapVisibility"
                />
              </div>
            </div>
            <q-toggle v-model="showWaitlisted" label="Show Waitlisted" class="row" @update:model-value="updateMapVisibility" />
            <q-btn color="primary" label="Print selected" class="row q-mt-md" @click="printPage"/>
          </div>
          <div id="map"></div>
        </div>
        <div id="add-address-container" class="q-mt-md">
          <div class="text-h6 row items-center q-my-sm">
            <div class="q-mr-sm">Add a Stop</div>
            <q-btn round color="primary" :icon="showNewStopForm ? 'remove' : 'add'" @click="showNewStopForm = !showNewStopForm"/>
          </div>
          <div id="addStopForm" v-if="showNewStopForm">
            <div class="row q-gutter-md">
              <q-input v-model="newStopFirstName" label="First Name" id="new-stop-first-name" />
              <q-input v-model="newStopLastName" label="Last Name" id="new-stop-last-name" />
              <q-input v-model="newStopPhone" label="Phone" id="new-stop-phone" />
              <q-input v-model="newStopPhoneNotes" label="Phone Notes" id="new-stop-phone-notes" class="col" />
            </div>
            <div class="row q-gutter-md">
              <q-input v-model="newStopAddress" name="street-address" label="Address" class="col" id="new-stop-address">
                <template v-slot:prepend>
                  <q-icon name="place" />
                </template>
              </q-input>
              <q-select v-model="newStopCity" :options="newStopCityOptions" label="City" name="city" id="new-stop-city" />
              <q-select v-model="newStopState" :options="newStopStateOptions" label="State" id="new-stop-state" />
              <q-input v-model="newStopZip" mask="#####" name="postal-code" label="Zip" class="col" id="new-stop-zip" />
            </div>
            <div class="row q-gutter-md">
              <q-select v-model="newStopMealType" label="Meal Type" :options="newStopMealTypeOptions" id="new-stop-meal-type" />
              <!-- <q-checkbox v-model="newStopWaitlist" label="Waitlist" id="new-stop-waitlist" /> -->
              <q-input v-model="newStopNotes" label="Notes" id="new-stop-notes" class="col" />
            </div>
            <div class="row q-gutter-md items-center" v-if="showNewStopRoute">
              <q-select
                v-model="newStopRoute"
                label="Route"
                :options="newStopMealType == 'Hot' ? allHotRoutes : allColdRoutes"
                id="new-stop-route"
                @update:model-value="addNewStopToMap"
              />
              <q-checkbox v-model="newStopWaitlist" label="Waitlist" id="new-stop-waitlist" />
              <q-btn color="primary" label="Add Stop" class="q-mt-sm" :disabled="!showNewStopRoute" @click="addStopToRoute" />
            </div>
            <div class="row">
              <q-btn color="primary" label="Check Address" class="q-mt-sm" :disabled="!newStopAddress || !newStopZip || showNewStopRoute" @click="checkAddress" />
            </div>
          </div>
        </div>
        <div id="route-stats" style="display: none">
          <div>{{ newStopLatitude }}, {{ newStopLongitude }}, {{ newStopRoute }}</div>
          <div class="row q-gutter-md">
            <div v-for="route in allRoutes" :key="allRoutes.indexOf(route)">
              <div class="text-h6">{{ route }}</div>
              <div>Current: {{ routeStats[route].current }}</div>
              <div>Waitlisted: {{ routeStats[route].waitlisted }}</div>
              <div>Center: {{ routeStats[route].center }}</div>
              <div>Average Distance: {{ routeStats[route].averageDistance }}</div>
              <div>Max Distance: {{ routeStats[route].maxDistance }}</div>
            </div>
          </div>
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

    #map-controls {
      display: none;
    }

    .mapboxgl-control-container {
      display: none;
    }

    #add-address-container {
      display: none;
    }
  }


</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
import { Feature, GeoJsonProperties, Geometry } from 'GeoJSON'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type RouteLabel = 'Gateway' | 'Marcola' | 'MC' | 'Short' | 'Long' | 'North' | 'Will' | 'Tu 1' | 'Tu 2' | 'Tu 3' | 'Thur 1' | 'Thur 2' | 'Thur 3' | 'PU'
type RouteValue = 'Gateway' | 'Marcola' | 'MC' | 'Short' | 'Long' | 'North' | 'Will' | 'hotPU' | 'Tu 1' | 'Tu 2' | 'Tu 3' | 'Thur 1' | 'Thur 2' | 'Thur 3' | 'coldPU'
type RouteColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'violet' | 'pink'
type RouteGetter =
  'gatewayStops' | 'marcolaStops' | 'MCStops' | 'shortStops' | 'longStops' |
  'northStops' | 'willStops' | 'hotPUStops' | 'tu1Stops' | 'tu2Stops' |
  'tu3Stops' | 'thur1Stops' | 'thur2Stops' | 'thur3Stops' | 'coldPUStops'
type WaitlistRouteGetter =
  'gatewayWaitlistStops' | 'marcolaWaitlistStops' | 'MCWaitlistStops' | 'shortWaitlistStops' |
  'longWaitlistStops' | 'northWaitlistStops' | 'willWaitlistStops' | 'hotPUWaitlistStops' |
  'tu1WaitlistStops' | 'tu2WaitlistStops' | 'tu3WaitlistStops' | 'thur1WaitlistStops' |
  'thur2WaitlistStops' | 'thur3WaitlistStops' | 'coldPUWaitlistStops'

interface RouteOption {
  label: RouteLabel,
  value: RouteValue,
  color: RouteColor,
  getter: RouteGetter
  waitlistGetter: WaitlistRouteGetter
}

interface RouteStats {
  current: number,
  waitlisted: number,
  center: {lng: number, lat: number},
  averageDistance: number,
  maxDistance: number
}

interface RoutesStats {
  [key: string]: RouteStats
}

type WaitlistOption = 'current' | 'waitlisted'

let allHot = ref(false)
let allCold = ref(false)

const waitlistOptions: Array<WaitlistOption> = ['current', 'waitlisted']

const hotRouteOptions: Array<RouteOption> = [
  { label: 'Gateway', value: 'Gateway', color: 'red', getter: 'gatewayStops', waitlistGetter: 'gatewayWaitlistStops'},
  { label: 'Marcola', value: 'Marcola', color: 'orange', getter: 'marcolaStops', waitlistGetter: 'marcolaWaitlistStops'},
  { label: 'MC', value: 'MC', color: 'yellow', getter: 'MCStops', waitlistGetter: 'MCWaitlistStops'},
  { label: 'Short', value: 'Short', color: 'green', getter: 'shortStops', waitlistGetter: 'shortWaitlistStops'},
  { label: 'Long', value: 'Long', color: 'blue', getter: 'longStops', waitlistGetter: 'longWaitlistStops'},
  { label: 'North', value: 'North', color: 'indigo', getter: 'northStops', waitlistGetter: 'northWaitlistStops'},
  { label: 'Will', value: 'Will', color: 'violet', getter: 'willStops', waitlistGetter: 'willWaitlistStops'},
  { label: 'PU', value: 'hotPU', color: 'pink', getter: 'hotPUStops', waitlistGetter: 'hotPUWaitlistStops'}
]
const coldRouteOptions: Array<RouteOption> = [
  { label: 'Tu 1', value: 'Tu 1', color: 'red', getter: 'tu1Stops', waitlistGetter: 'tu1WaitlistStops'},
  { label: 'Tu 2', value: 'Tu 2', color: 'orange', getter: 'tu2Stops', waitlistGetter: 'tu2WaitlistStops'},
  { label: 'Tu 3', value: 'Tu 3', color: 'yellow', getter: 'tu3Stops', waitlistGetter: 'tu3WaitlistStops'},
  { label: 'Thur 1', value: 'Thur 1', color: 'green', getter: 'thur1Stops', waitlistGetter: 'thur1WaitlistStops'},
  { label: 'Thur 2', value: 'Thur 2', color: 'blue', getter: 'thur2Stops', waitlistGetter: 'thur2WaitlistStops'},
  { label: 'Thur 3', value: 'Thur 3', color: 'violet', getter: 'thur3Stops', waitlistGetter: 'thur3WaitlistStops'},
  { label: 'PU', value: 'coldPU', color: 'pink', getter: 'coldPUStops', waitlistGetter: 'coldPUWaitlistStops'}
]
const allRouteOptions = [...hotRouteOptions, ...coldRouteOptions]
const allHotRoutes: Array<RouteValue> = ['Gateway', 'Marcola', 'MC', 'Short', 'Long', 'North', 'Will', 'hotPU']
const allColdRoutes: Array<RouteValue> = ['Tu 1', 'Tu 2', 'Tu 3', 'Thur 1', 'Thur 2', 'Thur 3', 'coldPU']
const allRoutes = [...allHotRoutes, ...allColdRoutes]
let selectedHotRoutes: Ref<Array<string>> = ref(['Gateway', 'Marcola', 'MC', 'Short', 'Long', 'North', 'Will']) // TODO: Use Array<RouteValue> instead of Array<string>
let selectedColdRoutes: Ref<Array<string>> = ref([])
let showWaitlisted = ref(false)

const newStopCityOptions = ['Dexter', 'Eugene', 'Leaburg', 'Lowell', 'Marcola', 'Springfield']
const newStopStateOptions = ['OR']
const newStopMealTypeOptions = [{label: 'Hot', value: 'hot'}, {label: 'Cold', value: 'cold'}]
let showNewStopForm = ref(false)
let showNewStopRoute = ref(false)
let newStopFirstName = ref('')
let newStopLastName = ref('')
let newStopAddress = ref('')
let newStopCity = ref('Springfield')
let newStopState = ref('OR')
let newStopZip = ref('')
let newStopPhone = ref('')
let newStopPhoneNotes = ref('')
let newStopNotes = ref('')
let newStopMealType: Ref<'Hot'> | Ref<'Cold'> = ref('Hot')
let newStopWaitlist = ref(true)
let newStopLongitude = ref(-1)
let newStopLatitude = ref(-1)
let newStopRoute: Ref<RouteValue> = ref('Gateway')

let routeStats: RoutesStats = {
  'Gateway': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Marcola': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'MC': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Short': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Long': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'North': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Will': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'hotPU': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Tu 1': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Tu 2': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Tu 3': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Thur 1': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Thur 2': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'Thur 3': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0},
  'coldPU': {current: 0, waitlisted: 0, center: { lng: 0, lat: 0 }, averageDistance: 0, maxDistance: 0}
}

// Mapbox
const accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN
// const accessToken = 'pk.eyJ1IjoiZHdpbHNvbjExMjMiLCJhIjoiY2xtZnY3ZWk1MXY1MzNlbHA2MjE0ZmF3aSJ9.jfrVXI2TOjt3FXBsqlJqlQ'
let map = {} as mapboxgl.Map
let center: mapboxgl.LngLatLike = [-122.94329319107005, 44.08711374902461]
let zoom = 10

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

    // When panning the map, update the center coordinates
    map.on('dragend', () => {
      const mapCenter = map.getCenter()
      center = [mapCenter.lng, mapCenter.lat]
    })

  } catch (err) {
    console.log('Error rendering map:', err)
  }
}


function initializeComponent() {
  showNewStopForm.value = false
  showNewStopRoute.value = false
  newStopFirstName.value = ''
  newStopLastName.value = ''
  newStopAddress.value = ''
  newStopCity.value = 'Springfield'
  newStopState.value = 'OR'
  newStopZip.value = ''
  newStopPhone.value = ''
  newStopPhoneNotes.value = ''
  newStopNotes.value = ''
  newStopMealType.value = 'Hot'
  newStopWaitlist.value = true
  createMap() // TODO: When redrawing the map, there is a warning about the map already existing.
}


// lifecycle hooks
onMounted(() => {
  initializeComponent()
})
</script>

