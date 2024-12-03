// const site = getElement("site").innerHTML;

var courseData;
fetch("/startRead")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    courseData = data;
    setupForm();
  })
  .catch(function (error) {
    alert(error);
  });

function setupForm() {
  
  const evalLink = `https://evaluation.qa.com/Login.aspx?course=${courseData.code}&pin=${courseData.pin}`;
  let timer = getElement("qaTimer");

  timer.sound = courseData.audio;
  getElement("trainer").innerHTML = courseData.trainer;
  getElement("course_title").innerHTML = courseData.course_title;
  getElement("material").href = courseData.material;

  // setup combobox
  const cboValues = [
    { title: "Select an item", msg: "", timer: 0 },
    { title: "Finish lab",     msg: "Please put a ✔ when you have completed the lab", timer: -1 },
    { title: "ready to start", msg: "Please put a ✔ when you are ready to start 🏍", timer: -1  },
    { title: "Coffee", msg: "Let's take a 15 minutes break ☕", timer: 15 },
    { title: "Lunch", msg: "Let's take 60 minutes for lunch 🍔", timer: 60 },
    { title: "mini break", msg: "Let's take a 5 minutes mini break ☕", timer: 5 },
    { title: "Comment",    msg: "Please write comments about the course", link: `/comments`, timer: -1},
    { title: "Evaluation", msg: "Please complete the course evaluation",  link: evalLink, timer: -1 },
  ];

  var cboMessages = getElement("cboMessages");
  
  cboValues.forEach((x) => {
    var op = document.createElement("option");
    op.innerHTML = x.title;
    cboMessages.appendChild(op);
  });

  cboMessages.addEventListener("change", () => {
    let i = cboMessages.selectedIndex;
    getElement("txtArea").value = cboValues[i].msg;
    if (cboValues[i].link) 
      window.open(cboValues[i].link, "_blank");

    let duration = cboValues[i].timer;

    if (duration == -1)
      return;
    
    if (duration == 0) {
      timer.stopTimer();
      timer.message = "";
    } else {
      timer.timerValue = duration * 60;
      timer.startTimer();
    }
    
  });


  // End of setting up combobox ---------------------------------------------

  courseData.students = ["Trainer, Trainer", ...courseData.students];
  courseData.students.forEach((stu, i) => {
    if (stu.length !== 0) {
      var ol = getElement("pcs");
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = courseData.pcs[i];
      a.target = "_blank";
      a.innerHTML = stu.split(",")[1];
      li.appendChild(a);
      ol.appendChild(li);
    }
  });

}

function copy(str) {
  navigator.clipboard.writeText(str);
}

function afa() {
  copy(courseData.webex_email);
}

function getElement(id) {
  return document.getElementById(id);
}


