// const site = getElement("site").innerHTML;

fetch("/start/Read")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    setupForm(data);
  })
  .catch(function (error) {
    alert(error);
  });

var courseData;

function setupForm(data) {
  courseData = data;
  const evalLink = `https://evaluation.qa.com/Login.aspx?course=${courseData.code}&pin=${courseData.pin}`;

  getElement("qaTimer").sound = courseData.audio;
  getElement("course_title").innerHTML = `${courseData.course_title} <div id='trainer'> ${courseData.trainer} - ${courseData.courseDuration} days</div>`;
  getElement("material").href = courseData.material;

  // setup combobox
  cboMessages.addEventListener("change", cboMessage_onchange);

  function cboMessage_onchange() {
    const qaTimer = getElement("qaTimer");
    const cboMessages = getElement("cboMessages");
    const txtArea = getElement("txtArea");

    const selectedOption = cboMessages.options[cboMessages.selectedIndex];
    const link = selectedOption.getAttribute('link');
    const timerValue = selectedOption.getAttribute('timer');

    const afa = selectedOption.getAttribute('afa');
    if (afa) {
      copy(courseData.webex_email);
      return;
    }
    txtArea.value = selectedOption.getAttribute('msg');

    if (timerValue) {
      // qaTimer.innerText = parseInt(timerValue, 10) * 60;
      if (timerValue == 0) {
        qaTimer.stopTimer();
        qaTimer.message = "";
      } else {
        qaTimer.timerValue = timerValue * 60;
        qaTimer.startTimer();
      }
    }
    if (link) {
      if (link === "evaluation") {
        window.open(evalLink, "_blank");
      }
    }
  }
  // End of setting up combobox ---------------------------------------------


  if (courseData.password1.length < 2)
    document.getElementsByName("passwords")[0].style.visibility = "hidden";
  if (courseData.password2.length < 2)
    document.getElementsByName("passwords")[1].style.visibility = "hidden";
  if (courseData.mimeo.length < 2)
    getElement("mimeo").style.visibility = "hidden";


  courseData.students = ["Trainer", ...courseData.students];
  courseData.students.forEach((stu, i) => {
    if (stu.length !== 0) {
      var ol = getElement("pcs");
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = courseData.pcs[i];
      a.target = "_blank";
      a.innerHTML = stu; //.split(",")[1];
      li.appendChild(a);
      ol.appendChild(li);
    }
  });
}

function copy(str) {
  navigator.clipboard.writeText(str);
}

function getElement(id) {
  return document.getElementById(id);
}

function mimeo() {
  copy(courseData.mimeo);
  window.open("https://mimeo.digital/QALtd/distributions", "_blank");
}
