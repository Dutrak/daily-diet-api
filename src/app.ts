import cookie from '@fastify/cookie'
import { fastify } from 'fastify'
import { UsersRoutes } from './routes/users'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';

export const app = fastify()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cookie)
app.register(UsersRoutes, { prefix: 'users' })