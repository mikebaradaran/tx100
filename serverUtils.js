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
  } = req.body;

  pcs = pcs.replace(/\r/g, "");
  students = students.replace(/\r/g, "");
  students = students.replace(/\t/g, "");

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

function processStartData(data){
  data = JSON.parse(data);
  data.pcs = data.pcs;
  data.students = data.students.replace("(REQS)", '');
  data.students = data.students.replace("\t", '');
  data.pcs = data.pcs.split("\n");
  data.students = data.students.split("\n");
  return data;
}

module.exports = {
  processStartData, initApp
};