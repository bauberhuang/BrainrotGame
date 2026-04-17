window.BRAINROT_PAGE = "accountmanagement";
window.BrainrotModules = window.BrainrotModules || {};

window.BrainrotModules.accountmanagement = (() => {
  let bound = false;

  function normalizeInviteCode(code) {
    return String(code || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .match(/.{1,4}/g)
      ?.slice(0, 5)
      .join("-") || "";
  }

  function findAccountByInviteCode(code) {
    const api = window.BrainrotCore;
    return Object.values(api.getInviteSystem().accounts).find((account) => account.inviteCodes.includes(code)) || null;
  }

  function createInvitedAccount(ownerAccount, usedCode) {
    const api = window.BrainrotCore;
    const inviteSystem = api.getInviteSystem();
    const nextIndex = Object.keys(inviteSystem.accounts).length + 1;
    const newAccount = api.createAccountRecord(nextIndex);

    newAccount.password = usedCode;
    while (api.isAccountNameTaken(newAccount.name)) {
      newAccount.name = `${newAccount.name}X`;
    }

    api.ensureAccountHasFourCodes(newAccount);
    inviteSystem.accounts[newAccount.id] = newAccount;
    inviteSystem.usedCodes[usedCode] = newAccount.id;

    if (ownerAccount) {
      ownerAccount.inviteCodes = ownerAccount.inviteCodes.filter((code) => code !== usedCode);
      api.ensureAccountHasFourCodes(ownerAccount);
    }

    api.saveInviteSystem();
    return newAccount;
  }

  function switchToAccount(accountId) {
    const api = window.BrainrotCore;
    const inviteSystem = api.getInviteSystem();
    if (!inviteSystem.accounts[accountId]) {
      return;
    }

    api.setActiveAccountId(accountId);
    api.saveActiveAccountId(accountId);
    api.rememberAccount(accountId);
    api.replaceState(api.loadState());
    api.setAutoRollRemaining(api.constants.AUTO_ROLL_SECONDS);
    api.setSelectedOwnedCharacterId(null);
    api.setAdminAuthorized(api.loadAdminAuthorization());
    api.ensureCurrentRoll();
    api.render();
  }

  function openInviteRename() {
    const api = window.BrainrotCore;
    const account = api.getActiveAccount();
    const { dom } = api;
    if (!account || !dom.inviteRenameRow || !dom.inviteNameInput) {
      return;
    }

    dom.inviteRenameRow.classList.remove("hidden");
    dom.inviteSaveButton?.classList.remove("hidden");
    dom.inviteNameInput.value = account.name;
    dom.inviteNameInput.focus();
    dom.inviteNameInput.select();
  }

  function saveInviteName() {
    const api = window.BrainrotCore;
    const account = api.getActiveAccount();
    const { dom } = api;
    if (!account || !dom.inviteNameInput) {
      return;
    }

    const nextName = dom.inviteNameInput.value.trim().slice(0, 24);
    if (!nextName) {
      dom.inviteAuthText.textContent = "Enter a user name first.";
      return;
    }

    if (api.isAccountNameTaken(nextName, account.id)) {
      dom.inviteAuthText.textContent = "That user name is already used by another account.";
      return;
    }

    account.name = nextName;
    api.saveInviteSystem();
    dom.inviteRenameRow?.classList.add("hidden");
    dom.inviteSaveButton?.classList.add("hidden");
    render();
    api.setStatus(`User renamed to ${nextName}.`);
  }

  function switchToRememberedAccount() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.rememberedAccountSelect) {
      return;
    }

    const rememberedId = dom.rememberedAccountSelect.value;
    if (!rememberedId || !api.getInviteSystem().accounts[rememberedId]) {
      dom.inviteAuthText.textContent = "Pick a remembered account first.";
      return;
    }

    switchToAccount(rememberedId);
    api.setStatus(`Switched to ${api.getInviteSystem().accounts[rememberedId].name}.`);
  }

  function loginRememberedAccount() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.loginUserInput || !dom.loginPasswordInput) {
      return;
    }

    const userName = dom.loginUserInput.value.trim();
    const password = dom.loginPasswordInput.value.trim();
    const account = api.findRememberedAccountByName(userName);

    if (!account) {
      dom.inviteAuthText.textContent = "User not found in remembered accounts.";
      return;
    }

    if (!password) {
      dom.inviteAuthText.textContent = "Enter the account password first.";
      return;
    }

    if (account.password !== password) {
      dom.inviteAuthText.textContent = "Wrong password for that account.";
      return;
    }

    dom.loginUserInput.value = "";
    dom.loginPasswordInput.value = "";
    switchToAccount(account.id);
    api.setStatus(`Logged into ${account.name}.`);
  }

  function changeAccountPassword() {
    const api = window.BrainrotCore;
    const account = api.getActiveAccount();
    const { dom } = api;
    if (!account || !dom.changePasswordInput) {
      return;
    }

    const nextPassword = dom.changePasswordInput.value.trim().slice(0, 24);
    if (!nextPassword) {
      dom.inviteAuthText.textContent = "Enter a new password first.";
      return;
    }

    account.password = nextPassword;
    dom.changePasswordInput.value = "";
    api.saveInviteSystem();
    render();
    api.setStatus(`Password changed for ${account.name}.`);
  }

  function useInviteCode() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.inviteCodeInput) {
      return;
    }

    const normalizedCode = normalizeInviteCode(dom.inviteCodeInput.value);
    if (!normalizedCode) {
      dom.inviteAuthText.textContent = "Enter a real invite code first.";
      return;
    }

    if (api.getInviteSystem().usedCodes[normalizedCode]) {
      dom.inviteAuthText.textContent = "That invite code was already used.";
      return;
    }

    const ownerAccount = findAccountByInviteCode(normalizedCode);
    if (!ownerAccount) {
      dom.inviteAuthText.textContent = "That code does not exist in this game yet.";
      return;
    }

    const newAccount = createInvitedAccount(ownerAccount, normalizedCode);
    dom.inviteCodeInput.value = "";
    switchToAccount(newAccount.id);
    api.setStatus(`${newAccount.name} joined with invite code ${normalizedCode}.`);
  }

  function signOutInviteAccount() {
    const api = window.BrainrotCore;
    api.setActiveAccountId("");
    api.saveActiveAccountId("");
    api.replaceState(api.createDefaultState());
    api.setAutoRollRemaining(api.constants.AUTO_ROLL_SECONDS);
    api.setSelectedOwnedCharacterId(null);
    api.setAdminAuthorized(false);
    api.saveAdminAuthorization(false);
    api.ensureCurrentRoll();
    api.render();
  }

  function render() {
    const api = window.BrainrotCore;
    const { dom } = api;
    if (!dom.inviteAuthText || !dom.inviteCodeSubmitButton || !dom.inviteCodesList) {
      return;
    }

    const account = api.getActiveAccount();
    const rememberedAccounts = api.getRememberedAccounts();

    if (dom.rememberedAccountSelect) {
      dom.rememberedAccountSelect.innerHTML = rememberedAccounts
        .map((rememberedAccount) => `<option value="${rememberedAccount.id}">${rememberedAccount.name}</option>`)
        .join("");
      dom.rememberedAccountSelect.classList.toggle("hidden", rememberedAccounts.length === 0);
    }
    dom.rememberedAccountSwitchButton?.classList.toggle("hidden", rememberedAccounts.length === 0);

    if (!account) {
      dom.inviteAuthUser?.classList.add("hidden");
      dom.inviteSignOutButton?.classList.add("hidden");
      dom.inviteEditButton?.classList.add("hidden");
      dom.inviteSaveButton?.classList.add("hidden");
      dom.inviteRenameRow?.classList.add("hidden");
      dom.changePasswordInput?.classList.add("hidden");
      dom.changePasswordButton?.classList.add("hidden");
      dom.rememberedAccountSelect?.classList.add("hidden");
      dom.rememberedAccountSwitchButton?.classList.add("hidden");
      dom.loginUserInput?.classList.toggle("hidden", rememberedAccounts.length === 0);
      dom.loginPasswordInput?.classList.toggle("hidden", rememberedAccounts.length === 0);
      dom.loginPasswordButton?.classList.toggle("hidden", rememberedAccounts.length === 0);
      dom.inviteCodeInput?.classList.remove("hidden");
      dom.inviteCodeSubmitButton.classList.remove("hidden");

      const starterCode = api.getStarterInviteCode();
      dom.inviteAuthText.textContent = starterCode
        ? `Guest mode does not save. Log in with a password, or use starter invite code ${starterCode} to create a new save account.`
        : "Guest mode does not save. Log in with a password or use an unused invite code to open another account.";
      dom.inviteCodesList.innerHTML = starterCode
        ? `<span class="invite-code-chip">${starterCode}</span>`
        : "";
      return;
    }

    dom.inviteAuthUser?.classList.remove("hidden");
    dom.inviteSignOutButton?.classList.remove("hidden");
    dom.inviteEditButton?.classList.remove("hidden");
    dom.changePasswordInput?.classList.remove("hidden");
    dom.changePasswordButton?.classList.remove("hidden");
    dom.inviteCodeInput?.classList.add("hidden");
    dom.inviteCodeSubmitButton.classList.add("hidden");
    dom.loginUserInput?.classList.add("hidden");
    dom.loginPasswordInput?.classList.add("hidden");
    dom.loginPasswordButton?.classList.add("hidden");

    if (dom.rememberedAccountSelect) {
      dom.rememberedAccountSelect.value = account.id;
    }
    dom.inviteAccountName.textContent = account.name;
    dom.inviteAccountMeta.textContent = `${account.inviteCodes.length} active invite codes and save enabled`;
    dom.inviteAuthText.textContent = "This account saves your money and brainrots after refresh. You can also change its password here.";
    dom.inviteCodesList.innerHTML = account.inviteCodes
      .map((code) => `<span class="invite-code-chip">${code}</span>`)
      .join("");
    if (dom.inviteRenameRow?.classList.contains("hidden")) {
      dom.inviteSaveButton?.classList.add("hidden");
    }
  }

  function bind() {
    if (bound) {
      return;
    }

    const api = window.BrainrotCore;
    const { dom } = api;

    api.bindClick(dom.inviteCodeSubmitButton, useInviteCode);
    api.bindClick(dom.inviteEditButton, openInviteRename);
    api.bindClick(dom.inviteSaveButton, saveInviteName);
    api.bindClick(dom.rememberedAccountSwitchButton, switchToRememberedAccount);
    api.bindClick(dom.loginPasswordButton, loginRememberedAccount);
    api.bindClick(dom.changePasswordButton, changeAccountPassword);
    api.bindClick(dom.inviteSignOutButton, signOutInviteAccount);

    if (dom.inviteCodeInput) {
      dom.inviteCodeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          useInviteCode();
        }
      });
    }
    if (dom.inviteNameInput) {
      dom.inviteNameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveInviteName();
        }
      });
    }
    if (dom.loginPasswordInput) {
      dom.loginPasswordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          loginRememberedAccount();
        }
      });
    }
    if (dom.loginUserInput) {
      dom.loginUserInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          loginRememberedAccount();
        }
      });
    }
    if (dom.changePasswordInput) {
      dom.changePasswordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          changeAccountPassword();
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

window.PAGE_BOOT = function pageBootAccountManagement() {
  window.BrainrotModules.accountmanagement.boot();
};
