import { Logger } from '@nestjs/common';
import { Document, FilterQuery, Model, QueryOptions, Types, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  protected readonly logger = new Logger(this.constructor.name);
  
  constructor(
    protected readonly model: Model<T>,
    protected readonly entityName: string,
  ) {}

  /**
   * Convert string ID to MongoDB ObjectId
   */
  protected toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /**
   * Create a new entity
   */
  async create(createDto: any): Promise<T> {
    this.logger.debug(`Creating new ${this.entityName}`);
    const entity = new this.model(createDto);
    return entity.save();
  }

  /**
   * Create multiple entities
   */
  async createMany(createDtos: any[]): Promise<T[]> {
    this.logger.debug(`Creating ${createDtos.length} ${this.entityName} entities`);
    return this.model.insertMany(createDtos);
  }

  /**
   * Find an entity by ID
   */
  async findById(id: string): Promise<T | null> {
    this.logger.debug(`Finding ${this.entityName} by ID: ${id}`);
    return this.model.findById(id).exec();
  }

  /**
   * Find a single entity by filter
   */
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    this.logger.debug(`Finding one ${this.entityName} by filter`);
    return this.model.findOne(filter, {}, options).exec();
  }

  /**
   * Find all entities matching a filter
   */
  async findAll(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    this.logger.debug(`Finding all ${this.entityName}s`);
    return this.model.find(filter, {}, options).exec();
  }

  /**
   * Update an entity by ID
   */
  async update(id: string, updateDto: UpdateQuery<T>): Promise<T | null> {
    this.logger.debug(`Updating ${this.entityName} with ID: ${id}`);
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  /**
   * Update multiple entities matching a filter
   */
  async updateMany(filter: FilterQuery<T>, updateDto: UpdateQuery<T>): Promise<number> {
    this.logger.debug(`Updating multiple ${this.entityName}s`);
    const result = await this.model.updateMany(filter, updateDto).exec();
    return result.modifiedCount;
  }

  /**
   * Remove an entity by ID
   */
  async remove(id: string): Promise<T | null> {
    this.logger.debug(`Removing ${this.entityName} with ID: ${id}`);
    return this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Remove multiple entities matching a filter
   */
  async removeMany(filter: FilterQuery<T>): Promise<number> {
    this.logger.debug(`Removing multiple ${this.entityName}s`);
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  /**
   * Count entities matching a filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    this.logger.debug(`Counting ${this.entityName}s`);
    return this.model.countDocuments(filter).exec();
  }

  /**
   * Check if an entity exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    this.logger.debug(`Checking if ${this.entityName} exists`);
    const count = await this.count(filter);
    return count > 0;
  }

  /**
   * Execute an aggregation pipeline
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    this.logger.debug(`Executing aggregation on ${this.entityName}`);
    return this.model.aggregate(pipeline).exec();
  }

  /**
   * Find entities by user ID (common pattern for user-owned resources)
   */
  async findByUserId(userId: string, options?: QueryOptions): Promise<T[]> {
    this.logger.debug(`Finding ${this.entityName}s for user ${userId}`);
    return this.findAll({ userId: this.toObjectId(userId) }, options);
  }

  /**
   * Find entity by field value
   */
  async findByField(field: string, value: any): Promise<T[]> {
    this.logger.debug(`Finding ${this.entityName}s by ${field}`);
    const filter = { [field]: value } as FilterQuery<T>;
    return this.findAll(filter);
  }
  
  /**
   * Calculate sum of a field for entities matching a filter
   */
  async sum(field: string, filter: FilterQuery<T> = {}): Promise<number> {
    this.logger.debug(`Calculating sum of ${field} for ${this.entityName}s`);
    const result = await this.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: `$${field}` } } }
    ]);
    
    return result.length > 0 ? result[0].total : 0;
  }
  
  /**
   * Find latest entities
   */
  async findLatest(limit: number = 5, filter: FilterQuery<T> = {}): Promise<T[]> {
    this.logger.debug(`Finding latest ${limit} ${this.entityName}s`);
    return this.model.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
  }

  /**
   * Find entities within a date range
   * @param dateField The date field to query on
   * @param startDate Start date
   * @param endDate End date
   * @param filter Additional filter criteria
   * @returns Entities within the date range
   */
  async findInDateRange(
    dateField: string, 
    startDate: Date, 
    endDate: Date, 
    filter: FilterQuery<T> = {}
  ): Promise<T[]> {
    this.logger.debug(`Finding ${this.entityName}s in date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const dateFilter = {
      [dateField]: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    const combinedFilter = { ...filter, ...dateFilter };
    return this.findAll(combinedFilter);
  }

  /**
   * Find entities with non-null values in specified fields
   * @param fields Array of field names that should be non-null
   * @param filter Additional filter criteria
   * @returns Entities with non-null values
   */
  async findWithNonNullFields(fields: string[], filter: FilterQuery<T> = {}): Promise<T[]> {
    this.logger.debug(`Finding ${this.entityName}s with non-null fields: ${fields.join(', ')}`);
    
    const nonNullConditions = fields.reduce((acc, field) => {
      acc[field] = { $ne: null };
      return acc;
    }, {});
    
    const combinedFilter = { ...filter, ...nonNullConditions };
    return this.findAll(combinedFilter);
  }

  /**
   * Find entities near a geographic point
   * @param latField Latitude field name in the document
   * @param lngField Longitude field name in the document
   * @param coordinates [latitude, longitude] coordinates
   * @param maxDistance Maximum distance in meters
   * @param filter Additional filter criteria
   * @returns Entities near the specified point
   */
  async findNear(
    latField: string,
    lngField: string,
    coordinates: [number, number],
    maxDistance: number = 10000, // Default 10km
    filter: FilterQuery<T> = {}
  ): Promise<T[]> {
    this.logger.debug(`Finding ${this.entityName}s near coordinates: [${coordinates.join(', ')}] within ${maxDistance}m`);
    
    // MongoDB $geoNear aggregation requires a geospatial index
    // Fallback to a simpler approach using filters:
    const [lat, lng] = coordinates;
    
    // Calculate rough bounds for a square around the point
    // Each degree of latitude is approximately 111km
    const latDelta = maxDistance / 111000;
    // Each degree of longitude varies based on latitude, roughly cos(lat) * 111km
    const lngDelta = maxDistance / (111000 * Math.cos(lat * (Math.PI / 180)));
    
    const geoFilter = {
      [latField]: { $gte: lat - latDelta, $lte: lat + latDelta },
      [lngField]: { $gte: lng - lngDelta, $lte: lng + lngDelta }
    };
    
    const combinedFilter = { ...filter, ...geoFilter };
    
    // Find entities in the bounding box
    const entitiesInBox = await this.findAll(combinedFilter);
    
    // Calculate actual distance and filter by maxDistance
    // Haversine formula for accurate distance on a sphere
    return entitiesInBox.filter(entity => {
      const entityLat = entity[latField];
      const entityLng = entity[lngField];
      
      if (entityLat === null || entityLng === null) return false;
      
      const distance = this.calculateHaversineDistance(
        [lat, lng],
        [entityLat, entityLng]
      );
      
      return distance <= maxDistance;
    });
  }
  
  /**
   * Calculates distance between two points using the Haversine formula
   * @param point1 [latitude, longitude] of point 1
   * @param point2 [latitude, longitude] of point 2
   * @returns Distance in meters
   */
  private calculateHaversineDistance(
    point1: [number, number],
    point2: [number, number]
  ): number {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;
    
    const R = 6371000; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }

  /**
   * Find entities with unique values in a specified field (no duplicates)
   * @param field Field to check for uniqueness
   * @param filter Additional filter criteria
   * @returns Array of unique entities
   */
  async findUniqueByField(field: string, filter: FilterQuery<T> = {}): Promise<T[]> {
    this.logger.debug(`Finding unique ${this.entityName}s by ${field}`);
    
    // Use aggregation to get unique values
    const results = await this.aggregate([
      { $match: filter },
      { $group: { _id: `$${field}`, doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } }
    ]);
    
    return results;
  }
} 