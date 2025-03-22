import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  INCOME = 'receiving',
  EXPENSE = 'spending',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  balance: number;

  @Prop({ 
    type: Date, 
    default: () => new Date(),
    required: true
  })
  date: Date;

  @Prop({ 
    type: String, 
    enum: TransactionType,
    required: true
  })
  type: string;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User',
    required: true
  })
  userId: Types.ObjectId;

  /**
   * This method is not stored in the database, but can be used to determine
   * if a transaction is an income or expense based on the amount
   */
  static determineType(amount: number): TransactionType {
    return amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
  }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

// Add index on userId for faster queries
TransactionSchema.index({ userId: 1 });

// Add index on date for sorting
TransactionSchema.index({ date: 1 });

// Add compound index for userId and date for efficient user transaction queries sorted by date
TransactionSchema.index({ userId: 1, date: 1 }); 