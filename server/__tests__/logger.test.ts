import { logger } from "../logger";
import fs from "fs";
import path from "path";

describe("Logger Service", () => {
  const logDir = path.join(process.cwd(), "logs");
  const errorLogPath = path.join(logDir, "error.log");
  const combinedLogPath = path.join(logDir, "combined.log");

  beforeAll(() => {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(errorLogPath)) {
      fs.writeFileSync(errorLogPath, "");
    }
    if (fs.existsSync(combinedLogPath)) {
      fs.writeFileSync(combinedLogPath, "");
    }
  });

  describe("info logging", () => {
    it("should log info messages", () => {
      expect(() => {
        logger.info("Test info message");
      }).not.toThrow();
    });

    it("should log info messages with metadata", () => {
      expect(() => {
        logger.info("Test info message", { userId: 1, action: "test" });
      }).not.toThrow();
    });

    it("should write info messages to combined log", (done) => {
      const message = "Test info message for file";
      logger.info(message);

      setTimeout(() => {
        if (fs.existsSync(combinedLogPath)) {
          const content = fs.readFileSync(combinedLogPath, "utf-8");
          expect(content).toContain(message);
        }
        done();
      }, 100);
    });
  });

  describe("error logging", () => {
    it("should log error messages", () => {
      expect(() => {
        logger.error("Test error message");
      }).not.toThrow();
    });

    it("should log error messages with metadata", () => {
      expect(() => {
        logger.error("Test error message", { userId: 1, error: "test error" });
      }).not.toThrow();
    });

    it("should write error messages to error log", (done) => {
      const message = "Test error message for file";
      logger.error(message);

      setTimeout(() => {
        if (fs.existsSync(errorLogPath)) {
          const content = fs.readFileSync(errorLogPath, "utf-8");
          expect(content).toContain(message);
        }
        done();
      }, 100);
    });

    it("should log Error objects", () => {
      const error = new Error("Test error object");
      expect(() => {
        logger.error("Error occurred", { error: error.message, stack: error.stack });
      }).not.toThrow();
    });
  });

  describe("warn logging", () => {
    it("should log warning messages", () => {
      expect(() => {
        logger.warn("Test warning message");
      }).not.toThrow();
    });

    it("should log warning messages with metadata", () => {
      expect(() => {
        logger.warn("Test warning message", { userId: 1, reason: "test" });
      }).not.toThrow();
    });
  });

  describe("debug logging", () => {
    it("should log debug messages", () => {
      expect(() => {
        logger.debug("Test debug message");
      }).not.toThrow();
    });

    it("should log debug messages with metadata", () => {
      expect(() => {
        logger.debug("Test debug message", { data: { test: true } });
      }).not.toThrow();
    });
  });

  describe("structured logging", () => {
    it("should handle complex metadata objects", () => {
      const metadata = {
        userId: 1,
        action: "test",
        data: {
          nested: {
            value: 123,
            array: [1, 2, 3],
          },
        },
      };

      expect(() => {
        logger.info("Complex metadata test", metadata);
      }).not.toThrow();
    });

    it("should handle null metadata", () => {
      expect(() => {
        logger.info("Null metadata test", null as any);
      }).not.toThrow();
    });

    it("should handle undefined metadata", () => {
      expect(() => {
        logger.info("Undefined metadata test", undefined);
      }).not.toThrow();
    });
  });

  describe("log levels", () => {
    it("should support all log levels", () => {
      expect(() => {
        logger.error("Error level");
        logger.warn("Warn level");
        logger.info("Info level");
        logger.debug("Debug level");
      }).not.toThrow();
    });
  });

  describe("performance", () => {
    it("should handle rapid logging", () => {
      expect(() => {
        for (let i = 0; i < 100; i++) {
          logger.info(`Rapid log ${i}`);
        }
      }).not.toThrow();
    });

    it("should handle concurrent logging", async () => {
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(Promise.resolve().then(() => logger.info(`Concurrent log ${i}`)));
      }

      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });
});
