import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventRepository } from './repositories/event.repository';
import { Event, EventSchema } from './entities/event.entity';
import { ScraperService } from './services/scraper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema }
    ])
  ],
  controllers: [EventsController],
  providers: [EventsService, EventRepository, ScraperService],
  exports: [EventsService]
})
export class EventsModule {} 