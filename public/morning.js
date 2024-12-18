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

function setupForm(courseData) {
  const evalLink = `https://evaluation.qa.com/Login.aspx?course=${courseData.code}&pin=${courseData.pin}`;

  getElement("qaTimer").sound = courseData.audio;
  getElement("trainer").innerHTML = courseData.trainer;
  getElement("course_title").innerHTML = courseData.course_title;

  courseData.students.forEach((stu, i) => {
    if (stu.length !== 0) {
      var ol = getElement("pcs");
      var li = document.createElement("li");
      li.innerText = stu;
      ol.appendChild(li);
    }
  });
}

function getElement(id) {
  return document.getElementById(id);
}

let futureTime = new Date();
futureTime.setHours(9);
futureTime.setMinutes(30);

// Convert milliseconds to seconds
let secondsToStart = Math.floor((futureTime - new Date()) / 1000);

if (secondsToStart > 0) {
  let timer = document.getElementById("qaTimer");
  timer.timerValue = secondsToStart;
  timer.startTimer();
}
document.getElementById("txtArea").value =
  "We'll be starting class at 9:30.\nPlease make sure you're ready on time";
