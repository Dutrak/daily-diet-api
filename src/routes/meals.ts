import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { checkSessionId } from "../middlewares/check-session-id";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";

const MealBodySchema = z.object({
  name: z.string().min(4),
  description: z.string().min(6),
  date: z.coerce.number().int(),
  is_on_diet: z.boolean()
})

export async function MealsRoutes(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().post("/", {
    preHandler: [checkSessionId],
    schema: { body: MealBodySchema }
  }, async (request, reply) => {
    const { name, description, date, is_on_diet } = request.body

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date,
      is_on_diet,
      user_id: request.user.id
    })

    reply.code(201).send()

  })

  app.withTypeProvider<ZodTypeProvider>().get("/", {
    preHandler: [checkSessionId]
  }, async (request, reply) => {

    const meals = await knex('meals')
      .select('id', 'name', 'description', 'date', 'is_on_diet')
      .where('user_id', request.user.id)

    return reply.code(200).send({ meals })
  })
