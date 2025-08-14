import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SampleChat } from '../entity/sample-chat.entity';

@Injectable()
export class SampleChatRepository extends Repository<SampleChat> {
  constructor(private dataSource: DataSource) {
    super(SampleChat, dataSource.createEntityManager());
  }
}