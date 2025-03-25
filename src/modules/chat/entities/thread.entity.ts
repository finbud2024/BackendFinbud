import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ThreadDocument = Thread & Document;

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
export class Thread {
  @Prop({ default: 'New Chat' })
  title: string;
  
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  })
  userId: MongooseSchema.Types.ObjectId;
  
  @Prop({ 
    default: Date.now,
  })
  creationDate: Date;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);

// Add index on creationDate for sorting (newest first)
ThreadSchema.index({ creationDate: -1 });

// Create a compound index on userId + creationDate
ThreadSchema.index({ userId: 1, creationDate: -1 });

// Define a virtual property for the MongoDB _id field
ThreadSchema.virtual('id').get(function() {
  return this._id.toHexString();
}); 