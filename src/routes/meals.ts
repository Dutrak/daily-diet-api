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

  app.get("/", {
    preHandler: [checkSessionId]
  }, async (request, reply) => {

    const meals = await knex('meals')
      .select('id', 'name', 'description', 'date', 'is_on_diet')
      .where('user_id', request.user.id)
      .orderBy('date', 'desc')
      .orderBy('created_at')

    return reply.code(200).send({ meals })
  })

  app.withTypeProvider<ZodTypeProvider>().get('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    },
    preHandler: [checkSessionId]
  }, async (request, reply) => {
    const { id } = request.params

    const meal = await knex('meals')
      .select('id', 'name', 'description', 'date', 'is_on_diet')
      .where('id', id)
      .andWhere('user_id', request.user.id)
      .first()
    
    if (!meal) {
      return reply.code(404).send("Meal not found")
    }
    
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

  app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
    },
    preHandler: [checkSessionId]
  }, async (request, reply) => {
    const { id } = request.params

    const meal = await knex('meals')
      .delete()
      .where('id', id)
      .andWhere('user_id', request.user.id)
    
    if (!meal) {
      return reply.code(404).send("Meal not found")
    }

    reply.code(204).send()
  })

  app.get("/summary", {
    preHandler: [checkSessionId]
  }, async (request, reply) => {

    const meals = await knex('meals')
      .select()
      .where('user_id', request.user.id)
      .orderBy('date')
      .orderBy('created_at')
    
    const totalMeals = meals.length

    const totalMealsOnDiet = meals.filter((meal) => {
      return meal.is_on_diet
    }).length

    const totalMealsNotOnDiet = meals.filter((meal) => {
      return meal.is_on_diet == false
    }).length

    const totalMealsOnDietSequence = {
      currentSequence: 0,
      bestSequence: 0
    }
    
    meals.forEach((meal, index) => {
      if (meal.is_on_diet) {
        totalMealsOnDietSequence.currentSequence += 1
      }

      if (!meal.is_on_diet) {
        totalMealsOnDietSequence.bestSequence = totalMealsOnDietSequence.currentSequence
        totalMealsOnDietSequence.currentSequence = 0
      }

      if (index === meals.length - 1) {
        totalMealsOnDietSequence.bestSequence = totalMealsOnDietSequence.currentSequence
      }
    })

    return reply.code(200).send({ 
      totalMeals,
      totalMealsOnDiet,
      totalMealsNotOnDiet,
      totalMealsOnDietSequence: totalMealsOnDietSequence.bestSequence,
     })
  })
}