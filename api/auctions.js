// /api/auctions.js
export default async function handler(req, res) {
  try {
    const auctions = await fetchAuctions();
    res.status(200).json(auctions);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}

async function fetchAuctions() {
  // Hämta listan med auktioner
  let auctionsJson;
  try {
    const res = await fetch("https://carstore.eu/auction/se/data/auctions");
    auctionsJson = await res.json();
  } catch (err) {
    console.error('Error fetching auctions list:', err);
    return [];
  }

  const auctions = auctionsJson.data || [];

  const detailedAuctions = await Promise.all(
    auctions.map(async (auction) => {
      try {
        // Använd Next.js-data-API:t för detaljer
        const detailRes = await fetch(
          `https://carstore.eu/auction/se/_next/data/Wwwm4JBSjcCxpZZvjcbRr/sv-SE/${auction.id}.json?path=${auction.id}`
        );
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
          images: carData.car_images?.map(img => ({
            thumbnail: img.thumbnail_url,
            original: img.original
          })) || []
        };
      } catch (err) {
        console.error(`❌ Fel vid hämtning av auktion ${auction.id}:`, err);
        return null;
      }
    })
  );

  return detailedAuctions.filter(Boolean);
}
