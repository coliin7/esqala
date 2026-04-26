export const PLATFORM_FEE_RATE = 0.12

export const MAX_INSTALLMENTS = 6

export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  APPROVED: "approved",
  REJECTED: "rejected",
  REFUNDED: "refunded",
} as const

export const USER_ROLES = {
  CREATOR: "creator",
  STUDENT: "student",
} as const
