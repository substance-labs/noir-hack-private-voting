import "dotenv/config.js"
import Fastify from "fastify"

import routes from "./routes"

const fastify = Fastify({
  logger: true,
  requestTimeout: 30000,
  exposeHeadRoutes: true,
})

const isDevMode = process.env.NODE_ENV !== "production"
const port = parseInt(process.env.PORT as string) || 3000

fastify.route({
  method: "OPTIONS",
  url: "/*",
  handler: async (request, reply) => {
    var reqAllowedHeaders = request.headers["access-control-request-headers"]
    if (reqAllowedHeaders !== undefined) {
      reply.header("Access-Control-Allow-Headers", reqAllowedHeaders)
    }
    if (isDevMode) {
      reply
        .code(204)
        .header("Content-Length", "0")
        .header("Access-Control-Allow-Origin", "http://localhost:5173")
        .header("Access-Control-Allow-Credentials", true)
        .header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
        .send()
    } else {
      reply.code(204).send()
    }
  },
})

if (isDevMode) {
  fastify.addHook("onRequest", function (request, reply, next) {
    reply.header("Access-Control-Allow-Origin", "http://localhost:5173")
    reply.header("Access-Control-Allow-Credentials", true)
    next()
  })
}

fastify.register(routes, { prefix: "/" })

fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err)
  }
  fastify.log.info(`Fastify is listening on port: ${address}`)
})
