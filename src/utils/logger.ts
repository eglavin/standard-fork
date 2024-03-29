/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ForkConfig } from "../configuration/schema";

export class Logger {
	constructor(private config: Pick<ForkConfig, "silent">) {
		this.log = this.log.bind(this);
		this.warn = this.warn.bind(this);
		this.error = this.error.bind(this);
		this.debug = this.debug.bind(this);
	}

	log(message?: any, ...optionalParams: any[]) {
		if (!this.config.silent) {
			console.log(message, optionalParams);
		}
	}

	warn(message?: any, ...optionalParams: any[]) {
		if (!this.config.silent) {
			console.warn(message, optionalParams);
		}
	}

	error(message?: any, ...optionalParams: any[]) {
		if (!this.config.silent) {
			console.error(message, optionalParams);
		}
	}

	debug(message?: any, ...optionalParams: any[]) {
		if (!this.config.silent) {
			console.debug(message, optionalParams);
		}
	}
}
