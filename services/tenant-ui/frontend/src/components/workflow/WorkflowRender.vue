<template>
    <div class="rounded-xl bg-gray-300 shadow p-4">
      <div v-for="(item, index) in displayData" :key="index">
        {{ console.log('Item:', item) }}
        <img
          v-if="item.type === 'image'"
          :src="item.url || defaultImage"
          alt="Card image"  
          class="w-10 h-10 mb-2"
        />
        <h1
          v-else-if="item.type === 'title'"
          class="text-lg font-bold text-gray-800"
        >
          {{ item.text }}
        </h1>
        <p
          v-else-if="item.type === 'text'"
          class="text-sm text-gray-700"
        >
          {{ item.text }}
        </p>
        <div class="flex justify-centre items-center mt-4" v-else-if="item.type === 'button'">
            <Button
            class="w-full pi-button text-white font-semibold"
            >
            {{ item.label }}
            </Button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
    import { toRef, defineProps, watchEffect } from 'vue'
    import Button from 'primevue/button'


    const stateData = defineProps(['data'])
    console.log('Data from parent:', stateData)
    const displayData = toRef(() => stateData.data)

    console.log('Display Data:', displayData)
    const defaultImage =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wallet_Flat_Icon.svg/512px-Wallet_Flat_Icon.svg.png'

  // This is your dynamic data prop or local mock
    /* const props = defineProps<{
    jsonData: {
        name: string,
        workdlowId: string,
        formatVersion?: string,
        initialState?: string,
        render: [],
        states: [{
          stateID: string,
          displayData: {
            type: string
            text?: string
            url?: string
            actionID?: string
            label?: string}[],
          transitions: [],
          actions: []
        }],
    }
    }>() */

    //const displayData = props.jsonData.states[0].displayData;

  /* const displayData = ref([
    {
      type: 'image',
      url: ''
    },
    {
      type: 'title',
      text: 'Your college adventure starts here!'
    },
    {
      type: 'text',
      text:
        "We are here to support you every step of the way and can't wait to connect with you. If you aren't sure where to start, consider checking out our action menu or call one of our team members."
    },
    {
      type: 'button',
      actionID: 'selectNewStudentOrientation',
      label: 'New Student Orientation'
    },
    {
      type: 'button',
      actionID: 'selectRequestTranscript',
      label: 'Request a Transcript'
    },
    {
      type: 'button',
      actionID: 'selectFinancialAid',
      label: 'Financial Aid'
    },
    {
      type: 'button',
      actionID: 'selectSummerCamps',
      label: 'Summer Camps and Programs'
    }
  ]) */
  
    watchEffect(() => {
        console.log('inside WatchEffect Data:', displayData.value)
    })
  </script>
  