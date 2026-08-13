class QA_Timer extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <link href="/MyTimer.css" rel="stylesheet" />
      <span id="timerGoButton">▶️</span>
      <input id="timer" type="range" min="1" max="120" value="1"/>
      <span id="info"></span>
    `;

    // Cache DOM
    this.$timer = this.shadowRoot.querySelector("#timer");
    this.$info = this.shadowRoot.querySelector("#info");
    this.$btn = this.shadowRoot.querySelector("#timerGoButton");

    // Timer state
    this.endTime = 0;
    this.startMins = 0;
    this.interval = null;

    // Speech
    this.msg = new SpeechSynthesisUtterance();
    this.setupSpeech();
  }

  setTime(minutes) {
    this.shadowRoot.querySelector("#timer").value = minutes;
    this.start(minutes * 60);
  }

  connectedCallback() {
    this.$timer.addEventListener("input", () => this.onSlide());
    this.$btn.addEventListener("click", () => this.startFromUI());

    this.updateDisplay(this.$timer.value + " mins");

    // this.shadowRoot.querySelector("#break15")
    //   .addEventListener("click", () => this.setTime(15));

    // this.shadowRoot.querySelector("#break60")
    //   .addEventListener("click", () => this.setTime(60));
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  // -------------------------
  // UI
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
  // Timer
  // -------------------------

  start(seconds) {

    this.stopTimer();

    this.startMins = Math.floor(seconds / 60);

    // Remember exactly when the timer should finish
    this.endTime = Date.now() + seconds * 1000;

    // Update immediately
    this.tick();

    // Refresh several times a second.
    // If the browser pauses it, the timer will still remain accurate.
    this.interval = setInterval(() => this.tick(), 250);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  tick() {

    const remaining = Math.ceil((this.endTime - Date.now()) / 1000);

    if (remaining <= 0) {
      this.finish();
      return;
    }

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const hours = Math.floor(mins / 60);
    const displayMins = mins % 60;

    const time =
      (hours > 0 ? `${hours}h : ` : "") +
      `${displayMins}m : ${String(secs).padStart(2, "0")}`;

    this.updateDisplay(time);
  }

  finish() {

    this.stopTimer();

    const msg =
      `${this.startMins} minutes passed. Ended at ${this.getTime()}`;

    this.updateDisplay(msg);

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

      this.msg.voice =
        voices.find(v =>
          /female|woman|samantha|karen|zira/i.test(v.name)
        ) || null;

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

      speechSynthesis.cancel(); // Prevent overlapping speech
      speechSynthesis.speak(this.msg);

    });
  }

  // -------------------------
  // Utilities
  // -------------------------

  getTime() {

    const d = new Date();

    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  }

  getShortTime() {

    const d = new Date();

    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

}

customElements.define("qa-timer", QA_Timer);