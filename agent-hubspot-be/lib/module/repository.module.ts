import { Module } from "@nestjs/common";
import { User } from "lib/entity/user.entity";
import { Hubspot } from "lib/entity/hubspot.entity";
import { Provider } from "lib/entity/provider.entity";
import { UserRepository } from "lib/repository/user.repository";
import { HubspotRepository } from "lib/repository/hubspot.repository";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProviderRepository } from "lib/repository/provider.repository";



@Module({
    imports: [
        TypeOrmModule.forFeature([User, Hubspot, Provider])
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
        }
    ],
    exports: [
        UserRepository,
        HubspotRepository,
        ProviderRepository
    ],
})
export class RepositoriesModule { }
