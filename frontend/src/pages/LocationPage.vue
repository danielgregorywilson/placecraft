<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="q-mx-lg q-mb-lg" id="page">
        <div id="page-title" class="text-h4 q-my-lg text-center">Broadway at High</div>
        <div class="row justify-center q-mb-md">
          <q-img
            :src="CurrentImg"
            spinner-color="white"
            style="max-width: 400px"
          />
        </div>
        <div class="row justify-center q-mb-md">
          <q-carousel
            animated
            v-model="slide"
            arrows
            navigation
            infinite
            style="width: 500px"
          >
            <q-carousel-slide :name="1" :img-src="WalkableImg" />
            <q-carousel-slide :name="2" :img-src="RailImg" />
          </q-carousel>
        </div>
        <div class="row justify-center q-mb-md">
          <image-compare
            :current-img="CurrentImg"
            :new-img="WalkableImg"
          />
        </div>
        <div class="row justify-center">
          <q-btn color="primary" label="Share on MyPlace" icon="share" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">

</style>

<script setup lang="ts">
import { ref } from 'vue'

import CurrentImg from 'src/assets/locations/broadway-high-current.jpeg'
import RailImg from 'src/assets/locations/broadway-high-rail.jpeg'
import WalkableImg from 'src/assets/locations/broadway-high-walkable.jpeg'
import ImageCompare from 'src/components/ImageCompare.vue';

let slide = ref(1)

// lifecycle hooks
</script>

