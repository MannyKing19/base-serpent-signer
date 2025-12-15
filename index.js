const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

// ✅ Persistent CORS configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
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
  res.send("Base Serpent Signer Server running successfully with CO
