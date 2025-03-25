import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Define Source Schema
@Schema({ _id: false })
export class Source {
  @Prop()
  title: string;

  @Prop()
  link: string;

  @Prop()
  snippet?: string;

  @Prop()
  favicon?: string;

  @Prop()
  host?: string;

  @Prop()
  html?: string;
}

// Define Video Schema
@Schema({ _id: false })
export class Video {
  @Prop()
  title: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  link: string;
}

export type ChatDocument = Chat & Document;

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
export class Chat {
  @Prop({ required: true })
  prompt: string;

  @Prop({ type: [String], required: true })
  response: string[];

  @Prop({ type: [Source], default: [] })
  sources?: Source[];

  @Prop({ type: [Video], default: [] })
  videos?: Video[];

  @Prop({ type: [String], default: [] })
  followUpQuestions?: string[];

  @Prop({ 
    default: Date.now,
    index: true 
  })
  creationDate: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Thread',
    required: true,
    index: true
  })
  threadId: MongooseSchema.Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Create a text index on the prompt for searching
ChatSchema.index({ prompt: 'text' });

// Create a compound index on threadId + creationDate for efficient retrieval
ChatSchema.index({ threadId: 1, creationDate: -1 });

// Define a virtual property for the MongoDB _id field
ChatSchema.virtual('id').get(function() {
  return this._id.toHexString();
}); 