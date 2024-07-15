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

  app.withTypeProvider<ZodTypeProvider>().get('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    },
  }, async (request, reply) => {
    const { id } = request.params

    const meal = await knex('meals')
      .select('id', 'name', 'description', 'date', 'is_on_diet')
      .where('id', id)
      .first()
    
    return reply.code(200).send({meal})
  })

  app.withTypeProvider<ZodTypeProvider>().put('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().min(4).optional(),
        description: z.string().min(6).optional(),
        date: z.coerce.number().int().optional(),
        is_on_diet: z.boolean().optional(),
      })
    },
    preHandler: [checkSessionId]
  }, async (request, reply) => {
    const { name, description, date, is_on_diet } = request.body
    const { id } = request.params

    const meal = await knex('meals').update({
      name,
      description,
      date,
      is_on_diet
    }).where('id', id).andWhere('user_id', request.user.id)

    if (!meal) {
      return reply.code(404).send("Meal not found")
    }

    reply.code(204).send()
  })
}