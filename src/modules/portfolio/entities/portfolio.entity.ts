import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/entities/user.entity';

@Schema()
class PortfolioEntry {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  totalValue: number;
}

@Schema({ timestamps: true })
export class Portfolio {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true,
    index: true
  })
  userId: User | MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: PortfolioEntry }], default: [] })
  portfolio: PortfolioEntry[];
}

export type PortfolioDocument = Portfolio & Document;
export const PortfolioSchema = SchemaFactory.createForClass(Portfolio); 