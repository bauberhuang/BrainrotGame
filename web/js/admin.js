/* ================================================================
   admin.js — Admin panel: auth, spawn, money, tokens, events
   Refactored with quick actions and clean structure.
   ================================================================ */

window.Admin = (function () {
  var D = function () { return window.GameData; };
  var U = function () { return window.GameUtils; };
  var S = function () { return window.GameState; };
  var G = function () { return window.Game; };
  var $ = function (id) { return document.getElementById(id); };
  var bound = false;

  var ADMIN_WHITELIST = ["Bauber666"];

  function isWhitelisted() {
    var user = (window.Account && window.Account.getLoggedInUser()) || "";
    return ADMIN_WHITELIST.indexOf(user) !== -1;
  }

  function isBauber() { return isWhitelisted(); }

  /* ---------- Status helpers ---------- */
  function status(msg) { var el = $("adminStatusText"); if (el) el.textContent = msg; }
  function spawnStatus(msg) { var el = $("adminSpawnerStatusText"); if (el) el.textContent = msg; }

  /* ---------- Spawnables list ---------- */
  function getSpawnables() {
    var seen = {}, unique = [];
    [D().characters, D().luckyBlockCharacters, D().sailingRewardCharacters, D().adminOnlyCharacters].forEach(function (arr) {
      arr.forEach(function (c) { if (!seen[c.id]) { seen[c.id] = true; unique.push(c); } });
    });
    unique.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return unique;
  }

  /* ---------- Render ---------- */
  function renderSelects() {
    var spawnables = getSpawnables();
    var sel = $("adminBrainrotSelect");
    if (sel) {
      var prev = sel.value;
      sel.innerHTML = spawnables.map(function (c) { return '<option value="' + c.id + '">' + c.name + '</option>'; }).join("");
      if (spawnables.some(function (c) { return c.id === prev; })) sel.value = prev;
    }
    var mut = $("adminMutationSelect");
    if (mut) {
      var m = D().MUTATIONS;
      mut.innerHTML = Object.keys(m).map(function (k, i) { return '<option value="' + k + '">' + (i + 1) + ' ' + m[k].label + '</option>'; }).join("");
    }
    var evt = $("adminEventSelect");
    if (evt) {
      evt.innerHTML = Object.keys(D().EVENT_MUTATION_WEIGHTS).map(function (k) { return '<option value="' + k + '">' + U().getMutationDisplayName(k) + '</option>'; }).join("");
    }
    var st = S().getState();
    var mi = $("adminSetMoneyInput"); if (mi) mi.value = Math.floor(st.money);
    var ri = $("adminSetRebirthInput"); if (ri) ri.value = st.rebirthCount;
    if (mut) mut.value = mut.value || "normal";
    if (evt) evt.value = st.event.activeMutation || "rainbow";
  }

  function renderView() {
    var authed = S().getAdminAuthorized();
    var av = $("adminAuthView"), sv = $("adminSpawnerView");
    if (av) av.classList.toggle("hidden", authed);
    if (sv) sv.classList.toggle("hidden", !authed);
  }

  function isBauber() { return isWhitelisted(); }

  function render() {
    if (!$("adminPage")) return;
    // Not whitelisted — block entirely
    if (!isWhitelisted()) {
      var av = $("adminAuthView"), sv = $("adminSpawnerView");
      if (av) av.classList.add("hidden");
      if (sv) sv.classList.add("hidden");
      status("Access denied. Admin is restricted to whitelisted accounts.");
      return;
    }
    // Whitelisted: auto-auth
    S().setAdminAuthorized(true); S().saveAdminAuthorization(true);
    renderView();
    if (!S().getAdminAuthorized()) { status("Enter the admin password to unlock tools."); return; }
    renderSelects();
  }

  /* ---------- Auth ---------- */
  function submitPassword() {
    var pw = $("adminPasswordInput").value;
    if (pw === D().CONST.ADMIN_PASSWORD) {
      S().setAdminAuthorized(true); S().saveAdminAuthorization(true);
      render(); spawnStatus("Admin unlocked.");
    } else {
      S().setAdminAuthorized(false); S().saveAdminAuthorization(false);
      render(); status("Wrong password.");
    }
  }

  /* ---------- Spawn ---------- */
  function spawnBrainrots() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var mutation = $("adminMutationSelect").value;
    var cid = $("adminBrainrotSelect").value;
    var amount = Math.max(1, Math.min(1e18, Number($("adminAmountInput").value) || 1));
    var level = Math.max(0, Math.min(500, Number($("adminSpawnLevelInput").value) || 0));
    if (!cid || !U().isKnownCharacterId(cid)) { spawnStatus("Choose a valid brainrot."); return; }
    var ch = U().getOwnedCharacterData(cid);
    G().grantOwnedCharacter(cid, mutation, amount);
    // Set the level on the spawned entry
    var countKey = U().getMutationConfig(mutation).countKey;
    var levelKey = countKey.replace("Count", "Level");
    S().getState().owned[cid][levelKey] = Math.max(S().getState().owned[cid][levelKey] || 0, level);
    G().fullRender();
    spawnStatus("Spawned " + amount + " " + U().getMutationDisplayName(mutation).toLowerCase() + " " + ch.name + " at Lv." + level + ".");
  }

  function spawnAllBrainrots() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var count = 0;
    D().characters.forEach(function (c) { G().grantOwnedCharacter(c.id, "normal", 1); count++; });
    G().fullRender();
    spawnStatus("Spawned 1 of each brainrot — " + count + " total.");
  }

  /* ---------- Money & Rebirth ---------- */
  function setMoney() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var v = Number($("adminSetMoneyInput").value);
    if (isNaN(v)) { spawnStatus("Enter a valid number."); return; }
    S().getState().money = Math.max(0, v);
    G().fullRender();
    spawnStatus("Money = " + U().formatMoney(S().getState().money));
  }

  function setRebirth() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var v = parseInt($("adminSetRebirthInput").value, 10);
    if (isNaN(v)) { spawnStatus("Enter a valid number."); return; }
    S().getState().rebirthCount = Math.max(0, Math.min(D().CONST.MAX_REBIRTHS, v));
    G().fullRender();
    spawnStatus("Rebirth = " + S().getState().rebirthCount);
  }

  /* ---------- Tokens ---------- */
  function giveTokens() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var v = parseInt($("adminMathTokensInput").value, 10);
    if (isNaN(v) || v < 1) { spawnStatus("Enter a valid number."); return; }
    S().getState().mathTokens = (S().getState().mathTokens || 0) + v;
    G().fullRender();
    spawnStatus("+" + v + " tokens. Total: " + S().getState().mathTokens);
  }

  /* ---------- Events ---------- */
  function setEvent() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var sel = $("adminEventSelect").value;
    if (!sel || !D().EVENT_MUTATION_WEIGHTS[sel]) { spawnStatus("Choose a valid event."); return; }
    var st = S().getState();
    st.event.activeMutation = sel;
    st.event.endsAt = Date.now() + D().CONST.EVENT_DURATION_MS;
    st.event.playSeconds = 0;
    G().fullRender();
    spawnStatus(U().getMutationDisplayName(sel) + " event ON — 5 minutes.");
  }

  function clearEvent() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    S().getState().event = { activeMutation: null, endsAt: 0, playSeconds: 0 };
    G().fullRender();
    spawnStatus("Event cleared.");
  }

  /* ---------- Quick Actions ---------- */
  function maxMoney() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    S().getState().money = 1e100;
    G().fullRender();
    spawnStatus("Money set to MAX (1 GOL).");
  }

  function fillTokens() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    S().getState().mathTokens = (S().getState().mathTokens || 0) + 1000;
    G().fullRender();
    spawnStatus("+1000 tokens. Total: " + S().getState().mathTokens);
  }

  function clearCollection() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    S().getState().owned = { "noobini-pizzanini": S().normalizeOwnedEntry("noobini-pizzanini", { normalCount: 1 }) };
    G().fullRender();
    spawnStatus("Collection cleared. Kept 1 Noobini Pizzanini.");
  }

  function forceEvent() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var st = S().getState();
    var sel = $("adminEventSelect").value || "rainbow";
    st.event.activeMutation = sel;
    st.event.endsAt = Date.now() + D().CONST.EVENT_DURATION_MS;
    st.event.playSeconds = D().CONST.EVENT_INTERVAL_SECONDS;
    G().fullRender();
    spawnStatus(U().getMutationDisplayName(sel) + " event forced.");
  }

  function resetGame() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    if (!confirm("Reset ALL progress? This cannot be undone.")) return;
    S().replaceState(S().createDefaultState());
    S().saveState();
    G().fullRender();
    spawnStatus("Game fully reset.");
  }

  function exportSave() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var data = JSON.stringify(S().getState(), null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "brainrot-save-" + Date.now() + ".json"; a.click();
    spawnStatus("Save exported.");
  }

  function importSave() {
    if (!S().getAdminAuthorized()) { status("Please enter your password."); return; }
    var input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = function () {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          S().replaceState(data);
          S().saveState();
          G().fullRender();
          spawnStatus("Save imported!");
        } catch (e) { spawnStatus("Invalid save file."); }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  /* ---------- Bind & Boot ---------- */
  function bind() {
    if (bound) return;
    var pairs = [
      ["adminPasswordSubmitButton", submitPassword],
      ["adminConfirmButton", spawnBrainrots],
      ["adminSpawnAllButton", spawnAllBrainrots],
      ["adminSetMoneyButton", setMoney],
      ["adminSetRebirthButton", setRebirth],
      ["adminGiveTokensButton", giveTokens],
      ["adminSetEventButton", setEvent],
      ["adminClearEventButton", clearEvent],
      ["adminMaxMoneyButton", maxMoney],
      ["adminFillTokensButton", fillTokens],
      ["adminClearCollectionButton", clearCollection],
      ["adminForceEventButton", forceEvent],
      ["adminResetGameButton", resetGame],
      ["adminExportButton", exportSave],
      ["adminImportButton", importSave],
    ];
    pairs.forEach(function (p) {
      var el = $(p[0]); if (el) el.addEventListener("click", p[1]);
    });
    var pw = $("adminPasswordInput");
    if (pw) pw.addEventListener("keydown", function (e) { if (e.key === "Enter") submitPassword(); });
    bound = true;
  }

  function boot() { bind(); render(); }

  return { boot: boot, render: render, isWhitelisted: isWhitelisted };
})();
