import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [TasksModule, WorkersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
