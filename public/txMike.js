const site = document.getElementById("site").innerHTML;
const txMikeClear = `${site}/clear`;
const commentsUrl = `${site}/comments`;
var audioFile =
  "https://cdn.glitch.global/7ea2c2b4-d4b6-41d3-afca-c4c259b797be/Alarm01.wav?v=1685964726574";
const afaPath =
  "https://qa-learning.webex.com/webappng/sites/qa-learning/dashboard?siteurl=qa-learning";

var courseData;
fetch(site + "/startRead")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    setupForm(data);
  })
  .catch(function (error) {
    alert(error);
  });

function setupForm(data) {
  courseData = data;
  const evalLink = `https://evaluation.qa.com/Login.aspx?course=${courseData.code}&pin=${courseData.pin}`;
  audioFile = data.audio;
  getElement("trainerEmail").innerHTML = courseData.trainer;
  getElement("courseTitle").innerHTML = courseData.course_title;
  getElement("email").value = courseData.password1;
  getElement("password1").value = courseData.password2;
  getElement("password2").value = courseData.password3;
  getElement("courseMaterial").href = courseData.material;
  getElement("mimeo").value = courseData.mimeo;

  // setup combobox
  const cboValues = [
    { title: "Select an item", msg: "", timer: 0 },
    {
      title: "Finish lab",
      msg: "Please put a ✔ when you have completed the lab",
      timer: -1,
    },
    {
      title: "ready to start",
      msg: "Please put a ✔ when you are ready to start 🏍",
      timer: -1,
    },
    { title: "Coffee", msg: "Let's take a 15 minutes break ☕", timer: 15 },
    { title: "Lunch", msg: "Let's take 60 minutes for lunch 🍔", timer: 60 },
    {
      title: "Comment",
      msg: "Please write comments about the course",
      link: commentsUrl,
      timer: -1,
    },
    {
      title: "Evaluation",
      msg: "Please complete the course evaluation",
      link: evalLink,
      timer: -1,
    },
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
      //window.setTimerValue(cboTime);
    }
  });

  courseData.students.forEach((stu, i) => {
    var ol = getElement("pcs");
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = courseData.pcs[i];
    a.target = "_blank";
    a.innerHTML = stu.split(",")[1];
    li.appendChild(a);
    ol.appendChild(li);
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
  navigator.clipboard
    .writeText(courseData.webex_email)
    .then(() => {
      //window.open(afaPath, "_blank");
    })
    .catch((error) => {
      alert(`Copy failed! ${error}`);
    });
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
      new Audio(audioFile).play();
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
