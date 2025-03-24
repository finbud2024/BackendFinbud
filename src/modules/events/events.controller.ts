import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ScraperService } from './services/scraper.service';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly scraperService: ScraperService
  ) {}

  /**
   * Get events with filtering and pagination
   */
  @Get()
  async findAll(@Query() queryParams: any) {
    return this.eventsService.processEventQuery(queryParams);
  }

  /**
   * Get events with coordinates for map display
   */
  @Get('map')
  async getMapEvents() {
    return this.eventsService.findMapEvents();
  }

  /**
   * Get upcoming events
   */
  @Get('upcoming')
  async getUpcomingEvents(@Query('limit') limitParam?: string) {
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    return this.eventsService.getUpcomingEvents(limit);
  }

  /**
   * Get events for calendar view
   */
  @Get('calendar')
  async getCalendarEvents(
    @Query('year') yearParam?: string,
    @Query('month') monthParam?: string
  ) {
    const year = yearParam ? parseInt(yearParam, 10) : undefined;
    const month = monthParam ? parseInt(monthParam, 10) : undefined;
    return this.eventsService.getEventsForCalendar(year, month);
  }

  /**
   * Get events near a location
   */
  @Get('nearby')
  async getNearbyEvents(
    @Query('lat') latParam: string,
    @Query('lng') lngParam: string,
    @Query('radius') radiusParam?: string
  ) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    const radius = radiusParam ? parseInt(radiusParam, 10) : 10000;
    return this.eventsService.getEventsNearLocation(lat, lng, radius);
  }

  /**
   * Get a single event by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  /**
   * Create a new event
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  /**
   * Create multiple events at once
   */
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() body: { events: CreateEventDto[] }) {
    return this.eventsService.createManyEvents(body.events);
  }

  /**
   * Manually trigger the scraper
   */
  @Post('scrape')
  @HttpCode(HttpStatus.OK)
  async scrapeEvents() {
    return await this.scraperService.scrapeEvents();
  }

  /**
   * Update an existing event
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  /**
   * Delete an event
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
} 