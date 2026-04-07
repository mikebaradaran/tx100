class QA_Timer extends HTMLElement {
  constructor() {
    super();

    this.setupSpeech();
    this.msg = null;
    this.myInterval = null;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
        <link href="/MyTimer.css" rel="stylesheet" />
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
    this.timer.addEventListener("input", this.sliding.bind(this));
    const btnGo = this.shadowRoot.querySelector("#timerGoButton");
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
        //new Audio(this.audio).play();
        this.speak(this.message);
        return;
      }

      var hours = Math.floor(mins / 60);
      var minutes = mins % 60;
      hours = (hours > 0) ? hours + "h : " : "";

      this.message = hours + minutes + "m : " + (this.seconds - mins * 60);
      this.seconds--;
    }, 1000);
  }

  getTime() {
    var today = new Date();
    return (
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    );
  }

  //------------------------------------------------

  setupSpeech() {
    this.msg = new SpeechSynthesisUtterance();

    window.speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices();

      this.msg.voice = voices.find(voice =>
        voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("woman") ||
        voice.name.toLowerCase().includes("samantha") ||
        voice.name.toLowerCase().includes("Karen") ||
        voice.name.toLowerCase().includes("zira")
      );

      this.msg.pitch = 1.1;
      this.msg.rate = 0.9;
    };
  }

  speak(text) {
    return new Promise(resolve => {
      if (text === "end") {
        resolve();
        return;
      }
      this.msg.text = text;
      speechSynthesis.speak(this.msg);
      this.msg.onend = resolve;
    });
  }
  //------------------------------------------------
}

// Define the tag
customElements.define("qa-timer", QA_Timer);
