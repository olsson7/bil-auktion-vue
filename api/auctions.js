import fetch from 'node-fetch';

const AUCTIONS_URL = 'https://carstore.eu/auction/se/api/auctions';

async function fetchAuctionDetails(auctionId) {
  try {
    // 1. Hämta HTML-sidan direkt
    const html = await fetch(`https://carstore.eu/auction/se/${auctionId}`)
      .then(res => res.text());

    // 2. Extrahera __NEXT_DATA__ script
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    if (!match) {
      console.warn(`Ingen __NEXT_DATA__ för auctionId ${auctionId}`);
      return null;
    }

    const nextData = JSON.parse(match[1]);

    // 3. Hämta componentProps
    const componentProps = nextData.props.pageProps.componentProps['d85208dc-ef72-44b1-9152-d24372ae1dab'];
    if (!componentProps) {
      console.warn(`Ingen componentProps för auctionId ${auctionId}`);
      return null;
    }

    return componentProps;

  } catch (error) {
    console.error(`Fel vid fetch för auctionId ${auctionId}:`, error);
    return null;
  }
}

async function fetchAllAuctions() {
  const auctionsList = await fetch(AUCTIONS_URL).then(res => res.json());
  console.log(`Antal auktioner: ${auctionsList.length}`);

  const results = [];

  for (const auction of auctionsList) {
    console.log(`🔹 Hämtar detaljer för auction id: ${auction.id}`);
    const details = await fetchAuctionDetails(auction.id);
    if (details) results.push(details);
  }

  console.log(`✅ Auktioner hämtade: ${results.length}`);
  return results;
}

// Kör
fetchAllAuctions().then(all => console.log('Klar!'));
