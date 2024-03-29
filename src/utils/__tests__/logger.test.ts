import { Logger } from "../logger";

describe("logger", () => {
	const logSpy = vi.spyOn(global.console, "log").mockImplementation(() => undefined);
	const warnSpy = vi.spyOn(global.console, "warn").mockImplementation(() => undefined);
	const errorSpy = vi.spyOn(global.console, "error").mockImplementation(() => undefined);
	const debugSpy = vi.spyOn(global.console, "debug").mockImplementation(() => undefined);

	afterEach(() => {
		logSpy.mockRestore();
		warnSpy.mockRestore();
		errorSpy.mockRestore();
		debugSpy.mockRestore();
	});

	it("should log a message", () => {
		const logger = new Logger({ silent: false });

		logger.log("log test");
		logger.warn("warn test");
		logger.error("error test");
		logger.debug("debug test");

		expect(logSpy).toHaveBeenCalledWith("log test", []);
		expect(warnSpy).toHaveBeenCalledWith("warn test", []);
		expect(errorSpy).toHaveBeenCalledWith("error test", []);
		expect(debugSpy).toHaveBeenCalledWith("debug test", []);
	});

	it("should not log if silent is true", () => {
		const logger = new Logger({ silent: true });

		logger.log("log test");
		logger.warn("warn test");
		logger.error("error test");
		logger.debug("debug test");

		expect(logSpy).not.toHaveBeenCalled();
		expect(warnSpy).not.toHaveBeenCalled();
		expect(errorSpy).not.toHaveBeenCalled();
		expect(debugSpy).not.toHaveBeenCalled();
	});
});
