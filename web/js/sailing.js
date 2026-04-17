window.BRAINROT_PAGE = "sailing";

window.PAGE_BOOT = function pageBootSailing() {
  if (typeof applyCurrentPageView === "function") {
    applyCurrentPageView();
  }

  if (typeof renderSailingPage === "function") {
    renderSailingPage();
  }
};
