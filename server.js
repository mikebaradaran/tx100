// server.js
const commentJS = require("./comments.js");
const commonData = require("./common.js");
const serverUtils = require("./serverUtils.js");
const courseData = require("./data.json");

const path = require("path");

const fs = require("fs");
const cors = require("cors");
const express = require("express");

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

// Middleware to make common data accessible in all views
app.use((req, res, next) => {
  res.locals.commonData = commonData;
  next();
});
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var messages = [];
const historyFile = path.join(__dirname, "chatHistory.json");

if (fs.existsSync(historyFile)) {
  try {
    const data = fs.readFileSync(historyFile, "utf-8");
    messages = JSON.parse(data);
  } catch (error) {
    console.error("Error reading chat history file:", error);
  }
}

// Define routes
app.get("/", (req, res) => {
  res.render("index",{courseData});
});

app.get("/morning", (req, res) => {
  res.render("morning");
});

app.get("/student", (req, res) => {
  res.render("studentView",{courseData});
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/start", (req, res) => {
  res.render("start");
});
app.post("/startSubmit", (req, res) => {
  serverUtils.initApp(req, res, fs);
});

app.get("/start/Read", (req, res) => {
  let data = fs.readFileSync("data.json", "utf8");
  res.send(JSON.parse(data));
});

app.get('/start/edit', (req, res) => {
  const obj = {
    data: JSON.parse(fs.readFileSync("data.json", "utf8"))
  };
  res.render('startedit', obj);
});

app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/timer", (req, res) => {
  res.render("timer");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/getpcs", (req, res) => {
  res.render("getpcs");
});


app.get("/chat", (req, res) => {
  res.render("chat");
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

app.get("/comments", (req, res) => {
  res.render("comments");
});

app.get("/comments/Read", (req, res) => {
  res.send(fs.readFileSync("comments.txt", "utf8"));
});

app.get("/comments/Delete", (req, res) => {
  commentJS.deleteComments(fs);
  res.send("File deleted");
});

app.get("/comments/Read/names", (req, res) => {
  res.send(commentJS.getNames(fs));
});

// Handle the comment's form submission
app.post("/commentsSave", (req, res) => {
  commentJS.saveComments(req, fs);
  res.send("Thank you 👍 Your comments are save.");
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

app.get("/orders/:id", function (req, res) {
  let id = req.params.id;
  var orders = serverUtils.getOrders();
  var data = orders.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});

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

function saveMessageHistory(){
  fs.writeFileSync(historyFile, JSON.stringify(messages, null, 2));
  console.log("saveMessageHistory() called! " + historyFile)
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
