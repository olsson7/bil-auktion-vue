import fetch from "node-fetch";

interface CarImage {
  thumbnail: string;
  original: string;
}

interface CarDetail {
  id: string;
  brand: string | null;
  model: string | null;
  year: string | null;
  regNumber: string | null;
  images: CarImage[];
}

async function fetchAuctions() {
  // Hämta listan med auktioner
  const res = await fetch("https://carstore.eu/auction/se/data/auctions");
  const auctionsJson = await res.json();
  const auctions = auctionsJson.data || [];

  // Hämta detaljinformation för varje auktion
  const detailedAuctions: CarDetail[] = await Promise.all(
    auctions.map(async (auction: any) => {
      try {
        const detailRes = await fetch(`https://carstore.eu/auction/se/${auction.id}`);
        const detailJson = await detailRes.json();

        // Path till bilinformationen i JSON:en
        const carData = detailJson.pageProps?.componentProps?.["d85208dc-ef72-44b1-9152-d24372ae1dab"]?.car;

        if (!carData) {
          console.warn(`⚠️ Ingen bilinformation hittades för auction ${auction.id}`);
          return null;
        }

        // Extrahera relevant information
        return {
          id: auction.id,
          brand: carData.brand || null,
          model: carData.model || null,
          year: carData.year || null,
          regNumber: carData.regNumber || null,
          images: carData.car_images?.map((img: any) => ({
            thumbnail: img.thumbnail_url,
            original: img.original
          })) || []
        };
      } catch (error) {
        console.error(`❌ Fel vid hämtning av auktion ${auction.id}:`, error);
        return null;
      }
    })
  );

  // Filtrera bort null-värden (om någon auktion misslyckades)
  return detailedAuctions.filter(Boolean);
}

// Exempel på att köra funktionen
(async () => {
  const auctions = await fetchAuctions();
  console.log(JSON.stringify(auctions, null, 2));
})();
