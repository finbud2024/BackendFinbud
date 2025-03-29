import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class LikePostDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsIn(['like', 'unlike'])
  action: 'like' | 'unlike';
}

export class LikeCommentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  commentId: string;

  @IsIn(['like', 'unlike'])
  action: 'like' | 'unlike';
}
