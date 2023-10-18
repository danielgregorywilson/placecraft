<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="q-mx-lg" id="page">
        <div id="page-title" class="text-h4 q-my-lg text-center">Add a location</div>
        <q-form
          id="location-add-form"
          @submit="onSubmit"
          @reset="onReset"
          class="q-gutter-md"
          style="max-width: 400px; margin: auto"
        >
          <q-input
            filled
            v-model="name"
            label="Your name *"
            hint="Name and surname"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />

          <q-input
            filled
            type="email"
            v-model="email"
            label="Your email *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />

          <q-file outlined v-model="image">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="row q-gutter-sm justify-between">
            <q-input filled v-model="lat" label="Latitude" />
            <q-input filled v-model="lon" label="Longitude" />
          </div>

          <AddTags />

          <q-toggle v-model="accept" label="I accept the license and terms" />

          <div>
            <q-btn label="Submit" type="submit" color="primary"/>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
          {{ result }}
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">

</style>

<script setup lang="ts">
import { Notify } from 'quasar'
import { ref, Ref, watch } from 'vue'
// import emailjs from 'emailjs-com'

import AddTags from 'src/components/AddTags.vue';
import useEventBus from 'src/eventBus'
import { Tag } from 'src/types'

const { bus } = useEventBus()

let name = ref('')
let email = ref('')
let image = ref('')
let lat = ref('')
let lon = ref('')
let tags = ref([]) as Ref<Array<Tag>>
let accept = ref(false)

let result = ref({})

function onSubmit () {
  if (accept.value !== true) {
    // Notify.create('You need to accept the license and terms first')
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'You need to accept the license and terms first'
    })
  }
  else {
    // Notify.create('Submitted')
    Notify.create({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Submitted'
    })

    result.value = {
      name: name.value,
      email: email.value,
      image: image.value,
      lat: lat.value,
      lon: lon.value,
      tags: tags.value
    }
    sendEmail()
  }
}

function sendEmail() {
  try {
    const params = {
      from_name: name.value,
      from_email: email.value,
      image: image.value,
      lat: lat.value,
      lon: lon.value,
      tags: tags.value
    }
    // emailjs.send('service_v87jl59', 'template_a5ebnkd', params, '0p16heRdoT_rLhlVs')
  } catch(error) {
      console.log({error})
  }
}

function onReset () {
  name.value = ''
  email.value = ''
  accept.value = false
}

watch(() => bus.value.get('emitUpdatedTags'), (newTags: Array<Tag>) => {
  tags.value = newTags
})

// lifecycle hooks
</script>

