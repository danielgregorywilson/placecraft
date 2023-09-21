<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="q-mx-lg" id="page">
        <div id="page-title" class="text-h4 q-my-lg text-center">Add a location</div>
        <q-form
          @submit="onSubmit"
          @reset="onReset"
          class="q-gutter-md"
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

          <q-toggle v-model="accept" label="I accept the license and terms" />

          <div>
            <q-btn label="Submit" type="submit" color="primary"/>
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">

</style>

<script setup lang="ts">
import { Notify } from 'quasar'
import { ref } from 'vue'

let name = ref('')
let email = ref('')
let image = ref('')
let accept = ref(false)

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
  }
}

function onReset () {
  name.value = ''
  email.value = ''
  accept.value = false
}

// lifecycle hooks
</script>

