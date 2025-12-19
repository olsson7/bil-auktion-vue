<script setup>
import { ref, onMounted } from "vue";

const auctions = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const res = await fetch("/api/auctions");
    if (!res.ok) throw new Error("Kunde inte hämta auktioner");
    auctions.value = await res.json();
  } catch (err) {
    console.error(err);
    error.value = "Kunde inte ladda auktioner";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main style="max-width: 900px; margin: auto; font-family: sans-serif">
    <h1>🚗 CarStore Auktioner</h1>

    <p v-if="loading">Laddar auktioner...</p>
    <p v-if="error" style="color: red">{{ error }}</p>

    

    <p v-if="!loading && auctions.length === 0">Inga auktioner tillgängliga.</p>
  </main>
</template>
