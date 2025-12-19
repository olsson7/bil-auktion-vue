// api/auctions.js
export async function GET() {
  try {
    const AUCTIONS_URL = 'https://carstore.eu/auction/se/api/auctions';

    // Hämta alla auktioner
    const res = await fetch(AUCTIONS_URL);
    if (!res.ok) {
      console.error(`Failed to fetch auctions: ${res.status}`);
      return new Response(JSON.stringify({ error: 'Kunde inte hämta auktioner' }), { status: 500 });
    }

    const auctions = await res.json();

    // Om du vill hämta detaljer för varje auktion:
    const detailedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        const CAR_DETAIL_URL = `https://carstore.eu/auction/se/_next/data/V-7RtdkyYe-OXKGTW8Rt/sv-SE/${auction.id}.json?path=${auction.id}`;
        try {
          const detailRes = await fetch(CAR_DETAIL_URL);
          if (!detailRes.ok) return null; // returnera null om detalj saknas
          const detailData = await detailRes.json();
          return { ...auction, detail: detailData };
        } catch (err) {
          console.error(`Failed to fetch detail for auction ${auction.id}:`, err);
          return { ...auction, detail: null };
        }
      })
    );

    return new Response(JSON.stringify(detailedAuctions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching auctions:', err);
    return new Response(JSON.stringify({ error: 'Kunde inte hämta auktioner' }), { status: 500 });
  }
}
