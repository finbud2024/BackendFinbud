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

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  // Frontend-friendly endpoints (user's own goals)
  
  @Post()
  async create(
    @Body() createGoalDto: CreateGoalDto,
    @Req() request: Request,
  ): Promise<GoalDocument> {
    // Get the userId from request
    const userId = this.getUserIdFromRequest(request);
    
    // Set the userId from the authenticated user
    createGoalDto.userId = userId;
    
    return this.goalsService.create(createGoalDto);
  }

  @Get('me')
  async findAllMy(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    return this.goalsService.findAllForUser(userId);
  }

  @Get('me/achieved')
  async findMyAchieved(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    return this.goalsService.findByAchievementStatus(userId, true);
  }

  @Get('me/in-progress')
  async findMyInProgress(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    return this.goalsService.findByAchievementStatus(userId, false);
  }

  @Get('me/upcoming')
  async findMyUpcoming(
    @Req() request: Request,
    @Query('days') days: number = 30
  ) {
    const userId = this.getUserIdFromRequest(request);
    return this.goalsService.findUpcomingDeadlines(userId, Number(days));
  }

  @Get('me/:id')
  async findMyGoal(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const userId = this.getUserIdFromRequest(request);
    return this.goalsService.findUserGoal(id, userId);
  }

  @Patch('me/:id')
  async updateMyGoal(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Req() request: Request,
  ) {
    const userId = this.getUserIdFromRequest(request);
    
    // Verify the goal exists and belongs to the user
    await this.goalsService.findUserGoal(id, userId);
    
    // Prevent changing userId
    delete updateGoalDto.userId;
    
    // Update the goal
    return this.goalsService.update(id, updateGoalDto);
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
    
    const userId = this.getUserIdFromRequest(request);
    
    // Verify the goal exists and belongs to the user
    await this.goalsService.findUserGoal(id, userId);
    
    // Update the goal progress
    return this.goalsService.updateProgress(id, body.currentAmount);
  }

  @Delete('me/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMyGoal(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const userId = this.getUserIdFromRequest(request);
    
    // Verify the goal exists and belongs to the user
    await this.goalsService.findUserGoal(id, userId);
    
    // Remove the goal
    await this.goalsService.remove(id);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async removeAllMyGoals(@Req() request: Request) {
    const userId = this.getUserIdFromRequest(request);
    const count = await this.goalsService.removeMany({ userId });
    return { message: `Successfully deleted ${count} goals` };
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

  // Helper method to get the user ID from the request object
  private getUserIdFromRequest(request: Request): string {
    const user = request.user as any;
    if (!user || !user.userId) {
      throw ExceptionFactory.unauthorized('User identity not found in request');
    }
    return user.userId;
  }
} 