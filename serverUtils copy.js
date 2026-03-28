function initApp(req) {
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

  students = students.map(student => {
    const parts = student.split(",");
    return parts[1].trim() + " " + parts[0].trim().substring(0, 2);
  });
 
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
    courseDuration: courseDuration
  };
  return formData;
}
//-------------------------------
var customers = undefined;
var orders = undefined;
var products = undefined;

function getCustomers() {
  if (customers === undefined) customers = require("./customers.json");
  return customers;
}
function getOrders() {
  if (orders === undefined) orders = require("./orders.json");
  return orders;
}

function getProducts() {
  if (products === undefined) products = require("./products.json");
  return products;
}


module.exports = {
  initApp, getCustomers, getOrders, getProducts
};
