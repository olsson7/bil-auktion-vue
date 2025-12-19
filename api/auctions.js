export default async function handler(req, res) {
  const url = process.env.AUCTIONS_URL;
  const detailTemplate = process.env.CAR_DETAIL_URL;

  if (!url || !detailTemplate) {
    return res.status(500).json({ error: "AUCTIONS_URL eller CAR_DETAIL_URL saknas" });
  }

  try {
    // Hämta listan på alla auktioner
    const response = await fetch(url);
    const auctionsList = await response.json();

    // Hämta detaljer för varje auktion parallellt
    const detailedAuctions = await Promise.all(
      auctionsList.map(async (a) => {
        const detailUrl = detailTemplate.replace(/%d/g, a.id);
        const detailRes = await fetch(detailUrl);
        const data = await detailRes.json();
        const componentProps = data.pageProps?.componentProps || {};
        const auctionData = Object.values(componentProps).find(
          item => item.auction?.id == a.id
        );

        if (!auctionData) return null;

        return {
          car: auctionData.car,
          auction: auctionData.auction
        };
      })
    );

    // Filtrera bort null (om någon misslyckades)
    res.status(200).json(detailedAuctions.filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
}
