import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Activity } from 'lib/entity/activity.entity';
import { ActivityStatus } from 'lib/constant/activity.constants';

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(private dataSource: DataSource) {
    super(Activity, dataSource.createEntityManager());
  }

  async createActivityLog(data: {
    userId: string;
    portalId: string;
    action: string;
    type: string;
    engineName: string;
    modelName: string;
    note?: string;
    providerId?: string;
    maxToken?: number;
  }): Promise<Activity> {
    const activity = this.create({
      userId: data.userId,
      portalId: data.portalId,
      action: data.action as any,
      type: data.type as any,
      engineName: data.engineName,
      modelName: data.modelName,
      note: data.note,
      providerId: data.providerId,
      maxToken: data.maxToken || 0,
      status: 'pending' as any,
    });
    return this.save(activity);
  }

  async updateActivityStatus(
    id: string,
    status: ActivityStatus,
    errorMessage?: string,
    executionTimeMs?: number,
  ): Promise<void> {
    await this.update(id, {
      status,
      errorMessage,
      executionTimeMs,
    });
  }

  async getUserActivities(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ activities: Activity[]; total: number }> {
    const [activities, total] = await this.findAndCount({
      where: { userId },
      relations: ['provider'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { activities, total };
  }

  async getActivitiesByType(
    userId: string,
    type: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ activities: Activity[]; total: number }> {
    const [activities, total] = await this.findAndCount({
      where: { userId, type: type as any },
      relations: ['provider'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { activities, total };
  }

  async getActivitiesByPortal(
    userId: string,
    portalId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ activities: Activity[]; total: number }> {
    const [activities, total] = await this.findAndCount({
      where: { userId, portalId },
      relations: ['provider'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { activities, total };
  }

  async getTokenUsageStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
    totalMaxTokens: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
  }> {
    const query = this.createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId });

    if (startDate) {
      query.andWhere('activity.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('activity.createdAt <= :endDate', { endDate });
    }

    const [totalMaxTokens] = await query
      .select('SUM(activity.maxToken)', 'totalMaxTokens')
      .getRawOne();

    const [totalRequests] = await query
      .select('COUNT(*)', 'totalRequests')
      .getRawOne();

    const [successfulRequests] = await query
      .select('COUNT(*)', 'successfulRequests')
      .where('activity.status = :status', { status: 'success' })
      .getRawOne();

    const [failedRequests] = await query
      .select('COUNT(*)', 'failedRequests')
      .where('activity.status = :status', { status: 'failed' })
      .getRawOne();

    return {
      totalMaxTokens: parseInt(totalMaxTokens?.totalMaxTokens || '0'),
      totalRequests: parseInt(totalRequests?.totalRequests || '0'),
      successfulRequests: parseInt(successfulRequests?.successfulRequests || '0'),
      failedRequests: parseInt(failedRequests?.failedRequests || '0'),
    };
  }
}
