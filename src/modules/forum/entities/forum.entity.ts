import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Forum extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: 'Globe' })
  logo?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Post', default: [] })
  posts: Types.ObjectId[];
}

export const ForumSchema = SchemaFactory.createForClass(Forum);
