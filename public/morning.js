let futureTime = new Date();
futureTime.setHours(9);
futureTime.setMinutes(30);

// Convert milliseconds to seconds
let secondsToStart = Math.floor((futureTime - new Date()) / 1000);

if (secondsToStart > 0) {
  let timer = document.getElementById("qaTimer");
  timer.timerValue = secondsToStart;
  timer.start(secondsToStart);  
}

