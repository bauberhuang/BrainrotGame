/* ================================================================
   data.js — Fetches game data from Python server at load time.
   Exposes window.GameData plus window.GameDataReady promise.
   ================================================================ */

(function () {
  // Fallback data immediately so D() never crashes
  window.GameData = {
    characters: [],
    luckyBlockCharacters: [],
    adminOnlyCharacters: [],
    sailingBoats: [{ id: "traveler-boat", name: "Boat", brainrotChance: 0.05, cost: 1e7, flavor: "" }],
    sailingIslands: [{ id: "legendary-island", name: "Island", flavor: "", rewards: [] }],
    mutations: { normal: { label: "NORMAL", multiplier: 1, countKey: "normalCount", className: "normal" } },
    MUTATIONS: { normal: { label: "NORMAL", multiplier: 1, countKey: "normalCount", className: "normal" } },
    EVENT_MUTATION_WEIGHTS: { rainbow: 4, radioactive: 1, diamond: 2 },
    CONST: { SAVE_KEY_PREFIX: "brainrot-idle-save-v4", MAX_REBIRTHS: 35, AUTO_ROLL_SECONDS: 10, PLAYTIME_MILESTONES: [] },
    characterById: {},
    luckyBlockCharacterById: {},
    sailingIslandById: {},
    sailingBoatById: {},
    totalCharacterValue: 0,
    defaultLuckyBlockIds: [],
    sailingRewardCharacters: [],
    sailingRewardCharacterById: {},
    SAILING_DIAMOND_CHANCE: 0.005,
  };

  function populateFromServer(data) {
    var cnst = data.constants;
    cnst.PLAYTIME_MILESTONES = data.playtimeMilestones;
    window.GameData = {
      characters: data.characters,
      luckyBlockCharacters: data.luckyBlockCharacters,
      adminOnlyCharacters: data.adminOnlyCharacters,
      sailingBoats: data.sailingBoats,
      sailingIslands: data.sailingIslands,
      mutations: data.mutations,
      MUTATIONS: data.mutations,
      EVENT_MUTATION_WEIGHTS: data.eventMutationWeights,
      CONST: cnst,
      characterById: data.characterById,
      luckyBlockCharacterById: data.luckyBlockById,
      sailingIslandById: data.sailingIslandById,
      sailingBoatById: data.sailingBoatById,
      totalCharacterValue: data.totalCharacterValue,
      defaultLuckyBlockIds: data.defaultLuckyBlockIds,
      sailingRewardCharacters: data.sailingRewardCharacters,
      sailingRewardCharacterById: data.sailingRewardById,
      SAILING_DIAMOND_CHANCE: cnst.SAILING_DIAMOND_CHANCE,
    };
    console.log("Game data loaded from Python server (" + data.characters.length + " characters)");
  }

  // Async fetch — resolves when data is ready
  window.GameDataReady = fetch("/api/game-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  })
    .then(function (resp) {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.json();
    })
    .then(function (data) {
      populateFromServer(data);
    })
    .catch(function (err) {
      console.warn("Using fallback game data — server may be down:", err.message);
    });
})();
