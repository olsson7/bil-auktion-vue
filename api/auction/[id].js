export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const template = process.env.CAR_DETAIL_URL;
    if (!template) {
      return res.status(500).json({ error: "CAR_DETAIL_URL saknas" });
    }

    const url = template.replace(/%d/g, id);
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Kunde inte hämta auktion" });
    }

    const data = await response.json();

    // Plocka ut objektet från componentProps utan att bry sig om UUID
    const componentProps = data.pageProps?.componentProps || {};
    const auctionData = Object.values(componentProps).find(
      item => item.auction?.id == id
    );

    if (!auctionData) {
      return res.status(404).json({ error: "Auktion hittades inte" });
    }

    // Returnera ett enkelt objekt { car, auction }
    const result = {
      car: auctionData.car,
      auction: auctionData.auction
    };

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch auction" });
  }
}
