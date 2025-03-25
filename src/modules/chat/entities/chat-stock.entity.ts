import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ChatStockDocument = ChatStock & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
})
export class ChatStock {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  })
  userId: MongooseSchema.Types.ObjectId;
  
  @Prop({ required: true })
  prompt: string;
  
  @Prop({ default: '' })
  response: string;
  
  @Prop({ 
    default: Date.now,
    index: true 
  })
  createdAt: Date;
}

export const ChatStockSchema = SchemaFactory.createForClass(ChatStock);

// Create a compound index on userId + createdAt for finding today's responses
ChatStockSchema.index({ userId: 1, createdAt: -1 });

// Define a virtual property for the MongoDB _id field
ChatStockSchema.virtual('id').get(function() {
  return this._id.toHexString();
}); 