import { IsNotEmpty, IsString } from 'class-validator';
export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  password_confirmation: string;
}
