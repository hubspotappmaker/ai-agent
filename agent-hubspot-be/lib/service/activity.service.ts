import { Injectable } from '@nestjs/common';
import { ActivityRepository } from 'lib/repository/activity.repository';
import { ActivityStatus, ActivityAction, ActivityType } from 'lib/constant/activity.constants';

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async logActivity(data: {
    userId: string;
    portalId: string;
    action: ActivityAction;
    type: ActivityType;
    engineName: string;
    modelName: string;
    note?: string;
    providerId?: string;
    maxToken?: number;
  }): Promise<string> {
    const activity = await this.activityRepository.createActivityLog(data);
    return activity.id;
  }

  async markActivitySuccess(
    activityId: string,
    executionTimeMs?: number,
  ): Promise<void> {
    await this.activityRepository.updateActivityStatus(
      activityId,
      'success' as ActivityStatus,
      undefined,
      executionTimeMs,
    );
  }

  async markActivityFailed(
    activityId: string,
    errorMessage: string,
    executionTimeMs?: number,
  ): Promise<void> {
    await this.activityRepository.updateActivityStatus(
      activityId,
      'failed' as ActivityStatus,
      errorMessage,
      executionTimeMs,
    );
  }

  async getUserActivities(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ activities: any[]; total: number }> {
    return this.activityRepository.getUserActivities(userId, limit, offset);
  }

  async getActivitiesByType(
    userId: string,
    type: ActivityType,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ activities: any[]; total: number }> {
    return this.activityRepository.getActivitiesByType(userId, type, limit, offset);
  }

  async getActivitiesByPortal(
    userId: string,
    portalId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ activities: any[]; total: number }> {
    return this.activityRepository.getActivitiesByPortal(userId, portalId, limit, offset);
  }

  async getTokenUsageStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalMaxTokens: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
  }> {
    return this.activityRepository.getTokenUsageStats(userId, startDate, endDate);
  }

  async logEmailGeneration(
    userId: string,
    portalId: string,
    engineName: string,
    modelName: string,
    providerId?: string,
    note?: string,
    maxToken?: number,
  ): Promise<string> {
    return this.logActivity({
      userId,
      portalId,
      action: 'generate_email' as ActivityAction,
      type: 'email' as ActivityType,
      engineName,
      modelName,
      providerId,
      note,
      maxToken,
    });
  }

  async logChatInteraction(
    userId: string,
    portalId: string,
    engineName: string,
    modelName: string,
    providerId?: string,
    note?: string,
    maxToken?: number,
  ): Promise<string> {
    return this.logActivity({
      userId,
      portalId,
      action: 'chat_with_me' as ActivityAction,
      type: 'chat' as ActivityType,
      engineName,
      modelName,
      providerId,
      note,
      maxToken,
    });
  }

  async logTemplateSave(
    userId: string,
    portalId: string,
    engineName: string,
    modelName: string,
    providerId?: string,
    note?: string,
    maxToken?: number,
  ): Promise<string> {
    return this.logActivity({
      userId,
      portalId,
      action: 'save_template' as ActivityAction,
      type: 'email' as ActivityType,
      engineName,
      modelName,
      providerId,
      note,
      maxToken,
    });
  }

  async logToneGeneration(
    userId: string,
    portalId: string,
    engineName: string,
    modelName: string,
    providerId?: string,
    note?: string,
    maxToken?: number,
  ): Promise<string> {
    return this.logActivity({
      userId,
      portalId,
      action: 'generate_tone' as ActivityAction,
      type: 'email' as ActivityType,
      engineName,
      modelName,
      providerId,
      note,
      maxToken,
    });
  }
}
