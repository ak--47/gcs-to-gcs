#! /usr/bin/env node

//todo: results
//todo: error handling + auth check

import esMain from "es-main";
import * as dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";
import path from "path";
import pLimit from 'p-limit';
dotenv.config();
import cli from "./cli/cli.js";
import * as c from "./cli/colors.js";
import u from "ak-tools";

/**
 * move files from one bucket to another
 * @param  {import('./index.d.ts').Config} config
 */
async function main(config) {
	const TEMP_DIR = await u.mkdir(path.resolve(`./tmp`));
	process.env.TEMP_DIR = TEMP_DIR;
	const time = u.time('job');
	time.start();

	const { source_path, source_keyfile = "", dest_path, dest_keyfile = "", filter = "", concurrency = 10, verbose = true } = config;
	const { bucket: source_bucket, file: source_files_path } = u.parseGCSUri(source_path);
	const { bucket: dest_bucket } = u.parseGCSUri(dest_path);

	let source_storage;
	let dest_storage;
	if (source_keyfile) {
		// dest_storage = new Storage({ keyFile: dest_keyfile });
		const source_creds = await getServiceAccountParams(source_keyfile);
		source_storage = new Storage(source_creds);
	} else {
		source_storage = new Storage();
	}
	if (dest_keyfile) {
		// dest_storage = new Storage({ keyFile: dest_keyfile });
		const dest_creds = await getServiceAccountParams(dest_keyfile);
		dest_storage = new Storage(dest_creds);
	} else {
		dest_storage = new Storage();
	}

	if (verbose) console.log(`\nSTART!\n`.green);
	if (verbose) console.log(`enumerating files in gs://${source_bucket}...`.yellow);

	const sourceFiles = await enumerateBucketFiles(source_storage, source_bucket, source_files_path, filter);

	if (verbose) console.log(`...found ${u.comma(sourceFiles.length)} files matching ${source_files_path}${filter ? `/*${filter}` : ""}\n`.cyan);
	if (verbose) console.log(`\nTRANSFERRING ${u.comma(sourceFiles.length)} FILES FROM\n`.green + `gcs://${source_bucket}`.yellow + `  TO  `.green + `gcs://${dest_bucket}`.cyan + `\n\n`)
	
	
	const limit = pLimit(concurrency);
	let counter = 0;
	const jobs = sourceFiles.map((sourceFile) => {
		return limit(async () => {
			const file = await downloadFile(source_storage, source_bucket, sourceFile);
			const destFile = await uploadFile(dest_storage, dest_bucket, file);
			counter++;
			if (verbose) u.progress("files", counter);
			return destFile;
		});
	});

	const uploads = await Promise.all(jobs);
	time.stop(false);
	const results = { uploads, time: time.report(false), config };
	if (verbose) console.log(`\n\nDONE!\n\tjob took ${ results.time.human }`.green)
	return results;
}

async function getServiceAccountParams(keyFile) {
	const { project_id, private_key, client_email } = await u.load(path.resolve(keyFile), true);
	return {
		projectId: project_id,
		credentials: {
			private_key,
			client_email,
		}
	};
}

/**
 * @param  {import('@google-cloud/storage').Storage} storage
 */
async function enumerateBucketFiles(storage, bucket, source_files_path = "/", filter = "") {
	const [files] = await storage.bucket(bucket).getFiles({ prefix: source_files_path });
	let paths = files.map((f) => f.name);
	if (filter) paths = paths.filter((p) => p.includes(filter));
	return paths;
}

/**
 * @param  {import('@google-cloud/storage').Storage} storage
 */
async function downloadFile(storage, bucket, file) {
	// @ts-ignore
	const localPath = path.join(process.env.TEMP_DIR, path.basename(file));
	await storage.bucket(bucket).file(file).download({ destination: localPath });
	return {
		localPath,
		cloudPath: file,
	};
}

/**
 * @param  {import('@google-cloud/storage').Storage} storage
 */
async function uploadFile(storage, bucket, file) {
	const { localPath, cloudPath } = file;
	await storage.bucket(bucket).upload(localPath, { destination: cloudPath });
	await u.rm(localPath);
	return cloudPath;
}

if (esMain(import.meta)) {
	const params = cli();

	main(params)
		.then((results) => {
			//noop
		})
		.catch((e) => {
			console.log(`\nuh oh! something didn't work...\nthe error message is:\n\n\t${e.message}\n\n`);
		})
		.finally(() => {
	console.log("\n\nhave a great day!\n\n");
	process.exit(0);
});
}

export default main;
