// server.js
// const commonData = require("./common.js");
// const commentJS = require("./comments.js");

// const chatRoutes = require("./routes/chat");
// const dataApiRoutes = require("./routes/dataApi");
// const drinkRoutes = require("./routes/drinks");
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

// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static("public"));
// app.use("/chat", chatRoutes({ doTrainerCommand }));
// app.use("/api", dataApiRoutes(serverUtils));
// app.use("/server", drinkRoutes());

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});


// ========================
// MongoDB setup
// ========================
const username = "mikeb";
const password = "Password123";
const dbName = "test";
const mongoUri = `mongodb+srv://${username}:${password}@cluster0.smk7bk1.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri);
let collection;
let startData = {};

(async () => {
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection("startData");

  const docs = await collection.find({}).toArray();
  startData = docs[0];
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
  "help",
  "timer"
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


//---------------------------------------
app.get('/customers', (req, res) => {
  res.send(customers);
});
app.get('/orders', (req, res) => {
  res.send(orders);
});
app.get('/products', (req, res) => {
  res.send(products);
});

//-----------------------------------------------
app.get('/chat/student', (req, res) => {
  res.render('chat_message_entry');
});
app.get('/chat/trainer', (req, res) => {
  res.render('chat_messages');
});

app.get('/chat/admin', (req, res) => {
  res.render('admin');
});
//----------------------------------------------
app.get("/orders/:id", (req, res) => {
  const id = req.params.id.toLowerCase();
  const data = orders.filter(
    o => o.CustomerID.toLowerCase() === id
  );
  res.send(data);
});
app.get("/customers/:id", (req, res) => {
  const id = req.params.id.toLowerCase();
  const data = customers.filter(
    o => o.CustomerID.toLowerCase() === id
  );
  res.send(data);
});
//---------------------------------------
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
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is running!`);
  }
);

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
// app.get("/save", async (req, res) => {
//   saveAll(res);
// });

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

