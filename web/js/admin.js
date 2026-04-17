window.BRAINROT_PAGE = "admin";
window.BrainrotModules = window.BrainrotModules || {};

window.BrainrotModules.admin = (() => {
  let bound = false;

  function setAdminStatus(message) {
    const { dom } = window.BrainrotCore;
    if (dom.adminStatusText) {
      dom.adminStatusText.textContent = message;
    }
  }

  function setAdminSpawnerStatus(message) {
    const { dom } = window.BrainrotCore;
    if (dom.adminSpawnerStatusText) {
      dom.adminSpawnerStatusText.textContent = message;
    }
  }

  function getAdminSpawnables() {
    const api = window.BrainrotCore;
    const combined = [
      ...api.characters,
      ...api.luckyBlockCharacters,
      ...api.sailingRewardCharacters,
      ...api.adminOnlyCharacters,
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

  function renderBrainrotOptions() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.adminBrainrotSelect) {
      return;
    }

    const previousValue = dom.adminBrainrotSelect.value;
    const spawnables = getAdminSpawnables();

    dom.adminBrainrotSelect.innerHTML = spawnables
      .map((entry) => `<option value="${entry.id}">${entry.name}</option>`)
      .join("");

    const hasPreviousValue = spawnables.some((entry) => entry.id === previousValue);
    if (hasPreviousValue) {
      dom.adminBrainrotSelect.value = previousValue;
      return;
    }

    const defaultAdminOnly = api.adminOnlyCharacters[0]?.id;
    dom.adminBrainrotSelect.value = defaultAdminOnly || spawnables[0]?.id || "";
  }

  function renderMutationOptions() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.adminMutationSelect) {
      return;
    }

    dom.adminMutationSelect.innerHTML = Object.entries(api.MUTATIONS)
      .map(([id, mutation], index) => `<option value="${id}">${index + 1} ${mutation.label}</option>`)
      .join("");
  }

  function renderEventOptions() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.adminEventSelect) {
      return;
    }

    dom.adminEventSelect.innerHTML = Object.entries(api.EVENT_MUTATION_WEIGHTS)
      .map(([id]) => `<option value="${id}">${api.getMutationDisplayName(id)}</option>`)
      .join("");
  }

  function renderView() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!api.canCurrentAccountUseAdmin()) {
      dom.adminAuthView.classList.remove("hidden");
      dom.adminSpawnerView.classList.add("hidden");
      return;
    }

    dom.adminAuthView.classList.toggle("hidden", api.getAdminAuthorized());
    dom.adminSpawnerView.classList.toggle("hidden", !api.getAdminAuthorized());
  }

  function render() {
    const api = window.BrainrotCore;
    const { dom } = api;

    if (!api.canCurrentAccountUseAdmin()) {
      api.setAdminAuthorized(false);
      api.saveAdminAuthorization(false);
      renderView();
      dom.adminAuthButton?.classList.add("hidden");
      setAdminStatus("Only whitelisted users can use admin tools.");
      return;
    }

    api.setAdminAuthorized(api.loadAdminAuthorization());
    dom.adminAuthButton?.classList.remove("hidden");
    renderView();
    if (!api.getAdminAuthorized()) {
      setAdminStatus("This whitelist user still needs admin auth.");
      return;
    }

    renderBrainrotOptions();
    renderMutationOptions();
    renderEventOptions();
    dom.adminSetMoneyInput.value = `${Math.floor(api.getState().money * 100) / 100}`;
    dom.adminSetRebirthInput.value = `${api.getState().rebirthCount}`;
    if (dom.adminMutationSelect) {
      dom.adminMutationSelect.value = dom.adminMutationSelect.value || "normal";
    }
    if (dom.adminEventSelect) {
      dom.adminEventSelect.value = api.getState().event.activeMutation || "rainbow";
    }
  }

  function submitAdminPassword() {
    const api = window.BrainrotCore;
    const { dom } = api;

    if (!api.canCurrentAccountUseAdmin()) {
      api.setAdminAuthorized(false);
      api.saveAdminAuthorization(false);
      render();
      setAdminStatus("Only whitelisted users can use admin tools.");
      return;
    }

    if (api.canCurrentAccountBypassAdminPassword()) {
      api.setAdminAuthorized(true);
      render();
      setAdminSpawnerStatus("Admin unlocked for ADMIN_BAUBER.");
      return;
    }

    if (dom.adminPasswordInput.value === api.constants.ADMIN_PASSWORD) {
      api.setAdminAuthorized(true);
      api.saveAdminAuthorization(true);
      render();
      setAdminSpawnerStatus("Admin unlocked. Choose mutation, brainrot, and amount.");
      return;
    }

    api.setAdminAuthorized(false);
    api.saveAdminAuthorization(false);
    render();
    setAdminStatus("Wrong password.");
  }

  function adminSpawnBrainrots() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!api.getAdminAuthorized()) {
      setAdminStatus("Please enter your password.");
      return;
    }

    const mutation = dom.adminMutationSelect.value;
    const characterId = dom.adminBrainrotSelect.value;
    const amount = Math.max(1, Math.min(1e18, Number(dom.adminAmountInput.value) || 1));
    const character = api.getOwnedCharacterData(characterId);

    if (!characterId || !api.isKnownCharacterId(characterId)) {
      setAdminSpawnerStatus("Choose a valid brainrot first.");
      return;
    }

    api.grantOwnedCharacter(characterId, mutation, amount);
    api.setSelectedOwnedCharacterId(characterId);
    api.render();
    setAdminSpawnerStatus(
      `Spawned ${amount} ${api.getMutationDisplayName(mutation).toLowerCase()} ${character.name} into your collection.`,
    );
  }

  function adminSetMoney() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!api.getAdminAuthorized()) {
      setAdminStatus("Please enter your password.");
      return;
    }

    const nextMoney = Number.parseFloat(dom.adminSetMoneyInput.value);
    if (Number.isNaN(nextMoney)) {
      setAdminSpawnerStatus("Enter a valid money number.");
      return;
    }

    api.getState().money = Math.max(0, nextMoney);
    api.render();
    setAdminSpawnerStatus(`Money set to ${api.formatMoney(api.getState().money)}.`);
  }

  function adminSetRebirth() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!api.getAdminAuthorized()) {
      setAdminStatus("Please enter your password.");
      return;
    }

    const nextRebirth = Number.parseInt(dom.adminSetRebirthInput.value, 10);
    if (Number.isNaN(nextRebirth)) {
      setAdminSpawnerStatus("Enter a valid rebirth number.");
      return;
    }

    api.getState().rebirthCount = Math.max(0, Math.min(api.constants.MAX_REBIRTHS, nextRebirth));
    api.render();
    setAdminSpawnerStatus(`Rebirth set to ${api.getState().rebirthCount}.`);
  }

  function adminSetEvent() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!api.getAdminAuthorized()) {
      setAdminStatus("Please enter your password.");
      return;
    }

    if (!dom.adminEventSelect) {
      setAdminSpawnerStatus("Refresh the page to load the event controls.");
      return;
    }

    const selectedEvent = dom.adminEventSelect.value;
    if (!api.EVENT_MUTATION_WEIGHTS[selectedEvent]) {
      setAdminSpawnerStatus("Choose a valid event.");
      return;
    }

    api.getState().event.activeMutation = selectedEvent;
    api.getState().event.endsAt = Date.now() + api.constants.EVENT_DURATION_MS;
    api.getState().event.playSeconds = 0;
    api.render();
    setAdminSpawnerStatus(`${api.getMutationDisplayName(selectedEvent)} event turned on for 5 minutes.`);
  }

  function adminClearEvent() {
    const api = window.BrainrotCore;
    if (!api.getAdminAuthorized()) {
      setAdminStatus("Please enter your password.");
      return;
    }

    api.getState().event.activeMutation = null;
    api.getState().event.endsAt = 0;
    api.getState().event.playSeconds = 0;
    api.render();
    setAdminSpawnerStatus("Event turned off.");
  }

  function bind() {
    if (bound) {
      return;
    }

    const api = window.BrainrotCore;
    const { dom } = api;

    api.bindClick(dom.adminPasswordSubmitButton, submitAdminPassword);
    api.bindClick(dom.adminConfirmButton, adminSpawnBrainrots);
    api.bindClick(dom.adminSetMoneyButton, adminSetMoney);
    api.bindClick(dom.adminSetRebirthButton, adminSetRebirth);
    api.bindClick(dom.adminSetEventButton, adminSetEvent);
    api.bindClick(dom.adminClearEventButton, adminClearEvent);

    if (dom.adminPasswordInput) {
      dom.adminPasswordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          submitAdminPassword();
        }
      });
    }

    bound = true;
  }

  function boot() {
    const api = window.BrainrotCore;
    api.applyCurrentPageView();
    bind();
    render();
  }

  return {
    boot,
    render,
  };
})();

window.PAGE_BOOT = function pageBootAdmin() {
  window.BrainrotModules.admin.boot();
};
