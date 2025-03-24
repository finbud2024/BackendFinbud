import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Logger,
  ParseUUIDPipe,
  BadRequestException,
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { UserRole } from '../../common/decorators/user-role.decorator';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CreateUserHoldingDto } from './dto/create-user-holding.dto';
import { UpdateUserHoldingDto } from './dto/update-user-holding.dto';
import { AddPortfolioEntryDto } from './dto/add-portfolio-entry.dto';
import { UpdateStockHoldingDto } from './dto/update-stock-holding.dto';
import { Request } from 'express';
import { ExceptionFactory } from '../../common/exceptions/app.exception';

// DTO for date range query params
class DateRangeDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;
}

@Controller('portfolios')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  private readonly logger = new Logger(PortfolioController.name);

  constructor(private readonly portfolioService: PortfolioService) {}

  // =============== FRONTEND-FRIENDLY ROUTES (USER'S OWN PORTFOLIO) ===============

  // GET /portfolios/me - Get current user's portfolio
  @Get('me')
  async getMyPortfolio(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Getting portfolio for current user: ${userId}`);
    return this.portfolioService.getUserPortfolio(userId);
  }

  // GET /portfolios/me/history - Get current user's portfolio history
  @Get('me/history')
  async getMyPortfolioHistory(
    @Query() dateRange: DateRangeDto,
    @Req() request: Request
  ) {
    const userId = this.getUserIdFromRequest(request);
    const startDate = dateRange.startDate || new Date(0); // Default to beginning of epoch
    const endDate = dateRange.endDate || new Date(); // Default to current date
    
    this.logger.log(`Getting portfolio history for current user: ${userId} from ${startDate} to ${endDate}`);
    return this.portfolioService.getPortfolioHistory(userId, startDate, endDate);
  }

  // GET /portfolios/me/holdings - Get current user's stock holdings
  @Get('me/holdings')
  async getMyHoldings(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Getting holdings for current user: ${userId}`);
    return this.portfolioService.getUserHoldings(userId);
  }

  // POST /portfolios/me - Create portfolio for current user
  @Post('me')
  async createMyPortfolio(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Req() request: Request
  ) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Creating portfolio for current user: ${userId}`);
    
    // Set the userId from the authenticated user
    createPortfolioDto.userId = userId;
    
    return this.portfolioService.createPortfolio(createPortfolioDto);
  }

  // POST /portfolios/me/holdings - Create holdings for current user
  @Post('me/holdings')
  async createMyHoldings(
    @Body() createUserHoldingDto: CreateUserHoldingDto,
    @Req() request: Request
  ) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Creating holdings for current user: ${userId}`);
    
    // Set the userId from the authenticated user
    createUserHoldingDto.userId = userId;
    
    return this.portfolioService.createUserHolding(createUserHoldingDto);
  }

  // POST /portfolios/me/entries - Add entry to current user's portfolio
  @Post('me/entries')
  async addMyPortfolioEntry(
    @Body() entryData: AddPortfolioEntryDto,
    @Req() request: Request
  ) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Adding portfolio entry for current user: ${userId}`);
    return this.portfolioService.addPortfolioEntry(userId, entryData);
  }

  // PUT /portfolios/me - Update current user's portfolio
  @Put('me')
  async updateMyPortfolio(
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Req() request: Request
  ) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Updating portfolio for current user: ${userId}`);
    return this.portfolioService.updatePortfolio(userId, updatePortfolioDto);
  }

  // PUT /portfolios/me/holdings/:symbol - Update a stock holding for current user
  @Put('me/holdings/:symbol')
  async updateMyStockHolding(
    @Param('symbol') symbol: string,
    @Body() updateData: UpdateStockHoldingDto,
    @Req() request: Request
  ) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Updating stock holding for current user: ${userId}, symbol: ${symbol}`);
    return this.portfolioService.updateStockHolding(userId, symbol, updateData);
  }

  // DELETE /portfolios/me/holdings/:symbol - Remove a stock from current user's holdings
  @Delete('me/holdings/:symbol')
  async removeMyStockHolding(
    @Param('symbol') symbol: string,
    @Req() request: Request
  ) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Removing stock holding for current user: ${userId}, symbol: ${symbol}`);
    return this.portfolioService.removeStockHolding(userId, symbol);
  }

  // POST /portfolios/me/initialize - Initialize portfolio for current user
  @Post('me/initialize')
  async initializeMyPortfolio(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    this.logger.log(`Initializing portfolio and holdings for current user: ${userId}`);
    return this.portfolioService.initializeUserPortfolio(userId);
  }

  // =============== ADMIN-ONLY ROUTES ===============

  // GET /portfolios - Get all portfolios (admin only)
  @UseGuards(AdminGuard)
  @Get()
  async getAllPortfolios() {
    this.logger.log('Admin: Getting all portfolios');
    return this.portfolioService.findAll();
  }

  // GET /portfolios/:userId - Get a specific user's portfolio (admin only)
  @UseGuards(AdminGuard)
  @Get(':userId')
  async getUserPortfolio(@Param('userId') userId: string) {
    this.logger.log(`Admin: Getting portfolio for user: ${userId}`);
    return this.portfolioService.getUserPortfolio(userId);
  }

  // GET /portfolios/:userId/history - Get a user's portfolio history (admin only)
  @UseGuards(AdminGuard)
  @Get(':userId/history')
  async getPortfolioHistory(
    @Param('userId') userId: string,
    @Query() dateRange: DateRangeDto
  ) {
    const startDate = dateRange.startDate || new Date(0);
    const endDate = dateRange.endDate || new Date();
    
    this.logger.log(`Admin: Getting portfolio history for user: ${userId} from ${startDate} to ${endDate}`);
    return this.portfolioService.getPortfolioHistory(userId, startDate, endDate);
  }

  // GET /portfolios/:userId/holdings - Get a user's holdings (admin only)
  @UseGuards(AdminGuard)
  @Get(':userId/holdings')
  async getUserHoldings(@Param('userId') userId: string) {
    this.logger.log(`Admin: Getting holdings for user: ${userId}`);
    return this.portfolioService.getUserHoldings(userId);
  }

  // POST /portfolios - Create a portfolio for a user (admin only)
  @UseGuards(AdminGuard)
  @Post()
  async createPortfolio(@Body() createPortfolioDto: CreatePortfolioDto) {
    this.logger.log(`Admin: Creating portfolio for user: ${createPortfolioDto.userId}`);
    return this.portfolioService.createPortfolio(createPortfolioDto);
  }

  // PUT /portfolios/:userId - Update a user's portfolio (admin only)
  @UseGuards(AdminGuard)
  @Put(':userId')
  async updatePortfolio(
    @Param('userId') userId: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto
  ) {
    this.logger.log(`Admin: Updating portfolio for user: ${userId}`);
    return this.portfolioService.updatePortfolio(userId, updatePortfolioDto);
  }

  // POST /portfolios/:userId/initialize - Initialize portfolio for a user (admin only)
  @UseGuards(AdminGuard)
  @Post(':userId/initialize')
  async initializeUserPortfolio(@Param('userId') userId: string) {
    this.logger.log(`Admin: Initializing portfolio and holdings for user: ${userId}`);
    return this.portfolioService.initializeUserPortfolio(userId);
  }

  // Private helper method to get current user ID from request
  private getUserIdFromRequest(request: Request): string {
    const user = request.user as any;
    if (!user || !user.userId) {
      this.logger.error('User not found in request or missing userId');
      throw ExceptionFactory.unauthorized('User identity not found in request');
    }
    return user.userId;
  }
} 