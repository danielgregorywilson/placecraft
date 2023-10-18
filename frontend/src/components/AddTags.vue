<template>
<div>Tags</div>
<q-chip v-for="tag of addFormTags" :key="addFormTags.indexOf(tag)" removable @remove="addFormRemoveTag(addFormTags.indexOf(tag))" color="secondary" text-color="white">{{ tag.name }}</q-chip>
<div class="row justify-between">
  <q-select :model-value="addFormNewTag" @input-value="setNewAddTagName" :options="tags()" option-value="pk" option-label="name" label="Add Tag" use-input hide-selected fill-input input-debounce="500" @filter="tagFilterFn">
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
  </q-select>
  <q-btn label="Add" color="primary" :disable="!addFormNewTag" @click="addFormAddTag()"/>
</div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'
import { QSelect } from 'quasar'
import useEventBus from 'src/eventBus'
import { Tag } from 'src/types'

const bus = useEventBus()

let addFormTags: Ref<Array<{'name': string}>> = ref([])
let addFormNewTag = ref('')

let tagNeedle = ref('') // For filtering tag list

//////////
// TAGS //
//////////
function tags(): Array<Tag> {
  // const tags = responsibilityStore.simpleTagList
  // return tags.filter((tag) => {
  //   return tag.name.toLowerCase().indexOf(tagNeedle.value) != -1
  // })
  return [
    { pk: 1, name: 'Cycletrack'},
    { pk: 1, name: 'Bulb-out'},
    { pk: 1, name: 'Street art'},
    { pk: 1, name: 'Stormwater planter'}
  ]
}

function tagFilterFn (val: string, update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void) {
  update(() => {
    tagNeedle.value = val.toLowerCase()
  })
}

function setNewAddTagName(val: string) {
  addFormNewTag.value = val
}

function addFormAddTag(): void {
  addFormTags.value.push({'name': addFormNewTag.value})
  addFormNewTag.value = ''
  bus.emit('emitUpdatedTags', addFormTags.value)
}

function addFormRemoveTag(tagIndex: number): void {
  addFormTags.value.splice(tagIndex, 1)
}

onMounted(() => {
  // retrieveSimpleTagList()
})
</script>
