export default async function handler(req, res) {
  const url = process.env.AUCTIONS_URL;
  const template = process.env.CAR_DETAIL_URL;

  if (!url || !template) {
    return res.status(500).json({ error: "AUCTIONS_URL eller CAR_DETAIL_URL saknas" });
  }

  try {
    const auctionsRes = await fetch(url);
    const auctionsData = await auctionsRes.json();

    // Plocka ut detaljer för varje auktion
    const detailed = await Promise.all(
      auctionsData.map(async a => {
        const detailRes = await fetch(template.replace(/%d/g, a.id));
        const detailData = await detailRes.json();
        const componentProps = detailData.pageProps?.componentProps || {};
        const auctionData = Object.values(componentProps).find(item => item.auction?.id == a.id);
        return {
          car: auctionData.car,
          auction: auctionData.auction
        };
      })
    );

    res.status(200).json(detailed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kunde inte hämta auktioner" });
  }
}
