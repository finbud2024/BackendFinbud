import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PortfolioDocument = Portfolio & Document;

/**
 * Portfolio Entity - Maps to the 'companyPortfolios' collection
 * Preserves the original schema structure from CompanyPortfolio.js
 */
@Schema({
  collection: 'companyPortfolios', // Map to the existing collection
  timestamps: true // Adds createdAt and updatedAt
})
export class Portfolio {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Investor',
    required: true 
  })
  investorId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  cusip: string;

  @Prop({ 
    type: Map, 
    of: String,
    required: true 
  })
  ownershipHistory: Map<string, string>;

  @Prop({ 
    type: Date, 
    default: Date.now 
  })
  scrapedAt: Date;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);

// Create a compound index for investorId and companyName to ensure uniqueness
PortfolioSchema.index({ 
  investorId: 1, 
  companyName: 1 
}, { unique: true }); 