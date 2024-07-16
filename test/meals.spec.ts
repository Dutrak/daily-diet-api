import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from 'supertest'
import { app } from "../src/app";
import { execSync } from "child_process";

describe('Meals Routes', async () => {

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })



  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
       name: 'John Doe',
       email: 'Jhondoe@example.com'
      })
    
    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        is_on_diet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime(), // 1 day after (unix timestamp)
      })
    .expect(201)
  })

  it('should be able to list all meals from a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'Jhondoe@example.com'
      })
    
      await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        is_on_diet: true,
        date: new Date().getTime(),
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Lunch',
        description: "It's a lunch",
        is_on_diet: true,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime(), // 1 day after
      })
      .expect(201)
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    expect(listMealsResponse.body.meals[0].name).toBe('Lunch')
    expect(listMealsResponse.body.meals[1].name).toBe('Breakfast')
  })

  it('should be able to list a specific meal from a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'Jhondoe@example.com'
      })
    
      await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        is_on_diet: true,
        date: new Date().getTime(),
      })
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    const listSpecificMealResponse = await request(app.server)
      .get(`/meals/${listMealsResponse.body.meals[0].id}`)
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    expect(listSpecificMealResponse.body.meal.name).toBe('Breakfast')
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'Jhondoe@example.com'
      })
    
      await request(app.server)
        .post('/meals')
        .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
        .send({
          name: 'Breakfast',
          description: "It's a breakfast",
          is_on_diet: true,
          date: new Date().getTime(),
        })
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    await request(app.server)
      .put(`/meals/${listMealsResponse.body.meals[0].id}`)
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Lunch',
        description: "It's a lunch"
      })
      .expect(204)
    
    const listUpdatedMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    expect(listUpdatedMealsResponse.body.meals[0].name).toBe('Lunch')
    expect(listUpdatedMealsResponse.body.meals[0].description).toBe("It's a lunch")
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'Jhondoe@example.com'
      })
    
      await request(app.server)
        .post('/meals')
        .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
        .send({
          name: 'Breakfast',
          description: "It's a breakfast",
          is_on_diet: true,
          date: new Date().getTime(),
        })
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    await request(app.server)
      .delete(`/meals/${listMealsResponse.body.meals[0].id}`)
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(204)
    
    const listUpdatedMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    expect(listUpdatedMealsResponse.body.meals.length).toBe(0)
  })

  it('should be able to list a summary of meals from a user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'Jhondoe@example.com'
      })
    
    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        is_on_diet: true,
        date: new Date().getTime(),
      })
  
    await request(app.server)
      .post('/meals')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .send({
        name: 'Lunch',
        description: "It's a Lunch",
        is_on_diet: false,
        date: new Date().getTime(),
      })
    
    const listMealsSummaryResponse = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', createUserResponse.get('Set-Cookie') ?? [])
      .expect(200)
    
    expect(listMealsSummaryResponse.body).toEqual({
      totalMeals: 2,
      totalMealsOnDiet: 1,
	    totalMealsNotOnDiet: 1,
	    totalMealsOnDietSequence: 1
    })
  })
})  