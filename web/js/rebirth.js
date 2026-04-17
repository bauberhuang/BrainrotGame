window.BRAINROT_PAGE = "rebirth";

window.PAGE_BOOT = function pageBootRebirth() {
  if (typeof applyCurrentPageView === "function") {
    applyCurrentPageView();
  }

  if (typeof renderRebirthPage === "function") {
    renderRebirthPage();
  }
};
