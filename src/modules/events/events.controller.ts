import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ScraperService } from './services/scraper.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { BaseController } from '../../common/base/base.controller';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController extends BaseController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly scraperService: ScraperService
  ) {
    super();
  }

  /**
   * Get events with filtering and pagination
   */
  @Get()
  async findAll(@Query() queryParams: any) {
    return this.eventsService.processEventQuery(queryParams, true);
  }

  /**
   * Get events with coordinates for map display
   */
  @Get('map')
  async getMapEvents() {
    const events = await this.eventsService.getMapEvents(true);
    return { data: events };
  }

  /**
   * Get upcoming events
   */
  @Get('upcoming')
  async getUpcomingEvents(@Query('limit') limitParam?: string) {
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const events = await this.eventsService.getUpcomingEvents(limit, true);
    return { 
      data: events,
      count: events.length
    };
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
    const events = await this.eventsService.getEventsForCalendar(year, month, true);
    return { data: events };
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
    // Use the service to validate and parse parameters
    const { lat, lng, radius } = this.eventsService.validateAndParseNearbyParams(
      latParam, lngParam, radiusParam
    );
    
    const events = await this.eventsService.getEventsNearLocation(lat, lng, radius, true);
    return { 
      data: events,
      count: events.length
    };
  }

  /**
   * Get a single event by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.getEventById(id, true);
  }

  /**
   * Create a new event
   */
  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto, true);
  }

  /**
   * Create multiple events at once
   */
  @Post('batch')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() body: { events: CreateEventDto[] }) {
    return this.eventsService.createManyEvents(body.events);
  }

  /**
   * Manually trigger the scraper
   */
  @Post('scrape')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async scrapeEvents() {
    return await this.scraperService.scrapeEvents();
  }

  /**
   * Update an existing event
   */
  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.updateEvent(id, updateEventDto, true);
  }

  /**
   * Delete an event
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.eventsService.deleteEvent(id);
  }
} 