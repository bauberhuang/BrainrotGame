/* ================================================================
   account.js — Sign in, sign up, settings, server save/load
   ================================================================ */

(function () {
  const D = () => window.GameData;
  const U = () => window.GameUtils;
  const S = () => window.GameState;
  const UI = () => window.GameUI;
  const G = () => window.Game;

  const LOGIN_KEY = "brainrot-logged-in-user";

  /* ---------- User session ---------- */

  function getLoggedInUser() {
    try {
      return localStorage.getItem(LOGIN_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  function setLoggedInUser(username) {
    try {
      if (username) {
        localStorage.setItem(LOGIN_KEY, username);
      } else {
        localStorage.removeItem(LOGIN_KEY);
      }
    } catch (e) { /* ignore */ }
  }

  function isLoggedIn() {
    return !!getLoggedInUser();
  }

  /* ---------- API helpers ---------- */

  async function apiPost(path, body) {
    try {
      const resp = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await resp.json();
    } catch (e) {
      return { ok: false, error: "Network error. Is the server running?" };
    }
  }

  /* ---------- Sign Up ---------- */

  async function handleSignUp() {
    const username = document.getElementById("signupUsername")?.value.trim();
    const password = document.getElementById("signupPassword")?.value.trim();
    const statusEl = document.getElementById("signupStatus");

    if (!username || !password) {
      if (statusEl) statusEl.textContent = "Please fill in all fields.";
      return;
    }

    const result = await apiPost("/api/signup", { username, password });
    if (statusEl) {
      if (result.ok) {
        statusEl.textContent = "Account created! Switch to Sign In to log in.";
        statusEl.style.color = "#138a52";
      } else {
        statusEl.textContent = result.error || "Sign up failed.";
        statusEl.style.color = "#d93a2f";
      }
    }
  }

  /* ---------- Sign In ---------- */

  async function handleSignIn() {
    const username = document.getElementById("signinUsername")?.value.trim();
    const password = document.getElementById("signinPassword")?.value.trim();
    const statusEl = document.getElementById("signinStatus");

    if (!username || !password) {
      if (statusEl) statusEl.textContent = "Please fill in all fields.";
      return;
    }

    const result = await apiPost("/api/signin", { username, password });

    if (result.ok) {
      setLoggedInUser(username);
      updateButtonLabel();

      // If server has save data, load it (normalized)
      if (result.saveData) {
        var norm = S().normalizeLoadedState(result.saveData);
        S().replaceState(norm);
        S().saveState(); // persist to localStorage too
      } else {
        // New account — push current local state to server
        S().syncStateToServer();
      }

      if (statusEl) {
        statusEl.textContent = "Signed in! Your progress syncs to the cloud.";
        statusEl.style.color = "#138a52";
      }

      // Re-render everything
      G().awardOfflineIncome();
      G().syncEventState();
      if (typeof window.Sailing !== "undefined" && window.Sailing.resolveFinished) {
        window.Sailing.resolveFinished();
      }
      G().ensureCurrentRoll();
      window._totalIncomePerSecond = G().getTotalIncomePerSecond();
      G().fullRender();

      // Refresh the account page view to show settings
      render();
    } else {
      if (statusEl) {
        statusEl.textContent = (result.error || "Sign in failed.") + " Need an account? Use Sign Up.";
        statusEl.style.color = "#d93a2f";
      }
    }
  }

  function handleSignOut() {
    setLoggedInUser(null);
    updateButtonLabel();
    G().fullRender();
    render();
    UI().setStatus("Signed out. Playing as guest.");
  }

  function updateButtonLabel() {
    const label = document.getElementById("accountButtonLabel");
    if (label) {
      label.textContent = isLoggedIn() ? "My Account" : "Sign In";
    }
  }

  /* ---------- Settings: Change Username ---------- */

  async function handleChangeUsername() {
    const username = getLoggedInUser();
    const newUsername = document.getElementById("settingsNewUsername")?.value.trim();
    const statusEl = document.getElementById("settingsUsernameStatus");

    if (!newUsername) {
      if (statusEl) statusEl.textContent = "Enter a new username.";
      return;
    }

    const result = await apiPost("/api/settings/username", { username, newUsername });
    if (statusEl) {
      if (result.ok) {
        setLoggedInUser(result.newUsername);
        statusEl.textContent = "Username updated to " + result.newUsername + ".";
        statusEl.style.color = "#138a52";
      } else {
        statusEl.textContent = result.error || "Failed to change username.";
        statusEl.style.color = "#d93a2f";
      }
    }
  }

  /* ---------- Settings: Change Password ---------- */

  async function handleChangePassword() {
    const username = getLoggedInUser();
    const oldPassword = document.getElementById("settingsOldPassword")?.value.trim();
    const newPassword = document.getElementById("settingsNewPassword")?.value.trim();
    const statusEl = document.getElementById("settingsPasswordStatus");

    if (!oldPassword || !newPassword) {
      if (statusEl) statusEl.textContent = "Please fill in all fields.";
      return;
    }

    const result = await apiPost("/api/settings/password", { username, oldPassword, newPassword });
    if (statusEl) {
      if (result.ok) {
        statusEl.textContent = result.message || "Password changed.";
        statusEl.style.color = "#138a52";
      } else {
        statusEl.textContent = result.error || "Failed to change password.";
        statusEl.style.color = "#d93a2f";
      }
    }
  }

  /* ---------- Server save (called every 30s for logged-in users) ---------- */

  function saveToServer() {
    const username = getLoggedInUser();
    if (!username) return;
    const state = S().getState();
    apiPost("/api/save", { username, saveData: state });
  }

  /* ---------- Render ---------- */

  var bound = false;

  function render() {
    const loggedIn = isLoggedIn();
    const username = getLoggedInUser();

    // Show/hide sub-views
    const signinView = document.getElementById("accountSigninView");
    const signupView = document.getElementById("accountSignupView");
    const settingsView = document.getElementById("accountSettingsView");

    if (loggedIn) {
      if (signinView) signinView.classList.add("hidden");
      if (signupView) signupView.classList.add("hidden");
      if (settingsView) {
        settingsView.classList.remove("hidden");
        const userDisplay = document.getElementById("settingsUsernameDisplay");
        if (userDisplay) userDisplay.textContent = username;
      }
    } else {
      if (signinView) signinView.classList.remove("hidden");
      if (signupView) signupView.classList.remove("hidden");
      if (settingsView) settingsView.classList.add("hidden");
    }
  }

  function bind() {
    if (bound) return;

    UI().bindClick(document.getElementById("signupSubmitButton"), handleSignUp);
    UI().bindClick(document.getElementById("signinSubmitButton"), handleSignIn);
    UI().bindClick(document.getElementById("signOutButton"), handleSignOut);
    UI().bindClick(document.getElementById("settingsChangeUsernameButton"), handleChangeUsername);
    UI().bindClick(document.getElementById("settingsChangePasswordButton"), handleChangePassword);

    bound = true;
  }

  function boot() {
    bind();
    render();
  }

  /* ---------- Expose on window ---------- */

  window.Account = {
    boot,
    render,
    getLoggedInUser,
    isLoggedIn,
    saveToServer,
    handleSignOut,
  };
})();
