import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Document, FilterQuery, Types, UpdateQuery, QueryOptions } from 'mongoose';
import { BaseRepository } from './base.repository';
import { Request } from 'express';
import { ExceptionFactory } from '../exceptions/app.exception';

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

  /**
   * Utility methods to parse common query parameters
   */

  /**
   * Parse a comma-separated string parameter into an array of strings
   * @param paramValue The parameter value to parse
   * @returns Array of trimmed strings, or undefined if input is invalid
   */
  protected parseCommaSeparatedParam(paramValue: any): string[] | undefined {
    if (!paramValue) return undefined;
    
    if (typeof paramValue === 'string') {
      return paramValue.split(',').map(value => value.trim());
    }
    
    if (Array.isArray(paramValue)) {
      return paramValue.map(value => String(value).trim());
    }
    
    return undefined;
  }

  /**
   * Parse a date parameter from various formats
   * @param dateValue The date value to parse (string, date object, etc.)
   * @returns Date object or undefined if parsing fails
   */
  protected parseDateParam(dateValue: any): Date | undefined {
    if (!dateValue) return undefined;
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    try {
      const parsedDate = new Date(dateValue);
      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        return undefined;
      }
      return parsedDate;
    } catch (error) {
      this.logger.debug(`Failed to parse date parameter: ${dateValue}`);
      return undefined;
    }
  }

  /**
   * Parse a numeric parameter
   * @param numValue The numeric value to parse
   * @param defaultValue Optional default value if parsing fails
   * @returns Parsed number or default value
   */
  protected parseNumericParam(numValue: any, defaultValue?: number): number | undefined {
    if (numValue === undefined || numValue === null) return defaultValue;
    
    if (typeof numValue === 'number') {
      return numValue;
    }
    
    try {
      const parsed = Number(numValue);
      return isNaN(parsed) ? defaultValue : parsed;
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Get a date range with defaults for missing values
   * @param startDateParam Start date parameter
   * @param endDateParam End date parameter
   * @param defaultDaysBack Number of days to go back for default start date
   * @returns Object with start and end dates
   */
  protected getDateRange(
    startDateParam?: any, 
    endDateParam?: any,
    defaultDaysBack: number = 30
  ): { startDate: Date; endDate: Date } {
    const endDate = this.parseDateParam(endDateParam) || new Date();
    
    let startDate: Date;
    if (startDateParam) {
      startDate = this.parseDateParam(startDateParam) || new Date();
    } else {
      // Default to N days ago if not provided
      startDate = new Date();
      startDate.setDate(startDate.getDate() - defaultDaysBack);
    }
    
    return { startDate, endDate };
  }

  /**
   * Process query parameters in a standardized way
   * @param queryParams Raw query parameters from controller
   * @param config Configuration for parameter processing
   * @returns Processed parameters object
   */
  protected processQueryParams<T = any>(
    queryParams: any,
    config: {
      stringParams?: string[]; // Simple string parameters
      commaSeparatedParams?: string[]; // Parameters that should be parsed as arrays
      dateParams?: string[]; // Date parameters
      numericParams?: Array<{ name: string; defaultValue?: number }>; // Numeric parameters
      dateRanges?: Array<{ 
        startParam: string; 
        endParam: string; 
        resultKey: string;
        defaultDaysBack?: number 
      }>; // Date range pairs
      booleanParams?: Array<{ name: string; defaultValue?: boolean }>; // Boolean parameters
    }
  ): T {
    const result: any = {};
    
    // Process simple string parameters
    if (config.stringParams) {
      for (const param of config.stringParams) {
        if (queryParams[param] !== undefined) {
          result[param] = String(queryParams[param]);
        }
      }
    }
    
    // Process comma-separated parameters
    if (config.commaSeparatedParams) {
      for (const param of config.commaSeparatedParams) {
        const parsedValue = this.parseCommaSeparatedParam(queryParams[param]);
        if (parsedValue) {
          result[param] = parsedValue;
        }
      }
    }
    
    // Process date parameters
    if (config.dateParams) {
      for (const param of config.dateParams) {
        const parsedDate = this.parseDateParam(queryParams[param]);
        if (parsedDate) {
          result[param] = parsedDate;
        }
      }
    }
    
    // Process numeric parameters
    if (config.numericParams) {
      for (const { name, defaultValue } of config.numericParams) {
        result[name] = this.parseNumericParam(queryParams[name], defaultValue);
      }
    }
    
    // Process date ranges
    if (config.dateRanges) {
      for (const { startParam, endParam, resultKey, defaultDaysBack } of config.dateRanges) {
        const range = this.getDateRange(
          queryParams[startParam],
          queryParams[endParam],
          defaultDaysBack
        );
        result[resultKey] = range;
      }
    }
    
    // Process boolean parameters
    if (config.booleanParams) {
      for (const { name, defaultValue } of config.booleanParams) {
        if (queryParams[name] !== undefined) {
          if (typeof queryParams[name] === 'boolean') {
            result[name] = queryParams[name];
          } else if (typeof queryParams[name] === 'string') {
            const value = queryParams[name].toLowerCase();
            if (value === 'true' || value === '1' || value === 'yes') {
              result[name] = true;
            } else if (value === 'false' || value === '0' || value === 'no') {
              result[name] = false;
            } else {
              result[name] = defaultValue;
            }
          } else {
            result[name] = Boolean(queryParams[name]);
          }
        } else if (defaultValue !== undefined) {
          result[name] = defaultValue;
        }
      }
    }
    
    return result as T;
  }

  /**
   * Parse geographic coordinates from query parameters
   * @param latParam Latitude parameter
   * @param lngParam Longitude parameter
   * @returns Parsed coordinates or null if invalid
   */
  protected parseCoordinates(latParam: any, lngParam: any): [number, number] | null {
    const lat = this.parseNumericParam(latParam);
    const lng = this.parseNumericParam(lngParam);
    
    if (lat === undefined || lng === undefined) {
      return null;
    }
    
    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      this.logger.debug(`Invalid coordinates: [${lat}, ${lng}]`);
      return null;
    }
    
    return [lat, lng];
  }

  /**
   * Create a paginated response with standardized format
   * @param data Array of data items
   * @param total Total count of items
   * @param page Current page number
   * @param limit Items per page
   * @returns Formatted paginated response
   */
  protected formatPaginatedResponse<D>(
    data: D[],
    total: number,
    page: number = 1,
    limit: number = 10
  ): {
    data: D[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  } {
    const pages = Math.ceil(total / limit) || 1;
    
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  /**
   * Format a standardized API response
   * @param data Response data
   * @param message Optional message
   * @returns Formatted API response
   */
  protected formatApiResponse<D>(
    data: D,
    message?: string
  ): {
    success: boolean;
    data: D;
    message?: string;
  } {
    return {
      success: true,
      data,
      ...(message && { message })
    };
  }

  /**
   * Format an error response
   * @param message Error message
   * @param error Optional error details
   * @returns Formatted error response
   */
  protected formatErrorResponse(
    message: string,
    error?: any
  ): {
    success: boolean;
    message: string;
    error?: any;
  } {
    return {
      success: false,
      message,
      ...(error && { error })
    };
  }

  /**
   * Process pagination parameters from query
   * @param queryParams Raw query parameters
   * @param defaultLimit Default items per page
   * @returns Processed pagination parameters
   */
  protected processPaginationParams(
    queryParams: any,
    defaultLimit: number = 10
  ): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(1, this.parseNumericParam(queryParams.page, 1) || 1);
    const limit = this.parseNumericParam(queryParams.limit, defaultLimit) || defaultLimit;
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
  }

  /**
   * Find entities with pagination
   * @param filter Filter criteria
   * @param paginationParams Pagination parameters
   * @param options Query options
   * @returns Paginated results
   */
  async findWithPagination(
    filter: FilterQuery<T> = {},
    paginationParams: { page: number; limit: number; skip: number },
    options: QueryOptions = {}
  ): Promise<{
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const { page, limit, skip } = paginationParams;
    
    this.logger.debug(`Finding ${this.entityName}s with pagination (page ${page}, limit ${limit})`);
    
    const [data, total] = await Promise.all([
      this.repository.findAll(
        filter,
        { ...options, skip, limit }
      ),
      this.repository.count(filter)
    ]);
    
    return this.formatPaginatedResponse(data, total, page, limit);
  }

  /**
   * Process an API query with pagination and standard formatting
   * @param queryParams Raw query parameters
   * @param buildFilterFn Function to build filter from processed params
   * @param options Additional query options
   * @returns Formatted paginated API response
   */
  protected async processApiQuery<P = any>(
    queryParams: any,
    buildFilterFn: (processedParams: P) => FilterQuery<T>,
    options: {
      paramConfig?: Parameters<typeof this.processQueryParams>[1];
      defaultLimit?: number;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    success: boolean;
    data: {
      data: T[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    };
  }> {
    try {
      // Process parameters
      const processedParams = this.processQueryParams<P>(
        queryParams,
        options.paramConfig || {}
      );
      
      // Process pagination parameters
      const paginationParams = this.processPaginationParams(
        queryParams,
        options.defaultLimit
      );
      
      // Build filter criteria
      const filter = buildFilterFn(processedParams);
      
      // Build query options
      const queryOptions: QueryOptions = {};
      
      // Add sorting if specified
      if (options.sortField) {
        const sortDirection = options.sortDirection === 'desc' ? -1 : 1;
        queryOptions.sort = { [options.sortField]: sortDirection };
      }
      
      // Execute query with pagination
      const result = await this.findWithPagination(
        filter,
        paginationParams,
        queryOptions
      );
      
      // Return formatted response
      return this.formatApiResponse(result);
    } catch (error) {
      this.logger.error(`Error processing API query: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Format a date into user-friendly strings
   * @param date The date to format (Date object or ISO string)
   * @returns Object with different formatted date strings
   */
  protected formatDate(date: Date | string | null | undefined): {
    formattedDate: string | null;
    formattedTime: string | null;
    displayDate: string | null;
  } {
    if (!date) {
      return {
        formattedDate: null,
        formattedTime: null,
        displayDate: null
      };
    }

    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return {
        formattedDate: null,
        formattedTime: null,
        displayDate: null
      };
    }

    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      formattedDate,
      formattedTime,
      displayDate: `${formattedDate} at ${formattedTime}`
    };
  }

  /**
   * Enhance entities with frontend-friendly formatted dates
   * Applies to any entity with a 'date' field
   * @param entities Single entity or array of entities
   * @param dateField The field name containing the date (default: 'date')
   * @returns Entity or entities with added formatted date fields
   */
  protected addFormattedDates<E extends Record<string, any>>(
    entities: E | E[],
    dateField: string = 'date'
  ): any {
    if (!entities) return entities;

    const formatEntity = (entity: E) => {
      if (!entity) return null;
      
      // Convert Mongoose document to plain object if needed
      const plainEntity = entity.toJSON ? entity.toJSON() : entity;
      
      const dateValue = plainEntity[dateField];
      if (!dateValue) return plainEntity;

      const { formattedDate, formattedTime, displayDate } = this.formatDate(dateValue);
      
      return {
        ...plainEntity,
        formattedDate,
        formattedTime,
        displayDate
      };
    };

    if (Array.isArray(entities)) {
      return entities.map(formatEntity);
    }
    
    return formatEntity(entities);
  }

  /**
   * Extract user ID from request object
   * @param request Express request object
   * @returns User ID from JWT payload
   */
  getUserIdFromRequest(request: Request): string {
    const user = request.user as any;
    if (!user || !user.userId) {
      throw ExceptionFactory.unauthorized('User identity not found in request');
    }
    return user.userId;
  }

  /**
   * Validate that a user owns an entity
   * @param entity Entity with userId property
   * @param userId User ID to check ownership against
   * @param entityType Optional entity type name for logging (defaults to this.entityName)
   * @param entityId Optional entity ID for logging
   */
  protected validateEntityOwnership<T extends { userId: string }>(
    entity: T,
    userId: string,
    entityType?: string,
    entityId?: string
  ): void {
    const type = entityType || this.entityName;
    
    if (entity.userId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to access ${type}${entityId ? ` ${entityId}` : ''} belonging to user ${entity.userId}`
      );
      throw ExceptionFactory.forbidden(`You do not have permission to access this ${type.toLowerCase()}`);
    }
  }
} 