const fetch = require("node-fetch");

async function fetchAuctions() {
  const res = await fetch("https://carstore.eu/auction/se/data/auctions");
  const auctionsJson = await res.json();
  const auctions = auctionsJson.data || [];

  const detailedAuctions = await Promise.all(
    auctions.map(async (auction) => {
      try {
        const detailRes = await fetch(`https://carstore.eu/auction/se/${auction.id}`);
        const detailJson = await detailRes.json();

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
        console.error(`❌ Fel vid hämtning av auktion ${auction.id}:`, error);
        return null;
      }
    })
  );

  return detailedAuctions.filter(Boolean);
}

(async () => {
  const auctions = await fetchAuctions();
  console.log(JSON.stringify(auctions, null, 2));
})();
