// server.js
const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let policies = [];

// Load CSV data into memory
fs.createReadStream("insurance_policies_with_claim_success.csv")
  .pipe(csv())
  .on("data", (row) => {
    policies.push(row);
  })
  .on("end", () => {
    console.log("✅ CSV file successfully loaded with", policies.length, "records");
  });

// Default route
app.get("/", (req, res) => {
  res.send("🚀 SafeSync Backend API is running");
});

// Get all policies
app.get("/policies", (req, res) => {
  res.json(policies);
});

// Get a single policy by Policy_No
app.get("/policy/:id", (req, res) => {
  const policy = policies.find((p) => p.Policy_No === req.params.id);
  if (policy) {
    res.json(policy);
  } else {
    res.status(404).json({ message: "Policy not found" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
