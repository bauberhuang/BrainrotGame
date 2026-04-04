const characters = [
  {
    id: "67",
    name: "67",
    value: 6,
    cost: 10,
    income: 1,
    flavor: "67! the chaos in 2025",
    img: "img/67.jpg",
  },
  {
    id: "tung-tung-tung-sahur",
    name: "Tung Tung Tung Sahur",
    value: 3,
    cost: 50,
    income: 5,
    flavor: "the original brainrot and also the first brainrot made by OG Noxa",
    img: "img/ttt.webp",
  },
  {
    id: "ballerina-cappuccina",
    name: "Ballerina Cappuccina",
    value: 3,
    cost: 50,
    income: 5,
    flavor: "Tung tung's wife",
    img: "img/ballerina.jfif",
  },
  {
    id: "tralalero-tralala",
    name: "Tralalelo Tralala",
    value: 3,
    cost: 50,
    income: 5,
    flavor: "tung tung's friend who is beside the sea",
    img: "img/tralalelo.jfif",
  },
  {
    id: "fluri-flura",
    name: "Fluri Flura",
    value: 4.5,
    cost: 25,
    income: 2.5,
    flavor: "flying across the sea!",
    img: "img/FluriFlura.webp",
  },
  {
    id: "strawberry-elephant",
    name: "Strawberry Elephant",
    value: 1.5,
    cost: 100,
    income: 10,
    flavor: 'the first "brainrot" ever made, made in 2009',
    img: "img/Strawberry-elephant.jpg",
  },
  {
    id: "lucky-block",
    name: "Lucky Block",
    value: 2,
    cost: 75,
    income: 0,
    flavor: "A sealed brainrot box. Buy it, stash it, then uncover it inside your collection.",
    img: "img/lucky-block.jfif",
    isLuckyBlock: true,
  },
];

const luckyBlockCharacters = [
  {
    id: "Tortugini-dragonfruitini",
    name: "Tortugini dragonfruitini",
    value: 0,
    luckyBlockValue: 15,
    income: 20,
    img: "img/tort.jfif",
    luckyBlockOnly: false,
  },
  {
    id: "pot-hotspot",
    name: "Pot Hotspot",
    value: 0,
    luckyBlockValue: 5,
    income: 75,
    img: "img/Pot-Hotspot.png",
    luckyBlockOnly: false,
  },
  {
    id: "dragon-cannelloni",
    name: "Dragon Cannelloni",
    value: 0,
    luckyBlockValue: 0.4,
    income: 100,
    img: "img/dragon.webp",
    luckyBlockOnly: false,
  },
  {
    id: "classic-dragon",
    name: "Classic Dragon",
    value: 0,
    luckyBlockValue: 0.0008,
    income: 10000000,
    img: "img/chinese-dragon.webp",
    luckyBlockOnly: false,
  },
];

const RAINBOW_CHANCE = 0.1;
const RAINBOW_MULTIPLIER = 1.5;
const RADIOACTIVE_CHANCE = 0.01;
const RADIOACTIVE_MULTIPLIER = 3.5;
const MAX_REBIRTHS = 20;
const AUTO_ROLL_SECONDS = 10;
const EVENT_INTERVAL_SECONDS = 60 * 60;
const EVENT_DURATION_MS = 5 * 60 * 1000;
const SAVE_KEY = "brainrot-idle-save-v2";
const ADMIN_PASSWORD = "Ab141130";

const MUTATIONS = {
  normal: {
    label: "NORMAL",
    multiplier: 1,
    countKey: "normalCount",
    className: "normal",
  },
  rainbow: {
    label: "RAINBOW",
    multiplier: RAINBOW_MULTIPLIER,
    countKey: "rainbowCount",
    className: "rainbow",
  },
  radioactive: {
    label: "RADIOACTIVE",
    multiplier: RADIOACTIVE_MULTIPLIER,
    countKey: "radioactiveCount",
    className: "radioactive",
  },
};

const EVENT_MUTATION_WEIGHTS = {
  rainbow: 4,
  radioactive: 1,
};

const dom = {
  moneyDisplay: document.querySelector("#moneyDisplay"),
  totalIncomeDisplay: document.querySelector("#totalIncomeDisplay"),
  mainPage: document.querySelector("#mainPage"),
  rebirthPage: document.querySelector("#rebirthPage"),
  adminPage: document.querySelector("#adminPage"),
  rebirthPageButton: document.querySelector("#rebirthPageButton"),
  adminAuthButton: document.querySelector("#adminAuthButton"),
  backToGameButton: document.querySelector("#backToGameButton"),
  adminBackButton: document.querySelector("#adminBackButton"),
  rebirthCountDisplay: document.querySelector("#rebirthCountDisplay"),
  cashMultiplierDisplay: document.querySelector("#cashMultiplierDisplay"),
  nextMultiplierDisplay: document.querySelector("#nextMultiplierDisplay"),
  rebirthRequirementDisplay: document.querySelector("#rebirthRequirementDisplay"),
  rebirthDescription: document.querySelector("#rebirthDescription"),
  miniRebirthButton: document.querySelector("#miniRebirthButton"),
  rebirthStatusText: document.querySelector("#rebirthStatusText"),
  characterName: document.querySelector("#characterName"),
  rarityTag: document.querySelector("#rarityTag"),
  characterFlavor: document.querySelector("#characterFlavor"),
  characterIncome: document.querySelector("#characterIncome"),
  characterCost: document.querySelector("#characterCost"),
  rollTimerDisplay: document.querySelector("#rollTimerDisplay"),
  eventTimerCard: document.querySelector("#eventTimerCard"),
  eventTimerLabel: document.querySelector("#eventTimerLabel"),
  eventTimerDisplay: document.querySelector("#eventTimerDisplay"),
  spriteImage: document.querySelector("#spriteImage"),
  spriteFrame: document.querySelector("#spriteFrame"),
  traitTag: document.querySelector("#traitTag"),
  rollChanceDisplay: document.querySelector("#rollChanceDisplay"),
  ownedList: document.querySelector("#ownedList"),
  ownedViewerPanel: document.querySelector("#ownedViewerPanel"),
  ownedViewerType: document.querySelector("#ownedViewerType"),
  ownedViewerImage: document.querySelector("#ownedViewerImage"),
  ownedViewerName: document.querySelector("#ownedViewerName"),
  ownedViewerRarity: document.querySelector("#ownedViewerRarity"),
  ownedViewerFlavor: document.querySelector("#ownedViewerFlavor"),
  ownedViewerCost: document.querySelector("#ownedViewerCost"),
  ownedViewerIncome: document.querySelector("#ownedViewerIncome"),
  statusText: document.querySelector("#statusText"),
  buyButton: document.querySelector("#buyButton"),
  rollButton: document.querySelector("#rollButton"),
  luckyBlockInventoryDisplay: document.querySelector("#luckyBlockInventoryDisplay"),
  uncoverLuckyBlockButton: document.querySelector("#uncoverLuckyBlockButton"),
  uncoverAllLuckyBlocksButton: document.querySelector("#uncoverAllLuckyBlocksButton"),
  adminAuthView: document.querySelector("#adminAuthView"),
  adminSpawnerView: document.querySelector("#adminSpawnerView"),
  adminPasswordInput: document.querySelector("#adminPasswordInput"),
  adminPasswordSubmitButton: document.querySelector("#adminPasswordSubmitButton"),
  adminStatusText: document.querySelector("#adminStatusText"),
  adminMutationSelect: document.querySelector("#adminMutationSelect"),
  adminBrainrotSelect: document.querySelector("#adminBrainrotSelect"),
  adminAmountInput: document.querySelector("#adminAmountInput"),
  adminConfirmButton: document.querySelector("#adminConfirmButton"),
  adminSetMoneyInput: document.querySelector("#adminSetMoneyInput"),
  adminSetRebirthInput: document.querySelector("#adminSetRebirthInput"),
  adminSetMoneyButton: document.querySelector("#adminSetMoneyButton"),
  adminSetRebirthButton: document.querySelector("#adminSetRebirthButton"),
  adminEventSelect: document.querySelector("#adminEventSelect"),
  adminSetEventButton: document.querySelector("#adminSetEventButton"),
  adminClearEventButton: document.querySelector("#adminClearEventButton"),
  adminSpawnerStatusText: document.querySelector("#adminSpawnerStatusText"),
};

const characterById = Object.fromEntries(characters.map((entry) => [entry.id, entry]));
const totalCharacterValue = characters.reduce((total, entry) => total + entry.value, 0);
const luckyBlockCharacterById = Object.fromEntries(
  luckyBlockCharacters.map((entry) => [entry.id, entry]),
);
const defaultLuckyBlockIds = luckyBlockCharacters
  .filter((entry) => !entry.luckyBlockOnly)
  .map((entry) => entry.id);

const state = loadState();
let autoRollRemaining = AUTO_ROLL_SECONDS;
let adminAuthorized = false;
let selectedOwnedCharacterId = null;

function createDefaultState() {
  return {
    money: 10,
    currentRoll: null,
    owned: {},
    rebirthCount: 0,
    event: {
      activeMutation: null,
      endsAt: 0,
      playSeconds: 0,
    },
    lastTick: Date.now(),
  };
}

function normalizeOwnedEntry(id, entry = {}) {
  const legacyCount = Number(entry.count) || 0;
  return {
    id,
    normalCount: Number(entry.normalCount) || legacyCount,
    rainbowCount: Number(entry.rainbowCount) || 0,
    radioactiveCount: Number(entry.radioactiveCount) || 0,
  };
}

function normalizeCurrentRoll(currentRoll) {
  if (!currentRoll || !currentRoll.id) {
    return null;
  }

  const legacyMutation = currentRoll.mutation || (currentRoll.rainbow ? "rainbow" : "normal");
  return {
    id: currentRoll.id,
    mutation: MUTATIONS[legacyMutation] ? legacyMutation : "normal",
  };
}

function loadState() {
  const fallback = createDefaultState();

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    const normalizedOwned = Object.fromEntries(
      Object.entries(parsed.owned || {}).map(([id, entry]) => [id, normalizeOwnedEntry(id, entry)]),
    );
    const parsedEvent = parsed.event || {};

    return {
      money: Number(parsed.money) || 10,
      currentRoll: normalizeCurrentRoll(parsed.currentRoll),
      owned: normalizedOwned,
      rebirthCount: Math.max(0, Math.min(MAX_REBIRTHS, Number(parsed.rebirthCount) || 0)),
      event: {
        activeMutation: MUTATIONS[parsedEvent.activeMutation] ? parsedEvent.activeMutation : null,
        endsAt: Number(parsedEvent.endsAt) || 0,
        playSeconds: Math.max(0, Number(parsedEvent.playSeconds) || 0),
      },
      lastTick: Number(parsed.lastTick) || Date.now(),
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      ...state,
      lastTick: Date.now(),
    }),
  );
}

function formatMoney(value) {
  const tiers = [
    { limit: 1e18, suffix: "QI", divisor: 1e18, decimals: 3 },
    { limit: 1e15, suffix: "QA", divisor: 1e15, decimals: 3 },
    { limit: 1e12, suffix: "T", divisor: 1e12, decimals: 3 },
    { limit: 1e9, suffix: "B", divisor: 1e9, decimals: 3 },
    { limit: 1e6, suffix: "M", divisor: 1e6, decimals: 3 },
    { limit: 1e3, suffix: "K", divisor: 1e3, decimals: 2 },
  ];

  const absoluteValue = Math.abs(value);
  for (const tier of tiers) {
    if (absoluteValue >= tier.limit) {
      return `$${(value / tier.divisor).toFixed(tier.decimals)}${tier.suffix}`;
    }
  }

  return `$${value.toFixed(2)}`;
}

function formatMultiplier(value) {
  return `${value.toFixed(1)}x`;
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function getRarityLabel(value, percent = null) {
  if (percent !== null && percent < 0.1) {
    return {
      text: "SECRET",
      className: "secret",
    };
  }

  if (value <= 0.9) {
    return {
      text: "MYTHIC",
      className: "mythic",
    };
  }

  if (value <= 2) {
    return {
      text: "GOD",
      className: "god",
    };
  }

  if (value <= 3.5) {
    return {
      text: "EPIC",
      className: "epic",
    };
  }

  if (value <= 5) {
    return {
      text: "UNCOMMON",
      className: "uncommon",
    };
  }

  return {
    text: "COMMON",
    className: "common",
  };
}

function getValueFraction(value) {
  return `${value}/${totalCharacterValue}`;
}

function formatPercentFromValue(value) {
  const percent = (value / totalCharacterValue) * 100;
  const rounded = Math.round(percent * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
}

function getPercentNumberFromValue(value) {
  return Math.round(((value / totalCharacterValue) * 100) * 100) / 100;
}

function getValueChanceLabel(value) {
  return `${getValueFraction(value)} (${formatPercentFromValue(value)})`;
}

function getLuckyBlockPool(selectedIds = []) {
  return luckyBlockCharacters.filter((entry) => entry.luckyBlockOnly || selectedIds.includes(entry.id));
}

function getLuckyBlockTotalValue(selectedIds = []) {
  return getLuckyBlockPool(selectedIds).reduce((total, entry) => total + entry.luckyBlockValue, 0);
}

function formatLuckyBlockChanceLabel(character, selectedIds = []) {
  const totalValue = getLuckyBlockTotalValue(selectedIds);
  if (totalValue <= 0) {
    return "0/0 (0%)";
  }

  const percent = (character.luckyBlockValue / totalValue) * 100;
  const rounded = Math.round(percent * 100) / 100;
  const percentLabel = Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
  return `${character.luckyBlockValue}/${totalValue} (${percentLabel})`;
}

function getLuckyBlockPercentNumber(character, selectedIds = []) {
  const totalValue = getLuckyBlockTotalValue(selectedIds);
  if (totalValue <= 0) {
    return 0;
  }

  return Math.round(((character.luckyBlockValue / totalValue) * 100) * 100) / 100;
}

function rollByWeight(items, weightKey) {
  const totalWeight = items.reduce((total, entry) => total + (Number(entry[weightKey]) || 0), 0);
  if (totalWeight <= 0) {
    return null;
  }

  const roll = Math.random() * totalWeight;
  let running = 0;

  for (const item of items) {
    running += Number(item[weightKey]) || 0;
    if (roll <= running) {
      return item;
    }
  }

  return items[items.length - 1] || null;
}

function rollLuckyBlockCharacter(selectedIds = []) {
  const pool = getLuckyBlockPool(selectedIds);
  return rollByWeight(pool, "luckyBlockValue");
}

function getLuckyBlockFlavor(character) {
  if (character.luckyBlockOnly) {
    return "Lucky block special brainrot. It only appears from the lucky block pool.";
  }

  return "Standard lucky block pick. Its spawn chance is based on lucky block value.";
}

function getOwnedCharacterData(characterId) {
  if (characterById[characterId]) {
    return characterById[characterId];
  }

  if (luckyBlockCharacterById[characterId]) {
    const luckyCharacter = luckyBlockCharacterById[characterId];
    return {
      id: luckyCharacter.id,
      name: luckyCharacter.name,
      value: luckyCharacter.luckyBlockValue,
      cost: 0,
      income: luckyCharacter.income || 0,
      flavor: getLuckyBlockFlavor(luckyCharacter),
      img: luckyCharacter.img,
      isLuckyBlockReward: true,
    };
  }

  return {
    id: characterId,
    name: characterId,
    value: 0,
    cost: 0,
    income: 0,
    flavor: "Unknown brainrot reward.",
    img: "",
    isLuckyBlockReward: true,
  };
}

function isCutoutCharacterImage(character) {
  return /\.png$/i.test(character.img || "");
}

function getLuckyBlockInventory() {
  const luckyBlockEntry = state.owned["lucky-block"];
  return {
    normalCount: luckyBlockEntry?.normalCount || 0,
    rainbowCount: luckyBlockEntry?.rainbowCount || 0,
    radioactiveCount: luckyBlockEntry?.radioactiveCount || 0,
  };
}

function getMutationConfig(mutation) {
  return MUTATIONS[mutation] || MUTATIONS.normal;
}

function getMutationMultiplier(mutation) {
  return getMutationConfig(mutation).multiplier;
}

function getMutationDisplayName(mutation) {
  return getMutationConfig(mutation).label;
}

function getMutationChance(mutation) {
  if (mutation === "rainbow") {
    return state.event.activeMutation === "rainbow" ? 0.1 : RAINBOW_CHANCE;
  }

  if (mutation === "radioactive") {
    return state.event.activeMutation === "radioactive" ? 0.1 : RADIOACTIVE_CHANCE;
  }

  return 0;
}

function syncEventState() {
  if (state.event.activeMutation && Date.now() >= state.event.endsAt) {
    state.event.activeMutation = null;
    state.event.endsAt = 0;
  }
}

function chooseMutationEvent() {
  const options = [
    { id: "rainbow", weight: EVENT_MUTATION_WEIGHTS.rainbow },
    { id: "radioactive", weight: EVENT_MUTATION_WEIGHTS.radioactive },
  ];
  return rollByWeight(options, "weight")?.id || "rainbow";
}

function startMutationEvent() {
  const selectedMutation = chooseMutationEvent();
  state.event.activeMutation = selectedMutation;
  state.event.endsAt = Date.now() + EVENT_DURATION_MS;
  state.event.playSeconds = 0;
  setStatus(`${getMutationDisplayName(selectedMutation)} event started. That mutation is boosted for 5 minutes.`);
}

function maybeStartMutationEvent() {
  syncEventState();
  if (!state.event.activeMutation && state.event.playSeconds >= EVENT_INTERVAL_SECONDS) {
    startMutationEvent();
  }
}

function applyMutationToImage(imageElement, mutation) {
  imageElement.className = mutation === "normal" ? "" : `mutation-${mutation}`;
}

function getThemeClassName(mutation) {
  return mutation ? `event-${mutation}` : "";
}

function getOwnedEntry(characterId) {
  if (!state.owned[characterId]) {
    state.owned[characterId] = normalizeOwnedEntry(characterId);
  }

  return state.owned[characterId];
}

function grantOwnedCharacter(characterId, mutation = "normal", amount = 1) {
  const entry = getOwnedEntry(characterId);
  const countKey = getMutationConfig(mutation).countKey;
  entry[countKey] += amount;
}

function setAdminStatus(message) {
  dom.adminStatusText.textContent = message;
}

function setAdminSpawnerStatus(message) {
  dom.adminSpawnerStatusText.textContent = message;
}

function getAdminSpawnables() {
  const combined = [...characters, ...luckyBlockCharacters];
  return combined.filter((entry, index, array) => array.findIndex((item) => item.id === entry.id) === index);
}

function renderAdminBrainrotOptions() {
  if (!dom.adminBrainrotSelect) {
    return;
  }

  const options = getAdminSpawnables()
    .map((entry) => `<option value="${entry.id}">${entry.name}</option>`)
    .join("");
  dom.adminBrainrotSelect.innerHTML = options;
}

function renderAdminMutationOptions() {
  if (!dom.adminMutationSelect) {
    return;
  }

  const options = Object.entries(MUTATIONS)
    .map(([id, mutation], index) => `<option value="${id}">${index + 1} ${mutation.label}</option>`)
    .join("");
  dom.adminMutationSelect.innerHTML = options;
}

function renderAdminEventOptions() {
  if (!dom.adminEventSelect) {
    return;
  }

  const options = Object.entries(EVENT_MUTATION_WEIGHTS)
    .map(([id]) => `<option value="${id}">${getMutationDisplayName(id)}</option>`)
    .join("");
  dom.adminEventSelect.innerHTML = options;
}

function renderAdminTools() {
  renderAdminView();
  if (!adminAuthorized) {
    return;
  }

  dom.adminSetMoneyInput.value = `${Math.floor(state.money * 100) / 100}`;
  dom.adminSetRebirthInput.value = `${state.rebirthCount}`;
  if (dom.adminMutationSelect) {
    dom.adminMutationSelect.value = dom.adminMutationSelect.value || "normal";
  }
  if (dom.adminEventSelect) {
    dom.adminEventSelect.value = state.event.activeMutation || "rainbow";
  }
}

function showOnlyPage(targetPage) {
  dom.mainPage.classList.add("hidden");
  dom.rebirthPage.classList.add("hidden");
  dom.adminPage.classList.add("hidden");
  targetPage.classList.remove("hidden");
}

function renderAdminView() {
  dom.adminAuthView.classList.toggle("hidden", adminAuthorized);
  dom.adminSpawnerView.classList.toggle("hidden", !adminAuthorized);
}

function isLuckyBlockRewardCharacter(characterId) {
  return Boolean(luckyBlockCharacterById[characterId]);
}

function getManualRollCost() {
  if (!state.currentRoll) {
    return 0;
  }

  const character = characterById[state.currentRoll.id];
  return character.cost * 0.1;
}

function getCashMultiplierForRebirthCount(rebirthCount) {
  return 1 + rebirthCount * 0.5;
}

function getNextRebirthMultiplier() {
  return getCashMultiplierForRebirthCount(Math.min(MAX_REBIRTHS, state.rebirthCount + 1));
}

function getRebirthRequirement(rebirthCount) {
  return 1_000_000 * 5 ** rebirthCount;
}

function getOrdinalSuffix(value) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return "th";
  }

  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function weightedRoll() {
  const roll = Math.random() * totalCharacterValue;
  let running = 0;

  for (const character of characters) {
    running += character.value;
    if (roll <= running) {
      return character;
    }
  }

  return characters[characters.length - 1];
}

function createRolledCharacter() {
  const base = weightedRoll();
  const radioactiveChance = getMutationChance("radioactive");
  const rainbowChance = getMutationChance("rainbow");
  const mutationRoll = Math.random();
  let mutation = "normal";

  if (mutationRoll < radioactiveChance) {
    mutation = "radioactive";
  } else if (mutationRoll < radioactiveChance + rainbowChance) {
    mutation = "rainbow";
  }

  return {
    id: base.id,
    mutation,
  };
}

function getUnitIncome(rolledCharacter) {
  const baseCharacter = characterById[rolledCharacter.id];
  return (
    baseCharacter.income *
    getMutationMultiplier(rolledCharacter.mutation) *
    getCashMultiplierForRebirthCount(state.rebirthCount)
  );
}

function getTotalIncomePerSecond() {
  const cashMultiplier = getCashMultiplierForRebirthCount(state.rebirthCount);

  return Object.values(state.owned).reduce((total, entry) => {
    const baseCharacter = getOwnedCharacterData(entry.id);
    const normalIncome = entry.normalCount * baseCharacter.income;
    const rainbowIncome = entry.rainbowCount * baseCharacter.income * RAINBOW_MULTIPLIER;
    const radioactiveIncome = entry.radioactiveCount * baseCharacter.income * RADIOACTIVE_MULTIPLIER;
    return total + (normalIncome + rainbowIncome + radioactiveIncome) * cashMultiplier;
  }, 0);
}

function awardOfflineIncome() {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - state.lastTick) / 1000);
  const totalIncome = getTotalIncomePerSecond();

  if (elapsedSeconds > 0 && totalIncome > 0) {
    state.money += totalIncome * elapsedSeconds;
  }

  state.lastTick = now;
}

function ensureCurrentRoll() {
  syncEventState();
  if (!state.currentRoll) {
    state.currentRoll = createRolledCharacter();
  }
}

function setStatus(message) {
  dom.statusText.textContent = message;
}

function setRebirthStatus(message) {
  dom.rebirthStatusText.textContent = message;
}

function renderCurrentRoll() {
  ensureCurrentRoll();

  const current = state.currentRoll;
  const character = characterById[current.id];
  const income = getUnitIncome(current);
  const rarity = getRarityLabel(character.value, getPercentNumberFromValue(character.value));
  const mutation = getMutationConfig(current.mutation);

  dom.characterName.textContent = character.name;
  dom.rarityTag.textContent = rarity.text;
  dom.rarityTag.className = `rarity-tag ${rarity.className}`;
  dom.characterFlavor.textContent = character.flavor;
  dom.characterIncome.textContent = `${formatMoney(income)}/s`;
  dom.characterCost.textContent = formatMoney(character.cost);
  dom.spriteImage.src = character.img;
  dom.spriteImage.alt = character.name;
  applyMutationToImage(dom.spriteImage, current.mutation);
  dom.spriteImage.classList.toggle("cutout-image", isCutoutCharacterImage(character));
  dom.rollChanceDisplay.textContent = `Value ${getValueChanceLabel(character.value)}`;

  dom.traitTag.textContent = mutation.label;
  dom.traitTag.className = `trait-tag ${mutation.className}${current.mutation === "normal" ? " hidden" : ""}`;
  dom.spriteFrame.classList.toggle("rainbow", current.mutation === "rainbow");
  dom.spriteFrame.classList.toggle("radioactive", current.mutation === "radioactive");
}

function renderRollTimer() {
  dom.rollTimerDisplay.textContent = `${autoRollRemaining}s`;
}

function renderEventTimer() {
  syncEventState();
  document.body.classList.remove("event-rainbow", "event-radioactive");

  if (!state.event.activeMutation) {
    dom.eventTimerCard.classList.add("hidden");
    return;
  }

  const mutation = getMutationConfig(state.event.activeMutation);
  const remaining = Math.max(0, state.event.endsAt - Date.now());

  dom.eventTimerCard.classList.remove("hidden");
  dom.eventTimerCard.className = `event-timer-card ${mutation.className}`;
  dom.eventTimerLabel.textContent = `${mutation.label} Event Ends In`;
  dom.eventTimerDisplay.textContent = formatCountdown(remaining);
  document.body.classList.add(getThemeClassName(state.event.activeMutation));
}

function updateActionButtons() {
  ensureCurrentRoll();

  const current = state.currentRoll;
  const character = characterById[current.id];
  const canBuy = state.money >= character.cost;
  const canManualRoll = state.money >= getManualRollCost();

  dom.buyButton.disabled = !canBuy;
  dom.rollButton.disabled = !canManualRoll;
}

function renderCollectionActions() {
  const luckyBlocks = getLuckyBlockInventory();
  const totalLuckyBlocks = luckyBlocks.normalCount + luckyBlocks.rainbowCount + luckyBlocks.radioactiveCount;

  dom.luckyBlockInventoryDisplay.textContent = `Lucky Blocks ${totalLuckyBlocks}`;
  dom.luckyBlockInventoryDisplay.classList.toggle("hidden", totalLuckyBlocks <= 0);
  dom.uncoverLuckyBlockButton.classList.toggle("hidden", totalLuckyBlocks <= 0);
  dom.uncoverAllLuckyBlocksButton.classList.toggle("hidden", totalLuckyBlocks <= 0);
}

function renderTotals() {
  dom.moneyDisplay.textContent = formatMoney(state.money);
  dom.totalIncomeDisplay.textContent = `${formatMoney(getTotalIncomePerSecond())}/s`;
}

function renderOwned() {
  const ownedEntries = Object.values(state.owned).sort((a, b) => {
    return getOwnedCharacterData(b.id).value - getOwnedCharacterData(a.id).value;
  });

  if (ownedEntries.length === 0) {
    dom.ownedList.innerHTML = `
      <div class="empty-state">
        No brainrots owned yet. Roll something cursed and buy it.
      </div>
    `;
    return;
  }

  dom.ownedList.innerHTML = ownedEntries
    .map((entry) => {
      const character = getOwnedCharacterData(entry.id);
      const rarity = getRarityLabel(
        character.value,
        isLuckyBlockRewardCharacter(entry.id)
          ? getLuckyBlockPercentNumber(luckyBlockCharacterById[entry.id], defaultLuckyBlockIds)
          : getPercentNumberFromValue(character.value),
      );
      const income =
        (entry.normalCount * character.income +
          entry.rainbowCount * character.income * RAINBOW_MULTIPLIER +
          entry.radioactiveCount * character.income * RADIOACTIVE_MULTIPLIER) *
        getCashMultiplierForRebirthCount(state.rebirthCount);
      const baseIncomeWithMultiplier = character.income * getCashMultiplierForRebirthCount(state.rebirthCount);

      return `
        <article class="owned-card ${selectedOwnedCharacterId === entry.id ? "selected" : ""}" data-owned-id="${entry.id}">
          <img class="owned-thumb ${isCutoutCharacterImage(character) ? "cutout-image" : ""}" src="${character.img}" alt="${character.name}" />
          <div>
            <p class="owned-name">${character.name}</p>
            <p class="owned-meta">${rarity.text}</p>
            <p class="owned-meta">Value ${
              isLuckyBlockRewardCharacter(entry.id)
                ? formatLuckyBlockChanceLabel(luckyBlockCharacterById[entry.id], defaultLuckyBlockIds)
                : getValueChanceLabel(character.value)
            }</p>
            <p class="owned-meta">Normal ${entry.normalCount}</p>
            <p class="owned-meta">Rainbow ${entry.rainbowCount}</p>
            <p class="owned-meta">Radioactive ${entry.radioactiveCount}</p>
            <p class="owned-meta">Base ${formatMoney(baseIncomeWithMultiplier)}/s each</p>
          </div>
          <p class="owned-income">${formatMoney(income)}/s</p>
        </article>
      `;
    })
    .join("");
}

function renderOwnedViewer() {
  if (!selectedOwnedCharacterId || !state.owned[selectedOwnedCharacterId]) {
    dom.ownedViewerPanel.classList.add("hidden");
    return;
  }

  const character = getOwnedCharacterData(selectedOwnedCharacterId);
  const rarity = getRarityLabel(
    character.value,
    isLuckyBlockRewardCharacter(selectedOwnedCharacterId)
      ? getLuckyBlockPercentNumber(luckyBlockCharacterById[selectedOwnedCharacterId], defaultLuckyBlockIds)
      : getPercentNumberFromValue(character.value),
  );
  const viewedIncome = character.income * getCashMultiplierForRebirthCount(state.rebirthCount);

  dom.ownedViewerPanel.classList.remove("hidden");
  dom.ownedViewerType.textContent = isLuckyBlockRewardCharacter(selectedOwnedCharacterId)
    ? "Lucky Block Reward"
    : "Collection View";
  dom.ownedViewerImage.src = character.img;
  dom.ownedViewerImage.alt = character.name;
  dom.ownedViewerImage.classList.toggle("cutout-image", isCutoutCharacterImage(character));
  dom.ownedViewerName.textContent = character.name;
  dom.ownedViewerRarity.textContent = rarity.text;
  dom.ownedViewerRarity.className = `rarity-tag ${rarity.className}`;
  dom.ownedViewerFlavor.textContent = character.flavor;
  dom.ownedViewerCost.textContent = formatMoney(character.cost);
  dom.ownedViewerIncome.textContent = `${formatMoney(viewedIncome)}/s`;
}

function ensureSelectedOwnedCharacter() {
  if (selectedOwnedCharacterId && state.owned[selectedOwnedCharacterId]) {
    return;
  }

  const ownedIds = Object.keys(state.owned);
  selectedOwnedCharacterId = ownedIds.length > 0 ? ownedIds[0] : null;
}

function renderRebirthPage() {
  const currentMultiplier = getCashMultiplierForRebirthCount(state.rebirthCount);
  const nextMultiplier = getNextRebirthMultiplier();
  const requirement = getRebirthRequirement(state.rebirthCount);
  const isMaxed = state.rebirthCount >= MAX_REBIRTHS;
  const nextRebirthNumber = state.rebirthCount + 1;

  dom.rebirthCountDisplay.textContent = `${state.rebirthCount}`;
  dom.cashMultiplierDisplay.textContent = formatMultiplier(currentMultiplier);
  dom.nextMultiplierDisplay.textContent = isMaxed ? "MAX" : formatMultiplier(nextMultiplier);
  dom.rebirthRequirementDisplay.textContent = isMaxed ? "MAXED" : formatMoney(requirement);
  dom.rebirthDescription.textContent = isMaxed
    ? "You reached the rebirth cap. Every brainrot is already boosted as far as this system goes."
    : `Your ${nextRebirthNumber}${getOrdinalSuffix(nextRebirthNumber)} rebirth will boost all brainrots to ${formatMultiplier(nextMultiplier)} cash.`;
  dom.miniRebirthButton.disabled = isMaxed;
  dom.miniRebirthButton.textContent = isMaxed ? "Max Rebirth Reached" : "Rebirth";
}

function render() {
  ensureSelectedOwnedCharacter();
  renderTotals();
  renderCurrentRoll();
  renderRollTimer();
  renderEventTimer();
  updateActionButtons();
  renderCollectionActions();
  renderOwned();
  renderOwnedViewer();
  renderRebirthPage();
  renderAdminTools();
  saveState();
}

function resetAutoRollTimer() {
  autoRollRemaining = AUTO_ROLL_SECONDS;
  renderRollTimer();
}

function setNewRoll(resetTimer) {
  state.currentRoll = createRolledCharacter();
  if (resetTimer) {
    resetAutoRollTimer();
  }
}

function rollCharacter(resetTimer = true) {
  if (!state.currentRoll) {
    ensureCurrentRoll();
  }

  if (resetTimer) {
    const manualRollCost = getManualRollCost();
    if (state.money < manualRollCost) {
      return;
    }

    state.money -= manualRollCost;
  }

  setNewRoll(resetTimer);
  const rolled = characterById[state.currentRoll.id];
  const mutation = state.currentRoll.mutation;

  if (mutation === "rainbow") {
    setStatus(`${rolled.name} rolled with RAINBOW. Income boosted to 1.5x.`);
  } else if (mutation === "radioactive") {
    setStatus(`${rolled.name} rolled with RADIOACTIVE. Income boosted to 3.5x.`);
  } else {
    setStatus(`Rolled ${rolled.name}.`);
  }

  render();
}

function autoRollCharacter() {
  setNewRoll(true);
  const rolled = characterById[state.currentRoll.id];
  const mutation = state.currentRoll.mutation;

  if (mutation === "rainbow") {
    setStatus(`${rolled.name} auto-rolled with RAINBOW. Income boosted to 1.5x.`);
  } else if (mutation === "radioactive") {
    setStatus(`${rolled.name} auto-rolled with RADIOACTIVE. Income boosted to 3.5x.`);
  } else {
    setStatus(`Auto-rolled ${rolled.name}.`);
  }

  render();
}

function buyCurrentCharacter() {
  ensureCurrentRoll();

  const current = state.currentRoll;
  const character = characterById[current.id];

  if (state.money < character.cost) {
    setStatus(`You need ${formatMoney(character.cost)} to buy ${character.name}.`);
    render();
    return;
  }

  state.money -= character.cost;
  grantOwnedCharacter(current.id, current.mutation);

  if (current.mutation === "rainbow") {
    setStatus(
      character.isLuckyBlock
        ? "Bought a RAINBOW Lucky Block. Uncover it later from your collection."
        : `Bought a RAINBOW ${character.name}. That copy earns 1.5x by itself.`,
    );
  } else if (current.mutation === "radioactive") {
    setStatus(
      character.isLuckyBlock
        ? "Bought a RADIOACTIVE Lucky Block. Uncover it later from your collection."
        : `Bought a RADIOACTIVE ${character.name}. That copy earns 3.5x by itself.`,
    );
  } else {
    setStatus(
      character.isLuckyBlock
        ? "Bought a Lucky Block. Uncover it later from your collection."
        : `Bought ${character.name}. Passive income increased.`,
    );
  }

  setNewRoll(true);
  render();
}

function openRebirthPage() {
  showOnlyPage(dom.rebirthPage);
  renderRebirthPage();
  setRebirthStatus("Rebirth resets your money and owned brainrots, but keeps your multiplier forever.");
}

function closeRebirthPage() {
  showOnlyPage(dom.mainPage);
}

function openAdminPage() {
  showOnlyPage(dom.adminPage);
  renderAdminBrainrotOptions();
  renderAdminMutationOptions();
  renderAdminEventOptions();
  renderAdminTools();
  if (!adminAuthorized) {
    dom.adminPasswordInput.value = "";
    setAdminStatus("Admin auth is locked.");
  } else {
    setAdminSpawnerStatus("Spawn brainrots directly into your collection.");
  }
}

function closeAdminPage() {
  showOnlyPage(dom.mainPage);
}

function submitAdminPassword() {
  if (dom.adminPasswordInput.value === ADMIN_PASSWORD) {
    adminAuthorized = true;
    renderAdminTools();
    renderAdminBrainrotOptions();
    renderAdminMutationOptions();
    renderAdminEventOptions();
    setAdminSpawnerStatus("Admin unlocked. Choose mutation, brainrot, and amount.");
    return;
  }

  adminAuthorized = false;
  renderAdminTools();
  setAdminStatus("Wrong password.");
}

function adminSpawnBrainrots() {
  if (!adminAuthorized) {
    setAdminStatus("Please enter your password.");
    return;
  }

  const mutation = dom.adminMutationSelect.value;
  const characterId = dom.adminBrainrotSelect.value;
  const amount = Math.max(1, Math.min(1e18, Number(dom.adminAmountInput.value) || 1));

  grantOwnedCharacter(characterId, mutation, amount);
  render();
  setAdminSpawnerStatus(
    `Spawned ${amount} ${getMutationDisplayName(mutation).toLowerCase()} ${getOwnedCharacterData(characterId).name} into your collection.`,
  );
}

function adminSetMoney() {
  if (!adminAuthorized) {
    setAdminStatus("Please enter your password.");
    return;
  }

  const nextMoney = Number.parseFloat(dom.adminSetMoneyInput.value);
  if (Number.isNaN(nextMoney)) {
    setAdminSpawnerStatus("Enter a valid money number.");
    return;
  }

  state.money = Math.max(0, nextMoney);
  render();
  setAdminSpawnerStatus(`Money set to ${formatMoney(state.money)}.`);
}

function adminSetRebirth() {
  if (!adminAuthorized) {
    setAdminStatus("Please enter your password.");
    return;
  }

  const nextRebirth = Number.parseInt(dom.adminSetRebirthInput.value, 10);
  if (Number.isNaN(nextRebirth)) {
    setAdminSpawnerStatus("Enter a valid rebirth number.");
    return;
  }

  state.rebirthCount = Math.max(0, Math.min(MAX_REBIRTHS, nextRebirth));
  render();
  setAdminSpawnerStatus(`Rebirth set to ${state.rebirthCount}.`);
}

function adminSetEvent() {
  if (!adminAuthorized) {
    setAdminStatus("Please enter your password.");
    return;
  }

  if (!dom.adminEventSelect) {
    setAdminSpawnerStatus("Refresh the page to load the event controls.");
    return;
  }

  const selectedEvent = dom.adminEventSelect.value;
  if (!EVENT_MUTATION_WEIGHTS[selectedEvent]) {
    setAdminSpawnerStatus("Choose a valid event.");
    return;
  }

  state.event.activeMutation = selectedEvent;
  state.event.endsAt = Date.now() + EVENT_DURATION_MS;
  state.event.playSeconds = 0;
  render();
  setAdminSpawnerStatus(`${getMutationDisplayName(selectedEvent)} event turned on for 5 minutes.`);
}

function adminClearEvent() {
  if (!adminAuthorized) {
    setAdminStatus("Please enter your password.");
    return;
  }

  state.event.activeMutation = null;
  state.event.endsAt = 0;
  state.event.playSeconds = 0;
  render();
  setAdminSpawnerStatus("Event turned off.");
}

function tryRebirth() {
  if (state.rebirthCount >= MAX_REBIRTHS) {
    setRebirthStatus("You already reached the max rebirth level.");
    return;
  }

  const requirement = getRebirthRequirement(state.rebirthCount);
  if (state.money < requirement) {
    setRebirthStatus(`You need ${formatMoney(requirement)} cash before you can rebirth.`);
    return;
  }

  state.rebirthCount += 1;
  state.money = 10;
  state.currentRoll = null;
  state.owned = {};
  state.event = {
    activeMutation: null,
    endsAt: 0,
    playSeconds: 0,
  };
  state.lastTick = Date.now();

  ensureCurrentRoll();
  render();
  setStatus(`Rebirth complete. All brainrots now earn ${formatMultiplier(getCashMultiplierForRebirthCount(state.rebirthCount))}.`);
  setRebirthStatus(`Rebirth ${state.rebirthCount} complete. Come back when you are ready for the next one.`);
}

function uncoverLuckyBlock() {
  const inventory = getLuckyBlockInventory();
  const hasNormalLuckyBlock = inventory.normalCount > 0;
  const hasRainbowLuckyBlock = inventory.rainbowCount > 0;
  const hasRadioactiveLuckyBlock = inventory.radioactiveCount > 0;

  if (!hasNormalLuckyBlock && !hasRainbowLuckyBlock && !hasRadioactiveLuckyBlock) {
    setStatus("You do not have any lucky blocks to uncover.");
    render();
    return;
  }

  const uncoveredCharacter = rollLuckyBlockCharacter(defaultLuckyBlockIds);
  if (!uncoveredCharacter) {
    setStatus("Lucky block pool is empty right now.");
    return;
  }

  let rewardMutation = "normal";
  if (hasNormalLuckyBlock) {
    state.owned["lucky-block"].normalCount -= 1;
  } else if (hasRainbowLuckyBlock) {
    state.owned["lucky-block"].rainbowCount -= 1;
    rewardMutation = "rainbow";
  } else {
    state.owned["lucky-block"].radioactiveCount -= 1;
    rewardMutation = "radioactive";
  }

  grantOwnedCharacter(uncoveredCharacter.id, rewardMutation);
  setStatus(
    rewardMutation === "rainbow"
      ? `Uncovered a RAINBOW ${uncoveredCharacter.name} from your lucky block.`
      : rewardMutation === "radioactive"
        ? `Uncovered a RADIOACTIVE ${uncoveredCharacter.name} from your lucky block.`
        : `Uncovered ${uncoveredCharacter.name} from your lucky block.`,
  );
  render();
}

function uncoverAllLuckyBlocks() {
  const inventory = getLuckyBlockInventory();
  const totalLuckyBlocks = inventory.normalCount + inventory.rainbowCount + inventory.radioactiveCount;

  if (totalLuckyBlocks <= 0) {
    setStatus("You do not have any lucky blocks to uncover.");
    render();
    return;
  }

  let uncoveredCount = 0;
  while (true) {
    const currentInventory = getLuckyBlockInventory();
    const remaining =
      currentInventory.normalCount + currentInventory.rainbowCount + currentInventory.radioactiveCount;
    if (remaining <= 0) {
      break;
    }

    const hasNormalLuckyBlock = currentInventory.normalCount > 0;
    const hasRainbowLuckyBlock = currentInventory.rainbowCount > 0;
    const uncoveredCharacter = rollLuckyBlockCharacter(defaultLuckyBlockIds);
    if (!uncoveredCharacter) {
      break;
    }

    let rewardMutation = "normal";
    if (hasNormalLuckyBlock) {
      state.owned["lucky-block"].normalCount -= 1;
    } else if (hasRainbowLuckyBlock) {
      state.owned["lucky-block"].rainbowCount -= 1;
      rewardMutation = "rainbow";
    } else {
      state.owned["lucky-block"].radioactiveCount -= 1;
      rewardMutation = "radioactive";
    }

    grantOwnedCharacter(uncoveredCharacter.id, rewardMutation);
    uncoveredCount += 1;
  }

  setStatus(`Uncovered all lucky blocks. Opened ${uncoveredCount} in total.`);
  render();
}

function selectOwnedCharacter(event) {
  const card = event.target.closest("[data-owned-id]");
  if (!card) {
    return;
  }

  selectedOwnedCharacterId = card.dataset.ownedId;
  render();
}

function tickIncome() {
  syncEventState();
  state.money += getTotalIncomePerSecond();

  if (!state.event.activeMutation) {
    state.event.playSeconds += 1;
    maybeStartMutationEvent();
  }

  autoRollRemaining -= 1;
  if (autoRollRemaining <= 0) {
    autoRollCharacter();
  }

  renderTotals();
  renderRollTimer();
  renderEventTimer();
  updateActionButtons();
  saveState();
}

function bindClick(element, handler) {
  if (element) {
    element.addEventListener("click", handler);
  }
}

bindClick(dom.rollButton, rollCharacter);
bindClick(dom.buyButton, buyCurrentCharacter);
if (dom.ownedList) {
  dom.ownedList.addEventListener("click", selectOwnedCharacter);
}
bindClick(dom.uncoverLuckyBlockButton, uncoverLuckyBlock);
bindClick(dom.uncoverAllLuckyBlocksButton, uncoverAllLuckyBlocks);
bindClick(dom.rebirthPageButton, openRebirthPage);
bindClick(dom.adminAuthButton, openAdminPage);
bindClick(dom.backToGameButton, closeRebirthPage);
bindClick(dom.adminBackButton, closeAdminPage);
bindClick(dom.miniRebirthButton, tryRebirth);
bindClick(dom.adminPasswordSubmitButton, submitAdminPassword);
bindClick(dom.adminConfirmButton, adminSpawnBrainrots);
bindClick(dom.adminSetMoneyButton, adminSetMoney);
bindClick(dom.adminSetRebirthButton, adminSetRebirth);
bindClick(dom.adminSetEventButton, adminSetEvent);
bindClick(dom.adminClearEventButton, adminClearEvent);
if (dom.adminPasswordInput) {
  dom.adminPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitAdminPassword();
    }
  });
}

awardOfflineIncome();
syncEventState();
ensureCurrentRoll();
render();
setStatus("Your idle run started with $10. Roll and build your brainrot factory.");
setRebirthStatus("Stack rebirths to push every brainrot income higher.");

window.luckyBlockSystem = {
  luckyBlockCharacters,
  luckyBlockCharacterById,
  getLuckyBlockPool,
  getLuckyBlockTotalValue,
  formatLuckyBlockChanceLabel,
  rollLuckyBlockCharacter,
  uncoverLuckyBlock,
  uncoverAllLuckyBlocks,
};

window.setInterval(tickIncome, 1000);
