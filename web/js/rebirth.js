window.BRAINROT_PAGE = "rebirth";
window.BrainrotModules = window.BrainrotModules || {};

window.BrainrotModules.rebirth = (() => {
  let bound = false;

  function render() {
    const api = window.BrainrotCore;
    const state = api.getState();
    const { dom } = api;
    const currentMultiplier = api.getCashMultiplierForRebirthCount(state.rebirthCount);
    const nextMultiplier = api.getNextRebirthMultiplier();
    const requirement = api.getRebirthRequirement(state.rebirthCount);
    const isMaxed = state.rebirthCount >= api.constants.MAX_REBIRTHS;
    const nextRebirthNumber = state.rebirthCount + 1;

    dom.rebirthCountDisplay.textContent = `${state.rebirthCount}`;
    dom.cashMultiplierDisplay.textContent = api.formatMultiplier(currentMultiplier);
    dom.nextMultiplierDisplay.textContent = isMaxed ? "MAX" : api.formatMultiplier(nextMultiplier);
    dom.rebirthRequirementDisplay.textContent = isMaxed ? "MAXED" : api.formatMoney(requirement);
    dom.rebirthDescription.textContent = isMaxed
      ? "You reached the rebirth cap. Every brainrot is already boosted as far as this system goes."
      : `Your ${nextRebirthNumber}${api.getOrdinalSuffix(nextRebirthNumber)} rebirth will boost all brainrots to ${api.formatMultiplier(nextMultiplier)} cash.`;
    dom.miniRebirthButton.disabled = isMaxed;
    dom.miniRebirthButton.textContent = isMaxed ? "Max Rebirth Reached" : "Rebirth";
  }

  function tryRebirth() {
    const api = window.BrainrotCore;
    const state = api.getState();

    if (state.rebirthCount >= api.constants.MAX_REBIRTHS) {
      api.setRebirthStatus("You already reached the max rebirth level.");
      return;
    }

    const requirement = api.getRebirthRequirement(state.rebirthCount);
    if (state.money < requirement) {
      api.setRebirthStatus(`You need ${api.formatMoney(requirement)} cash before you can rebirth.`);
      return;
    }

    state.rebirthCount += 1;
    state.money = 10;
    state.currentRoll = null;
    state.owned = {};
    state.sailing = api.normalizeSailingState();
    state.event = {
      activeMutation: null,
      endsAt: 0,
      playSeconds: 0,
    };
    state.lastTick = Date.now();

    api.ensureCurrentRoll();
    api.render();
    api.setStatus(`Rebirth complete. All brainrots now earn ${api.formatMultiplier(api.getCashMultiplierForRebirthCount(state.rebirthCount))}.`);
    api.setRebirthStatus(`Rebirth ${state.rebirthCount} complete. Come back when you are ready for the next one.`);
  }

  function bind() {
    if (bound) {
      return;
    }

    const api = window.BrainrotCore;
    api.bindClick(api.dom.miniRebirthButton, tryRebirth);
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

window.PAGE_BOOT = function pageBootRebirth() {
  window.BrainrotModules.rebirth.boot();
};
