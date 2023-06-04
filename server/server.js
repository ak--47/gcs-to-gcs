import Fastify from "fastify";
import { fastifyStatic } from "@fastify/static";
import path from "path";

// ROUTES
import validate from "./routes/validate.js";

const app = Fastify({
	logger: {
		enabled: true,
		level: "info",
		timestamp: false,
	},
});

// STATIC ASSETS
app.register(fastifyStatic, { root: path.resolve("./html") });

// API ROUTES
app.register(validate);

/**
 * Run the server!
 */
async function start() {
	try {
		console.log("APP ALIVE!");
		await app.listen({ port: 3000 });
	} catch (err) {
		console.log(`CRASH!\n\n${err.toString()}`);
		app.log.error(err);
		process.exit(1);
	}
}

export default start;
