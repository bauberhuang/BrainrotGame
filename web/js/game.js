/* ================================================================
   game.js — Core game logic: roll, buy, tick, events, rebirth, lucky blocks
   ================================================================ */

var D = () => window.GameData;
var U = () => window.GameUtils;
var S = () => window.GameState;
var UI = () => window.GameUI;

/* ---------- Game state accessors ---------- */

let autoRollRemaining = D().CONST.AUTO_ROLL_SECONDS;
let selectedOwnedCharacterId = null;
let sellMode = false;

function isSellMode() { return sellMode; }
function toggleSellMode() {
  sellMode = !sellMode;
  if (sellMode) {
    selectedOwnedCharacterId = null;
    UI().setStatus("Sell mode ON — tap a brainrot to sell it.");
  } else {
    UI().setStatus("Sell mode OFF.");
  }
  fullRender();
}

function getAutoRollRemaining() { return autoRollRemaining; }
function setAutoRollRemaining(v) { autoRollRemaining = v; }
function getSelectedOwnedCharacterId() { return selectedOwnedCharacterId; }
function setSelectedOwnedCharacterId(v) { selectedOwnedCharacterId = v; }

/* ---------- Roll logic ---------- */

function weightedRoll() {
  var totalValue = D().totalCharacterValue;
  var roll = Math.random() * totalValue;
  var running = 0;
  for (var i = 0; i < D().characters.length; i++) {
    running += D().characters[i].value;
    if (roll <= running) return D().characters[i];
  }
  return D().characters[D().characters.length - 1];
}

function getMutationChance(mutation) {
  const st = S().getState();
  if (mutation === "rainbow") return st.event.activeMutation === "rainbow" ? 0.1 : D().CONST.RAINBOW_CHANCE;
  if (mutation === "radioactive") return st.event.activeMutation === "radioactive" ? 0.1 : D().CONST.RADIOACTIVE_CHANCE;
  if (mutation === "diamond") return st.event.activeMutation === "diamond" ? 0.1 : D().CONST.DIAMOND_CHANCE;
  return 0;
}

function createRolledCharacter() {
  const base = weightedRoll();
  const radioactiveChance = getMutationChance("radioactive");
  const diamondChance = getMutationChance("diamond");
  const rainbowChance = getMutationChance("rainbow");
  const mutationRoll = Math.random();
  let mutation = "normal";

  if (mutationRoll < radioactiveChance) mutation = "radioactive";
  else if (mutationRoll < radioactiveChance + diamondChance) mutation = "diamond";
  else if (mutationRoll < radioactiveChance + diamondChance + rainbowChance) mutation = "rainbow";

  return { id: base.id, mutation };
}

function ensureCurrentRoll() {
  const st = S().getState();
  if (!st.currentRoll) {
    st.currentRoll = createRolledCharacter();
  }
}

function getManualRollCost() {
  const st = S().getState();
  if (!st.currentRoll) return 0;
  const ch = D().characterById[st.currentRoll.id];
  return ch ? ch.cost * 0.1 : 0;
}

function setNewRoll(resetTimer) {
  S().getState().currentRoll = createRolledCharacter();
  if (resetTimer) autoRollRemaining = D().CONST.AUTO_ROLL_SECONDS;
}

function rollCharacter(resetTimer) {
  if (resetTimer === undefined) resetTimer = true;
  const st = S().getState();
  ensureCurrentRoll();

  if (resetTimer) {
    const cost = getManualRollCost();
    if (st.money < cost) return;
    st.money -= cost;
  }

  setNewRoll(resetTimer);
  const rolled = D().characterById[S().getState().currentRoll.id];
  const mutation = S().getState().currentRoll.mutation;

  if (mutation === "rainbow") UI().setStatus(`${rolled.name} rolled with RAINBOW. Income boosted to 1.5x.`);
  else if (mutation === "radioactive") UI().setStatus(`${rolled.name} rolled with RADIOACTIVE. Income boosted to 3.5x.`);
  else if (mutation === "diamond") UI().setStatus(`${rolled.name} rolled with DIAMOND. Income boosted to 3.5x.`);
  else UI().setStatus(`Rolled ${rolled.name}.`);

  fullRender();
}

function autoRollCharacter() {
  setNewRoll(true);
  const rolled = D().characterById[S().getState().currentRoll.id];
  const mutation = S().getState().currentRoll.mutation;

  if (mutation === "rainbow") UI().setStatus(`${rolled.name} auto-rolled with RAINBOW. Income boosted to 1.5x.`);
  else if (mutation === "radioactive") UI().setStatus(`${rolled.name} auto-rolled with RADIOACTIVE. Income boosted to 3.5x.`);
  else if (mutation === "diamond") UI().setStatus(`${rolled.name} auto-rolled with DIAMOND. Income boosted to 3.5x.`);
  else UI().setStatus(`Auto-rolled ${rolled.name}.`);

  fullRender();
}

/* ---------- Buy logic ---------- */

function grantOwnedCharacter(characterId, mutation, amount) {
  if (amount === undefined) amount = 1;
  const st = S().getState();
  if (!st.owned[characterId]) {
    st.owned[characterId] = S().normalizeOwnedEntry(characterId);
  }
  const countKey = U().getMutationConfig(mutation).countKey;
  st.owned[characterId][countKey] += amount;
}

function sellOwnedCharacter(characterId, mutationKey) {
  var st = S().getState();
  var entry = st.owned[characterId];
  if (!entry) return;
  if (!mutationKey) mutationKey = "normalCount";

  if (!entry[mutationKey] || entry[mutationKey] <= 0) return;
  entry[mutationKey] -= 1;

  var ch = U().getOwnedCharacterData(characterId);
  var refund = Math.floor(ch.cost * 0.5);
  st.money += refund;

  var totalLeft = (entry.normalCount || 0) + (entry.rainbowCount || 0) + (entry.radioactiveCount || 0) + (entry.diamondCount || 0);
  if (totalLeft <= 0) {
    delete st.owned[characterId];
    if (getSelectedOwnedCharacterId() === characterId) {
      setSelectedOwnedCharacterId(null);
    }
  }

  UI().setStatus("Sold one " + ch.name + " for " + U().formatMoney(refund) + " (50% refund).");
  if (window.GameUI && window.GameUI.hideFloatingViewer) {
    window.GameUI.hideFloatingViewer();
  }
  fullRender();
}

function buyCurrentCharacter() {
  const st = S().getState();
  ensureCurrentRoll();

  const current = st.currentRoll;
  const ch = D().characterById[current.id];

  // Slot check
  var usedSlots = U().getUsedSlots(st);
  var maxSlots = U().getMaxSlots(st.rebirthCount);
  if (usedSlots >= maxSlots) {
    UI().setStatus("Inventory full (" + usedSlots + "/" + maxSlots + ")! Rebirth to get more slots.");
    fullRender();
    return;
  }

  // Token discount
  var tier = U().getRarityLabel(ch.value, undefined, ch.tier).className;
  var discountMap = { common: 10, uncommon: 15, epic: 20, mythic: 23, god: 25, secret: 35, celestial: 50, divine: 100, og: 200 };
  var fraction = discountMap[tier] || 0;
  var tokenDiscount = 0;
  if (st.mathTokens > 0 && fraction > 0) {
    tokenDiscount = Math.floor(ch.cost / fraction);
  }
  var finalCost = Math.max(0, ch.cost - tokenDiscount);

  if (st.money < finalCost) {
    if ((st.mathTokens || 0) <= 0) {
      UI().setStatus("No money and no tokens! Play Math Challenge to earn tokens.");
    } else {
      UI().setStatus(`You need ${U().formatMoney(finalCost)} to buy ${ch.name}. You have ${st.mathTokens} math token(s).`);
    }
    fullRender();
    return;
  }

  st.money -= finalCost;
  if (tokenDiscount > 0) st.mathTokens = Math.max(0, st.mathTokens - 1);
  grantOwnedCharacter(current.id, current.mutation);

  if (current.mutation === "rainbow") {
    UI().setStatus(ch.isLuckyBlock
      ? "Bought a RAINBOW Lucky Block. Uncover it later from your collection."
      : `Bought a RAINBOW ${ch.name}. That copy earns 1.5x by itself.`);
  } else if (current.mutation === "radioactive") {
    UI().setStatus(ch.isLuckyBlock
      ? "Bought a RADIOACTIVE Lucky Block. Uncover it later from your collection."
      : `Bought a RADIOACTIVE ${ch.name}. That copy earns 3.5x by itself.`);
  } else if (current.mutation === "diamond") {
    UI().setStatus(ch.isLuckyBlock
      ? "Bought a DIAMOND Lucky Block. Uncover it later from your collection."
      : `Bought a DIAMOND ${ch.name}. That copy earns 3.5x by itself.`);
  } else {
    UI().setStatus(ch.isLuckyBlock
      ? "Bought a Lucky Block. Uncover it later from your collection."
      : `Bought ${ch.name}. Passive income increased.`);
  }

  setNewRoll(true);
  selectedOwnedCharacterId = current.id;
  fullRender();
}

/* ---------- Income ---------- */

function getTotalIncomePerSecond() {
  const st = S().getState();
  const cashMult = U().getCashMultiplierForRebirthCount(st.rebirthCount);
  const RAINBOW = D().CONST.RAINBOW_MULTIPLIER;
  const RADIOACTIVE = D().CONST.RADIOACTIVE_MULTIPLIER;
  const DIAMOND = D().CONST.DIAMOND_MULTIPLIER;

  let total = 0;
  for (const entry of Object.values(st.owned)) {
    const ch = U().getOwnedCharacterData(entry.id);
    total += (entry.normalCount * ch.income
      + entry.rainbowCount * ch.income * RAINBOW
      + entry.radioactiveCount * ch.income * RADIOACTIVE
      + (entry.diamondCount || 0) * ch.income * DIAMOND) * cashMult;
  }
  return total;
}

function awardOfflineIncome() {
  const st = S().getState();
  const now = Date.now();
  const elapsed = Math.max(0, (now - st.lastTick) / 1000);
  const totalIncome = getTotalIncomePerSecond();
  if (elapsed > 0 && totalIncome > 0) {
    st.money += totalIncome * elapsed;
  }
  st.lastTick = now;
}

/* ---------- Events ---------- */

function syncEventState() {
  const st = S().getState();
  if (st.event.activeMutation && Date.now() >= st.event.endsAt) {
    st.event.activeMutation = null;
    st.event.endsAt = 0;
  }
}

function chooseMutationEvent() {
  const options = Object.entries(D().EVENT_MUTATION_WEIGHTS).map(([id, weight]) => ({ id, weight }));
  return U().rollByWeight(options, "weight")?.id || "rainbow";
}

function startMutationEvent() {
  const st = S().getState();
  const selected = chooseMutationEvent();
  st.event.activeMutation = selected;
  st.event.endsAt = Date.now() + D().CONST.EVENT_DURATION_MS;
  st.event.playSeconds = 0;
  UI().setStatus(`${U().getMutationDisplayName(selected)} event started. That mutation is boosted for 5 minutes.`);
}

function maybeStartMutationEvent() {
  syncEventState();
  const st = S().getState();
  if (!st.event.activeMutation && st.event.playSeconds >= D().CONST.EVENT_INTERVAL_SECONDS) {
    startMutationEvent();
  }
}

/* ---------- Lucky blocks ---------- */

function getLuckyBlockInventory() {
  const lb = S().getState().owned["lucky-block"];
  return {
    normalCount: lb?.normalCount || 0,
    rainbowCount: lb?.rainbowCount || 0,
    radioactiveCount: lb?.radioactiveCount || 0,
    diamondCount: lb?.diamondCount || 0,
  };
}

function rollLuckyBlockCharacter() {
  const pool = U().getLuckyBlockPool(D().defaultLuckyBlockIds);
  return U().rollByWeight(pool, "luckyBlockValue");
}

function uncoverLuckyBlock() {
  const inv = getLuckyBlockInventory();
  if (inv.normalCount + inv.rainbowCount + inv.radioactiveCount + inv.diamondCount <= 0) {
    UI().setStatus("You do not have any lucky blocks to uncover.");
    fullRender();
    return;
  }

  const uncovered = rollLuckyBlockCharacter();
  if (!uncovered) {
    UI().setStatus("Lucky block pool is empty right now.");
    return;
  }

  const st = S().getState();
  const lb = st.owned["lucky-block"];
  const priorityOrder = ["normal", "rainbow", "diamond", "radioactive"];
  let rewardMutation = "normal";
  for (const mut of priorityOrder) {
    const key = U().getMutationConfig(mut).countKey;
    if (lb[key] > 0) {
      lb[key] -= 1;
      rewardMutation = mut;
      break;
    }
  }

  grantOwnedCharacter(uncovered.id, rewardMutation);
  UI().setStatus(
    rewardMutation === "normal"
      ? `Uncovered ${uncovered.name} from your lucky block.`
      : `Uncovered a ${U().getMutationDisplayName(rewardMutation)} ${uncovered.name} from your lucky block.`,
  );
  fullRender();
}

function uncoverAllLuckyBlocks() {
  const st = S().getState();
  let uncoveredCount = 0;

  const priorityOrder = ["normal", "rainbow", "diamond", "radioactive"];

  while (true) {
    const inv = getLuckyBlockInventory();
    const remaining = inv.normalCount + inv.rainbowCount + inv.radioactiveCount + inv.diamondCount;
    if (remaining <= 0) break;

    const uncovered = rollLuckyBlockCharacter();
    if (!uncovered) break;

    const lb = st.owned["lucky-block"];
    let rewardMutation = "normal";
    for (const mut of priorityOrder) {
      const key = U().getMutationConfig(mut).countKey;
      if (lb[key] > 0) {
        lb[key] -= 1;
        rewardMutation = mut;
        break;
      }
    }

    grantOwnedCharacter(uncovered.id, rewardMutation);
    uncoveredCount += 1;
  }

  UI().setStatus(`Uncovered all lucky blocks. Opened ${uncoveredCount} in total.`);
  fullRender();
}

/* ---------- Rebirth ---------- */

function performRebirth() {
  const st = S().getState();

  if (st.rebirthCount >= D().CONST.MAX_REBIRTHS) {
    UI().setRebirthStatus("You already reached the max rebirth level.");
    return;
  }

  const requirement = U().getRebirthRequirement(st.rebirthCount);
  if (st.money < requirement) {
    UI().setRebirthStatus(`You need ${U().formatMoney(requirement)} cash before you can rebirth.`);
    return;
  }

  st.rebirthCount += 1;
  st.money = st.rebirthCount * 10000;
  st.currentRoll = null;
  st.owned = {};
  st.sailing = S().normalizeSailingState();
  st.event = { activeMutation: null, endsAt: 0, playSeconds: 0 };
  st.lastTick = Date.now();

  // Guaranteed starter brainrot so you never game-over
  st.owned["noobini-pizzanini"] = S().normalizeOwnedEntry("noobini-pizzanini", { normalCount: 1 });

  ensureCurrentRoll();
  fullRender();
  UI().setStatus(`Rebirth complete. All brainrots now earn ${U().formatMultiplier(U().getCashMultiplierForRebirthCount(st.rebirthCount))}.`);
  UI().setRebirthStatus(`Rebirth ${st.rebirthCount} complete. Come back when you are ready for the next one.`);
}

/* ---------- Owned character selection ---------- */

function selectOwnedCharacter(event) {
  var card = event.target.closest("[data-owned-id]");
  if (!card) return;
  selectedOwnedCharacterId = card.dataset.ownedId;
  fullRender();
}

function selectOwnedCard(cardEl) {
  var cardId = cardEl.getAttribute("data-owned-id");
  if (sellMode && cardId) {
    var parts = cardId.split("|");
    sellOwnedCharacter(parts[0], parts[1]);
    return;
  }
  selectedOwnedCharacterId = cardId;
  fullRender();
  setTimeout(function () {
    var newCard = document.querySelector('[data-owned-id="' + selectedOwnedCharacterId + '"]');
    if (newCard && window.GameUI && window.GameUI.showFloatingViewerInstant) {
      window.GameUI.showFloatingViewerInstant(newCard);
    }
  }, 50);
}

/* ---------- Full render (calls UI + module renders) ---------- */

function callModuleRender(name) {
  const mod = window[name];
  if (mod && typeof mod.render === "function") mod.render();
}

function fullRender() {
  // selectedOwnedCharacterId is now "characterId|mutationKey"
  const st = S().getState();
  if (selectedOwnedCharacterId) {
    var parts = selectedOwnedCharacterId.split("|");
    var cid = parts[0];
    var mkey = parts[1];
    if (!st.owned[cid] || !st.owned[cid][mkey] || st.owned[cid][mkey] <= 0) {
      selectedOwnedCharacterId = null;
    }
  }
  if (!selectedOwnedCharacterId) {
    // Pick first available mutation group
    var ownedIds = Object.keys(st.owned);
    if (ownedIds.length > 0) {
      var first = st.owned[ownedIds[0]];
      var muts = ["normalCount","rainbowCount","diamondCount","radioactiveCount"];
      for (var mi = 0; mi < muts.length; mi++) {
        if (first[muts[mi]] > 0) {
          selectedOwnedCharacterId = ownedIds[0] + "|" + muts[mi];
          break;
        }
      }
    }
  }

  UI().fullRender(selectedOwnedCharacterId, autoRollRemaining);

  syncEventState();
  const canBuy = st.money >= (st.currentRoll ? D().characterById[st.currentRoll.id]?.cost || Infinity : Infinity);
  const canManualRoll = st.money >= getManualRollCost();
  UI().updateActionButtons(canBuy, canManualRoll);

  // Update sell mode button
  var sellBtn = document.getElementById("sellModeButton");
  if (sellBtn) {
    var badge = sellBtn.querySelector(".inventory-toggle-badge");
    if (sellMode) {
      sellBtn.classList.add("sell-active");
      if (badge) { badge.textContent = "ON"; badge.style.background = "#c62828"; }
    } else {
      sellBtn.classList.remove("sell-active");
      if (badge) { badge.textContent = "OFF"; badge.style.background = ""; }
    }
  }

  callModuleRender("Rebirth");
  callModuleRender("Admin");
  callModuleRender("Sailing");
  callModuleRender("Accounts");

  S().saveState();
}

/* ---------- Game tick (called every 1s) ---------- */

function tickIncome() {
  const st = S().getState();
  syncEventState();

  // Resolve sailing jobs
  if (typeof window.Sailing !== "undefined" && window.Sailing.resolveFinished) {
    window.Sailing.resolveFinished();
  }

  const income = getTotalIncomePerSecond();
  window._totalIncomePerSecond = income;
  st.money += income;

  st.totalPlaySeconds = (st.totalPlaySeconds || 0) + 1;

  // Live update playtime display with countdown to next reward
  var pd = document.getElementById("totalPlaytimeDisplay");
  var milestones = D().CONST.PLAYTIME_MILESTONES;
  // Find the first unclaimed milestone
  var claimedStr = localStorage.getItem("brainrot-claimed") || "";
  var claimed = claimedStr ? claimedStr.split(",").map(Number) : [];
  var nextIdx = -1;
  for (var mi = 0; mi < milestones.length; mi++) {
    if (claimed.indexOf(mi) === -1) { nextIdx = mi; break; }
  }
  if (pd) {
    var ts = st.totalPlaySeconds;
    if (nextIdx >= 0 && nextIdx < milestones.length) {
      var remaining = milestones[nextIdx].seconds - ts;
      if (remaining > 0) {
        var rm = Math.floor(remaining / 60);
        var rs = remaining % 60;
        pd.textContent = rm > 0 ? rm + "m " + rs + "s" : rs + "s";
      } else {
        pd.textContent = "Claim!";
      }
    } else {
      pd.textContent = "All done!";
    }
  }

  // Direct milestone check
  if (nextIdx >= 0 && nextIdx < milestones.length && st.totalPlaySeconds >= milestones[nextIdx].seconds) {
    var card = document.getElementById("playtimeRewardCard");
    var label = document.getElementById("playtimeRewardLabel");
    var btn = document.getElementById("playtimeRewardButton");
    if (card && label && btn) {
      card.classList.remove("hidden");
      var m = milestones[nextIdx];
      label.textContent = "Milestone: " + m.label + " — " + (m.reward.type === "money" ? U().formatMoney(m.reward.amount) : m.reward.minRarity.toUpperCase() + " brainrot");
      btn.onclick = function() {
        if (m.reward.type === "money") {
          S().getState().money += m.reward.amount;
          UI().setStatus("Playtime reward: " + U().formatMoney(m.reward.amount) + " for " + m.label + " played!");
        } else {
          var minRar = m.reward.minRarity;
          var rOrder = ["og","divine","celestial","secret","mythic","god","epic","uncommon","common"];
          var minI = rOrder.indexOf(minRar);
          for (var att = 0; att < 1000; att++) {
            var cand = weightedRoll();
            var rar = U().getRarityLabel(cand.value, undefined, cand.tier).className;
            if (rOrder.indexOf(rar) <= minI) {
              grantOwnedCharacter(cand.id, "normal", 1);
              UI().setStatus("Playtime reward: " + rar.toUpperCase() + " " + cand.name + " for " + m.label + "!");
              break;
            }
          }
        }
        claimed.push(nextIdx);
        localStorage.setItem("brainrot-claimed", claimed.join(","));
        card.classList.add("hidden");
        fullRender();
      };
    }
  }

  if (!st.event.activeMutation) {
    st.event.playSeconds += 1;
    maybeStartMutationEvent();
  }

  autoRollRemaining -= 1;
  if (autoRollRemaining <= 0) {
    autoRollCharacter();
  }

  UI().renderTotals();
  UI().renderRollTimer(autoRollRemaining);
  UI().renderEventTimer();
  UI().renderPlaytimeRewards();

  callModuleRender("Sailing");

  const canBuy = st.money >= (st.currentRoll ? D().characterById[st.currentRoll.id]?.cost || Infinity : Infinity);
  const canManualRoll = st.money >= getManualRollCost();
  UI().updateActionButtons(canBuy, canManualRoll);

  S().saveState();
}




/* ---------- Expose on window ---------- */

window.Game = {
  // state
  getAutoRollRemaining,
  setAutoRollRemaining,
  getSelectedOwnedCharacterId,
  setSelectedOwnedCharacterId,
  // roll
  weightedRoll,
  createRolledCharacter,
  ensureCurrentRoll,
  getManualRollCost,
  setNewRoll,
  rollCharacter,
  autoRollCharacter,
  // buy
  grantOwnedCharacter,
  sellOwnedCharacter,
  buyCurrentCharacter,
  // income
  getTotalIncomePerSecond,
  awardOfflineIncome,
  // events
  syncEventState,
  maybeStartMutationEvent,
  getMutationChance,
  // lucky blocks
  getLuckyBlockInventory,
  rollLuckyBlockCharacter,
  uncoverLuckyBlock,
  uncoverAllLuckyBlocks,
  // rebirth
  performRebirth,
  // render
  selectOwnedCharacter,
  selectOwnedCard,
  toggleSellMode,
  isSellMode,
  fullRender,
  callModuleRender,
  // tick
  tickIncome,
  // playtime milestones
};
