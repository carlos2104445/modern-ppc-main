import tracer from "dd-trace";

export function initializeDataDog() {
  if (process.env.DD_ENABLED !== "true") {
    return;
  }

  tracer.init({
    service: process.env.DD_SERVICE || "modern-ppc",
    env: process.env.DD_ENV || process.env.NODE_ENV || "development",
    version: process.env.DD_VERSION || "1.0.0",
    logInjection: true,
    runtimeMetrics: true,
    profiling: true,
    appsec: true,
    tags: {
      team: "engineering",
      application: "modern-ppc",
    },
  });

  console.log("DataDog APM initialized");
}

export { tracer };
