import yargs from "yargs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { name: NAME, version: VERSION } = require("../package.json");

/**
 * @typedef {import('../index.d.ts').Config} Config
 */

/**
 * the CLI for putting the config in the command line
 * @return {Config}
 */
function cli() {
	const args = yargs(process.argv.splice(2))
		.scriptName(NAME)
		.usage(
			`${welcome}\n\nusage:\nnpx ${NAME} --yes [file or folder] [options]

examples:
npx  --yes  ${NAME} 
npx  --yes  ${NAME} 

DOCS: https://github.com/ak--47/`
		)
		.option("foo", {
			demandOption: true,
			describe: "baz",
			type: "string",
			default: "foo",
		})
		.option("bar", {
			demandOption: true,
			describe: "baz",
			type: "number",
			default: 42,
		})
		.option("baz", {
			demandOption: true,
			describe: "baz",
			type: "boolean",
			default: false,
		})

		.help().argv;

	// @ts-ignore
	return args;
}

export default cli;

const hero = String.raw`
COOL!
`;

const banner = `... tagline! (v${VERSION})
\tby AK (ak@mixpanel.com)\n\n`;

const welcome = hero.concat("\n").concat(banner);
