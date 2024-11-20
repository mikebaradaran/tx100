class QA_Timer extends HTMLElement {
  constructor() {
    super();
    this.myInterval = null;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
        <link href="MyTimer.css" rel="stylesheet" />
          <span id="timerGoButton">▶️</span>
          <input id="timer" type="range" min="1" max="120"/>
          <span id="info"></span>
        </p>`;
  }
  timerGoButton_click() {
    let t = document.querySelector("#qaTimer");
    t.timerValue = t.timerValue * 60;
    t.startTimer();
  }
  connectedCallback() {
    const t = this.shadowRoot.querySelector("#timer");
    t.addEventListener("input", this.sliding.bind(this));
    const btnGo= this.shadowRoot.querySelector("#timerGoButton");
    btnGo.addEventListener("click", this.timerGoButton_click.bind(this));
  }

  sliding() {
    this.stopTimer();
    this.shadowRoot.querySelector("#info").innerHTML = this.timerValue;
  }

  set timerValue(seconds) {
    this.stopTimer();
    this.startMins = (seconds / 60) | 0;
    this.timer.value = this.startMins;
    this.seconds = seconds;
  }

  set sound(audioURL) {
    this.audio = audioURL;
  }

  get timerValue() {
    return this.timer.value;
  }

  get timer() {
    return this.shadowRoot.querySelector("#timer");
  }

  stopTimer() {
    if (this.myInterval !== null) clearInterval(this.myInterval);
  }

  set message(msg) {
    this.shadowRoot.querySelector("#info").innerHTML = msg;
  }

  displayTimerValue(secs) {
    this.timerValue = secs;
  }

  startTimer() {
    this.myInterval = setInterval(() => {
      var mins = (this.seconds / 60) | 0;

      if (this.seconds === 0) {
        this.stopTimer();
        this.message =
          this.startMins + " minutes passed. Ended at " + this.getTime();
        new Audio(this.audio).play();
        return;
      }
      this.message = mins + ":" + (this.seconds - mins * 60);
      this.seconds--;
    }, 1000);
  }

  getTime() {
    var today = new Date();
    return (
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    );
  }
}

// Define the tag
customElements.define("qa-timer", QA_Timer);
