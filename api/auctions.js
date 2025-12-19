// auctions.js
// ES-modul, fungerar direkt i Node 18+ utan node-fetch

async function fetchAuctions() {
  const res = await fetch("https://carstore.eu/auction/se/data/auctions");

  // Kontrollera att vi fick JSON
  if (!res.ok) {
    console.error(`Fel vid hämtning av auktioner: HTTP ${res.status}`);
    return [];
  }

  let auctionsJson;
  try {
    auctionsJson = await res.json();
  } catch (err) {
    console.error("Kunde inte parsa JSON från auktioner:", err);
    return [];
  }

  const auctions = auctionsJson.data || [];

  const detailedAuctions = await Promise.all(
    auctions.map(async (auction) => {
      try {
        const detailRes = await fetch(`https://carstore.eu/auction/se/${auction.id}`);

        if (!detailRes.ok) {
          console.warn(`⚠️ Kunde inte hämta detaljer för auction ${auction.id}: HTTP ${detailRes.status}`);
          return null;
        }

        let detailJson;
        try {
          detailJson = await detailRes.json();
        } catch (err) {
          console.warn(`⚠️ Kunde inte parsa JSON för auction ${auction.id}:`, err);
          return null;
        }

        const carData = detailJson.pageProps?.componentProps?.["d85208dc-ef72-44b1-9152-d24372ae1dab"]?.car;

        if (!carData) {
          console.warn(`⚠️ Ingen bilinformation hittades för auction ${auction.id}`);
          return null;
        }

        return {
          id: auction.id,
          brand: carData.brand || null,
          model: carData.model || null,
          year: carData.year || null,
          regNumber: carData.regNumber || null,
          images: carData.car_images?.map((img) => ({
            thumbnail: img.thumbnail_url,
            original: img.original
          })) || []
        };
      } catch (error) {
        console.error(`❌ Fel vid hämtning av auction ${auction.id}:`, error);
        return null;
      }
    })
  );

  // Ta bort null-värden
  return detailedAuctions.filter(Boolean);
}

// Om du vill köra direkt från Node:
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const auctions = await fetchAuctions();
    console.log(JSON.stringify(auctions, null, 2));
  })();
}

// Exportera funktionen så den kan användas av andra moduler
export { fetchAuctions };
