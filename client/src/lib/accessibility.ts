export const a11y = {
  announceToScreenReader: (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },

  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);
    return () => element.removeEventListener("keydown", handleTabKey);
  },

  getAriaLabel: (label: string, context?: string) => {
    return context ? `${label} - ${context}` : label;
  },

  skipToContent: () => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
    }
  },
};

export const ARIA_LABELS = {
  navigation: {
    main: "Main navigation",
    user: "User menu",
    breadcrumb: "Breadcrumb navigation",
  },
  buttons: {
    close: "Close",
    menu: "Open menu",
    search: "Search",
    filter: "Filter results",
    sort: "Sort options",
  },
  forms: {
    required: "Required field",
    optional: "Optional field",
    error: "Error message",
    success: "Success message",
  },
};
