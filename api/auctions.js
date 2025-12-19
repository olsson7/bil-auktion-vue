// api/auctions.js
import fetch from 'node-fetch'; // om Node 18+, kan du använda global fetch istället

const AUCTIONS_URL = 'https://carstore.eu/auction/se/api/auctions';
const CAR_DETAIL_URL_TEMPLATE = (id) =>
  `https://carstore.eu/auction/se/_next/data/Wwwm4JBSjcCxpZZvjcbRr/sv-SE/${id}.json?path=${id}`;

export default async function handler(req, res) {
  console.log('📡 Starting auctions handler');

  try {
    // 1️⃣ Hämta lista på auktioner
    const listResponse = await fetch(AUCTIONS_URL);
    if (!listResponse.ok) {
      console.error('❌ Failed to fetch auctions list:', listResponse.status);
      return res.status(500).json({ error: 'Kunde inte hämta auktioner' });
    }

    const auctionsList = await listResponse.json();
    console.log(`✅ Auctions list received, length: ${auctionsList.length}`);

    const auctionsDetails = [];

    // 2️⃣ Hämta detaljer för varje auktion, en i taget för enklare debug
    for (const auction of auctionsList) {
      const auctionId = auction.id || auction.auctionId || null;

      if (!auctionId) {
        console.warn('⚠️ Auction has no ID:', auction);
        continue;
      }

      const detailUrl = CAR_DETAIL_URL_TEMPLATE(auctionId);
      console.log(`🔹 Fetching details for auction id: ${auctionId}`);
      console.log(`   Detail URL: ${detailUrl}`);

      try {
        const detailResponse = await fetch(detailUrl);

        if (!detailResponse.ok) {
          console.warn(`⚠️ Detail response for ${auctionId}: ${detailResponse.status}`);
          auctionsDetails.push({ id: auctionId, error: detailResponse.status });
          continue;
        }

        const detailData = await detailResponse.json();
        console.log(`   ✅ Detail fetched for ${auctionId}`);
        auctionsDetails.push({ id: auctionId, data: detailData });

      } catch (detailErr) {
        console.error(`❌ Error fetching detail for ${auctionId}:`, detailErr.message);
        auctionsDetails.push({ id: auctionId, error: detailErr.message });
      }
    }

    // 3️⃣ Returnera både listan och detaljer (med eventuella fel) för debug
    res.status(200).json({
      auctionsCount: auctionsList.length,
      auctionsDetailsCount: auctionsDetails.length,
      auctionsDetails,
    });

  } catch (err) {
    console.error('❌ Unexpected error in auctions handler:', err.message);
    res.status(500).json({ error: 'Något gick fel vid hämtning av auktioner' });
  }
}
