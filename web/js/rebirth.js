window.BRAINROT_PAGE = "rebirth";

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
    img: "img/Fluriflura.webp",
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

const adminOnlyCharacters = [];

const SAILING_DURATION_MS = 60 * 1000;
const MAX_SAILS_PER_TRIP = 1e18;
const SAILING_BOAT_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sailboat_illustration.svg";

const sailingBoats = [
  {
    id: "traveler-boat",
    name: "Boat for Travelers",
    brainrotChance: 0.05,
    cost: 1e7,
    flavor: "Cheap starter boat. It only has a small shot at bringing a brainrot back.",
  },
  {
    id: "expert-boat",
    name: "Boat for Experts",
    brainrotChance: 0.2,
    cost: 1e13,
    flavor: "A serious brainrot hunting vessel with better odds.",
  },
  {
    id: "super-boat",
    name: "Super Boat",
    brainrotChance: 0.5,
    cost: 1e15,
    flavor: "Half your sails should come back with something strange.",
  },
  {
    id: "god-boat",
    name: "God Boat",
    brainrotChance: 0.99,
    cost: 1e18,
    flavor: "Almost every trip returns with a brainrot reward.",
  },
  {
    id: "infinite-boat",
    name: "Infinite Boat",
    brainrotChance: 1,
    cost: 1e20,
    moneyBonusChance: 0.1,
    moneyBonusMin: 1e16,
    moneyBonusMax: 1e17,
    flavor: "Guaranteed brainrot haul, with a chance to drag back a giant QA money bonus too.",
  },
];

const sailingIslands = [
  {
    id: "legendary-island",
    name: "Legendary Island",
    flavor: "OG brainrots, 2000s cool stuff, already dead but still flashing with bright light",
    rewards: [
      {
        id: "dancing-banana",
        name: "Dancing Banana",
        sailingValue: 5,
        income: 2500,
        flavor: "A washed-up letter from a golden island. Somehow it still earns money.",
        img: "img/banana.jfif",
      },
      {
        id: "legendary-b",
        name: "Legendary B",
        sailingValue: 3,
        income: 12500,
        flavor: "The island smiths forged this B out of pure legendary nonsense.",
        img: createLetterBrainrotImage("B", "#ffd966", "#ff8a00"),
      },
      {
        id: "legendary-c",
        name: "Legendary C",
        sailingValue: 1,
        income: 50000,
        flavor: "A rare C that glows like treasure whenever the boat returns.",
        img: createLetterBrainrotImage("C", "#fff3a1", "#ff5e00"),
      },
    ],
  },
  {
    id: "unknown-island",
    name: "Unknown Island",
    flavor: "A mystery island config in JS so you can drop more islands in later without changing the whole system.",
    rewards: [
      {
        id: "unknown-a",
        name: "Unknown A",
        sailingValue: 5,
        income: 1800,
        flavor: "No one knows what this A is doing here. It just showed up dripping seawater.",
        img: createLetterBrainrotImage("A", "#8ad3ff", "#3467eb"),
      },
      {
        id: "unknown-b",
        name: "Unknown B",
        sailingValue: 3,
        income: 9000,
        flavor: "A suspicious blue B from the foggy side of the map.",
        img: createLetterBrainrotImage("B", "#7ef0cf", "#2f9d8f"),
      },
      {
        id: "unknown-c",
        name: "Unknown C",
        sailingValue: 1,
        income: 36000,
        flavor: "This C arrived with no label, no crew, and way too much passive income.",
        img: createLetterBrainrotImage("C", "#d4b8ff", "#6d37d9"),
      },
      {
        id: "Eatshit",
        name: "Eatshit",
        sailingValue: 0.00001,
        income: 3600000000,
        flavor: "The forbidden island reward. Sailors whisper the name and then pretend they never saw it.",
        img: "img/Eatshit.jpeg",
      },
    ],
  },
];


const RAINBOW_CHANCE = 0.1;
const RAINBOW_MULTIPLIER = 1.5;
const RADIOACTIVE_CHANCE = 0.01;
const RADIOACTIVE_MULTIPLIER = 3.5;
const SAILING_RAINBOW_CHANCE = 0.1;
const SAILING_RADIOACTIVE_CHANCE = 0.001;
const SAILING_EVENT_MUTATION_BONUS = 0.05;
const MAX_REBIRTHS = 20;
const AUTO_ROLL_SECONDS = 10;
const EVENT_INTERVAL_SECONDS = 60 * 60;
const EVENT_DURATION_MS = 5 * 60 * 1000;
const SAVE_KEY = "brainrot-idle-save-v2";
const ADMIN_PASSWORD = "Ab141130";
const ADMIN_AUTH_KEY = "brainrot-admin-auth-until";
const ADMIN_AUTH_DURATION_MS = 60 * 60 * 1000;

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

const CURRENT_PAGE = window.BRAINROT_PAGE || "home";
const PAGE_ROUTES = {
  home: "/",
  admin: "/admin",
  rebirth: "/rebirth",
  sailing: "/sailing",
};

const dom = {
  moneyDisplay: document.querySelector("#moneyDisplay"),
  totalIncomeDisplay: document.querySelector("#totalIncomeDisplay"),
  mainPage: document.querySelector("#mainPage"),
  rebirthPage: document.querySelector("#rebirthPage"),
  adminPage: document.querySelector("#adminPage"),
  sailingPage: document.querySelector("#sailingPage"),
  rebirthPageButton: document.querySelector("#rebirthPageButton"),
  adminAuthButton: document.querySelector("#adminAuthButton"),
  sailingPageButton: document.querySelector("#sailingPageButton"),
  backToGameButton: document.querySelector("#backToGameButton"),
  adminBackButton: document.querySelector("#adminBackButton"),
  sailingBackButton: document.querySelector("#sailingBackButton"),
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
  sailingBoatImage: document.querySelector("#sailingBoatImage"),
  sailingIslandName: document.querySelector("#sailingIslandName"),
  sailingChanceTag: document.querySelector("#sailingChanceTag"),
  sailingIslandFlavor: document.querySelector("#sailingIslandFlavor"),
  sailingIslandSelect: document.querySelector("#sailingIslandSelect"),
  sailingBoatSelect: document.querySelector("#sailingBoatSelect"),
  sailingAmountInput: document.querySelector("#sailingAmountInput"),
  sailingCostDisplay: document.querySelector("#sailingCostDisplay"),
  sailingTimerDisplay: document.querySelector("#sailingTimerDisplay"),
  sailingActiveCountDisplay: document.querySelector("#sailingActiveCountDisplay"),
  sailingRewardPreview: document.querySelector("#sailingRewardPreview"),
  sailingConfirmButton: document.querySelector("#sailingConfirmButton"),
  sailingStatusText: document.querySelector("#sailingStatusText"),
};

const characterById = Object.fromEntries(characters.map((entry) => [entry.id, entry]));
const totalCharacterValue = characters.reduce((total, entry) => total + entry.value, 0);
const luckyBlockCharacterById = Object.fromEntries(
  luckyBlockCharacters.map((entry) => [entry.id, entry]),
);
const adminOnlyCharacterById = Object.fromEntries(
  adminOnlyCharacters.map((entry) => [entry.id, entry]),
);
const sailingIslandById = Object.fromEntries(sailingIslands.map((entry) => [entry.id, entry]));
const sailingBoatById = Object.fromEntries(sailingBoats.map((entry) => [entry.id, entry]));
const sailingRewardCharacters = sailingIslands.flatMap((island) =>
  island.rewards.map((reward) => ({
    ...reward,
    value: reward.sailingValue,
    islandId: island.id,
    islandName: island.name,
    flavor: reward.flavor || `${reward.name} is a sailing reward from ${island.name}.`,
    isSailingReward: true,
  })),
);
const sailingRewardCharacterById = Object.fromEntries(
  sailingRewardCharacters.map((entry) => [entry.id, entry]),
);
const defaultLuckyBlockIds = luckyBlockCharacters
  .filter((entry) => !entry.luckyBlockOnly)
  .map((entry) => entry.id);

const state = loadState();
let autoRollRemaining = AUTO_ROLL_SECONDS;
let adminAuthorized = loadAdminAuthorization();
let selectedOwnedCharacterId = null;

function createDefaultState() {
  return {
    money: 10,
    currentRoll: null,
    owned: {},
    rebirthCount: 0,
    sailing: {
      selectedIslandId: sailingIslands[0].id,
      selectedBoatId: sailingBoats[0].id,
      amount: 1,
      jobs: [],
    },
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

function normalizeSailingJob(job = {}) {
  const islandId = sailingIslandById[job.islandId] ? job.islandId : sailingIslands[0].id;
  const boatId = sailingBoatById[job.boatId] ? job.boatId : sailingBoats[0].id;
  return {
    id: job.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    islandId,
    boatId,
    amount: Math.max(1, Math.min(MAX_SAILS_PER_TRIP, Number(job.amount) || 1)),
    endsAt: Number(job.endsAt) || Date.now() + SAILING_DURATION_MS,
  };
}

function normalizeSailingState(sailing = {}) {
  return {
    selectedIslandId: sailingIslandById[sailing.selectedIslandId]
      ? sailing.selectedIslandId
      : sailingIslands[0].id,
    selectedBoatId: sailingBoatById[sailing.selectedBoatId]
      ? sailing.selectedBoatId
      : sailingBoats[0].id,
    amount: Math.max(1, Math.min(MAX_SAILS_PER_TRIP, Number(sailing.amount) || 1)),
    jobs: Array.isArray(sailing.jobs) ? sailing.jobs.map(normalizeSailingJob) : [],
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
      sailing: normalizeSailingState(parsed.sailing),
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

function loadAdminAuthorization() {
  try {
    const expiresAt = Number(localStorage.getItem(ADMIN_AUTH_KEY)) || 0;
    return expiresAt > Date.now();
  } catch {
    return false;
  }
}

function saveAdminAuthorization(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(ADMIN_AUTH_KEY, `${Date.now() + ADMIN_AUTH_DURATION_MS}`);
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch {
    return;
  }
}

function formatMoney(value) {
  const tiers = [
    { limit: 1e100, suffix: "GOL", divisor: 1e100, decimals: 3 },
    { limit: 1e36, suffix: "UD", divisor: 1e36, decimals: 3 },
    { limit: 1e33, suffix: "DC", divisor: 1e33, decimals: 3 },
    { limit: 1e30, suffix: "NO", divisor: 1e30, decimals: 3 },
    { limit: 1e27, suffix: "OC", divisor: 1e27, decimals: 3 },
    { limit: 1e24, suffix: "SP", divisor: 1e24, decimals: 3 },
    { limit: 1e21, suffix: "SX", divisor: 1e21, decimals: 3 },
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

function createLetterBrainrotImage(letter, startColor, endColor) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="44" fill="url(#bg)" />
      <text x="50%" y="56%" text-anchor="middle" font-size="116" font-family="Arial, sans-serif" font-weight="700" fill="white">${letter}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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

  if (adminOnlyCharacterById[characterId]) {
    return adminOnlyCharacterById[characterId];
  }

  if (sailingRewardCharacterById[characterId]) {
    const sailingCharacter = sailingRewardCharacterById[characterId];
    return {
      id: sailingCharacter.id,
      name: sailingCharacter.name,
      value: sailingCharacter.value ?? sailingCharacter.sailingValue ?? 0,
      cost: Number(sailingCharacter.cost) || 0,
      income: Number(sailingCharacter.income) || 0,
      flavor:
        sailingCharacter.flavor
        || `${sailingCharacter.name} is a sailing reward from ${sailingCharacter.islandName || "the harbor"}.`,
      img: sailingCharacter.img,
      isSailingReward: true,
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

function isKnownCharacterId(characterId) {
  return Boolean(
    characterById[characterId]
    || luckyBlockCharacterById[characterId]
    || adminOnlyCharacterById[characterId]
    || sailingRewardCharacterById[characterId],
  );
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

function getCurrentSailingIsland() {
  return sailingIslandById[state.sailing.selectedIslandId] || sailingIslands[0];
}

function getCurrentSailingBoat() {
  return sailingBoatById[state.sailing.selectedBoatId] || sailingBoats[0];
}

function getSailingCost() {
  return getCurrentSailingBoat().cost * state.sailing.amount;
}

function getTotalActiveSails() {
  return state.sailing.jobs.reduce((total, job) => total + job.amount, 0);
}

function getNextSailingReturnTime() {
  if (state.sailing.jobs.length === 0) {
    return null;
  }

  return Math.min(...state.sailing.jobs.map((job) => job.endsAt));
}

function setSailingStatus(message) {
  if (dom.sailingStatusText) {
    dom.sailingStatusText.textContent = message;
  }
}

function getApproximateSuccessCount(amount, chance) {
  if (amount <= 5000) {
    let successes = 0;
    for (let index = 0; index < amount; index += 1) {
      if (Math.random() < chance) {
        successes += 1;
      }
    }
    return successes;
  }

  const mean = amount * chance;
  const variance = Math.sqrt(amount * chance * (1 - chance));
  const wobble = (Math.random() - 0.5) * 2 * variance;
  return Math.max(0, Math.min(amount, Math.round(mean + wobble)));
}

function distributeSailingRewards(successCount, rewards) {
  if (successCount <= 0) {
    return [];
  }

  const totalValue = rewards.reduce((total, reward) => total + reward.sailingValue, 0);
  if (successCount <= 5000) {
    const counts = new Map();
    for (let index = 0; index < successCount; index += 1) {
      const selectedReward = rollByWeight(rewards, "sailingValue");
      counts.set(selectedReward.id, (counts.get(selectedReward.id) || 0) + 1);
    }
    return rewards
      .map((reward) => ({ reward, count: counts.get(reward.id) || 0 }))
      .filter((entry) => entry.count > 0);
  }

  let assigned = 0;
  return rewards.map((reward, index) => {
    const isLast = index === rewards.length - 1;
    const count = isLast
      ? successCount - assigned
      : Math.max(0, Math.round((successCount * reward.sailingValue) / totalValue));
    assigned += count;
    return { reward, count };
  }).filter((entry) => entry.count > 0);
}

function splitSailingRewardMutations(amount) {
  if (amount <= 0) {
    return {
      normal: 0,
      rainbow: 0,
      radioactive: 0,
    };
  }

  const radioactiveChance = getSailingMutationChance("radioactive");
  const rainbowChance = getSailingMutationChance("rainbow");
  const radioactiveCount = getApproximateSuccessCount(amount, radioactiveChance);
  const remainingAfterRadioactive = Math.max(0, amount - radioactiveCount);
  const rainbowCount = getApproximateSuccessCount(remainingAfterRadioactive, rainbowChance);

  return {
    normal: Math.max(0, amount - radioactiveCount - rainbowCount),
    rainbow: rainbowCount,
    radioactive: radioactiveCount,
  };
}

function getInfiniteBoatBonus(amount, boat) {
  if (!boat.moneyBonusChance || !boat.moneyBonusMin || !boat.moneyBonusMax) {
    return 0;
  }

  const bonusTrips = getApproximateSuccessCount(amount, boat.moneyBonusChance);
  if (bonusTrips <= 0) {
    return 0;
  }

  const averageBonus = (boat.moneyBonusMin + boat.moneyBonusMax) / 2;
  return bonusTrips * averageBonus;
}

function resolveFinishedSailingJobs() {
  if (!state.sailing?.jobs?.length) {
    return;
  }

  const now = Date.now();
  const completedJobs = state.sailing.jobs.filter((job) => job.endsAt <= now);
  if (completedJobs.length === 0) {
    return;
  }

  state.sailing.jobs = state.sailing.jobs.filter((job) => job.endsAt > now);

  let totalRewardedBrainrots = 0;
  let totalMoneyBonus = 0;

  for (const job of completedJobs) {
    const island = sailingIslandById[job.islandId] || sailingIslands[0];
    const boat = sailingBoatById[job.boatId] || sailingBoats[0];
    const successCount = getApproximateSuccessCount(job.amount, boat.brainrotChance);
    const rewards = distributeSailingRewards(successCount, island.rewards);

    for (const entry of rewards) {
      const mutationCounts = splitSailingRewardMutations(entry.count);
      if (mutationCounts.normal > 0) {
        grantOwnedCharacter(entry.reward.id, "normal", mutationCounts.normal);
      }
      if (mutationCounts.rainbow > 0) {
        grantOwnedCharacter(entry.reward.id, "rainbow", mutationCounts.rainbow);
      }
      if (mutationCounts.radioactive > 0) {
        grantOwnedCharacter(entry.reward.id, "radioactive", mutationCounts.radioactive);
      }
      totalRewardedBrainrots += entry.count;
    }

    totalMoneyBonus += getInfiniteBoatBonus(job.amount, boat);
  }

  if (totalMoneyBonus > 0) {
    state.money += totalMoneyBonus;
  }

  setSailingStatus(
    totalMoneyBonus > 0
      ? `Sails returned with ${totalRewardedBrainrots} brainrots and ${formatMoney(totalMoneyBonus)} bonus cash.`
      : `Sails returned with ${totalRewardedBrainrots} brainrots.`,
  );
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

function getSailingMutationChance(mutation) {
  if (mutation === "rainbow") {
    return SAILING_RAINBOW_CHANCE + (state.event.activeMutation === "rainbow" ? SAILING_EVENT_MUTATION_BONUS : 0);
  }

  if (mutation === "radioactive") {
    return SAILING_RADIOACTIVE_CHANCE + (state.event.activeMutation === "radioactive" ? SAILING_EVENT_MUTATION_BONUS : 0);
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
  const combined = [
    ...characters,
    ...luckyBlockCharacters,
    ...sailingRewardCharacters,
    ...adminOnlyCharacters,
  ];
  const uniqueEntries = combined.filter(
    (entry, index, array) => array.findIndex((item) => item.id === entry.id) === index,
  );

  return uniqueEntries.sort((left, right) => {
    if (left.adminOnly && !right.adminOnly) {
      return -1;
    }

    if (!left.adminOnly && right.adminOnly) {
      return 1;
    }

    return left.name.localeCompare(right.name);
  });
}

function renderAdminBrainrotOptions() {
  if (!dom.adminBrainrotSelect) {
    return;
  }

  const previousValue = dom.adminBrainrotSelect.value;
  const options = getAdminSpawnables()
    .map((entry) => `<option value="${entry.id}">${entry.name}</option>`)
    .join("");
  dom.adminBrainrotSelect.innerHTML = options;

  const hasPreviousValue = getAdminSpawnables().some((entry) => entry.id === previousValue);
  if (hasPreviousValue) {
    dom.adminBrainrotSelect.value = previousValue;
    return;
  }

  const defaultAdminOnly = adminOnlyCharacters[0]?.id;
  dom.adminBrainrotSelect.value = defaultAdminOnly || getAdminSpawnables()[0]?.id || "";
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
  adminAuthorized = loadAdminAuthorization();
  renderAdminView();
  if (!adminAuthorized) {
    return;
  }

  renderAdminBrainrotOptions();
  renderAdminMutationOptions();
  renderAdminEventOptions();
  dom.adminSetMoneyInput.value = `${Math.floor(state.money * 100) / 100}`;
  dom.adminSetRebirthInput.value = `${state.rebirthCount}`;
  if (dom.adminMutationSelect) {
    dom.adminMutationSelect.value = dom.adminMutationSelect.value || "normal";
  }
  if (dom.adminEventSelect) {
    dom.adminEventSelect.value = state.event.activeMutation || "rainbow";
  }
}

function renderSailingIslandOptions() {
  if (!dom.sailingIslandSelect) {
    return;
  }

  dom.sailingIslandSelect.innerHTML = sailingIslands
    .map((island) => `<option value="${island.id}">${island.name}</option>`)
    .join("");
  dom.sailingIslandSelect.value = getCurrentSailingIsland().id;
}

function renderSailingBoatOptions() {
  if (!dom.sailingBoatSelect) {
    return;
  }

  dom.sailingBoatSelect.innerHTML = sailingBoats
    .map((boat) => `<option value="${boat.id}">${boat.name}</option>`)
    .join("");
  dom.sailingBoatSelect.value = getCurrentSailingBoat().id;
}

function getPageElement(page) {
  if (page === "admin") {
    return dom.adminPage;
  }

  if (page === "rebirth") {
    return dom.rebirthPage;
  }

  if (page === "sailing") {
    return dom.sailingPage;
  }

  return dom.mainPage;
}

function navigateToPage(page) {
  const route = PAGE_ROUTES[page] || PAGE_ROUTES.home;
  if (CURRENT_PAGE === page) {
    showOnlyPage(getPageElement(page));
    return;
  }

  window.location.assign(route);
}

function applyCurrentPageView() {
  showOnlyPage(getPageElement(CURRENT_PAGE));
}

function showOnlyPage(targetPage) {
  dom.mainPage.classList.add("hidden");
  dom.rebirthPage.classList.add("hidden");
  dom.adminPage.classList.add("hidden");
  dom.sailingPage.classList.add("hidden");
  targetPage.classList.remove("hidden");
}

function renderAdminView() {
  dom.adminAuthView.classList.toggle("hidden", adminAuthorized);
  dom.adminSpawnerView.classList.toggle("hidden", !adminAuthorized);
}

function renderSailingPage() {
  if (!dom.sailingPage) {
    return;
  }

  const island = getCurrentSailingIsland();
  const boat = getCurrentSailingBoat();
  const canAfford = state.money >= getSailingCost();
  const nextReturn = getNextSailingReturnTime();

  renderSailingIslandOptions();
  renderSailingBoatOptions();
  dom.sailingBoatImage.src = SAILING_BOAT_IMAGE;
  dom.sailingBoatImage.alt = boat.name;
  dom.sailingIslandName.textContent = island.name;
  dom.sailingChanceTag.textContent = `${Math.round(boat.brainrotChance * 100)}% Reward Rate`;
  dom.sailingIslandFlavor.textContent = `${island.flavor} ${boat.flavor}`;
  dom.sailingAmountInput.value = `${state.sailing.amount}`;
  dom.sailingCostDisplay.textContent = formatMoney(getSailingCost());
  dom.sailingActiveCountDisplay.textContent = `${getTotalActiveSails()}`;
  dom.sailingTimerDisplay.textContent = nextReturn ? formatCountdown(nextReturn - Date.now()) : "Ready";
  dom.sailingConfirmButton.disabled = !canAfford;
  dom.sailingRewardPreview.innerHTML = island.rewards
    .map(
      (reward) => `
        <article class="sailing-reward-card">
          <img class="owned-thumb" src="${reward.img}" alt="${reward.name}" />
          <div>
            <p class="owned-name">${reward.name}</p>
            <p class="owned-meta">${formatMoney(reward.income)}/s</p>
          </div>
        </article>
      `,
    )
    .join("");
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
  renderSailingPage();
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
  navigateToPage("rebirth");
  if (CURRENT_PAGE !== "rebirth") {
    return;
  }

  renderRebirthPage();
  setRebirthStatus("Rebirth resets your money and owned brainrots, but keeps your multiplier forever.");
}

function closeRebirthPage() {
  navigateToPage("home");
}

function openAdminPage() {
  navigateToPage("admin");
  if (CURRENT_PAGE !== "admin") {
    return;
  }

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
  navigateToPage("home");
}

function openSailingPage() {
  navigateToPage("sailing");
  if (CURRENT_PAGE !== "sailing") {
    return;
  }

  renderSailingPage();
  setSailingStatus("Choose an island, boat, and sail amount.");
}

function closeSailingPage() {
  navigateToPage("home");
}

function submitAdminPassword() {
  if (dom.adminPasswordInput.value === ADMIN_PASSWORD) {
    adminAuthorized = true;
    saveAdminAuthorization(true);
    renderAdminTools();
    renderAdminBrainrotOptions();
    renderAdminMutationOptions();
    renderAdminEventOptions();
    setAdminSpawnerStatus("Admin unlocked. Choose mutation, brainrot, and amount.");
    return;
  }

  adminAuthorized = false;
  saveAdminAuthorization(false);
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
  const character = getOwnedCharacterData(characterId);

  if (!characterId || !isKnownCharacterId(characterId)) {
    setAdminSpawnerStatus("Choose a valid brainrot first.");
    return;
  }

  grantOwnedCharacter(characterId, mutation, amount);
  selectedOwnedCharacterId = characterId;
  render();
  setAdminSpawnerStatus(
    `Spawned ${amount} ${getMutationDisplayName(mutation).toLowerCase()} ${character.name} into your collection.`,
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

function handleSailingIslandChange() {
  if (!dom.sailingIslandSelect) {
    return;
  }

  state.sailing.selectedIslandId = dom.sailingIslandSelect.value;
  render();
}

function handleSailingBoatChange() {
  if (!dom.sailingBoatSelect) {
    return;
  }

  state.sailing.selectedBoatId = dom.sailingBoatSelect.value;
  render();
}

function handleSailingAmountInput() {
  if (!dom.sailingAmountInput) {
    return;
  }

  state.sailing.amount = Math.max(
    1,
    Math.min(MAX_SAILS_PER_TRIP, Math.floor(Number(dom.sailingAmountInput.value) || 1)),
  );
  render();
}

function startSailing() {
  const boat = getCurrentSailingBoat();
  const cost = getSailingCost();

  if (state.money < cost) {
    setSailingStatus(`You need ${formatMoney(cost)} to launch this sail.`);
    render();
    return;
  }

  state.money -= cost;
  state.sailing.jobs.push(
    normalizeSailingJob({
      islandId: getCurrentSailingIsland().id,
      boatId: boat.id,
      amount: state.sailing.amount,
      endsAt: Date.now() + SAILING_DURATION_MS,
    }),
  );

  setSailingStatus(
    `Sent ${state.sailing.amount} sail${state.sailing.amount === 1 ? "" : "s"} to ${getCurrentSailingIsland().name}. Return time: 1 minute.`,
  );
  render();
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
  state.sailing = normalizeSailingState();
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
  resolveFinishedSailingJobs();
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
  renderSailingPage();
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
bindClick(dom.sailingPageButton, openSailingPage);
bindClick(dom.backToGameButton, closeRebirthPage);
bindClick(dom.adminBackButton, closeAdminPage);
bindClick(dom.sailingBackButton, closeSailingPage);
bindClick(dom.miniRebirthButton, tryRebirth);
bindClick(dom.adminPasswordSubmitButton, submitAdminPassword);
bindClick(dom.adminConfirmButton, adminSpawnBrainrots);
bindClick(dom.adminSetMoneyButton, adminSetMoney);
bindClick(dom.adminSetRebirthButton, adminSetRebirth);
bindClick(dom.adminSetEventButton, adminSetEvent);
bindClick(dom.adminClearEventButton, adminClearEvent);
bindClick(dom.sailingConfirmButton, startSailing);
if (dom.adminPasswordInput) {
  dom.adminPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitAdminPassword();
    }
  });
}
if (dom.sailingIslandSelect) {
  dom.sailingIslandSelect.addEventListener("change", handleSailingIslandChange);
}
if (dom.sailingBoatSelect) {
  dom.sailingBoatSelect.addEventListener("change", handleSailingBoatChange);
}
if (dom.sailingAmountInput) {
  dom.sailingAmountInput.addEventListener("input", handleSailingAmountInput);
}

awardOfflineIncome();
syncEventState();
resolveFinishedSailingJobs();
ensureCurrentRoll();
render();
applyCurrentPageView();
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
