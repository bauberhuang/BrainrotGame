/* ================================================================
   main.js — Entry point: polyfill, init, hash navigation, game loop
   Must be the LAST script loaded (after all modules).
   ================================================================ */

(function () {
  /* ---------- crypto.randomUUID polyfill (was bootstrap.js) ---------- */

  const cryptoObj = window.crypto || window.msCrypto;
  if (cryptoObj && typeof cryptoObj.randomUUID !== "function") {
    cryptoObj.randomUUID = function () {
      const bytes = new Uint8Array(16);
      if (typeof cryptoObj.getRandomValues === "function") {
        cryptoObj.getRandomValues(bytes);
      } else {
        for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
      }
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
      return [hex.slice(0, 4).join(""), hex.slice(4, 6).join(""), hex.slice(6, 8).join(""),
              hex.slice(8, 10).join(""), hex.slice(10, 16).join("")].join("-");
    };
  }

  /* ---------- Alias globals for brevity ---------- */

  const D = () => window.GameData;
  const U = () => window.GameUtils;
  const S = () => window.GameState;
  const UI = () => window.GameUI;
  const G = () => window.Game;

  /* ---------- Rebirth page module ---------- */

  window.Rebirth = (() => {
    let bound = false;

    function render() {
      const d = UI().dom;
      if (!d.rebirthPage) return;
      const st = S().getState();
      const currentMult = U().getCashMultiplierForRebirthCount(st.rebirthCount);
      const nextMult = U().getNextRebirthMultiplier(st.rebirthCount);
      const requirement = U().getRebirthRequirement(st.rebirthCount);
      const isMaxed = st.rebirthCount >= D().CONST.MAX_REBIRTHS;
      const nextNum = st.rebirthCount + 1;

      d.rebirthCountDisplay.textContent = `${st.rebirthCount}`;
      d.cashMultiplierDisplay.textContent = U().formatMultiplier(currentMult);
      d.nextMultiplierDisplay.textContent = isMaxed ? "MAX" : U().formatMultiplier(nextMult);
      d.rebirthRequirementDisplay.textContent = isMaxed ? "MAXED" : U().formatMoney(requirement);
      d.rebirthDescription.textContent = isMaxed
        ? "You reached the rebirth cap. Every brainrot is already boosted as far as this system goes."
        : `Your ${nextNum}${U().getOrdinalSuffix(nextNum)} rebirth will boost all brainrots to ${U().formatMultiplier(nextMult)} cash.`;
      d.miniRebirthButton.disabled = isMaxed;
      d.miniRebirthButton.textContent = isMaxed ? "Max Rebirth Reached" : "Rebirth";
    }

    function bind() {
      if (bound) return;
      UI().bindClick(UI().dom.miniRebirthButton, G().performRebirth);
      bound = true;
    }

    function boot() {
      bind();
      render();
    }

    return { boot, render };
  })();

  /* ---------- Page hash routing ---------- */

  function handleHashChange() {
    const hash = window.location.hash.replace("#", "");
    const pageName = hash || "home";
    UI().showPage(pageName);

    // Call the page's boot function (binds events, populates selects, etc.)
    var boots = {
      home: null,
      settings: function () { return renderSettingsBadges(); },
      admin: function () { return window.Admin && window.Admin.boot(); },
      rebirth: function () { return window.Rebirth && window.Rebirth.boot(); },
      sailing: function () { return window.Sailing && window.Sailing.boot(); },
      account: function () { return window.Account && window.Account.boot(); },
      math: function () { return window.MathGame && window.MathGame.boot(); },
    };

    function renderSettingsBadges() {
      var st = S().getState();
      var rebEl = document.getElementById("settingsRebirthBadge");
      if (rebEl) rebEl.textContent = st.rebirthCount;
      var accEl = document.getElementById("settingsAccountBadge");
      if (accEl) accEl.textContent = (window.Account && window.Account.isLoggedIn())
        ? (window.Account.getLoggedInUser()) : "Guest";
      var sailEl = document.getElementById("settingsSailingBadge");
      if (sailEl) sailEl.textContent = st.sailing.jobs.length > 0 ? st.sailing.jobs.length + " active" : "";
      var mathEl = document.getElementById("settingsMathBadge");
      if (mathEl && window.MathGame) {
        var cd = window.MathGame.getCooldownRemaining();
        if (cd > 0) {
          var m = Math.ceil(cd / 60000);
          mathEl.textContent = m + "m cd";
        } else {
          mathEl.textContent = "Ready";
        }
      }
    }

    if (boots[pageName]) {
      boots[pageName]();
    }

    // On home page: just make sure the game is rendered
    if (pageName === "home") {
      G().fullRender();
    }
  }

  window.addEventListener("hashchange", handleHashChange);

  /* ---------- Game init sequence ---------- */

  // 1. Fill in SVG letter images for sailing rewards and characters
  U().fillSailingRewardImages();
  U().fillCharacterImages();

  // 2. Cache all DOM references
  UI().cacheDom();

  /* ---------- Topbar navigation button bindings ---------- */

  function bindNav(buttonId, pageName) {
    const btn = UI().dom[buttonId];
    if (btn) {
      btn.addEventListener("click", () => UI().navigateTo(pageName));
    }
  }

  bindNav("settingsPageButton", "settings");

  // Back buttons: sub-page back → settings, settings back → home
  function bindBackTo(buttonId, pageName) {
    const btn = UI().dom[buttonId];
    if (btn) btn.addEventListener("click", () => UI().navigateTo(pageName));
  }

  bindBackTo("settingsBackButton", "home");
  bindBackTo("backToGameButton", "settings");
  bindBackTo("adminBackButton", "settings");
  bindBackTo("sailingBackButton", "settings");
  bindBackTo("accountBackButton", "settings");
  bindBackTo("mathBackButton", "settings");

  /* ---------- Home page game button bindings ---------- */

  // Inventory toggle
  var toggleBtn = document.getElementById("inventoryToggle");
  var collectionBody = document.getElementById("collectionBody");
  if (toggleBtn && collectionBody) {
    toggleBtn.addEventListener("click", function () {
      var open = !collectionBody.classList.contains("hidden");
      if (open) {
        collectionBody.classList.add("hidden");
        toggleBtn.classList.remove("open");
      } else {
        collectionBody.classList.remove("hidden");
        toggleBtn.classList.add("open");
      }
    });
  }

  // Sell mode toggle
  var sellModeBtn = document.getElementById("sellModeButton");
  if (sellModeBtn) {
    sellModeBtn.addEventListener("click", function () {
      G().toggleSellMode();
    });
  }

  UI().bindClick(UI().dom.rollButton, () => G().rollCharacter(true));
  UI().bindClick(UI().dom.buyButton, () => G().buyCurrentCharacter());
  if (UI().dom.ownedList) {
    UI().dom.ownedList.addEventListener("click", function (e) { G().selectOwnedCharacter(e); });
  }
  UI().bindClick(UI().dom.uncoverLuckyBlockButton, () => G().uncoverLuckyBlock());
  UI().bindClick(UI().dom.uncoverAllLuckyBlocksButton, () => G().uncoverAllLuckyBlocks());

  // 3. Load game state (server first if logged in, fall back to localStorage)
  async function initGameState() {
    var loaded = false;
    if (window.Account && window.Account.isLoggedIn()) {
      var serverState = await S().loadStateFromServer();
      if (serverState) {
        S().replaceState(serverState);
        loaded = true;
      }
    }
    if (!loaded) {
      S().replaceState(S().loadState());
    }
    S().setAdminAuthorized(S().loadAdminAuthorization());

    // Safety net: if no brainrots owned, grant starter
    var st = S().getState();
    if (Object.keys(st.owned).length === 0) {
      st.owned["noobini-pizzanini"] = S().normalizeOwnedEntry("noobini-pizzanini", { normalCount: 1 });
    }

    // 4. Award offline income and initialize
    G().awardOfflineIncome();
    G().syncEventState();
    if (typeof window.Sailing !== "undefined" && window.Sailing.resolveFinished) {
      window.Sailing.resolveFinished();
    }
    G().ensureCurrentRoll();

    // 5. Compute initial income before first render
    window._totalIncomePerSecond = G().getTotalIncomePerSecond();

    // 6. Initial page render based on URL hash
    handleHashChange();
  }

  initGameState();

  // 7. Start game loop (1 tick per second)
  window.setInterval(() => {
    G().tickIncome();
  }, 1000);

  // 8. Sync state to Python/SQLite server every 30s
  window.setInterval(() => {
    S().syncStateToServer();
  }, 30000);

  // 9. Set initial status
  UI().setStatus("Your idle run started with $10,000. Roll and build your brainrot factory.");
  UI().setRebirthStatus("Stack rebirths to push every brainrot income higher.");

  console.log("Brainrot Casino initialized. Open http://127.0.0.1:5002");
})();
