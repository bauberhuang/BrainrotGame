/* ================================================================
   game.js — Roll, buy, tick, events, rebirth, lucky blocks, sell
   ================================================================ */

var D = function () { return window.GameData; };
var U = function () { return window.GameUtils; };
var S = function () { return window.GameState; };
var UI = function () { return window.GameUI; };

var autoRollRemaining = 10;
var selectedOwnedCharacterId = null;
var sellMode = false;

function isSellMode() { return sellMode; }
function toggleSellMode() {
  sellMode = !sellMode;
  if (sellMode) { selectedOwnedCharacterId = null; UI().setStatus("Sell mode ON — tap a brainrot to sell it."); }
  else { UI().setStatus("Sell mode OFF."); }
  fullRender();
}
function getAutoRollRemaining() { return autoRollRemaining; }
function setAutoRollRemaining(v) { autoRollRemaining = v; }
function getSelectedOwnedCharacterId() { return selectedOwnedCharacterId; }
function setSelectedOwnedCharacterId(v) { selectedOwnedCharacterId = v; }

/* ---------- Mutation helpers ---------- */

var MUT_LABELS = { rainbow: "RAINBOW", radioactive: "RADIOACTIVE", diamond: "DIAMOND" };
var MUT_MULTS = { rainbow: "1.5x", radioactive: "3.5x", diamond: "3.5x" };
var DISCOUNT_MAP = { common: 10, uncommon: 15, epic: 20, mythic: 23, god: 25, secret: 35, celestial: 50, divine: 100, og: 200 };

function mutationStatusMsg(name, mutation, prefix) {
  if (mutation === "normal") return (prefix || "") + name + ".";
  return (prefix || "") + name + " with " + MUT_LABELS[mutation] + ". Income boosted to " + MUT_MULTS[mutation] + ".";
}

function buyStatusMsg(ch, mutation) {
  if (mutation === "normal") return ch.isLuckyBlock ? "Bought a Lucky Block. Uncover it later from your collection." : "Bought " + ch.name + ". Passive income increased.";
  return ch.isLuckyBlock ? "Bought a " + MUT_LABELS[mutation] + " Lucky Block. Uncover it later from your collection." : "Bought a " + MUT_LABELS[mutation] + " " + ch.name + ". That copy earns " + MUT_MULTS[mutation] + " by itself.";
}

/* ---------- Roll ---------- */

function weightedRoll() {
  var chars = D().characters, total = D().totalCharacterValue, roll = Math.random() * total, running = 0;
  for (var i = 0; i < chars.length; i++) { running += chars[i].value; if (roll <= running) return chars[i]; }
  return chars[chars.length - 1];
}

function getMutationChance(mut) {
  var evt = S().getState().event;
  if (mut === "rainbow") return evt.activeMutation === "rainbow" ? 0.1 : D().CONST.RAINBOW_CHANCE;
  if (mut === "radioactive") return evt.activeMutation === "radioactive" ? 0.1 : D().CONST.RADIOACTIVE_CHANCE;
  if (mut === "diamond") return evt.activeMutation === "diamond" ? 0.1 : D().CONST.DIAMOND_CHANCE;
  return 0;
}

function createRolledCharacter() {
  var base = weightedRoll();
  var rc = getMutationChance("radioactive"), dc = getMutationChance("diamond"), bc = getMutationChance("rainbow");
  var r = Math.random(), mutation = "normal";
  if (r < rc) mutation = "radioactive";
  else if (r < rc + dc) mutation = "diamond";
  else if (r < rc + dc + bc) mutation = "rainbow";
  return { id: base.id, mutation: mutation };
}

function ensureCurrentRoll() { if (!S().getState().currentRoll) S().getState().currentRoll = createRolledCharacter(); }

function getManualRollCost() {
  var cr = S().getState().currentRoll;
  if (!cr) return 0;
  var ch = D().characterById[cr.id];
  return ch ? ch.cost * 0.1 : 0;
}

function setNewRoll(resetTimer) {
  S().getState().currentRoll = createRolledCharacter();
  if (resetTimer) autoRollRemaining = D().CONST.AUTO_ROLL_SECONDS;
}

function doRoll(resetTimer, prefix) {
  if (resetTimer === undefined) resetTimer = true;
  ensureCurrentRoll();
  if (resetTimer) { var cost = getManualRollCost(); if (S().getState().money < cost) return; S().getState().money -= cost; }
  setNewRoll(resetTimer);
  var rolled = D().characterById[S().getState().currentRoll.id];
  UI().setStatus(mutationStatusMsg(rolled.name, S().getState().currentRoll.mutation, prefix));
  fullRender();
}
function rollCharacter(resetTimer) { doRoll(resetTimer, "Rolled "); }
function autoRollCharacter() { doRoll(true, "Auto-rolled "); }

/* ---------- Buy & Sell ---------- */

function grantOwnedCharacter(cid, mutation, amount) {
  if (amount === undefined) amount = 1;
  var st = S().getState();
  if (!st.owned[cid]) st.owned[cid] = S().normalizeOwnedEntry(cid);
  st.owned[cid][U().getMutationConfig(mutation).countKey] += amount;
}

function sellOwnedCharacter(cid, mutKey) {
  var st = S().getState(), entry = st.owned[cid];
  if (!entry) return;
  if (!mutKey) mutKey = "normalCount";
  if (!entry[mutKey] || entry[mutKey] <= 0) return;
  entry[mutKey]--;
  var ch = U().getOwnedCharacterData(cid);
  st.money += Math.floor(ch.cost * 0.5);
  if (!(entry.normalCount + entry.rainbowCount + entry.radioactiveCount + (entry.diamondCount || 0))) {
    delete st.owned[cid];
    if (selectedOwnedCharacterId && selectedOwnedCharacterId.split("|")[0] === cid) selectedOwnedCharacterId = null;
  }
  UI().setStatus("Sold one " + ch.name + " — 50% refund.");
  if (window.GameUI && window.GameUI.hideFloatingViewer) window.GameUI.hideFloatingViewer();
  fullRender();
}

function buyCurrentCharacter() {
  var st = S().getState(); ensureCurrentRoll();
  var current = st.currentRoll, ch = D().characterById[current.id];

  var used = U().getUsedSlots(st), max = U().getMaxSlots(st.rebirthCount);
  if (used >= max) { UI().setStatus("Inventory full (" + used + "/" + max + ")! Rebirth for more slots."); fullRender(); return; }

  var tier = U().getRarityLabel(ch.value, undefined, ch.tier).className;
  var fraction = DISCOUNT_MAP[tier] || 0;
  var tokenDiscount = (st.mathTokens > 0 && fraction > 0) ? Math.floor(ch.cost / fraction) : 0;
  var finalCost = Math.max(0, ch.cost - tokenDiscount);

  if (st.money < finalCost) {
    UI().setStatus((st.mathTokens || 0) <= 0 ? "No money and no tokens! Play Math Challenge to earn tokens." : "Need " + U().formatMoney(finalCost) + " to buy " + ch.name + ". You have " + st.mathTokens + " token(s).");
    fullRender(); return;
  }

  st.money -= finalCost;
  if (tokenDiscount > 0) st.mathTokens = Math.max(0, st.mathTokens - 1);
  grantOwnedCharacter(current.id, current.mutation);
  UI().setStatus(buyStatusMsg(ch, current.mutation));
  setNewRoll(true);
  selectedOwnedCharacterId = current.id;
  fullRender();
}

/* ---------- Income ---------- */

function getTotalIncomePerSecond() {
  var st = S().getState(), cashMult = U().getCashMultiplierForRebirthCount(st.rebirthCount);
  var RW = D().CONST.RAINBOW_MULTIPLIER, RC = D().CONST.RADIOACTIVE_MULTIPLIER, DM = D().CONST.DIAMOND_MULTIPLIER;
  var total = 0;
  Object.values(st.owned).forEach(function (e) {
    var inc = U().getOwnedCharacterData(e.id).income;
    total += (e.normalCount * inc + e.rainbowCount * inc * RW + e.radioactiveCount * inc * RC + (e.diamondCount || 0) * inc * DM) * cashMult;
  });
  return total;
}

function awardOfflineIncome() {
  var st = S().getState(), now = Date.now(), elapsed = Math.max(0, (now - st.lastTick) / 1000);
  var income = getTotalIncomePerSecond();
  if (elapsed > 0 && income > 0) st.money += income * elapsed;
  st.lastTick = now;
}

/* ---------- Events ---------- */

function syncEventState() {
  var st = S().getState();
  if (st.event.activeMutation && Date.now() >= st.event.endsAt) { st.event.activeMutation = null; st.event.endsAt = 0; }
}

function startMutationEvent() {
  var st = S().getState(), sel = U().rollByWeight(Object.entries(D().EVENT_MUTATION_WEIGHTS).map(function (e) { return { id: e[0], weight: e[1] }; }), "weight");
  if (!sel) sel = { id: "rainbow" };
  st.event.activeMutation = sel.id; st.event.endsAt = Date.now() + D().CONST.EVENT_DURATION_MS; st.event.playSeconds = 0;
  UI().setStatus(U().getMutationDisplayName(sel.id) + " event started! Boosted for 5 minutes.");
}

function maybeStartMutationEvent() {
  syncEventState();
  var st = S().getState();
  if (!st.event.activeMutation && st.event.playSeconds >= D().CONST.EVENT_INTERVAL_SECONDS) startMutationEvent();
}

/* ---------- Lucky blocks ---------- */

function getLuckyBlockInventory() {
  var lb = S().getState().owned["lucky-block"];
  return { normalCount: (lb && lb.normalCount) || 0, rainbowCount: (lb && lb.rainbowCount) || 0, radioactiveCount: (lb && lb.radioactiveCount) || 0, diamondCount: (lb && lb.diamondCount) || 0 };
}

function doLuckyBlockUncover(oneOnly) {
  var st = S().getState(), uncovered = 0, priority = ["normal", "rainbow", "diamond", "radioactive"];
  while (true) {
    var inv = getLuckyBlockInventory();
    if (inv.normalCount + inv.rainbowCount + inv.radioactiveCount + inv.diamondCount <= 0) break;
    var pick = U().rollByWeight(U().getLuckyBlockPool(D().defaultLuckyBlockIds), "luckyBlockValue");
    if (!pick) break;
    var lb = st.owned["lucky-block"], rm = "normal";
    for (var i = 0; i < priority.length; i++) { var k = U().getMutationConfig(priority[i]).countKey; if (lb[k] > 0) { lb[k]--; rm = priority[i]; break; } }
    grantOwnedCharacter(pick.id, rm);
    uncovered++;
    if (oneOnly) break;
  }
  if (uncovered === 0 && oneOnly) UI().setStatus("No lucky blocks to uncover.");
  else UI().setStatus(oneOnly ? "Uncovered " + pick.name + " from a lucky block." : "Uncovered all lucky blocks. Opened " + uncovered + " total.");
  fullRender();
}
function uncoverLuckyBlock() { doLuckyBlockUncover(true); }
function uncoverAllLuckyBlocks() { doLuckyBlockUncover(false); }

/* ---------- Rebirth ---------- */

function performRebirth() {
  var st = S().getState();
  if (st.rebirthCount >= D().CONST.MAX_REBIRTHS) { UI().setRebirthStatus("Max rebirths reached."); return; }
  var req = U().getRebirthRequirement(st.rebirthCount);
  if (st.money < req) { UI().setRebirthStatus("Need " + U().formatMoney(req) + " to rebirth."); return; }
  st.rebirthCount++; st.money = st.rebirthCount * 10000; st.currentRoll = null;
  st.owned = {}; st.sailing = S().normalizeSailingState();
  st.event = { activeMutation: null, endsAt: 0, playSeconds: 0 }; st.lastTick = Date.now();
  st.owned["noobini-pizzanini"] = S().normalizeOwnedEntry("noobini-pizzanini", { normalCount: 1 });
  ensureCurrentRoll(); fullRender();
  UI().setStatus("Rebirth " + st.rebirthCount + "! Income now " + U().formatMultiplier(U().getCashMultiplierForRebirthCount(st.rebirthCount)) + ".");
  UI().setRebirthStatus("Rebirth " + st.rebirthCount + " complete.");
}

/* ---------- Selection ---------- */

function selectOwnedCharacter(event) {
  var card = event.target.closest("[data-owned-id]");
  if (card) { selectedOwnedCharacterId = card.dataset.ownedId; fullRender(); }
}

function selectOwnedCard(cardEl) {
  var cid = cardEl.getAttribute("data-owned-id");
  if (sellMode && cid) { var p = cid.split("|"); sellOwnedCharacter(p[0], p[1]); return; }
  selectedOwnedCharacterId = cid; fullRender();
  setTimeout(function () {
    var nc = document.querySelector('[data-owned-id="' + cid + '"]');
    if (nc && window.GameUI && window.GameUI.showFloatingViewerInstant) window.GameUI.showFloatingViewerInstant(nc);
  }, 50);
}

/* ---------- Full render ---------- */

function fullRender() {
  var st = S().getState();
  // Validate selected card
  if (selectedOwnedCharacterId) {
    var p = selectedOwnedCharacterId.split("|");
    if (!st.owned[p[0]] || !st.owned[p[0]][p[1]] || st.owned[p[0]][p[1]] <= 0) selectedOwnedCharacterId = null;
  }
  if (!selectedOwnedCharacterId) {
    var ids = Object.keys(st.owned);
    if (ids.length) {
      var first = st.owned[ids[0]], muts = ["normalCount", "rainbowCount", "diamondCount", "radioactiveCount"];
      for (var mi = 0; mi < muts.length; mi++) { if (first[muts[mi]] > 0) { selectedOwnedCharacterId = ids[0] + "|" + muts[mi]; break; } }
    }
  }
  UI().fullRender(selectedOwnedCharacterId, autoRollRemaining);
  syncEventState();
  UI().updateActionButtons(st.money >= (st.currentRoll ? (D().characterById[st.currentRoll.id] && D().characterById[st.currentRoll.id].cost) || Infinity : Infinity), st.money >= getManualRollCost());

  // Sell mode button state
  var sb = document.getElementById("sellModeButton");
  if (sb) {
    var badge = sb.querySelector(".inventory-toggle-badge");
    sb.classList.toggle("sell-active", sellMode);
    if (badge) { badge.textContent = sellMode ? "ON" : "OFF"; badge.style.background = sellMode ? "#c62828" : ""; }
  }

  ["Rebirth", "Admin", "Sailing", "Accounts"].forEach(function (m) { var mod = window[m]; if (mod && mod.render) mod.render(); });
  S().saveState();
}

/* ---------- Tick ---------- */

function checkPlaytimeMilestones(st) {
  var milestones = D().CONST.PLAYTIME_MILESTONES;
  var claimed = (localStorage.getItem("brainrot-claimed") || "").split(",").filter(Boolean).map(Number);
  var nextIdx = -1;
  for (var mi = 0; mi < milestones.length; mi++) { if (claimed.indexOf(mi) === -1) { nextIdx = mi; break; } }

  var pd = document.getElementById("totalPlaytimeDisplay");
  if (pd) {
    if (nextIdx >= 0 && nextIdx < milestones.length) {
      var rem = milestones[nextIdx].seconds - st.totalPlaySeconds;
      pd.textContent = rem > 0 ? Math.floor(rem / 60) + "m " + (rem % 60) + "s" : "Claim!";
    } else { pd.textContent = "All done!"; }
  }
  if (nextIdx >= 0 && nextIdx < milestones.length && st.totalPlaySeconds >= milestones[nextIdx].seconds) {
    var card = document.getElementById("playtimeRewardCard"), label = document.getElementById("playtimeRewardLabel"), btn = document.getElementById("playtimeRewardButton");
    if (card && label && btn) {
      card.classList.remove("hidden");
      var m = milestones[nextIdx];
      label.textContent = "Milestone: " + m.label + " — " + (m.reward.type === "money" ? U().formatMoney(m.reward.amount) : m.reward.minRarity.toUpperCase() + " brainrot");
      btn.onclick = function () {
        if (m.reward.type === "money") {
          S().getState().money += m.reward.amount;
          UI().setStatus("Playtime reward: " + U().formatMoney(m.reward.amount) + " for " + m.label);
        } else {
          var rOrder = ["og", "divine", "celestial", "secret", "mythic", "god", "epic", "uncommon", "common"];
          var minI = rOrder.indexOf(m.reward.minRarity);
          for (var att = 0; att < 1000; att++) {
            var cand = weightedRoll(), rar = U().getRarityLabel(cand.value, undefined, cand.tier).className;
            if (rOrder.indexOf(rar) <= minI) { grantOwnedCharacter(cand.id, "normal", 1); UI().setStatus("Playtime reward: " + rar.toUpperCase() + " " + cand.name + " for " + m.label); break; }
          }
        }
        claimed.push(nextIdx); localStorage.setItem("brainrot-claimed", claimed.join(",")); card.classList.add("hidden"); fullRender();
      };
    }
  }
}

function tickIncome() {
  var st = S().getState(); syncEventState();
  if (window.Sailing && window.Sailing.resolveFinished) window.Sailing.resolveFinished();
  var income = getTotalIncomePerSecond(); window._totalIncomePerSecond = income; st.money += income;
  st.totalPlaySeconds = (st.totalPlaySeconds || 0) + 1;
  checkPlaytimeMilestones(st);
  if (!st.event.activeMutation) { st.event.playSeconds++; maybeStartMutationEvent(); }
  autoRollRemaining--; if (autoRollRemaining <= 0) autoRollCharacter();
  UI().renderTotals(); UI().renderRollTimer(autoRollRemaining); UI().renderEventTimer(); UI().renderPlaytimeRewards();
  if (window.Sailing && window.Sailing.render) window.Sailing.render();
  UI().updateActionButtons(st.money >= (st.currentRoll ? (D().characterById[st.currentRoll.id] && D().characterById[st.currentRoll.id].cost) || Infinity : Infinity), st.money >= getManualRollCost());
  S().saveState();
}

/* ---------- Expose ---------- */

window.Game = {
  getAutoRollRemaining: getAutoRollRemaining, setAutoRollRemaining: setAutoRollRemaining,
  getSelectedOwnedCharacterId: getSelectedOwnedCharacterId, setSelectedOwnedCharacterId: setSelectedOwnedCharacterId,
  weightedRoll: weightedRoll, createRolledCharacter: createRolledCharacter, ensureCurrentRoll: ensureCurrentRoll,
  getManualRollCost: getManualRollCost, setNewRoll: setNewRoll, rollCharacter: rollCharacter, autoRollCharacter: autoRollCharacter,
  grantOwnedCharacter: grantOwnedCharacter, sellOwnedCharacter: sellOwnedCharacter, buyCurrentCharacter: buyCurrentCharacter,
  getTotalIncomePerSecond: getTotalIncomePerSecond, awardOfflineIncome: awardOfflineIncome,
  syncEventState: syncEventState, maybeStartMutationEvent: maybeStartMutationEvent, getMutationChance: getMutationChance,
  getLuckyBlockInventory: getLuckyBlockInventory, rollLuckyBlockCharacter: function () { return U().rollByWeight(U().getLuckyBlockPool(D().defaultLuckyBlockIds), "luckyBlockValue"); },
  uncoverLuckyBlock: uncoverLuckyBlock, uncoverAllLuckyBlocks: uncoverAllLuckyBlocks,
  performRebirth: performRebirth,
  selectOwnedCharacter: selectOwnedCharacter, selectOwnedCard: selectOwnedCard,
  toggleSellMode: toggleSellMode, isSellMode: isSellMode,
  fullRender: fullRender, callModuleRender: function (n) { var m = window[n]; if (m && m.render) m.render(); },
  tickIncome: tickIncome,
};
