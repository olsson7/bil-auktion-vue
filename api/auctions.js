export default async function handler(req, res) {
  const auctionsUrl = process.env.AUCTIONS_URL;
  const carDetailTemplate = process.env.CAR_DETAIL_URL;

  if (!auctionsUrl || !carDetailTemplate) {
    return res
      .status(500)
      .json({ error: "AUCTIONS_URL eller CAR_DETAIL_URL saknas" });
  }

  try {
    // Hämta listan på alla auktioner
    const response = await fetch(auctionsUrl);
    if (!response.ok) throw new Error(`Auctions fetch failed: ${response.status}`);
    const auctionsList = await response.json();

    // Hämta detaljer för varje auktion parallellt
    const detailedAuctions = await Promise.all(
      auctionsList.map(async (a) => {
        const detailUrl = carDetailTemplate.replace(/%d/g, a.id);
        const detailRes = await fetch(detailUrl);
        if (!detailRes.ok) return null;
        const data = await detailRes.json();

        const componentProps = data.pageProps?.componentProps || {};
        const auctionData = Object.values(componentProps).find(
          item => item.auction?.id == a.id
        );

        if (!auctionData) return null;

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
      })
    );

    // Filtrera bort null (om någon misslyckades)
    res.status(200).json(detailedAuctions.filter(Boolean));
  } catch (err) {
    console.error("Error fetching auctions:", err);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
}
