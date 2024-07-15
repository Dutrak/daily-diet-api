export interface Meal {
  id: string
  name: string
  description: string
  date: number // unix timestamp
  is_on_diet: boolean
  user_id: string
  created_at: string
  updated_at: string
}