import { ISendVerificationEmailDto } from '@eicrud/shared/interfaces';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  @IsOptional()
  newEmail: string;

  @IsOptional()
  @IsString()
  password: string;
}
