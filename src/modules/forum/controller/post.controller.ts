import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    HttpStatus,
    HttpCode,
    UseGuards
  } from '@nestjs/common';
  import { PostService } from '../services/post.service';
  import { CreatePostDto } from '../dto/create-post.dto';
  import { CreateCommentDto } from '../dto/create-comment.dto';
  import { LikeDto } from '../dto/like.dto';
  import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
  
  @Controller('posts')
  @UseGuards(JwtAuthGuard)
  export class PostController {
    constructor(private readonly postService: PostService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPost(@Body() dto: CreatePostDto) {
      return this.postService.createPost(dto);
    }
  
    @Get(':id')
    async getPost(@Param('id') id: string) {
      return this.postService.getPostById(id);
    }
  
    @Post(':id/like')
    async likePost(@Param('id') id: string, @Body() dto: LikeDto) {
      return this.postService.likePost(id, dto);
    }
  
    @Post(':id/comment')
    async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
      dto.postId = id;
      return this.postService.addComment(dto);
    }
  }
  