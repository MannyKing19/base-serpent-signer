import express from "express";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

// ✅ Persistent CORS configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(cors());
app.use(express.json());

// ✅ Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ✅ Version endpoint
app.get("/version", (req, res) => res.json({ version: "1.0.0" }));

// ✅ Base route
app.get("/", (req, res) => {
  res.send("Base Serpent Signer Server running successfully with CORS enabled!");
});

// ✅ XP signing endpoint
app.post("/sign-xp", (req, res) => {
  try {
    const { player, xp, timestamp } = req.body;
    if (!player || !xp || !timestamp || !SIGNER_PRIVATE_KEY) {
      return res.status(400).send("Missing data");
    }

    const payload = `${player}:${xp}:${timestamp}`;
    const signature = crypto
      .createHmac("sha256", SIGNER_PRIVATE_KEY)
      .update(payload)
      .digest("hex");

    res.json({ signature });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error signing XP data");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Signer server listening on port ${PORT}`);
});
