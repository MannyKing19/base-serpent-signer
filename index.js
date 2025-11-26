import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

// simple home route
app.get("/", (req, res) => {
  res.send("Base Serpent Signer Server running successfully!");
});

// sign XP verification payload
app.post("/sign-xp", (req, res) => {
  try {
    const { player, xp, timestamp } = req.body;
    if (!player || !xp || !timestamp || !SIGNER_PRIVATE_KEY)
      return res.status(400).send("Missing data");

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

app.listen(PORT, () => console.log(`✅ Signer server listening on port ${PORT}`));
