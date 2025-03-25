import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../entities/post.entity';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { LikePostDto } from '../dto/like.dto';
  import { LikeCommentDto } from '../dto/like.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postModel.find().populate('forumId authorId').exec();
  }
  
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

  async likePost(postId: string, dto: LikePostDto) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
  
    post.reactions = post.reactions || { likes: 0, likedUsers: [] };
  
    const userObjectId = new Types.ObjectId(dto.userId);
    const userIndex = post.reactions.likedUsers.findIndex(id => id.equals(userObjectId));
    if (dto.action === 'like' && userIndex === -1) {
      post.reactions.likes += 1;
      post.reactions.likedUsers.push(userObjectId);
    } else if (dto.action === 'unlike' && userIndex !== -1) {
      post.reactions.likes -= 1;
      post.reactions.likedUsers.splice(userIndex, 1);
    }
  
    await post.save();
    return { success: true, likes: post.reactions.likes };
  }
  
  async likeComment(postId: string, dto: LikeCommentDto) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
  
    const comment = post.comments.find(
        c => c._id && c._id.toString() === dto.commentId
      );
    if (!comment) throw new NotFoundException('Comment not found');
  
    comment.reactions = comment.reactions || { likes: 0, likedUsers: [] };
  
    const userObjectId = new Types.ObjectId(dto.userId);
    const userIndex = comment.reactions.likedUsers.findIndex(id => id.equals(userObjectId));
    if (dto.action === 'like' && userIndex === -1) {
      comment.reactions.likes += 1;
      comment.reactions.likedUsers.push(userObjectId);
    } else if (dto.action === 'unlike' && userIndex !== -1) {
      comment.reactions.likes -= 1;
      comment.reactions.likedUsers.splice(userIndex, 1);
    }
  
    await post.save();
    return { success: true, likes: comment.reactions.likes };
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
