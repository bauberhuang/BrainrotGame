window.BRAINROT_PAGE = "accountmanagement";

window.PAGE_BOOT = function pageBootAccountManagement() {
  if (typeof applyCurrentPageView === "function") {
    applyCurrentPageView();
  }

  if (typeof renderInviteAuth === "function") {
    renderInviteAuth();
  }
};
