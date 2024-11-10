const site = document.getElementById("site").innerHTML;

var courseData;
fetch(site + "/startRead")
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

function copy(str) {
  navigator.clipboard.writeText(str);
}

function setupForm() {
  const evalLink = `https://evaluation.qa.com/Login.aspx?course=${courseData.code}&pin=${courseData.pin}`;
  
  getElement("trainer").innerHTML = courseData.trainer;
  getElement("course_title").innerHTML = courseData.course_title;
  getElement("material").href = courseData.material;

  // setup combobox
  const cboValues = [
    { title: "Select an item", msg: "", timer: 0 },
    { title: "Finish lab", msg: "Please put a ✔ when you have completed the lab", timer: -1},
    { title: "ready to start", msg: "Please put a ✔ when you are ready to start 🏍", timer: -1},
    { title: "Coffee", msg: "Let's take a 15 minutes break ☕", timer: 15 },
    { title: "Lunch", msg: "Let's take 60 minutes for lunch 🍔", timer: 60 },
    { title: "mini break", msg: "Let's take a 5 minutes mini break ☕", timer: 5 },
    { title: "Comment", msg: "Please write comments about the course", link: `${site}/comments`, timer: -1},
    { title: "Evaluation", msg: "Please complete the course evaluation", link: evalLink, timer: -1}
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
    if (cboValues[i].link) window.open(cboValues[i].link, "_blank");

    var cboTime = cboValues[i].timer;
    if (cboTime == -1) return;

    if (cboTime == 0) {
      stopTimer();
      getElement("divTimer").innerHTML = "";
      setMessage("");
    } else {
      getElement("timer").value = cboTime;
      startTimer("timer", "divTimer");
    }
  });
// End of setting up combobox --------------------------------------------- 
  
  courseData.students = ["Trainer, Trainer", ...courseData.students]
  console.log(courseData.students);
  courseData.students.forEach((stu, i) => {
    if(stu.length !== 0){
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

  document.querySelectorAll("input").forEach((txt) =>
    txt.addEventListener("click", (event) => {
      event.target.select();
      navigator.clipboard.writeText(event.target.value);
      event.target.setAttribute("readonly", "true");
    })
  );
}

function afa() {
  copy(courseData.webex_email);
}

function getElement(id) {
  return document.getElementById(id);
}
//========================Timer and messages==============================
var myTimer = null;
function stopTimer() {
  if (myTimer !== null) clearInterval(myTimer);
}
function startTimer(timerName, divCountdown) {
  let mins = parseInt(getElement(timerName).value);
  console.log(mins);
  if (mins < 0) return;

  stopTimer();
  setMessage("");

  let seconds = mins * 60;

  myTimer = setInterval(function () {
    var minutes = (seconds / 60) | 0;

    if (seconds < 0) {
      stopTimer();
      setMessage(mins + " minutes passed. Ended at " + getTime());
      new Audio(courseData.audio).play();
      return;
    }
    getElement(divCountdown).innerHTML =
      minutes + ":" + (seconds - minutes * 60);
    seconds--;
  }, 1000);
}

function setMessage(msg) {
  document.getElementById("message").innerHTML = msg;
}

function getTime() {
  var today = new Date();
  return today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
}
