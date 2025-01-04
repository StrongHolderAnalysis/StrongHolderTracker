import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

const connection = new Connection(clusterApiUrl("mainnet-beta"));

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { contractAddress } = req.body;

    try {
      const tokenAddress = new PublicKey(contractAddress);
      const tokenMint = await getMint(connection, tokenAddress);

      const metadataPDA = await Metadata.getPDA(tokenAddress);
      const metadata = await Metadata.load(connection, metadataPDA);

      res.status(200).json({
        name: metadata.data.data.name.trim(),
        symbol: metadata.data.data.symbol.trim(),
        decimals: tokenMint.decimals,
        supply: tokenMint.supply.toString(),
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch token information." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
