import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { knex } from "../database";

const UserBodySchema = z.object({
  name: z.string().min(4),
  email: z.string().email()
})

export async function UsersRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/", {
    schema: { body: UserBodySchema  }
  }, async (request, reply) => { 
    const { name, email } = request.body
    const sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId
    })

    reply.code(201).send()
  })

  app.get("/", async (_, reply) => { 
    const user = await knex('users').select().first()
    reply.code(200).send({user})
  })
}