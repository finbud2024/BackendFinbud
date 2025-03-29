import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MarketValueDocument = MarketValue & Document;

/**
 * Stock Holding Schema - Embedded in MarketValue
 */
@Schema({ _id: false })
export class StockHolding {
  @Prop({ required: true })
  Ticker: string;

  @Prop({ required: true })
  'Company Name': string;

  @Prop({ required: true })
  'Market Value': string;

  @Prop({ required: true })
  'Weight': string;

  @Prop({ required: true })
  'Shares': string;

  @Prop({ required: true })
  'Change': string;

  @Prop({ required: true })
  'Change in Shares': string;

  @Prop({ required: true })
  'Quarter End Price': string;

  @Prop({ required: true })
  'Percentage Owned': string;
}

export const StockHoldingSchema = SchemaFactory.createForClass(StockHolding);

/**
 * Market Value Entity - Maps to the 'investorData' collection
 * Preserves the original schema structure from MarketValue.js
 */
@Schema({
  collection: 'investorData', // Map to the existing 'investorData' collection
  timestamps: { createdAt: true, updatedAt: true }
})
export class MarketValue {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Investor',
    required: true 
  })
  investorId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  quarter: string;

  @Prop({ 
    type: Map, 
    of: String,
    default: new Map()
  })
  'Basic Stats': Map<string, string>;

  @Prop({ 
    type: Map, 
    of: String,
    default: new Map()
  })
  'Industry Breakdown': Map<string, string>;

  @Prop({ 
    type: [StockHoldingSchema], 
    default: [] 
  })
  marketValue: StockHolding[];

  @Prop({ 
    type: Date, 
    default: Date.now 
  })
  updatedAt: Date;
}

export const MarketValueSchema = SchemaFactory.createForClass(MarketValue);

// Add compound index to ensure uniqueness per investor and quarter
MarketValueSchema.index({ 
  investorId: 1, 
  quarter: 1 
}, { unique: true }); 