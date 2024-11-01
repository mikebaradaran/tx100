// server.js
var customers = require("./customers.json");
var orders = require("./orders.json");
const commentJS = require("./comments.js");

const commonData = require("./common.js");

const fs = require("fs");
const cors = require("cors");
// const path = require('path');
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

// Define routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/start", (req, res) => {
  res.render("txStart");
});
app.post("/startSubmit", (req, res) => {
  initApp(req,res);
});

app.get("/startRead", (req, res) => {
  let data = fs.readFileSync("data.json", "utf8");
  data = JSON.parse(data);
  data.pcs = data.pcs;
  data.students = data.students.replace("(REQS)", '');
  data.students = data.students.replace("\t", '');
  data.pcs = data.pcs.split("\n");
  data.students = data.students.split("\n");
  res.send(data);
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
  // res.end();
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

// Handle form submission for comments
app.post("/commentsSave", (req, res) => {
  commentJS.saveComments(req, fs);
  res.send("Thank you 👍 Your comments are save.");
});

app.get("/customers", function (req, res) {
  res.send(customers);
});

app.get("/customers/:id", function (req, res) {
  let id = req.params.id;
  var data = customers.filter(
    (c) => c.CustomerID.toLowerCase() == id.toLowerCase()
  );
  res.send(data);
});

app.get("/orders", function (req, res) {
  res.send(orders);
});

app.get("/orders/:id", function (req, res) {
  let id = req.params.id;
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

//------------------------------------------------------------
function initApp(req,res){
   var  {
    audio,
    trainer,
    course_title,
    code,
    pin,
    webex_email,
    material,
    mimeo,
    pcs,
    password1,
    password2,
    password3,
    password4,
    students,
  } = req.body;
  
  pcs = pcs.replace(/\r/g, ''); 
  students = students.replace(/\r/g, ''); 
  students = students.replace(/\t/g, ''); 
  
  const formData = {
    audio:audio,
    trainer: trainer,
    course_title: course_title,
    code: code,
    pin: pin,
    webex_email: webex_email,
    material: material,
    mimeo: mimeo,
    pcs: pcs,
    password1: password1,
    password2: password2,
    password3: password3,
    students: students
  };

  fs.writeFile("data.json", JSON.stringify(formData, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      res.status(500).send("Error saving data");
    } else {
      console.log("Data saved successfully.");
      res.render("index");
    }
  });
}
var messages = [];

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
}

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
