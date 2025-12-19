export default async function handler(req, res) {
  const auctionsUrl = process.env.AUCTIONS_URL;
  const carDetailTemplate = process.env.CAR_DETAIL_URL;

  console.log("🚀 Starting auctions handler");

  if (!auctionsUrl || !carDetailTemplate) {
    console.log("❌ Missing AUCTIONS_URL or CAR_DETAIL_URL");
    return res
      .status(500)
      .json({ error: "AUCTIONS_URL eller CAR_DETAIL_URL saknas" });
  }

  console.log("AUCTIONS_URL:", auctionsUrl);
  console.log("CAR_DETAIL_URL template:", carDetailTemplate);

  try {
    // Hämta listan på alla auktioner
    console.log("📡 Fetching auctions list...");
    const response = await fetch(auctionsUrl);
    console.log("Auctions response status:", response.status);

    if (!response.ok) {
      console.log("❌ Failed to fetch auctions list");
      throw new Error(`Auctions fetch failed: ${response.status}`);
    }

    const auctionsList = await response.json();
    console.log("Auctions list received, length:", auctionsList.length);

    // Hämta detaljer för varje auktion parallellt
    const detailedAuctions = await Promise.all(
      auctionsList.map(async (a) => {
        console.log("🔹 Fetching details for auction id:", a.id);
        const detailUrl = carDetailTemplate.replace(/%d/g, a.id);
        console.log("Detail URL:", detailUrl);

        try {
          const detailRes = await fetch(detailUrl);
          console.log(`Detail response for ${a.id}:`, detailRes.status);

          if (!detailRes.ok) {
            console.log(`❌ Failed to fetch details for auction ${a.id}`);
            return null;
          }

          const data = await detailRes.json();
          const componentProps = data.pageProps?.componentProps || {};
          const auctionData = Object.values(componentProps).find(
            item => item.auction?.id == a.id
          );

          if (!auctionData) {
            console.log(`❌ No auction data found for id ${a.id}`);
            return null;
          }

          return {
            id: a.id,
            regNumber: auctionData.car.car_regno,
            brand: auctionData.car.car_brand,
            model: auctionData.car.car_model,
            year: auctionData.car.car_year,
            mileage: auctionData.car.car_mileage_text,
            gearbox: auctionData.car.car_gearbox,
            reservePrice: auctionData.auction.acceptPrice,
            url: `https://carstore.eu/auction/se/${auctionData.auction.id}`
          };
        } catch (err) {
          console.log(`❌ Error fetching details for auction ${a.id}:`, err);
          return null;
        }
      })
    );

    const filtered = detailedAuctions.filter(Boolean);
    console.log("✅ Detailed auctions fetched, count:", filtered.length);

    res.status(200).json(filtered);
  } catch (err) {
    console.error("❌ Error in auctions handler:", err);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
}
