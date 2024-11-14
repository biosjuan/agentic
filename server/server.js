const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 9000;
const UPLOADS_DIR = path.join(__dirname, "uploads");
const AGENTS_FILE = path.join(__dirname, "agents.json");
const CONNECTORS_FILE = path.join(__dirname, "connectors.json");
const AGENTS_VIEWS_FILE = path.join(__dirname, "agents-view.json");
const CONNECTORS_VIEWS_FILE = path.join(__dirname, "connectors-view.json");
const TIMEOUT = 1000;

app.use(bodyParser.json());
app.use(cors());

// Configure multer for file uploads
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    cb(null, originalName);
  },
});

const upload = multer({ storage });

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

// Routes for agents views
app.get("/agents-views", (req, res) => {
  const agentsViews = readData(AGENTS_VIEWS_FILE);
  setTimeout(() => {
    res.json(agentsViews);
  }, TIMEOUT);
});

// Routes for connectors views
app.get("/connectors-views", (req, res) => {
  const connectors = readData(CONNECTORS_VIEWS_FILE);
  setTimeout(() => {
    res.json(connectors);
  }, TIMEOUT);
});

app.put("/connectors-views", (req, res) => {
  const connectors = req.body;
  writeData(CONNECTORS_VIEWS_FILE, connectors);

  setTimeout(() => {
    res.status(200).json(connectors);
  }, TIMEOUT);
});

// Route to upload files
app.post("/upload", upload.single("file"), (req, res) => {
  res.status(201).json({ filename: req.file.filename });
});

// Route to list uploaded files
app.get("/files", (req, res) => {
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Unable to list files" });
    }
    res.json(files);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
