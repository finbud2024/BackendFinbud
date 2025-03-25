import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { BaseService } from '../../common/base/base.service';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { UserHoldingRepository } from './repositories/user-holding.repository';
import { Portfolio, PortfolioDocument } from './entities/portfolio.entity';
import { UserHolding, UserHoldingDocument } from './entities/user-holding.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CreateUserHoldingDto } from './dto/create-user-holding.dto';
import { AddPortfolioEntryDto } from './dto/add-portfolio-entry.dto';
import { UpdateStockHoldingDto } from './dto/update-stock-holding.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PortfolioService extends BaseService<PortfolioDocument> {
  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly userHoldingRepository: UserHoldingRepository,
    @InjectModel(Portfolio.name) private readonly portfolioModel: Model<PortfolioDocument>,
    @InjectModel(UserHolding.name) private readonly userHoldingModel: Model<UserHoldingDocument>
  ) {
    super(portfolioRepository, 'Portfolio');
  }

  /**
   * Create a new portfolio for a user
   */
  async createPortfolio(createPortfolioDto: CreatePortfolioDto): Promise<PortfolioDocument> {
    this.logger.log(`Creating portfolio for user: ${createPortfolioDto.userId}`);
    
    try {
      // Check if portfolio already exists for this user
      const existingPortfolio = await this.portfolioRepository.findPortfolioByUserId(createPortfolioDto.userId);
      if (existingPortfolio) {
        throw new HttpException('Portfolio already exists for this user', HttpStatus.CONFLICT);
      }
      
      return this.create(createPortfolioDto);
    } catch (error) {
      this.logger.error(`Error creating portfolio: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new portfolio for the current user
   */
  async createPortfolioForCurrentUser(request: Request, createPortfolioDto: CreatePortfolioDto): Promise<PortfolioDocument> {
    const userId = this.getUserIdFromRequest(request);
    
    // Set the userId from the authenticated user
    createPortfolioDto.userId = userId;
    
    return this.createPortfolio(createPortfolioDto);
  }

  /**
   * Create user holdings
   */
  async createUserHolding(createUserHoldingDto: CreateUserHoldingDto): Promise<UserHoldingDocument> {
    this.logger.log(`Creating holdings for user: ${createUserHoldingDto.userId}`);
    
    try {
      // Check if holdings already exist for this user
      const existingHoldings = await this.userHoldingRepository.findHoldingsByUserId(createUserHoldingDto.userId);
      if (existingHoldings) {
        throw new HttpException('Holdings already exist for this user', HttpStatus.CONFLICT);
      }
      
      const userHolding = new this.userHoldingModel(createUserHoldingDto);
      return userHolding.save();
    } catch (error) {
      this.logger.error(`Error creating user holdings: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create holdings for the current user
   */
  async createHoldingsForCurrentUser(request: Request, createUserHoldingDto: CreateUserHoldingDto): Promise<UserHoldingDocument> {
    const userId = this.getUserIdFromRequest(request);
    
    // Set the userId from the authenticated user
    createUserHoldingDto.userId = userId;
    
    return this.createUserHolding(createUserHoldingDto);
  }

  /**
   * Get a user's portfolio
   */
  async getUserPortfolio(userId: string): Promise<PortfolioDocument> {
    this.logger.log(`Getting portfolio for user: ${userId}`);
    
    const portfolio = await this.portfolioRepository.findPortfolioByUserId(userId);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found for user: ${userId}`);
    }
    
    return portfolio;
  }

  /**
   * Get the current user's portfolio
   */
  async getCurrentUserPortfolio(request: Request): Promise<PortfolioDocument> {
    const userId = this.getUserIdFromRequest(request);
    return this.getUserPortfolio(userId);
  }

  /**
   * Get a user's stock holdings
   */
  async getUserHoldings(userId: string): Promise<UserHoldingDocument> {
    this.logger.log(`Getting holdings for user: ${userId}`);
    
    const holdings = await this.userHoldingRepository.findHoldingsByUserId(userId);
    if (!holdings) {
      throw new NotFoundException(`Holdings not found for user: ${userId}`);
    }
    
    return holdings;
  }

  /**
   * Get the current user's holdings
   */
  async getCurrentUserHoldings(request: Request): Promise<UserHoldingDocument> {
    const userId = this.getUserIdFromRequest(request);
    return this.getUserHoldings(userId);
  }

  /**
   * Update a user's portfolio
   */
  async updatePortfolio(userId: string, updatePortfolioDto: UpdatePortfolioDto): Promise<PortfolioDocument> {
    this.logger.log(`Updating portfolio for user: ${userId}`);
    
    const portfolio = await this.portfolioRepository.findPortfolioByUserId(userId);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found for user: ${userId}`);
    }
    
    // Apply updates using base service
    return this.update(portfolio.id, updatePortfolioDto);
  }

  /**
   * Update the current user's portfolio
   */
  async updateCurrentUserPortfolio(request: Request, updatePortfolioDto: UpdatePortfolioDto): Promise<PortfolioDocument> {
    const userId = this.getUserIdFromRequest(request);
    return this.updatePortfolio(userId, updatePortfolioDto);
  }

  /**
   * Add a new entry to a portfolio's history
   */
  async addPortfolioEntry(userId: string, entryData: AddPortfolioEntryDto): Promise<PortfolioDocument> {
    this.logger.log(`Adding portfolio entry for user: ${userId}`);
    
    const updatedPortfolio = await this.portfolioRepository.addPortfolioEntry(userId, entryData);
    
    if (!updatedPortfolio) {
      throw new NotFoundException(`Portfolio not found for user: ${userId}`);
    }
    
    return updatedPortfolio;
  }

  /**
   * Add an entry to the current user's portfolio
   */
  async addCurrentUserPortfolioEntry(request: Request, entryData: AddPortfolioEntryDto): Promise<PortfolioDocument> {
    const userId = this.getUserIdFromRequest(request);
    return this.addPortfolioEntry(userId, entryData);
  }

  /**
   * Update a user's stock holdings
   */
  async updateStockHolding(
    userId: string, 
    stockSymbol: string, 
    updateData: UpdateStockHoldingDto
  ): Promise<UserHoldingDocument> {
    this.logger.log(`Updating stock holding for user: ${userId}, symbol: ${stockSymbol}`);
    
    const updatedHoldings = await this.userHoldingRepository.updateStockHolding(
      userId, 
      stockSymbol, 
      updateData
    );
    
    if (!updatedHoldings) {
      throw new NotFoundException(`Holdings not found for user: ${userId}`);
    }
    
    // Calculate and update portfolio value after stock update
    await this.updatePortfolioValue(userId);
    
    return updatedHoldings;
  }

  /**
   * Update a stock holding for the current user
   */
  async updateCurrentUserStockHolding(
    request: Request, 
    stockSymbol: string, 
    updateData: UpdateStockHoldingDto
  ): Promise<UserHoldingDocument> {
    const userId = this.getUserIdFromRequest(request);
    return this.updateStockHolding(userId, stockSymbol, updateData);
  }

  /**
   * Remove a stock from a user's holdings
   */
  async removeStockHolding(userId: string, stockSymbol: string): Promise<UserHoldingDocument> {
    this.logger.log(`Removing stock holding for user: ${userId}, symbol: ${stockSymbol}`);
    
    const updatedHoldings = await this.userHoldingRepository.removeStockHolding(userId, stockSymbol);
    
    if (!updatedHoldings) {
      throw new NotFoundException(`Holdings not found for user: ${userId}`);
    }
    
    // Calculate and update portfolio value after stock removal
    await this.updatePortfolioValue(userId);
    
    return updatedHoldings;
  }

  /**
   * Remove a stock holding for the current user
   */
  async removeCurrentUserStockHolding(request: Request, stockSymbol: string): Promise<UserHoldingDocument> {
    const userId = this.getUserIdFromRequest(request);
    return this.removeStockHolding(userId, stockSymbol);
  }

  /**
   * Calculate and update current portfolio value
   */
  async updatePortfolioValue(userId: string): Promise<PortfolioDocument> {
    this.logger.log(`Updating portfolio value for user: ${userId}`);
    
    try {
      // Calculate total holdings value
      const totalValue = await this.userHoldingRepository.calculateTotalHoldingsValue(userId);
      
      // Add new entry to portfolio history with current date and calculated value
      const entryData: AddPortfolioEntryDto = {
        date: new Date(),
        totalValue
      };
      
      return this.addPortfolioEntry(userId, entryData);
    } catch (error) {
      this.logger.error(`Error updating portfolio value: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get portfolio history within a date range
   */
  async getPortfolioHistory(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ date: Date; totalValue: number }[]> {
    this.logger.log(`Getting portfolio history for user: ${userId} from ${startDate} to ${endDate}`);
    
    // Check if portfolio exists
    const portfolio = await this.portfolioRepository.findPortfolioByUserId(userId);
    if (!portfolio) {
      throw new NotFoundException(`Portfolio not found for user: ${userId}`);
    }
    
    return this.portfolioRepository.getPortfolioHistory(userId, startDate, endDate);
  }

  /**
   * Get portfolio history for the current user
   */
  async getCurrentUserPortfolioHistory(
    request: Request,
    startDate: Date,
    endDate: Date
  ): Promise<{ date: Date; totalValue: number }[]> {
    const userId = this.getUserIdFromRequest(request);
    return this.getPortfolioHistory(userId, startDate, endDate);
  }

  /**
   * Initialize portfolio and holdings for a new user
   * This would typically be called when a new user is created
   */
  async initializeUserPortfolio(userId: string): Promise<{ portfolio: PortfolioDocument; holdings: UserHoldingDocument }> {
    this.logger.log(`Initializing portfolio and holdings for user: ${userId}`);
    
    try {
      // Check if portfolio already exists
      let portfolio = await this.portfolioRepository.findPortfolioByUserId(userId);
      
      // Create portfolio if it doesn't exist
      if (!portfolio) {
        const portfolioDto: CreatePortfolioDto = {
          userId,
          portfolio: [{
            date: new Date(),
            totalValue: 0
          }]
        };
        
        portfolio = await this.portfolioModel.create(portfolioDto);
        this.logger.log(`Created new portfolio for user: ${userId}`);
      } else {
        this.logger.log(`Using existing portfolio for user: ${userId}`);
      }
      
      // Check if holdings exist
      let holdings = await this.userHoldingRepository.findHoldingsByUserId(userId);
      
      // Create holdings if they don't exist
      if (!holdings) {
        const holdingDto: CreateUserHoldingDto = {
          userId,
          stocks: []
        };
        
        holdings = await this.userHoldingModel.create(holdingDto);
        this.logger.log(`Created new holdings for user: ${userId}`);
      } else {
        this.logger.log(`Using existing holdings for user: ${userId}`);
      }
      
      return { portfolio, holdings };
    } catch (error) {
      this.logger.error(`Error initializing portfolio: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Initialize portfolio for the current user
   */
  async initializeCurrentUserPortfolio(request: Request): Promise<{ portfolio: PortfolioDocument; holdings: UserHoldingDocument }> {
    const userId = this.getUserIdFromRequest(request);
    return this.initializeUserPortfolio(userId);
  }
} 