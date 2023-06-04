#! /usr/bin/env node

import esMain from "es-main";
import * as dotenv from "dotenv";
dotenv.config();

import cli from "./cli/cli.js";
import server from "./server/server.js";

// eslint-disable-next-line no-unused-vars
import * as c from "./cli/colors.js";
// eslint-disable-next-line no-unused-vars
import u from "ak-tools";

//todo
// $ npm scripts
// $ launch.json
// $ tasks.json

/**
 * do stuff
 * @param  {import('./index.d.ts').Config} config
 */
async function main(config) {
	console.log(config);
	return config;
}

export default main;

if (esMain(import.meta)) {
	if (process.argv.length == 2) {
		//no yargs... boot up UI
		server();
	} else {
		const params = cli();

		main(params)
			.then(() => {
				//noop
			})
			.catch((e) => {
				console.log(
					`\nuh oh! something didn't work...\nthe error message is:\n\n\t${e.message}\n\n`
				);
			})
			.finally(() => {
				console.log("\n\nhave a great day!\n\n");
				process.exit(0);
			});
	}
}
