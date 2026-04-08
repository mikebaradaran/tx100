// -------------------------------
// Helpers
// -------------------------------
const cleanLines = (input = "", { removeTabs = false, removeReqs = false } = {}) => {
  let result = input.replace(/\r/g, "");

  if (removeTabs) result = result.replace(/\t/g, "");
  if (removeReqs) result = result.replace(/\(REQS\)/g, "");

  return result
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
};

const extractStudentNames = (students = "") => {
  return cleanLines(students, { removeTabs: true, removeReqs: true })
    .map(line => {
      const parts = line.split(",");
      return (parts[1] || parts[0]).trim();
    });
};

// -------------------------------
// Main function
// -------------------------------
function initApp(req) {
  const {
    audio,
    trainer,
    course_title,
    code,
    pin,
    webex_email,
    material,
    mimeo,
    pcs = "",
    password1,
    password2,
    password3,
    students = "",
    courseDuration
  } = req.body || {};

  return {
    audio,
    trainer,
    course_title,
    code,
    pin,
    webex_email,
    material,
    mimeo,
    pcs: cleanLines(pcs),
    password1,
    password2,
    password3,
    students: extractStudentNames(students),
    courseDuration
  };
}

// -------------------------------
// Lazy JSON loader
// -------------------------------
const cache = {};

const loadJson = (file) => {
  if (!cache[file]) {
    cache[file] = require(file);
  }
  return cache[file];
};

const getCustomers = () => loadJson("./customers.json");
const getOrders = () => loadJson("./orders.json");
const getProducts = () => loadJson("./products.json");

// -------------------------------
module.exports = {
  initApp,
  getCustomers,
  getOrders,
  getProducts
};