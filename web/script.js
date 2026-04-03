const imageLibrary = {
  sixtySeven: "img/67.jpg",
  tungTungTungSahur: "img/ttt.webp",
  ballerinaCappuccina: "img/ballerina.jfif",
  tralaleroTralala: "img/tralalelo.jfif",
  fluriFlura: "img/FluriFlura.webp",
  strawberryElephant: "img/Strawberry-elephant.jpg",
};

const characters = [
  {
    id: "67",
    name: "67",
    value: 4,
    cost: 10,
    income: 1,
    flavor: "67! the chaos in 2025",
    img: imageLibrary.sixtySeven,
  },
  {
    id: "tung-tung-tung-sahur",
    name: "Tung Tung Tung Sahur",
    value: 1,
    cost: 50,
    income: 5,
    flavor: "the original brainrot and also the first brainrot made by OG Noxa",
    img: imageLibrary.tungTungTungSahur,
  },
  {
    id: "ballerina-cappuccina",
    name: "Ballerina Cappuccina",
    value: 1,
    cost: 50,
    income: 5,
    flavor: "Tung tung's wife",
    img: imageLibrary.ballerinaCappuccina,
  },
  {
    id: "tralalero-tralala",
    name: "Tralalelo Tralala",
    value: 1,
    cost: 50,
    income: 5,
    flavor: "tung tung's friend who is beside the sea",
    img: imageLibrary.tralaleroTralala,
  },
  {
    id: "fluri-flura",
    name: "Fluri Flura",
    value: 2.5,
    cost: 25,
    income: 2.5,
    flavor: "flying across the sea!",
    img: imageLibrary.fluriFlura,
  },
  {
    id: "strawberry-elephant",
    name: "Strawberry Elephant",
    value: 0.5,
    cost: 100,
    income: 10,
    flavor: "the first \"brainrot\" ever made, made in 2009",
    img: imageLibrary.strawberryElephant,
  },
];

const RAINBOW_CHANCE = 0.1;
const RAINBOW_MULTIPLIER = 1.5;
const MAX_REBIRTHS = 20;
const AUTO_ROLL_SECONDS = 10;
const SAVE_KEY = "brainrot-idle-save-v2";

const dom = {
  moneyDisplay: document.querySelector("#moneyDisplay"),
  totalIncomeDisplay: document.querySelector("#totalIncomeDisplay"),
  mainPage: document.querySelector("#mainPage"),
  rebirthPage: document.querySelector("#rebirthPage"),
  rebirthPageButton: document.querySelector("#rebirthPageButton"),
  backToGameButton: document.querySelector("#backToGameButton"),
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
  spriteImage: document.querySelector("#spriteImage"),
  spriteFrame: document.querySelector("#spriteFrame"),
  traitTag: document.querySelector("#traitTag"),
  rollChanceDisplay: document.querySelector("#rollChanceDisplay"),
  ownedList: document.querySelector("#ownedList"),
  statusText: document.querySelector("#statusText"),
  buyButton: document.querySelector("#buyButton"),
  rollButton: document.querySelector("#rollButton"),
};

const characterById = Object.fromEntries(characters.map((entry) => [entry.id, entry]));
const totalCharacterValue = characters.reduce((total, entry) => total + entry.value, 0);

const state = loadState();
let autoRollRemaining = AUTO_ROLL_SECONDS;

function createDefaultState() {
  return {
    money: 10,
    currentRoll: null,
    owned: {},
    rebirthCount: 0,
    lastTick: Date.now(),
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
      Object.entries(parsed.owned || {}).map(([id, entry]) => {
        const legacyCount = Number(entry.count) || 0;
        return [
          id,
          {
            id,
            normalCount: Number(entry.normalCount) || legacyCount,
            rainbowCount: Number(entry.rainbowCount) || 0,
          },
        ];
      }),
    );

    return {
      money: Number(parsed.money) || 10,
      currentRoll: parsed.currentRoll || null,
      owned: normalizedOwned,
      rebirthCount: Math.max(0, Math.min(MAX_REBIRTHS, Number(parsed.rebirthCount) || 0)),
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

function getRarityLabel(value) {
  if (value <= 1) {
    return {
      text: "MYTHIC",
      className: "mythic",
    };
  }

  if (value <= 4) {
    return {
      text: "EPIC",
      className: "epic",
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

function getValueChanceLabel(value) {
  return `${getValueFraction(value)} (${formatPercentFromValue(value)})`;
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
  const rainbow = Math.random() < RAINBOW_CHANCE;

  return {
    id: base.id,
    rainbow,
  };
}

function getUnitIncome(rolledCharacter) {
  const baseCharacter = characterById[rolledCharacter.id];
  const rainbowMultiplier = rolledCharacter.rainbow ? RAINBOW_MULTIPLIER : 1;
  return baseCharacter.income * rainbowMultiplier * getCashMultiplierForRebirthCount(state.rebirthCount);
}

function getTotalIncomePerSecond() {
  const cashMultiplier = getCashMultiplierForRebirthCount(state.rebirthCount);

  return Object.values(state.owned).reduce((total, entry) => {
    const baseCharacter = characterById[entry.id];
    const normalIncome = entry.normalCount * baseCharacter.income;
    const rainbowIncome = entry.rainbowCount * baseCharacter.income * RAINBOW_MULTIPLIER;
    return total + (normalIncome + rainbowIncome) * cashMultiplier;
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
  const rarity = getRarityLabel(character.value);

  dom.characterName.textContent = character.name;
  dom.rarityTag.textContent = rarity.text;
  dom.rarityTag.className = `rarity-tag ${rarity.className}`;
  dom.characterFlavor.textContent = character.flavor;
  dom.characterIncome.textContent = `${formatMoney(income)}/s`;
  dom.characterCost.textContent = formatMoney(character.cost);
  dom.spriteImage.src = character.img;
  dom.spriteImage.alt = character.name;
  dom.rollChanceDisplay.textContent = `Value ${getValueChanceLabel(character.value)}`;

  dom.traitTag.classList.toggle("hidden", !current.rainbow);
  dom.spriteFrame.classList.toggle("rainbow", current.rainbow);
}

function renderRollTimer() {
  dom.rollTimerDisplay.textContent = `${autoRollRemaining}s`;
}

function renderTotals() {
  dom.moneyDisplay.textContent = formatMoney(state.money);
  dom.totalIncomeDisplay.textContent = `${formatMoney(getTotalIncomePerSecond())}/s`;
}

function renderOwned() {
  const ownedEntries = Object.values(state.owned).sort((a, b) => {
    return characterById[b.id].value - characterById[a.id].value;
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
      const character = characterById[entry.id];
      const rarity = getRarityLabel(character.value);
      const income =
        (entry.normalCount * character.income +
          entry.rainbowCount * character.income * RAINBOW_MULTIPLIER) *
        getCashMultiplierForRebirthCount(state.rebirthCount);
      const baseIncomeWithMultiplier = character.income * getCashMultiplierForRebirthCount(state.rebirthCount);

      return `
        <article class="owned-card">
          <img class="owned-thumb" src="${character.img}" alt="${character.name}" />
          <div>
            <p class="owned-name">${character.name}</p>
            <p class="owned-meta">${rarity.text}</p>
            <p class="owned-meta">Value ${getValueChanceLabel(character.value)}</p>
            <p class="owned-meta">Normal ${entry.normalCount}</p>
            <p class="owned-meta">Rainbow ${entry.rainbowCount}</p>
            <p class="owned-meta">Base ${formatMoney(baseIncomeWithMultiplier)}/s each</p>
          </div>
          <p class="owned-income">${formatMoney(income)}/s</p>
        </article>
      `;
    })
    .join("");
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
  renderTotals();
  renderCurrentRoll();
  renderRollTimer();
  renderOwned();
  renderRebirthPage();
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
  setNewRoll(resetTimer);
  const rolled = characterById[state.currentRoll.id];

  if (state.currentRoll.rainbow) {
    setStatus(`${rolled.name} rolled with RAINBOW. Income boosted to 1.5x.`);
  } else {
    setStatus(`Rolled ${rolled.name}.`);
  }

  render();
}

function buyCurrentCharacter() {
  ensureCurrentRoll();

  const current = state.currentRoll;
  const character = characterById[current.id];

  if (state.money < character.cost) {
    setStatus(`Not enough money for ${character.name}. Auto-rolling a new one.`);
    rollCharacter(false);
    return;
  }

  state.money -= character.cost;

  if (!state.owned[current.id]) {
    state.owned[current.id] = {
      id: current.id,
      normalCount: 0,
      rainbowCount: 0,
    };
  }

  if (current.rainbow) {
    state.owned[current.id].rainbowCount += 1;
    setStatus(`Bought a RAINBOW ${character.name}. That copy earns 1.5x by itself.`);
  } else {
    state.owned[current.id].normalCount += 1;
    setStatus(`Bought ${character.name}. Passive income increased.`);
  }

  setNewRoll(true);
  render();
}

function openRebirthPage() {
  dom.mainPage.classList.add("hidden");
  dom.rebirthPage.classList.remove("hidden");
  renderRebirthPage();
  setRebirthStatus("Rebirth resets your money and owned brainrots, but keeps your multiplier forever.");
}

function closeRebirthPage() {
  dom.rebirthPage.classList.add("hidden");
  dom.mainPage.classList.remove("hidden");
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
  state.lastTick = Date.now();

  ensureCurrentRoll();
  render();
  setStatus(`Rebirth complete. All brainrots now earn ${formatMultiplier(getCashMultiplierForRebirthCount(state.rebirthCount))}.`);
  setRebirthStatus(`Rebirth ${state.rebirthCount} complete. Come back when you are ready for the next one.`);
}

function tickIncome() {
  state.money += getTotalIncomePerSecond();
  autoRollRemaining -= 1;
  if (autoRollRemaining <= 0) {
    rollCharacter();
  }
  renderTotals();
  renderRollTimer();
  saveState();
}

dom.rollButton.addEventListener("click", rollCharacter);
dom.buyButton.addEventListener("click", buyCurrentCharacter);
dom.rebirthPageButton.addEventListener("click", openRebirthPage);
dom.backToGameButton.addEventListener("click", closeRebirthPage);
dom.miniRebirthButton.addEventListener("click", tryRebirth);

awardOfflineIncome();
ensureCurrentRoll();
render();
setStatus("Your idle run started with $10. Roll and build your brainrot factory.");
setRebirthStatus("Stack rebirths to push every brainrot income higher.");

window.setInterval(tickIncome, 1000);
