<script setup>
import { ref, onMounted } from "vue";

const auctions = ref([]);
const loading = ref(true);
const selected = ref(null);
const error = ref(null);

// Hämta alla auktioner när komponenten mountas
onMounted(async () => {
  try {
    const res = await fetch("/api/auctions");
    if (!res.ok) {
      throw new Error("Kunde inte hämta auktioner");
    }
    auctions.value = await res.json();
  } catch (err) {
    console.error(err);
    error.value = "Kunde inte ladda auktioner";
  } finally {
    loading.value = false;
  }
});

// Öppna en specifik auktion
async function openAuction(id) {
  selected.value = null;
  try {
    const res = await fetch(`/api/auction/${id}`);
    if (!res.ok) {
      console.error("Auktion hittades inte");
      error.value = "Auktion hittades inte";
      return;
    }
    const data = await res.json();
    selected.value = data; // { car, auction }
  } catch (err) {
    console.error("Error fetching auction:", err);
    error.value = "Kunde inte hämta auktion";
  }
}
</script>

<template>
  <main style="max-width: 900px; margin: auto; font-family: sans-serif">
    <h1>🚗 CarStore Auktioner</h1>

    <!-- Visar loading -->
    <p v-if="loading">Laddar auktioner...</p>

    <!-- Visar fel -->
    <p v-if="error" style="color: red">{{ error }}</p>

    <!-- Lista över alla auktioner -->
    <ul v-if="!loading && auctions.length">
      <li v-for="a in auctions" :key="a.id">
        <button @click="openAuction(a.id)">Auktion #{{ a.id }}</button>
      </li>
    </ul>

    <p v-if="!loading && auctions.length === 0">Inga auktioner tillgängliga.</p>

    <!-- Visar detaljer för vald auktion -->
    <section v-if="selected">
      <hr />
      <h2>{{ selected.car.car_brand }} {{ selected.car.car_model }}</h2>

      <p><b>Regnr:</b> {{ selected.car.car_regno }}</p>
      <p><b>År:</b> {{ selected.car.car_year }}</p>
      <p><b>Mil:</b> {{ selected.car.car_mileage_text }}</p>
      <p><b>Växellåda:</b> {{ selected.car.car_gearbox }}</p>
      <p><b>Acceptpris:</b> {{ selected.auction.acceptPrice }}</p>

      <a :href="`https://carstore.eu/auction/se/${selected.auction.id}`" target="_blank">
        Öppna på CarStore
      </a>
    </section>
  </main>
</template>

<style>
button {
  margin: 5px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
