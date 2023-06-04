/**
 * Encapsulates the routes
 * @param {import('fastify').FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
// eslint-disable-next-line no-unused-vars
async function route(fastify, options) {
	fastify.post("/validate", async (request, reply) => {
		reply.send({ status: "ok" });
	});
}

export default route;
