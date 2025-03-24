import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CryptoDocument = Crypto & Document;

@Schema({ timestamps: true })
export class Crypto {
  @Prop({ required: true })
  cryptoName: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  open: number;

  @Prop()
  low: number;

  @Prop()
  high: number;

  @Prop({ required: true })
  close: number;

  @Prop()
  change: number;

  @Prop()
  volume: number;

  @Prop({ required: true, type: Date })
  date: Date;
}

export const CryptoSchema = SchemaFactory.createForClass(Crypto);

// Add index on symbol for faster lookups
CryptoSchema.index({ symbol: 1 });

// Add compound index on symbol and date for efficient queries
CryptoSchema.index({ symbol: 1, date: 1 }, { unique: true });

// Add index on date for time-based queries
CryptoSchema.index({ date: -1 }); 