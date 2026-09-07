// server.js
const customers = require("./public/customers.json");
const orders = require("./public/orders.json");
const products = require("./public/products.json");

const serverUtils = require("./serverUtils.js");
const cors = require("cors");
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors({ origin: "*" }));

// ========================
// MongoDB setup
// ========================
const username = "mikeb";
const password = "Password123";
const dbName = "test";
const mongoUri = `mongodb+srv://${username}:${password}@cluster0.smk7bk1.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(mongoUri);
let collection;
let startData = {};   // always an object


// ========================
// Routes
// ========================


app.get("/", (req, res) => {
  res.render("index");
});

app.get("/startData", (req, res) => {
  res.send(startData);
});

["game", "morning", "help", "timer"].forEach(route => {
  app.get(`/${route}`, (req, res) => res.render(route));
});

// ========================
// Start course data
// ========================
app.post("/start/submit", async (req, res) => {
  startData = serverUtils.initApp(req);
  await saveAll(res);
});

app.get("/start", async (req, res) => {
  res.render("start");
});

app.get("/start/edit", async (req, res) => {
  const docs = await collection.find({}).toArray();
  const data = docs[0] || {};
  res.render("startedit", { data });
});

app.get("/start/read", async (req, res) => {
  try {
    const docs = await collection.find({}).toArray();
    res.send(docs[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reading data");
  }
});

// ========================
// APIs
// ========================
app.get("/customers", (req, res) => res.send(customers));
app.get("/orders", (req, res) => res.send(orders));
app.get("/products", (req, res) => res.send(products));

app.get("/orders/:id", (req, res) => {
  const id = req.params.id.toLowerCase();
  res.send(orders.filter(o => o.CustomerID.toLowerCase() === id));
});

app.get("/customers/:id", (req, res) => {
  const id = req.params.id.toLowerCase();
  res.send(customers.filter(o => o.CustomerID.toLowerCase() === id));
});

// ========================
// Chat logic
// ========================
let messages = [];

function doTrainerCommand(data) {
  if (data.body === "delete") {
    messages = [];
  } else if (data.body === "clear") {
    messages.forEach(m => (m.body = ""));
  } else if (data.body.startsWith("deletename")) {
    const studentName = data.body.substring(11).toLowerCase();
    const index = messages.findIndex(m => m.name.toLowerCase() === studentName);
    if (index !== -1) messages.splice(index, 1);
  }
}

function saveMessage(data) {
  const found = messages.find(m => m.name.toLowerCase() === data.name.toLowerCase());
  if (found) found.body = data.body;
  else messages.push({ name: data.name, body: data.body });
}

io.on("connection", socket => {
  socket.on("message", data => {
    if (data.name.toLowerCase() === "trainer") {
      doTrainerCommand(data);
    } else {
      saveMessage(data);
    }
    io.sockets.emit("message", messages);
  });

  socket.on("offer", data => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", data => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice", data => {
    socket.broadcast.emit("ice", data);
  });
});

// ========================
// MongoDB save
// ========================
async function saveAll(res) {
  try {
    if (!startData || Object.keys(startData).length === 0) {
      return res.status(400).send("startData is empty");
    }

    await collection.deleteMany({});
    await collection.insertOne(startData);

    res.send({ success: true, saved: startData });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving chats");
  }
}

// ========================
// Message dialogs
// ========================
app.get('/chat/student', (req, res) => {
  res.render('chat_message_entry');
});
app.get('/chat/trainer', (req, res) => {
  res.render('chat_messages');
});
app.get('/chat', (req, res) => {
  res.render('chat');
});
app.get('/chat/admin', (req, res) => {
  res.render('chat_admin');
});

app.get('/keepalive', (req, res) => {
  res.render('keepalive');
});

// ========================
// Load DB BEFORE starting server
// ========================
async function initDB() {
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection("startData");

  const docs = await collection.find({}).toArray();
  startData = docs[0] || {};   // ensure object
  console.log("MongoDB ready, startData loaded");
}

// ========================
// Start server AFTER DB ready
// ========================
async function startServer() {
  await initDB();

  server.listen(
    { port: process.env.PORT || 3000, host: "0.0.0.0" },
    () => console.log("Your app is running!")
  );
}

startServer();
