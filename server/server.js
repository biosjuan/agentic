const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 9000;
const AGENTS_FILE = path.join(__dirname, "agents.json");
const CONNECTORS_FILE = path.join(__dirname, "connectors.json");
const TIMEOUT = 1000;

app.use(bodyParser.json());
app.use(cors());

// Helper functions to read/write JSON files
const readData = (file) => {
  if (!fs.existsSync(file)) {
    return [];
  }
  const data = fs.readFileSync(file);
  return JSON.parse(data);
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Routes for agents
app.get("/agents", (req, res) => {
  const agents = readData(AGENTS_FILE);
  setTimeout(() => {
    res.json(agents);
  }, TIMEOUT);
});

app.post("/agents", (req, res) => {
  const agents = readData(AGENTS_FILE);
  const newAgent = req.body;
  agents.push(newAgent);
  writeData(AGENTS_FILE, agents);
  setTimeout(() => {
    res.status(201).json(newAgent);
  }, TIMEOUT);
});

app.put("/agents", (req, res) => {
  const newAgents = req.body;
  writeData(AGENTS_FILE, newAgents);
  setTimeout(() => {
    res.status(200).json(newAgents);
  }, TIMEOUT);
});

app.put("/agents/:id", (req, res) => {
  const agents = readData(AGENTS_FILE);
  const agentId = req.params.id;
  const updatedAgent = req.body;
  const index = agents.findIndex((agent) => agent.id === agentId);
  if (index !== -1) {
    agents[index] = updatedAgent;
    writeData(AGENTS_FILE, agents);
    setTimeout(() => {
      res.json(updatedAgent);
    }, TIMEOUT);
  } else {
    setTimeout(() => {
      res.status(404).json({ message: "Agent not found" });
    }, TIMEOUT);
  }
});

app.delete("/agents/:id", (req, res) => {
  const agents = readData(AGENTS_FILE);
  const agentId = req.params.id;
  const updatedAgents = agents.filter((agent) => agent.id !== agentId);
  writeData(AGENTS_FILE, updatedAgents);
  setTimeout(() => {
    res.status(204).end();
  }, TIMEOUT);
});

// Routes for connectors
app.get("/connectors", (req, res) => {
  const connectors = readData(CONNECTORS_FILE);
  setTimeout(() => {
    res.json(connectors);
  }, TIMEOUT);
});

app.put("/connectors", (req, res) => {
  const connectors = req.body;
  writeData(CONNECTORS_FILE, connectors);
  setTimeout(() => {
    res.status(200).json(connectors);
  }, TIMEOUT);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
