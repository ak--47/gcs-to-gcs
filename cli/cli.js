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
npx  --yes  ${NAME} --source_keyfile myCreds.json --dest_keyfile myCreds.json --source_path gs://my-bucket/my-folder --dest_path gs://my-other-bucket --concurrency 5 --filter .json.gz

DOCS: https://github.com/ak--47/`
		)
		.option("source_keyfile", {
			demandOption: false,
			describe: "the service account for the source bucket",
			type: "string",
			default: "",
		})
		.option("dest_keyfile", {
			demandOption: false,
			describe: "the service account for the destination bucket",
			type: "string",
			default: "",
		})
		.option("source_path", {
			demandOption: true,
			describe: "the gcs:// path to the source files",
			type: "string",

		})
		.option("dest_path", {
			demandOption: true,
			describe: "the gcs:// bucket to put the files in",
			type: "boolean",
		})
		.option("concurrency", {
			demandOption: false,
			describe: "number of concurrent downloads + uploads",
			type: "number",
			default: 5,
		})
		.option("filter", {
			demandOption: false,
			describe: "a string to filter the files by",
			type: "string",
			default: "",
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
