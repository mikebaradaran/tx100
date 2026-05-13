class QA_Timer extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <link href="/MyTimer.css" rel="stylesheet" />
      <span id="timerGoButton">▶️</span>
      <input id="timer" type="range" min="1" max="120"/>
      <span id="info"></span>
    `;

    // cache DOM once
    this.$timer = this.shadowRoot.querySelector("#timer");
    this.$info = this.shadowRoot.querySelector("#info");
    this.$btn = this.shadowRoot.querySelector("#timerGoButton");

    // state
    this.seconds = 0;
    this.startMins = 0;
    this.interval = null;

    // speech
    this.msg = new SpeechSynthesisUtterance();
    this.setupSpeech();
  }

  connectedCallback() {
    this.$timer.addEventListener("input", () => this.onSlide());
    this.$btn.addEventListener("click", () => this.startFromUI());
  }

  // -------------------------
  // UI handlers
  // -------------------------

  onSlide() {
    this.stopTimer();
    this.updateDisplay(this.$timer.value + " mins");
  }

  startFromUI() {
    const mins = Number(this.$timer.value);
    this.start(mins * 60);
  }

  // -------------------------
  // Core timer logic
  // -------------------------

  start(seconds) {
    this.stopTimer();

    this.seconds = seconds;
    this.startMins = Math.floor(seconds / 60);

    this.interval = setInterval(() => this.tick(), 1000);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  tick() {
    if (this.seconds <= 0) {
      this.finish();
      return;
    }

    const mins = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;
    const hours = Math.floor(mins / 60);
    const displayMins = mins % 60;

    const time =
      (hours > 0 ? `${hours}h : ` : "") +
      `${displayMins}m : ${secs}`;

    this.updateDisplay(time);
    this.seconds--;
  }

  finish() {
    this.stopTimer();

    const msg = `${this.startMins} minutes passed. Ended at ${this.getTime()}`;
    this.updateDisplay(msg);

    // speech chain (avoids overlap)
    this.speak(`${this.startMins} minutes passed`)
      .then(() => this.speak(`Ended at ${this.getShortTime()}`));
  }

  updateDisplay(text) {
    this.$info.textContent = text;
  }

  // -------------------------
  // Speech
  // -------------------------

  setupSpeech() {
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      if (!voices.length) return;

      this.msg.voice = voices.find(v =>
        /female|woman|samantha|karen|zira/i.test(v.name)
      );

      this.msg.pitch = 1.1;
      this.msg.rate = 0.9;
    };

    setVoice();
    speechSynthesis.onvoiceschanged = setVoice;
  }

  speak(text) {
    return new Promise(resolve => {
      this.msg.text = text;
      this.msg.onend = resolve;
      speechSynthesis.speak(this.msg);
    });
  }

  // -------------------------
  // Utils
  // -------------------------

  getTime() {
    const d = new Date();
    return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  }
  getShortTime(){
    const d = new Date();
    return `${d.getHours()}:${d.getMinutes()}`;
  }
}

customElements.define("qa-timer", QA_Timer);