/* ================================================================
   main.js — Entry point: polyfill, Rebirth module, routing, game loop
   ================================================================ */

(function () {
  /* ---------- crypto.randomUUID polyfill ---------- */
  var c = window.crypto || window.msCrypto;
  if (c && typeof c.randomUUID !== "function") {
    c.randomUUID = function () {
      var b = new Uint8Array(16);
      if (typeof c.getRandomValues === "function") c.getRandomValues(b);
      else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
      b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
      var h = Array.from(b, function (x) { return x.toString(16).padStart(2, "0"); });
      return [h.slice(0, 4).join(""), h.slice(4, 6).join(""), h.slice(6, 8).join(""), h.slice(8, 10).join(""), h.slice(10, 16).join("")].join("-");
    };
  }

  var D = function () { return window.GameData; };
  var U = function () { return window.GameUtils; };
  var S = function () { return window.GameState; };
  var I = function () { return window.GameUI; };
  var G = function () { return window.Game; };

  /* ---------- Rebirth module ---------- */
  window.Rebirth = (function () {
    var bound = false;
    function render() {
      var d = I().dom, st = S().getState();
      if (!d.rebirthPage) return;
      var cur = U().getCashMultiplierForRebirthCount(st.rebirthCount);
      var nxt = U().getNextRebirthMultiplier(st.rebirthCount);
      var req = U().getRebirthRequirement(st.rebirthCount);
      var maxed = st.rebirthCount >= D().CONST.MAX_REBIRTHS;
      d.rebirthCountDisplay.textContent = st.rebirthCount;
      d.cashMultiplierDisplay.textContent = U().formatMultiplier(cur);
      d.nextMultiplierDisplay.textContent = maxed ? "MAX" : U().formatMultiplier(nxt);
      d.rebirthRequirementDisplay.textContent = maxed ? "MAXED" : U().formatMoney(req);
      d.rebirthDescription.textContent = maxed ? "Rebirth cap reached." : "Rebirth #" + (st.rebirthCount + 1) + " boosts income to " + U().formatMultiplier(nxt) + ".";
      d.miniRebirthButton.disabled = maxed;
      d.miniRebirthButton.textContent = maxed ? "Max Rebirth Reached" : "Rebirth";
    }
    function bind() { if (!bound) { I().bindClick(I().dom.miniRebirthButton, G().performRebirth); bound = true; } }
    return { boot: function () { bind(); render(); }, render: render };
  })();

  /* ---------- Routing ---------- */
  var _ready = false;

  function handleHashChange() {
    if (!_ready) return;
    var page = (window.location.hash.replace("#", "") || "home");
    I().showPage(page);
    var boots = {
      settings: function () { renderSettingsBadges(); },
      admin: function () { if (window.Admin) window.Admin.boot(); },
      rebirth: function () { if (window.Rebirth) window.Rebirth.boot(); },
      sailing: function () { if (window.Sailing) window.Sailing.boot(); },
      account: function () { if (window.Account) window.Account.boot(); },
      math: function () { if (window.MathGame) window.MathGame.boot(); },
    };
    if (boots[page]) boots[page]();
    if (page === "home") G().fullRender();
  }

  function renderSettingsBadges() {
    var st = S().getState();
    var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
    set("settingsRebirthBadge", st.rebirthCount);
    set("settingsAccountBadge", (window.Account && window.Account.isLoggedIn()) ? window.Account.getLoggedInUser() : "Guest");
    set("settingsSailingBadge", st.sailing.jobs.length ? st.sailing.jobs.length + " active" : "");
    if (window.MathGame) set("settingsMathBadge", window.MathGame.getCooldownRemaining() > 0 ? Math.ceil(window.MathGame.getCooldownRemaining() / 60000) + "m cd" : "Ready");
    // Show admin row only for whitelisted users
    var adminRow = document.getElementById("settingsAdminRow");
    var whitelisted = window.Admin && window.Admin.isWhitelisted && window.Admin.isWhitelisted();
    if (adminRow) adminRow.classList.toggle("hidden", !whitelisted);
  }

  /* ---------- Init (waits for game data from server) ---------- */
  window.GameDataReady.then(function () {
    _ready = true;
    U().fillSailingRewardImages(); U().fillCharacterImages();
    I().cacheDom();

    // Nav bindings
    function nav(btn, page) { var el = I().dom[btn]; if (el) el.addEventListener("click", function () { I().navigateTo(page); }); }
    nav("settingsPageButton", "settings");
    function back(btn, page) { var el = I().dom[btn]; if (el) el.addEventListener("click", function () { I().navigateTo(page); }); }
    back("settingsBackButton", "home");
    back("backToGameButton", "settings"); back("adminBackButton", "home");
    back("sailingBackButton", "settings"); back("accountBackButton", "settings"); back("mathBackButton", "settings");

    // Inventory toggle
    var tgl = document.getElementById("inventoryToggle"), body = document.getElementById("collectionBody");
    if (tgl && body) tgl.addEventListener("click", function () {
      var open = !body.classList.contains("hidden");
      body.classList.toggle("hidden", open); tgl.classList.toggle("open", !open);
    });

    // Sell mode toggle
    var sm = document.getElementById("sellModeButton");
    if (sm) sm.addEventListener("click", function () { G().toggleSellMode(); });

    // Game buttons
    I().bindClick(I().dom.rollButton, function () { G().rollCharacter(true); });
    I().bindClick(I().dom.buyButton, function () { G().buyCurrentCharacter(); });
    if (I().dom.ownedList) I().dom.ownedList.addEventListener("click", function (e) { G().selectOwnedCharacter(e); });
    I().bindClick(I().dom.uncoverLuckyBlockButton, function () { G().uncoverLuckyBlock(); });
    I().bindClick(I().dom.uncoverAllLuckyBlocksButton, function () { G().uncoverAllLuckyBlocks(); });

    // Load state
    (async function () {
      var loaded = false;
      if (window.Account && window.Account.isLoggedIn()) {
        var ss = await S().loadStateFromServer();
        if (ss) { S().replaceState(ss); loaded = true; }
      }
      if (!loaded) S().replaceState(S().loadState());
      S().setAdminAuthorized(S().loadAdminAuthorization());
      var st = S().getState();
      if (!Object.keys(st.owned).length) st.owned["noobini-pizzanini"] = S().normalizeOwnedEntry("noobini-pizzanini", { normalCount: 1 });
      G().awardOfflineIncome(); G().syncEventState();
      if (window.Sailing && window.Sailing.resolveFinished) window.Sailing.resolveFinished();
      G().ensureCurrentRoll();
      window._totalIncomePerSecond = G().getTotalIncomePerSecond();
      handleHashChange();
    })();

    // Game loop
    setInterval(function () { G().tickIncome(); }, 1000);
    setInterval(function () { S().syncStateToServer(); }, 30000);

    I().setStatus("Your idle run started with $10,000. Roll and build your brainrot factory.");
    I().setRebirthStatus("Stack rebirths to push every brainrot income higher.");
    window.addEventListener("hashchange", handleHashChange);
    console.log("Brainrot Casino initialized. Open http://127.0.0.1:5002");
  });
})();
