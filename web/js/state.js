/* ================================================================
   state.js — Game state, save/load, admin auth
   ================================================================ */

var D = () => window.GameData;

/* ---------- Game state ---------- */

let state = createDefaultState();

function createDefaultState() {
  return {
    money: 10,
    currentRoll: null,
    owned: { "noobini-pizzanini": { id: "noobini-pizzanini", normalCount: 1, rainbowCount: 0, radioactiveCount: 0, diamondCount: 0 } },
    rebirthCount: 0,
    sailing: {
      selectedIslandId: D().sailingIslands[0].id,
      selectedBoatId: D().sailingBoats[0].id,
      amount: 1,
      jobs: [],
    },
    event: {
      activeMutation: null,
      endsAt: 0,
      playSeconds: 0,
    },
    totalPlaySeconds: 0,
    lastClaimedMilestoneIdx: -1,
    lastTick: Date.now(),
  };
}

function getState() { return state; }
function replaceState(next) { state = next; }

/* ---------- State normalization ---------- */

function normalizeOwnedEntry(id, entry) {
  if (!entry) entry = {};
  const legacyCount = Number(entry.count) || 0;
  return {
    id,
    normalCount: Number(entry.normalCount) || legacyCount,
    rainbowCount: Number(entry.rainbowCount) || 0,
    radioactiveCount: Number(entry.radioactiveCount) || 0,
    diamondCount: Number(entry.diamondCount) || 0,
  };
}

function normalizeCurrentRoll(currentRoll) {
  if (!currentRoll || !currentRoll.id) return null;
  const legacyMutation = currentRoll.mutation || (currentRoll.rainbow ? "rainbow" : "normal");
  return D().MUTATIONS[legacyMutation]
    ? { id: currentRoll.id, mutation: legacyMutation }
    : null;
}

function normalizeSailingJob(job) {
  if (!job) job = {};
  return {
    id: job.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    islandId: D().sailingIslandById[job.islandId] ? job.islandId : D().sailingIslands[0].id,
    boatId: D().sailingBoatById[job.boatId] ? job.boatId : D().sailingBoats[0].id,
    amount: Math.max(1, Math.min(D().CONST.MAX_SAILS_PER_TRIP, Number(job.amount) || 1)),
    endsAt: Number(job.endsAt) || Date.now() + D().CONST.SAILING_DURATION_MS,
  };
}

function normalizeSailingState(sailing) {
  if (!sailing) sailing = {};
  return {
    selectedIslandId: D().sailingIslandById[sailing.selectedIslandId]
      ? sailing.selectedIslandId : D().sailingIslands[0].id,
    selectedBoatId: D().sailingBoatById[sailing.selectedBoatId]
      ? sailing.selectedBoatId : D().sailingBoats[0].id,
    amount: Math.max(1, Math.min(D().CONST.MAX_SAILS_PER_TRIP, Number(sailing.amount) || 1)),
    jobs: Array.isArray(sailing.jobs) ? sailing.jobs.map(normalizeSailingJob) : [],
  };
}

/* ---------- Save / load game state ---------- */

var SAVE_KEY = D().CONST.SAVE_KEY_PREFIX;

function loadState() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createDefaultState();
    var parsed = JSON.parse(raw);
    var normalizedOwned = {};
    for (var id in (parsed.owned || {})) {
      normalizedOwned[id] = normalizeOwnedEntry(id, parsed.owned[id]);
    }
    var evt = parsed.event || {};
    return {
      money: Number(parsed.money) || 10,
      currentRoll: normalizeCurrentRoll(parsed.currentRoll),
      owned: normalizedOwned,
      rebirthCount: Math.max(0, Math.min(D().CONST.MAX_REBIRTHS, Number(parsed.rebirthCount) || 0)),
      sailing: normalizeSailingState(parsed.sailing),
      event: {
        activeMutation: D().MUTATIONS[evt.activeMutation] ? evt.activeMutation : null,
        endsAt: Number(evt.endsAt) || 0,
        playSeconds: Math.max(0, Number(evt.playSeconds) || 0),
      },
      totalPlaySeconds: Math.max(0, Number(parsed.totalPlaySeconds) || 0),
      lastClaimedMilestoneIdx: parsed.lastClaimedMilestoneIdx != null ? Number(parsed.lastClaimedMilestoneIdx) : -1,
      lastTick: Number(parsed.lastTick) || Date.now(),
    };
  } catch (e) {
    return createDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      ...state,
      lastTick: Date.now(),
    }));
  } catch (e) { /* ignore */ }
}

/* ---------- Admin auth ---------- */

let adminAuthorized = false;

function loadAdminAuthorization() {
  try {
    var expiresAt = Number(localStorage.getItem(D().CONST.ADMIN_AUTH_KEY)) || 0;
    return expiresAt > Date.now();
  } catch (e) { return false; }
}

function saveAdminAuthorization(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(D().CONST.ADMIN_AUTH_KEY, String(Date.now() + D().CONST.ADMIN_AUTH_DURATION_MS));
    } else {
      localStorage.removeItem(D().CONST.ADMIN_AUTH_KEY);
    }
  } catch (e) { /* ignore */ }
}

function getAdminAuthorized() { return adminAuthorized; }
function setAdminAuthorized(v) { adminAuthorized = v; }

/* ---------- Expose on window ---------- */

window.GameState = {
  // state
  createDefaultState,
  getState,
  replaceState,
  loadState,
  saveState,
  // normalization
  normalizeOwnedEntry,
  normalizeCurrentRoll,
  normalizeSailingState,
  normalizeSailingJob,
  // admin auth
  getAdminAuthorized,
  setAdminAuthorized,
  loadAdminAuthorization,
  saveAdminAuthorization,
};
