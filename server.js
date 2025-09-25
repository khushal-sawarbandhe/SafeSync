// server.js
const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let policies = [];

// Load CSV with normalized keys & trimmed values
fs.createReadStream(path.join(__dirname, "insurance_policies_with_claim_success.csv"))
  .pipe(csv())
  .on("data", (row) => {
    const cleanRow = {};
    for (let key in row) {
      cleanRow[key.trim().replace(/\s+/g, "_")] = row[key].trim();
    }
    policies.push(cleanRow);
  })
  .on("end", () => {
    console.log("✅ CSV file loaded with", policies.length, "records");
  });

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "insurance_app.html"));
});

// Get all policies
app.get("/policies", (req, res) => {
  res.json(policies);
});

// Get a single policy (case-insensitive, flexible)
app.get("/policy/:id", (req, res) => {
  const id = req.params.id.trim();
  const policy = policies.find((p) => {
    const keys = Object.keys(p);
    const policyKey = keys.find(k => k.toLowerCase().includes("policy"));
    return policyKey && p[policyKey] === id;
  });

  if (policy) {
    res.json(policy);
  } else {
    res.status(404).json({ message: "Policy not found" });
  }
});

// Debug route (optional, to test on Render)
app.get("/debug", (req, res) => {
  res.json(policies.slice(0, 5));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
