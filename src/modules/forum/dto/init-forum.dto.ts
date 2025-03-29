import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateForumDto } from './create-forum.dto';

export class InitForumDto {
  @ValidateNested({ each: true })
  @Type(() => CreateForumDto)
  forums: CreateForumDto[];
}
