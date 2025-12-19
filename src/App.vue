<script setup>
import { ref, onMounted } from "vue"

const auctions = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await fetch("/api/auctions")

    if (!res.ok) {
      throw new Error("API error: " + res.status)
    }

    auctions.value = await res.json()
  } catch (e) {
    error.value = e.message
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>Bilauktioner</h1>

    <p v-if="loading">Laddar...</p>
    <p v-if="error" style="color:red">{{ error }}</p>

    <ul v-if="!loading">
      <li v-for="a in auctions" :key="a.id">
        {{ a.title ?? a.id }}
      </li>
    </ul>
  </div>
</template>
