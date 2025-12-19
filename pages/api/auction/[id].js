export default async function handler(req, res) {
  const { id } = req.query

  try {
    const template = process.env.CAR_DETAIL_URL
    if (!template) {
      return res.status(500).json({ error: "CAR_DETAIL_URL saknas" })
    }

    // Sätt in auction id i URL
    const url = template.replace(/%d/g, id)

    const response = await fetch(url)
    const data = await response.json()

    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to fetch auction" })
  }
}
