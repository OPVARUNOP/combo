import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(UserRole, { each: true })
  @IsOptional()
  roles?: UserRole[];
}
