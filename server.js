// server.js
const commentJS = require("./comments.js");
const commonData = require("./common.js");
const serverUtils = require("./serverUtils.js");
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
  res.render("index");
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/start", (req, res) => {
  res.render("start");
});
app.post("/startSubmit", (req, res) => {
  //delete require.cache[require.resolve('./data.json')];
  // delete data.json
  // try {
  //   fs.unlinkSync("./data.json");
  //   console.log("File deleted successfully");
  // } catch (err) {
  //   console.error("Error deleting the file:", err);
  // }
  serverUtils.initApp(req, res, fs);
});

app.get("/startRead", (req, res) => {
  let data = fs.readFileSync("data.json", "utf8");
  // res.send(serverUtils.processStartData(data));
  res.send(JSON.parse(data));
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

app.get("/all", (req, res) => {
  res.render("all");
});

app.get("/student", (req, res) => {
  res.render("student");
});
app.get("/trainer", (req, res) => {
  res.render("trainer");
});
app.get("/admin", (req, res) => {
  res.render("admin");
});
app.get("/clear", (req, res) => {
  doTrainerCommand({ name: "trainer", body: "clear" });
  res.render("index");
});
app.get("/comments", (req, res) => {
  res.render("comments");
});

app.get("/commentsRead", (req, res) => {
  res.send(fs.readFileSync("comments.txt", "utf8"));
});

app.get("/commentsDelete", (req, res) => {
  commentJS.deleteComments(fs);
  res.send("File deleted");
});

app.get("/commentsReadnames", (req, res) => {
  let names = fs.readFileSync("comments.txt", "utf8");
  let allNames = "";
  for (let name of names.split("--------------------------------")) {
    allNames += name.substring(0, 10);
  }
  res.send(allNames);
});

// Handle the comment's form submission
app.post("/commentsSave", (req, res) => {
  commentJS.saveComments(req, fs);
  res.send("Thank you 👍 Your comments are save.");
});

app.get("/customers", function (req, res) {
  res.send(getCustomers());
});

app.get("/customers/:id", function (req, res) {
  let id = req.params.id;
  var customers = getCustomers();
  var data = customers.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});
var orders = undefined;

app.get("/orders", function (req, res) {
  res.send(getOrders());
});

app.get("/orders/:id", function (req, res) {
  let id = req.params.id;
  var orders = getOrders();
  var data = orders.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});

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

function doTrainerCommand(data) {
  if (data.body == "delete") {
    messages = [];
    return;
  }
  if (data.body == "clear") {
    messages.forEach((m) => (m.body = ""));
    return;
  }
  if (data.body.startsWith("deletename")) {
    const studentName = data.body.substring(11).toLowerCase();

    let index = messages.findIndex((m) => m.name.toLowerCase() == studentName);

    if (index != -1) messages.splice(index, 1);
  }
}

function saveMessage(data) {
  const found = messages.find(
    (m) => m.name.toLowerCase() == data.name.toLowerCase()
  );

  if (found) found.body = data.body;
  else messages.push({ name: data.name, body: data.body });
    //~~~~~~~~~~~~~~~~~~~~~
  fs.writeFileSync(historyFile, JSON.stringify(messages, null, 2));
}
//-------------------------------
var customers = undefined;
var orders = undefined;
function getCustomers() {
  if (customers === undefined) customers = require("./customers.json");
  return customers;
}
function getOrders() {
  if (orders === undefined) orders = require("./orders.json");
  return orders;
}
//--------------------------------------

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

// process.on('SIGINT', () => {
//   const data = JSON.stringify(messages);
//   fs.writeFile("studentNames.txt", data, (err) => {});
//   server.close(() => {
//       console.log('Closed out remaining connections.');
//       process.exit(0);
//   });
// });
