import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { EventRepository } from './repositories/event.repository';
import { Event, EventDocument } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AppException, ExceptionFactory } from '../../common/exceptions/app.exception';

@Injectable()
export class EventsService extends BaseService<EventDocument> {
  protected readonly logger = new Logger(EventsService.name);

  constructor(private readonly eventRepository: EventRepository) {
    super(eventRepository, 'Event');
  }

  /**
   * Find all events with filtering and pagination
   */
  async queryEvents(query: QueryEventDto): Promise<{ events: Event[], count: number }> {
    return await this.eventRepository.findWithFilters(query);
  }

  /**
   * Get a single event by ID
   * @param id Event ID
   * @param formatDates Whether to format dates in the response
   * @returns The event
   */
  async getEventById(id: string, formatDates: boolean = false): Promise<any> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw ExceptionFactory.eventNotFound(id);
    }
    
    return formatDates ? this.addFormattedDates(event) : event;
  }

  /**
   * Get events with valid coordinates for map display
   * @param formatDates Whether to format dates in the response
   * @returns Events with valid coordinates
   */
  async getMapEvents(formatDates: boolean = false): Promise<any> {
    const events = await this.eventRepository.findWithCoordinates();
    return formatDates ? this.addFormattedDates(events) : events;
  }

  /**
   * Get upcoming events
   * @param limit Maximum number of events to return
   * @param formatDates Whether to format dates in the response
   * @returns Array of upcoming events
   */
  async getUpcomingEvents(limit: number = 10, formatDates: boolean = false): Promise<any> {
    try {
      const events = await this.eventRepository.findUpcomingEvents();
      const limitedEvents = events.slice(0, limit);
      return formatDates ? this.addFormattedDates(limitedEvents) : limitedEvents;
    } catch (error) {
      this.logger.error(`Error retrieving upcoming events: ${error.message}`, error.stack);
      throw ExceptionFactory.eventNotFound('upcoming');
    }
  }

  /**
   * Get events for calendar display
   * @param year Year (defaults to current year)
   * @param month Month (1-12, defaults to current month)
   * @param formatDates Whether to format dates in the response
   * @returns Events for the specified month
   */
  async getEventsForCalendar(year?: number, month?: number, formatDates: boolean = false): Promise<any> {
    try {
      const now = new Date();
      
      // Default to current year/month if not provided
      const targetYear = year || now.getFullYear();
      const targetMonth = month || (now.getMonth() + 1);
      
      const events = await this.eventRepository.findByMonthYear(targetMonth, targetYear);
      return formatDates ? this.addFormattedDates(events) : events;
    } catch (error) {
      this.logger.error(`Error retrieving calendar events: ${error.message}`, error.stack);
      throw ExceptionFactory.eventNotFound('calendar');
    }
  }

  /**
   * Get events near a specific location
   * @param lat Latitude
   * @param lng Longitude
   * @param radius Search radius in kilometers
   * @param formatDates Whether to format dates in the response
   * @returns Events near the location
   */
  async getEventsNearLocation(
    lat: number, 
    lng: number, 
    radius: number = 10, 
    formatDates: boolean = false
  ): Promise<any> {
    try {
      // Validate if coordinates are provided
      if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
        throw ExceptionFactory.eventInvalidData('Missing or invalid coordinates. Both lat and lng parameters are required.');
      }
      
      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw ExceptionFactory.eventLocationInvalid({
          message: 'Invalid coordinates provided. Latitude must be between -90 and 90, longitude between -180 and 180.',
          lat,
          lng
        });
      }

      const events = await this.eventRepository.findNearby(lat, lng, radius);
      return formatDates ? this.addFormattedDates(events) : events;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      
      this.logger.error(`Error retrieving events by location: ${error.message}`, error.stack);
      throw ExceptionFactory.eventValidationError(`Failed to retrieve nearby events: ${error.message}`);
    }
  }

  /**
   * Create a new event
   * @param createEventDto Event data
   * @param formatDates Whether to format dates in the response
   * @returns The created event
   */
  async createEvent(createEventDto: CreateEventDto, formatDates: boolean = false): Promise<any> {
    try {
      this.logger.log(`Creating new event: ${createEventDto.name}`);
      const event = await this.eventRepository.create(createEventDto);
      return formatDates ? this.addFormattedDates(event) : event;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`, error.stack);
      throw ExceptionFactory.eventValidationError(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Create multiple events at once
   */
  async createManyEvents(events: CreateEventDto[]): Promise<{ created: number; skipped: number; failed: number }> {
    if (!events || !events.length) {
      return { created: 0, skipped: 0, failed: 0 };
    }

    this.logger.log(`Attempting to create ${events.length} events`);
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const eventData of events) {
      try {
        // Check for duplicates
        const existingEvent = await this.eventRepository.findByNameAndDate(eventData.name, eventData.date);
        if (existingEvent) {
          this.logger.debug(`Skipping duplicate event: ${eventData.name}`);
          skipped++;
          continue;
        }

        await this.eventRepository.create(eventData);
        created++;
      } catch (error) {
        this.logger.error(`Failed to create event ${eventData.name}: ${error.message}`, error.stack);
        failed++;
      }
    }

    this.logger.log(`Event creation results: ${created} created, ${skipped} skipped, ${failed} failed`);
    return { created, skipped, failed };
  }

  /**
   * Update an existing event
   * @param id Event ID
   * @param updateEventDto Update data
   * @param formatDates Whether to format dates in the response
   * @returns The updated event
   */
  async updateEvent(id: string, updateEventDto: UpdateEventDto, formatDates: boolean = false): Promise<any> {
    const event = await this.getEventById(id);
    
    try {
      this.logger.log(`Updating event ${id}: ${event.name}`);
      
      // If lat or lng are being updated, we need to update geoLocation as well
      if (updateEventDto.lat !== undefined || updateEventDto.lng !== undefined) {
        // Get current lat/lng values, potentially overridden by update values
        const lat = updateEventDto.lat !== undefined ? updateEventDto.lat : event.lat;
        const lng = updateEventDto.lng !== undefined ? updateEventDto.lng : event.lng;
        
        // Only set geoLocation if both lat and lng are valid
        if (lat !== undefined && lng !== undefined) {
          updateEventDto.geoLocation = {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON uses [longitude, latitude] order
          };
        } else {
          // If either lat or lng is being removed, also remove geoLocation
          updateEventDto.geoLocation = undefined;
        }
      }
      
      const updated = await this.eventRepository.findByIdAndUpdate(id, updateEventDto);
      if (!updated) {
        throw ExceptionFactory.eventNotFound(id);
      }
      
      return formatDates ? this.addFormattedDates(updated) : updated;
    } catch (error) {
      this.logger.error(`Failed to update event ${id}: ${error.message}`, error.stack);
      throw ExceptionFactory.eventValidationError(`Failed to update event: ${error.message}`);
    }
  }

  /**
   * Remove an event
   */
  async deleteEvent(id: string): Promise<{ deleted: boolean }> {
    const event = await this.getEventById(id);
    
    try {
      this.logger.log(`Removing event ${id}: ${event.name}`);
      await this.eventRepository.deleteById(id);
      return { deleted: true };
    } catch (error) {
      this.logger.error(`Failed to delete event ${id}: ${error.message}`, error.stack);
      throw ExceptionFactory.eventValidationError(`Failed to delete event: ${error.message}`);
    }
  }

  /**
   * Process query request with filtering, pagination, and standardized response
   * @param queryParams Raw query parameters
   * @param formatDates Whether to format dates in the response
   * @returns Formatted paginated response
   */
  async processEventQuery(queryParams: any, formatDates: boolean = false): Promise<{
    success: boolean;
    data: {
      data: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    };
    message?: string;
  }> {
    // Process sortBy and sortDirection parameters
    const sortField = queryParams.sortBy || 'date';
    const sortDirection = queryParams.sortDirection || 'asc';

    // Add lean option to options object if supported by the repository
    const queryOptions = {
      defaultLimit: 20,
      sortField,
      sortDirection,
      paramConfig: {
        stringParams: ['name', 'host', 'location', 'sortBy', 'sortDirection'],
        dateRanges: [
          {
            startParam: 'startDate',
            endParam: 'endDate',
            resultKey: 'dateRange',
            defaultDaysBack: 90 // Default to 90 days of events
          }
        ],
        numericParams: [
          { name: 'lat' },
          { name: 'lng' },
          { name: 'radius', defaultValue: 10000 }
        ]
      }
    };

    const response = await this.processApiQuery(
      queryParams,
      (params: any) => this.buildEventFilter(params),
      queryOptions
    );
    
    // Format dates if requested
    if (formatDates && response && response.data && response.data.data) {
      response.data.data = this.addFormattedDates(response.data.data);
    }
    
    return response;
  }

  /**
   * Build MongoDB filter from processed query parameters
   * @param params Processed query parameters
   * @returns MongoDB filter object
   */
  private buildEventFilter(params: any): any {
    const filter: any = {};

    // Text search for name
    if (params.name) {
      filter.name = { $regex: params.name, $options: 'i' };
    }

    // Host filter
    if (params.host) {
      filter.host = { $regex: params.host, $options: 'i' };
    }

    // Location text filter
    if (params.location) {
      filter.location = { $regex: params.location, $options: 'i' };
    }

    // Date range filter
    if (params.dateRange) {
      filter.date = {
        $gte: params.dateRange.startDate,
        $lte: params.dateRange.endDate
      };
    }

    // Location-based search
    if (params.lat && params.lng && params.radius) {
      // We'll handle geographic filtering later in a separate function
      // as we need to calculate distances
      filter._geoFilter = {
        lat: params.lat,
        lng: params.lng,
        radius: params.radius
      };
    }

    return filter;
  }
} 