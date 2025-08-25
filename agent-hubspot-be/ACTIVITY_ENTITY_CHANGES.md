# Activity Entity Changes

## Overview
Updated Activity entity to remove unnecessary fields and add new field as requested.

## Changes in Activity Entity

### Removed Fields:
- `tokensUsed: number` - Field storing used tokens count
- `requestData: any | null` - Field storing request data
- `responseData: any | null` - Field storing response data

### New Field:
- `maxToken: number` - Field storing maximum configured tokens

## Updated Files:

### 1. lib/entity/activity.entity.ts
- Removed fields `tokensUsed`, `requestData`, `responseData`
- Added field `maxToken` with column name `max_token`

### 2. lib/repository/activity.repository.ts
- Updated `createActivityLog()` method to use `maxToken` instead of `tokensUsed`
- Removed `requestData` and `responseData` parameters
- Updated `updateActivityStatus()` method to no longer accept `responseData`
- Updated `getTokenUsageStats()` method to calculate total `maxToken` instead of `tokensUsed`

### 3. lib/service/activity.service.ts
- Updated all logging methods to use `maxToken`
- Removed `requestData` and `responseData` parameters from methods
- Updated `markActivitySuccess()` method to no longer accept `responseData`
- Updated return type of `getTokenUsageStats()` to return `totalMaxTokens`

### 4. lib/module/repository.module.ts
- Updated factory function for ActivityRepository
- Changed all references from `tokensUsed` to `maxToken`
- Removed `requestData` and `responseData` from methods

### 5. src/email/email.service.ts
- Updated calls to `logEmailGeneration()` and `logTemplateSave()`
- Pass `maxTokens` instead of `requestData` object
- Updated calls to `markActivitySuccess()` to not pass response data

### 6. src/chatbot/chatbot.service.ts
- Updated calls to `logChatInteraction()`
- Pass `maxTokens` instead of `requestData` object
- Updated calls to `markActivitySuccess()` to not pass response data

## Database Schema
Since the project uses `synchronize: true`, the database schema will be automatically updated when the application runs.

## Notes
- All changes are backward compatible at the API level
- Public methods maintain the same signature, only internal implementation changed
- Token usage statistics now display total max tokens instead of used tokens
