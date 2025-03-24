import { PartialType } from '@nestjs/mapped-types';
import { CreateUserHoldingDto } from './create-user-holding.dto';

export class UpdateUserHoldingDto extends PartialType(CreateUserHoldingDto) {} 