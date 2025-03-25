import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { GoalDocument } from './entities/goal.entity';
import { Request } from 'express';
import { ExceptionFactory } from '../../common/exceptions/app.exception';
import { BaseController } from '../../common/base/base.controller';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController extends BaseController {
  constructor(private readonly goalsService: GoalsService) {
    super();
  }

  // Frontend-friendly endpoints (user's own goals)
  
  @Post()
  async create(
    @Body() createGoalDto: CreateGoalDto,
    @Req() request: Request,
  ): Promise<GoalDocument> {
    return this.goalsService.createForCurrentUser(request, createGoalDto);
  }

  @Get('me')
  async findAllMy(@Req() request: Request) {
    return this.goalsService.findAllForCurrentUser(request);
  }

  @Get('me/achieved')
  async findMyAchieved(@Req() request: Request) {
    return this.goalsService.findCurrentUserAchievementStatus(request, true);
  }

  @Get('me/in-progress')
  async findMyInProgress(@Req() request: Request) {
    return this.goalsService.findCurrentUserAchievementStatus(request, false);
  }

  @Get('me/upcoming')
  async findMyUpcoming(
    @Req() request: Request,
    @Query('days') days: number = 30
  ) {
    return this.goalsService.findCurrentUserUpcomingDeadlines(request, Number(days));
  }

  @Get('me/:id')
  async findMyGoal(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.goalsService.findCurrentUserGoal(request, id);
  }

  @Patch('me/:id')
  async updateMyGoal(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Req() request: Request,
  ) {
    return this.goalsService.updateCurrentUserGoal(request, id, updateGoalDto);
  }

  @Patch('me/:id/progress')
  async updateMyGoalProgress(
    @Param('id') id: string,
    @Body() body: { currentAmount: number },
    @Req() request: Request,
  ) {
    if (body.currentAmount === undefined) {
      throw ExceptionFactory.invalidGoalData('currentAmount is required');
    }
    
    return this.goalsService.updateCurrentUserGoalProgress(request, id, body.currentAmount);
  }

  @Delete('me/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMyGoal(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    await this.goalsService.removeCurrentUserGoal(request, id);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async removeAllMyGoals(@Req() request: Request) {
    return this.goalsService.removeAllCurrentUserGoals(request);
  }

  // Admin-only endpoints

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.goalsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(AdminGuard)
  findAllForUser(@Param('userId') userId: string) {
    return this.goalsService.findAllForUser(userId);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.goalsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id') id: string, 
    @Body() updateGoalDto: UpdateGoalDto
  ) {
    return this.goalsService.update(id, updateGoalDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.goalsService.remove(id);
  }

  @Delete('user/:userId')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async removeAllForUser(@Param('userId') userId: string) {
    const count = await this.goalsService.removeMany({ userId });
    return { message: `Successfully deleted ${count} goals` };
  }
} 