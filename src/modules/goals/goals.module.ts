import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Goal, GoalSchema } from './entities/goal.entity';
import { GoalsRepository } from './repositories/goals.repository';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Goal.name, schema: GoalSchema }
    ])
  ],
  controllers: [GoalsController],
  providers: [
    GoalsService,
    GoalsRepository,
  ],
  exports: [GoalsService]
})
export class GoalsModule {}