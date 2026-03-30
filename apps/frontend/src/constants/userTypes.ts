/**
 * User types on the platform.
 * Must match backend config/constants.js USER_TYPES.
 */
export const USER_TYPES = {
  BUSINESS: 'business',
  EXPERT: 'expert',
} as const

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]
