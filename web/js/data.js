/* ================================================================
   data.js — Fetches game data from Python server at load time.
   Exposes window.GameData (synchronous after initial fetch).
   ================================================================ */

(function () {
  // Synchronous XHR — blocks once at startup, cached thereafter
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/game-data", false); // false = synchronous
  xhr.setRequestHeader("Content-Type", "application/json");
  try {
    xhr.send("{}");
    if (xhr.status === 200) {
      var d = JSON.parse(xhr.responseText);
      // Merge PLAYTIME_MILESTONES into CONST (code uses D().CONST.PLAYTIME_MILESTONES)
      var cnst = d.constants;
      cnst.PLAYTIME_MILESTONES = d.playtimeMilestones;

      window.GameData = {
        characters: d.characters,
        luckyBlockCharacters: d.luckyBlockCharacters,
        adminOnlyCharacters: d.adminOnlyCharacters,
        sailingBoats: d.sailingBoats,
        sailingIslands: d.sailingIslands,
        mutations: d.mutations,
        MUTATIONS: d.mutations,
        EVENT_MUTATION_WEIGHTS: d.eventMutationWeights,
        CONST: cnst,
        characterById: d.characterById,
        luckyBlockCharacterById: d.luckyBlockById,
        sailingIslandById: d.sailingIslandById,
        sailingBoatById: d.sailingBoatById,
        totalCharacterValue: d.totalCharacterValue,
        defaultLuckyBlockIds: d.defaultLuckyBlockIds,
        sailingRewardCharacters: d.sailingRewardCharacters,
        sailingRewardCharacterById: d.sailingRewardById,
        SAILING_DIAMOND_CHANCE: cnst.SAILING_DIAMOND_CHANCE,
      };
      console.log("Game data loaded from Python server (" + d.characters.length + " characters)");
      return;
    }
  } catch (e) {
    console.error("Failed to load game data from server:", e);
  }

  // Fallback: empty data (game won't work, but won't crash)
  console.warn("Using fallback empty game data — server may be down");
  window.GameData = {
    characters: [],
    luckyBlockCharacters: [],
    adminOnlyCharacters: [],
    sailingBoats: [{ id: "traveler-boat", name: "Boat", brainrotChance: 0.05, cost: 1e7, flavor: "" }],
    sailingIslands: [{ id: "legendary-island", name: "Island", flavor: "", rewards: [] }],
    mutations: { normal: { label: "NORMAL", multiplier: 1, countKey: "normalCount", className: "normal" } },
    MUTATIONS: { normal: { label: "NORMAL", multiplier: 1, countKey: "normalCount", className: "normal" } },
    EVENT_MUTATION_WEIGHTS: { rainbow: 4, radioactive: 1, diamond: 2 },
    CONST: { SAVE_KEY_PREFIX: "brainrot-idle-save-v4", MAX_REBIRTHS: 20, AUTO_ROLL_SECONDS: 10, PLAYTIME_MILESTONES: [] },
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
})();
