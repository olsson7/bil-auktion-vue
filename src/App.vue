<script setup>
import { ref, onMounted } from "vue";

const auctions = ref([]);
const loading = ref(true);
const selected = ref(null);

onMounted(async () => {
  const res = await fetch("/api/auctions");
  auctions.value = await res.json();
  loading.value = false;
});

async function openAuction(id) {
  const res = await fetch(`/api/auction/${id}`);
  const data = await res.json();

  // Sätt selected till objektet vi fått från servern
  selected.value = data;
}
</script>

<template>
  <main style="max-width: 900px; margin: auto; font-family: sans-serif">
    <h1>🚗 CarStore Auktioner</h1>

    <p v-if="loading">Laddar...</p>

    <ul v-if="!loading">
      <li v-for="a in auctions" :key="a.id">
        <button @click="openAuction(a.id)">Auktion #{{ a.id }}</button>
      </li>
    </ul>

    <section v-if="selected">
      <hr />
      <h2>
        {{ selected.car.car_brand }} {{ selected.car.car_model }}
      </h2>

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
