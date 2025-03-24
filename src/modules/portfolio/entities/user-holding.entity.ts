import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/entities/user.entity';

@Schema()
class StockHolding {
  @Prop({ type: String, required: true })
  stockSymbol: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  purchasePrice: number;
}

@Schema({ timestamps: true })
export class UserHolding {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true,
    index: true
  })
  userId: User | MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: StockHolding }], default: [] })
  stocks: StockHolding[];
}

export type UserHoldingDocument = UserHolding & Document;
export const UserHoldingSchema = SchemaFactory.createForClass(UserHolding); 