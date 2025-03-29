import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ScrapeJobDocument = ScrapeJob & Document;

/**
 * Status of a scraping job
 */
export enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

/**
 * Type of scraping operation
 */
export enum ScrapeType {
  INVESTORS = 'investors',
  MARKET_VALUES = 'market_values',
  HOLDINGS = 'holdings',
  PORTFOLIO_HISTORY = 'portfolio_history',
  ALL = 'all'
}

@Schema({
  collection: 'scrapeJobs',
  timestamps: true
})
export class ScrapeJob {
  @Prop({ required: true, enum: ScrapeType })
  type: ScrapeType;

  @Prop({ required: true, enum: JobStatus, default: JobStatus.QUEUED })
  status: JobStatus;

  @Prop({ type: Date, default: null })
  startTime: Date;

  @Prop({ type: Date, default: null })
  endTime: Date;

  @Prop({ default: 0 })
  totalItems: number;

  @Prop({ default: 0 })
  processedItems: number;

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: 0 })
  errorCount: number;

  @Prop({ type: Object, default: {} })
  params: Record<string, any>;

  @Prop({ type: [String], default: [] })
  errors: string[];

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  batchSize: number;

  @Prop()
  batchDelay: number;

  @Prop({ type: Boolean, default: false })
  isManualTrigger: boolean;

  @Prop()
  lastProcessedId: string;
}

export const ScrapeJobSchema = SchemaFactory.createForClass(ScrapeJob);

// Add indexes for better query performance
ScrapeJobSchema.index({ status: 1 });
ScrapeJobSchema.index({ type: 1 });
ScrapeJobSchema.index({ createdAt: -1 });
ScrapeJobSchema.index({ createdBy: 1 }); 