/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ForkConfig } from "../config/schema";

export class Logger {
	constructor(private config: Pick<ForkConfig, "silent" | "debug">) {
		this.log = this.log.bind(this);
		this.warn = this.warn.bind(this);
		this.error = this.error.bind(this);
		this.debug = this.debug.bind(this);
	}

	public log(message?: any, ...optionalParams: any[]) {
		if (!this.config.silent) {
			console.log(message, optionalParams);
		}
	}

	public warn(message?: any, ...optionalParams: any[]) {
		if (!this.config.silent) {
			console.warn(message, optionalParams);
		}
	}

	public error(message?: any, ...optionalParams: any[]) {
		if (!this.config.silent) {
			console.error(message, optionalParams);
		}
	}

	public debug(message?: any, ...optionalParams: any[]) {
		if (this.config.debug && !this.config.silent) {
			console.debug(message, optionalParams);
		}
	}
}
