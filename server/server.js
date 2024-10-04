const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 9000;
const AGENTS_FILE = path.join(__dirname, "agents.json");
const TIMEOUT = 1000;

app.use(bodyParser.json());
app.use(cors());

// Helper function to read agents from the JSON file
const readAgents = () => {
  if (!fs.existsSync(AGENTS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(AGENTS_FILE);
  return JSON.parse(data);
};

// Helper function to write agents to the JSON file
const writeAgents = (agents) => {
  fs.writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 2));
};

// Get all agents
app.get("/agents", (req, res) => {
  const agents = readAgents();
  setTimeout(() => {
    res.json(agents);
  }, TIMEOUT);
});

// Add a new agent
app.post("/agents", (req, res) => {
  const agents = readAgents();
  const newAgent = req.body;
  agents.push(newAgent);
  writeAgents(agents);
  setTimeout(() => {
    res.status(201).json(newAgent);
  }, TIMEOUT);
});

// Update an agent
app.put("/agents/:id", (req, res) => {
  const agents = readAgents();
  const agentId = req.params.id;
  const updatedAgent = req.body;
  const index = agents.findIndex((agent) => agent.id === agentId);
  if (index !== -1) {
    agents[index] = updatedAgent;
    writeAgents(agents);
    setTimeout(() => {
      res.json(updatedAgent);
    }, TIMEOUT);
  } else {
    setTimeout(() => {
      res.status(404).json({ message: "Agent not found" });
    }, TIMEOUT);
  }
});

// Delete an agent
app.delete("/agents/:id", (req, res) => {
  const agents = readAgents();
  const agentId = req.params.id;
  const updatedAgents = agents.filter((agent) => agent.id !== agentId);
  writeAgents(updatedAgents);
  setTimeout(() => {
    res.status(204).end();
  }, TIMEOUT);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
