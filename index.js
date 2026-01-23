import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

// Create wallet for signing
const wallet = new ethers.Wallet(SIGNER_PRIVATE_KEY);

// ✅ Robust CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ Handle preflight OPTIONS requests
app.options("*", cors());

app.use(express.json());

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ status: "ok" });
});

// ✅ Version endpoint
app.get("/version", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ version: "1.0.0" });
});

// ✅ Base route
app.get("/", (req, res) => {
  res.send("Base Serpent Signer Server running successfully with robust CORS and JSON headers!");
});

// ✅ XP signing endpoint
app.post("/sign-xp", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");
    const { player, xp, timestamp } = req.body;
    if (!player || !xp || !timestamp || !SIGNER_PRIVATE_KEY) {
      return res.status(400).json({ error: "Missing data" });
    }

    const payload = `${player}:${xp}:${timestamp}`;
    const signature = ethers.utils.hexlify(
      ethers.utils.sha256(ethers.utils.toUtf8Bytes(payload))
    );

    res.json({ signature });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error signing XP data" });
  }
});

// ✅ Mint signature endpoint using EIP-712
app.post("/requestSignature", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const address = req.body.address || req.body.player;
    const nonce = req.body.nonce;

    console.log("Incoming /requestSignature body:", req.body);

    if (!address || !nonce || !SIGNER_PRIVATE_KEY) {
      return res.status(400).json({ error: "Missing data" });
    }

    // EIP-712 Domain
    const domain = {
      name: "Base Serpent",
      version: "1",
      chainId: 8453,
      verifyingContract: "0x1e4c6aA2f17f593b0843b2Ad93ec9520a596C910",
    };

    // Types for EIP-712
    const types = {
      Mint: [
        { name: "to", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    };

    // Value to sign
    const value = {
      to: address,
      nonce: nonce,
    };

    // Sign typed data
    const signature = await wallet._signTypedData(domain, types, value);

    const expiresAt = Date.now() + 10 * 60 * 1000; // 10-minute expiry
    console.log(`✅ Signature response sent: ${address}`);

    res.json({ signature, nonce, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating signature" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Signer server listening on port ${PORT}`);
});
