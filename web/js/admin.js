/* ================================================================
   admin.js — Admin panel: auth, spawn, set money/rebirth/event
   ================================================================ */

window.Admin = (() => {
  const D = () => window.GameData;
  const U = () => window.GameUtils;
  const S = () => window.GameState;
  const UI = () => window.GameUI;
  const G = () => window.Game;
  let bound = false;

  /* ---------- Helpers ---------- */

  function getSpawnables() {
    const combined = [
      ...D().characters,
      ...D().luckyBlockCharacters,
      ...D().sailingRewardCharacters,
      ...D().adminOnlyCharacters,
    ];
    const seen = new Set();
    const unique = [];
    for (const entry of combined) {
      if (!seen.has(entry.id)) {
        seen.add(entry.id);
        unique.push(entry);
      }
    }
    return unique.sort((a, b) => {
      if (a.adminOnly && !b.adminOnly) return -1;
      if (!a.adminOnly && b.adminOnly) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  function setStatus(msg) {
    const d = UI().dom;
    if (d.adminStatusText) d.adminStatusText.textContent = msg;
  }

  function setSpawnerStatus(msg) {
    const d = UI().dom;
    if (d.adminSpawnerStatusText) d.adminSpawnerStatusText.textContent = msg;
  }

  /* ---------- Render ---------- */

  function render() {
    var d = UI().dom;
    if (!d.adminPage) return;

    S().setAdminAuthorized(S().loadAdminAuthorization());
    if (d.adminAuthButton) d.adminAuthButton.classList.remove("hidden");
    renderView();

    if (!S().getAdminAuthorized()) {
      setStatus("Enter the admin password to unlock tools.");
      return;
    }

    // Populate selects
    const spawnables = getSpawnables();
    if (d.adminBrainrotSelect) {
      const prev = d.adminBrainrotSelect.value;
      d.adminBrainrotSelect.innerHTML = spawnables.map((e) => `<option value="${e.id}">${e.name}</option>`).join("");
      if (spawnables.some((e) => e.id === prev)) d.adminBrainrotSelect.value = prev;
      else d.adminBrainrotSelect.value = D().adminOnlyCharacters[0]?.id || spawnables[0]?.id || "";
    }

    if (d.adminMutationSelect) {
      d.adminMutationSelect.innerHTML = Object.entries(D().MUTATIONS)
        .map(([id, mut], i) => `<option value="${id}">${i + 1} ${mut.label}</option>`).join("");
    }

    if (d.adminEventSelect) {
      d.adminEventSelect.innerHTML = Object.entries(D().EVENT_MUTATION_WEIGHTS)
        .map(([id]) => `<option value="${id}">${U().getMutationDisplayName(id)}</option>`).join("");
    }

    const st = S().getState();
    if (d.adminSetMoneyInput) d.adminSetMoneyInput.value = `${Math.floor(st.money * 100) / 100}`;
    if (d.adminSetRebirthInput) d.adminSetRebirthInput.value = `${st.rebirthCount}`;
    if (d.adminMutationSelect) d.adminMutationSelect.value = d.adminMutationSelect.value || "normal";
    if (d.adminEventSelect) d.adminEventSelect.value = st.event.activeMutation || "rainbow";
  }

  function renderView() {
    const d = UI().dom;
    const authed = S().getAdminAuthorized();
    if (d.adminAuthView) d.adminAuthView.classList.toggle("hidden", authed);
    if (d.adminSpawnerView) d.adminSpawnerView.classList.toggle("hidden", !authed);
  }

  /* ---------- Actions ---------- */

  function submitPassword() {
    const d = UI().dom;
    if (d.adminPasswordInput.value === D().CONST.ADMIN_PASSWORD) {
      S().setAdminAuthorized(true);
      S().saveAdminAuthorization(true);
      render();
      setSpawnerStatus("Admin unlocked. Choose mutation, brainrot, and amount.");
    } else {
      S().setAdminAuthorized(false);
      S().saveAdminAuthorization(false);
      render();
      setStatus("Wrong password.");
    }
  }

  function spawnBrainrots() {
    const d = UI().dom;
    if (!S().getAdminAuthorized()) { setStatus("Please enter your password."); return; }

    const mutation = d.adminMutationSelect.value;
    const characterId = d.adminBrainrotSelect.value;
    const amount = Math.max(1, Math.min(1e18, Number(d.adminAmountInput.value) || 1));
    const ch = U().getOwnedCharacterData(characterId);

    if (!characterId || !U().isKnownCharacterId(characterId)) {
      setSpawnerStatus("Choose a valid brainrot first.");
      return;
    }

    G().grantOwnedCharacter(characterId, mutation, amount);
    G().setSelectedOwnedCharacterId(characterId);
    G().fullRender();
    setSpawnerStatus(`Spawned ${amount} ${U().getMutationDisplayName(mutation).toLowerCase()} ${ch.name} into your collection.`);
  }

  function setMoney() {
    const d = UI().dom;
    if (!S().getAdminAuthorized()) { setStatus("Please enter your password."); return; }
    const v = Number.parseFloat(d.adminSetMoneyInput.value);
    if (Number.isNaN(v)) { setSpawnerStatus("Enter a valid money number."); return; }
    S().getState().money = Math.max(0, v);
    G().fullRender();
    setSpawnerStatus(`Money set to ${U().formatMoney(S().getState().money)}.`);
  }

  function setRebirth() {
    const d = UI().dom;
    if (!S().getAdminAuthorized()) { setStatus("Please enter your password."); return; }
    const v = Number.parseInt(d.adminSetRebirthInput.value, 10);
    if (Number.isNaN(v)) { setSpawnerStatus("Enter a valid rebirth number."); return; }
    S().getState().rebirthCount = Math.max(0, Math.min(D().CONST.MAX_REBIRTHS, v));
    G().fullRender();
    setSpawnerStatus(`Rebirth set to ${S().getState().rebirthCount}.`);
  }

  function setEvent() {
    const d = UI().dom;
    if (!S().getAdminAuthorized()) { setStatus("Please enter your password."); return; }
    const selected = d.adminEventSelect?.value;
    if (!selected || !D().EVENT_MUTATION_WEIGHTS[selected]) { setSpawnerStatus("Choose a valid event."); return; }
    const st = S().getState();
    st.event.activeMutation = selected;
    st.event.endsAt = Date.now() + D().CONST.EVENT_DURATION_MS;
    st.event.playSeconds = 0;
    G().fullRender();
    setSpawnerStatus(`${U().getMutationDisplayName(selected)} event turned on for 5 minutes.`);
  }

  function clearEvent() {
    if (!S().getAdminAuthorized()) { setStatus("Please enter your password."); return; }
    const st = S().getState();
    st.event.activeMutation = null;
    st.event.endsAt = 0;
    st.event.playSeconds = 0;
    G().fullRender();
    setSpawnerStatus("Event turned off.");
  }

  function spawnAllBrainrots() {
    if (!S().getAdminAuthorized()) { setStatus("Please enter your password."); return; }
    var allChars = D().characters;
    var count = 0;
    for (var i = 0; i < allChars.length; i++) {
      G().grantOwnedCharacter(allChars[i].id, "normal", 1);
      count++;
    }
    G().fullRender();
    setSpawnerStatus("Spawned 1 of each brainrot — " + count + " total added to your collection.");
  }

  /* ---------- Bind & boot ---------- */

  function bind() {
    if (bound) return;
    const d = UI().dom;
    UI().bindClick(d.adminPasswordSubmitButton, submitPassword);
    UI().bindClick(d.adminConfirmButton, spawnBrainrots);
    UI().bindClick(d.adminSpawnAllButton, spawnAllBrainrots);
    UI().bindClick(d.adminSetMoneyButton, setMoney);
    UI().bindClick(d.adminSetRebirthButton, setRebirth);
    UI().bindClick(d.adminSetEventButton, setEvent);
    UI().bindClick(d.adminClearEventButton, clearEvent);
    d.adminPasswordInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") submitPassword(); });
    bound = true;
  }

  function boot() {
    bind();
    render();
  }

  return { boot, render };
})();
