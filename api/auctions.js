import fetch from 'node-fetch';

const AUCTIONS_URL = 'https://carstore.eu/auction/se/api/auctions';
const DETAIL_URL = (id) =>
  `https://carstore.eu/auction/se/_next/data/Wwwm4JBSjcCxpZZvjcbRr/sv-SE/${id}.json?path=${id}`;

export default async function handler(req, res) {
  try {
    console.log('📡 Fetching auctions list...');
    const listRes = await fetch(AUCTIONS_URL);
    if (!listRes.ok) throw new Error(`Failed to fetch auctions: ${listRes.status}`);
    const auctionsList = await listRes.json();
    console.log(`✅ Auctions list received, length: ${auctionsList.length}`);

    // Hämta detaljer parallellt
    const detailedAuctions = await Promise.all(
      auctionsList.map(async (auction) => {
        try {
          const url = DETAIL_URL(auction.id);
          console.log(`🔹 Fetching details for auction id: ${auction.id}`);
          console.log(`Detail URL: ${url}`);

          const detailRes = await fetch(url);
          if (!detailRes.ok) {
            console.warn(`⚠️ Detail response for ${auction.id}: ${detailRes.status}`);
            return null;
          }

          const detailJson = await detailRes.json();
          const data =
            detailJson.pageProps?.layoutData?.componentProps?.[
              'd85208dc-ef72-44b1-9152-d24372ae1dab'
            ]?.car;

          if (!data) {
            console.warn(`⚠️ Auction data missing for ${auction.id}`);
            return null;
          }

          // Returnera standardiserad info
          return {
            id: auction.id,
            brand: data.fields?.brand || 'Okänt',
            model: data.fields?.model || 'Okänt',
            regNumber: data.fields?.regNumber || 'Okänt',
            year: data.fields?.year || 'Okänt',
            mileage: data.fields?.mileage || 'Okänt',
            gearbox: data.fields?.gearbox || 'Okänt',
            reservePrice: data.fields?.reservePrice || 'Okänt',
            url: `https://carstore.eu/auction/se/${auction.id}`,
          };
        } catch (err) {
          console.warn(`⚠️ Error fetching auction ${auction.id}:`, err);
          return null;
        }
      })
    );

    // Ta bort nulls
    const finalAuctions = detailedAuctions.filter(Boolean);

    console.log(`✅ Detailed auctions fetched, count: ${finalAuctions.length}`);
    res.status(200).json(finalAuctions);
  } catch (err) {
    console.error('Error fetching auctions:', err);
    res.status(500).json({ error: 'Kunde inte hämta auktioner' });
  }
}
