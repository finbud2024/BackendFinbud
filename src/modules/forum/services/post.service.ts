import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../entities/post.entity';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { LikeDto } from '../dto/like.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>
  ) {}

  async createPost(dto: CreatePostDto): Promise<Post> {
    const newPost = new this.postModel({
      forumId: new Types.ObjectId(dto.forumId),
      authorId: new Types.ObjectId(dto.userId),
      title: dto.title,
      body: dto.body,
      comments: [],
      reactions: { likes: 0, comments: 0, shares: 0 }
    });

    return await newPost.save();
  }

  async getPostById(postId: string): Promise<Post> {
    const post = await this.postModel.findById(postId)
      .populate('forumId')
      .populate('authorId')
      .populate('comments.authorId');

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async likePost(postId: string, dto: LikeDto): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const userId = new Types.ObjectId(dto.userId);
    const likedUsers = post.reactions.likedUsers || [];

    const alreadyLiked = likedUsers.some(id => id.equals(userId));

    if (dto.action === 'like' && !alreadyLiked) {
      post.reactions.likes += 1;
      likedUsers.push(userId);
    } else if (dto.action === 'unlike' && alreadyLiked) {
      post.reactions.likes -= 1;
      post.reactions.likedUsers = likedUsers.filter(id => !id.equals(userId));
    }

    return await post.save();
  }

  async addComment(dto: CreateCommentDto) {
    const post = await this.postModel.findById(dto.postId);
    if (!post) throw new NotFoundException('Post not found');

    const comment = {
      _id: new Types.ObjectId(),
      authorId: new Types.ObjectId(dto.userId),
      body: dto.body,
      createdAt: new Date(),
      reactions: { likes: 0, likedUsers: [] }
    };

    post.comments.push(comment);
    post.reactions.comments += 1;

    await post.save();

    return comment;
  }
}
