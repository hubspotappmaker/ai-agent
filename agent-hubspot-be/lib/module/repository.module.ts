import { Module } from "@nestjs/common";
import { User } from "lib/entity/user.entity";
import { Hubspot } from "lib/entity/hubspot.entity";
import { Provider } from "lib/entity/provider.entity";
import { SampleChat } from "lib/entity/sample-chat.entity";
import { Activity } from "lib/entity/activity.entity";
import { UserRepository } from "lib/repository/user.repository";
import { HubspotRepository } from "lib/repository/hubspot.repository";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProviderRepository } from "lib/repository/provider.repository";
import { SampleChatRepository } from "lib/repository/sample-chat.repository";
import { Tone } from "lib/entity/tone.entity";
import { ToneRepository } from "lib/repository/tone.repository";
import { ActivityRepository } from "lib/repository/activity.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Hubspot, Provider, SampleChat, Tone, Activity])
    ],
    providers: [
        {
            provide: UserRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(User).extend({}),
        },
        {
            provide: HubspotRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(Hubspot).extend({}),
        },
        {
            provide: ProviderRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(Provider).extend({}),
        },
        {
            provide: SampleChatRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(SampleChat).extend({}),
        },
        {
            provide: ToneRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(Tone).extend({}),
        },
        {
            provide: ActivityRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => {
                const repository = dataSource.getRepository(Activity);
                return repository.extend({
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
                    }) {
                        const activity = repository.create({
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
                        return repository.save(activity);
                    },

                    async updateActivityStatus(
                        id: string,
                        status: string,
                        errorMessage?: string,
                        executionTimeMs?: number,
                    ) {
                        await repository.update(id, {
                            status: status as any,
                            errorMessage,
                            executionTimeMs,
                        });
                    },

                    async getUserActivities(
                        userId: string,
                        limit: number = 50,
                        offset: number = 0,
                    ) {
                        const [activities, total] = await repository.findAndCount({
                            where: { userId },
                            relations: ['provider'],
                            order: { createdAt: 'DESC' },
                            take: limit,
                            skip: offset,
                        });
                        return { activities, total };
                    },

                    async getActivitiesByType(
                        userId: string,
                        type: string,
                        limit: number = 50,
                        offset: number = 0,
                    ) {
                        const [activities, total] = await repository.findAndCount({
                            where: { userId, type: type as any },
                            relations: ['provider'],
                            order: { createdAt: 'DESC' },
                            take: limit,
                            skip: offset,
                        });
                        return { activities, total };
                    },

                    async getActivitiesByPortal(
                        userId: string,
                        portalId: string,
                        limit: number = 50,
                        offset: number = 0,
                    ) {
                        const [activities, total] = await repository.findAndCount({
                            where: { userId, portalId },
                            relations: ['provider'],
                            order: { createdAt: 'DESC' },
                            take: limit,
                            skip: offset,
                        });
                        return { activities, total };
                    },

                    async getTokenUsageStats(userId: string, startDate?: Date, endDate?: Date) {
                        const query = repository.createQueryBuilder('activity')
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
                });
            },
        }
    ],
    exports: [
        UserRepository,
        HubspotRepository,
        ProviderRepository,
        SampleChatRepository,
        ToneRepository,
        ActivityRepository
    ],
})
export class RepositoriesModule { }