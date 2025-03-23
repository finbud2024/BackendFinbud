import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ required: true, unique: true, index: true })
  token: string;
  
  @Prop({ required: true })
  userId: string;
  
  @Prop({ required: true, type: Date })
  expiresAt: Date;
}

export type TokenDocument = Token & Document;
export const TokenSchema = SchemaFactory.createForClass(Token);

// Add TTL index to automatically remove expired tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 