#! /usr/bin/env node
/* eslint-disable no-unused-vars */

	//todo: concurrency
	//todo: console output
	//todo: results
	//todo: error handling

import esMain from "es-main";
import * as dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";
import path from "path";
import os from "os";
dotenv.config();

import cli from "./cli/cli.js";

// eslint-disable-next-line no-unused-vars
import * as c from "./cli/colors.js";
// eslint-disable-next-line no-unused-vars
import u from "ak-tools";

/**
 * do stuff
 * @param  {import('./index.d.ts').Config} config
 */
async function main(config) {
	const TEMP_DIR = await u.mkdir("./tmp");
	global.TEMP_DIR = TEMP_DIR;

	const {
		source_path,
		source_keyfile = "",
		dest_path,
		dest_keyfile = "",
		filter = "",
		concurrency = 5,
	} = config;

	const {
		uri: source_uri,
		bucket: source_bucket,
		file: source_files_path,
	} = u.parseGCSUri(source_path);

	const {
		uri: dest_uri,
		bucket: dest_bucket,
		file: dest_files_path,
	} = u.parseGCSUri(dest_path);

	let source_storage;
	let dest_storage;
	if (source_keyfile) {
		const { project_id, private_key, client_email } = await u.load(
			path.resolve(source_keyfile),
			true
		);
		source_storage = new Storage({
			projectId: project_id,
			credentials: {
				private_key,
				client_email,
			},
			email: client_email,
		});
	} else {
		source_storage = new Storage();
	}
	if (dest_keyfile) {
		dest_storage = new Storage({ keyFile: dest_keyfile });
	} else {
		dest_storage = new Storage();
	}

	const sourceFiles = await enumerateBucketFiles(
		source_storage,
		source_bucket,
		source_files_path,
		filter
	);

	const results = [];


	for (const sourceFile of sourceFiles) {
		const file = await downloadFile(source_storage, source_bucket, sourceFile);
		const destFile = await uploadFile(dest_storage, dest_bucket, file);
		results.push(destFile);
	}

	return results;
}

/**
 * @param  {import('@google-cloud/storage').Storage} storage
 */
async function enumerateBucketFiles(storage, bucket, source_files_path = "/", filter = "") {
	const [files] = await storage
		.bucket(bucket)
		.getFiles({ prefix: source_files_path });
	let paths = files.map((f) => f.name);
	if (filter) paths = paths.filter((p) => p.includes(filter));
	return paths;
}

/**
 * @param  {import('@google-cloud/storage').Storage} storage
 */
async function downloadFile(storage, bucket, file) {
	const localPath = path.join(TEMP_DIR, path.basename(file));
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
			console.log(
				`\nuh oh! something didn't work...\nthe error message is:\n\n\t${e.message}\n\n`
			);
		})
		.finally(() => {
			console.log("\n\nhave a great day!\n\n");
			process.exit(0);
		});
}

export default main;
