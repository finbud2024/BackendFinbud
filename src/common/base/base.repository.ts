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
} 