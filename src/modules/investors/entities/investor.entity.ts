import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvestorDocument = Investor & Document;

/**
 * Investor entity - maps to the 'investors' collection
 * Preserves the original schema structure from TopInvestors.js
 */
@Schema({
  collection: 'investors', // Map to the existing 'investors' collection
  timestamps: true
})
export class Investor {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  marketValue: string;

  @Prop({ required: true })
  positions: string;

  @Prop()
  holdingPeriod: string;

  @Prop({ type: [String], default: [] })
  stocks: string[];

  @Prop({ required: true })
  turnover: string;

  @Prop({ required: true })
  profileURL: string;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const InvestorSchema = SchemaFactory.createForClass(Investor);

// Add the original indexes to maintain query performance
InvestorSchema.index({ name: 1 });
InvestorSchema.index({ marketValue: -1 });
InvestorSchema.index({ positions: -1 }); 