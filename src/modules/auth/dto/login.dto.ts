import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
} 