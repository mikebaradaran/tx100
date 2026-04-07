// const site = getElement("site").innerHTML;

fetch("/startData")
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

  // getElement("qaTimer").sound = courseData.audio;
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
        qaTimer.start(qaTimer.timerValue);
      }
    }
    if (link) {
      if (link === "evaluation") {
        window.open(evalLink, "_blank");
      }
    }
  }
  // End of setting up combobox ---------------------------------------------

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
  
  hideUnusedFields();
}

function hideUnusedFields() {
  const fields = [
    { value: courseData.password1, el: document.getElementsByName("passwords")[0] },
    { value: courseData.password2, el: document.getElementsByName("passwords")[1] },
    { value: courseData.password3, el: document.getElementsByName("passwords")[2] },
    { value: courseData.mimeo, el: getElement("mimeo") }
  ];

  fields.forEach(({ value, el }) => {
    if (value.length < 2) el.style.visibility = "hidden";
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
