/* ================================================================
   utils.js — Pure helper functions (no side effects)
   ================================================================ */

var D = () => window.GameData;

/* ---------- Money formatting ---------- */

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

  const abs = Math.abs(value);
  for (const tier of tiers) {
    if (abs >= tier.limit) {
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

/* ---------- SVG letter images ---------- */

function createLetterBrainrotImage(letter, startColor, endColor, name) {
  const displayName = name || letter;
  const shortName = displayName.length > 14 ? displayName.slice(0, 14) + "..." : displayName;
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">',
    "<defs>",
    '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
    `<stop offset="0%" stop-color="${startColor}" />`,
    `<stop offset="100%" stop-color="${endColor}" />`,
    "</linearGradient>",
    '<radialGradient id="glow" cx="50%" cy="42%" r="50%">',
    '<stop offset="0%" stop-color="rgba(255,255,255,0.25)" />',
    '<stop offset="100%" stop-color="rgba(255,255,255,0)" />',
    "</radialGradient>",
    "</defs>",
    '<rect width="240" height="240" rx="44" fill="url(#bg)" />',
    '<circle cx="120" cy="100" r="72" fill="url(#glow)" />',
    '<circle cx="120" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />',
    `<text x="50%" y="48%" text-anchor="middle" font-size="88" font-family="Arial, sans-serif" font-weight="700" fill="white">${letter}</text>`,
    `<text x="50%" y="78%" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" font-weight="600" fill="rgba(255,255,255,0.85)">${shortName}</text>`,
    "</svg>",
  ].join("");
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// Fill in wiki images for sailing rewards (called once at init)
function fillSailingRewardImages() {
  for (var i = 0; i < D().sailingRewardCharacters.length; i++) {
    var reward = D().sailingRewardCharacters[i];
    if (reward.img) continue;
    var wikiName = reward.name.replace(/ /g, "_");
    reward.img = "https://stealabrainrot.fandom.com/wiki/Special:FilePath/" + wikiName + ".png";
  }
  for (var j = 0; j < D().sailingIslands.length; j++) {
    var island = D().sailingIslands[j];
    for (var k = 0; k < island.rewards.length; k++) {
      var r = island.rewards[k];
      if (r.img) continue;
      var wikiName = r.name.replace(/ /g, "_");
      r.img = "https://stealabrainrot.fandom.com/wiki/Special:FilePath/" + wikiName + ".png";
    }
  }
}

// Fill in wiki images for characters with null img (called once at init)
function fillCharacterImages() {
  // Known correct filenames on the wiki (don't follow a predictable pattern)
  var knownFiles = {
    "Burbaloni Loliloli": "BurbaloniLuliloli.png",
    "Meowl": "Clear_background_clear_meowl_image.png",
    "Piccione Macchina": "PIGEONS_ARE_SPIES_MADE_BY_THE_GOVERNMENT.png",
    "Ballerino Lololo": "Ballerinolololo.png",
    "Rhino Toasterino": "Untitled210_20250808180116.png",
    "Chimpanzini Bananini": "ChimpanziniBananini.png",
    "Sigma Boy": "Sig_ma_Boy.png",
    "Svinina Bombardino": "Homicidio_doloso.png",
    "Cacto Hipopotamo": "Cacto_Hipopotamo1.png",
    "Bandito Bobritto": "Oi_Oi_Oi.png",
  };
  for (var i = 0; i < D().characters.length; i++) {
    var ch = D().characters[i];
    if (ch.img) continue;
    var file = knownFiles[ch.name];
    if (!file) {
      // Fallback: guess filename from name (spaces → underscores)
      file = ch.name.replace(/ /g, "_") + ".png";
    }
    ch.img = "https://stealabrainrot.fandom.com/wiki/Special:FilePath/" + file;
  }
}

/* ---------- Rarity ---------- */

function getRarityLabel(value, percent, tierName) {
  if (tierName) {
    var map = {
      og: { text: "OG", className: "og" },
      divine: { text: "DIVINE", className: "divine" },
      celestial: { text: "CELESTIAL", className: "celestial" },
      secret: { text: "SECRET", className: "secret" },
      mythic: { text: "MYTHIC", className: "mythic" },
      god: { text: "GOD", className: "god" },
      epic: { text: "EPIC", className: "epic" },
      uncommon: { text: "UNCOMMON", className: "uncommon" },
      common: { text: "COMMON", className: "common" },
    };
    return map[tierName] || map.common;
  }
  var pct = percent !== undefined ? percent : (value / D().totalCharacterValue) * 100;
  if (pct < 0.008) return { text: "OG", className: "og" };
  if (pct < 0.04)  return { text: "DIVINE", className: "divine" };
  if (pct < 0.12) return { text: "CELESTIAL", className: "celestial" };
  if (pct < 0.35) return { text: "SECRET", className: "secret" };
  if (pct < 0.8)  return { text: "MYTHIC", className: "mythic" };
  if (pct < 1.8)  return { text: "GOD", className: "god" };
  if (pct < 3.5)  return { text: "EPIC", className: "epic" };
  if (pct < 6.5)  return { text: "UNCOMMON", className: "uncommon" };
  return { text: "COMMON", className: "common" };
}

function getValueFraction(value) {
  return `${value}/${D().totalCharacterValue}`;
}

function formatPercentFromValue(value) {
  const percent = (value / D().totalCharacterValue) * 100;
  const rounded = Math.round(percent * 100) / 100;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
}

function getPercentNumberFromValue(value) {
  return Math.round((value / D().totalCharacterValue) * 100 * 100) / 100;
}

function getValueChanceLabel(value) {
  return `${getValueFraction(value)} (${formatPercentFromValue(value)})`;
}

/* ---------- Lucky block helpers ---------- */

function getLuckyBlockPool(selectedIds) {
  return D().luckyBlockCharacters.filter((c) => c.luckyBlockOnly || selectedIds.includes(c.id));
}

function getLuckyBlockTotalValue(selectedIds) {
  return getLuckyBlockPool(selectedIds).reduce((t, c) => t + c.luckyBlockValue, 0);
}

function formatLuckyBlockChanceLabel(character, selectedIds) {
  const totalValue = getLuckyBlockTotalValue(selectedIds);
  if (totalValue <= 0) return "0/0 (0%)";
  const percent = (character.luckyBlockValue / totalValue) * 100;
  const rounded = Math.round(percent * 100) / 100;
  const label = Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
  return `${character.luckyBlockValue}/${totalValue} (${label})`;
}

function getLuckyBlockPercentNumber(character, selectedIds) {
  const totalValue = getLuckyBlockTotalValue(selectedIds);
  if (totalValue <= 0) return 0;
  return Math.round((character.luckyBlockValue / totalValue) * 100 * 100) / 100;
}

/* ---------- Weighted random ---------- */

function rollByWeight(items, weightKey) {
  const totalWeight = items.reduce((t, item) => t + (Number(item[weightKey]) || 0), 0);
  if (totalWeight <= 0) return null;
  const roll = Math.random() * totalWeight;
  let running = 0;
  for (const item of items) {
    running += Number(item[weightKey]) || 0;
    if (roll <= running) return item;
  }
  return items[items.length - 1] || null;
}

/* ---------- Mutations ---------- */

function getMutationConfig(mutation) {
  return D().MUTATIONS[mutation] || D().MUTATIONS.normal;
}

function getMutationMultiplier(mutation) {
  return getMutationConfig(mutation).multiplier;
}

function getMutationDisplayName(mutation) {
  return getMutationConfig(mutation).label;
}

/* ---------- Rebirth helpers ---------- */

function getCashMultiplierForRebirthCount(rebirthCount) {
  return 1 + rebirthCount * 0.5;
}

function getNextRebirthMultiplier(currentRebirths) {
  return getCashMultiplierForRebirthCount(Math.min(D().CONST.MAX_REBIRTHS, currentRebirths + 1));
}

function getRebirthRequirement(rebirthCount) {
  return 1_000_000 * 5 ** rebirthCount;
}

function getOrdinalSuffix(value) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (value % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/* ---------- Misc helpers ---------- */

function isCutoutCharacterImage(character) {
  return /\.png$/i.test(character.img || "");
}

function getOwnedCharacterData(characterId) {
  var d = D();
  if (d.characterById[characterId]) return d.characterById[characterId];
  if (d.luckyBlockCharacterById[characterId]) {
    var lc = d.luckyBlockCharacterById[characterId];
    return {
      id: lc.id, name: lc.name, value: lc.luckyBlockValue, cost: 0,
      income: lc.income || 0, img: lc.img, tier: "mythic",
      flavor: lc.luckyBlockOnly
        ? "Lucky block special brainrot. It only appears from the lucky block pool."
        : "Standard lucky block pick. Its spawn chance is based on lucky block value.",
      isLuckyBlockReward: true,
    };
  }
  if (d.adminOnlyCharacterById[characterId]) return d.adminOnlyCharacterById[characterId];
  if (d.sailingRewardCharacterById[characterId]) {
    var sc = d.sailingRewardCharacterById[characterId];
    return {
      id: sc.id, name: sc.name, value: sc.value ?? sc.sailingValue ?? 0,
      cost: Number(sc.cost) || 0, income: Number(sc.income) || 0, tier: "god",
      flavor: sc.flavor || (sc.name + " is a sailing reward from " + (sc.islandName || "the harbor") + "."),
      img: sc.img || "", isSailingReward: true,
    };
  }
  return { id: characterId, name: characterId, value: 0, cost: 0, income: 0, tier: "common", flavor: "Unknown brainrot reward.", img: "", isLuckyBlockReward: true };
}

function isKnownCharacterId(characterId) {
  const d = D();
  return Boolean(
    d.characterById[characterId] ||
    d.luckyBlockCharacterById[characterId] ||
    d.adminOnlyCharacterById[characterId] ||
    d.sailingRewardCharacterById[characterId],
  );
}

function isLuckyBlockRewardCharacter(characterId) {
  return Boolean(D().luckyBlockCharacterById[characterId]);
}

/* ---------- Expose on window ---------- */

window.GameUtils = {
  formatMoney,
  formatMultiplier,
  formatCountdown,
  createLetterBrainrotImage,
  fillSailingRewardImages,
  fillCharacterImages,
  getRarityLabel,
  getValueFraction,
  formatPercentFromValue,
  getPercentNumberFromValue,
  getValueChanceLabel,
  getLuckyBlockPool,
  getLuckyBlockTotalValue,
  formatLuckyBlockChanceLabel,
  getLuckyBlockPercentNumber,
  rollByWeight,
  getMutationConfig,
  getMutationMultiplier,
  getMutationDisplayName,
  getCashMultiplierForRebirthCount,
  getNextRebirthMultiplier,
  getRebirthRequirement,
  getOrdinalSuffix,
  isCutoutCharacterImage,
  getOwnedCharacterData,
  isKnownCharacterId,
  isLuckyBlockRewardCharacter,
};
