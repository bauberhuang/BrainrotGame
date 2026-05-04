/* ================================================================
   sailing.js — Sailing system: boats, islands, reward distribution
   ================================================================ */

window.Sailing = (() => {
  const D = () => window.GameData;
  const U = () => window.GameUtils;
  const S = () => window.GameState;
  const UI = () => window.GameUI;
  const G = () => window.Game;
  let bound = false;

  /* ---------- Helpers ---------- */

  function getIsland() {
    const st = S().getState();
    return D().sailingIslandById[st.sailing.selectedIslandId] || D().sailingIslands[0];
  }

  function getBoat() {
    const st = S().getState();
    return D().sailingBoatById[st.sailing.selectedBoatId] || D().sailingBoats[0];
  }

  function getCost() {
    return getBoat().cost * S().getState().sailing.amount;
  }

  function getTotalActiveSails() {
    return S().getState().sailing.jobs.reduce((t, j) => t + j.amount, 0);
  }

  function getNextReturnTime() {
    const jobs = S().getState().sailing.jobs;
    if (jobs.length === 0) return null;
    return Math.min(...jobs.map((j) => j.endsAt));
  }

  function setSailingStatus(msg) {
    const d = UI().dom;
    if (d.sailingStatusText) d.sailingStatusText.textContent = msg;
  }

  function getApproximateSuccessCount(amount, chance) {
    if (amount <= 5000) {
      let successes = 0;
      for (let i = 0; i < amount; i++) {
        if (Math.random() < chance) successes++;
      }
      return successes;
    }
    const mean = amount * chance;
    const variance = Math.sqrt(amount * chance * (1 - chance));
    const wobble = (Math.random() - 0.5) * 2 * variance;
    return Math.max(0, Math.min(amount, Math.round(mean + wobble)));
  }

  function getSailingMutationChance(mutation) {
    const st = S().getState();
    const C = D().CONST;
    if (mutation === "rainbow") {
      return C.SAILING_RAINBOW_CHANCE + (st.event.activeMutation === "rainbow" ? C.SAILING_EVENT_MUTATION_BONUS : 0);
    }
    if (mutation === "radioactive") {
      return C.SAILING_RADIOACTIVE_CHANCE + (st.event.activeMutation === "radioactive" ? C.SAILING_EVENT_MUTATION_BONUS : 0);
    }
    if (mutation === "diamond") {
      return C.SAILING_DIAMOND_CHANCE + (st.event.activeMutation === "diamond" ? C.SAILING_EVENT_MUTATION_BONUS : 0);
    }
    return 0;
  }

  function distributeSailingRewards(successCount, rewards) {
    if (successCount <= 0) return [];
    if (successCount <= 5000) {
      const counts = new Map();
      for (let i = 0; i < successCount; i++) {
        const reward = U().rollByWeight(rewards, "sailingValue");
        counts.set(reward.id, (counts.get(reward.id) || 0) + 1);
      }
      return rewards.map((r) => ({ reward: r, count: counts.get(r.id) || 0 })).filter((e) => e.count > 0);
    }
    const totalValue = rewards.reduce((t, r) => t + r.sailingValue, 0);
    let assigned = 0;
    return rewards.map((r, i) => {
      const isLast = i === rewards.length - 1;
      const count = isLast ? successCount - assigned : Math.max(0, Math.round((successCount * r.sailingValue) / totalValue));
      assigned += count;
      return { reward: r, count };
    }).filter((e) => e.count > 0);
  }

  function splitSailingRewardMutations(amount) {
    if (amount <= 0) return { normal: 0, rainbow: 0, diamond: 0, radioactive: 0 };
    const radioactiveChance = getSailingMutationChance("radioactive");
    const diamondChance = getSailingMutationChance("diamond");
    const rainbowChance = getSailingMutationChance("rainbow");
    const radioactiveCount = getApproximateSuccessCount(amount, radioactiveChance);
    const remainingAfterRadioactive = Math.max(0, amount - radioactiveCount);
    const diamondCount = getApproximateSuccessCount(remainingAfterRadioactive, diamondChance);
    const remainingAfterDiamond = Math.max(0, remainingAfterRadioactive - diamondCount);
    const rainbowCount = getApproximateSuccessCount(remainingAfterDiamond, rainbowChance);
    return {
      normal: Math.max(0, amount - radioactiveCount - diamondCount - rainbowCount),
      rainbow: rainbowCount,
      diamond: diamondCount,
      radioactive: radioactiveCount,
    };
  }

  function getInfiniteBoatBonus(amount, boat) {
    if (!boat.moneyBonusChance || !boat.moneyBonusMin || !boat.moneyBonusMax) return 0;
    const bonusTrips = getApproximateSuccessCount(amount, boat.moneyBonusChance);
    if (bonusTrips <= 0) return 0;
    return bonusTrips * (boat.moneyBonusMin + boat.moneyBonusMax) / 2;
  }

  /* ---------- Resolve finished jobs ---------- */

  function resolveFinished() {
    const st = S().getState();
    if (!st.sailing?.jobs?.length) return;

    const now = Date.now();
    const completed = st.sailing.jobs.filter((j) => j.endsAt <= now);
    if (completed.length === 0) return;

    st.sailing.jobs = st.sailing.jobs.filter((j) => j.endsAt > now);

    let totalRewarded = 0;
    let totalMoneyBonus = 0;

    for (const job of completed) {
      const island = D().sailingIslandById[job.islandId] || D().sailingIslands[0];
      const boat = D().sailingBoatById[job.boatId] || D().sailingBoats[0];
      const successCount = getApproximateSuccessCount(job.amount, boat.brainrotChance);
      const entries = distributeSailingRewards(successCount, island.rewards);

      for (const entry of entries) {
        const muts = splitSailingRewardMutations(entry.count);
        if (muts.normal > 0) G().grantOwnedCharacter(entry.reward.id, "normal", muts.normal);
        if (muts.rainbow > 0) G().grantOwnedCharacter(entry.reward.id, "rainbow", muts.rainbow);
        if (muts.diamond > 0) G().grantOwnedCharacter(entry.reward.id, "diamond", muts.diamond);
        if (muts.radioactive > 0) G().grantOwnedCharacter(entry.reward.id, "radioactive", muts.radioactive);
        totalRewarded += entry.count;
      }
      totalMoneyBonus += getInfiniteBoatBonus(job.amount, boat);
    }

    if (totalMoneyBonus > 0) st.money += totalMoneyBonus;

    setSailingStatus(
      totalMoneyBonus > 0
        ? `Sails returned with ${totalRewarded} brainrots and ${U().formatMoney(totalMoneyBonus)} bonus cash.`
        : `Sails returned with ${totalRewarded} brainrots.`,
    );
  }

  /* ---------- Render ---------- */

  function render() {
    const d = UI().dom;
    if (!d.sailingPage) return;

    const st = S().getState();
    const island = getIsland();
    const boat = getBoat();
    const canAfford = st.money >= getCost();
    const nextReturn = getNextReturnTime();

    // Options
    if (d.sailingIslandSelect) {
      d.sailingIslandSelect.innerHTML = D().sailingIslands.map((i) => `<option value="${i.id}">${i.name}</option>`).join("");
      d.sailingIslandSelect.value = island.id;
    }
    if (d.sailingBoatSelect) {
      d.sailingBoatSelect.innerHTML = D().sailingBoats.map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
      d.sailingBoatSelect.value = boat.id;
    }

    d.sailingBoatImage.src = D().CONST.SAILING_BOAT_IMAGE;
    d.sailingBoatImage.alt = boat.name;
    d.sailingIslandName.textContent = island.name;
    d.sailingChanceTag.textContent = `${Math.round(boat.brainrotChance * 100)}% Reward Rate`;
    d.sailingIslandFlavor.textContent = `${island.flavor} ${boat.flavor}`;
    d.sailingAmountInput.value = `${st.sailing.amount}`;
    d.sailingCostDisplay.textContent = U().formatMoney(getCost());
    d.sailingActiveCountDisplay.textContent = `${getTotalActiveSails()}`;
    d.sailingTimerDisplay.textContent = nextReturn ? U().formatCountdown(nextReturn - Date.now()) : "Ready";
    d.sailingConfirmButton.disabled = !canAfford;
  }

  /* ---------- Actions ---------- */

  function startSailing() {
    const st = S().getState();
    const boat = getBoat();
    const cost = getCost();

    if (st.money < cost) {
      setSailingStatus(`You need ${U().formatMoney(cost)} to launch this sail.`);
      G().fullRender();
      return;
    }

    st.money -= cost;
    st.sailing.jobs.push(S().normalizeSailingJob({
      islandId: getIsland().id,
      boatId: boat.id,
      amount: st.sailing.amount,
      endsAt: Date.now() + D().CONST.SAILING_DURATION_MS,
    }));

    setSailingStatus(`Sent ${st.sailing.amount} sail${st.sailing.amount === 1 ? "" : "s"} to ${getIsland().name}. Return time: 1 minute.`);
    G().fullRender();
  }

  function handleIslandChange() {
    S().getState().sailing.selectedIslandId = UI().dom.sailingIslandSelect.value;
    G().fullRender();
  }
  function handleBoatChange() {
    S().getState().sailing.selectedBoatId = UI().dom.sailingBoatSelect.value;
    G().fullRender();
  }
  function handleAmountInput() {
    const v = Math.max(1, Math.min(D().CONST.MAX_SAILS_PER_TRIP, Math.floor(Number(UI().dom.sailingAmountInput.value) || 1)));
    S().getState().sailing.amount = v;
    G().fullRender();
  }

  /* ---------- Bind & boot ---------- */

  function bind() {
    if (bound) return;
    const d = UI().dom;
    UI().bindClick(d.sailingConfirmButton, startSailing);
    d.sailingIslandSelect?.addEventListener("change", handleIslandChange);
    d.sailingBoatSelect?.addEventListener("change", handleBoatChange);
    d.sailingAmountInput?.addEventListener("input", handleAmountInput);
    bound = true;
  }

  function boot() {
    bind();
    render();
  }

  return { boot, render, resolveFinished, setSailingStatus };
})();
