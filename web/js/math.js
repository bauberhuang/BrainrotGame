/* ================================================================
   math.js — Timed arithmetic minigame. Earn brainrots by solving.
   ================================================================ */

(function () {
  const D = () => window.GameData;
  const U = () => window.GameUtils;
  const S = () => window.GameState;
  const UI = () => window.GameUI;
  const G = () => window.Game;

  const QUESTION_TIME = 40;       // seconds per question
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 min cooldown
  const COOLDOWN_KEY = "brainrot-math-cooldown";

  var correctCount = 0;
  var currentAnswer = null;       // the correct answer (number)
  var timeLeft = QUESTION_TIME;
  var timerInterval = null;
  var active = false;
  var opType = "";                // '+', '-', '*', '/'

  /* ---------- Cooldown ---------- */

  function getCooldownRemaining() {
    try {
      var until = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
      return Math.max(0, until - Date.now());
    } catch (e) { return 0; }
  }

  function setCooldown() {
    try {
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS));
    } catch (e) { /* ignore */ }
  }

  function isOnCooldown() {
    return getCooldownRemaining() > 0;
  }

  /* ---------- Rarity by correct count ---------- */

  function getRarityForCount(count) {
    if (count > 150) return "og";
    if (count >= 100) return "divine";
    if (count >= 50)  return "celestial";
    if (count >= 35)  return "secret";
    if (count >= 25)  return "god";
    if (count >= 23)  return "mythic";
    if (count >= 20)  return "epic";       // user said 20-23 "legendary", but we have epic
    if (count >= 15)  return "epic";
    if (count >= 10)  return "uncommon";
    return "common";
  }

  function getRarityLabelForCount(count) {
    var r = getRarityForCount(count);
    var map = {
      og: "OG", divine: "DIVINE", celestial: "CELESTIAL", secret: "SECRET",
      god: "GOD", mythic: "MYTHIC", epic: "EPIC", uncommon: "UNCOMMON", common: "COMMON"
    };
    return map[r] || "COMMON";
  }

  /* ---------- Random helpers ---------- */

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randFloat(min, max, decimals) {
    var r = Math.random() * (max - min) + min;
    var factor = Math.pow(10, decimals);
    return Math.round(r * factor) / factor;
  }

  function fmt(n, decimals) {
    return n.toFixed(decimals);
  }

  /* ---------- Question generation ---------- */

  function generateQuestion() {
    var count = correctCount;
    // Only + and - with xxxx.xx format
    opType = Math.random() < 0.5 ? "+" : "-";
    return generateAddSub(opType, count);
  }

  function generateAddSub(op, count) {
    // Always xxxx.xx format: 1000.00 to 9999.99
    // Difficulty: harder questions as count increases
    var diff = Math.floor(count / 3);
    var min = 1000 + diff * 30;
    var max = 4000 + diff * 200;
    if (min > 8000) min = 8000;
    if (max > 9999) max = 9999;

    var a = randFloat(min, max, 2);
    var b = randFloat(min, max, 2);

    // Harder: use numbers close to boundaries, more borrowing/carrying
    // Occasionally make one number end in .99 or .01 for tricky carries
    if (count > 10 && Math.random() < 0.3) {
      b = randFloat(min, max, 0) + (Math.random() < 0.5 ? 0.99 : 0.01);
      b = Math.round(b * 100) / 100;
    }

    // For subtraction: ensure a >= b so result stays positive
    if (op === "-" && b > a) { var t = a; a = b; b = t; }

    currentAnswer = op === "+" ? a + b : a - b;
    currentAnswer = Math.round(currentAnswer * 100) / 100;

    return {
      text: fmt(a, 2) + " " + op + " " + fmt(b, 2) + " = ?",
      answer: currentAnswer,
      type: op,
    };
  }

  /* ---------- Timer ---------- */

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    var el = document.getElementById("mathTimerDisplay");
    if (el) {
      el.textContent = timeLeft + "s";
      // Flash red when low
      el.style.color = timeLeft <= 10 ? "#ff3355" : "var(--ink)";
    }
  }

  /* ---------- UI updates ---------- */

  function updateUI() {
    updateTimerDisplay();
    var countEl = document.getElementById("mathCountDisplay");
    if (countEl) countEl.textContent = correctCount;

    var rarityEl = document.getElementById("mathCurrentRarity");
    if (rarityEl) {
      rarityEl.textContent = getRarityLabelForCount(correctCount);
    }
  }

  /* ---------- Display next question ---------- */

  function showNextQuestion() {
    if (!active) return;

    var q = generateQuestion();
    timeLeft = QUESTION_TIME;

    var problemEl = document.getElementById("mathProblem");
    var inputEl = document.getElementById("mathAnswerInput");

    if (problemEl) problemEl.textContent = q.text;
    if (inputEl) {
      inputEl.value = "";
      inputEl.focus();
      inputEl.disabled = false;
    }

    updateTimerDisplay();
    updateUI();

    // Reset timer
    clearTimer();
    timerInterval = setInterval(function () {
      timeLeft -= 1;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        // Time's up = wrong answer
        endGame();
      }
    }, 1000);
  }

  /* ---------- Start / End ---------- */

  function startGame() {
    if (active) return;
    if (isOnCooldown()) {
      var remain = getCooldownRemaining();
      var secs = Math.ceil(remain / 1000);
      var m = Math.floor(secs / 60);
      var s = secs % 60;
      var cdEl = document.getElementById("mathCooldownDisplay");
      if (cdEl) cdEl.textContent = "Cooldown: " + m + "m " + s + "s";
      return;
    }

    active = true;
    correctCount = 0;
    timeLeft = QUESTION_TIME;

    // Show game view, hide start view
    var startView = document.getElementById("mathStartView");
    var gameView = document.getElementById("mathGameView");
    var resultView = document.getElementById("mathResultView");
    var cdEl = document.getElementById("mathCooldownDisplay");

    if (startView) startView.classList.add("hidden");
    if (gameView) gameView.classList.remove("hidden");
    if (resultView) resultView.classList.add("hidden");
    if (cdEl) cdEl.textContent = "";

    updateUI();
    showNextQuestion();
  }

  function endGame() {
    active = false;
    clearTimer();
    setCooldown();

    var count = correctCount;
    var rarity = getRarityForCount(count);
    var rarityLabel = getRarityLabelForCount(count);

    // Grant a random brainrot of the earned rarity or better
    var rOrder = ["og","divine","celestial","secret","god","mythic","epic","uncommon","common"];
    var minIdx = rOrder.indexOf(rarity);
    if (minIdx < 0) minIdx = rOrder.length - 1;

    var rewarded = null;
    for (var attempt = 0; attempt < 1000; attempt++) {
      var cand = G().weightedRoll();
      var rar = U().getRarityLabel(cand.value, undefined, cand.tier).className;
      if (rOrder.indexOf(rar) <= minIdx) {
        G().grantOwnedCharacter(cand.id, "normal", 1);
        rewarded = cand;
        break;
      }
    }

    // If nothing matched (unlikely), grant a common
    if (!rewarded) {
      var fallback = D().characters[0];
      G().grantOwnedCharacter(fallback.id, "normal", 1);
      rewarded = fallback;
    }

    // Show result view
    var gameView = document.getElementById("mathGameView");
    var resultView = document.getElementById("mathResultView");
    var inputEl = document.getElementById("mathAnswerInput");

    if (gameView) gameView.classList.add("hidden");
    if (resultView) resultView.classList.remove("hidden");
    if (inputEl) inputEl.disabled = true;

    var resultText = document.getElementById("mathResultText");
    if (resultText) {
      resultText.textContent = "You answered " + count + " questions correctly and earned a " + rarityLabel + " " + rewarded.name + "!";
    }

    // Start cooldown countdown display
    startCooldownDisplay();

    G().fullRender();
    UI().setStatus("Math challenge: " + count + " correct → " + rarityLabel + " " + rewarded.name);
  }

  /* ---------- Submit answer ---------- */

  function submitAnswer() {
    if (!active) return;

    var inputEl = document.getElementById("mathAnswerInput");
    var feedbackEl = document.getElementById("mathFeedback");
    if (!inputEl) return;

    var userAnswer = parseFloat(inputEl.value.trim());
    if (isNaN(userAnswer)) {
      if (feedbackEl) {
        feedbackEl.textContent = "Enter a number.";
        feedbackEl.style.color = "#ff3355";
      }
      return;
    }

    // Compare with tolerance (2 decimal places)
    var correct = Math.abs(userAnswer - currentAnswer) < 0.005;

    if (correct) {
      correctCount += 1;
      if (feedbackEl) {
        feedbackEl.textContent = "Correct!";
        feedbackEl.style.color = "#00ff88";
        setTimeout(function () { if (feedbackEl) feedbackEl.textContent = ""; }, 600);
      }
      updateUI();
      showNextQuestion();
    } else {
      if (feedbackEl) {
        feedbackEl.textContent = "Wrong! The answer was " + fmt(currentAnswer, 2);
        feedbackEl.style.color = "#ff3355";
      }
      endGame();
    }
  }

  /* ---------- Cooldown display ---------- */

  var cdInterval = null;

  function startCooldownDisplay() {
    if (cdInterval) clearInterval(cdInterval);
    function tick() {
      var remain = getCooldownRemaining();
      var cdEls = [
        document.getElementById("mathCooldownDisplay"),
        document.getElementById("mathCooldownDisplay2"),
      ];
      var startBtn = document.getElementById("mathStartButton");

      if (remain <= 0) {
        for (var i = 0; i < cdEls.length; i++) {
          if (cdEls[i]) cdEls[i].textContent = "";
        }
        if (startBtn) startBtn.disabled = false;
        if (cdInterval) { clearInterval(cdInterval); cdInterval = null; }
        return;
      }

      var secs = Math.ceil(remain / 1000);
      var m = Math.floor(secs / 60);
      var s = secs % 60;
      var text = "Cooldown: " + m + "m " + s + "s";
      for (var j = 0; j < cdEls.length; j++) {
        if (cdEls[j]) cdEls[j].textContent = text;
      }
      if (startBtn) startBtn.disabled = true;
    }
    tick();
    cdInterval = setInterval(tick, 1000);
  }

  /* ---------- Boot / Render ---------- */

  var bound = false;

  function render() {
    updateUI();
    updateTimerDisplay();

    var remain = getCooldownRemaining();
    var startBtn = document.getElementById("mathStartButton");
    var startView = document.getElementById("mathStartView");
    var gameView = document.getElementById("mathGameView");
    var resultView = document.getElementById("mathResultView");

    if (active) {
      // Game is running — show game view
      if (startView) startView.classList.add("hidden");
      if (gameView) gameView.classList.remove("hidden");
      if (resultView) resultView.classList.add("hidden");
      // Restore the current problem text if page was navigated away
      var problemEl = document.getElementById("mathProblem");
      // problem was set in showNextQuestion, no need to regenerate
      var inputEl = document.getElementById("mathAnswerInput");
      if (inputEl) inputEl.disabled = false;
    } else if (remain > 0) {
      if (startView) startView.classList.remove("hidden");
      if (gameView) gameView.classList.add("hidden");
      if (resultView) resultView.classList.add("hidden");
      startCooldownDisplay();
    } else {
      // Clear any stale result view
      if (startView) startView.classList.remove("hidden");
      if (gameView) gameView.classList.add("hidden");
      if (resultView) resultView.classList.add("hidden");
      if (startBtn) startBtn.disabled = false;
    }
  }

  // Clean up when leaving math page
  function cleanup() {
    // Game stays active but we stop the cooldown display interval
    if (cdInterval) {
      clearInterval(cdInterval);
      cdInterval = null;
    }
  }

  function bind() {
    if (bound) return;

    UI().bindClick(document.getElementById("mathStartButton"), startGame);
    UI().bindClick(document.getElementById("mathSubmitButton"), submitAnswer);

    // Submit on Enter key
    var inputEl = document.getElementById("mathAnswerInput");
    if (inputEl) {
      inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") submitAnswer();
      });
    }

    bound = true;
  }

  function boot() {
    bind();
    render();
    if (isOnCooldown()) startCooldownDisplay();
  }

  /* ---------- Expose ---------- */

  window.MathGame = {
    boot: boot,
    render: render,
    cleanup: cleanup,
    isOnCooldown: isOnCooldown,
    getCooldownRemaining: getCooldownRemaining,
  };
})();
