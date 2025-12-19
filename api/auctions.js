export default async function handler(req, res) {
  const url = process.env.AUCTIONS_URL;
  if (!url) {
    console.error("AUCTIONS_URL saknas!");
    return res.status(500).json({ error: "AUCTIONS_URL saknas" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Fetch misslyckades:", response.status, response.statusText);
      return res.status(500).json({ error: "Kunde inte hämta data från AUCTIONS_URL" });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Exception i /api/auctions:", err);
    res.status(500).json({ error: "Exception vid hämtning av auktioner" });
  }
}
