import fastify from "fastify";
import { User } from "./user";

declare module 'fastify' {
  export interface FastifyRequest {
    user: User
  }
}