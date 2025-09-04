import { ICreateAccountDto } from '@eicrud/shared/interfaces';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsOptional()
  @IsBoolean()
  logMeIn?: boolean;

  @IsEmail()
  email: string;

  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  role: string;

  //
}

export class CreateAccountReturnDto {
  userId: string;
  accessToken?: string;
}
