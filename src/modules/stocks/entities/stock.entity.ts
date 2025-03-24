import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StockDocument = Stock & Document;

@Schema({ timestamps: true })
export class Stock {
  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  open: number;

  @Prop()
  high: number;

  @Prop()
  low: number;

  @Prop()
  close: number;

  @Prop()
  change: number;

  @Prop()
  volume: number;

  @Prop({ required: true, type: Date })
  date: Date;
}

export const StockSchema = SchemaFactory.createForClass(Stock);

// Add index on symbol for faster lookups
StockSchema.index({ symbol: 1 });

// Add compound index on symbol and date for efficient queries
StockSchema.index({ symbol: 1, date: 1 }, { unique: true });

// Add index on date for time-based queriesbackend
StockSchema.index({ date: -1 }); 