export default function handler(req, res) {
  res.status(200).json({ url: process.env.AUCTIONS_URL });
}