window.BRAINROT_PAGE = "home";

window.PAGE_BOOT = function pageBootHome() {
  if (typeof applyCurrentPageView === "function") {
    applyCurrentPageView();
  }
};
