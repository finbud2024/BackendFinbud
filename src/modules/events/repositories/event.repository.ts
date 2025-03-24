import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from '../../../common/base/base.repository';
import { Event, EventDocument } from '../entities/event.entity';
import { QueryEventDto } from '../dto/query-event.dto';

@Injectable()
export class EventRepository extends BaseRepository<EventDocument> {
  protected readonly logger = new Logger(EventRepository.name);

  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {
    super(eventModel, 'Event');
  }

  /**
   * Find events with filtering and pagination
   */
  async findWithFilters(query: QueryEventDto): Promise<{ events: Event[], count: number }> {
    const { page = 1, limit = 10, name, host, location } = query;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<EventDocument> = {};
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    if (host) {
      filter.host = { $regex: host, $options: 'i' };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const events = await this.eventModel
      .find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    const count = await this.eventModel.countDocuments(filter).exec();
    
    return { events, count };
  }

  /**
   * Find events with valid coordinates
   */
  async findWithCoordinates(): Promise<Event[]> {
    return this.eventModel
      .find({ 
        lat: { $ne: null, $exists: true }, 
        lng: { $ne: null, $exists: true } 
      })
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Find events by month and year
   */
  async findByMonthYear(month: number, year: number): Promise<Event[]> {
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JS Date
    const endDate = new Date(year, month, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999);
    
    return this.eventModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ date: 1 })
      .exec();
  }

  /**
   * Find upcoming events after the specified date
   */
  async findUpcoming(date: Date, limit?: number): Promise<Event[]> {
    const query = this.eventModel
      .find({ date: { $gte: date } })
      .sort({ date: 1 });
    
    if (limit) {
      query.limit(limit);
    }
    
    return query.exec();
  }

  /**
   * Find events with the same name and date
   */
  async findByNameAndDate(name: string, date?: string): Promise<Event | null> {
    const filter: FilterQuery<EventDocument> = { name };
    
    if (date) {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);
        
        filter.date = { $gte: startOfDay, $lte: endOfDay };
      }
    }
    
    return this.eventModel.findOne(filter).exec();
  }

  /**
   * Find events within a certain radius of coordinates
   * Uses MongoDB's $geoNear aggregation for efficient geospatial queries
   */
  async findNearby(lat: number, lng: number, radiusKm: number = 10): Promise<Event[]> {
    this.logger.debug(`Finding events near coordinates [${lat}, ${lng}] within ${radiusKm}km`);
    
    // Convert km to meters for MongoDB
    const radiusMeters = radiusKm * 1000;
    
    // Use aggregation with $geoNear for best performance with 2dsphere index
    const events = await this.eventModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON uses [longitude, latitude] order
          },
          distanceField: 'distance', // Adds a distance field to results
          maxDistance: radiusMeters,
          spherical: true,
          query: {
            // Only include events with valid coordinates
            lat: { $exists: true, $ne: null },
            lng: { $exists: true, $ne: null }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          date: 1,
          host: 1,
          location: 1,
          price: 1,
          image: 1,
          lat: 1,
          lng: 1,
          url: 1,
          distance: 1, // Include the calculated distance in meters
          distanceKm: { $divide: ['$distance', 1000] } // Add distance in km for convenience
        }
      },
      {
        $sort: { distance: 1 } // Sort by closest first
      }
    ]).exec();
    
    return events;
  }

  /**
   * Find events for the upcoming days
   */
  async findUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.eventModel
      .find({ date: { $gte: today } })
      .sort({ date: 1 })
      .limit(limit)
      .exec();
  }

  /**
   * Find by ID and update
   */
  async findByIdAndUpdate(id: string, updateData: any): Promise<Event | null> {
    return this.eventModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  /**
   * Delete by ID
   */
  async deleteById(id: string): Promise<boolean> {
    const result = await this.eventModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
} 