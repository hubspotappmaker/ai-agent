export const ACTIVITY_TYPE = {
  EMAIL: 'email',
  CHAT: 'chat',
} as const;

export const ACTIVITY_ACTION = {
  GENERATE_EMAIL: 'generate_email',
  SAVE_TEMPLATE: 'save_template',
  CHAT_WITH_ME: 'chat_with_me',
  GENERATE_TONE: 'generate_tone',
} as const;

export const ACTIVITY_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
} as const;

export type ActivityType = typeof ACTIVITY_TYPE[keyof typeof ACTIVITY_TYPE];
export type ActivityAction = typeof ACTIVITY_ACTION[keyof typeof ACTIVITY_ACTION];
export type ActivityStatus = typeof ACTIVITY_STATUS[keyof typeof ACTIVITY_STATUS];
