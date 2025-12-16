import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

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
    res.setHeader("Content-Type", "application/json"); // Important for browser/frontend
    const { player, xp, timestamp } = req.body;
    if (!player || !xp || !timestamp || !SIGNER_PRIVATE_KEY) {
      return res.status(400).json({ error: "Missing data" });
    }

    const payload = `${player}:${xp}:${timestamp}`;
    const signature = crypto
      .createHmac("sha256", SIGNER_PRIVATE_KEY)
      .update(payload)
      .digest("hex");

    res.json({ signature });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error signing XP data" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Signer server listening on port ${PORT}`);
});
