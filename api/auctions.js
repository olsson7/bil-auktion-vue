// /api/auctions.js
// Vercel serverless route

export default async function handler(req, res) {
  try {
    const auctions = await fetchAuctions();
    res.status(200).json(auctions);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}

async function fetchAuctions() {
  let auctionsJson;
  try {
    const res = await fetch("https://carstore.eu/auction/se/data/auctions");

    // Om vi får HTML eller felaktigt svar, returnera tom array
    const text = await res.text();
    try {
      auctionsJson = JSON.parse(text);
    } catch {
      console.warn('API returned non-JSON response, returning empty array.');
      return [];
    }
  } catch (err) {
    console.error('Error fetching auctions list:', err);
    return [];
  }

  const auctions = auctionsJson.data || [];

  const detailedAuctions = await Promise.all(
    auctions.map(async (auction) => {
      try {
        const detailRes = await fetch(`https://carstore.eu/auction/se/${auction.id}`);
        const detailText = await detailRes.text();
        let detailJson;
        try {
          detailJson = JSON.parse(detailText);
        } catch {
          return null; // Hoppa över om JSON är ogiltig
        }

        const carData = detailJson.pageProps?.componentProps?.["d85208dc-ef72-44b1-9152-d24372ae1dab"]?.car;
        if (!carData) return null;

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
      } catch {
        return null;
      }
    })
  );

  return detailedAuctions.filter(Boolean);
}
