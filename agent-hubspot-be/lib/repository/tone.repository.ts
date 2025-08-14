import { Tone } from "lib/entity/tone.entity";
import { DataSource, Repository } from "typeorm";

export class ToneRepository extends Repository<Tone> {
    constructor(private dataSource: DataSource) {
        super(Tone, dataSource.createEntityManager());
    }
}