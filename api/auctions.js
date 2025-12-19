import fetch from 'node-fetch';

const AUCTIONS_URL = 'https://carstore.eu/auction/se/api/auctions';
const DETAIL_URL = (id) => `https://carstore.eu/auction/se/_next/data/V-7RtdkyYe-OXKGTW8Rt/sv-SE/${id}.json?path=${id}`;

export async function getAuctions() {
  try {
    console.log('📡 Fetching auctions list...');
    const res = await fetch(AUCTIONS_URL);
    if (!res.ok) throw new Error(`Failed to fetch auctions: ${res.status}`);
    const auctionsList = await res.json();

    console.log(`✅ Auctions list received, length: ${auctionsList.length}`);

    const detailedAuctions = [];

    for (const auction of auctionsList) {
      console.log(`🔹 Fetching details for auction id: ${auction.id}`);
      const detailRes = await fetch(DETAIL_URL(auction.id));
      if (!detailRes.ok) {
        console.warn(`⚠️ Detail response for ${auction.id}: ${detailRes.status}`);
        continue;
      }
      const detailJson = await detailRes.json();

      // Här måste vi navigera till rätt plats i JSON
      const data = detailJson.pageProps?.auction;
      if (!data) {
        console.warn(`⚠️ Auction data missing for ${auction.id}`);
        continue;
      }

      const auctionData = {
        id: data.id,
        brand: data.brand,
        model: data.model,
        regNumber: data.regNumber,
        year: data.year,
        mileage: data.mileage,
        gearbox: data.gearbox,
        reservePrice: data.reservePrice,
        url: `https://carstore.eu/auction/se/${data.id}`,
      };

      detailedAuctions.push(auctionData);
    }

    console.log(`✅ Detailed auctions fetched, count: ${detailedAuctions.length}`);
    return detailedAuctions;

  } catch (err) {
    console.error('Error fetching auctions:', err);
    return [];
  }
}
