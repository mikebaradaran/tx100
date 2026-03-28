// server.js
// const commonData = require("./common.js");
// const commentJS = require("./comments.js");
const serverUtils = require("./serverUtils.js");
const path = require("path");

const fs = require("fs");
const cors = require("cors");
const express = require("express");

const { MongoClient } = require("mongodb");
const { start } = require("repl");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");

// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static("public"));

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// ========================
// MongoDB setup
// ========================
const username = "mikeb";
const password = "Password123";
const dbName = "test";
const mongoUri = `mongodb+srv://${username}:${password}@cluster0.smk7bk1.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri);
let collection;

async function initDB() {
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection("startData");
}
// initDB();
// let startData = await collection.find({}).toArray();

(async () => {
  await initDB();
  startData = await collection.find({}).toArray();
  startData = startData[0]; // get the first document
})();


// Middleware to make common data accessible in all views
// app.use((req, res, next) => {
//   res.locals.commonData = commonData;
//   next();
// });
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var messages = [];

// Define routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/startData", (req, res) => {
  res.send(startData);
});

[
  "game",
  "morning",
  "student",
  "help",
  "timer",
  "chat",
  "start"
].forEach(route => {
  app.get(`/${route}`, (req, res) => res.render(route));
});

app.post("/start/submit", (req, res) => {
  startData = serverUtils.initApp(req);
  saveAll(res);
});

app.get('/start/edit', async (req, res) => {
  startData = await collection.find({}).toArray();
  const obj = {
    data: startData[0]
  };
  res.render('startedit', obj);
});

app.get("/chat/student", (req, res) => {
  res.render("chat_message_entry");
});
app.get("/chat/trainer", (req, res) => {
  res.render("chat_messages");
});
app.get("/chat/admin", (req, res) => {
  res.render("admin");
});

app.get("/chat/clear", (req, res) => {
  doTrainerCommand({ name: "trainer", body: "clear" });
  res.render("index");
});

app.get("/customers", function (req, res) {
  res.send(serverUtils.getCustomers());
});

app.get("/customers/:id", function (req, res) {
  let id = req.params.id;
  var customers = serverUtils.getCustomers();
  var data = customers.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});

app.get("/orders", function (req, res) {
  res.send(serverUtils.getOrders());
});

app.get("/products", function (req, res) {
  res.send(serverUtils.getProducts());
});

app.get("/orders/:id", function (req, res) {
  let id = req.params.id;
  var orders = serverUtils.getOrders();
  var data = orders.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});

// --------------------- Drink server! -------------------
app.get('/server', (req, res) => {
  const drink = req.query.drink;
  const milk = req.query.milk;
  const sugar = req.query.sugar;
  res.send(`You ordered a ${drink} with milk: ${milk}, sugar: ${sugar}`);
});

app.post('/server', (req, res) => {
  const drink = req.body.drink;
  const milk = req.body.milk;
  const sugar = req.body.sugar;

  res.send(`POSTed: You ordered a ${drink} with milk: ${milk}, sugar: ${sugar}`);
});

// -------------------------------------------------------

function doTrainerCommand(data) {
  if (data.body == "delete") {
    messages = [];
    console.log("deleted messages!")
  }
  else if (data.body == "clear") {
    messages.forEach((m) => (m.body = ""));
  }
  else if (data.body.startsWith("deletename")) {
    // 11 is "deletename ".length
    const studentName = data.body.substring(11).toLowerCase();

    let index = messages.findIndex((m) => m.name.toLowerCase() == studentName);

    if (index != -1) messages.splice(index, 1);
  }
  saveMessageHistory();
}

function saveMessage(data) {
  const found = messages.find(
    (m) => m.name.toLowerCase() == data.name.toLowerCase()
  );

  if (found) found.body = data.body;
  else messages.push({ name: data.name, body: data.body });
  saveMessageHistory();
}

function saveMessageHistory() {
  // fs.writeFileSync(historyFile, JSON.stringify(messages, null, 2));
}

server.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is running!`);
  }
);
//--------------------------------------
// server.listen(
//   { port: 3000, host: "0.0.0.0" },
//   function (err, address) {
//     if (err) {
//       console.error(err);
//       process.exit(1);
//     }
//     console.log(`Your app is running!`);
//   }
// );

io.on("connection", (socket) => {
  socket.on("message", (data) => {
    if (data.name.toLowerCase() == "trainer") {
      doTrainerCommand(data);
    } else {
      saveMessage(data);
    }

    io.sockets.emit("message", messages);
  });
});

// ========================
// MongoDB code
// ========================

async function saveAll(res) {
  try {
    await collection.deleteMany({}); // clear old messages
    await collection.insertOne(startData); // save current chat array
    res.send({ success: true, saved: startData });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving chats");
  }
}

// Save  array to MongoDB
app.get("/save", async (req, res) => {
  saveAll(res);
});

// Read from MongoDB
app.get("/start/read", async (req, res) => {
  try {
    const x = await collection.find({}).toArray();
    res.send(x[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error reading data");
  }
});

