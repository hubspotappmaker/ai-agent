import { Repository } from "typeorm"
import { User } from "lib/entity/user.entity"

export class UserRepository extends Repository<User> { }

