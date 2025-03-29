import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Entities
import { Forum, ForumSchema } from './entities/forum.entity';
import { Post, PostSchema } from './entities/post.entity';

// Services
import { ForumService } from './services/forum.service';
import { PostService } from './services/post.service';

// Controllers
import { ForumController } from './controller/forum.controller';
import { PostController } from './controller/post.controller';

// Repositories
import { ForumRepository } from './repositories/forum.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Forum.name, schema: ForumSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [ForumController, PostController],
  providers: [ForumService, PostService, ForumRepository],
})
export class ForumModule {}
