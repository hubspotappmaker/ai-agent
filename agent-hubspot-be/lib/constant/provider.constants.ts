export const PROVIDER_TYPE_PRESETS = {
  CHAT_GPT: {
    name: 'chatgpt',
    model: ['gpt-4o', 'gpt-4o-mini'],
  },
  DEEPSEEK: {
    name: 'deepseek',
    model: ['deepseek-r1', 'deepseek-reasoner'],
  },
  GROK: {
    name: 'grok',
    model: ['grok-4', 'grok-3'],
  },
  CLAUDE: {
    name: 'claude',
    model: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest'],
  },
} as const;

export type ProviderTypeKey = keyof typeof PROVIDER_TYPE_PRESETS;
export type ProviderTypeName = typeof PROVIDER_TYPE_PRESETS[ProviderTypeKey];
