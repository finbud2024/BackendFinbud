import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Comment, CommentSchema } from './comment.entity';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Forum', required: true })
  forumId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({
    type: {
      likes: { type: Number, default: 0 },
      likedUsers: { type: [Types.ObjectId], default: [] },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    default: () => ({}),
  })
  reactions: {
    likes: number;
    likedUsers: Types.ObjectId[];
    comments: number;
    shares: number;
  };

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

}

export const PostSchema = SchemaFactory.createForClass(Post);

// PostSchema.path('comments').schema.add({
//   _id: { type: MongooseSchema.Types.ObjectId, auto: true },
// });
