window.BRAINROT_PAGE = "sailing";
window.BrainrotModules = window.BrainrotModules || {};

window.BrainrotModules.sailing = (() => {
  let bound = false;

  function getCurrentSailingIsland() {
    return window.BrainrotCore.getCurrentSailingIsland();
  }

  function getCurrentSailingBoat() {
    return window.BrainrotCore.getCurrentSailingBoat();
  }

  function getSailingCost() {
    return window.BrainrotCore.getSailingCost();
  }

  function getTotalActiveSails() {
    return window.BrainrotCore.getState().sailing.jobs.reduce((total, job) => total + job.amount, 0);
  }

  function getNextSailingReturnTime() {
    const jobs = window.BrainrotCore.getState().sailing.jobs;
    if (jobs.length === 0) {
      return null;
    }

    return Math.min(...jobs.map((job) => job.endsAt));
  }

  function setSailingStatus(message) {
    const { dom } = window.BrainrotCore;
    if (dom.sailingStatusText) {
      dom.sailingStatusText.textContent = message;
    }
  }

  function renderIslandOptions() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.sailingIslandSelect) {
      return;
    }

    dom.sailingIslandSelect.innerHTML = api.sailingIslands
      .map((island) => `<option value="${island.id}">${island.name}</option>`)
      .join("");
    dom.sailingIslandSelect.value = getCurrentSailingIsland().id;
  }

  function renderBoatOptions() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.sailingBoatSelect) {
      return;
    }

    dom.sailingBoatSelect.innerHTML = api.sailingBoats
      .map((boat) => `<option value="${boat.id}">${boat.name}</option>`)
      .join("");
    dom.sailingBoatSelect.value = getCurrentSailingBoat().id;
  }

  function render() {
    const api = window.BrainrotCore;
    const state = api.getState();
    const { dom } = api;
    if (!dom.sailingPage) {
      return;
    }

    const island = getCurrentSailingIsland();
    const boat = getCurrentSailingBoat();
    const canAfford = state.money >= getSailingCost();
    const nextReturn = getNextSailingReturnTime();

    renderIslandOptions();
    renderBoatOptions();
    dom.sailingBoatImage.src = api.constants.SAILING_BOAT_IMAGE;
    dom.sailingBoatImage.alt = boat.name;
    dom.sailingIslandName.textContent = island.name;
    dom.sailingChanceTag.textContent = `${Math.round(boat.brainrotChance * 100)}% Reward Rate`;
    dom.sailingIslandFlavor.textContent = `${island.flavor} ${boat.flavor}`;
    dom.sailingAmountInput.value = `${state.sailing.amount}`;
    dom.sailingCostDisplay.textContent = api.formatMoney(getSailingCost());
    dom.sailingActiveCountDisplay.textContent = `${getTotalActiveSails()}`;
    dom.sailingTimerDisplay.textContent = nextReturn ? api.formatCountdown(nextReturn - Date.now()) : "Ready";
    dom.sailingConfirmButton.disabled = !canAfford;
    dom.sailingRewardPreview.innerHTML = island.rewards
      .map(
        (reward) => `
          <article class="sailing-reward-card">
            <img class="owned-thumb" src="${reward.img}" alt="${reward.name}" />
            <div>
              <p class="owned-name">${reward.name}</p>
              <p class="owned-meta">${api.formatMoney(reward.income)}/s</p>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function handleSailingIslandChange() {
    const api = window.BrainrotCore;
    if (!api.dom.sailingIslandSelect) {
      return;
    }

    api.getState().sailing.selectedIslandId = api.dom.sailingIslandSelect.value;
    api.render();
  }

  function handleSailingBoatChange() {
    const api = window.BrainrotCore;
    if (!api.dom.sailingBoatSelect) {
      return;
    }

    api.getState().sailing.selectedBoatId = api.dom.sailingBoatSelect.value;
    api.render();
  }

  function handleSailingAmountInput() {
    const api = window.BrainrotCore;
    if (!api.dom.sailingAmountInput) {
      return;
    }

    api.getState().sailing.amount = Math.max(
      1,
      Math.min(api.constants.MAX_SAILS_PER_TRIP, Math.floor(Number(api.dom.sailingAmountInput.value) || 1)),
    );
    api.render();
  }

  function startSailing() {
    const api = window.BrainrotCore;
    const state = api.getState();
    const boat = getCurrentSailingBoat();
    const cost = getSailingCost();

    if (state.money < cost) {
      setSailingStatus(`You need ${api.formatMoney(cost)} to launch this sail.`);
      api.render();
      return;
    }

    state.money -= cost;
    state.sailing.jobs.push(
      api.normalizeSailingJob({
        islandId: getCurrentSailingIsland().id,
        boatId: boat.id,
        amount: state.sailing.amount,
        endsAt: Date.now() + api.constants.SAILING_DURATION_MS,
      }),
    );

    setSailingStatus(
      `Sent ${state.sailing.amount} sail${state.sailing.amount === 1 ? "" : "s"} to ${getCurrentSailingIsland().name}. Return time: 1 minute.`,
    );
    api.render();
  }

  function bind() {
    if (bound) {
      return;
    }

    const api = window.BrainrotCore;
    const { dom } = api;

    api.bindClick(dom.sailingConfirmButton, startSailing);
    if (dom.sailingIslandSelect) {
      dom.sailingIslandSelect.addEventListener("change", handleSailingIslandChange);
    }
    if (dom.sailingBoatSelect) {
      dom.sailingBoatSelect.addEventListener("change", handleSailingBoatChange);
    }
    if (dom.sailingAmountInput) {
      dom.sailingAmountInput.addEventListener("input", handleSailingAmountInput);
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
    setSailingStatus,
  };
})();

window.PAGE_BOOT = function pageBootSailing() {
  window.BrainrotModules.sailing.boot();
};
