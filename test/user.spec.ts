import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Users Routes', () => {
  
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

  it('should be able to create a user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'Jhondoe@example.com'
      })
    .expect(201)
  })

  it('should be able to List all users', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
       name: 'John Doe',
       email: 'Jhondoe@example.com'
      })
    
    const cookie = createUserResponse.get('Set-Cookie') ?? []

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookie)
      .expect(200)
    
    expect(listUsersResponse.body.users).toEqual([
      expect.objectContaining({
        name: 'John Doe',
        email: 'Jhondoe@example.com'
      })
    ])
  })
}) 