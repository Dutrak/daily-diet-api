import { Knex } from "knex"
import { User } from "./user"
import { Meal } from "./meal"

declare module 'knex/types/tables' {
  export interface Tables {
    users: User
    meals: Meal
  }
}
