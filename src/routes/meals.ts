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
