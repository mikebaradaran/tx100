function initApp(req, res, fs) {
  var {
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
    courseDuration
  } = req.body;
  
  pcs = pcs.replace(/\r/g, "");
  pcs = pcs.split("\n");
  
  students = students.replace(/\r/g, "");
  students = students.replace(/\t/g, "");
  students = students.replace(new RegExp("\\(REQS\\)", 'g'), '');
  students = students.split("\n");
  for(var i = 0; i < students.length; i++)
    students[i] = students[i].split(",")[1];
  
  const formData = {
    audio: audio,
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
    students: students,
    courseDuration:courseDuration
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


module.exports = {
  initApp, getCustomers, getOrders
};