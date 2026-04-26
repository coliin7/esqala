import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const registroSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  displayName: z.string().min(2, "Mínimo 2 caracteres"),
  role: z.enum(["creator", "student"]),
})

export const createCourseSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
  description: z.string().optional(),
  price_ars: z.number().min(100, "El precio mínimo es $100 ARS"),
  price_usd: z.number().min(1).optional().nullable(),
})

export const updateCourseSchema = createCourseSchema

export const updateLandingSchema = z.object({
  headline: z.string().min(1, "El título es requerido").max(200),
  subheadline: z.string().max(300).optional(),
  hero_video_url: z.string().url("URL inválida").optional().or(z.literal("")),
  description_long: z.string().optional(),
  learning_outcomes: z.array(z.string().min(1)),
  target_audience: z.array(z.string().min(1)),
  cta_text: z.string().min(1).max(50),
  installments_max: z.number().min(1).max(12),
})

export const createModuleSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
})

export const createLessonSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
})

export const testimonialSchema = z.object({
  author_name: z.string().min(1, "El nombre es requerido"),
  content: z.string().min(10, "Mínimo 10 caracteres"),
  rating: z.number().min(1).max(5),
})

export const profileSchema = z.object({
  display_name: z.string().min(2, "Mínimo 2 caracteres"),
  brand_name: z.string().optional().nullable(),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal("")),
})

export const slugSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(100, "Máximo 100 caracteres")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones")

export type LoginInput = z.infer<typeof loginSchema>
export type RegistroInput = z.infer<typeof registroSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateLandingInput = z.infer<typeof updateLandingSchema>
export type TestimonialInput = z.infer<typeof testimonialSchema>
export type ProfileInput = z.infer<typeof profileSchema>
