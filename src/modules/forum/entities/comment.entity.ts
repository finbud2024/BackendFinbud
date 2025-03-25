import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false }) 
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  body: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({
    type: {
      likes: { type: Number, default: 0 },
      likedUsers: { type: [Types.ObjectId], default: [] }
    },
    default: {}
  })
  reactions: {
    likes: number;
    likedUsers: Types.ObjectId[];
  };
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
