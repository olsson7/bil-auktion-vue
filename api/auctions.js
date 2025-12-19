import fetch from 'node-fetch';

const AUCTIONS_URL = 'https://carstore.eu/auction/se/api/auctions';
const DETAIL_URL = (id) => `https://carstore.eu/auction/se/_next/data/Wwwm4JBSjcCxpZZvjcbRr/sv-SE/${id}.json?path=${id}`;

export default async function handler(req, res) {
  try {
    console.log('📡 Fetching auctions list...');
    const listRes = await fetch(AUCTIONS_URL);
    if (!listRes.ok) throw new Error(`Failed to fetch auctions: ${listRes.status}`);
    const auctionsList = await listRes.json();
    console.log(`✅ Auctions list received, length: ${auctionsList.length}`);

    const detailedAuctions = [];

for (const auction of auctionsList) {
  const url = DETAIL_URL(auction.id); // Anropa funktionen med auktionens id
  console.log(`🔹 Fetching details for auction id: ${auction.id}`);
  console.log(`Detail URL: ${url}`);

      const detailRes = await fetch(DETAIL_URL(auction.id));
      if (!detailRes.ok) {
        console.warn(`⚠️ Detail response for ${auction.id}: ${detailRes.status}`);
        continue;
      }
      const detailJson = await detailRes.json();

      const data = detailJson.pageProps?.auction;
      if (!data) {
        console.warn(`⚠️ Auction data missing for ${auction.id}`);
        continue;
      }

      const data = detailJson.pageProps?.layoutData?.componentProps?.["d85208dc-ef72-44b1-9152-d24372ae1dab"]?.car;

      if (!data) {
        console.warn(`⚠️ Auction data missing for ${auction.id}`);
        continue;
      }

      detailedAuctions.push({
        id: auction.id,
        brand: data.brand || "Okänt",
        model: data.model || "Okänt",
        regNumber: data.regNumber || "Okänt",
        year: data.year || "Okänt",
        mileage: data.mileage || "Okänt",
        gearbox: data.gearbox || "Okänt",
        reservePrice: data.reservePrice || "Okänt",
        url: `https://carstore.eu/auction/se/${auction.id}`,
      });
    }

    console.log(`✅ Detailed auctions fetched, count: ${detailedAuctions.length}`);
    res.status(200).json(detailedAuctions);

  } catch (err) {
    console.error('Error fetching auctions:', err);
    res.status(500).json({ error: 'Kunde inte hämta auktioner' });
  }
}
