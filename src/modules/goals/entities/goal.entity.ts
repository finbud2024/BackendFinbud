import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type GoalDocument = Goal & Document;

@Schema({ timestamps: true })
export class Goal {
  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User',
    required: true
  })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  targetAmount: number;

  @Prop({ default: 0 })
  currentAmount: number;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ default: false })
  isAchieved: boolean;

  @Prop({ required: true, trim: true })
  category: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);

// Add index on userId for faster queries
GoalSchema.index({ userId: 1 });

// Add index on category for potential filtering
GoalSchema.index({ category: 1 });

// Add compound index for userId and isAchieved for efficient queries of achieved/not achieved goals
GoalSchema.index({ userId: 1, isAchieved: 1 });

// Add compound index for userId and endDate for deadline-based queries
GoalSchema.index({ userId: 1, endDate: 1 }); 