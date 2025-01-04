import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("mainnet-beta"));

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { contractAddress } = req.body;

    try {
      const tokenAddress = new PublicKey(contractAddress);

      // Simula tiempos de hold
      const signatures = await connection.getSignaturesForAddress(tokenAddress, { limit: 100 });
      const holdTimes = signatures.map(() => Math.random() * 4 * 60);

      const categories = {
        "<15min": holdTimes.filter((t) => t < 15).length,
        "15min-1h": holdTimes.filter((t) => t >= 15 && t < 60).length,
        "1h-2h": holdTimes.filter((t) => t >= 60 && t < 120).length,
        ">2h": holdTimes.filter((t) => t >= 120).length,
      };

      const total = holdTimes.length;
      res.status(200).json({
        "<15min": ((categories["<15min"] / total) * 100).toFixed(2),
        "15min-1h": ((categories["15min-1h"] / total) * 100).toFixed(2),
        "1h-2h": ((categories["1h-2h"] / total) * 100).toFixed(2),
        ">2h": ((categories[">2h"] / total) * 100).toFixed(2),
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to analyze hold data." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
