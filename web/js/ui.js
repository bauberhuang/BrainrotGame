/* ================================================================
   ui.js — DOM element cache, rendering, and page navigation
   ================================================================ */

var D = () => window.GameData;
var U = () => window.GameUtils;
var S = () => window.GameState;

/* ---------- DOM cache ---------- */

const dom = {};

function cacheDom() {
  const ids = [
    "moneyDisplay", "totalIncomeDisplay",
    "mainPage", "rebirthPage", "adminPage", "sailingPage", "accountPage",
    "rebirthPageButton", "adminAuthButton", "sailingPageButton", "accountPageButton",
    "backToGameButton", "adminBackButton", "sailingBackButton", "accountBackButton",
    "rebirthCountDisplay", "cashMultiplierDisplay", "nextMultiplierDisplay",
    "rebirthRequirementDisplay", "rebirthDescription",
    "miniRebirthButton", "rebirthStatusText",
    "characterName", "rarityTag", "characterFlavor", "characterIncome", "characterCost",
    "rollTimerDisplay",
    "eventTimerCard", "eventTimerLabel", "eventTimerDisplay",
    "spriteImage", "spriteFrame", "traitTag", "rollChanceDisplay",
    "ownedList",
    "statusText", "buyButton", "rollButton",
    "luckyBlockInventoryDisplay", "uncoverLuckyBlockButton", "uncoverAllLuckyBlocksButton",
    "adminAuthView", "adminSpawnerView",
    "adminPasswordInput", "adminPasswordSubmitButton", "adminStatusText",
    "adminMutationSelect", "adminBrainrotSelect", "adminAmountInput", "adminConfirmButton", "adminSpawnAllButton",
    "adminSetMoneyInput", "adminSetRebirthInput", "adminSetMoneyButton", "adminSetRebirthButton",
    "adminEventSelect", "adminSetEventButton", "adminClearEventButton", "adminSpawnerStatusText",
    "sailingBoatImage", "sailingIslandName", "sailingChanceTag", "sailingIslandFlavor",
    "sailingIslandSelect", "sailingBoatSelect", "sailingAmountInput",
    "sailingCostDisplay", "sailingTimerDisplay", "sailingActiveCountDisplay",
    "sailingConfirmButton", "sailingStatusText",
    "playtimeRewardCard", "playtimeRewardLabel", "playtimeRewardButton",
    "totalPlaytimeDisplay",
    "mathPage", "mathPageButton", "mathBackButton",
  ];
  for (const id of ids) {
    dom[id] = document.querySelector(`#${id}`);
  }
}

/* ---------- Page navigation (client-side, no reload) ---------- */

const PAGE_IDS = ["mainPage", "rebirthPage", "adminPage", "sailingPage", "accountPage", "mathPage"];

function showPage(pageName) {
  for (const id of PAGE_IDS) {
    if (dom[id]) dom[id].classList.add("hidden");
  }
  const target = getPageElement(pageName);
  if (target) target.classList.remove("hidden");
}

function getPageElement(pageName) {
  switch (pageName) {
    case "admin": return dom.adminPage;
    case "rebirth": return dom.rebirthPage;
    case "sailing": return dom.sailingPage;
    case "account": return dom.accountPage;
    case "math": return dom.mathPage;
    default: return dom.mainPage;
  }
}

function navigateTo(pageName) {
  window.location.hash = pageName === "home" ? "" : `#${pageName}`;
}

/* ---------- Status messages ---------- */

function setStatus(msg) {
  if (dom.statusText) dom.statusText.textContent = msg;
}

function setRebirthStatus(msg) {
  if (dom.rebirthStatusText) dom.rebirthStatusText.textContent = msg;
}

/* ---------- Image mutation effects ---------- */

function applyMutationToImage(imgEl, mutation) {
  imgEl.className = mutation === "normal" ? "" : `mutation-${mutation}`;
}

function getThemeClassName(mutation) {
  return mutation ? `event-${mutation}` : "";
}

/* ---------- Render functions ---------- */

function renderTotals() {
  const st = S().getState();
  if (dom.moneyDisplay) dom.moneyDisplay.textContent = U().formatMoney(st.money);
  // totalIncome is computed in game.js and stored temporarily
  const income = window._totalIncomePerSecond || 0;
  if (dom.totalIncomeDisplay) dom.totalIncomeDisplay.textContent = `${U().formatMoney(income)}/s`;
}

function renderCurrentRoll() {
  const st = S().getState();
  if (!st.currentRoll) return;

  const roll = st.currentRoll;
  const character = D().characterById[roll.id];
  if (!character) return;

  const income = getUnitIncomeForRoll(roll);
  const rarity = U().getRarityLabel(character.value, U().getPercentNumberFromValue(character.value), character.tier);
  const mutationCfg = U().getMutationConfig(roll.mutation);

  if (dom.characterName) dom.characterName.textContent = character.name;
  if (dom.rarityTag) {
    dom.rarityTag.textContent = rarity.text;
    dom.rarityTag.className = `rarity-tag ${rarity.className}`;
  }
  if (dom.characterFlavor) dom.characterFlavor.textContent = character.flavor;
  if (dom.characterIncome) dom.characterIncome.textContent = `${U().formatMoney(income)}/s`;
  if (dom.characterCost) dom.characterCost.textContent = U().formatMoney(character.cost);
  if (dom.spriteImage) {
    dom.spriteImage.src = character.img;
    dom.spriteImage.alt = character.name;
    applyMutationToImage(dom.spriteImage, roll.mutation);
    dom.spriteImage.classList.toggle("cutout-image", U().isCutoutCharacterImage(character));
  }
  if (dom.rollChanceDisplay) dom.rollChanceDisplay.textContent = rarity.text;
  if (dom.traitTag) {
    dom.traitTag.textContent = mutationCfg.label;
    dom.traitTag.className = `trait-tag ${mutationCfg.className}${roll.mutation === "normal" ? " hidden" : ""}`;
  }
  if (dom.spriteFrame) {
    dom.spriteFrame.classList.remove("rainbow", "radioactive", "diamond");
    if (roll.mutation !== "normal") {
      dom.spriteFrame.classList.add(roll.mutation);
    }
  }
}

function getUnitIncomeForRoll(rolled) {
  const character = D().characterById[rolled.id];
  if (!character) return 0;
  return character.income
    * U().getMutationMultiplier(rolled.mutation)
    * U().getCashMultiplierForRebirthCount(S().getState().rebirthCount);
}

function renderRollTimer(remaining) {
  if (dom.rollTimerDisplay) dom.rollTimerDisplay.textContent = `${remaining}s`;
}

function renderEventTimer() {
  const st = S().getState();
  document.body.classList.remove("event-rainbow", "event-radioactive", "event-diamond");

  if (!st.event.activeMutation) {
    if (dom.eventTimerCard) dom.eventTimerCard.classList.add("hidden");
    return;
  }

  const mutationCfg = U().getMutationConfig(st.event.activeMutation);
  const remaining = Math.max(0, st.event.endsAt - Date.now());

  if (dom.eventTimerCard) {
    dom.eventTimerCard.classList.remove("hidden");
    dom.eventTimerCard.className = `event-timer-card ${mutationCfg.className}`;
  }
  if (dom.eventTimerLabel) dom.eventTimerLabel.textContent = `${mutationCfg.label} Event Ends In`;
  if (dom.eventTimerDisplay) dom.eventTimerDisplay.textContent = U().formatCountdown(remaining);
  document.body.classList.add(getThemeClassName(st.event.activeMutation));
}

function updateActionButtons(canBuy, canManualRoll) {
  if (dom.buyButton) dom.buyButton.disabled = !canBuy;
  if (dom.rollButton) dom.rollButton.disabled = !canManualRoll;
}

function renderCollectionActions() {
  const st = S().getState();
  const lb = st.owned["lucky-block"] || { normalCount: 0, rainbowCount: 0, radioactiveCount: 0, diamondCount: 0 };
  const total = (lb.normalCount || 0) + (lb.rainbowCount || 0) + (lb.radioactiveCount || 0) + (lb.diamondCount || 0);
  const hasAny = total > 0;

  if (dom.luckyBlockInventoryDisplay) {
    dom.luckyBlockInventoryDisplay.textContent = `Lucky Blocks ${total}`;
    dom.luckyBlockInventoryDisplay.classList.toggle("hidden", !hasAny);
  }
  if (dom.uncoverLuckyBlockButton) {
    dom.uncoverLuckyBlockButton.classList.toggle("hidden", false);
    dom.uncoverLuckyBlockButton.disabled = !hasAny;
  }
  if (dom.uncoverAllLuckyBlocksButton) {
    dom.uncoverAllLuckyBlocksButton.classList.toggle("hidden", false);
    dom.uncoverAllLuckyBlocksButton.disabled = !hasAny;
  }
}

function renderOwned(selectedOwnedCharacterId) {
  var st = S().getState();
  var entries = Object.values(st.owned).sort(function (a, b) {
    return U().getOwnedCharacterData(b.id).value - U().getOwnedCharacterData(a.id).value;
  });
  if (!dom.ownedList) return;
  if (entries.length === 0) {
    dom.ownedList.innerHTML = '<div class="empty-state">No brainrots owned yet. Roll something cursed and buy it.</div>';
    return;
  }
  var cashMult = U().getCashMultiplierForRebirthCount(st.rebirthCount);
  var RAINBOW = D().CONST.RAINBOW_MULTIPLIER;
  var RADIOACTIVE = D().CONST.RADIOACTIVE_MULTIPLIER;
  var DIAMOND = D().CONST.DIAMOND_MULTIPLIER;
  var defaultIds = D().defaultLuckyBlockIds;
  var cards = [];
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var ch = U().getOwnedCharacterData(entry.id);
    var isLB = U().isLuckyBlockRewardCharacter(entry.id);
    var rarity = U().getRarityLabel(
      ch.value,
      isLB ? U().getLuckyBlockPercentNumber(D().luckyBlockCharacterById[entry.id], defaultIds)
           : U().getPercentNumberFromValue(ch.value), ch.tier);
    var income = (entry.normalCount * ch.income
      + entry.rainbowCount * ch.income * RAINBOW
      + entry.radioactiveCount * ch.income * RADIOACTIVE
      + (entry.diamondCount || 0) * ch.income * DIAMOND) * cashMult;
    var baseIncome = ch.income * cashMult;
    var sel = selectedOwnedCharacterId === entry.id;
    cards.push(
      '<article onclick="window.Game.selectOwnedCard(this)" class="owned-card' + (sel ? ' selected' : '') + '" data-owned-id="' + entry.id + '">',
      '<img class="owned-thumb' + (U().isCutoutCharacterImage(ch) ? ' cutout-image' : '') + '" src="' + (ch.img || '') + '" alt="" />',
      '<div><p class="owned-name">' + ch.name + '</p>',
      '<p class="owned-meta">' + rarity.text + '</p>' +
      (entry.normalCount > 0 || entry.rainbowCount > 0 || entry.radioactiveCount > 0 || entry.diamondCount > 0 ?
        '<p class="owned-meta">' +
        (entry.normalCount > 0 ? 'Normal ' + entry.normalCount + ' ' : '') +
        (entry.rainbowCount > 0 ? 'Rainbow ' + entry.rainbowCount + ' ' : '') +
        (entry.radioactiveCount > 0 ? 'Radioactive ' + entry.radioactiveCount + ' ' : '') +
        (entry.diamondCount > 0 ? 'Diamond ' + entry.diamondCount : '') +
        '</p>' : ''),
      '<p class="owned-meta">' + U().formatMoney(baseIncome) + '/s each &middot; Total ' + U().formatMoney(income) + '/s</p></div>',
      '</article>');
    // Insert viewer right after the selected card
    if (sel) {
      var vch = ch, vlb = isLB, vrarity = rarity, vinc = vch.income * cashMult;
      cards.push(
        '<div class="viewer-panel">',
        '<div class="panel-title-row"><h2>View Brainrot</h2></div>',
        '<article class="sprite-card compact-viewer">',
        '<div class="sprite-frame viewer-frame"><img src="' + (vch.img || '') + '" alt="" /></div>',
        '<div class="sprite-copy">',
        '<h3 class="viewer-name">' + vch.name + '</h3>',
        '<span class="rarity-tag ' + vrarity.className + '">' + vrarity.text + '</span>',
        '<p class="flavor">' + (vch.flavor || '') + '</p>',
        '<div class="viewer-stats"><span class="viewer-stat"><span>Cost</span><strong>' + U().formatMoney(vch.cost) + '</strong></span><span class="viewer-stat"><span>Money/s</span><strong>' + U().formatMoney(vinc) + '/s</strong></span></div>',
        '</div>',
        '</article>',
        '</div>');
    }
  }
  dom.ownedList.innerHTML = cards.join('');
}

function renderOwnedViewer(selectedOwnedCharacterId) {
  // Rendered inline in renderOwned
}

function fullRender(selectedOwnedCharacterId, autoRollRemaining) {
  renderTotals();
  renderCurrentRoll();
  renderRollTimer(autoRollRemaining);
  renderEventTimer();
  renderCollectionActions();
  renderOwned(selectedOwnedCharacterId);
  renderOwnedViewer(selectedOwnedCharacterId);
  renderPlaytimeRewards();
}

function renderPlaytimeRewards() {
  // Milestone card is now managed directly in tickIncome
}

/* ---------- Event binding helper ---------- */

function bindClick(element, handler) {
  if (element) element.addEventListener("click", handler);
}

/* ---------- Expose on window ---------- */

window.GameUI = {
  dom,
  cacheDom,
  showPage,
  getPageElement,
  navigateTo,
  setStatus,
  setRebirthStatus,
  applyMutationToImage,
  getThemeClassName,
  renderTotals,
  renderCurrentRoll,
  renderRollTimer,
  renderEventTimer,
  updateActionButtons,
  renderCollectionActions,
  renderOwned,
  renderOwnedViewer,
  fullRender,
  renderPlaytimeRewards,
  bindClick,
};
