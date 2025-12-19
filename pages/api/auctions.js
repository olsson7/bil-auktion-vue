export default async function handler(req, res) {
  const url = process.env.AUCTIONS_URL

  if (!url) {
    return res.status(500).json({ error: "AUCTIONS_URL saknas" })
  }

  const response = await fetch(url)
  const data = await response.json()

  res.status(200).json(data)
}