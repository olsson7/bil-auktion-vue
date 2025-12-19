export default async function handler(req, res) {
  console.log("🚀 Starting auctions handler");

  const url = process.env.AUCTIONS_URL;
  const detailTemplate = process.env.CAR_DETAIL_URL;

  console.log("AUCTIONS_URL:", url);
  console.log("CAR_DETAIL_URL template:", detailTemplate);

  if (!url || !detailTemplate) {
    return res.status(500).json({ error: "AUCTIONS_URL eller CAR_DETAIL_URL saknas" });
  }

  try {
    console.log("📡 Fetching auctions list...");
    const response = await fetch(url);
    const auctionsList = await response.json();
    console.log("Auctions list received, length:", auctionsList.length);

    const UUID = "d85208dc-ef72-44b1-9152-d24372ae1dab";

    const detailedAuctions = await Promise.all(
      auctionsList.map(async (a) => {
        const detailUrl = detailTemplate.replace(/%d/g, a.id);
        console.log(`🔹 Fetching details for auction id: ${a.id}`);
        console.log("Detail URL:", detailUrl);

        try {
          const detailRes = await fetch(detailUrl);
          if (!detailRes.ok) {
            console.log(`Detail response for ${a.id}:`, detailRes.status);
            return null;
          }

          const data = await detailRes.json();
          const componentProps = data.pageProps?.componentProps || {};
          const auctionData = componentProps[UUID];

          if (!auctionData) {
            console.log(`❌ No auctionData found for id: ${a.id}`);
            return null;
          }

          return {
            car: auctionData.car,
            auction: auctionData.auction
          };
        } catch (err) {
          console.error(`❌ Failed to fetch details for auction ${a.id}`, err);
          return null;
        }
      })
    );

    const result = detailedAuctions.filter(Boolean);
    console.log("✅ Detailed auctions fetched, count:", result.length);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
}
