export const PROVIDER_TYPE_PRESETS = {
  CHAT_GPT: {
    name: 'chatgpt',
    model: ['gpt-4o', 'gpt-4o-mini'],
  },
  DEEPSEEK: {
    name: 'deepseek',
    model: ['deepseek-chat', 'deepseek-reasoner'],
  },
  GROK: {
    name: 'grok',
    model: ['grok-4', 'grok-3', 'grok-3-mini'],
  },
  CLAUDE: {
    name: 'claude',
    model: [
      'claude-opus-4-1-20250805',
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-haiku-20241022',
      'claude-3-haiku-20240307'
    ],
  },
} as const;

export type ProviderType = keyof typeof PROVIDER_TYPE_PRESETS;
