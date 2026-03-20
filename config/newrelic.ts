export function initializeNewRelic() {
  if (process.env.NEW_RELIC_ENABLED !== "true" || !process.env.NEW_RELIC_LICENSE_KEY) {
    return;
  }

  try {
    require("newrelic");
    console.log("New Relic APM initialized");
  } catch (error) {
    console.error("Failed to initialize New Relic:", error);
  }
}
