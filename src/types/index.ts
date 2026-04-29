export type UserRole = "creator" | "student"

export type CourseStatus = "draft" | "published" | "archived"

export type OrderStatus = "pending" | "processing" | "approved" | "rejected" | "refunded"

export interface Profile {
  id: string
  role: UserRole
  display_name: string
  email: string
  avatar_url: string | null
  brand_name: string | null
  mp_connected: boolean
  created_at: string
}

export interface Course {
  id: string
  creator_id: string
  slug: string
  status: CourseStatus
  title: string
  headline: string | null
  subheadline: string | null
  description_long: string | null
  hero_video_url: string | null
  learning_outcomes: string[]
  target_audience: string[]
  cta_text: string
  price_ars: number
  price_usd: number | null
  installments_max: number
  created_at: string
  updated_at: string
  // Joined
  creator?: Profile
  modules?: CourseModule[]
  testimonials?: Testimonial[]
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  position: number
  created_at: string
  // Joined
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  position: number
  video_bunny_id: string | null
  video_drive_id: string | null
  video_duration_sec: number | null
  materials: MaterialFile[]
  is_free_preview: boolean
  created_at: string
}

export interface MaterialFile {
  name: string
  url: string
  type: string
}

export interface Testimonial {
  id: string
  course_id: string
  author_name: string
  author_avatar_url: string | null
  content: string
  rating: number
  position: number
  created_at: string
}

export interface Order {
  id: string
  course_id: string
  student_id: string
  status: OrderStatus
  amount_ars: number
  platform_fee_ars: number | null
  creator_earning_ars: number | null
  mp_payment_id: string | null
  mp_preference_id: string | null
  installments: number | null
  created_at: string
  updated_at: string
  // Joined
  course?: Course
  student?: Profile
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  order_id: string
  enrolled_at: string
  // Joined
  course?: Course
}
