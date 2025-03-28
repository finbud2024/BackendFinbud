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
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CreateUserHoldingDto } from './dto/create-user-holding.dto';
import { AddPortfolioEntryDto } from './dto/add-portfolio-entry.dto';
import { UpdateStockHoldingDto } from './dto/update-stock-holding.dto';
import { Request } from 'express';
import { BaseController } from '../../common/base/base.controller';

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
export class PortfolioController extends BaseController {
  constructor(private readonly portfolioService: PortfolioService) {
    super();
  }

  // GET /portfolios/me - Get current user's portfolio
  @Get('me')
  async getMyPortfolio(@Req() request: Request) {
    return this.portfolioService.getCurrentUserPortfolio(request);
  }

  // GET /portfolios/me/history - Get current user's portfolio history
  @Get('me/history')
  async getMyPortfolioHistory(
    @Query() dateRange: DateRangeDto,
    @Req() request: Request
  ) {
    const startDate = dateRange.startDate || new Date(0); // Default to beginning of epoch
    const endDate = dateRange.endDate || new Date(); // Default to current date
    return this.portfolioService.getCurrentUserPortfolioHistory(request, startDate, endDate);
  }

  // GET /portfolios/me/holdings - Get current user's stock holdings
  @Get('me/holdings')
  async getMyHoldings(@Req() request: Request) {
    return this.portfolioService.getCurrentUserHoldings(request);
  }

  // POST /portfolios/me - Create portfolio for current user
  @Post('me')
  async createMyPortfolio(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @Req() request: Request
  ) {
    return this.portfolioService.createPortfolioForCurrentUser(request, createPortfolioDto);
  }

  // POST /portfolios/me/holdings - Create holdings for current user
  @Post('me/holdings')
  async createMyHoldings(
    @Body() createUserHoldingDto: CreateUserHoldingDto,
    @Req() request: Request
  ) {
    return this.portfolioService.createHoldingsForCurrentUser(request, createUserHoldingDto);
  }

  // POST /portfolios/me/entries - Add entry to current user's portfolio
  @Post('me/entries')
  async addMyPortfolioEntry(
    @Body() entryData: AddPortfolioEntryDto,
    @Req() request: Request
  ) {
    return this.portfolioService.addCurrentUserPortfolioEntry(request, entryData);
  }

  // PUT /portfolios/me - Update current user's portfolio
  @Put('me')
  async updateMyPortfolio(
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @Req() request: Request
  ) {
    return this.portfolioService.updateCurrentUserPortfolio(request, updatePortfolioDto);
  }

  // PUT /portfolios/me/holdings/:symbol - Update a stock holding for current user
  @Put('me/holdings/:symbol')
  async updateMyStockHolding(
    @Param('symbol') symbol: string,
    @Body() updateData: UpdateStockHoldingDto,
    @Req() request: Request
  ) {
    return this.portfolioService.updateCurrentUserStockHolding(request, symbol, updateData);
  }

  // DELETE /portfolios/me/holdings/:symbol - Remove a stock from current user's holdings
  @Delete('me/holdings/:symbol')
  async removeMyStockHolding(
    @Param('symbol') symbol: string,
    @Req() request: Request
  ) {
    return this.portfolioService.removeCurrentUserStockHolding(request, symbol);
  }

  // POST /portfolios/me/initialize - Initialize portfolio for current user
  @Post('me/initialize')
  async initializeMyPortfolio(@Req() request: Request) {
    return this.portfolioService.initializeCurrentUserPortfolio(request);
  }

  // GET /portfolios - Get all portfolios (admin only)
  @UseGuards(AdminGuard)
  @Get()
  async getAllPortfolios() {
    return this.portfolioService.findAll();
  }

  // GET /portfolios/:userId - Get a specific user's portfolio (admin only)
  @UseGuards(AdminGuard)
  @Get(':userId')
  async getUserPortfolio(@Param('userId') userId: string) {
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
    return this.portfolioService.getPortfolioHistory(userId, startDate, endDate);
  }

  // GET /portfolios/:userId/holdings - Get a user's holdings (admin only)
  @UseGuards(AdminGuard)
  @Get(':userId/holdings')
  async getUserHoldings(@Param('userId') userId: string) {
    return this.portfolioService.getUserHoldings(userId);
  }

  // POST /portfolios - Create a portfolio for a user (admin only)
  @UseGuards(AdminGuard)
  @Post()
  async createPortfolio(@Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfolioService.createPortfolio(createPortfolioDto);
  }

  // PUT /portfolios/:userId - Update a user's portfolio (admin only)
  @UseGuards(AdminGuard)
  @Put(':userId')
  async updatePortfolio(
    @Param('userId') userId: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto
  ) {
    return this.portfolioService.updatePortfolio(userId, updatePortfolioDto);
  }

  // POST /portfolios/:userId/initialize - Initialize portfolio for a user (admin only)
  @UseGuards(AdminGuard)
  @Post(':userId/initialize')
  async initializeUserPortfolio(@Param('userId') userId: string) {
    return this.portfolioService.initializeUserPortfolio(userId);
  }
} 