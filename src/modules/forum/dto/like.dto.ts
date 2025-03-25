import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class LikeDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsIn(['like', 'unlike'])
  action: 'like' | 'unlike';
}
