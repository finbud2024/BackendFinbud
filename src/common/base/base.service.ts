import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Document, FilterQuery, Types, UpdateQuery, QueryOptions } from 'mongoose';
import { BaseRepository } from './base.repository';

@Injectable()
export class BaseService<T extends Document> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly repository: BaseRepository<T>,
    protected readonly entityName: string,
  ) {}

  /**
   * Helper to convert string ID to MongoDB ObjectId
   */
  protected toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /**
   * Create a new entity
   * @param createDto The data to create the entity with
   * @returns The created entity
   */
  async create(createDto: any): Promise<T> {
    this.logger.debug(`Creating ${this.entityName} with data: ${JSON.stringify(createDto)}`);
    return this.repository.create(createDto);
  }

  /**
   * Create multiple entities
   * @param createDtos Array of entity data
   * @returns The created entities
   */
  async createMany(createDtos: any[]): Promise<T[]> {
    this.logger.debug(`Creating ${createDtos.length} ${this.entityName} entities`);
    return this.repository.createMany(createDtos);
  }

  /**
   * Find all entities matching a filter
   * @param filter Filter criteria
   * @param options Query options
   * @returns Array of entities
   */
  async findAll(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    this.logger.debug(`Finding all ${this.entityName}s with filter: ${JSON.stringify(filter)}`);
    return this.repository.findAll(filter, options);
  }

  /**
   * Find a single entity by ID
   * @param id Entity ID
   * @returns The entity or throws NotFound exception
   */
  async findById(id: string): Promise<T> {
    this.logger.debug(`Finding ${this.entityName} by ID: ${id}`);
    const entity = await this.repository.findById(id);
    if (!entity) {
      this.logger.warn(`${this.entityName} with ID ${id} not found`);
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return entity;
  }

  /**
   * Find one entity by filter
   * @param filter Filter criteria
   * @param options Query options
   * @returns The entity or null
   */
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    this.logger.debug(`Finding one ${this.entityName} with filter: ${JSON.stringify(filter)}`);
    return this.repository.findOne(filter, options);
  }

  /**
   * Find one entity by filter with exception if not found
   * @param filter Filter criteria
   * @param options Query options
   * @returns The entity or throws NotFound exception
   */
  async findOneOrFail(filter: FilterQuery<T>, options?: QueryOptions): Promise<T> {
    this.logger.debug(`Finding one ${this.entityName} or fail with filter: ${JSON.stringify(filter)}`);
    const entity = await this.repository.findOne(filter, options);
    if (!entity) {
      this.logger.warn(`${this.entityName} not found with filter: ${JSON.stringify(filter)}`);
      throw new NotFoundException(`${this.entityName} not found`);
    }
    return entity;
  }

  /**
   * Update an entity by ID
   * @param id Entity ID
   * @param updateDto Update data
   * @returns The updated entity or throws NotFound exception
   */
  async update(id: string, updateDto: UpdateQuery<T>): Promise<T> {
    this.logger.debug(`Updating ${this.entityName} with ID: ${id}`);
    const updated = await this.repository.update(id, updateDto);
    if (!updated) {
      this.logger.warn(`${this.entityName} with ID ${id} not found for update`);
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return updated;
  }

  /**
   * Update multiple entities matching a filter
   * @param filter Filter criteria
   * @param updateDto Update data
   * @returns Number of updated entities
   */
  async updateMany(filter: FilterQuery<T>, updateDto: UpdateQuery<T>): Promise<number> {
    this.logger.debug(`Updating many ${this.entityName}s with filter: ${JSON.stringify(filter)}`);
    return this.repository.updateMany(filter, updateDto);
  }

  /**
   * Remove an entity by ID
   * @param id Entity ID
   * @returns The removed entity or throws NotFound exception
   */
  async remove(id: string): Promise<T> {
    this.logger.debug(`Removing ${this.entityName} with ID: ${id}`);
    const removed = await this.repository.remove(id);
    if (!removed) {
      this.logger.warn(`${this.entityName} with ID ${id} not found for removal`);
      throw new NotFoundException(`${this.entityName} with ID ${id} not found`);
    }
    return removed;
  }

  /**
   * Remove multiple entities matching a filter
   * @param filter Filter criteria
   * @returns Number of removed entities
   */
  async removeMany(filter: FilterQuery<T>): Promise<number> {
    this.logger.debug(`Removing many ${this.entityName}s with filter: ${JSON.stringify(filter)}`);
    return this.repository.removeMany(filter);
  }

  /**
   * Count entities matching a filter
   * @param filter Filter criteria
   * @returns Count of entities
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    this.logger.debug(`Counting ${this.entityName}s with filter: ${JSON.stringify(filter)}`);
    return this.repository.count(filter);
  }

  /**
   * Check if an entity exists
   * @param filter Filter criteria
   * @returns Boolean indicating existence
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    this.logger.debug(`Checking if ${this.entityName} exists with filter: ${JSON.stringify(filter)}`);
    return this.repository.exists(filter);
  }

  /**
   * Find entities by user ID 
   * @param userId User ID
   * @param options Query options
   * @returns Array of entities
   */
  async findByUserId(userId: string, options?: QueryOptions): Promise<T[]> {
    this.logger.debug(`Finding ${this.entityName}s for user: ${userId}`);
    return this.repository.findByUserId(userId, options);
  }

  /**
   * Find latest entities
   * @param limit Number of entities to return
   * @param filter Filter criteria
   * @returns Array of entities
   */
  async findLatest(limit: number = 5, filter: FilterQuery<T> = {}): Promise<T[]> {
    this.logger.debug(`Finding latest ${limit} ${this.entityName}s`);
    return this.repository.findLatest(limit, filter);
  }

  /**
   * Find entities by specified field
   * @param field Field name
   * @param value Field value
   * @returns Array of entities
   */
  async findByField(field: string, value: any): Promise<T[]> {
    this.logger.debug(`Finding ${this.entityName}s by ${field}: ${value}`);
    return this.repository.findByField(field, value);
  }

  /**
   * Calculate sum of a field
   * @param field Field to sum
   * @param filter Filter criteria
   * @returns Sum value
   */
  async sum(field: string, filter: FilterQuery<T> = {}): Promise<number> {
    this.logger.debug(`Calculating sum of ${field} for ${this.entityName}s`);
    return this.repository.sum(field, filter);
  }

  /**
   * Run an aggregation pipeline
   * @param pipeline Aggregation pipeline
   * @returns Aggregation results
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    this.logger.debug(`Running aggregation on ${this.entityName}s`);
    return this.repository.aggregate(pipeline);
  }
} 