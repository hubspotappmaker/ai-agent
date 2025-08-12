import { Module } from "@nestjs/common";
import { User } from "lib/entity/user.entity";
import { UserRepository } from "lib/repository/user.repository";
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";



@Module({
    imports: [
        TypeOrmModule.forFeature([User])
    ],
    providers: [
        {
            provide: UserRepository,
            inject: [DataSource],
            useFactory: (dataSource: DataSource) =>
                dataSource.getRepository(User).extend({}),
        }
    ],
    exports: [
        UserRepository
    ],
})
export class RepositoriesModule { }
