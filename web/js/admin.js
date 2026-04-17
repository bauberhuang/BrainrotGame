window.BRAINROT_PAGE = "admin";

function bootAdminPage() {
  if (typeof applyCurrentPageView === "function") {
    applyCurrentPageView();
  }

  if (typeof renderAdminBrainrotOptions === "function") {
    renderAdminBrainrotOptions();
  }
  if (typeof renderAdminMutationOptions === "function") {
    renderAdminMutationOptions();
  }
  if (typeof renderAdminEventOptions === "function") {
    renderAdminEventOptions();
  }
  if (typeof renderAdminTools === "function") {
    renderAdminTools();
  }
}

window.PAGE_BOOT = bootAdminPage;
