import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { GoalsRepository } from './repositories/goals.repository';
import { GoalDocument } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Types } from 'mongoose';
import { ExceptionFactory } from '../../common/exceptions/app.exception';
import { Request } from 'express';

@Injectable()
export class GoalsService extends BaseService<GoalDocument> {
  protected readonly logger = new Logger(GoalsService.name);

  constructor(private readonly goalsRepository: GoalsRepository) {
    super(goalsRepository, 'Goal');
  }

  /**
   * Find all goals for a specific user
   */
  async findAllForUser(userId: string): Promise<GoalDocument[]> {
    this.logger.log(`Finding all goals for user ${userId}`);
    return this.findAll(
      { userId: new Types.ObjectId(userId) },
      { sort: { endDate: 1 } } // Sort by end date ascending (closest deadline first)
    );
  }

  /**
   * Find all goals for the current user in the request
   */
  async findAllForCurrentUser(request: Request): Promise<GoalDocument[]> {
    const userId = this.getUserIdFromRequest(request);
    return this.findAllForUser(userId);
  }

  /**
   * Find goals by achievement status for a user
   */
  async findByAchievementStatus(userId: string, isAchieved: boolean): Promise<GoalDocument[]> {
    this.logger.log(`Finding ${isAchieved ? 'achieved' : 'not achieved'} goals for user ${userId}`);
    return this.goalsRepository.findByAchievementStatus(userId, isAchieved);
  }

  /**
   * Find goals by achievement status for the current user in the request
   */
  async findCurrentUserAchievementStatus(request: Request, isAchieved: boolean): Promise<GoalDocument[]> {
    const userId = this.getUserIdFromRequest(request);
    return this.findByAchievementStatus(userId, isAchieved);
  }

  /**
   * Find goals with approaching deadlines for a user
   */
  async findUpcomingDeadlines(userId: string, daysThreshold: number = 30): Promise<GoalDocument[]> {
    this.logger.log(`Finding goals with deadlines within ${daysThreshold} days for user ${userId}`);
    return this.goalsRepository.findUpcomingDeadlines(userId, daysThreshold);
  }

  /**
   * Find goals with approaching deadlines for the current user in the request
   */
  async findCurrentUserUpcomingDeadlines(request: Request, daysThreshold: number = 30): Promise<GoalDocument[]> {
    const userId = this.getUserIdFromRequest(request);
    return this.findUpcomingDeadlines(userId, daysThreshold);
  }

  /**
   * Create a goal with necessary validation
   */
  async create(createGoalDto: CreateGoalDto): Promise<GoalDocument> {
    this.logger.log(`Creating goal for user ${createGoalDto.userId}`);
    
    try {
      // Ensure userId is a MongoDB ObjectId
      if (typeof createGoalDto.userId === 'string') {
        createGoalDto.userId = new Types.ObjectId(createGoalDto.userId);
      }
      
      // Create the goal
      return super.create(createGoalDto);
    } catch (error) {
      this.logger.error(`Error creating goal: ${error.message}`);
      throw ExceptionFactory.goalCreateFailed(`Valid userId and required fields: ${error.message}`);
    }
  }

  /**
   * Create a goal for the current user in the request
   */
  async createForCurrentUser(request: Request, createGoalDto: CreateGoalDto): Promise<GoalDocument> {
    const userId = this.getUserIdFromRequest(request);
    createGoalDto.userId = userId;
    return this.create(createGoalDto);
  }

  /**
   * Update a goal's achievement status
   */
  async updateAchievementStatus(id: string, isAchieved: boolean): Promise<GoalDocument> {
    this.logger.log(`Updating achievement status to ${isAchieved} for goal ${id}`);
    return this.update(id, { isAchieved });
  }

  /**
   * Update a goal's progress (current amount)
   */
  async updateProgress(id: string, currentAmount: number): Promise<GoalDocument> {
    this.logger.log(`Updating progress to ${currentAmount} for goal ${id}`);
    
    // Find the goal to get target amount
    const goal = await this.findById(id);
    
    // Determine if goal is achieved based on amount
    const isAchieved = currentAmount >= goal.targetAmount;
    
    // Update both current amount and achievement status
    return this.update(id, { 
      currentAmount,
      isAchieved 
    });
  }

  /**
   * Update a goal for the current user
   */
  async updateCurrentUserGoal(request: Request, id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDocument> {
    const userId = this.getUserIdFromRequest(request);
    
    // Verify the goal exists and belongs to the user
    await this.findUserGoal(id, userId);
    
    // Prevent changing userId
    delete updateGoalDto.userId;
    
    // Update the goal
    return this.update(id, updateGoalDto);
  }

  /**
   * Update a goal's progress for the current user
   */
  async updateCurrentUserGoalProgress(request: Request, id: string, currentAmount: number): Promise<GoalDocument> {
    const userId = this.getUserIdFromRequest(request);
    
    // Verify the goal exists and belongs to the user
    await this.findUserGoal(id, userId);
    
    // Update the goal progress
    return this.updateProgress(id, currentAmount);
  }

  /**
   * Remove a goal for the current user
   */
  async removeCurrentUserGoal(request: Request, id: string): Promise<void> {
    const userId = this.getUserIdFromRequest(request);
    
    // Verify the goal exists and belongs to the user
    await this.findUserGoal(id, userId);
    
    // Remove the goal
    await this.remove(id);
  }

  /**
   * Remove all goals for the current user
   */
  async removeAllCurrentUserGoals(request: Request): Promise<{ message: string }> {
    const userId = this.getUserIdFromRequest(request);
    const count = await this.removeMany({ userId });
    return { message: `Successfully deleted ${count} goals` };
  }

  /**
   * Validate goal ownership and return the goal if valid
   * @param goalId The goal ID to check
   * @param userId The user ID to validate against
   * @returns The goal if ownership is valid
   * @throws Forbidden exception if user doesn't own the goal
   * @throws Not found exception if the goal doesn't exist
   */
  async validateOwnership(goalId: string, userId: string): Promise<GoalDocument> {
    // Get the goal
    const goal = await this.findById(goalId);
    
    // Check if goal exists (findById will throw if not found)
    
    // Check if user owns this goal
    if (goal.userId.toString() !== userId) {
      this.logger.warn(`User ${userId} attempted to access goal ${goalId} belonging to user ${goal.userId}`);
      throw ExceptionFactory.forbidden('User-specific resource');
    }
    
    return goal;
  }

  /**
   * Find a goal by ID for a specific user
   * This is an optimized version that combines findOne with ownership check
   * @param goalId The goal ID to find
   * @param userId The user ID to filter by
   * @returns The goal if found and owned by the user
   * @throws Not found exception if the goal doesn't exist or isn't owned by the user
   */
  async findUserGoal(goalId: string, userId: string): Promise<GoalDocument> {
    this.logger.log(`Finding goal ${goalId} for user ${userId}`);
    
    // Use repository to find with both conditions at once (more efficient than findById + check)
    const goal = await this.findOne({
      _id: this.toObjectId(goalId),
      userId: this.toObjectId(userId)
    });
    
    if (!goal) {
      // For security reasons, don't distinguish between "not found" and "not owned"
      this.logger.warn(`Goal ${goalId} not found or not owned by user ${userId}`);
      throw ExceptionFactory.goalNotFound(goalId);
    }
    
    return goal;
  }

  /**
   * Find a goal by ID for the current user in the request
   */
  async findCurrentUserGoal(request: Request, goalId: string): Promise<GoalDocument> {
    const userId = this.getUserIdFromRequest(request);
    return this.findUserGoal(goalId, userId);
  }
} 